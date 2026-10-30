// js/app.js (ou js/apps.js)
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
  renderWeeklyHeatmap();
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
    .eq('user_id', state.user.id)
    .order('created_at', { ascending: false });

  if (!tplErr && tpls && tpls.length > 0) {
    state.templates = tpls.map(t => ({
      ...t,
      title: t.title || t.name || 'Sem título'
    }));
  } else {
    state.templates = [
      {
        id: 'mock-tpl-1',
        title: 'Treino A - Peito, Ombros e Tríceps',
        division: 'A',
        exercises_config: [
          { name: 'Supino Reto com Barra', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Desenvolvimento Militar com Barra', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Tríceps Corda na Polia Alta', sets: 3, reps: '12-15', rest: 60 }
        ]
      }
    ];
  }

  const { data: wks, error: wkErr } = await supabaseClient
    .from('workouts')
    .select('*')
    .eq('user_id', state.user.id)
    .order('date', { ascending: false });

  if (!wkErr && wks) {
    state.workouts = wks;
  }
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
    state.activeWorkout.exercises.push({
      name: ex.name,
      rest: 60,
      sets: [
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

// INSERÇÃO DE LINHA NA CRIAÇÃO COM SELETOR DE DESCANSO (45s, 60s, 90s, 120s, 180s)
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
    <button type="button" onclick="document.getElementById('${rowId}').remove()" class="p-1 text-slate-500 hover:text-red-400 text-sm font-bold">&times;</button>
  `;
  container.appendChild(div);
}

function addTplExerciseRow() {
  appendExerciseRowToTemplateForm("", 3, 60);
}

function openCreateTemplateModal() {
  document.getElementById("tplNameInput").value = "";
  document.getElementById("tplDivisionInput").value = "";
  document.getElementById("tplExerciseInputs").innerHTML = "";
  appendExerciseRowToTemplateForm("", 3, 60);
  document.getElementById("modalNewTemplate").classList.remove("hidden");
}

function closeCreateTemplateModal() {
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

  const newTpl = {
    user_id: state.user ? state.user.id : null,
    name: title,
    title: title,
    division,
    exercises_config: exercises
  };

  if (supabaseClient && state.user) {
    const { data, error } = await supabaseClient.from('templates').insert([newTpl]).select();
    if (error) {
      console.error("Erro ao salvar ficha no Supabase:", error);
      alert("Erro ao salvar no banco: " + error.message);
      return;
    }
    if (data && data.length > 0) {
      newTpl.id = data[0].id;
    }
  }

  state.templates.unshift(newTpl);
  closeCreateTemplateModal();
  renderTemplates();
  renderProfileStats();
  alert("Ficha forjada e salva permanentemente na sua conta!");
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
   EXECUÇÃO DO TREINO (COM EDIÇÃO DE DESCANSO DINÂMICA)
-------------------------------------------------------------- */
function loadTemplateIntoWorkout(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  if (!tpl) return;

  state.activeWorkout.name = tpl.title;
  document.getElementById("activeWorkoutName").value = tpl.title;
  state.activeWorkout.exercises = tpl.exercises_config.map(ex => ({
    name: ex.name,
    rest: ex.rest || 60,
    sets: Array.from({ length: ex.sets || 3 }, () => ({
      weight: getLastUsedWeight(ex.name) || 30,
      reps: 10,
      completed: false
    }))
  }));

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

// ATUALIZAÇÃO DO DESCANSO EM TEMPO REAL NO TREINO
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
    const div = document.createElement("div");
    div.className = "bg-[#111620] rounded-xl p-3.5 tactical-border space-y-3";
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-display font-bold text-white">${ex.name}</h4>
          <button type="button" onclick="inspectExerciseByName('${ex.name}')" title="Ver postura" class="text-xs bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 hover:text-white">👁️</button>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-mono text-slate-400">Descanso:</span>
          <select onchange="updateExerciseRest(${exIdx}, this.value)" class="bg-slate-900 border border-slate-800 text-[11px] font-mono text-brand-lime rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-lime">
            <option value="45" ${ex.rest == 45 ? 'selected' : ''}>45s</option>
            <option value="60" ${ex.rest == 60 ? 'selected' : ''}>60s</option>
            <option value="90" ${ex.rest == 90 ? 'selected' : ''}>90s</option>
            <option value="120" ${ex.rest == 120 ? 'selected' : ''}>120s</option>
            <option value="180" ${ex.rest == 180 ? 'selected' : ''}>180s</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5 font-mono text-xs">
        <div class="grid grid-cols-12 gap-1 text-[10px] text-slate-500 uppercase pb-1 text-center">
          <span class="col-span-2 text-left">Série</span>
          <span class="col-span-4">Carga (kg)</span>
          <span class="col-span-3">Reps</span>
          <span class="col-span-3">Pronto</span>
        </div>
        ${ex.sets.map((s, sIdx) => `
          <div class="grid grid-cols-12 gap-1 items-center ${s.completed ? 'opacity-40' : ''}">
            <span class="col-span-2 text-slate-400">#${sIdx + 1}</span>
            <div class="col-span-4 flex items-center gap-1">
              <input type="number" value="${s.weight}" onchange="updateSetVal(${exIdx}, ${sIdx}, 'weight', this.value)" class="w-full bg-slate-900 border border-slate-800 text-center rounded py-1 text-white focus:outline-none focus:border-brand-lime" />
            </div>
            <div class="col-span-3">
              <input type="number" value="${s.reps}" onchange="updateSetVal(${exIdx}, ${sIdx}, 'reps', this.value)" class="w-full bg-slate-900 border border-slate-800 text-center rounded py-1 text-white focus:outline-none focus:border-brand-lime" />
            </div>
            <div class="col-span-3 flex justify-center">
              <button type="button" onclick="toggleSetComplete(${exIdx}, ${sIdx})" class="w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${s.completed ? 'bg-brand-lime text-black' : 'bg-slate-900 border border-slate-800 text-slate-400'}">
                ✓
              </button>
            </div>
          </div>
        `).join('')}
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
    ex.sets.forEach(s => {
      totalVolume += (s.weight || 0) * (s.reps || 0);
    });
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

  state.workouts.unshift(newWorkout);
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
      <button type="button" onclick="switchTab('workout'); loadTemplateIntoWorkout('${t.id}')" class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-mono text-brand-lime rounded-lg hover:border-brand-lime">
        Treinar
      </button>
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
  document.getElementById("weekSessionsCount").textContent = `${state.workouts.length} sessões`;
}

function renderWeeklyHeatmap() {
  const container = document.getElementById("weeklyHeatmap");
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  container.innerHTML = "";
  days.forEach((d, idx) => {
    const div = document.createElement("div");
    div.className = "flex flex-col items-center gap-1";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs ${idx === 1 || idx === 3 ? 'bg-brand-lime text-black font-bold' : 'bg-slate-900 text-slate-500 border border-slate-800'}">
        ${d}
      </div>
    `;
    container.appendChild(div);
  });
}

function renderWorkoutsHistory() {
  const list = document.getElementById("workoutsHistoryList");
  list.innerHTML = "";

  if (state.workouts.length === 0) {
    list.innerHTML = `<div class="p-4 text-center text-xs font-mono text-slate-500">Nenhum treino registrado ainda.</div>`;
    return;
  }

  state.workouts.forEach(w => {
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
  select.innerHTML = "";
  const set = new Set();

  state.workouts.forEach(w => {
    if (w.exercises) {
      w.exercises.forEach(e => set.add(e.name));
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

function updateProgressChart() {
  const select = document.getElementById("progressExerciseSelect");
  const exerciseName = select.value || "Supino Reto com Barra";
  const ctx = document.getElementById("progressChart").getContext("2d");

  const labels = [];
  const dataWeights = [];

  state.workouts.slice().reverse().forEach(w => {
    if (!w.exercises) return;
    const found = w.exercises.find(e => e.name === exerciseName);
    if (found && found.sets) {
      const maxWeight = Math.max(...found.sets.map(s => s.weight || 0));
      labels.push(w.date || 'Sessão');
      dataWeights.push(maxWeight);
    }
  });

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['Treino 1', 'Treino 2', 'Treino 3'],
      datasets: [{
        label: 'Carga Máxima (kg)',
        data: dataWeights.length ? dataWeights : [60, 65, 70],
        borderColor: '#a3e635',
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#a3e635'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { family: 'JetBrains Mono' } } },
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { family: 'JetBrains Mono' } } }
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
