/**
 * Nexus ERP Lab • SD Practice Environment
 * Modelos de Domínio da Jornada, Tentativas e Competências
 * Módulo: js/core/models/journey.js
 * 
 * Define constantes e fábricas para entidades de progressão do usuário,
 * desacoplando a carreira operacional do acúmulo de XP.
 */

export const PhaseId = Object.freeze({
  TRAINEE: 'TRAINEE',
  ANALISTA_JUNIOR_SD: 'ANALISTA_JUNIOR_SD',
  ANALISTA_PLENO_SD: 'ANALISTA_PLENO_SD',
  AVANCADO_SD: 'AVANCADO_SD'
});

export const PhaseLabels = Object.freeze({
  [PhaseId.TRAINEE]: 'Trainee SD',
  [PhaseId.ANALISTA_JUNIOR_SD]: 'Analista SAP SD Júnior',
  [PhaseId.ANALISTA_PLENO_SD]: 'Analista SAP SD Pleno',
  [PhaseId.AVANCADO_SD]: 'Níveis Avançados / Futuros'
});

export const JourneyState = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DIAGNOSTIC_PENDING: 'DIAGNOSTIC_PENDING',
  COMPLETED: 'COMPLETED'
});

export const AttemptOutcome = Object.freeze({
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  ABANDONED: 'ABANDONED'
});

export const CompetencyId = Object.freeze({
  MASTER_DATA: 'MASTER_DATA',
  ORDER_MGMT: 'ORDER_MGMT',
  PRICING: 'PRICING',
  ATP: 'ATP',
  CREDIT: 'CREDIT',
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING'
});

export const EntitlementStatus = Object.freeze({
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
});

/**
 * Cria a estrutura de Jornada do Usuário para uma fase específica.
 * @param {string} userId
 * @param {string} phaseId
 * @returns {object}
 */
export function createUserJourney(userId = 'trainee_default', phaseId = PhaseId.TRAINEE) {
  const now = new Date().toISOString();
  return {
    userId,
    currentPhaseId: phaseId,
    state: JourneyState.IN_PROGRESS,
    completedScenarioIds: [],
    totalPhaseXp: 0,
    startedAt: now,
    lastActiveAt: now,
    completedAt: null,
    diagnosticStatus: 'NOT_STARTED' // 'NOT_STARTED' | 'PENDING' | 'PASSED' | 'REINFORCEMENT_REQUIRED'
  };
}

/**
 * Cria um registro estruturado de tentativa de execução de missão.
 * @param {object} params
 * @returns {object}
 */
export function createMissionAttempt({
  attemptId = null,
  userId = 'trainee_default',
  scenarioId,
  attemptIndex = 1,
  outcome = AttemptOutcome.SUCCESS,
  executionDurationSeconds = 0,
  mistakesLogged = [],
  performanceScore = 100,
  xpGranted = 0,
  executedAt = null
} = {}) {
  const timestamp = executedAt || new Date().toISOString();
  const id = attemptId || `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  return {
    attemptId: id,
    userId,
    scenarioId,
    attemptIndex: Math.max(1, attemptIndex),
    outcome,
    executionDurationSeconds: Math.max(0, Math.round(executionDurationSeconds)),
    mistakesLogged: Array.isArray(mistakesLogged) ? mistakesLogged : [],
    performanceScore: Math.min(100, Math.max(0, Math.round(performanceScore))),
    xpGranted: Math.max(0, xpGranted),
    executedAt: timestamp
  };
}

/**
 * Cria a estrutura de Entitlements (Direitos de Acesso) do usuário.
 * Desacoplado de qualquer provedor de pagamentos.
 * @param {string} userId
 * @returns {object}
 */
export function createDefaultEntitlements(userId = 'trainee_default') {
  const now = new Date().toISOString();
  return {
    userId,
    phases: {
      [PhaseId.TRAINEE]: {
        status: EntitlementStatus.AVAILABLE,
        grantType: 'DEFAULT_FREE',
        unlockedAt: now
      },
      [PhaseId.ANALISTA_JUNIOR_SD]: {
        status: EntitlementStatus.LOCKED,
        grantType: null,
        unlockedAt: null
      },
      [PhaseId.ANALISTA_PLENO_SD]: {
        status: EntitlementStatus.LOCKED,
        grantType: null,
        unlockedAt: null
      },
      [PhaseId.AVANCADO_SD]: {
        status: EntitlementStatus.LOCKED,
        grantType: null,
        unlockedAt: null
      }
    },
    updatedAt: now
  };
}

/**
 * Cria a estrutura de acompanhamento dos 7 pilares de competência operacional.
 * @param {string} userId
 * @returns {object}
 */
export function createDefaultCompetencies(userId = 'trainee_default') {
  const list = Object.values(CompetencyId);
  const map = {};
  list.forEach(cid => {
    map[cid] = {
      competencyId: cid,
      proficiencyScore: 100,
      totalEvaluations: 0,
      successfulEvaluations: 0,
      needsReinforcement: false
    };
  });
  return {
    userId,
    competencies: map,
    updatedAt: new Date().toISOString()
  };
}
