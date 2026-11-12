// js/gamification.js - Módulo de Gamificação, XP, Patentes e Streak da FORJA

/* -------------------------------------------------------------
   1. SISTEMA DE XP E PATENTES
-------------------------------------------------------------- */
function addXP(amount, reason = "") {
  if (typeof state === 'undefined') return;

  state.xp = (state.xp || 0) + amount;
  updateGamificationLevel();

  if (reason) {
    console.log(`[FORJA XP] +${amount} XP (${reason}). Total: ${state.xp} XP | Patente: ${state.patente}`);
  }
}

function updateGamificationLevel() {
  const xp = state.xp || 0;

  if (xp < 500) {
    state.level = 1;
    state.patente = 'Ferro Bruto';
    state.nextLevelXP = 500;
  } else if (xp < 1500) {
    state.level = 4;
    state.patente = 'Ferro Forjado';
    state.nextLevelXP = 1500;
  } else if (xp < 3500) {
    state.level = 8;
    state.patente = 'Aço Temperado';
    state.nextLevelXP = 3500;
  } else if (xp < 7000) {
    state.level = 13;
    state.patente = 'Liga Titânio';
    state.nextLevelXP = 7000;
  } else {
    state.level = 19;
    state.patente = 'Mestre Forjador';
    state.nextLevelXP = 10000;
  }
}

/* -------------------------------------------------------------
   2. CÁLCULO DE STREAK (SEQUÊNCIA FLEXÍVEL DE DIAS)
-------------------------------------------------------------- */
function calculateStreak() {
  if (!state.workouts || state.workouts.length === 0) return 0;

  // Extrai datas únicas ordenadas da mais recente para a mais antiga
  const workoutDates = [...new Set(state.workouts.map(w => w.date))]
    .sort((a, b) => new Date(b) - new Date(a));

  if (workoutDates.length === 0) return 0;

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkoutStr = workoutDates[0];
  const lastWorkoutDate = new Date(lastWorkoutStr + 'T00:00:00');
  
  const diffDays = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    return 0; // Streak quebrado (passou mais de 1 dia sem treinar)
  }

  let expectedDate = new Date(lastWorkoutDate);
  
  for (let i = 0; i < workoutDates.length; i++) {
    const currDateStr = workoutDates[i];
    const currDate = new Date(currDateStr + 'T00:00:00');
    
    const diff = Math.floor((expectedDate - currDate) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (diff < 0) {
      continue; // Ignora múltiplos treinos no mesmo dia
    } else {
      break;
    }
  }

  return streak;
}

/* -------------------------------------------------------------
   3. RENDERIZAÇÃO VISUAL DO CARD DE GAMIFICAÇÃO
-------------------------------------------------------------- */
function renderGamificationCard() {
  const container = document.getElementById("gamificationCardContainer");
  if (!container) return;

  updateGamificationLevel();

  const currentXP = state.xp || 0;
  const targetXP = state.nextLevelXP || 500;
  const percentage = Math.min(Math.round((currentXP / targetXP) * 100), 100);
  const currentStreak = calculateStreak();

  container.innerHTML = `
    <div class="bg-[#111620] p-4 rounded-2xl tactical-border space-y-3 relative overflow-hidden">
      <div class="flex justify-between items-center">
        <div>
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">PATENTE ATUAL</span>
          <h3 class="text-base font-display font-bold text-brand-lime flex items-center gap-1.5">
            🛡️ ${state.patente} <span class="text-xs text-slate-400 font-mono">(Nível ${state.level})</span>
          </h3>
        </div>
        <div class="text-right">
          <span class="text-xs font-mono font-bold text-white">${currentXP} / ${targetXP}</span>
          <span class="text-[10px] text-brand-lime font-mono block">XP ACUMULADO</span>
        </div>
      </div>

      <!-- Barra de Progresso de XP -->
      <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
        <div class="bg-brand-lime h-full rounded-full transition-all duration-500 shadow-lg glow-lime" style="width: ${percentage}%"></div>
      </div>

      <div class="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
        <span>🔥 Streak: ${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}</span>
        <span>${percentage}% para o próximo nível</span>
      </div>
    </div>
  `;
}