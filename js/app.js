// js/app.js - FORJA High Performance Engine
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
  userProfile: null,
  teacher: null,
  selectedRole: 'aluno', // 'aluno' ou 'professor'
  authMode: 'login',
  templates: [],
  workouts: [],
  evaluations: [],
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
const DEFAULT_FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a3e635' stroke-width='1.5'%3E%3Cpath d='M6.5 6.5h11M6.5 17.5h11M4 9.5h16M4 14.5h16M2 12h20'/%3E%3C/svg%3E";

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

/* -------------------------------------------------------------
   SISTEMA DE ABAS (TROCA DE TELAS)
-------------------------------------------------------------- */
function switchTab(targetScreenId) {
  const screens = ['home', 'templates', 'workout', 'progress', 'profile'];
  
  screens.forEach(screenName => {
    const el = document.getElementById(`screen-${screenName}`);
    if (el) {
      if (screenName === targetScreenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  screens.forEach(screenName => {
    const tabBtn = document.getElementById(`tab-${screenName}`);
    if (tabBtn) {
      if (screenName === targetScreenId) {
        tabBtn.className = "flex flex-col items-center gap-1 text-brand-lime font-bold";
      } else {
        tabBtn.className = "flex flex-col items-center gap-1 text-slate-400 hover:text-white";
      }
    }
  });

  if (targetScreenId === 'progress' && typeof updateProgressChart === 'function') {
    setTimeout(updateProgressChart, 50);
  }
}

/* -------------------------------------------------------------
   AUTENTICAÇÃO E PERFIL (ALUNO / PROFESSOR)
-------------------------------------------------------------- */
function selectAuthRole(role) {
  state.selectedRole = role;
  const btnAluno = document.getElementById("btnRoleAluno");
  const btnProf = document.getElementById("btnRoleProf");

  if (role === 'aluno') {
    btnAluno.className = "py-2 px-3 rounded-lg border border-brand-lime bg-brand-lime/10 text-brand-lime font-bold transition-all";
    btnProf.className = "py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 font-bold transition-all";
  } else {
    btnProf.className = "py-2 px-3 rounded-lg border border-brand-lime bg-brand-lime/10 text-brand-lime font-bold transition-all";
    btnAluno.className = "py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 font-bold transition-all";
  }
}

function switchAuthMode(mode) {
  state.authMode = mode;
  const btnLogin = document.getElementById("btnTabLogin");
  const btnRegister = document.getElementById("btnTabRegister");
  const submitText = document.getElementById("authSubmitText");
  const roleContainer = document.getElementById("roleSelectionContainer");

  if (mode === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "ACESSAR MINHA CONTA";
    if (roleContainer) roleContainer.classList.add("hidden");
  } else {
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "CRIAR CONTA NA FORJA";
    if (roleContainer) roleContainer.classList.remove("hidden");
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
      const { data, error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: state.selectedRole,
            full_name: email.split('@')[0]
          }
        }
      });
      if (error) throw error;
      state.user = data.user;
      alert(`Conta de ${state.selectedRole.toUpperCase()} criada com sucesso!`);
      await onAuthSuccess();
    }
  } catch (err) {
    alert("Erro de autenticação: " + (err.message || "Verifique seus dados."));
  } finally {
    spinner.classList.add("hidden");
    submitBtn.disabled = false;
  }
}

async function fetchUserProfile() {
  if (!supabaseClient || !state.user) return;
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', state.user.id)
    .single();

  if (!error && data) {
    state.userProfile = data;
    applyRoleUI(data.role);
  }
}

function applyRoleUI(role) {
  const roleBadge = document.getElementById("userRoleBadge");
  if (roleBadge) {
    roleBadge.textContent = role === 'professor' ? '📋 PROFESSOR' : '🏋️ ALUNO';
    roleBadge.className = role === 'professor' 
      ? 'text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40'
      : 'text-[10px] font-mono font-bold text-brand-lime bg-brand-lime/10 px-2 py-0.5 rounded border border-brand-lime/30';
  }
}

async function onAuthSuccess() {
  document.getElementById("authGate").classList.add("hidden");
  document.getElementById("topUserEmail").textContent = state.user.email.split('@')[0];
  document.getElementById("profileUserEmail").textContent = state.user.email;
  
  await fetchUserProfile();
  await fetchUserData();
  await fetchEvaluations();
  if (typeof checkTeacherConnection === 'function') await checkTeacherConnection();
  if (typeof renderAll === 'function') renderAll();
  switchTab('home');
}

async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  state.user = null;
  state.workouts = [];
  state.templates = [];
  state.evaluations = [];
  document.getElementById("authGate").classList.remove("hidden");
}

async function fetchUserData() {
  if (!supabaseClient || !state.user) return;

  const { data: tpls } = await supabaseClient
    .from('templates')
    .select('*')
    .eq('user_id', state.user.id);

  if (tpls) {
    state.templates = tpls.map(t => ({
      ...t,
      title: t.title || t.name || 'Sem título'
    }));
  }

  const { data: wks } = await supabaseClient
    .from('workouts')
    .select('*')
    .eq('user_id', state.user.id);

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
   CÁLCULOS BIOMECÂNICOS (1RM, PR & CARDIO)
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
        <button type="button" onclick="showExerciseDetail('${ex.id}')" title="Ver postura" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs">
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
        alert("Erro ao salvar no banco: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        tplPayload.id = data[0].id;
      }
    }
    state.templates.unshift(tplPayload);
    alert("Ficha criada e salva com sucesso!");
  }

  closeCreateTemplateModal();
  if (typeof renderTemplates === 'function') renderTemplates();
  if (typeof renderProfileStats === 'function') renderProfileStats();
}

async function deleteTemplate(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  const tplName = tpl ? (tpl.title || tpl.name) : "esta ficha";

  if (!confirm(`Deseja apagar a ficha "${tplName}"?`)) return;

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      alert("Erro ao excluir do banco: " + error.message);
      return;
    }
  }

  state.templates = state.templates.filter(t => t.id !== templateId);
  if (typeof renderTemplates === 'function') renderTemplates();
  if (typeof renderProfileStats === 'function') renderProfileStats();
}

/* -------------------------------------------------------------
   CRONÔMETRO DE DESCANSO AUTOMÁTICO
-------------------------------------------------------------- */
function startAutoRest(seconds = 60) {
  const widget = document.getElementById("restTimerWidget");
  const secondsDisplay = document.getElementById("restTimerSeconds");
  const circle = document.getElementById("timerProgressCircle");

  clearInterval(state.restTimer.intervalId);
  state.restTimer.total = seconds;
  state.restTimer.remaining = seconds;

  if (widget) widget.classList.remove("hidden");

  const updateUI = () => {
    if (secondsDisplay) secondsDisplay.textContent = state.restTimer.remaining + "s";
    if (circle) {
      const offset = 88 - (88 * state.restTimer.remaining) / state.restTimer.total;
      circle.style.strokeDashoffset = offset;
    }

    if (state.restTimer.remaining <= 0) {
      clearInterval(state.restTimer.intervalId);
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (widget) setTimeout(() => widget.classList.add("hidden"), 3000);
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
  const widget = document.getElementById("restTimerWidget");
  if (widget) widget.classList.add("hidden");
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
   EXECUÇÃO DO TREINO ATIVO
-------------------------------------------------------------- */
function loadTemplateIntoWorkout(templateId) {
  const tpl = state.templates.find(t => t.id === templateId);
  if (!tpl) return;

  state.activeWorkout.name = tpl.title;
  const nameInput = document.getElementById("activeWorkoutName");
  if (nameInput) nameInput.value = tpl.title;

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

function addSetToExercise(exIdx) {
  const ex = state.activeWorkout.exercises[exIdx];
  if (!ex) return;

  const isCardio = isCardioExercise(ex.name) || ex.type === 'cardio';
  
  if (isCardio) {
    ex.sets.push({ timeMin: 10, distanceKm: 1.0, completed: false });
  } else {
    const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : null;
    const defaultWeight = lastSet ? lastSet.weight : (getLastUsedWeight(ex.name) || 20);
    const defaultReps = lastSet ? lastSet.reps : 10;

    ex.sets.push({ weight: defaultWeight, reps: defaultReps, completed: false });
  }

  renderActiveWorkout();
}

function renderActiveWorkout() {
  const list = document.getElementById("activeExercisesList");
  if (!list) return;
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

      <div class="pt-1">
        <button type="button" onclick="addSetToExercise(${exIdx})" class="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-brand-lime font-mono font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1">
          + Adicionar Série
        </button>
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
    alert("Exercício adicionado manualmente.");
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
  alert("Treino salvo com sucesso!");
  switchTab('progress');
  if (typeof renderAll === 'function') renderAll();
}

function quickStartTemplate() {
  switchTab('workout');
  if (state.templates.length > 0) {
    loadTemplateIntoWorkout(state.templates[0].id);
  }
}

/* -------------------------------------------------------------
   AVALIAÇÃO FÍSICA E MEDIDAS CORPORAIS
-------------------------------------------------------------- */
async function fetchEvaluations() {
  if (!supabaseClient || !state.user) return;

  const { data: evals, error: evalErr } = await supabaseClient
    .from('avaliacoes_fisicas')
    .select(`*, medidas_corporais (*)`)
    .eq('user_id', state.user.id)
    .order('data_avaliacao', { ascending: false });

  if (!evalErr && evals) {
    state.evaluations = evals;
    if (typeof renderEvaluationsHistory === 'function') renderEvaluationsHistory();
  }
}

async function savePhysicalEvaluation() {
  if (!state.user) return;

  const peso = parseFloat(document.getElementById("evalPeso").value) || null;
  const altura = parseFloat(document.getElementById("evalAltura").value) || null;
  const gordura = parseFloat(document.getElementById("evalGordura").value) || null;
  const massa = parseFloat(document.getElementById("evalMassa").value) || null;
  const metodo = document.getElementById("evalMetodo").value;
  const obs = document.getElementById("evalObs").value.trim();

  if (!peso) {
    alert("Informe pelo menos o peso para registrar a avaliação.");
    return;
  }

  const payloadEval = {
    user_id: state.user.id,
    data_avaliacao: new Date().toISOString().split('T')[0],
    peso_kg: peso,
    altura_cm: altura,
    gordura_percentual: gordura,
    massa_muscular_kg: massa,
    metodo_avaliacao: metodo,
    observacoes: obs
  };

  const { data: evalData, error: evalErr } = await supabaseClient
    .from('avaliacoes_fisicas')
    .insert([payloadEval])
    .select();

  if (evalErr || !evalData || evalData.length === 0) {
    alert("Erro ao salvar avaliação: " + (evalErr?.message || "Erro desconhecido"));
    return;
  }

  const newEvalId = evalData[0].id;

  const payloadMedidas = {
    avaliacao_id: newEvalId,
    user_id: state.user.id,
    cintura_cm: parseFloat(document.getElementById("evalCintura").value) || null,
    abdomen_cm: parseFloat(document.getElementById("evalAbdomen").value) || null,
    quadril_cm: parseFloat(document.getElementById("evalQuadril").value) || null,
    peitoral_cm: parseFloat(document.getElementById("evalPeitoral").value) || null,
    braco_direito_cm: parseFloat(document.getElementById("evalBracoDir").value) || null,
    braco_esquerdo_cm: parseFloat(document.getElementById("evalBracoEsq").value) || null,
    coxa_direita_cm: parseFloat(document.getElementById("evalCoxaDir").value) || null,
    coxa_esquerda_cm: parseFloat(document.getElementById("evalCoxaEsq").value) || null,
    panturrilha_direita_cm: parseFloat(document.getElementById("evalPantsDir").value) || null,
    panturrilha_esquerda_cm: parseFloat(document.getElementById("evalPantsEsq").value) || null
  };

  await supabaseClient.from('medidas_corporais').insert([payloadMedidas]);

  alert("Avaliação física salva com sucesso!");
  await fetchEvaluations();
}
