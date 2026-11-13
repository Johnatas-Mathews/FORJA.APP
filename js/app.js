// js/app.js - FORJA High Performance Engine (Versão Blindada & Corrigida)
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
  selectedRole: 'aluno',
  authMode: 'login',
  templates: [],
  workouts: [],
  evaluations: [],
  editingTemplateId: null,
  metricMode: 'maxWeight',
  
  // CAMPOS DE GAMIFICAÇÃO & STREAK
  xp: 0,
  level: 1,
  patente: 'Ferro Bruto',
  nextLevelXP: 500,

  // METAS E PREFERÊNCIAS SEMANAIS
  weeklyGoal: 5,
  preferredDays: [],

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
let animationInterval = null;
const DEFAULT_FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a3e635' stroke-width='1.5'%3E%3Cpath d='M6.5 6.5h11M6.5 17.5h11M4 9.5h16M4 14.5h16M2 12h20'/%3E%3C/svg%3E";

// Helper seguro para acessar o banco de exercícios global
function getExerciseDB() {
  if (typeof window !== 'undefined' && window.EXERCISE_DATABASE) return window.EXERCISE_DATABASE;
  if (typeof EXERCISE_DATABASE !== 'undefined') return EXERCISE_DATABASE;
  return [];
}

document.addEventListener("DOMContentLoaded", async () => {
  populateExerciseSuggestions();
  await checkSession();
});

function populateExerciseSuggestions() {
  const datalist = document.getElementById("exerciseSuggestionsList");
  const db = getExerciseDB();
  if (!datalist || db.length === 0) return;
  datalist.innerHTML = "";
  db.forEach(ex => {
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
   ATALHO RÁPIDO PARA INICIAR TREINO VIVO
-------------------------------------------------------------- */
function quickStartTemplate() {
  if (state.templates.length > 0) {
    loadTemplateIntoWorkout(state.templates[0].id);
  } else {
    switchTab('workout');
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
  const nameFieldContainer = document.getElementById("nameFieldContainer"); // Novo container do nome

  if (mode === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "ACESSAR MINHA CONTA";
    if (roleContainer) roleContainer.classList.add("hidden");
    if (nameFieldContainer) nameFieldContainer.classList.add("hidden"); // Oculta no login
  } else {
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "CRIAR CONTA NA FORJA";
    if (roleContainer) roleContainer.classList.remove("hidden");
    if (nameFieldContainer) nameFieldContainer.classList.remove("hidden"); // Mostra no cadastro
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const fullNameInput = document.getElementById("authFullName");
  const fullName = fullNameInput ? fullNameInput.value.trim() : email.split('@')[0];
  
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
            full_name: fullName // Salva nos metadados do Auth
          }
        }
      });
      if (error) throw error;
      state.user = data.user;

      // Cria ou atualiza o registro na tabela profiles com o nome
      if (supabaseClient && state.user) {
        await supabaseClient.from('profiles').upsert({
          id: state.user.id,
          email: email,
          role: state.selectedRole,
          full_name: fullName,
          weekly_goal: 5
        }, { onConflict: 'id' });
      }

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
    state.weeklyGoal = data.weekly_goal || parseInt(localStorage.getItem(`forja_goal_${state.user.id}`)) || 5;
    state.preferredDays = Array.isArray(data.preferred_days) 
      ? data.preferred_days 
      : JSON.parse(localStorage.getItem(`forja_pref_${state.user.id}`) || '[]');
    applyRoleUI(data.role);
  } else {
    state.weeklyGoal = parseInt(localStorage.getItem(`forja_goal_${state.user.id}`)) || 5;
    state.preferredDays = JSON.parse(localStorage.getItem(`forja_pref_${state.user.id}`) || '[]');
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
  
  renderAll();
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
    
    state.xp = state.workouts.length * 150;
  } else {
    state.workouts = [];
    state.xp = 0;
  }
  
  populateWorkoutTemplateSelect();
}

function populateWorkoutTemplateSelect() {
  const select = document.getElementById("workoutTemplateSelect");
  if (!select) return;
  
  select.innerHTML = `<option value="">Carregar de uma Ficha...</option>`;
  state.templates.forEach(tpl => {
    const opt = document.createElement("option");
    opt.value = tpl.id;
    opt.textContent = `${tpl.division ? '[' + tpl.division + '] ' : ''}${tpl.title || tpl.name}`;
    select.appendChild(opt);
  });
}

async function fetchEvaluations() {
  if (!supabaseClient || !state.user) return;
  try {
    const { data } = await supabaseClient
      .from('avaliacoes_fisicas')
      .select('*')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false });

    if (data) state.evaluations = data;
  } catch (e) {
    state.evaluations = [];
  }
}

/* -------------------------------------------------------------
   RENDERIZAÇÃO GERAL (FICHAS, HISTÓRICO, GRÁFICOS & PERFIL)
-------------------------------------------------------------- */
function renderAll() {
  renderTemplates();
  renderWorkoutsHistory();
  renderProfileStats();
  populateProgressExerciseSelect();
  populateWorkoutTemplateSelect();

  if (typeof renderGamificationCard === 'function') {
    renderGamificationCard();
  }

  if (typeof updateProgressChart === 'function') updateProgressChart();
}

function renderTemplates() {
  const container = document.getElementById("templatesList");
  if (!container) return;
  container.innerHTML = "";

  if (state.templates.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">Nenhuma ficha criada ainda. Clique em "+ Criar Ficha" acima.</div>`;
    return;
  }

  state.templates.forEach((tpl, index) => {
    const div = document.createElement("div");
    div.className = "bg-[#111620] rounded-2xl tactical-border overflow-hidden transition-all";
    
    const exercisesConfig = tpl.exercises_config || [];
    
    let totalSeries = 0;
    exercisesConfig.forEach(ex => {
      totalSeries += (parseInt(ex.sets) || 3);
    });

    const isOpen = index === 0 ? 'open' : '';

    div.innerHTML = `
      <details ${isOpen} class="group">
        <summary class="p-4 cursor-pointer flex justify-between items-center select-none hover:bg-slate-900/50 transition-all list-none">
          <div class="pr-2 space-y-0.5">
            <span class="text-[9px] font-mono text-brand-lime font-bold uppercase tracking-wider block">Divisão ${tpl.division || 'A'}</span>
            <h3 class="text-sm font-display font-bold text-white">${tpl.title || tpl.name}</h3>
            <div class="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
              <span>📋 ${exercisesConfig.length} ${exercisesConfig.length === 1 ? 'exercício' : 'exercícios'}</span>
              <span>🔄 ${totalSeries} séries</span>
            </div>
          </div>
          
          <div class="flex items-center gap-2" onclick="event.stopPropagation()">
            <button onclick="loadTemplateIntoWorkout('${tpl.id}')" class="px-3 py-1.5 bg-brand-lime text-black font-mono font-bold text-[10px] rounded-lg hover:brightness-110 flex items-center gap-1 shadow-sm">
              <span>⚡</span> Iniciar
            </button>
            <button onclick="openEditTemplateModal('${tpl.id}')" class="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-xs" title="Editar">
              ✏️
            </button>
            <button onclick="deleteTemplate('${tpl.id}')" class="p-2 bg-red-950/40 text-red-400 rounded-lg hover:bg-red-900/40 text-xs" title="Excluir">
              🗑️
            </button>
          </div>
        </summary>

        <div class="p-4 pt-0 border-t border-slate-800/80 space-y-2 mt-2">
          <div class="flex justify-between items-center pb-1">
            <span class="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Composição da Ficha</span>
          </div>

          ${exercisesConfig.length === 0 ? '<p class="text-xs font-mono text-slate-500 text-center py-2">Nenhum exercício configurado.</p>' : ''}
          
          ${exercisesConfig.map(ex => `
            <div class="flex justify-between items-center text-xs font-mono text-slate-300 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/60">
              <span class="truncate pr-2">• ${ex.name}</span>
              <span class="text-slate-400 flex-shrink-0 text-[11px]">${ex.sets || 3} séries (${ex.rest || 60}s)</span>
            </div>
          `).join('')}

          <div class="pt-2 text-center">
            <button type="button" onclick="this.closest('details').removeAttribute('open')" class="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline">
              ▲ Recolher exercícios
            </button>
          </div>
        </div>

        <div class="px-4 pb-3 pt-0 group-open:hidden text-center border-t border-slate-800/40">
          <span class="text-[10px] font-mono text-brand-lime/80 hover:text-brand-lime cursor-pointer inline-flex items-center gap-1 pt-2">
            Ver exercícios ▼
          </span>
        </div>
      </details>
    `;
    container.appendChild(div);
  });
}

function renderWorkoutsHistory() {
  const container = document.getElementById("workoutsHistoryList");
  if (!container) return;
  container.innerHTML = "";

  if (state.workouts.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-[11px] font-mono text-slate-500">Nenhum treino concluído ainda.</div>`;
    return;
  }

  [...state.workouts].reverse().slice(0, 5).forEach(wk => {
    const exercisesCount = wk.exercises ? wk.exercises.length : 0;
    const durationMin = wk.duration_min || 50;
    
    let formattedDate = wk.date || 'Recente';
    if (wk.date && wk.date.includes('-')) {
      const parts = wk.date.split('-');
      if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const div = document.createElement("div");
    div.className = "bg-slate-900/80 p-3 rounded-xl tactical-border flex justify-between items-center text-xs font-mono";
    div.innerHTML = `
      <div class="space-y-0.5">
        <p class="font-bold text-white uppercase">${wk.name}</p>
        <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>${formattedDate}</span>
          <span>·</span>
          <span>${durationMin} min</span>
        </div>
      </div>
      <div class="text-right space-y-0.5">
        <span class="text-brand-lime font-bold block">${(wk.total_volume_kg || 0).toLocaleString('pt-BR')} kg</span>
        <span class="text-[10px] text-slate-400 block">${exercisesCount} ${exercisesCount === 1 ? 'exercício' : 'exercícios'}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderProfileStats() {
  const countEl = document.getElementById("profileWorkoutsCount");
  const volumeEl = document.getElementById("statWeeklyVolume");
  const bigSessionsCount = document.getElementById("bigSessionsCount");
  const goalTotalDivider = document.getElementById("goalTotalDivider");
  const metaHeaderLabel = document.getElementById("metaHeaderLabel");
  const daysGrid = document.getElementById("weeklyDaysGrid");
  const progressBar = document.getElementById("weekProgressBar");
  const weeklyPercentageText = document.getElementById("weeklyPercentageText");
  const greetingTitle = document.getElementById("homeGreetingTitle");
  const motivationBanner = document.getElementById("homeMotivationBanner");
  const motivationText = document.getElementById("homeMotivationText");
  const volumeComparisonBadge = document.getElementById("volumeComparisonBadge");

  if (greetingTitle && state.user) {
    const userName = (state.user.user_metadata?.full_name || state.user.email.split('@')[0]).toUpperCase();
    greetingTitle.textContent = `BEM-VINDO DE VOLTA, ${userName}! 💪`;
  }

  if (countEl) countEl.textContent = state.workouts.length;

  const today = new Date();
  const currentDayOfWeek = today.getDay();
  
  const mondayCurrent = new Date(today);
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  mondayCurrent.setDate(today.getDate() + diffToMonday);
  mondayCurrent.setHours(0, 0, 0, 0);

  const mondayPrevious = new Date(mondayCurrent);
  mondayPrevious.setDate(mondayPrevious.getDate() - 7);

  let currentWeekVolume = 0;
  let previousWeekVolume = 0;
  let workoutsThisWeek = 0;

  const weekDays = [
    { label: 'SEG' }, { label: 'TER' }, { label: 'QUA' }, { label: 'QUI' }, { label: 'SEX' }, { label: 'SÁB' }, { label: 'DOM' }
  ];

  const formattedWeekDays = weekDays.map((d, idx) => {
    const targetDate = new Date(mondayCurrent);
    targetDate.setDate(mondayCurrent.getDate() + idx);
    return {
      label: d.label,
      dateStr: targetDate.toISOString().split('T')[0]
    };
  });

  if (daysGrid) {
    daysGrid.innerHTML = "";
    formattedWeekDays.forEach(dayObj => {
      const workoutsOnThisDay = state.workouts.filter(w => w.date === dayObj.dateStr);
      const trainedOnDay = workoutsOnThisDay.length > 0;
      workoutsThisWeek += workoutsOnThisDay.length;

      const dayBox = document.createElement("div");
      dayBox.className = "flex flex-col items-center gap-1.5";
      dayBox.innerHTML = `
        <div class="w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
          trainedOnDay 
            ? 'bg-brand-lime text-black shadow-md glow-lime font-bold' 
            : 'bg-slate-900/90 text-slate-400 border border-slate-800/60'
        }">
          <span class="text-xs font-bold">${trainedOnDay ? '✓' : '-'}</span>
        </div>
        <span class="text-[10px] font-mono ${trainedOnDay ? 'text-brand-lime font-bold' : 'text-slate-400'}">${dayObj.label}</span>
      `;
      daysGrid.appendChild(dayBox);
    });
  }

  state.workouts.forEach(w => {
    if (!w.date) return;
    const wDate = new Date(w.date + 'T00:00:00');
    const vol = w.total_volume_kg || 0;

    if (wDate >= mondayCurrent) {
      currentWeekVolume += vol;
    } else if (wDate >= mondayPrevious && wDate < mondayCurrent) {
      previousWeekVolume += vol;
    }
  });

  if (volumeEl) volumeEl.innerHTML = `${currentWeekVolume.toLocaleString('pt-BR')} <span class="text-xs text-slate-500">kg</span>`;

  if (volumeComparisonBadge) {
    if (previousWeekVolume > 0) {
      const percentDiff = Math.round(((currentWeekVolume - previousWeekVolume) / previousWeekVolume) * 100);
      if (percentDiff !== 0) {
        const sign = percentDiff > 0 ? '+' : '';
        volumeComparisonBadge.textContent = `${sign}${percentDiff}% vs semana anterior`;
        volumeComparisonBadge.classList.remove('hidden');
      } else {
        volumeComparisonBadge.classList.add('hidden');
      }
    } else {
      volumeComparisonBadge.classList.add('hidden');
    }
  }

  const weeklyTarget = state.weeklyGoal || 5;
  if (motivationBanner && motivationText) {
    if (workoutsThisWeek > 0) {
      motivationBanner.classList.remove('hidden');
      motivationText.textContent = `${workoutsThisWeek} ${workoutsThisWeek === 1 ? 'sessão' : 'sessões'} Forjadas nesta semana. Mentenha a consistência!`;
    } else {
      motivationBanner.classList.remove('hidden');
      motivationText.textContent = `Sua meta é ${weeklyTarget} treinos esta semana. Vamos iniciar o primeiro?`;
    }
  }

  const formattedCount = String(workoutsThisWeek).padStart(2, '0');
  const formattedTarget = String(weeklyTarget).padStart(2, '0');

  if (bigSessionsCount) bigSessionsCount.textContent = formattedCount;
  if (goalTotalDivider) goalTotalDivider.textContent = `/ ${formattedTarget}`;
  if (metaHeaderLabel) metaHeaderLabel.textContent = `Meta: ${weeklyTarget} dias/semana`;

  const percentage = Math.min(Math.round((workoutsThisWeek / weeklyTarget) * 100), 100);
  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (weeklyPercentageText) weeklyPercentageText.textContent = `${percentage}% da meta semanal concluída`;

  renderWorkoutsHistory();
}

function populateProgressExerciseSelect() {
  const select = document.getElementById("progressExerciseSelect");
  if (!select) return;
  
  const uniqueExercises = new Set();
  state.workouts.forEach(w => {
    if (w.exercises) w.exercises.forEach(e => { if (e.name) uniqueExercises.add(e.name); });
  });
  state.templates.forEach(t => {
    if (t.exercises_config) t.exercises_config.forEach(e => { if (e.name) uniqueExercises.add(e.name); });
  });

  select.innerHTML = "";
  if (uniqueExercises.size === 0) {
    select.innerHTML = `<option value="">Nenhum exercício registrado</option>`;
    return;
  }

  uniqueExercises.forEach(exName => {
    const opt = document.createElement("option");
    opt.value = exName;
    opt.textContent = exName;
    select.appendChild(opt);
  });

  if (typeof updateProgressChart === 'function') {
    updateProgressChart();
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
  const db = getExerciseDB();
  const ex = db.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  return ex ? (ex.type === 'cardio' || ex.group === 'Cardio') : false;
}

/* -------------------------------------------------------------
   ARSENAL DE EXERCÍCIOS & MODAIS COM SUPORTE A ANIMAÇÃO FLIP
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
  const searchInput = document.getElementById("librarySearchInput");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  if (!container) return;
  container.innerHTML = "";

  const db = getExerciseDB();
  const filtered = db.filter(ex => {
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
  const db = getExerciseDB();
  const ex = db.find(e => e.id === exerciseId);
  if (!ex) return;

  const groupBadge = document.getElementById("detailGroupBadge");
  const nameEl = document.getElementById("detailExerciseName");
  const equipEl = document.getElementById("detailEquipment");
  const musclesEl = document.getElementById("detailMuscles");
  const tipsEl = document.getElementById("detailTips");

  if (groupBadge) groupBadge.textContent = ex.group;
  if (nameEl) nameEl.textContent = ex.name;
  if (equipEl) equipEl.textContent = "Equipamento: " + ex.equipment;
  if (musclesEl) musclesEl.textContent = ex.muscles;
  if (tipsEl) tipsEl.textContent = ex.tips;

  const detailImg = document.getElementById("detailExerciseImg");
  if (detailImg) {
    if (animationInterval) clearInterval(animationInterval);

    if (ex.img && ex.img.includes('/0.jpg')) {
      const baseUrl = ex.img.replace('/0.jpg', '');
      let frame = 0;
      detailImg.src = `${baseUrl}/${frame}.jpg`;
      animationInterval = setInterval(() => {
        frame = frame === 0 ? 1 : 0;
        detailImg.src = `${baseUrl}/${frame}.jpg`;
      }, 800);
    } else {
      detailImg.onerror = function() {
        this.onerror = null;
        this.src = DEFAULT_FALLBACK_IMG;
      };
      detailImg.src = ex.img;
    }
  }

  const modalDetail = document.getElementById("modalExerciseDetail");
  if (modalDetail) modalDetail.classList.remove("hidden");
}

function closeExerciseDetailModal() {
  if (animationInterval) clearInterval(animationInterval);
  const modalDetail = document.getElementById("modalExerciseDetail");
  if (modalDetail) modalDetail.classList.add("hidden");
}

function selectExerciseFromLibrary(exerciseId) {
  const db = getExerciseDB();
  const ex = db.find(e => e.id === exerciseId);
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
  if (!container) return;
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
  renderTemplates();
  renderProfileStats();
  populateProgressExerciseSelect();
  populateWorkoutTemplateSelect();
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
  renderTemplates();
  renderProfileStats();
  populateProgressExerciseSelect();
  populateWorkoutTemplateSelect();
}

/* -------------------------------------------------------------
   CONFIGURAÇÃO DE META SEMANAL (MODAL)
-------------------------------------------------------------- */
let tempSelectedGoal = 5;
let tempPreferredDays = [];

function openGoalModal() {
  const modal = document.getElementById("modalGoalConfig");
  if (!modal) return;
  
  tempSelectedGoal = state.weeklyGoal || 5;
  tempPreferredDays = Array.isArray(state.preferredDays) ? [...state.preferredDays] : [];

  const dayButtons = modal.querySelectorAll('.goal-days-btn');
  dayButtons.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-val'));
    if (val === tempSelectedGoal) {
      btn.className = "goal-days-btn py-3 px-2 rounded-xl border border-brand-lime bg-brand-lime text-black font-mono flex flex-col items-center justify-center gap-1 shadow-md glow-lime font-bold";
      btn.querySelector('span:last-child').className = "text-[10px] text-black/80 font-bold";
    } else {
      btn.className = "goal-days-btn py-3 px-2 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono flex flex-col items-center justify-center gap-1 transition-all hover:border-slate-700";
      btn.querySelector('span:last-child').className = "text-[10px] text-slate-400";
    }
  });

  const prefButtons = modal.querySelectorAll('.pref-day-btn');
  prefButtons.forEach(btn => {
    const dayIndex = parseInt(btn.getAttribute('data-day'));
    if (tempPreferredDays.includes(dayIndex)) {
      btn.className = "pref-day-btn py-2.5 rounded-xl border border-brand-lime bg-brand-lime text-black font-mono text-xs font-bold shadow-sm glow-lime";
    } else {
      btn.className = "pref-day-btn py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 font-mono text-xs font-bold transition-all";
    }
  });

  modal.classList.remove("hidden");
}

function closeGoalModal() {
  const modal = document.getElementById("modalGoalConfig");
  if (modal) modal.classList.add("hidden");
}

function selectGoalDays(goalVal) {
  tempSelectedGoal = goalVal;
  const buttons = document.querySelectorAll('.goal-days-btn');
  buttons.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-val'));
    if (val === goalVal) {
      btn.className = "goal-days-btn py-3 px-2 rounded-xl border border-brand-lime bg-brand-lime text-black font-mono flex flex-col items-center justify-center gap-1 shadow-md glow-lime font-bold";
      btn.querySelector('span:last-child').className = "text-[10px] text-black/80 font-bold";
    } else {
      btn.className = "goal-days-btn py-3 px-2 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono flex flex-col items-center justify-center gap-1 transition-all hover:border-slate-700";
      btn.querySelector('span:last-child').className = "text-[10px] text-slate-400";
    }
  });
}

function togglePreferredDay(dayIndex) {
  const btn = document.querySelector(`.pref-day-btn[data-day="${dayIndex}"]`);
  if (!btn) return;

  const existsIndex = tempPreferredDays.indexOf(dayIndex);
  if (existsIndex > -1) {
    tempPreferredDays.splice(existsIndex, 1);
    btn.className = "pref-day-btn py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 font-mono text-xs font-bold transition-all";
  } else {
    tempPreferredDays.push(dayIndex);
    btn.className = "pref-day-btn py-2.5 rounded-xl border border-brand-lime bg-brand-lime text-black font-mono text-xs font-bold shadow-sm glow-lime";
  }
}

async function saveUserGoal() {
  state.weeklyGoal = tempSelectedGoal;
  state.preferredDays = [...tempPreferredDays];
  closeGoalModal();

  renderProfileStats();

  if (state.user) {
    localStorage.setItem(`forja_goal_${state.user.id}`, state.weeklyGoal);
    localStorage.setItem(`forja_pref_${state.user.id}`, JSON.stringify(state.preferredDays));
  }

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({ 
        id: state.user.id,
        email: state.user.email,
        weekly_goal: state.weeklyGoal,
        preferred_days: state.preferredDays
      }, { onConflict: 'id' });

    if (error) {
      console.error("Erro ao salvar meta no Supabase:", error);
      alert("Erro ao salvar meta no banco: " + error.message);
    }
  }
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
  switchTab('workout');
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
          <button type="button" onclick="inspectExerciseByName('${ex.name}')" title="Ver postura" class="text-xs bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 hover:text-white">👁️</button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono text-slate-400">Descanso:</span>
          <select onchange="updateExerciseRest(${exIdx}, this.value)" class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-brand-lime">
            <option value="45" ${ex.rest == 45 ? 'selected' : ''}>45s</option>
            <option value="60" ${ex.rest == 60 ? 'selected' : ''}>60s</option>
            <option value="90" ${ex.rest == 90 ? 'selected' : ''}>90s</option>
            <option value="120" ${ex.rest == 120 ? 'selected' : ''}>120s</option>
          </select>
          <button type="button" onclick="removeActiveExercise(${exIdx})" class="text-slate-500 hover:text-red-400 font-bold text-sm">&times;</button>
        </div>
      </div>
      <div class="text-[10px] font-mono text-slate-500">
        Recorde histórico: <span class="text-white font-bold">${maxPrevWeight} kg</span>
      </div>
      <div class="space-y-2 pt-1">
        ${ex.sets.map((set, setIdx) => {
          if (isCardio) {
            return `
              <div class="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                <span class="text-[10px] font-mono text-slate-500 w-6">#${setIdx + 1}</span>
                <div class="flex-1 flex gap-2">
                  <input type="number" value="${set.timeMin}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'timeMin', this.value)" placeholder="Min" class="w-1/2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center" />
                  <input type="number" step="0.1" value="${set.distanceKm}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'distanceKm', this.value)" placeholder="Km" class="w-1/2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center" />
                </div>
                <button type="button" onclick="toggleSetComplete(${exIdx}, ${setIdx})" class="px-3 py-1 rounded-lg text-xs font-mono font-bold ${set.completed ? 'bg-brand-lime text-black' : 'bg-slate-800 text-slate-400'}">
                  ${set.completed ? 'FEITO' : 'OK'}
                </button>
              </div>
            `;
          } else {
            const e1rm = calculate1RM(set.weight, set.reps);
            return `
              <div class="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                <span class="text-[10px] font-mono text-slate-500 w-6">#${setIdx + 1}</span>
                <div class="flex-1 grid grid-cols-2 gap-2">
                  <div class="relative">
                    <input type="number" value="${set.weight}" onchange="updateWeightRepsSet(${exIdx}, ${setIdx}, 'weight', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center font-mono" />
                    <span class="absolute right-2 top-1.5 text-[9px] text-slate-500">kg</span>
                  </div>
                  <div class="relative">
                    <input type="number" value="${set.reps}" onchange="updateWeightRepsSet(${exIdx}, ${setIdx}, 'reps', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center font-mono" />
                    <span class="absolute right-2 top-1.5 text-[9px] text-slate-500">reps</span>
                  </div>
                </div>
                <div class="text-right w-12 hidden sm:block">
                  <span class="text-[9px] font-mono text-slate-500 block">1RM</span>
                  <span class="text-[10px] font-mono text-brand-lime font-bold">${e1rm}</span>
                </div>
                <button type="button" onclick="toggleSetComplete(${exIdx}, ${setIdx})" class="px-3 py-1 rounded-lg text-xs font-mono font-bold ${set.completed ? 'bg-brand-lime text-black shadow-lg glow-lime' : 'bg-slate-800 text-slate-400 hover:text-white'}">
                  ${set.completed ? 'FEITO' : 'OK'}
                </button>
              </div>
            `;
          }
        }).join('')}
      </div>
      <div class="flex justify-between pt-1">
        <button type="button" onclick="addSetToExercise(${exIdx})" class="text-[10px] font-mono text-brand-lime hover:underline">+ Adicionar Série</button>
        <button type="button" onclick="removeActiveExercise(${exIdx})" class="text-[10px] font-mono text-red-400 hover:underline">Remover Exercício</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function inspectExerciseByName(name) {
  const db = getExerciseDB();
  const found = db.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (found) {
    showExerciseDetail(found.id);
  } else {
    alert(`Detalhes não encontrados para: ${name}`);
  }
}

function removeActiveExercise(exIdx) {
  state.activeWorkout.exercises.splice(exIdx, 1);
  renderActiveWorkout();
}

function updateWeightRepsSet(exIdx, setIdx, field, val) {
  state.activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(val) || 0;
}

function updateCardioSet(exIdx, setIdx, field, val) {
  state.activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(val) || 0;
}

function toggleSetComplete(exIdx, setIdx) {
  const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
  set.completed = !set.completed;
  
  if (set.completed) {
    const restTime = state.activeWorkout.exercises[exIdx].rest || 60;
    startAutoRest(restTime);
  }
  
  renderActiveWorkout();
}

async function finishActiveWorkout() {
  if (state.activeWorkout.exercises.length === 0) {
    alert("Adicione pelo menos um exercício antes de concluir o treino!");
    return;
  }

  let totalVolume = 0;
  state.activeWorkout.exercises.forEach(ex => {
    if (ex.sets) {
      ex.sets.forEach(s => {
        if (s.completed && s.weight && s.reps) {
          totalVolume += (s.weight * s.reps);
        }
      });
    }
  });

  const workoutPayload = {
    user_id: state.user ? state.user.id : null,
    name: document.getElementById("activeWorkoutName").value.trim() || "Treino Concluído",
    date: new Date().toISOString().split('T')[0],
    total_volume_kg: totalVolume,
    exercises: state.activeWorkout.exercises
  };

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient.from('workouts').insert([workoutPayload]);
    if (error) {
      alert("Erro ao salvar treino no banco: " + error.message);
      return;
    }
  }

  state.workouts.push(workoutPayload);
  
  addXP(150, "Treino Concluído");

  alert(`🔥 Treino finalizado com sucesso!\nVolume total: ${totalVolume} kg\n+150 XP acumulados!`);

  state.activeWorkout = { name: "Treino Personalizado", exercises: [] };
  renderAll();
  switchTab('home');
}

/* -------------------------------------------------------------
   GRÁFICO DE EVOLUÇÃO E PROGRESSO DE CARGAS
-------------------------------------------------------------- */
function updateProgressChart() {
  const select = document.getElementById("progressExerciseSelect");
  const canvas = document.getElementById("progressChartCanvas");
  if (!select || !canvas) return;

  const selectedExercise = select.value;
  const ctx = canvas.getContext("2d");

  const dataPoints = [];
  state.workouts.forEach(w => {
    if (!w.exercises) return;
    w.exercises.forEach(e => {
      if (e.name && e.name.toLowerCase() === selectedExercise.toLowerCase()) {
        let metricVal = 0;
        if (state.metricMode === 'maxWeight') {
          e.sets.forEach(s => {
            const wVal = parseFloat(s.weight) || 0;
            if (wVal > metricVal) metricVal = wVal;
          });
        } else {
          e.sets.forEach(s => {
            const rm = calculate1RM(s.weight, s.reps);
            if (rm > metricVal) metricVal = rm;
          });
        }
        if (metricVal > 0) {
          dataPoints.push({
            date: w.date || 'Recente',
            value: metricVal
          });
        }
      }
    });
  });

  if (window.myProgressChart instanceof Chart) {
    window.myProgressChart.destroy();
  }

  if (dataPoints.length === 0) {
    return;
  }

  window.myProgressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataPoints.map(d => d.date),
      datasets: [{
        label: selectedExercise,
        data: dataPoints.map(d => d.value),
        borderColor: '#a3e635',
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { family: 'monospace', size: 10 } },
          grid: { color: '#1e293b' }
        },
        y: {
          ticks: { color: '#94a3b8', font: { family: 'monospace', size: 10 } },
          grid: { color: '#1e293b' }
        }
      }
    }
  });
}

function setProgressMetricMode(mode) {
  state.metricMode = mode;
  const btnMax = document.getElementById("btnMetricMaxWeight");
  const btn1RM = document.getElementById("btnMetric1RM");

  if (mode === 'maxWeight') {
    if (btnMax) btnMax.className = "px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-brand-lime text-black";
    if (btn1RM) btn1RM.className = "px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-slate-400";
  } else {
    if (btn1RM) btn1RM.className = "px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-brand-lime text-black";
    if (btnMax) btnMax.className = "px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-slate-400";
  }
  updateProgressChart();
}
