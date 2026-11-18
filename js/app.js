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
  editingEvaluationId: null,
  evaluationStep: 1,
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
  activeGroupFilter: 'Todos',
  activeEquipmentFilter: 'Todos'
};

let progressChartInstance = null;
let animationInterval = null;
const DEFAULT_FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a3e635' stroke-width='1.5'%3E%3Cpath d='M6.5 6.5h11M6.5 17.5h11M4 9.5h16M4 14.5h16M2 12h20'/%3E%3C/svg%3E";

/* -------------------------------------------------------------
   CENTRAL DE NOTIFICAÇÕES FORJA
   Avisos padronizados + confirmações próprias, sem diálogos nativos.
-------------------------------------------------------------- */
(function initForjaNotifications() {
  const style = document.createElement('style');
  style.id = 'forja-notifications-style';
  style.textContent = `
    #forja-toast-region { position:fixed; top:max(18px,env(safe-area-inset-top)); right:18px; z-index:10000; width:min(calc(100vw - 36px),420px); display:flex; flex-direction:column; gap:12px; pointer-events:none; }
    .forja-toast { --notify-accent:#a3e635; position:relative; isolation:isolate; display:grid; grid-template-columns:48px minmax(0,1fr) 28px; gap:12px; align-items:start; padding:15px 15px 16px; overflow:hidden; color:#f8fafc; background:linear-gradient(125deg,#182231 0%,#101722 58%,#0b111a 100%); border:1px solid rgba(163,230,53,.22); border-radius:13px 19px 13px 19px; box-shadow:0 18px 48px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.045); pointer-events:auto; animation:forjaToastIn .28s cubic-bezier(.2,.8,.2,1) both; }
    .forja-toast:before { content:''; position:absolute; z-index:-1; width:180px;height:130px;right:-70px;top:-75px;background:radial-gradient(circle, color-mix(in srgb,var(--notify-accent) 18%,transparent),transparent 70%);pointer-events:none; }
    .forja-toast:after { content:''; position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--notify-accent);box-shadow:0 0 16px color-mix(in srgb,var(--notify-accent) 55%,transparent); }
    .forja-toast.success { --notify-accent:#a3e635; border-color:rgba(163,230,53,.30); } .forja-toast.info { --notify-accent:#7dd3fc; border-color:rgba(125,211,252,.25); } .forja-toast.warning { --notify-accent:#fbbf24; border-color:rgba(251,191,36,.25); } .forja-toast.error { --notify-accent:#fb7185; border-color:rgba(251,113,133,.28); }
    .forja-toast-brand { grid-column:1/-1;display:flex;align-items:center;gap:8px;margin:-2px 0 1px 1px;color:#9aa8b8;font:800 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.19em;text-transform:uppercase; }
    .forja-toast-brand-mark { width:19px;height:19px;display:grid;place-items:center;background:var(--notify-accent);color:#101720;font:italic 950 13px/1 Arial,sans-serif;transform:skew(-9deg);box-shadow:0 0 14px color-mix(in srgb,var(--notify-accent) 25%,transparent); }
    .forja-toast-icon { width:44px;height:44px;border-radius:10px 14px 10px 14px;display:grid;place-items:center;color:#101720;background:var(--notify-accent);font-size:21px;font-weight:950;box-shadow:0 5px 18px color-mix(in srgb,var(--notify-accent) 20%,transparent); }
    .forja-toast-title { margin:1px 0 5px;font:900 12px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.075em;color:#fff;text-transform:uppercase; }
    .forja-toast-message { margin:0;color:#c5cfda;font-size:12px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere; }
    .forja-toast-close { width:28px;height:28px;border:1px solid rgba(148,163,184,.14);border-radius:8px;background:rgba(255,255,255,.035);color:#94a3b8;font-size:18px;cursor:pointer; }
    .forja-toast-close:hover { background:rgba(255,255,255,.1);color:#fff; }
    .forja-toast-progress { position:absolute;left:3px;bottom:0;height:3px;background:linear-gradient(90deg,var(--notify-accent),color-mix(in srgb,var(--notify-accent) 35%,#fff));box-shadow:0 0 10px color-mix(in srgb,var(--notify-accent) 40%,transparent);border-radius:0 3px 0 0;animation:forjaToastProgress linear forwards; }
    #forja-confirm-layer { position:fixed;inset:0;z-index:10001;display:grid;place-items:center;padding:20px;background:rgba(3,7,12,.82);backdrop-filter:blur(12px); }
    #forja-confirm-layer.hidden { display:none; }
    .forja-confirm-card { position:relative;width:min(100%,420px);padding:24px;background:linear-gradient(145deg,#1a2635,#0c131d);border:1px solid rgba(163,230,53,.32);border-radius:14px 22px 14px 22px;box-shadow:0 28px 80px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.05);animation:forjaToastIn .22s ease-out both; }
    .forja-confirm-card:before { content:'F';position:absolute;right:18px;top:8px;color:rgba(163,230,53,.07);font:italic 950 76px/1 Arial,sans-serif;pointer-events:none; }
    .forja-confirm-actions { display:flex;gap:10px;margin-top:22px; }
    .forja-confirm-actions button { flex:1;min-height:46px;border-radius:9px 13px 9px 13px;font:900 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;transition:transform .15s,filter .15s; }
    .forja-confirm-actions button:hover { transform:translateY(-1px);filter:brightness(1.08); }
    @keyframes forjaToastIn { from { opacity:0;transform:translateY(-10px) scale(.975); } to { opacity:1;transform:translateY(0) scale(1); } }
    @keyframes forjaToastOut { to { opacity:0;transform:translateX(14px) scale(.98); } }
    @keyframes forjaToastProgress { from { width:100%; } to { width:0%; } }
    @media(max-width:480px) { #forja-toast-region { top:max(10px,env(safe-area-inset-top));left:10px;right:10px;width:auto;gap:9px; } .forja-toast { grid-template-columns:42px minmax(0,1fr) 26px;gap:10px;padding:13px 12px 15px; } .forja-toast-icon { width:40px;height:40px; } .forja-toast-title { font-size:11px; } .forja-toast-message { font-size:11px; } }
    @media(prefers-reduced-motion:reduce) { .forja-toast,.forja-confirm-card { animation:none; } .forja-toast-progress { animation:none; } }
  `;
  document.head.appendChild(style);

  function ensureRegion() {
    let region = document.getElementById('forja-toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'forja-toast-region';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'false');
      document.body.appendChild(region);
    }
    return region;
  }

  function classify(message, requestedType) {
    if (requestedType) return requestedType;
    const text = String(message).toLowerCase();
    if (/erro|falha|não foi possível|nao foi possivel|inválid|invalido|não autenticado/.test(text)) return 'error';
    if (/atenção|atencao|verifique|obrigatóri|obrigatori|adicione|insira|selecione|não encontrado|nao encontrado/.test(text)) return 'warning';
    if (/sucesso|salva|salvo|criada|criado|atualizada|atualizado|concluído|concluido|finalizado/.test(text)) return 'success';
    return 'info';
  }

  function notify(message, options = {}) {
    const text = String(message ?? '');
    const type = classify(text, options.type);
    const titles = { success:'FORJADO COM SUCESSO', info:'CENTRAL FORJA', warning:'ATENÇÃO, FORJADOR', error:'FALHA NA OPERAÇÃO' };
    const icons = { success:'✓', info:'i', warning:'!', error:'×' };
    const contextualTitle = /ficha/i.test(text) ? 'FICHA FORJADA' : /avaliação/i.test(text) ? 'AVALIAÇÃO REGISTRADA' : /treino/i.test(text) ? 'TREINO FORJADO' : /perfil|nome/i.test(text) ? 'PERFIL ATUALIZADO' : /meta/i.test(text) ? 'META ATUALIZADA' : titles[type];
    const region = ensureRegion();
    const toast = document.createElement('section');
    toast.className = `forja-toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const brand = document.createElement('div'); brand.className='forja-toast-brand';
    const brandMark = document.createElement('span'); brandMark.className='forja-toast-brand-mark'; brandMark.textContent='F';
    const brandText = document.createElement('span'); brandText.textContent='FORJA  /  CENTRAL DE COMANDO';
    brand.append(brandMark,brandText);
    const icon = document.createElement('div'); icon.className='forja-toast-icon'; icon.textContent=icons[type];
    const content = document.createElement('div');
    const title = document.createElement('p'); title.className='forja-toast-title'; title.textContent=options.title || contextualTitle;
    const body = document.createElement('p'); body.className='forja-toast-message'; body.textContent=text;
    content.append(title,body);
    const close = document.createElement('button'); close.type='button'; close.className='forja-toast-close'; close.setAttribute('aria-label','Fechar notificação'); close.textContent='×';
    const progress = document.createElement('div'); progress.className='forja-toast-progress';
    const duration = Math.max(1800, Number(options.duration) || (type === 'error' ? 6500 : 4200));
    progress.style.animationDuration = `${duration}ms`;
    const dismiss = () => { if (!toast.isConnected) return; toast.style.animation='forjaToastOut .18s ease-in forwards'; setTimeout(()=>toast.remove(),180); };
    close.addEventListener('click',dismiss);
    toast.append(brand,icon,content,close,progress); region.appendChild(toast);
    const timer = setTimeout(dismiss,duration);
    toast.addEventListener('mouseenter',()=>{ clearTimeout(timer); progress.style.animationPlayState='paused'; });
    toast.addEventListener('mouseleave',()=>{ progress.style.animationPlayState='running'; });
    while (region.children.length > 4) region.firstElementChild.remove();
    return toast;
  }

  function confirmAction(message, options = {}) {
    return new Promise(resolve => {
      const existing = document.getElementById('forja-confirm-layer');
      if (existing) existing.remove();
      const layer = document.createElement('div'); layer.id='forja-confirm-layer'; layer.setAttribute('role','presentation');
      const card = document.createElement('section'); card.className='forja-confirm-card'; card.setAttribute('role','dialog'); card.setAttribute('aria-modal','true');
      const eyebrow = document.createElement('p'); eyebrow.className='mb-2 text-[9px] font-mono font-bold tracking-[.2em] text-brand-lime'; eyebrow.textContent='FORJA • CONFIRMAÇÃO';
      const heading = document.createElement('h2'); heading.className='text-lg font-extrabold text-white'; heading.textContent=options.title || 'Tem certeza?';
      const body = document.createElement('p'); body.className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300'; body.textContent=String(message ?? '');
      const actions = document.createElement('div'); actions.className='forja-confirm-actions';
      const cancel = document.createElement('button'); cancel.type='button'; cancel.className='border border-slate-700 bg-slate-900 text-slate-300'; cancel.textContent=options.cancelText || 'CANCELAR';
      const accept = document.createElement('button'); accept.type='button'; accept.className='bg-brand-lime text-black'; accept.textContent=options.confirmText || 'CONFIRMAR';
      let settled=false;
      const finish = value => { if(settled)return; settled=true; layer.remove(); document.removeEventListener('keydown',onKey); resolve(value); };
      const onKey = event => { if(event.key==='Escape') finish(false); if(event.key==='Enter') finish(true); };
      cancel.addEventListener('click',()=>finish(false)); accept.addEventListener('click',()=>finish(true));
      layer.addEventListener('click',event=>{if(event.target===layer)finish(false);});
      actions.append(cancel,accept); card.append(eyebrow,heading,body,actions); layer.appendChild(card); document.body.appendChild(layer);
      document.addEventListener('keydown',onKey); accept.focus();
    });
  }

  window.FORJA = window.FORJA || {};
  window.FORJA.notify = notify;
  window.FORJA.confirm = confirmAction;
})();


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
  const nameFieldContainer = document.getElementById("nameFieldContainer");

  if (mode === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "ACESSAR MINHA CONTA";
    if (roleContainer) roleContainer.classList.add("hidden");
    if (nameFieldContainer) nameFieldContainer.classList.add("hidden");
  } else {
    btnRegister.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all bg-brand-lime text-black";
    btnLogin.className = "flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all text-slate-400 hover:text-white";
    submitText.textContent = "CRIAR CONTA NA FORJA";
    if (roleContainer) roleContainer.classList.remove("hidden");
    if (nameFieldContainer) nameFieldContainer.classList.remove("hidden");
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
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      state.user = data.user;

      if (supabaseClient && state.user) {
        await supabaseClient.from('profiles').upsert({
          id: state.user.id,
          email: email,
          role: state.selectedRole,
          full_name: fullName,
          weekly_goal: 5
        }, { onConflict: 'id' });
      }

      FORJA.notify(`Conta de ${state.selectedRole.toUpperCase()} criada com sucesso!`);
      await onAuthSuccess();
    }
  } catch (err) {
    FORJA.notify("Erro de autenticação: " + (err.message || "Verifique seus dados."));
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

    // Preenche input de nome na tela de perfil se existir
    const profileInput = document.getElementById("profileFullNameInput");
    if (profileInput && data.full_name) {
      profileInput.value = data.full_name;
    }
  } else {
    state.weeklyGoal = parseInt(localStorage.getItem(`forja_goal_${state.user.id}`)) || 5;
    state.preferredDays = JSON.parse(localStorage.getItem(`forja_pref_${state.user.id}`) || '[]');
  }
}

async function updateProfileFullName() {
  const input = document.getElementById("profileFullNameInput");
  if (!input) return;
  const newName = input.value.trim();

  if (!newName) {
    FORJA.notify("Insira um nome válido!");
    return;
  }

  if (!state.user) {
    FORJA.notify("Usuário não autenticado.");
    return;
  }

  if (!state.userProfile) state.userProfile = {};
  state.userProfile.full_name = newName;

  if (supabaseClient) {
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        id: state.user.id,
        email: state.user.email,
        full_name: newName,
        weekly_goal: state.weeklyGoal || 5,
        preferred_days: state.preferredDays || []
      }, { onConflict: 'id' });

    if (error) {
      console.error("Erro ao atualizar nome no Supabase:", error);
      FORJA.notify("Erro ao atualizar nome na nuvem: " + error.message);
      return;
    }
  }

  FORJA.notify("Nome de perfil atualizado com sucesso!");
  renderProfileStats();
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
    const { data, error } = await supabaseClient
      .from('avaliacoes_fisicas')
      .select('*')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    state.evaluations = (data || []).map(mapEvaluationFromDatabase);
  } catch (e) {
    console.error('Erro ao carregar avaliações físicas:', e);
    state.evaluations = [];
  }
}

/* -------------------------------------------------------------
   RENDERIZAÇÃO GERAL (FICHAS, HISTÓRICO, GRÁFICOS & PERFIL)
-------------------------------------------------------------- */
function renderAll() {
  renderPhysicalEvaluations();
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
    let cardioCount = 0;
    exercisesConfig.forEach(ex => {
      const isCardio = ex.type === 'cardio' || isCardioExercise(ex.name);
      if (isCardio) cardioCount++;
      else totalSeries += (parseInt(ex.sets) || 3);
    });
    const templateWorkload = [
      totalSeries > 0 ? `${totalSeries} séries` : '',
      cardioCount > 0 ? `${cardioCount} cardio` : ''
    ].filter(Boolean).join(' · ');

    const isOpen = index === 0 ? 'open' : '';

    div.innerHTML = `
      <details ${isOpen} class="group">
        <summary class="p-4 cursor-pointer flex justify-between items-center select-none hover:bg-slate-900/50 transition-all list-none">
          <div class="pr-2 space-y-0.5">
            <span class="text-[9px] font-mono text-brand-lime font-bold uppercase tracking-wider block">Divisão ${tpl.division || 'A'}</span>
            <h3 class="text-sm font-display font-bold text-white">${tpl.title || tpl.name}</h3>
            <div class="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
              <span class="inline-flex items-center gap-1.5">
                <span class="w-[18px] h-[18px] rounded-[5px] bg-[#263421] inline-flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" class="w-3 h-3 text-[#A3E635]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M6 9v6M3 8v8M6 12h12M18 9v6M21 8v8"/>
                  </svg>
                </span>
                <span>${exercisesConfig.length} ${exercisesConfig.length === 1 ? 'exercício' : 'exercícios'}</span>
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="w-[18px] h-[18px] rounded-[5px] bg-[#263421] inline-flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" class="w-3 h-3 text-[#A3E635]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m12 2 9 5-9 5-9-5 9-5Z"/>
                    <path d="m3 12 9 5 9-5"/>
                    <path d="m3 17 9 5 9-5"/>
                  </svg>
                </span>
                <span>${templateWorkload || `${exercisesConfig.length} exercícios`}</span>
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2" onclick="event.stopPropagation()">
            <button onclick="loadTemplateIntoWorkout('${tpl.id}')"
              class="h-[38px] px-3 bg-[#A3E635] text-[#17210A] font-mono font-bold text-[10px] rounded-xl hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Iniciar treino" aria-label="Iniciar treino">
              <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m13 2-3 8h7l-6 12 1-9H5l8-11Z"/>
              </svg>
              Iniciar
            </button>
            <button onclick="openEditTemplateModal('${tpl.id}')"
              class="w-[38px] h-[38px] bg-[#202B3D] text-[#DCE6F5] rounded-xl hover:bg-[#2B394F] active:scale-[0.97] transition-all inline-flex items-center justify-center"
              title="Editar ficha" aria-label="Editar ficha">
              <svg viewBox="0 0 24 24" class="w-[17px] h-[17px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m16 4 4 4"/>
                <path d="M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"/>
              </svg>
            </button>
            <button onclick="deleteTemplate('${tpl.id}')"
              class="w-[38px] h-[38px] bg-[#321D25] text-[#FB7185] rounded-xl hover:bg-[#482631] active:scale-[0.97] transition-all inline-flex items-center justify-center"
              title="Excluir ficha" aria-label="Excluir ficha">
              <svg viewBox="0 0 24 24" class="w-[17px] h-[17px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="m19 6-1 14H6L5 6"/>
                <path d="M10 11v5M14 11v5"/>
              </svg>
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
              <span class="text-slate-400 flex-shrink-0 text-[11px]">${(ex.type === 'cardio' || isCardioExercise(ex.name)) ? `Cardio · ${ex.durationMin || 20} min` : `${ex.sets || 3} séries (${ex.rest || 60}s)`}</span>
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
    let displayName = "ATLETA";
    if (state.userProfile && state.userProfile.full_name) {
      displayName = state.userProfile.full_name;
    } else if (state.user.user_metadata?.full_name) {
      displayName = state.user.user_metadata.full_name;
    } else if (state.user.email) {
      displayName = state.user.email.split('@')[0];
    }
    greetingTitle.textContent = `BEM-VINDO DE VOLTA, ${displayName.toUpperCase()}! 💪`;
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
      motivationText.textContent = `${workoutsThisWeek} ${workoutsThisWeek === 1 ? 'sessão' : 'sessões'} Forjadas nesta semana. Mantenha a consistência!`;
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
    w.exercises.forEach(e => {
      if (e.name && e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()) {
        e.sets.forEach(s => {
          const wVal = parseFloat(s.weight) || 0;
          if (wVal > max) max = wVal;
        });
      }
    });
  });
  return max;
}

function isCardioExercise(exerciseName) {
  const db = getExerciseDB();
  const ex = db.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
  return ex ? (ex.type === 'cardio' || ex.group === 'Cardio') : false;
}

function createCardioSet(overrides = {}) {
  return { timeMin: 0, timeSec: 0, distanceKm: 0, avgSpeedKmh: 0, calories: 0, intensity: 'moderada', resistanceLevel: '', completed: false, ...overrides };
}

function calculateCardioSpeed(set) {
  const minutes = (parseFloat(set.timeMin) || 0) + ((parseFloat(set.timeSec) || 0) / 60);
  const distance = parseFloat(set.distanceKm) || 0;
  return minutes > 0 && distance > 0 ? Number((distance / (minutes / 60)).toFixed(2)) : 0;
}


/* -------------------------------------------------------------
   ARSENAL DE EXERCÍCIOS & MODAIS COM SUPORTE A ANIMAÇÃO FLIP
-------------------------------------------------------------- */
function openExerciseLibraryModal(context = 'workout') {
  state.libraryContext = context;
  state.activeGroupFilter = 'Todos';
  state.activeEquipmentFilter = 'Todos';
  const search = document.getElementById("librarySearchInput");
  if (search) search.value = "";
  populateLibraryEquipmentFilter();
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
  const equipmentSelect = document.getElementById("libraryEquipmentFilter");
  if (equipmentSelect) state.activeEquipmentFilter = equipmentSelect.value;
  renderExerciseLibraryList();
}

function clearExerciseLibraryFilters() {
  state.activeGroupFilter = 'Todos';
  state.activeEquipmentFilter = 'Todos';
  const search = document.getElementById("librarySearchInput");
  const equipment = document.getElementById("libraryEquipmentFilter");
  if (search) search.value = '';
  if (equipment) equipment.value = 'Todos';
  renderExerciseLibraryList();
}

function populateLibraryEquipmentFilter() {
  const select = document.getElementById("libraryEquipmentFilter");
  if (!select) return;
  const equipment = [...new Set(getExerciseDB().map(ex => ex.equipment).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  select.innerHTML = '<option value="Todos">Todos os equipamentos</option>';
  equipment.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
  select.value = state.activeEquipmentFilter || 'Todos';
}

function getLibrarySelectedCount() {
  if (state.libraryContext === 'workout') {
    return state.activeWorkout && Array.isArray(state.activeWorkout.exercises)
      ? state.activeWorkout.exercises.length : 0;
  }
  return document.querySelectorAll('#tplExerciseInputs .tpl-exercise-row').length;
}

function renderExerciseLibraryList() {
  const container = document.getElementById("libraryListContainer");
  const searchInput = document.getElementById("librarySearchInput");
  const searchTerm = searchInput ? searchInput.value.trim().toLocaleLowerCase('pt-BR') : "";
  if (!container) return;
  container.innerHTML = "";

  document.querySelectorAll('[data-library-group]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.libraryGroup === state.activeGroupFilter);
  });

  const db = getExerciseDB();
  const filtered = db.filter(ex => {
    const group = ex.group || '';
    const name = ex.name || '';
    const muscles = ex.muscles || '';
    const equipment = ex.equipment || '';
    const matchesGroup = (state.activeGroupFilter === 'Todos' || group === state.activeGroupFilter);
    const matchesEquipment = (state.activeEquipmentFilter === 'Todos' || equipment === state.activeEquipmentFilter);
    const searchable = `${name} ${muscles} ${equipment} ${group}`.toLocaleLowerCase('pt-BR');
    return matchesGroup && matchesEquipment && searchable.includes(searchTerm);
  });

  const resultsCount = document.getElementById('libraryResultsCount');
  if (resultsCount) resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'movimento' : 'movimentos'}`;
  const selectedCount = document.getElementById('librarySelectedCount');
  if (selectedCount) selectedCount.textContent = getLibrarySelectedCount();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30">
        <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-800/80 flex items-center justify-center text-brand-lime text-xl">⌕</div>
        <p class="text-sm font-bold text-white">Nenhum movimento encontrado</p>
        <p class="text-[11px] text-slate-500 mt-1">Tente outro nome ou ajuste os filtros.</p>
        <button type="button" onclick="clearExerciseLibraryFilters()" class="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-brand-lime text-[10px] font-mono font-bold">LIMPAR FILTROS</button>
      </div>`;
    return;
  }

  filtered.forEach(ex => {
    const div = document.createElement("article");
    div.className = "library-exercise-card";
    const imageSrc = ex.img || DEFAULT_FALLBACK_IMG;
    div.innerHTML = `
      <div class="flex items-stretch gap-3 p-2.5 sm:p-3">
        <button type="button" onclick="showExerciseDetail('${ex.id}')" title="Ver demonstração de ${ex.name}" class="library-exercise-image relative w-[100px] h-[112px] sm:w-[124px] sm:h-[124px] rounded-xl overflow-hidden border border-slate-700/70 flex-shrink-0 group">
          <img src="${imageSrc}" alt="Demonstração: ${ex.name}" loading="lazy" class="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null; this.src='${DEFAULT_FALLBACK_IMG}';" />
          <span class="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-lg bg-black/70 border border-white/10 text-brand-lime flex items-center justify-center backdrop-blur-sm">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </span>
        </button>
        <div class="min-w-0 flex-1 flex flex-col py-0.5">
          <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span class="text-[9px] font-mono text-brand-lime uppercase font-extrabold tracking-wider">${ex.group || 'Geral'}</span>
            <span class="w-1 h-1 rounded-full bg-slate-600"></span>
            <span class="text-[9px] text-slate-400 font-mono">${ex.equipment || 'Sem equipamento'}</span>
          </div>
          <h4 class="text-[13px] sm:text-sm font-extrabold text-white leading-snug">${ex.name}</h4>
          <p class="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed mt-1.5 line-clamp-2">${ex.muscles || 'Músculos não informados'}</p>
          <div class="mt-auto pt-2.5 flex items-center justify-between gap-2">
            <button type="button" onclick="showExerciseDetail('${ex.id}')" class="text-[9px] font-mono font-bold text-slate-400 hover:text-brand-lime transition-colors">VER DETALHES ↗</button>
            <button type="button" onclick="selectExerciseFromLibrary('${ex.id}')" class="px-3 py-2 rounded-lg bg-brand-lime text-[#0a0d14] font-mono font-extrabold text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_14px_rgba(163,230,53,.13)] whitespace-nowrap">
              + ADICIONAR
            </button>
          </div>
        </div>
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
        ? [createCardioSet({ timeMin: ex.durationMin || 20, distanceKm: 0 })]
        : [
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false },
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false },
            { weight: getLastUsedWeight(ex.name) || 20, reps: 10, completed: false }
          ]
    });
    renderActiveWorkout();
    closeExerciseLibraryModal();
  } else {
    appendExerciseRowToTemplateForm(ex.name, 3, 60, ex.type === 'cardio' || ex.group === 'Cardio');
    closeExerciseLibraryModal();
  }
}

/* -------------------------------------------------------------
   GERENCIAMENTO DE FICHAS (CRIAÇÃO, EDIÇÃO & EXCLUSÃO)
-------------------------------------------------------------- */
function appendExerciseRowToTemplateForm(name = "", sets = 3, rest = 60, cardio = null, durationMin = 20) {
  const container = document.getElementById("tplExerciseInputs");
  if (!container) return;
  const rowId = "tpl-row-" + Date.now() + Math.floor(Math.random() * 1000);
  const div = document.createElement("div");
  div.id = rowId;
  div.className = "tpl-exercise-row flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl tactical-border";
  const matchedExercise = getExerciseDB().find(e => e.name.toLowerCase() === String(name).toLowerCase());
  const isCardio = cardio === true || (cardio === null && matchedExercise && (matchedExercise.type === 'cardio' || matchedExercise.group === 'Cardio'));
  div.dataset.exerciseType = isCardio ? 'cardio' : 'weight_reps';
  const escapedName = String(name).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  div.innerHTML = `
    <div class="flex-1 min-w-0">
      <input type="text" list="exerciseSuggestionsList" value="${escapedName}" placeholder="Nome do exercício..." class="tpl-exercise-name w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-lime" onchange="updateTemplateExerciseRowType('${rowId}')" />
    </div>
    <div class="tpl-exercise-config flex items-center gap-1.5">${isCardio ? `
      <label class="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap">Min
        <input type="number" class="tpl-cardio-duration w-14 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white text-center" value="${durationMin || 20}" min="1" max="300" title="Duração prevista em minutos" />
      </label>` : `
      <input type="number" class="tpl-strength-sets w-14 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white text-center" value="${sets || 3}" min="1" max="10" title="Séries" placeholder="Séries" />
      <select title="Descanso entre séries" class="tpl-rest-select w-16 bg-slate-900 border border-slate-800 rounded-lg px-1 py-1.5 text-[11px] font-mono text-brand-lime focus:outline-none focus:border-brand-lime">
        <option value="45" ${rest == 45 ? 'selected' : ''}>45s</option>
        <option value="60" ${rest == 60 ? 'selected' : ''}>60s</option>
        <option value="90" ${rest == 90 ? 'selected' : ''}>90s</option>
        <option value="120" ${rest == 120 ? 'selected' : ''}>120s</option>
        <option value="180" ${rest == 180 ? 'selected' : ''}>180s</option>
      </select>`}
    </div>
    <button type="button" onclick="document.getElementById('${rowId}').remove()" title="Remover este exercício" class="p-1 text-slate-500 hover:text-red-400 text-sm font-bold">&times;</button>
  `;
  container.appendChild(div);
}

function updateTemplateExerciseRowType(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const nameInput = row.querySelector('.tpl-exercise-name');
  const name = nameInput ? nameInput.value.trim() : '';
  const isCardio = isCardioExercise(name);
  const currentType = row.dataset.exerciseType;
  if (isCardio === (currentType === 'cardio')) return;

  const config = row.querySelector('.tpl-exercise-config');
  if (!config) return;
  if (isCardio) {
    config.innerHTML = `<label class="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap">Min
      <input type="number" class="tpl-cardio-duration w-14 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white text-center" value="20" min="1" max="300" title="Duração prevista em minutos" />
    </label>`;
    row.dataset.exerciseType = 'cardio';
  } else {
    config.innerHTML = `<input type="number" class="tpl-strength-sets w-14 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white text-center" value="3" min="1" max="10" title="Séries" placeholder="Séries" />
      <select title="Descanso entre séries" class="tpl-rest-select w-16 bg-slate-900 border border-slate-800 rounded-lg px-1 py-1.5 text-[11px] font-mono text-brand-lime focus:outline-none focus:border-brand-lime">
        <option value="45">45s</option><option value="60" selected>60s</option><option value="90">90s</option><option value="120">120s</option><option value="180">180s</option>
      </select>`;
    row.dataset.exerciseType = 'weight_reps';
  }
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
      appendExerciseRowToTemplateForm(ex.name, ex.sets || 3, ex.rest || 60, ex.type === 'cardio' || isCardioExercise(ex.name), ex.durationMin || 20);
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
    FORJA.notify("Dê um nome para a sua ficha!");
    return;
  }

  const exercises = [];
  const rows = document.querySelectorAll(".tpl-exercise-row");
  rows.forEach(r => {
    const nameInput = r.querySelector('.tpl-exercise-name');
    const exerciseName = nameInput ? nameInput.value.trim() : '';
    if (!exerciseName) return;

    const isCardio = r.dataset.exerciseType === 'cardio' || isCardioExercise(exerciseName);
    if (isCardio) {
      const durationInput = r.querySelector('.tpl-cardio-duration');
      exercises.push({
        name: exerciseName,
        type: 'cardio',
        durationMin: Math.max(1, parseInt(durationInput ? durationInput.value : 20, 10) || 20)
      });
    } else {
      const setsInput = r.querySelector('.tpl-strength-sets');
      const restSelect = r.querySelector('.tpl-rest-select');
      exercises.push({
        name: exerciseName,
        type: 'weight_reps',
        sets: Math.max(1, parseInt(setsInput ? setsInput.value : 3, 10) || 3),
        rest: parseInt(restSelect ? restSelect.value : 60, 10) || 60
      });
    }
  });

  if (exercises.length === 0) {
    FORJA.notify("Adicione ao menos 1 exercício na lista antes de salvar!");
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
        FORJA.notify("Erro ao atualizar no banco: " + error.message);
        return;
      }
    }

    const index = state.templates.findIndex(t => t.id === state.editingTemplateId);
    if (index !== -1) {
      state.templates[index] = { ...state.templates[index], ...tplPayload };
    }
    FORJA.notify("Ficha atualizada com sucesso!");
  } else {
    if (supabaseClient && state.user) {
      const { data, error } = await supabaseClient.from('templates').insert([tplPayload]).select();
      if (error) {
        FORJA.notify("Erro ao salvar no banco: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        tplPayload.id = data[0].id;
      }
    }
    state.templates.unshift(tplPayload);
    FORJA.notify("Ficha criada e salva com sucesso!");
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

  if (!(await FORJA.confirm(`Deseja apagar a ficha "${tplName}"?`, { title: "Excluir ficha", confirmText: "EXCLUIR" }))) return;

  if (supabaseClient && state.user) {
    const { error } = await supabaseClient
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      FORJA.notify("Erro ao excluir do banco: " + error.message);
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
      FORJA.notify("Erro ao salvar meta no banco: " + error.message);
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
      state.restTimer.remaining = 0;
      if (secondsDisplay) secondsDisplay.textContent = "0s";
      clearInterval(state.restTimer.intervalId);
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (widget) setTimeout(() => widget.classList.add("hidden"), 3000);
      return;
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
    const isCardio = ex.type === 'cardio' || isCardioExercise(ex.name);
    return {
      name: ex.name,
      type: isCardio ? 'cardio' : 'weight_reps',
      rest: ex.rest || (isCardio ? 30 : 60),
      sets: isCardio 
        ? [createCardioSet({ timeMin: ex.durationMin || 20, distanceKm: 0 })]
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
    ex.sets.push(createCardioSet({ timeMin: 10, distanceKm: 1.0 }));
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
      ${isCardio ? '<div class="text-[10px] font-mono text-brand-lime">Registro cardiovascular • acompanhe tempo, distância e intensidade</div>' : `<div class="text-[10px] font-mono text-slate-500">Recorde histórico: <span class="text-white font-bold">${maxPrevWeight} kg</span></div>`}
      <div class="space-y-2 pt-1">
        ${ex.sets.map((set, setIdx) => {
          if (isCardio) {
            const speed = calculateCardioSpeed(set);
            return `
              <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono text-slate-500">CARDIO • ETAPA #${setIdx + 1}</span>
                  <button type="button" onclick="toggleSetComplete(${exIdx}, ${setIdx})" class="px-3 py-1 rounded-lg text-xs font-mono font-bold ${set.completed ? 'bg-brand-lime text-black' : 'bg-slate-800 text-slate-400'}">${set.completed ? 'FEITO' : 'CONCLUIR'}</button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label class="text-[9px] text-slate-500">MINUTOS<input type="number" min="0" value="${set.timeMin ?? 0}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'timeMin', this.value)" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white text-center" /></label>
                  <label class="text-[9px] text-slate-500">SEGUNDOS<input type="number" min="0" max="59" value="${set.timeSec ?? 0}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'timeSec', this.value)" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white text-center" /></label>
                  <label class="text-[9px] text-slate-500">DISTÂNCIA (KM)<input type="number" min="0" step="0.01" value="${set.distanceKm ?? 0}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'distanceKm', this.value)" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white text-center" /></label>
                  <label class="text-[9px] text-slate-500">VEL. MÉDIA<input type="text" value="${speed.toFixed(2)} km/h" readonly data-cardio-speed="${exIdx}-${setIdx}" class="mt-1 w-full bg-slate-900/70 border border-slate-800 rounded px-2 py-2 text-xs text-brand-lime text-center" /></label>
                  <label class="text-[9px] text-slate-500">CALORIAS (KCAL)<input type="number" min="0" value="${set.calories ?? 0}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'calories', this.value)" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white text-center" /></label>
                  <label class="text-[9px] text-slate-500">INTENSIDADE<select onchange="updateCardioSet(${exIdx}, ${setIdx}, 'intensity', this.value)" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white"><option value="leve" ${set.intensity === 'leve' ? 'selected' : ''}>Leve</option><option value="moderada" ${!set.intensity || set.intensity === 'moderada' ? 'selected' : ''}>Moderada</option><option value="alta" ${set.intensity === 'alta' ? 'selected' : ''}>Alta</option><option value="máxima" ${set.intensity === 'máxima' ? 'selected' : ''}>Máxima</option></select></label>
                  <label class="text-[9px] text-slate-500">RESISTÊNCIA (OPC.)<input type="number" min="0" step="1" value="${set.resistanceLevel ?? ''}" onchange="updateCardioSet(${exIdx}, ${setIdx}, 'resistanceLevel', this.value)" placeholder="Nível" class="mt-1 w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-xs text-white text-center" /></label>
                </div>
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
    FORJA.notify(`Detalhes não encontrados para: ${name}`);
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
  const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
  if (field === 'intensity') set[field] = val;
  else if (field === 'resistanceLevel') set[field] = val === '' ? '' : (parseFloat(val) || 0);
  else set[field] = parseFloat(val) || 0;
  set.avgSpeedKmh = calculateCardioSpeed(set);
  const speedDisplay = document.querySelector(`[data-cardio-speed="${exIdx}-${setIdx}"]`);
  if (speedDisplay) speedDisplay.value = `${set.avgSpeedKmh.toFixed(2)} km/h`;
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
    FORJA.notify("Adicione pelo menos um exercício antes de concluir o treino!");
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
      FORJA.notify("Erro ao salvar treino no banco: " + error.message);
      return;
    }
  }

  state.workouts.push(workoutPayload);
  
  addXP(150, "Treino Concluído");

  FORJA.notify(`🔥 Treino finalizado com sucesso!
Volume total: ${totalVolume} kg
+150 XP acumulados!`);

  state.activeWorkout = { name: "Treino Personalizado", exercises: [] };
  renderAll();
  switchTab('home');
}

/* -------------------------------------------------------------
   GRÁFICO DE EVOLUÇÃO E PROGRESSO DE CARGAS
-------------------------------------------------------------- */
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

/* -------------------------------------------------------------
   PAINEL DE EVOLUÇÃO & PERFORMANCE PROFISSIONAL (FORJA)
-------------------------------------------------------------- */
function switchProgressTab(subTab) {
  const subTabs = ['overview', 'loads', 'prs', 'analysis'];
  subTabs.forEach(t => {
    const el = document.getElementById(`progSub-${t}`);
    const btn = document.getElementById(`progTabBtn-${t}`);
    if (el) {
      if (t === subTab) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
    if (btn) {
      if (t === subTab) {
        btn.className = "py-2 font-bold rounded-lg bg-brand-lime text-black transition-all";
      } else {
        btn.className = "py-2 font-bold rounded-lg text-slate-400 hover:text-white transition-all";
      }
    }
  });

  if (subTab === 'overview') renderOverviewProgressStats();
  if (subTab === 'loads') updateProgressChart();
  if (subTab === 'prs') renderPersonalRecords();
  if (subTab === 'analysis') renderMuscleVolumeAnalysis();
}

function renderOverviewProgressStats() {
  const monthlyVolEl = document.getElementById("progOverviewMonthlyVolume");
  const totalSesEl = document.getElementById("progOverviewTotalSessions");
  const avgVolEl = document.getElementById("progAvgVolumePerWorkout");
  const topExEl = document.getElementById("progTopExerciseName");
  const consistencyEl = document.getElementById("progConsistencyRate");

  let totalVol = 0;
  let validWorkoutsCount = state.workouts.length;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyVol = 0;
  const exerciseCounts = {};

  state.workouts.forEach(w => {
    const vol = w.total_volume_kg || 0;
    totalVol += vol;

    if (w.date) {
      const wDate = new Date(w.date + 'T00:00:00');
      if (wDate.getMonth() === currentMonth && wDate.getFullYear() === currentYear) {
        monthlyVol += vol;
      }
    }

    if (w.exercises) {
      w.exercises.forEach(e => {
        if (e.name) {
          exerciseCounts[e.name] = (exerciseCounts[e.name] || 0) + 1;
        }
      });
    }
  });

  if (monthlyVolEl) monthlyVolEl.textContent = monthlyVol.toLocaleString('pt-BR') + " kg";
  if (totalSesEl) totalSesEl.textContent = validWorkoutsCount;
  if (avgVolEl) avgVolEl.textContent = validWorkoutsCount > 0 ? Math.round(totalVol / validWorkoutsCount).toLocaleString('pt-BR') + " kg" : "0 kg";

  let topEx = "Nenhum";
  let maxCount = 0;
  for (const [exName, count] of Object.entries(exerciseCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topEx = exName;
    }
  }
  if (topExEl) topExEl.textContent = topEx;

  const weeklyGoal = state.weeklyGoal || 5;
  const consistencyRate = Math.min(Math.round((validWorkoutsCount / (weeklyGoal * 4)) * 100), 100);
  if (consistencyEl) consistencyEl.textContent = consistencyRate + "%";
}

function setProgressPeriod(period) {
  state.progressPeriod = period;
  ['7D', '1M', '3M', '1A', 'ALL'].forEach(p => {
    const btn = document.getElementById(`btnPeriod-${p}`);
    if (btn) {
      if (p === period) {
        btn.className = "px-2 py-0.5 rounded bg-brand-lime text-black font-bold";
      } else {
        btn.className = "px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white";
      }
    }
  });
  updateProgressChart();
}

function updateProgressChart() {
  const select = document.getElementById("progressExerciseSelect");
  const canvas = document.getElementById("progressChartCanvas");
  const cardioNotice = document.getElementById("cardioMetricNotice");
  const weightControls = document.getElementById("weightMetricControls");
  const cardioMetric = document.getElementById("cardioMetricSelect");
  if (!select || !canvas) return;

  const selectedExercise = select.value;
  const ctx = canvas.getContext("2d");
  if (window.myProgressChart instanceof Chart) window.myProgressChart.destroy();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!selectedExercise) return;

  const isCardio = isCardioExercise(selectedExercise);
  if (cardioNotice) cardioNotice.classList.toggle('hidden', !isCardio);
  if (weightControls) weightControls.classList.toggle('hidden', isCardio);
  const cardioKey = cardioMetric ? cardioMetric.value : 'distanceKm';
  const metricConfig = {
    distanceKm: { label: 'Distância (km)', read: s => parseFloat(s.distanceKm) || 0 },
    duration: { label: 'Duração (min)', read: s => (parseFloat(s.timeMin) || 0) + ((parseFloat(s.timeSec) || 0) / 60) },
    calories: { label: 'Calorias (kcal)', read: s => parseFloat(s.calories) || 0 },
    avgSpeedKmh: { label: 'Velocidade média (km/h)', read: s => parseFloat(s.avgSpeedKmh) || calculateCardioSpeed(s) }
  };
  const chosenMetric = metricConfig[cardioKey] || metricConfig.distanceKm;
  const dataPoints = [];
  const now = new Date();
  let cutoffDate = null;
  if (state.progressPeriod === '7D') { cutoffDate = new Date(); cutoffDate.setDate(now.getDate() - 7); }
  else if (state.progressPeriod === '1M') { cutoffDate = new Date(); cutoffDate.setMonth(now.getMonth() - 1); }
  else if (state.progressPeriod === '3M') { cutoffDate = new Date(); cutoffDate.setMonth(now.getMonth() - 3); }
  else if (state.progressPeriod === '1A') { cutoffDate = new Date(); cutoffDate.setFullYear(now.getFullYear() - 1); }

  state.workouts.forEach(w => {
    if (!w.exercises || (cutoffDate && w.date && new Date(w.date + 'T00:00:00') < cutoffDate)) return;
    w.exercises.forEach(e => {
      if (!e.name || e.name.toLowerCase() !== selectedExercise.toLowerCase()) return;
      let metricVal = 0;
      const completedSets = (e.sets || []).filter(set => set.completed);
      if (isCardio) {
        if (cardioKey === 'avgSpeedKmh') {
          const totalDistance = completedSets.reduce((sum, set) => sum + (parseFloat(set.distanceKm) || 0), 0);
          const totalMinutes = completedSets.reduce((sum, set) => sum + (parseFloat(set.timeMin) || 0) + ((parseFloat(set.timeSec) || 0) / 60), 0);
          metricVal = totalMinutes > 0 ? totalDistance / (totalMinutes / 60) : 0;
        } else {
          metricVal = completedSets.reduce((sum, set) => sum + chosenMetric.read(set), 0);
        }
      } else {
        completedSets.forEach(set => {
          const value = state.metricMode === 'maxWeight' ? (parseFloat(set.weight) || 0) : calculate1RM(set.weight, set.reps);
          if (value > metricVal) metricVal = value;
        });
      }
      if (metricVal > 0) dataPoints.push({ date: w.date || 'Recente', value: Number(metricVal.toFixed(2)) });
    });
  });

  if (!dataPoints.length) return;
  const label = isCardio ? chosenMetric.label : (state.metricMode === 'maxWeight' ? 'Carga máxima (kg)' : '1RM estimado (kg)');
  window.myProgressChart = new Chart(ctx, {
    type: 'line',
    data: { labels: dataPoints.map(d => d.date), datasets: [{ label: `${selectedExercise} • ${label}`, data: dataPoints.map(d => d.value), borderColor: '#a3e635', backgroundColor: 'rgba(163, 230, 53, 0.1)', borderWidth: 2, fill: true, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.parsed.y} ${isCardio ? (cardioKey === 'distanceKm' ? 'km' : cardioKey === 'duration' ? 'min' : cardioKey === 'calories' ? 'kcal' : 'km/h') : 'kg'}` } } }, scales: { x: { ticks: { color: '#94a3b8', font: { family: 'monospace', size: 10 } }, grid: { color: '#1e293b' } }, y: { beginAtZero: true, ticks: { color: '#94a3b8', font: { family: 'monospace', size: 10 } }, grid: { color: '#1e293b' } } } }
  });
}

function renderPersonalRecords() {
  const container = document.getElementById("personalRecordsList");
  if (!container) return;
  container.innerHTML = "";

  const prMap = {};
  const today = new Date();

  state.workouts.forEach(w => {
    if (!w.exercises) return;
    w.exercises.forEach(e => {
      if (!e.name) return;
      if (isCardioExercise(e.name)) return;

      let maxW = 0;
      let max1RM = 0;
      e.sets.forEach(s => {
        if (s.completed) {
          const wVal = parseFloat(s.weight) || 0;
          const rmVal = calculate1RM(s.weight, s.reps);
          if (wVal > maxW) maxW = wVal;
          if (rmVal > max1RM) max1RM = rmVal;
        }
      });

      if (maxW > 0) {
        const isNew = !prMap[e.name] || maxW > prMap[e.name].maxWeight;
        if (isNew) {
          // Verifica se foi batido nos últimos 14 dias para exibir selo "Novo PR"
          let isRecent = false;
          if (w.date) {
            const wDate = new Date(w.date + 'T00:00:00');
            const diffDays = (today - wDate) / (1000 * 60 * 60 * 24);
            if (diffDays <= 14) isRecent = true;
          }

          prMap[e.name] = {
            name: e.name,
            maxWeight: maxW,
            estimated1RM: max1RM,
            date: w.date || 'Recente',
            isRecent: isRecent
          };
        }
      }
    });
  });

  const prs = Object.values(prMap);
  if (prs.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-xs font-mono text-slate-500">Nenhum recorde registrado com séries concluídas ainda.</div>`;
    return;
  }

  prs.forEach(pr => {
    const div = document.createElement("div");
    div.className = "bg-slate-900/80 p-3 rounded-xl tactical-border flex justify-between items-center text-xs font-mono";
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-white">${pr.name}</h4>
          ${pr.isRecent ? '<span class="px-1.5 py-0.5 rounded bg-brand-lime/20 text-brand-lime border border-brand-lime/40 text-[9px] font-bold uppercase animate-pulse">🏆 Novo PR</span>' : ''}
        </div>
        <span class="text-[10px] text-slate-400">Batido em: ${pr.date}</span>
      </div>
      <div class="text-right">
        <span class="text-brand-lime font-bold block text-sm">${pr.maxWeight} kg</span>
        <span class="text-[10px] text-slate-400 block">1RM: ${pr.estimated1RM} kg</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderMuscleVolumeAnalysis() {
  const container = document.getElementById("muscleVolumeAnalysisList");
  if (!container) return;
  container.innerHTML = "";

  const db = getExerciseDB();
  const muscleVolume = {};

  state.workouts.forEach(w => {
    if (!w.exercises) return;
    w.exercises.forEach(e => {
      if (!e.name) return;
      const foundDb = db.find(item => item.name.toLowerCase() === e.name.toLowerCase());
      const group = foundDb ? foundDb.group : 'Outros';

      let exerciseVol = 0;
      e.sets.forEach(s => {
        if (s.completed && s.weight && s.reps) {
          exerciseVol += (parseFloat(s.weight) * parseFloat(s.reps));
        }
      });

      muscleVolume[group] = (muscleVolume[group] || 0) + exerciseVol;
    });
  });

  const entries = Object.entries(muscleVolume);
  if (entries.length === 0 || Object.values(muscleVolume).every(v => v === 0)) {
    container.innerHTML = `<div class="p-4 text-center text-xs font-mono text-slate-500">Nenhum dado de volume por grupo muscular registrado.</div>`;
    return;
  }

  entries.sort((a, b) => b[1] - a[1]);

  entries.forEach(([group, vol]) => {
    const div = document.createElement("div");
    div.className = "bg-slate-900/80 p-3 rounded-xl tactical-border flex justify-between items-center text-xs font-mono";
    div.innerHTML = `
      <span class="font-bold text-white uppercase">${group}</span>
      <span class="text-brand-lime font-bold">${vol.toLocaleString('pt-BR')} kg</span>
    `;
    container.appendChild(div);
  });
}


/* -------------------------------------------------------------
   AVALIAÇÃO FÍSICA FORJA — WIZARD, HISTÓRICO E EVOLUÇÃO
-------------------------------------------------------------- */
const EVALUATION_STEPS = [
  { title: "Identificação", eyebrow: "ETAPA 01 / 05" },
  { title: "Dados gerais", eyebrow: "ETAPA 02 / 05" },
  { title: "Circunferências", eyebrow: "ETAPA 03 / 05" },
  { title: "Composição corporal", eyebrow: "ETAPA 04 / 05" },
  { title: "Revisão e observações", eyebrow: "ETAPA 05 / 05" }
];

// Chaves internas da interface -> nomes reais das colunas em public.avaliacoes_fisicas.
// A interface mantém nomes estáveis; a camada abaixo faz a conversão para o schema do Supabase.
const EVALUATION_FIELDS = {
  weight_kg: "evalPeso", height_cm: "evalAltura",
  body_fat_pct: "evalGordura", muscle_mass_kg: "evalMassa",
  waist_cm: "evalCintura", abdomen_cm: "evalAbdomen",
  hip_cm: "evalQuadril", chest_cm: "evalPeitoral",
  right_arm_cm: "evalBracoD", left_arm_cm: "evalBracoE",
  right_thigh_cm: "evalCoxaD", left_thigh_cm: "evalCoxaE",
  right_calf_cm: "evalPanturrilhaD", left_calf_cm: "evalPanturrilhaE"
};


// Guia visual de medidas corporais — FORJA
const MEASUREMENT_GUIDES = {
  'cintura': { title:'Cintura', image:'cintura.webp', position:'Meça na região natural da cintura, aproximadamente a meio caminho entre a última costela palpável e o topo do osso do quadril (crista ilíaca), conforme o protocolo adotado.', steps:['Fique em pé, com o abdômen relaxado e os pés próximos.','Passe a fita ao redor do tronco no ponto definido pelo protocolo.','Mantenha a fita horizontal, ajustada ao corpo sem comprimir a pele.','Faça a leitura ao final de uma expiração normal.'], tip:'Não confunda cintura com a linha do cós da roupa. Use sempre o mesmo ponto anatômico nas próximas avaliações.' },
  'abdomen': { title:'Abdômen', image:'abdomen.webp', position:'A imagem ilustra uma referência comum na altura do umbigo. O ponto exato deve seguir o protocolo de avaliação escolhido pelo profissional.', steps:['Fique em pé e mantenha o abdômen relaxado.','Posicione a fita horizontalmente na referência definida (por exemplo, nível umbilical).','Confira se a fita não está inclinada nem pressionando a pele.','Registre a medida sem contrair o abdômen.'], tip:'Cintura e abdômen não são necessariamente a mesma medida. Registre sempre cada uma no seu ponto padronizado.' },
  'quadril': { title:'Quadril', image:'quadril.webp', position:'Passe a fita ao redor da região de maior circunferência dos glúteos/quadril, mantendo-a paralela ao chão.', steps:['Fique em pé, com os pés juntos ou na posição definida pelo protocolo.','Passe a fita ao redor do quadril, na maior projeção dos glúteos.','Confira de lado se a fita está nivelada e horizontal.','Ajuste sem apertar e registre a medida.'], tip:'A fita deve contornar a região mais larga, sem subir nas costas ou descer na frente.' },
  'peitoral': { title:'Peitoral', image:'peitoral.webp', position:'A referência visual mostra a fita ao redor do tórax na altura definida pelo protocolo de avaliação, mantendo-a horizontal.', steps:['Fique em pé, com os braços relaxados ao lado do corpo.','Posicione a fita ao redor do tórax no ponto anatômico padronizado.','Mantenha a fita nivelada nas costas e na frente.','Faça a leitura sem expandir ou contrair exageradamente o peito.'], tip:'O ponto de referência pode variar entre protocolos. O profissional deve escolher um padrão e repeti-lo nas próximas avaliações.' },
  'braco-direito': { title:'Braço direito', image:'braco-direito.webp', position:'A imagem demonstra a fita ao redor do braço. Para medidas padronizadas, o ponto costuma ser definido pela maior circunferência ou por um ponto anatômico previamente marcado.', steps:['Deixe o braço direito relaxado, conforme o protocolo escolhido.','Posicione a fita perpendicular ao eixo do braço.','Ajuste sem comprimir a pele e confira se não está inclinada.','Registre e repita o mesmo procedimento nas próximas avaliações.'], tip:'Não compare braço contraído com braço relaxado. Mantenha a mesma condição em todas as medições.' },
  'braco-esquerdo': { title:'Braço esquerdo', image:'braco-esquerdo.webp', position:'Repita no braço esquerdo o mesmo ponto anatômico e a mesma condição usados no braço direito.', steps:['Mantenha o braço esquerdo na posição definida pelo protocolo.','Passe a fita no mesmo ponto relativo utilizado no braço direito.','Deixe a fita perpendicular ao braço, sem apertar.','Registre o valor separadamente.'], tip:'Use o mesmo método nos dois lados para que a comparação entre braço direito e esquerdo seja válida.' },
  'coxa-direita': { title:'Coxa direita', image:'coxa-direita.webp', position:'A imagem mostra a fita ao redor da coxa. O ponto deve ser definido pelo protocolo (por exemplo, ponto médio entre referências anatômicas ou maior circunferência).', steps:['Fique em pé com o peso distribuído conforme orientação do profissional.','Posicione a fita no ponto padronizado da coxa direita.','Mantenha a fita perpendicular ao eixo da perna e sem comprimir.','Registre a medida.'], tip:'Marque ou registre a distância do ponto de referência para repetir a medição no mesmo local.' },
  'coxa-esquerda': { title:'Coxa esquerda', image:'coxa-esquerda.webp', position:'Repita no lado esquerdo o mesmo ponto anatômico utilizado na coxa direita.', steps:['Adote a mesma postura usada na medição do lado direito.','Posicione a fita na referência equivalente da coxa esquerda.','Confira se a fita está nivelada e sem compressão.','Registre separadamente.'], tip:'A comparação entre lados só é útil quando a posição e a técnica são iguais.' },
  'panturrilha-direita': { title:'Panturrilha direita', image:'panturrilha-direita.webp', position:'A referência ilustrada é a maior circunferência da panturrilha direita.', steps:['Fique em pé e mantenha a musculatura relaxada.','Desloque a fita até encontrar a maior circunferência da panturrilha.','Mantenha a fita perpendicular à perna, sem apertar.','Registre a medida.'], tip:'Não meça sobre a roupa. Procure a maior circunferência e repita o mesmo ponto nas avaliações futuras.' },
  'panturrilha-esquerda': { title:'Panturrilha esquerda', image:'panturrilha-esquerda.webp', position:'Repita no lado esquerdo a busca pela maior circunferência da panturrilha.', steps:['Fique na mesma posição usada para medir a perna direita.','Localize a maior circunferência da panturrilha esquerda.','Mantenha a fita nivelada e sem compressão.','Registre o valor separadamente.'], tip:'Mantenha o mesmo procedimento nos dois lados para acompanhar a evolução de forma consistente.' }
};

function openMeasurementGuide(key) {
  const guide = MEASUREMENT_GUIDES[key];
  const modal = document.getElementById('measurementGuideModal');
  if (!guide || !modal) return;
  document.getElementById('measurementGuideTitle').textContent = guide.title;
  const image = document.getElementById('measurementGuideImage');
  image.src = `assets/measurement-guides/${guide.image}`;
  image.alt = `Demonstração visual de como medir ${guide.title.toLowerCase()}`;
  document.getElementById('measurementGuidePosition').textContent = guide.position;
  document.getElementById('measurementGuideTip').textContent = guide.tip;
  document.getElementById('measurementGuideSteps').innerHTML = guide.steps.map(step => `<li>${step}</li>`).join('');
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeMeasurementGuide() {
  const modal = document.getElementById('measurementGuideModal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

const EVALUATION_DB_COLUMNS = {
  evaluation_date: "data_avaliacao",
  weight_kg: "peso_kg",
  height_cm: "altura_cm",
  body_fat_pct: "gordura_percentual",
  muscle_mass_kg: "massa_muscular_kg",
  responsible: "responsavel",
  method: "metodo_avaliacao",
  observations: "observacoes",
  waist_cm: "cintura_cm",
  abdomen_cm: "abdomen_cm",
  hip_cm: "quadril_cm",
  chest_cm: "peitoral_cm",
  right_arm_cm: "braco_direito_cm",
  left_arm_cm: "braco_esquerdo_cm",
  right_thigh_cm: "coxa_direita_cm",
  left_thigh_cm: "coxa_esquerda_cm",
  right_calf_cm: "panturrilha_direita_cm",
  left_calf_cm: "panturrilha_esquerda_cm"
};

function mapEvaluationFromDatabase(row) {
  const mapped = { ...row };
  Object.entries(EVALUATION_DB_COLUMNS).forEach(([appKey, dbKey]) => {
    mapped[appKey] = row[dbKey] ?? null;
  });
  return mapped;
}

function mapEvaluationToDatabase(payload) {
  const mapped = {};
  Object.entries(payload).forEach(([appKey, value]) => {
    const dbKey = EVALUATION_DB_COLUMNS[appKey] || appKey;
    mapped[dbKey] = value;
  });
  return mapped;
}

function evaluationNumber(id) {
  const el = document.getElementById(id);
  if (!el || el.value.trim() === "") return null;
  const value = Number(String(el.value).replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function setEvaluationField(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value === null || value === undefined ? "" : value;
}

function startPhysicalEvaluation() {
  state.editingEvaluationId = null;
  state.evaluationStep = 1;
  clearPhysicalEvaluationForm();
  const date = document.getElementById("evalDate");
  if (date) date.value = new Date().toISOString().slice(0, 10);
  document.getElementById("physicalEvaluationWizard")?.classList.remove("hidden");
  showEvaluationStep(1);
  document.getElementById("physicalEvaluationWizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelPhysicalEvaluation() {
  document.getElementById("physicalEvaluationWizard")?.classList.add("hidden");
  state.editingEvaluationId = null;
}

function clearPhysicalEvaluationForm() {
  ["evalDate","evalResponsible","evalPeso","evalAltura","evalCintura","evalAbdomen",
   "evalQuadril","evalPeitoral","evalBracoD","evalBracoE","evalCoxaD","evalCoxaE",
   "evalPanturrilhaD","evalPanturrilhaE","evalGordura","evalMassa","evalMetodo","evalObs"]
    .forEach(id => setEvaluationField(id, ""));
  updateEvaluationBMI();
}

function showEvaluationStep(step) {
  state.evaluationStep = Math.max(1, Math.min(5, step));
  document.querySelectorAll(".eval-step").forEach((el, index) => {
    el.classList.toggle("hidden", index + 1 !== state.evaluationStep);
  });
  const meta = EVALUATION_STEPS[state.evaluationStep - 1];
  document.getElementById("evalStepEyebrow").textContent = meta.eyebrow;
  document.getElementById("evalStepTitle").textContent = meta.title;
  document.getElementById("evalStepProgress").style.width = `${state.evaluationStep * 20}%`;
  document.getElementById("evalBackBtn").classList.toggle("hidden", state.evaluationStep === 1);
  document.getElementById("evalNextBtn").classList.toggle("hidden", state.evaluationStep === 5);
  document.getElementById("evalSaveBtn").classList.toggle("hidden", state.evaluationStep !== 5);
  if (state.evaluationStep === 5) updateEvaluationReview();
}

function changeEvaluationStep(direction) {
  const next = state.evaluationStep + direction;
  if (next < 1 || next > 5) return;
  if (next === 2 && !document.getElementById("evalDate").value) {
    document.getElementById("evalDate").value = new Date().toISOString().slice(0, 10);
  }
  showEvaluationStep(next);
}

function updateEvaluationBMI() {
  const weight = evaluationNumber("evalPeso");
  const height = evaluationNumber("evalAltura");
  const value = document.getElementById("evalBMIValue");
  const status = document.getElementById("evalBMIStatus");
  if (!value || !status) return;
  if (!weight || !height || height <= 0) {
    value.textContent = "--";
    status.textContent = "Informe peso e altura";
    return;
  }
  const bmi = weight / Math.pow(height / 100, 2);
  value.textContent = bmi.toFixed(1).replace(".", ",");
  status.textContent = bmi < 18.5 ? "Abaixo da faixa de referência" :
    bmi < 25 ? "Faixa de referência para adultos" :
    bmi < 30 ? "Acima da faixa de referência" : "Faixa elevada — requer avaliação";
}

function updateEvaluationReview() {
  const summary = document.getElementById("evalReviewSummary");
  if (!summary) return;
  const weight = evaluationNumber("evalPeso");
  const height = evaluationNumber("evalAltura");
  const bmi = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1).replace(".", ",") : "--";
  const filled = Object.values(EVALUATION_FIELDS).filter(id => evaluationNumber(id) !== null).length;
  summary.innerHTML = `
    <p class="font-bold text-white mb-2">RESUMO DA AVALIAÇÃO</p>
    <p>Data: ${escapeEvaluationText(document.getElementById("evalDate").value || "Não informada")}</p>
    <p>Peso: ${weight ?? "--"} kg · Altura: ${height ?? "--"} cm · IMC: ${bmi}</p>
    <p>Gordura: ${evaluationNumber("evalGordura") ?? "--"}% · Massa muscular: ${evaluationNumber("evalMassa") ?? "--"} kg</p>
    <p>Campos numéricos preenchidos: ${filled}</p>`;
}

function escapeEvaluationText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

function editPhysicalEvaluation(id) {
  const item = state.evaluations.find(ev => String(ev.id) === String(id));
  if (!item) return;
  state.editingEvaluationId = item.id;
  clearPhysicalEvaluationForm();
  setEvaluationField("evalDate", item.evaluation_date || (item.created_at || "").slice(0,10));
  setEvaluationField("evalResponsible", item.responsible || "");
  Object.entries(EVALUATION_FIELDS).forEach(([column, fieldId]) => setEvaluationField(fieldId, item[column]));
  setEvaluationField("evalMetodo", item.method || "");
  setEvaluationField("evalObs", item.observations || "");
  updateEvaluationBMI();
  document.getElementById("physicalEvaluationWizard")?.classList.remove("hidden");
  showEvaluationStep(1);
  document.getElementById("physicalEvaluationWizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function savePhysicalEvaluation() {
  if (!supabaseClient || !state.user) {
    FORJA.notify("Faça login para salvar sua avaliação.");
    return;
  }
  // Monta primeiro o objeto lógico da interface e depois converte para os nomes
  // reais das colunas existentes no Supabase.
  const appPayload = {
    user_id: state.user.id,
    evaluation_date: document.getElementById("evalDate").value || new Date().toISOString().slice(0,10),
    responsible: document.getElementById("evalResponsible").value.trim() || null,
    method: document.getElementById("evalMetodo").value || null,
    observations: document.getElementById("evalObs").value.trim() || null
  };
  Object.entries(EVALUATION_FIELDS).forEach(([key, fieldId]) => appPayload[key] = evaluationNumber(fieldId));

  const hasData = Object.entries(appPayload).some(([key, value]) =>
    !["user_id","evaluation_date","responsible","method","observations"].includes(key) && value !== null
  ) || !!appPayload.observations;
  if (!hasData) {
    FORJA.notify("Informe pelo menos um dado corporal antes de salvar.");
    showEvaluationStep(2);
    return;
  }

  const payload = mapEvaluationToDatabase(appPayload);
  const saveButton = document.getElementById("evalSaveBtn");
  saveButton.disabled = true;
  saveButton.textContent = "SALVANDO...";
  try {
    let result;
    if (state.editingEvaluationId) {
      result = await supabaseClient.from("avaliacoes_fisicas")
        .update(payload).eq("id", state.editingEvaluationId).eq("user_id", state.user.id);
    } else {
      result = await supabaseClient.from("avaliacoes_fisicas").insert(payload);
    }
    if (result.error) throw result.error;
    await fetchEvaluations();
    renderPhysicalEvaluations();
    cancelPhysicalEvaluation();
    FORJA.notify("Avaliação salva com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar avaliação física:", error);
    const detail = [
      error?.message ? `Mensagem: ${error.message}` : null,
      error?.code ? `Código: ${error.code}` : null,
      error?.details ? `Detalhes: ${error.details}` : null,
      error?.hint ? `Sugestão: ${error.hint}` : null
    ].filter(Boolean).join("\\n") || "Erro desconhecido retornado pelo Supabase.";
    FORJA.notify(`Não foi possível salvar a avaliação.\\n\\n${detail}`);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "SALVAR AVALIAÇÃO";
  }
}

async function deletePhysicalEvaluation(id) {
  if (!(await FORJA.confirm("Deseja excluir esta avaliação? Esta ação não poderá ser desfeita.", { title: "Excluir avaliação", confirmText: "EXCLUIR" }))) return;
  try {
    const { error } = await supabaseClient.from("avaliacoes_fisicas")
      .delete().eq("id", id).eq("user_id", state.user.id);
    if (error) throw error;
    await fetchEvaluations();
    renderPhysicalEvaluations();
  } catch (error) {
    console.error("Erro ao excluir avaliação:", error);
    FORJA.notify("Não foi possível excluir a avaliação.");
  }
}

function formatEvaluationDate(dateValue) {
  if (!dateValue) return "Data não informada";
  const date = new Date(`${dateValue.slice(0,10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleDateString("pt-BR");
}

function renderPhysicalEvaluations() {
  const items = [...(state.evaluations || [])].sort((a,b) =>
    String(b.evaluation_date || b.created_at || "").localeCompare(String(a.evaluation_date || a.created_at || ""))
  );
  const latest = items[0];
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText("evalTotalCount", items.length);
  setText("evalCurrentWeight", latest?.weight_kg != null ? Number(latest.weight_kg).toLocaleString("pt-BR",{maximumFractionDigits:1}) : "--");
  setText("evalCurrentFat", latest?.body_fat_pct != null ? Number(latest.body_fat_pct).toLocaleString("pt-BR",{maximumFractionDigits:1}) : "--");
  setText("evalLastDate", latest ? `Última: ${formatEvaluationDate(latest.evaluation_date || latest.created_at)}` : "Ainda sem registros");
  setText("evalHistoryCount", `${items.length} ${items.length === 1 ? "registro" : "registros"}`);

  const history = document.getElementById("evaluationsHistoryList");
  if (history) {
    if (!items.length) {
      history.innerHTML = '<p class="py-4 text-center text-xs text-slate-500">Nenhuma avaliação registrada. Sua primeira avaliação aparecerá aqui.</p>';
    } else {
      history.innerHTML = items.map(item => `
        <article class="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div><p class="text-xs font-bold text-white">${formatEvaluationDate(item.evaluation_date || item.created_at)}</p>
            <p class="text-[10px] text-slate-500">${escapeEvaluationText(item.method || "Método não informado")}</p></div>
            <span class="rounded-md bg-brand-lime/10 px-2 py-1 text-[9px] font-mono text-brand-lime">${item.weight_kg != null ? `${Number(item.weight_kg).toLocaleString("pt-BR")} kg` : "Sem peso"}</span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-[10px]">
            <div><span class="text-slate-500 block">Gordura</span><strong class="text-slate-200">${item.body_fat_pct != null ? `${item.body_fat_pct}%` : "--"}</strong></div>
            <div><span class="text-slate-500 block">Músculo</span><strong class="text-slate-200">${item.muscle_mass_kg != null ? `${item.muscle_mass_kg} kg` : "--"}</strong></div>
            <div><span class="text-slate-500 block">Cintura</span><strong class="text-slate-200">${item.waist_cm != null ? `${item.waist_cm} cm` : "--"}</strong></div>
          </div>
          <div class="flex gap-2 pt-1">
            <button type="button" onclick="editPhysicalEvaluation('${String(item.id).replace(/'/g,"")}')" class="flex-1 rounded-lg border border-slate-700 py-2 text-[10px] font-mono text-slate-300">EDITAR</button>
            <button type="button" onclick="deletePhysicalEvaluation('${String(item.id).replace(/'/g,"")}')" class="rounded-lg border border-red-900/60 px-3 py-2 text-[10px] font-mono text-red-400">EXCLUIR</button>
          </div>
        </article>`).join("");
    }
  }

  const empty = document.getElementById("evalEvolutionEmpty");
  const content = document.getElementById("evalEvolutionContent");
  if (empty && content) {
    empty.classList.toggle("hidden", items.length > 0);
    content.classList.toggle("hidden", items.length === 0);
  }
  if (items.length) {
    const oldest = items[items.length - 1];
    const delta = (newValue, oldValue, unit) => newValue == null || oldValue == null ? "--" :
      `${Number(newValue-oldValue)>0?"+":""}${Number(newValue-oldValue).toLocaleString("pt-BR",{maximumFractionDigits:1})} ${unit}`;
    setText("evalWeightDelta", delta(latest.weight_kg, oldest.weight_kg, "kg"));
    setText("evalWaistDelta", delta(latest.waist_cm, oldest.waist_cm, "cm"));
    const trend = document.getElementById("evalTrendList");
    if (trend) {
      const metrics = [
        ["Peso", "weight_kg", "kg"], ["Gordura corporal", "body_fat_pct", "%"],
        ["Massa muscular", "muscle_mass_kg", "kg"], ["Cintura", "waist_cm", "cm"]
      ];
      trend.innerHTML = metrics.map(([label,key,unit]) => {
        const values = items.filter(x => x[key] != null).slice(0,6).reverse();
        if (!values.length) return "";
        const max = Math.max(...values.map(x => Number(x[key])), 1);
        return `<div class="rounded-lg bg-slate-900/60 p-2"><div class="mb-2 flex justify-between text-[10px]"><span class="text-slate-400">${label}</span><strong class="text-white">${values[values.length-1][key]} ${unit}</strong></div><div class="flex h-10 items-end gap-1">${values.map(x => `<div title="${formatEvaluationDate(x.evaluation_date || x.created_at)}: ${x[key]} ${unit}" class="flex-1 rounded-t bg-brand-lime/70" style="height:${Math.max(12,Number(x[key])/max*100)}%"></div>`).join("")}</div></div>`;
      }).join("");
    }
  }
}
