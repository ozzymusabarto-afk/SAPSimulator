/**
 * NexusTech ERP • Motor de Carreira & Gamificação do Trainee (Trainee Engine)
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 * 
 * Arquitetura de Progressão:
 * TRAINEE SD → Formação Prática (70 Missões) → Consolidação de Domínio → JR SD
 * O XP representa a experiência acumulada da carreira e é desacoplado da promoção formal.
 */

const STORAGE_KEY = 'nexustech_trainee_profile_v3';

export const CareerStages = {
  TRAINEE_SD: {
    id: 'TRAINEE_SD',
    title: 'Trainee SD',
    level: 1,
    badge: 'TRAINEE',
    description: 'Formação prática de capacitação em processos de Vendas e Distribuição (SD).'
  },
  JR_SD: {
    id: 'JR_SD',
    title: 'Consultor Júnior SD',
    level: 2,
    badge: 'JR-SD',
    description: 'Profissional aprovado na formação prática de 70 missões e na etapa de consolidação de domínio.'
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

  loadProfile() {
    try {
      // Tenta carregar v3 ou migrar de versões anteriores
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) return JSON.parse(savedV3);

      const savedV2 = localStorage.getItem('nexustech_trainee_profile_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        return this.migrateProfile(parsed);
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil do localStorage', e);
    }

    return this.createDefaultProfile();
  }

  createDefaultProfile() {
    return {
      name: 'Trainee SAP SD',
      
      // Cargo e Nível de Carreira Atual
      role: 'Trainee SD',
      stageId: 'TRAINEE_SD',
      level: 1,

      // Separação de Experiência: Histórico da Carreira vs Ciclo Atual
      xp: 0,                 // XP Total para compatibilidade de visualização
      totalCareerXp: 0,      // XP acumulado vitalício em toda a carreira
      currentCycleXp: 0,     // XP conquistado no ciclo de treinamento ativo

      // Ciclo de Treinamento e Formação Atual
      currentCycle: {
        id: 1,
        name: 'Ciclo 1: Formação Prática Trainee SD',
        status: 'IN_PROGRESS', // 'IN_PROGRESS' | 'COMPLETED' | 'CONSOLIDATION_PENDING' | 'APPROVED'
        totalMissionsRequired: 70, // Meta conceitual da formação
        completedMissionsCount: 0
      },

      // Status da Etapa de Consolidação de Conhecimento
      consolidation: {
        status: 'NOT_STARTED', // 'NOT_STARTED' | 'AVAILABLE' | 'IN_PROGRESS' | 'PASSED' | 'FAILED'
        attempts: 0,
        lastScore: null,
        approvedAt: null
      },

      // Histórico de Ciclos Anteriores (preservado ao reiniciar nova formação)
      completedCycles: [],

      // Métricas Operacionais
      accuracy: 100,
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      slaSuccessCount: 0,
      slaTotalChallenges: 0,

      // Missões Concluídas no Ciclo Atual
      completedScenarios: [],
      completedTasksLog: [],
      badges: [],
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Início de Formação',
          description: 'Trainee conectado ao Ciclo 1 da formação prática SD. Mentor Sr. Wilson online.',
          status: 'INFO'
        }
      ]
    };
  }

  migrateProfile(old) {
    const base = this.createDefaultProfile();
    return {
      ...base,
      name: old.name || base.name,
      xp: old.xp || 0,
      totalCareerXp: old.xp || 0,
      currentCycleXp: old.xp || 0,
      accuracy: old.accuracy !== undefined ? old.accuracy : 100,
      totalActions: old.totalActions || 0,
      successfulActions: old.successfulActions || 0,
      failedActions: old.failedActions || 0,
      slaSuccessCount: old.slaSuccessCount || 0,
      slaTotalChallenges: old.slaTotalChallenges || 0,
      completedScenarios: old.completedScenarios || [],
      completedTasksLog: old.completedTasksLog || [],
      badges: old.badges || [],
      auditLog: old.auditLog || base.auditLog
    };
  }

  saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Erro ao salvar perfil no localStorage', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.profile));
  }

  startScenarioSession() {
    this.currentScenarioStartTime = Date.now();
    this.currentScenarioAttempts = 0;
  }

  registerAttempt() {
    this.currentScenarioAttempts++;
  }

  /**
   * Adiciona XP à carreira e ao ciclo atual SOMENTE em acerto.
   * O XP não altera o nível de carreira sozinho (promoção é por formação + consolidação).
   * @param {number} amount
   * @param {string} reason
   */
  addXp(amount, reason = '') {
    if (!amount || amount <= 0) return false;
    
    this.profile.xp += amount;
    this.profile.totalCareerXp += amount;
    this.profile.currentCycleXp += amount;

    this.logAction('Conquista de XP', `+${amount} XP: ${reason}`, 'SUCCESS');
    this.saveProfile();
    return false;
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
      return true;
    }
    return false;
  }

  /**
   * Registra tarefa/cenário concluído no ciclo atual
   */
  completeScenario(scenarioId, scenarioTitle, correctAnswerSummary, xpEarned) {
    if (!this.profile.completedScenarios.includes(scenarioId)) {
      this.profile.completedScenarios.push(scenarioId);
      this.profile.currentCycle.completedMissionsCount = this.profile.completedScenarios.length;
    }

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - this.currentScenarioStartTime) / 1000));
    const attempts = Math.max(1, this.currentScenarioAttempts + 1);

    this.profile.completedTasksLog.unshift({
      scenarioId,
      scenarioTitle,
      correctAnswerSummary,
      xpEarned,
      timeSpentSeconds,
      attempts,
      completedAt: new Date().toLocaleTimeString('pt-BR')
    });

    if (this.profile.completedTasksLog.length > 25) {
      this.profile.completedTasksLog.pop();
    }

    this.saveProfile();
  }

  /**
   * Estrutura preparada para promoção futura para Consultor Júnior SD
   * (Acionada quando: 1. Formação concluída; 2. Consolidação aprovada)
   */
  promoteToJunior(consolidationScore = 100) {
    this.profile.role = CareerStages.JR_SD.title;
    this.profile.stageId = CareerStages.JR_SD.id;
    this.profile.level = CareerStages.JR_SD.level;
    this.profile.currentCycle.status = 'APPROVED';
    this.profile.consolidation.status = 'PASSED';
    this.profile.consolidation.approvedAt = new Date().toLocaleDateString('pt-BR');
    this.profile.consolidation.lastScore = consolidationScore;

    this.logAction(
      'Promoção de Carreira',
      `Trainee aprovado na consolidação com nota ${consolidationScore}% e promovido a ${CareerStages.JR_SD.title}!`,
      'SUCCESS'
    );
    this.saveProfile();
  }

  /**
   * Estrutura preparada para iniciar novos ciclos no futuro sem apagar o XP histórico
   */
  startNewTrainingCycle(newCycleId = 2, newCycleName = 'Ciclo 2: Novos Desafios e Cenários Avançados') {
    // Arquiva o ciclo que acabou de ser concluído
    this.profile.completedCycles.push({
      cycleId: this.profile.currentCycle.id,
      cycleName: this.profile.currentCycle.name,
      completedAt: new Date().toLocaleDateString('pt-BR'),
      totalMissionsCompleted: this.profile.completedScenarios.length,
      cycleXpGained: this.profile.currentCycleXp,
      roleAtCompletion: this.profile.role
    });

    // Inicia novo ciclo preservando totalCareerXp e histórico de tarefas
    this.profile.currentCycle = {
      id: newCycleId,
      name: newCycleName,
      status: 'IN_PROGRESS',
      totalMissionsRequired: 70,
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
      nextLevelTitle: this.profile.stageId === 'TRAINEE_SD' ? 'Consultor Júnior SD' : 'Consultor Pleno SD',
      nextMinXp: 1000,
      progressPercent: Math.min(100, Math.round((this.profile.completedScenarios.length / Math.max(1, this.profile.currentCycle.totalMissionsRequired)) * 100))
    };
  }

  resetProfile() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('nexustech_trainee_profile_v2');
    this.profile = this.createDefaultProfile();
    this.saveProfile();
  }
}

export const trainee = new TraineeEngine();
