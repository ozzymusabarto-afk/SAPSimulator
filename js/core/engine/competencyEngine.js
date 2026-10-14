/**
 * Nexus ERP Lab • SD Practice Environment
 * Motor de Competências & Consolidação Diagnóstica (Competency Engine)
 * Módulo: js/core/engine/competencyEngine.js
 * 
 * Processa o histórico analítico de tentativas (MissionAttempt), calcula o domínio
 * dos 7 pilares operacionais e gera o Diagnóstico Estruturado do Chefe Wilson.
 */

import { CompetencyId, AttemptOutcome } from '../models/journey.js';
import { CompetencyMetadata, ScenarioCompetencyMap, getCompetenciesForScenario } from '../models/competencyMap.js';
import { traineeRepository } from '../repository/traineeRepository.js';

class CompetencyEngine {
  constructor() {}

  /**
   * Consolida o progresso de cada um dos 7 pilares com base no histórico de tentativas.
   * @param {string} userId
   * @returns {object} Matriz consolidada das 7 competências
   */
  consolidateCompetencies(userId = 'trainee_default') {
    const allAttempts = traineeRepository.getAllAttempts();
    const competencyKeys = Object.values(CompetencyId);

    const matrix = {};

    competencyKeys.forEach(cid => {
      const meta = CompetencyMetadata[cid] || { title: cid, shortTitle: cid, tcodes: [] };
      matrix[cid] = {
        competencyId: cid,
        title: meta.title,
        shortTitle: meta.shortTitle,
        tcodes: meta.tcodes,
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        abandonedAttempts: 0,
        successRate: 100,
        averageScore: 100,
        mistakesLogged: [],
        trend: 'NOT_EVALUATED', // 'IMPROVING' | 'STABLE' | 'NEEDS_ATTENTION' | 'NOT_EVALUATED'
        needsReinforcement: false
      };
    });

    // Agrupa e processa cada tentativa pelos pilares associados ao cenário
    allAttempts.forEach(attempt => {
      const scenarioCompetencies = getCompetenciesForScenario(attempt.scenarioId);
      scenarioCompetencies.forEach(cid => {
        if (matrix[cid]) {
          const comp = matrix[cid];
          comp.totalAttempts++;

          if (attempt.outcome === AttemptOutcome.SUCCESS) {
            comp.successfulAttempts++;
          } else if (attempt.outcome === AttemptOutcome.FAILED) {
            comp.failedAttempts++;
          } else if (attempt.outcome === AttemptOutcome.ABANDONED) {
            comp.abandonedAttempts++;
          }

          if (Array.isArray(attempt.mistakesLogged)) {
            attempt.mistakesLogged.forEach(m => {
              if (m && !comp.mistakesLogged.some(existing => existing.message === m.message)) {
                comp.mistakesLogged.push({
                  scenarioId: attempt.scenarioId,
                  field: m.field || 'N/A',
                  message: m.message || 'Erro operacional registrado'
                });
              }
            });
          }
        }
      });
    });

    // Calcula taxas consolidadas e tendências
    competencyKeys.forEach(cid => {
      const comp = matrix[cid];
      if (comp.totalAttempts > 0) {
        comp.successRate = Math.round((comp.successfulAttempts / comp.totalAttempts) * 100);

        // Identifica necessidade de reforço por evidência factual (alta taxa de falhas/abandonos ou erros recorrentes)
        if (comp.failedAttempts > 0 || comp.abandonedAttempts > 1 || comp.successRate < 75) {
          comp.needsReinforcement = true;
          comp.trend = 'NEEDS_ATTENTION';
        } else {
          comp.needsReinforcement = false;
          comp.trend = comp.successfulAttempts > 1 ? 'IMPROVING' : 'STABLE';
        }
      }
    });

    traineeRepository.saveCompetencies({
      userId,
      competencies: matrix,
      updatedAt: new Date().toISOString()
    });

    return matrix;
  }

  /**
   * Gera o Diagnóstico Estruturado do Chefe Wilson.
   * Não promove automaticamente o aluno nem aplica fórmulas de corte arbitrárias.
   * @param {string} userId
   * @returns {object} Diagnóstico completo com pontos fortes, lacunas e recomendações
   */
  generateDiagnosticEvaluation(userId = 'trainee_default') {
    const matrix = this.consolidateCompetencies(userId);
    const profile = traineeRepository.getRawProfile() || {};
    const journey = profile.journey || {};
    const completedScenarios = profile.completedScenarios || [];

    const strengths = [];
    const reinforcementAreas = [];

    Object.values(matrix).forEach(comp => {
      if (comp.totalAttempts > 0) {
        if (comp.needsReinforcement) {
          reinforcementAreas.push({
            competencyId: comp.competencyId,
            title: comp.title,
            tcodes: comp.tcodes,
            evidence: `${comp.failedAttempts} falha(s) e ${comp.abandonedAttempts} abandono(s) registrados em ${comp.totalAttempts} tentativa(s).`,
            mistakesSample: comp.mistakesLogged.slice(0, 3),
            recommendedActions: [
              `Praticar desafios direcionados nas transações ${comp.tcodes.join(', ')}.`,
              `Revisar critérios de preenchimento e conferência de dados de ${comp.shortTitle}.`
            ]
          });
        } else if (comp.successfulAttempts > 0) {
          strengths.push({
            competencyId: comp.competencyId,
            title: comp.title,
            evidence: `${comp.successfulAttempts} conclusão(ões) com taxa de sucesso de ${comp.successRate}%.`,
            tcodes: comp.tcodes
          });
        }
      }
    });

    // Determina a situação pedagógica sem aplicar cortes rígidos arbitrários
    const hasCriticalGaps = reinforcementAreas.length > 0;
    const overallStatus = hasCriticalGaps ? 'REINFORCEMENT_REQUIRED' : 'PASSED';

    const evaluationId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const evaluation = {
      evaluationId,
      userId,
      evaluatedAt: now,
      overallStatus,
      totalCompletedMissions: completedScenarios.length,
      mentor: 'Chefe Wilson • Gestor de Operações SD',
      summaryStatement: overallStatus === 'PASSED'
        ? 'Desempenho operacional consistente demonstrado em todos os pilares essenciais de SD. O Trainee demonstrou autonomia e precisão processual no Order-to-Cash.'
        : `Identificamos ${reinforcementAreas.length} área(s) que requerem atenção antes da transição formal de nível. Recomenda-se prática cirúrgica nas transações indicadas.`,
      strengths,
      reinforcementAreas,
      competencyBreakdown: matrix,
      // Garantia de integridade da governança:
      isPromotionAutomatic: false
    };

    // Salva a avaliação no repositório
    traineeRepository.saveDiagnosticEvaluation(evaluation);

    // Atualiza o estado de diagnóstico na UserJourney sem alterar a fase do aluno
    if (journey) {
      journey.diagnosticStatus = overallStatus;
      journey.lastActiveAt = now;
      traineeRepository.saveJourney(journey);
    }

    return evaluation;
  }
}

export const competencyEngine = new CompetencyEngine();
