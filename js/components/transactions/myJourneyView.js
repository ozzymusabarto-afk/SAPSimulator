/**
 * Nexus ERP Lab • SD Practice Environment
 * Componente de Visualização: Minha Jornada (Career Track & Competencies)
 * Arquivo: js/components/transactions/myJourneyView.js
 * 
 * Exibe a fase atual, linha de carreira com fases futuras bloqueadas,
 * progresso das 50 missões, matriz dos 7 pilares e avaliação do Chefe Wilson.
 */

import { Icons } from '../../utils/icons.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { PhaseId, PhaseLabels } from '../../core/models/journey.js';
import { CompetencyMetadata } from '../../core/models/competencyMap.js';

export class MyJourneyViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'my-journey-view institutional-view-container';
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();
    const journey = profile.journey || {};
    const matrix = trainee.getCompetencyMatrix();
    const diagnostic = trainee.getLatestDiagnostic();
    const completedList = Array.isArray(profile.completedScenarios)
      ? profile.completedScenarios
      : Object.keys(profile.completedScenarios || {});
    const completedCount = completedList.length;
    const progressPercent = Math.min(100, Math.round((completedCount / 50) * 100));

    this.container.innerHTML = `
      <!-- Header Institucional -->
      <div class="view-header-banner">
        <div class="view-header-content">
          <div class="view-header-tag">
            ${Icons.target} Trilha de Carreira Operacional
          </div>
          <h1 class="view-header-title">Minha Jornada no Nexus ERP Lab</h1>
          <p class="view-header-subtitle">
            Acompanhe sua evolução profissional sequencial no ambiente de simulação SAP SD.
            Sua formação combina a execução das 50 missões oficiais, o domínio dos 7 pilares operacionais
            e a homologação do Chefe Wilson.
          </p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">Fase Atual</div>
          <div style="font-size: 18px; font-weight: 700; color: #60a5fa;">${PhaseLabels[PhaseId.TRAINEE]}</div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">${completedCount} de 50 missões concluídas (${progressPercent}%)</div>
        </div>
      </div>

      <!-- Pipeline de Fases da Carreira (Sequencial e Bloqueada) -->
      <div class="career-pipeline-card">
        <div class="career-pipeline-title">
          ${Icons.trendingUp} Linha de Progressão de Carreira (Não é permitido pular etapas)
        </div>
        <div class="career-track-steps">
          
          <!-- FASE 1: TRAINEE SD (ATIVA) -->
          <div class="career-step-item active">
            <div class="career-step-header">
              <span class="career-step-title">Fase 1: Trainee SD</span>
              <span class="career-step-badge active-badge">Em Curso</span>
            </div>
            <div class="career-step-desc">
              Capacitação prática nos processos fundamentais de Vendas e Distribuição (Order-to-Cash) em 50 missões.
            </div>
            <div class="career-step-footer">
              <span style="color: #2563eb;">●</span> Acesso Gratuito • 50 Missões
            </div>
          </div>

          <!-- FASE 2: ANALISTA SAP SD JÚNIOR (BLOQUEADA) -->
          <div class="career-step-item locked">
            <div class="career-step-header">
              <span class="career-step-title">Fase 2: Analista SAP SD Júnior</span>
              <span class="career-step-badge locked-badge">${Icons.lock} Bloqueado</span>
            </div>
            <div class="career-step-desc">
              Cenários de exceção, devoluções mercantis (RE), cancelamentos fiscais e aditivos contratuais.
            </div>
            <div class="career-step-footer">
              <span>🔒 Requer Diagnóstico Trainee Homologado</span>
            </div>
          </div>

          <!-- FASE 3: ANALISTA SAP SD PLENO (BLOQUEADA) -->
          <div class="career-step-item locked">
            <div class="career-step-header">
              <span class="career-step-title">Fase 3: Analista SAP SD Pleno</span>
              <span class="career-step-badge locked-badge">${Icons.lock} Bloqueado</span>
            </div>
            <div class="career-step-desc">
              Operações multicanal, contratos globais, fornecimento parcial complexo e esquemas avançados de cálculo.
            </div>
            <div class="career-step-footer">
              <span>🔒 Requer Homologação na Fase Júnior</span>
            </div>
          </div>

          <!-- FASE 4: NÍVEIS AVANÇADOS / FUTUROS (BLOQUEADA) -->
          <div class="career-step-item locked">
            <div class="career-step-header">
              <span class="career-step-title">Fase 4: Níveis Avançados / Futuros</span>
              <span class="career-step-badge locked-badge">${Icons.lock} Bloqueado</span>
            </div>
            <div class="career-step-desc">
              Supervisão de faturamento massivo, auditoria de processos SOX e governança de dados mestres.
            </div>
            <div class="career-step-footer">
              <span>🔒 Fase Futura</span>
            </div>
          </div>

        </div>
      </div>

      <!-- PAINEL DE DIAGNÓSTICO DO CHEFE WILSON -->
      <div class="diagnostic-panel-card">
        <div class="diagnostic-panel-header">
          <div class="diagnostic-mentor-profile">
            <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson - Mentor SAP" class="diagnostic-mentor-avatar" />
            <div class="diagnostic-mentor-info">
              <h4>Parecer Diagnóstico do Chefe Wilson</h4>
              <span>Orientação Pedagógica Oficial</span>
            </div>
          </div>
          <div>
            ${diagnostic ? `
              <span class="diagnostic-status-pill ${diagnostic.overallStatus === 'PASSED' ? 'passed' : 'reinforcement'}">
                ${diagnostic.overallStatus === 'PASSED' ? '✓ Perfil Homologado' : '⚠ Requer Prática Dirigida'}
              </span>
            ` : `
              <span class="diagnostic-status-pill reinforcement" style="background: #f1f5f9; color: #475569;">
                Aguardando Avaliação
              </span>
            `}
          </div>
        </div>

        <div class="diagnostic-panel-body">
          ${diagnostic ? `
            <div class="diagnostic-statement">
              "${diagnostic.summaryStatement}"
            </div>

            <div class="diagnostic-columns">
              <div class="diagnostic-list-box">
                <div class="diagnostic-list-title strengths">
                  ${Icons.check} Pontos Fortes Comprovados (${diagnostic.strengths.length})
                </div>
                ${diagnostic.strengths.length > 0 ? diagnostic.strengths.map(s => `
                  <div class="diagnostic-item">
                    <strong>${s.title}:</strong> ${s.evidence}
                  </div>
                `).join('') : '<div class="diagnostic-item text-muted">Execute missões para registrar pontos fortes.</div>'}
              </div>

              <div class="diagnostic-list-box">
                <div class="diagnostic-list-title reinforcement">
                  ${Icons.alertTriangle} Oportunidades de Reforço (${diagnostic.reinforcementAreas.length})
                </div>
                ${diagnostic.reinforcementAreas.length > 0 ? diagnostic.reinforcementAreas.map(r => `
                  <div class="diagnostic-item">
                    <strong>${r.title}:</strong> ${r.evidence}<br/>
                    <span style="font-size: 11px; color: #b45309;">${r.recommendedActions[0]}</span>
                  </div>
                `).join('') : '<div class="diagnostic-item text-muted" style="color: #15803d;">Nenhuma deficiência crítica identificada.</div>'}
              </div>
            </div>

            <div style="margin-top: 18px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 14px;">
              <span style="font-size: 11.5px; color: #64748b;">
                Avaliado em: ${new Date(diagnostic.evaluatedAt).toLocaleString('pt-BR')} • Critério: Evidências Operacionais
              </span>
              <div style="display: flex; gap: 10px;">
                <button id="btn-re-run-diagnostic" class="btn btn-secondary btn-sm" title="Reavaliar com base nas tentativas recentes">
                  ${Icons.refreshCw} Atualizar Avaliação
                </button>
                <button id="btn-goto-training-from-diag" class="btn btn-primary btn-sm">
                  ${Icons.target} Ir para Treinamento
                </button>
              </div>
            </div>
          ` : `
            <div class="diagnostic-statement">
              "Olá, Trainee. A avaliação diagnóstica analisa sua consistência operacional em todo o ciclo de vendas.
              Ao concluir as missões oficiais, você receberá aqui um parecer completo com seus pontos fortes e as áreas onde precisa reforçar a prática."
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button id="btn-run-first-diagnostic" class="btn btn-primary btn-sm">
                ${Icons.play} Executar Diagnóstico Inicial
              </button>
            </div>
          `}
        </div>
      </div>

      <!-- MATRIZ DOS 7 PILARES DE COMPETÊNCIA OPERACIONAL -->
      <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 14.5px; font-weight: 700; color: var(--erp-navy-900); text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
          ${Icons.award} Matriz dos 7 Pilares de Competência Operacional SD
        </h3>
        <span style="font-size: 12px; color: var(--erp-text-muted);">
          Atualizado a partir do histórico de execuções
        </span>
      </div>

      <div class="competency-grid">
        ${Object.values(matrix).map(comp => {
          const isWarn = comp.needsReinforcement;
          const rate = comp.totalAttempts > 0 ? comp.successRate : 100;
          return `
            <div class="competency-card ${isWarn ? 'needs-reinforcement' : 'mastered'}">
              <div class="competency-card-header">
                <div>
                  <div class="competency-card-title">${comp.title}</div>
                  <div class="competency-card-tcodes">
                    ${comp.tcodes.map(t => `<span class="tcode-pill">${t}</span>`).join('')}
                  </div>
                </div>
                <span class="erp-badge ${isWarn ? 'erp-badge-warning' : 'erp-badge-success'}" style="font-size: 10px;">
                  ${isWarn ? 'Requer Reforço' : 'Consistente'}
                </span>
              </div>

              <div class="competency-rate-bar-wrapper">
                <div class="competency-rate-label">
                  <span>Taxa de Assertividade</span>
                  <span>${comp.totalAttempts > 0 ? `${rate}%` : 'Sem dados'}</span>
                </div>
                <div class="competency-rate-bar">
                  <div class="competency-rate-fill ${isWarn ? 'warn' : 'good'}" style="width: ${rate}%;"></div>
                </div>
              </div>

              <div class="competency-stats-row">
                <span>Tentativas: <strong>${comp.totalAttempts}</strong></span>
                <span>Sucessos: <strong style="color: #15803d;">${comp.successfulAttempts}</strong></span>
                <span>Falhas/Aband.: <strong style="color: ${comp.failedAttempts > 0 ? '#b91c1c' : '#64748b'};">${comp.failedAttempts + comp.abandonedAttempts}</strong></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const reRunBtn = this.container.querySelector('#btn-re-run-diagnostic');
    if (reRunBtn) {
      reRunBtn.addEventListener('click', () => {
        trainee.runDiagnosticEvaluation();
        this.render();
      });
    }

    const firstDiagBtn = this.container.querySelector('#btn-run-first-diagnostic');
    if (firstDiagBtn) {
      firstDiagBtn.addEventListener('click', () => {
        trainee.runDiagnosticEvaluation();
        this.render();
      });
    }

    const gotoTrainingBtn = this.container.querySelector('#btn-goto-training-from-diag');
    if (gotoTrainingBtn) {
      gotoTrainingBtn.addEventListener('click', () => {
        this.onNavigate('TREINAMENTO');
      });
    }
  }
}
