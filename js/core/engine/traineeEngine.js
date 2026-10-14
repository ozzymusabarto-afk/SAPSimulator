/**
 * Nexus ERP Lab • SD Practice Environment
 * Motor de Carreira & Gamificação do Trainee (Trainee Engine)
 * Mentor: Chefe Wilson (Gestor de Operações SD)
 * Módulo: js/core/engine/traineeEngine.js
 * 
 * Arquitetura de Progressão:
 * TRAINEE SD → Formação Prática (50 Missões Oficiais) → Diagnóstico → ANALISTA SAP SD JÚNIOR
 * O XP representa a experiência acumulada da carreira e é estritamente desacoplado da promoção formal.
 */

import { traineeRepository } from '../repository/traineeRepository.js';
import {
  PhaseId,
  PhaseLabels,
  JourneyState,
  AttemptOutcome,
  createMissionAttempt,
  createUserJourney
} from '../models/journey.js';
import { competencyEngine } from './competencyEngine.js';
import { toastService } from '../../utils/toast.js';

export const CareerStages = {
  TRAINEE: {
    id: PhaseId.TRAINEE,
    title: PhaseLabels[PhaseId.TRAINEE],
    level: 1,
    badge: 'TRAINEE',
    description: 'Formação prática de capacitação operacional em processos de Vendas e Distribuição (SD).'
  },
  ANALISTA_JUNIOR_SD: {
    id: PhaseId.ANALISTA_JUNIOR_SD,
    title: PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD],
    level: 2,
    badge: 'JR-SD',
    description: 'Profissional com proficiência operacional comprovada no Order-to-Cash e homologado pelo Chefe Wilson.'
  },
  ANALISTA_PLENO_SD: {
    id: PhaseId.ANALISTA_PLENO_SD,
    title: PhaseLabels[PhaseId.ANALISTA_PLENO_SD],
    level: 3,
    badge: 'PL-SD',
    description: 'Analista habilitado em cenários complexos, tratativas de exceção e governança de processos SD.'
  },
  AVANCADO_SD: {
    id: PhaseId.AVANCADO_SD,
    title: PhaseLabels[PhaseId.AVANCADO_SD],
    level: 4,
    badge: 'SR-SD',
    description: 'Nível avançado em auditoria, conciliação e supervisão de processos operacionais SD.'
  },
  // Aliases para total retrocompatibilidade com código existente
  TRAINEE_SD: {
    id: PhaseId.TRAINEE,
    title: PhaseLabels[PhaseId.TRAINEE],
    level: 1,
    badge: 'TRAINEE',
    description: 'Formação prática de capacitação operacional em processos de Vendas e Distribuição (SD).'
  },
  JR_SD: {
    id: PhaseId.ANALISTA_JUNIOR_SD,
    title: PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD],
    level: 2,
    badge: 'JR-SD',
    description: 'Profissional com proficiência operacional comprovada no Order-to-Cash e homologado pelo Chefe Wilson.'
  }
};

export const AvailableBadges = [
  { id: 'first_order', title: 'Primeira Ordem Emitida', icon: 'fileText', desc: 'Criou sua primeira ordem de venda padrão com sucesso no simulador.' },
  { id: 'pricing_master', title: 'Mestre do Esquema de Cálculo', icon: 'dollarSign', desc: 'Identificou ausência de condição PR00 e corrigiu o preço perfeitamente.' },
  { id: 'credit_guardian', title: 'Guardião do Crédito', icon: 'shieldAlert', desc: 'Tratou um bloqueio de risco na VKM1 sem gerar impacto financeiro.' },
  { id: 'sla_expert', title: 'Especialista em SLA', icon: 'clock', desc: 'Resolveu um chamado crítico no Modo Desafio dentro do tempo estipulado.' },
  { id: 'flawless_trainee', title: 'Acurácia Impecável', icon: 'award', desc: 'Executou processos seguidos sem nenhum erro de preenchimento.' }
];

class TraineeEngine {
  constructor() {
    this.profile = this.loadProfile();
    this.currentScenarioStartTime = Date.now();
    this.currentScenarioAttempts = 0;
    this.listeners = [];
  }

  loadProfile(userId = null) {
    try {
      // F1-D: Se um userId foi fornecido (usuário real autenticado), sincroniza com o repositório
      if (userId && userId !== 'TRAINEE_01' && userId !== 'trainee_default') {
        traineeRepository.setSessionUserId(userId);
      }
      const stored = traineeRepository.getRawProfile();
      if (stored) {
        return this.migrateProfile(stored);
      }
    } catch (e) {
      console.warn('[TraineeEngine] Erro ao carregar perfil via repositório:', e);
    }
    const def = this.createDefaultProfile(userId);
    traineeRepository.saveProfile(def);
    return def;
  }

  /**
   * Recarrega o perfil do usuário autenticado após login.
   * Garante que o engine usa os dados do userId correto, não o perfil padrão dev.
   * @param {string} userId
   */
  reloadForUser(userId) {
    if (!userId) return;
    this.profile = this.loadProfile(userId);
    this.notify();
  }

  createDefaultProfile(userId = null) {
    // P3+P4: usa o userId real do repositório (ou o parâmetro) para garantir seed correta na randomização
    const resolvedUserId = userId || traineeRepository.getCurrentUserId() || 'trainee_default';
    const journey = createUserJourney(resolvedUserId, PhaseId.TRAINEE);

    return {
      name: 'Trainee SAP SD',
      
      // Cargo e Nível de Carreira Atual (Oficial da Trilha Operacional)
      role: PhaseLabels[PhaseId.TRAINEE],
      stageId: PhaseId.TRAINEE,
      level: 1,

      // Separação de Experiência: Histórico da Carreira vs Ciclo Atual
      xp: 0,                 // XP Total para compatibilidade de visualização
      totalCareerXp: 0,      // XP acumulado vitalício em toda a carreira
      currentCycleXp: 0,     // XP conquistado no ciclo de treinamento ativo

      // Jornada do Usuário (Estrutura formal desacoplada de XP)
      journey,

      // Ciclo de Treinamento e Formação Atual (Preservado para compatibilidade retroativa)
      currentCycle: {
        id: 1,
        name: 'Ciclo 1: Formação Prática Trainee SD',
        status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'COMPLETED' | 'CONSOLIDATION_PENDING' | 'APPROVED'
        totalMissionsRequired: 50,
        completedMissionsCount: 0
      },

      // Status da Etapa de Diagnóstico / Consolidação
      consolidation: {
        status: 'NOT_STARTED', // 'NOT_STARTED' | 'AVAILABLE' | 'IN_PROGRESS' | 'PASSED' | 'FAILED'
        attempts: 0,
        lastScore: null,
        approvedAt: null
      },

      // Histórico de Ciclos Anteriores
      completedCycles: [],

      // Métricas Operacionais
      accuracy: 100,
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      slaSuccessCount: 0,
      slaTotalChallenges: 0,

      // Missões Concluídas no Ciclo Atual
      activeScenarioId: 'SCN-01',
      completedScenarios: [],
      completedTasksLog: [],
      badges: [],
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Início de Formação',
          description: 'Trainee conectado ao Nexus ERP Lab. Orientação do Chefe Wilson ativa.',
          status: 'INFO'
        }
      ]
    };
  }

  migrateProfile(old) {
    const base = this.createDefaultProfile();
    const completedScenarios = Array.isArray(old.completedScenarios) ? old.completedScenarios : [];

    // Constrói ou preserva a entidade UserJourney
    let journey = old.journey;
    if (!journey || typeof journey !== 'object') {
      const initialPhase = (old.stageId === 'JR_SD' || old.stageId === PhaseId.ANALISTA_JUNIOR_SD)
        ? PhaseId.ANALISTA_JUNIOR_SD
        : PhaseId.TRAINEE;

      journey = createUserJourney('trainee_default', initialPhase);
      journey.completedScenarioIds = [...completedScenarios];
      journey.totalPhaseXp = old.currentCycleXp || old.xp || 0;
      if (completedScenarios.length >= 50) {
        journey.state = JourneyState.DIAGNOSTIC_PENDING;
      }
    } else {
      // Sincroniza missões concluídas garantindo consistência bidirecional
      journey.completedScenarioIds = Array.from(new Set([
        ...(journey.completedScenarioIds || []),
        ...completedScenarios
      ]));
    }

    // Normalização dos títulos e fases para a nomenclatura oficial
    let role = old.role;
    let stageId = old.stageId;
    if (stageId === 'JR_SD' || stageId === PhaseId.ANALISTA_JUNIOR_SD) {
      stageId = PhaseId.ANALISTA_JUNIOR_SD;
      role = PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD];
    } else if (stageId === 'TRAINEE_SD' || !stageId) {
      stageId = PhaseId.TRAINEE;
      role = PhaseLabels[PhaseId.TRAINEE];
    }

    return {
      ...base,
      ...old,
      role,
      stageId,
      journey,
      completedScenarios: journey.completedScenarioIds,
      currentCycle: {
        ...(base.currentCycle),
        ...(old.currentCycle || {}),
        completedMissionsCount: journey.completedScenarioIds.length
      },
      auditLog: old.auditLog || base.auditLog
    };
  }

  saveProfile() {
    // Sincroniza estado de journey antes de persistir
    if (this.profile && this.profile.journey) {
      this.profile.journey.completedScenarioIds = [...(this.profile.completedScenarios || [])];
      this.profile.journey.totalPhaseXp = this.profile.currentCycleXp || 0;
      this.profile.journey.lastActiveAt = new Date().toISOString();

      // Se concluiu todas as 50 missões e ainda está IN_PROGRESS, passa para DIAGNOSTIC_PENDING
      if (
        this.profile.journey.currentPhaseId === PhaseId.TRAINEE &&
        this.profile.completedScenarios.length >= 50 &&
        this.profile.journey.state === JourneyState.IN_PROGRESS
      ) {
        this.profile.journey.state = JourneyState.DIAGNOSTIC_PENDING;
      }
    }

    traineeRepository.saveProfile(this.profile);
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.profile);
      } catch (e) {
        console.error('[TraineeEngine] Erro no listener:', e);
      }
    });
  }

  setActiveScenarioId(scenarioId) {
    if (scenarioId && this.profile.activeScenarioId !== scenarioId) {
      this.profile.activeScenarioId = scenarioId;
      this.saveProfile();
    }
  }

  getActiveScenarioId() {
    return this.profile.activeScenarioId || null;
  }

  getCompletedScenarios() {
    return this.profile.completedScenarios || [];
  }

  isScenarioCompleted(scenarioId) {
    return (this.profile.completedScenarios || []).includes(scenarioId);
  }

  startScenarioSession() {
    this.currentScenarioStartTime = Date.now();
    this.currentScenarioAttempts = 0;
  }

  registerAttempt() {
    this.currentScenarioAttempts++;
  }

  /**
   * Registra uma tentativa de missão estruturada (MissionAttempt).
   * Persiste no repositório de histórico analítico.
   * @param {object} params
   * @returns {object}
   */
  recordAttempt({
    scenarioId,
    outcome = AttemptOutcome.SUCCESS,
    executionDurationSeconds = null,
    mistakesLogged = [],
    performanceScore = 100,
    xpGranted = 0
  }) {
    if (!scenarioId) return null;

    const duration = executionDurationSeconds !== null
      ? executionDurationSeconds
      : Math.max(1, Math.round((Date.now() - this.currentScenarioStartTime) / 1000));

    const attemptCount = traineeRepository.getAttemptCount(scenarioId);
    const attempt = createMissionAttempt({
      userId: this.profile.journey?.userId || 'trainee_default',
      scenarioId,
      attemptIndex: attemptCount + 1,
      outcome,
      executionDurationSeconds: duration,
      mistakesLogged,
      performanceScore,
      xpGranted,
      executedAt: new Date().toISOString()
    });

    traineeRepository.saveAttempt(attempt);
    return attempt;
  }

  /**
   * Adiciona XP à carreira e ao ciclo atual SOMENTE em acerto oficial.
   * Não duplica XP quando a missão já foi concluída anteriormente (sessão de refazer / prática).
   * O XP não altera o nível de carreira sozinho (promoção depende de requisitos pedagógicos e diagnóstico).
   * @param {number} amount
   * @param {string} reason
   * @param {string|null} targetScenarioId
   */
  addXp(amount, reason = '', targetScenarioId = null) {
    if (!amount || amount <= 0) return false;
    
    // Proteção contra duplicação de XP em missões já concluídas (Refazer / Prática)
    const scenarioId = targetScenarioId || this.profile.activeScenarioId;
    if (scenarioId && this.isScenarioCompleted(scenarioId)) {
      this.logAction('Treino / Prática', `Missão já homologada anteriormente (+0 XP): ${reason}`, 'INFO');
      return false;
    }

    this.profile.xp += amount;
    this.profile.totalCareerXp += amount;
    this.profile.currentCycleXp += amount;

    this.logAction('Conquista de XP', `+${amount} XP: ${reason}`, 'SUCCESS');
    this.saveProfile();
    return true;
  }

  /**
   * Registra conclusão de ação
   */
  recordAction(isSuccess, actionName, detail = '') {
    this.profile.totalActions++;
    if (isSuccess) {
      this.profile.successfulActions++;
    } else {
      this.profile.failedActions++;
      this.registerAttempt();
    }

    this.profile.accuracy = Math.round(
      (this.profile.successfulActions / Math.max(1, this.profile.totalActions)) * 100
    );

    this.logAction(actionName, detail, isSuccess ? 'SUCCESS' : 'WARN');
    this.saveProfile();
  }

  recordSla(isWithinSla) {
    this.profile.slaTotalChallenges++;
    if (isWithinSla) this.profile.slaSuccessCount++;
    this.saveProfile();
  }

  unlockBadge(badgeId) {
    if (!this.profile.badges.includes(badgeId)) {
      this.profile.badges.push(badgeId);
      const badge = AvailableBadges.find(b => b.id === badgeId);
      this.logAction('Insígnia Conquistada', `Recebeu a insígnia: ${badge ? badge.title : badgeId}`, 'SUCCESS');
      this.saveProfile();
      if (badge && typeof toastService !== 'undefined') {
        toastService.showBadge(badge);
      }
      return true;
    }
    return false;
  }

  /**
   * Registra tarefa/cenário concluído no ciclo atual
   */
  completeScenario(scenarioId, scenarioTitle, correctAnswerSummary, xpEarned) {
    const isRedo = this.isScenarioCompleted(scenarioId);
    if (!isRedo) {
      this.profile.completedScenarios.push(scenarioId);
      if (this.profile.journey) {
        this.profile.journey.completedScenarioIds = [...this.profile.completedScenarios];
      }
      this.profile.currentCycle.completedMissionsCount = this.profile.completedScenarios.length;
    }

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - this.currentScenarioStartTime) / 1000));
    const attempts = Math.max(1, this.currentScenarioAttempts + 1);

    this.profile.completedTasksLog.unshift({
      scenarioId,
      scenarioTitle,
      correctAnswerSummary,
      xpEarned: isRedo ? 0 : xpEarned,
      timeSpentSeconds,
      attempts,
      completedAt: new Date().toLocaleTimeString('pt-BR')
    });

    if (this.profile.completedTasksLog.length > 100) {
      this.profile.completedTasksLog.pop();
    }

    // Registra tentativa oficial com desfecho SUCCESS
    this.recordAttempt({
      scenarioId,
      outcome: AttemptOutcome.SUCCESS,
      executionDurationSeconds: timeSpentSeconds,
      mistakesLogged: [],
      performanceScore: Math.max(50, Math.round(100 - (this.currentScenarioAttempts * 10))),
      xpGranted: isRedo ? 0 : xpEarned
    });

    // Limpa estado de missão ativa no repositório de retomada
    traineeRepository.clearActiveScenarioState();

    this.saveProfile();
  }

  /**
   * Estrutura preparada para promoção futura para Analista SAP SD Júnior
   * (Acionada quando os requisitos da fase Trainee forem homologados no Diagnóstico)
   */
  promoteToJunior(diagnosticScore = 100) {
    this.profile.role = PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD];
    this.profile.stageId = PhaseId.ANALISTA_JUNIOR_SD;
    this.profile.level = 2;
    this.profile.currentCycle.status = 'APPROVED';
    this.profile.consolidation.status = 'PASSED';
    this.profile.consolidation.approvedAt = new Date().toLocaleDateString('pt-BR');
    this.profile.consolidation.lastScore = diagnosticScore;

    if (this.profile.journey) {
      this.profile.journey.currentPhaseId = PhaseId.ANALISTA_JUNIOR_SD;
      this.profile.journey.state = JourneyState.IN_PROGRESS;
      this.profile.journey.diagnosticStatus = 'PASSED';
    }

    this.logAction(
      'Promoção de Carreira',
      `Trainee aprovado na avaliação diagnóstica com nota ${diagnosticScore}% e promovido a ${PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD]}!`,
      'SUCCESS'
    );
    this.saveProfile();
  }

  /**
   * Estrutura preparada para iniciar novos ciclos no futuro sem apagar o XP histórico
   */
  startNewTrainingCycle(newCycleId = 2, newCycleName = 'Ciclo 2: Novos Desafios e Cenários Avançados') {
    this.profile.completedCycles.push({
      cycleId: this.profile.currentCycle.id,
      cycleName: this.profile.currentCycle.name,
      completedAt: new Date().toLocaleDateString('pt-BR'),
      totalMissionsCompleted: this.profile.completedScenarios.length,
      cycleXpGained: this.profile.currentCycleXp,
      roleAtCompletion: this.profile.role
    });

    this.profile.currentCycle = {
      id: newCycleId,
      name: newCycleName,
      status: 'IN_PROGRESS',
      totalMissionsRequired: 50,
      completedMissionsCount: 0
    };

    this.profile.currentCycleXp = 0;
    this.profile.completedScenarios = [];
    this.profile.consolidation = {
      status: 'NOT_STARTED',
      attempts: 0,
      lastScore: null,
      approvedAt: null
    };

    this.logAction('Novo Ciclo Iniciado', `Iniciado ${newCycleName}. O XP histórico da carreira foi preservado.`, 'INFO');
    this.saveProfile();
  }

  logAction(action, description, status = 'INFO') {
    this.profile.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action,
      description,
      status
    });

    if (this.profile.auditLog.length > 50) {
      this.profile.auditLog.pop();
    }
  }

  getProfile() {
    return this.profile;
  }

  getCurrentLevelInfo() {
    const isTrainee = this.profile.stageId === PhaseId.TRAINEE;
    const nextTitle = isTrainee
      ? PhaseLabels[PhaseId.ANALISTA_JUNIOR_SD]
      : PhaseLabels[PhaseId.ANALISTA_PLENO_SD];

    return {
      level: this.profile.level,
      title: this.profile.role,
      stageId: this.profile.stageId,
      currentCycleId: this.profile.currentCycle.id,
      cycleName: this.profile.currentCycle.name,
      trainingStatus: this.profile.currentCycle.status,
      consolidationStatus: this.profile.consolidation.status,
      totalCareerXp: this.profile.totalCareerXp,
      currentCycleXp: this.profile.currentCycleXp,
      nextLevelTitle: nextTitle,
      nextMinXp: 1000,
      progressPercent: Math.min(100, Math.round((this.profile.completedScenarios.length / Math.max(1, this.profile.currentCycle.totalMissionsRequired || 50)) * 100))
    };
  }

  /**
   * Retorna a matriz consolidada dos 7 pilares de competência operacional.
   */
  getCompetencyMatrix() {
    return competencyEngine.consolidateCompetencies(this.profile.journey?.userId || 'trainee_default');
  }

  /**
   * Executa o Diagnóstico Estruturado do Chefe Wilson.
   * Não promove automaticamente o aluno.
   */
  runDiagnosticEvaluation() {
    const evaluation = competencyEngine.generateDiagnosticEvaluation(this.profile.journey?.userId || 'trainee_default');
    if (this.profile && this.profile.journey) {
      this.profile.journey.diagnosticStatus = evaluation.overallStatus;
      this.profile.journey.lastActiveAt = evaluation.evaluatedAt;
      this.saveProfile();
    } else {
      this.notify();
    }
    return evaluation;
  }

  /**
   * Recupera a última avaliação diagnóstica registrada para o usuário.
   */
  getLatestDiagnostic() {
    return traineeRepository.getDiagnosticEvaluation(this.profile.journey?.userId || 'trainee_default');
  }

  resetProfile() {
    // P3+P4: Preserva o userId real do usuário atual no perfil padrão após reset.
    // Evita que a seed de randomização fique como 'trainee_default' para usuários autenticados.
    const currentUserId = traineeRepository.getCurrentUserId();
    const def = this.createDefaultProfile(currentUserId);
    this.profile = def;
    traineeRepository.saveProfile(def);
    traineeRepository.clearActiveScenarioState();
    this.notify();
  }
}

export const trainee = new TraineeEngine();
