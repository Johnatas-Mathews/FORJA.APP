// js/app.js
const SUPABASE_URL = "https://pzygeoqjdyvtfpxuytvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6eWdlb3FqZHl2dGZweHV5dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjczNzMsImV4cCI6MjEwODk0MzM3M30.lme2H9a6-QyI7Hf-7-tSIfr3DuvXMk03ZJoBnOemUYU";

let supabaseClient = null;
try {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error("Falha ao inicializar o Supabase:", e);
}

const state = {
  user: null,
  authMode: 'login',
  templates: [],
  workouts: [],
  editingTemplateId: null,
  metricMode: 'maxWeight', // 'maxWeight' ou 'estimated1RM'
  activeWorkout: {
    name: "Treino Personalizado",
    exercises: []
  },
  restTimer: {
    total: 60,
    remaining: 60,
    intervalId: null
  },
  libraryContext: 'workout',
  activeGroupFilter: 'Todos'
};

let progressChartInstance = null;

const DEFAULT_FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a3e635' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6.5 6.5h11M6.5 17.5h11M4 9.5h16M4 14.5h16M2 12h20'/%3E%3C/svg%3E";

document.addEventListener("DOMContentLoaded", async () => {
  populateExerciseSuggestions();
  await checkSession();
});

function populateExerciseSuggestions() {
  const datalist = document.getElementById("exerciseSuggestionsList");
  if (!datalist || typeof EXERCISE_DATABASE === 'undefined') return;
  datalist.innerHTML = "";
  EXERCISE_DATABASE.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.name;
    datalist.appendChild(opt);
  });
}

async function checkSession() {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    state.user = session.user;
    await onAuthSuccess();
  } else {
    document.getElementById("authGate").classList.remove("hidden");
  }
}

function switchAuthMode(mode) {
  state.authMode = mode;
  const btnLogin = document.getElementById("btnTabLogin");
  const btnRegister = document.getElementById("btnTabRegister");
  const submitText = document.getElementById("authSubmitText");

  if (mode === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "ACESSAR MINHA CONTA";
  } else {
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "CRIAR CONTA NA FORJA";
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const spinner = document.getElementById("authSpinner");
  const submitBtn = document.getElementById("authSubmitBtn");

  spinner.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    if (state.authMode === 'login') {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      state.user = data.user;
      await onAuthSuccess();
    } else {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      state.user = data.user;
      alert("Conta forjada com sucesso! Bem-vindo à FORJA.");
      await onAuthSuccess();
    }
  } catch (err) {
    alert("Erro de autenticação: " + (err.message || "Verifique os seus dados."));
  } finally {
    spinner.classList.add("hidden");
    submitBtn.disabled = false;
  }
}

async function onAuthSuccess() {
  document.getElementById("authGate").classList.add("hidden");
  document.getElementById("topUserEmail").textContent = state.user.email.split('@')[0];
  document.getElementById("profileUserEmail").textContent = state.user.email;
  await fetchUserData();
  renderAll();
}

async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  state.user = null;
  state.workouts = [];
  state.templates = [];
  document.getElementById("authGate").classList.remove("hidden");
}

async function fetchUserData() {
  if (!supabaseClient || !state.user) return;

  const { data: tpls, error: tplErr } = await supabaseClient
    .from('templates')
    .select('*')
    .eq('user_id', state.user.id);

  if (!tplErr && tpls) {
    state.templates = tpls.map(t => ({
      ...t,
      title: t.title || t.name || 'Sem título'
    }));
  }

  const { data: wks, error: wkErr } = await supabaseClient
    .from('workouts')
    .select('*')
    .eq('user_id', state.user.id);

  if (wkErr) {
    console.error("Erro ao buscar workouts:", wkErr);
  }

  if (wks && wks.length > 0) {
    state.workouts = wks.map(w => ({
      ...w,
      exercises: typeof w.exercises === 'string' ? JSON.parse(w.exercises) : (w.exercises || [])
    })).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  } else {
    state.workouts = [];
  }
}

/* -------------------------------------------------------------
   CÁLCULOS BIOMECÂNICOS (1RM & PR)
-------------------------------------------------------------- */
function calculate1RM(weight, reps) {
  if (!weight || weight <= 0) return 0;
  if (!reps || reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function getMaxHistoricalWeight(exerciseName) {
  let max = 0;
  state.workouts.forEach(w => {
    if (!w.exercises) return;
    const found = w.exercises.find(e => e.name && e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    if (found && found.sets) {
      found.sets.forEach(s => {
        const wVal = parseFloat(s.weight) || 0;
        if (wVal > max) max = wVal;
      });
    }
  });
  return max;
}

function isCardioExercise(exerciseName) {
  if (typeof EXERCISE_DATABASE === 'undefined') return false;
  const ex = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  return ex ? (ex.type === 'cardio' || ex.group === 'Cardio') : false;
}

/* -------------------------------------------------------------
   ARSENAL DE EXERCÍCIOS & MODAIS
-------------------------------------------------------------- */
function openExerciseLibraryModal(context = 'workout') {
  state.libraryContext = context;
  document.getElementById("modalExerciseLibrary").classList.remove("hidden");
  renderExerciseLibraryList();
}

function closeExerciseLibraryModal() {
  document.getElementById("modalExerciseLibrary").classList.add("hidden");
}

function filterByGroup(group) {
  state.activeGroupFilter = group;
  renderExerciseLibraryList();
}

function filterExerciseLibrary() {
  renderExerciseLibraryList();
}

function renderExerciseLibraryList() {
  const container = document.getElementById("libraryListContainer");
  const searchTerm = document.getElementById("librarySearchInput").value.toLowerCase();
  container.innerHTML = "";

  const filtered = EXERCISE_DATABASE.filter(ex => {
    const matchesGroup = (state.activeGroupFilter === 'Todos' || ex.group === state.activeGroupFilter);
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm) || 
                          ex.muscles.toLowerCase().includes(searchTerm) ||
                          ex.equipment.toLowerCase().includes(searchTerm);
    return matchesGroup && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-xs font-mono text-slate-500">Nenhum exercício encontrado.</div>`;
    return;
  }

  filtered.forEach(ex => {
    const div = document.createElement("div");
    div.className = "bg-slate-900/80 p-3 rounded-xl tactical-border flex items-center justify-between gap-3 hover:border-slate-700 transition-all";
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${ex.img}" alt="${ex.name}" class="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0" onerror="this.onerror=null; this.src='${DEFAULT_FALLBACK_IMG}';" />
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[9px] font-mono text-brand-lime uppercase font-bold">${ex.group}</span>
            <span class="text-[9px] text-slate-500 font-mono">• ${ex.equipment}</span>
          </div>
          <h4 class="text-xs font-bold text-white leading-tight mt-0.5">${ex.name}</h4>
          <p class="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5">${ex.muscles}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button type="button" onclick="showExerciseDetail('${ex.id}')" title="Ver biomecânica" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs">
          👁️
        </button>
        <button type="button" onclick="selectExerciseFromLibrary('${ex.id}')" class="px-2.5 py-1.5 bg-brand-lime text-black font-mono font-bold text-xs rounded-lg hover:brightness-110">
          + Usar
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function showExerciseDetail(exerciseId) {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return;

  document.getElementById("detailGroupBadge").textContent = ex.group;
  document.getElementById("detailExerciseName").textContent = ex.name;
  document.getElementById("detailEquipment").textContent = "Equipamento: " + ex.equipment;
  document.getElementById("detailMuscles").textContent = ex.muscles;
  document.getElementById("detailTips").textContent = ex.tips;

  const detailImg = document.getElementById("detailExerciseImg");
  detailImg.onerror = function() {
    this.onerror = null;
    this.src = DEFAULT_FALLBACK_IMG;
  };
  detailImg.src = ex.img;

  document.getElementById("modalExerciseDetail").classList.remove("hidden");
}

function closeExerciseDetailModal() {
  document.getElementById("modalExerciseDetail").classList.add("hidden");
}

function selectExerciseFromLibrary(exerciseId) {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return;

  if (state.libraryContext === 'workout') {
    const isCardio = ex.type === 'cardio' || ex.group === 'Cardio';
    
    state.activeWorkout.exercises.push({
      name: ex.name,
      type: isCardio ? 'cardio' : 'weight_reps',
      rest: isCardio ? 30 : 60,
      sets: isCardio 
        ? [{ timeMin: 20, distanceKm: 2.5, completed: false }]
        : [
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false },
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false },
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false }
          ]
    });
    renderActiveWorkout();
    closeExerciseLibraryModal();
  } else {
    appendExerciseRowToTemplateForm(ex.name, 3, 60);
    closeExerciseLibraryModal();
  }
}

/* -------------------------------------------------------------
   GERENCIAMENTO DE FICHAS (CRIAÇÃO, EDIÇÃO & EXCLUSÃO)
-------------------------------------------------------------- */
function appendExerciseRowToTemplateForm(name = "", sets = 3, rest = 60) {
  const container = document.getElementById("tplExerciseInputs");
  const rowId = "tpl-row-" + Date.now() + Math.floor(Math.random() * 1000);
  const div = document.createElement("div");
  div.id = rowId;
  div.className = "tpl-exercise-row flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl tactical-border";
  div.innerHTML = `
    <div class="flex-1">
      <input type="text" list="exerciseSuggestionsList" value="${name}" placeholder="Nome do exercício..." class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-lime" />
    </div>
    <div class="w-14">
      <input type="number" value="${sets}" min="1" max="10" title="Séries" placeholder="Sets" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-brand-lime" />
    </div>
    <div class="w-20">
      <select title="Descanso" class="tpl-rest-select w-full bg-slate-900 border border-slate-800 rounded-lg px-1 py-1.5 text-[11px] font-mono text-brand-lime focus:outline-none focus:border-brand-lime">
        <option value="45" ${rest == 45 ? 'selected' : ''}>45s</option>
        <option value="60" ${rest == 60 ? 'selected' : ''}>60s</option>
        <option value="90" ${rest == 90 ? 'selected' : ''}>90s</option>
        <option value="120" ${rest == 120 ? 'selected' : ''}>120s</option>
        <option value="180" ${rest == 180 ? 'selected' : ''}>180s</option>
      </select>
    </div>
    <button type="button" onclick="document.getElementById('${rowId}').remove()" title="Remover este exercício" class="p-1 text-slate-500 hover:text-red-400 text-sm font-bold">&times;</button>
  `;
  container.appendChild(div);
}

function addTplExerciseRow() {
  appendExerciseRowToTemplateForm("", 3, 60);
}

function openCreateTemplateModal() {
  state.editingTemplateId = null;
  const modalTitle = document.getElementById("tplModalTitle");
  if (modalTitle) modalTitle.textContent = "Criar Nova Ficha";

  document.getElementById("tplNameInput").value = "";
  document.getElementById("tplDivisionInput").value = "";
  document.getElementById("tplExerciseInputs").innerHTML = "";
  appendExerciseRowToTemplateForm("", 3, 60);
  document.getElementById("modalNewTemplate").classList.remove("hidden");
}

function openEditTemplateModal(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  if (!tpl) return;

  state.editingTemplateId = templateId;
  const modalTitle = document.getElementById("tplModalTitle");
  if (modalTitle) modalTitle.textContent = "Editar Ficha";

  document.getElementById("tplNameInput").value = tpl.title || tpl.name || "";
  document.getElementById("tplDivisionInput").value = tpl.division || "A";
  document.getElementById("tplExerciseInputs").innerHTML = "";

  const exercises = tpl.exercises_config || [];
  if (exercises.length === 0) {
    appendExerciseRowToTemplateForm("", 3, 60);
  } else {
    exercises.forEach(ex => {
      appendExerciseRowToTemplateForm(ex.name, ex.sets || 3, ex.rest || 60);
    });
  }

  document.getElementById("modalNewTemplate").classList.remove("hidden");
}

function closeCreateTemplateModal() {
  state.editingTemplateId = null;
  document.getElementById("modalNewTemplate").classList.add("hidden");
}

async function saveNewTemplate() {
  const title = document.getElementById("tplNameInput").value.trim();
  const division = document.getElementById("tplDivisionInput").value.trim() || 'A';
  if (!title) {
    alert("Dê um nome para a sua ficha!");
    return;
  }

  const exercises = [];
  const rows = document.querySelectorAll(".tpl-exercise-row");
  rows.forEach(r => {
    const inputs = r.querySelectorAll("input");
    const restSelect = r.querySelector(".tpl-rest-select");
    if (inputs[0] && inputs[0].value.trim()) {
      exercises.push({
        name: inputs[0].value.trim(),
        sets: parseInt(inputs[1].value) || 3,
        rest: parseInt(restSelect ? restSelect.value : 60) || 60
      });
    }
  });

  if (exercises.length === 0) {
    alert("Adicione ao menos 1 exercício na lista antes de salvar!");
    return;
  }

  const tplPayload = {
    user_id: state.user ? state.user.id : null,
    name: title,
    title: title,
    division,
    exercises_config: exercises
  };

  if (state.editingTemplateId) {
    if (supabaseClient && state.user) {
      const { error } = await supabaseClient
        .from('templates')
        .update(tplPayload)
        .eq('id', state.editingTemplateId);

      if (error) {
        console.error("Erro ao atualizar ficha no Supabase:", error);
        alert("Erro ao atualizar no banco: " + error.message);
        return;
      }
    }

    const index = state.templates.findIndex(t => t.id === state.editingTemplateId);
    if (index !== -1) {
      state.templates[index] = { ...state.templates[index], ...tplPayload };
    }
    alert("Ficha atualizada com sucesso!");
  } else {
    if (supabaseClient && state.user) {
      const { data, error } = await supabaseClient.from('templates').insert([tplPayload]).select();
      if (error) {
        console.error("Erro ao salvar ficha no Supabase:", error);
        alert("Erro ao salvar no banco: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        tplPayload.id = data[0].id;
      }
    }
    state.templates.unshift(tplPayload);
    alert("Ficha forjada e salva permanentemente na sua conta!");
  }

  closeCreateTemplateModal();
  renderTemplates();
  renderProfileStats();
}

async function deleteTemplate(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  const tplName = tpl ? (tpl.title || tpl.name) : "esta ficha";

  if (!confirm(`Deseja realmente apagar a ficha "${tplName}"? Essa ação não pode ser desfeita.`)) {
    return;
  }

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error("Erro ao excluir ficha no Supabase:", error);
      alert("Erro ao excluir do banco: " + error.message);
      return;
    }
  }

  state.templates = state.templates.filter(t => t.id !== templateId);
  renderTemplates();
  renderProfileStats();
  alert("Ficha removida com sucesso!");
}

/* -------------------------------------------------------------
   CRONÔMETRO DE DESCANSO AUTOMÁTICO (AUTO-REST)
-------------------------------------------------------------- */
function startAutoRest(seconds = 60) {
  const widget = document.getElementById("restTimerWidget");
  const secondsDisplay = document.getElementById("restTimerSeconds");
  const circle = document.getElementById("timerProgressCircle");

  clearInterval(state.restTimer.intervalId);
  state.restTimer.total = seconds;
  state.restTimer.remaining = seconds;

  widget.classList.remove("hidden");

  const updateUI = () => {
    secondsDisplay.textContent = state.restTimer.remaining;
    const offset = 113 - (113 * state.restTimer.remaining) / state.restTimer.total;
    circle.style.strokeDashoffset = offset;

    if (state.restTimer.remaining <= 0) {
      clearInterval(state.restTimer.intervalId);
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => widget.classList.add("hidden"), 3000);
    }
    state.restTimer.remaining--;
  };

  updateUI();
  state.restTimer.intervalId = setInterval(updateUI, 1000);
}

function addRestTime(seconds) {
  state.restTimer.remaining += seconds;
  state.restTimer.total += seconds;
}

function cancelRestTimer() {
  clearInterval(state.restTimer.intervalId);
  document.getElementById("restTimerWidget").classList.add("hidden");
}

function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.2;
    osc.start();
    setTimeout(() => { osc.stop(); audioCtx.close(); }, 350);
  } catch (e) {}
}

/* -------------------------------------------------------------
   EXECUÇÃO DO TREINO
-------------------------------------------------------------- */
function loadTemplateIntoWorkout(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  if (!tpl) return;

  state.activeWorkout.name = tpl.title;
  document.getElementById("activeWorkoutName").value = tpl.title;
  state.activeWorkout.exercises = tpl.exercises_config.map(ex => {
    const isCardio = isCardioExercise(ex.name);
    return {
      name: ex.name,
      type: isCardio ? 'cardio' : 'weight_reps',
      rest: ex.rest || (isCardio ? 30 : 60),
      sets: isCardio 
        ? [{ timeMin: 20, distanceKm: 2.5, completed: false }]
        : Array.from({ length: ex.sets || 3 }, () => ({
            weight: getLastUsedWeight(ex.name) || 30,
            reps: 10,
            completed: false
          }))
    };
  });

  renderActiveWorkout();
}

function getLastUsedWeight(exerciseName) {
  for (const wk of state.workouts) {
    if (!wk.exercises) continue;
    const found = wk.exercises.find(e => e.name === exerciseName);
    if (found && found.sets && found.sets.length > 0) {
      return found.sets[0].weight;
    }
  }
  return null;
}

function updateExerciseRest(exIdx, newRestVal) {
  state.activeWorkout.exercises[exIdx].rest = parseInt(newRestVal) || 60;
}

function renderActiveWorkout() {
  const list = document.getElementById("activeExercisesList");
  list.innerHTML = "";

  if (state.activeWorkout.exercises.length === 0) {
    list.innerHTML = `<div class="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">Selecione uma ficha acima ou abra o Arsenal para adicionar exercícios.</div>`;
    return;
  }

  state.activeWorkout.exercises.forEach((ex, exIdx) => {
    const isCardio = isCardioExercise(ex.name) || ex.type === 'cardio';
    const maxPrevWeight = getMaxHistoricalWeight(ex.name);

    const div = document.createElement("div");
    div.className = "bg-[#111620] rounded-xl p-3.5 tactical-border space-y-3 relative overflow-hidden";
    
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-display font-bold text-white">${ex.name}</h4>
          <button type="button" onclick="inspectExerciseByName('${ex.name}')" title="Ver postura" class="text-xs bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 hover:text-white">👁️</button>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-mono text-slate-400">Descanso:</span>
          <select onchange="updateExerciseRest(${exIdx}, this.value)" class="bg-slate-900 border border-slate-800 text-[11px] font-mono text-brand-lime rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-lime">
            <option value="30" ${ex.rest == 30 ? 'selected' : ''}>30s</option>
            <option value="45" ${ex.rest == 45 ? 'selected' : ''}>45s</option>
            <option value="60" ${ex.rest == 60 ? 'selected' : ''}>60s</option>
            <option value="90" ${ex.rest == 90 ? 'selected' : ''}>90s</option>
            <option value="120" ${ex.rest == 120 ? 'selected' : ''}>120s</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5 font-mono text-xs">
        <div class="grid grid-cols-12 gap-1 text-[10px] text-slate-500 uppercase pb-1 text-center">
          <span class="col-span-2 text-left">Série</span>
          <span class="col-span-4">${isCardio ? 'Tempo (min)' : 'Carga (kg)'}</span>
          <span class="col-span-3">${isCardio ? 'Km / Nível' : 'Reps'}</span>
          <span class="col-span-3">Status</span>
        </div>

        ${ex.sets.map((s, sIdx) => {
          const isPR = !isCardio && s.completed && maxPrevWeight > 0 && (parseFloat(s.weight) > maxPrevWeight);
          
          return `
            <div class="grid grid-cols-12 gap-1 items-center ${s.completed ? 'opacity-90' : ''}">
              <span class="col-span-2 text-slate-400 font-bold flex items-center gap-1">
                #${sIdx + 1}
                ${isPR ? '<span class="text-[9px] bg-brand-lime text-black font-black px-1 rounded animate-pulse" title="Recorde Pessoal!">PR</span>' : ''}
              </span>

              <div class="col-span-4 flex items-center gap-1">
                <input type="number" value="${isCardio ? (s.timeMin || 0) : (s.weight || 0)}" 
                  onchange="updateSetVal(${exIdx}, ${sIdx}, '${isCardio ? 'timeMin' : 'weight'}', this.value)" 
                  class="w-full bg-slate-900 border border-slate-800 text-center rounded py-1 text-white focus:outline-none focus:border-brand-lime" />
              </div>

              <div class="col-span-3">
                <input type="number" step="${isCardio ? '0.1' : '1'}" value="${isCardio ? (s.distanceKm || 0) : (s.reps || 0)}" 
                  onchange="updateSetVal(${exIdx}, ${sIdx}, '${isCardio ? 'distanceKm' : 'reps'}', this.value)" 
                  class="w-full bg-slate-900 border border-slate-800 text-center rounded py-1 text-white focus:outline-none focus:border-brand-lime" />
              </div>

              <div class="col-span-3 flex justify-center">
                <button type="button" onclick="toggleSetComplete(${exIdx}, ${sIdx})" 
                  class="w-8 h-7 rounded flex items-center justify-center font-bold text-xs transition-all ${s.completed ? 'bg-brand-lime text-black shadow-lg glow-lime' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
                  ${s.completed ? '✓' : '•'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    list.appendChild(div);
  });
}

function inspectExerciseByName(name) {
  const found = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (found) {
    showExerciseDetail(found.id);
  } else {
    alert("Exercício adicionado manualmente sem dados cadastrados no arsenal.");
  }
}

function updateSetVal(exIdx, sIdx, field, val) {
  state.activeWorkout.exercises[exIdx].sets[sIdx][field] = parseFloat(val) || 0;
}

function toggleSetComplete(exIdx, sIdx) {
  const set = state.activeWorkout.exercises[exIdx].sets[sIdx];
  set.completed = !set.completed;
  if (set.completed) {
    startAutoRest(state.activeWorkout.exercises[exIdx].rest || 60);
  }
  renderActiveWorkout();
}

async function finishAndSaveWorkout() {
  if (state.activeWorkout.exercises.length === 0) {
    alert("Adicione pelo menos um exercício antes de finalizar.");
    return;
  }

  let totalVolume = 0;
  state.activeWorkout.exercises.forEach(ex => {
    if (ex.sets) {
      ex.sets.forEach(s => {
        totalVolume += (s.weight || 0) * (s.reps || 0);
      });
    }
  });

  const newWorkout = {
    user_id: state.user ? state.user.id : null,
    name: state.activeWorkout.name,
    date: new Date().toISOString().split('T')[0],
    total_volume_kg: totalVolume,
    exercises: state.activeWorkout.exercises
  };

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient.from('workouts').insert([newWorkout]);
    if (error) console.error("Erro ao salvar treino no Supabase:", error);
  }

  state.workouts.push(newWorkout);
  alert("Treino forjado e salvo com sucesso!");
  switchTab('progress');
  renderAll();
}

function quickStartTemplate() {
  switchTab('workout');
  if (state.templates.length > 0) {
    loadTemplateIntoWorkout(state.templates[0].id);
  }
}

/* -------------------------------------------------------------
   INTERFACE & NAVEGAÇÃO
-------------------------------------------------------------- */
function switchTab(tab) {
  const screens = ['home', 'templates', 'workout', 'progress', 'profile'];
  screens.forEach(s => {
    document.getElementById(`screen-${s}`).classList.add('hidden');
    const navBtn = document.getElementById(`tab-${s}`);
    if (navBtn) {
      navBtn.classList.remove('text-brand-lime');
      navBtn.classList.add('text-slate-400');
    }
  });

  document.getElementById(`screen-${tab}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`tab-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('text-brand-lime');
    activeBtn.classList.remove('text-slate-400');
  }

  if (tab === 'progress') updateProgressChart();
}

function renderAll() {
  renderTemplates();
  renderHomeMetrics();
  renderWeeklyHeatmap();
  renderWorkoutsHistory();
  renderProgressExercisesDropdown();
  renderProfileStats();
}

function renderTemplates() {
  const list = document.getElementById("templatesList");
  const select = document.getElementById("workoutTemplateSelect");
  list.innerHTML = "";
  select.innerHTML = '<option value="">Carregar de uma Ficha...</option>';

  state.templates.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.division || '•'} - ${t.title}`;
    select.appendChild(opt);

    const div = document.createElement("div");
    div.className = "bg-[#111620] p-4 rounded-xl tactical-border flex justify-between items-center";
    div.innerHTML = `
      <div>
        <span class="text-[10px] font-mono text-brand-lime font-bold">DIVISÃO ${t.division || 'A'}</span>
        <h4 class="text-sm font-display font-bold text-white mt-0.5">${t.title}</h4>
        <span class="text-xs text-slate-400">${t.exercises_config ? t.exercises_config.length : 0} exercícios</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" onclick="openEditTemplateModal('${t.id}')" title="Editar Ficha" class="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-brand-lime hover:border-brand-lime/40 rounded-lg text-xs transition-all">
          ✏️
        </button>
        <button type="button" onclick="deleteTemplate('${t.id}')" title="Apagar Ficha" class="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 rounded-lg text-xs transition-all">
          🗑️
        </button>
        <button type="button" onclick="switchTab('workout'); loadTemplateIntoWorkout('${t.id}')" class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-mono text-brand-lime rounded-lg hover:border-brand-lime transition-all">
          Treinar
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderHomeMetrics() {
  document.getElementById("profileWorkoutsCount").textContent = state.workouts.length;
  document.getElementById("profileTemplatesCount").textContent = state.templates.length;

  let weeklyVol = 0;
  state.workouts.forEach(w => weeklyVol += (w.total_volume_kg || 0));
  document.getElementById("statWeeklyVolume").innerHTML = `${weeklyVol} <span class="text-xs text-slate-500">kg</span>`;
}

function renderWeeklyHeatmap() {
  const container = document.getElementById("weeklyHeatmap");
  if (!container) return;
  container.innerHTML = "";

  const daysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const today = new Date();
  
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());
  currentSunday.setHours(0, 0, 0, 0);

  const activeDaysIndexes = new Set();

  state.workouts.forEach(w => {
    if (!w.date) return;
    const wDate = new Date(w.date);
    if (typeof w.date === 'string' && w.date.length === 10) {
      const parts = w.date.split('-');
      wDate.setFullYear(parts[0], parts[1] - 1, parts[2]);
    }
    wDate.setHours(0, 0, 0, 0);

    const diffTime = wDate.getTime() - currentSunday.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays >= 0 && diffDays < 7) {
      activeDaysIndexes.add(diffDays);
    }
  });

  daysLabels.forEach((d, idx) => {
    const isCompleted = activeDaysIndexes.has(idx);
    const div = document.createElement("div");
    div.className = "flex flex-col items-center gap-1";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs ${isCompleted ? 'bg-brand-lime text-black font-extrabold shadow-sm glow-lime' : 'bg-slate-900 text-slate-500 border border-slate-800'}">
        ${d}
      </div>
    `;
    container.appendChild(div);
  });

  const weekCountEl = document.getElementById("weekSessionsCount");
  if (weekCountEl) {
    weekCountEl.textContent = `${activeDaysIndexes.size} sessões`;
  }
}

function renderWorkoutsHistory() {
  const list = document.getElementById("workoutsHistoryList");
  list.innerHTML = "";

  if (state.workouts.length === 0) {
    list.innerHTML = `<div class="p-4 text-center text-xs font-mono text-slate-500">Nenhum treino registrado ainda.</div>`;
    return;
  }

  state.workouts.slice().reverse().forEach(w => {
    const div = document.createElement("div");
    div.className = "bg-[#111620] p-3 rounded-xl tactical-border flex justify-between items-center font-mono text-xs";
    div.innerHTML = `
      <div>
        <p class="font-bold text-white">${w.name}</p>
        <span class="text-[10px] text-slate-500">${w.date || 'Hoje'}</span>
      </div>
      <span class="text-brand-lime font-bold">${w.total_volume_kg || 0} kg</span>
    `;
    list.appendChild(div);
  });
}

function renderProgressExercisesDropdown() {
  const select = document.getElementById("progressExerciseSelect");
  if (!select) return;
  select.innerHTML = "";
  const set = new Set();

  state.workouts.forEach(w => {
    if (w.exercises) {
      w.exercises.forEach(e => {
        if (!isCardioExercise(e.name)) set.add(e.name);
      });
    }
  });

  if (set.size === 0) {
    select.innerHTML = `<option>Supino Reto com Barra</option>`;
    return;
  }

  set.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function toggleMetricMode(mode) {
  state.metricMode = mode;
  const btnMax = document.getElementById("btnMetricMax");
  const btnRM = document.getElementById("btnMetricRM");
  
  if (mode === 'maxWeight') {
    btnMax.className = "px-2.5 py-1 rounded bg-brand-lime text-black font-bold text-[10px] font-mono";
    btnRM.className = "px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono";
  } else {
    btnRM.className = "px-2.5 py-1 rounded bg-brand-lime text-black font-bold text-[10px] font-mono";
    btnMax.className = "px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono";
  }
  
  updateProgressChart();
}

function updateProgressChart() {
  const select = document.getElementById("progressExerciseSelect");
  if (!select) return;
  const exerciseName = select.value;
  const ctx = document.getElementById("progressChart")?.getContext("2d");
  if (!ctx) return;

  const labels = [];
  const dataValues = [];

  state.workouts.forEach(w => {
    if (!w.exercises || !Array.isArray(w.exercises)) return;
    const found = w.exercises.find(e => e.name && e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    
    if (found && found.sets && found.sets.length > 0) {
      let metricValue = 0;
      
      if (state.metricMode === 'maxWeight') {
        metricValue = Math.max(...found.sets.map(s => parseFloat(s.weight) || 0));
      } else {
        const rmValues = found.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseFloat(s.reps) || 0));
        metricValue = Math.max(...rmValues);
      }

      let formattedDate = "Sessão";
      if (w.date) {
        const cleanDateStr = w.date.split('T')[0];
        const parts = cleanDateStr.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}`;
        }
      }

      labels.push(formattedDate);
      dataValues.push(metricValue);
    }
  });

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  const metricLabel = state.metricMode === 'maxWeight' ? 'Carga Máxima (kg)' : '1RM Estimado (kg)';

  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['Sem dados'],
      datasets: [{
        label: metricLabel,
        data: dataValues.length ? dataValues : [0],
        borderColor: '#a3e635',
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#a3e635',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          grid: { color: 'rgba(255,255,255,0.05)' }, 
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono' } },
          beginAtZero: true
        },
        x: { 
          grid: { color: 'rgba(255,255,255,0.05)' }, 
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono' } } 
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderProfileStats() {
  document.getElementById("profileWorkoutsCount").textContent = state.workouts.length;
  document.getElementById("profileTemplatesCount").textContent = state.templates.length;
}
