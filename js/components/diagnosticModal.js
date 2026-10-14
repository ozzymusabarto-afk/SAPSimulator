/**
 * NexusTech ERP • Diagnostic Modal Component
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Modal de Diagnóstico Pedagógico com Feedback em 3 Camadas
 */

import { Icons } from '../utils/icons.js';
import { MentorDockComponent } from './mentorDock.js';
import { scenarioEngine } from '../core/engine/scenarioEngine.js';
import { trainee } from '../core/engine/traineeEngine.js';
import { ScenarioCatalog } from '../core/scenarios/catalog.js';

export class DiagnosticModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    this.activeKeydownHandler = null;
    document.body.appendChild(this.overlay);
  }

  /**
   * Abre o modal com diagnóstico estruturado
   * @param {Object} data - { isValid, mentorSpeech, whatHappened, why, businessImpact, onConfirm, onInspect }
   */
  show(data) {
    if (this.activeKeydownHandler) {
      document.removeEventListener('keydown', this.activeKeydownHandler);
      this.activeKeydownHandler = null;
    }

    const isSuccess = data.isValid;
    const activeScenario = scenarioEngine.getActiveScenario();
    // O trainee pode estar refazendo uma missão já concluída no histórico.
    // O cartão deve refletir os objetivos desta tentativa, não o status vitalício.
    const isMissionCompleted = isSuccess && activeScenario &&
      trainee.isScenarioCompleted(activeScenario.id) && scenarioEngine.areActiveScenarioObjectivesComplete();
    const completedScenarios = trainee.getCompletedScenarios() || [];
    const allCompleted = ScenarioCatalog.length > 0 && ScenarioCatalog.every(s => completedScenarios.includes(s.id));
    const nextScenario = (isMissionCompleted && !allCompleted)
      ? scenarioEngine.getCurrentPendingScenario()
      : null;

    this.overlay.innerHTML = `
      <div class="erp-modal-window">
        <div class="erp-modal-header" style="background-color: ${isSuccess ? '#15803d' : '#0f172a'};">
          <div class="erp-modal-title">
            ${isMissionCompleted
              ? `${Icons.check} Missão Concluída • Conformidade Aprovada!`
              : isSuccess
                ? `${Icons.check} Etapa Validada • Conformidade Aprovada!`
                : `${Icons.lightbulb} Orientação do Chefe Wilson`}
          </div>
          <button class="erp-modal-close" id="modal-close-btn" title="Fechar">
            ${Icons.x}
          </button>
        </div>

        <div class="erp-modal-body">
          ${isSuccess ? `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 6px 12px;">
              <span class="erp-badge erp-badge-success font-mono text-xs">${Icons.check} ${isMissionCompleted ? 'MISSÃO HOMOLOGADA' : 'ETAPA VALIDADA'}</span>
              <span style="font-size: 11px; color: #166534; font-weight: 500;">${isMissionCompleted ? 'Missão registrada no histórico do trainee' : 'Missão em andamento'}</span>
            </div>
          ` : ''}

          ${isSuccess && data.operationSummary ? `
            <div class="erp-operation-summary-card">
              <div class="operation-summary-header">
                <div class="operation-summary-title">
                  <span class="operation-summary-icon">${Icons.check}</span>
                  <span>${data.operationSummary.title || 'Confirmação do Sistema ERP'}</span>
                </div>
                ${data.operationSummary.docTypeBadge ? `
                  <span class="erp-badge erp-badge-sap text-xs font-mono">${data.operationSummary.docTypeBadge}</span>
                ` : ''}
              </div>

              <div class="operation-summary-body">
                <div class="operation-summary-primary-box">
                  <div class="text-xs text-muted font-medium">${data.operationSummary.primaryLabel || 'Documento Gerado:'}</div>
                  <div class="operation-summary-number font-mono">
                    ${data.operationSummary.primaryNumber}
                  </div>
                </div>

                <div class="operation-summary-details-grid">
                  ${data.operationSummary.statusText ? `
                    <div class="operation-detail-item">
                      <span class="detail-label">Status:</span>
                      <span class="erp-badge erp-badge-success text-xs font-mono">${data.operationSummary.statusText}</span>
                    </div>
                  ` : ''}

                  ${data.operationSummary.secondaryNumber ? `
                    <div class="operation-detail-item">
                      <span class="detail-label">${data.operationSummary.secondaryLabel || 'Doc. Secundário:'}</span>
                      <span class="detail-value font-mono font-bold">${data.operationSummary.secondaryNumber}</span>
                    </div>
                  ` : ''}

                  ${data.operationSummary.partnerOrOrigin ? `
                    <div class="operation-detail-item">
                      <span class="detail-label">${data.operationSummary.partnerLabel || 'Parceiro / Origem:'}</span>
                      <span class="detail-value font-medium">${data.operationSummary.partnerOrOrigin}</span>
                    </div>
                  ` : ''}

                  ${data.operationSummary.referenceDoc ? `
                    <div class="operation-detail-item">
                      <span class="detail-label">Referência:</span>
                      <span class="detail-value font-mono">${data.operationSummary.referenceDoc}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Fala Encorajadora do Chefe Wilson -->
          ${data.mentorSpeech ? `
            <div class="mentor-speech-bubble" style="border-left-color: ${isSuccess ? '#15803d' : '#0265dc'};">
              <div class="mentor-speech-title" style="color: ${isSuccess ? '#15803d' : '#0265dc'};">
                ${isSuccess ? Icons.award : Icons.lightbulb} Chefe Wilson (Mentor SAP):
              </div>
              <p style="font-size: 12.5px; font-weight: 500;">${data.mentorSpeech}</p>
            </div>
          ` : ''}

          <div class="diagnostic-box ${isSuccess ? 'diagnostic-success' : 'diagnostic-error'}">
            
            <!-- Parte 1: O que ocorreu -->
            <div class="diagnostic-step">
              <div class="diagnostic-step-title">
                ${Icons.info} 1. O que foi verificado
              </div>
              <div class="diagnostic-step-content">
                ${data.whatHappened}
              </div>
            </div>

            <!-- Parte 2: Por quê? (Regra de Negócio SAP SD) -->
            <div class="diagnostic-step">
              <div class="diagnostic-step-title">
                ${Icons.bookOpen} 2. Por quê? (Conceito & Regra SAP SD)
              </div>
              <div class="diagnostic-step-content">
                ${data.why}
              </div>
            </div>

            <!-- Parte 3: Impacto Real no Negócio -->
            <div class="business-impact-card">
              <div class="business-impact-title">
                ${Icons.shieldAlert} 3. Impacto na Operação da Empresa
              </div>
              <div class="business-impact-text">
                ${data.businessImpact}
              </div>
            </div>

          </div>

          <!-- Bloco Pedagógico de Continuidade do Chefe Wilson -->
          ${isMissionCompleted ? `
            <div class="mentor-speech-bubble" style="border-left-color: ${allCompleted ? '#d97706' : '#15803d'}; background-color: ${allCompleted ? '#fffbeb' : '#f0fdf4'}; margin-top: 14px;">
              <div class="mentor-speech-title" style="color: ${allCompleted ? '#d97706' : '#15803d'};">
                ${allCompleted ? Icons.award : Icons.check} Chefe Wilson (Mentor SAP):
              </div>
              <p style="font-size: 13px; font-weight: 600; color: ${allCompleted ? '#78350f' : '#14532d'}; margin: 4px 0 0 0;">
                ${allCompleted
                  ? 'Muito bem! Você concluiu esta etapa com sucesso. Chegamos ao encerramento das 50 solicitações da formação em Vendas e Distribuição. Vamos ao seu diagnóstico?'
                  : 'Muito bem! Você concluiu esta etapa com sucesso. Temos mais uma situação para resolver na operação. Vamos para a próxima missão?'
                }
              </p>
            </div>
          ` : ''}
        </div>

        <div class="erp-modal-footer">
          ${isMissionCompleted ? `
            ${data.onInspect ? `
              <button class="btn btn-secondary" id="modal-secondary-btn" style="font-size: 12px; padding: 7px 12px;" title="Inspecionar documento gerado nesta atividade">
                ${data.operationSummary?.inspectLabel || 'Inspecionar Documento Atual'}
              </button>
            ` : ''}
            ${allCompleted ? `
              <button class="btn btn-primary" id="modal-diagnostic-btn" style="background-color: #d97706; border-color: #b45309; font-weight: 700; font-size: 13px; padding: 7px 16px;">
                ${Icons.award} Ir para o Diagnóstico da Fase →
              </button>
            ` : `
              <button class="btn btn-success" id="modal-next-btn" style="font-weight: 700; font-size: 13px; padding: 7px 16px;">
                Ir para a próxima missão →
              </button>
            `}
          ` : `
            <button class="btn ${isSuccess ? 'btn-success' : 'btn-primary'}" id="modal-action-btn">
              ${isSuccess ? `${Icons.check} Avançar no Processo` : `${Icons.refresh} Corrigir e Tentar Novamente`}
            </button>
          `}
        </div>
      </div>
    `;

    this.overlay.classList.add('active');

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    const close = () => {
      document.removeEventListener('keydown', handleKeydown);
      if (this.activeKeydownHandler === handleKeydown) this.activeKeydownHandler = null;
      this.overlay.classList.remove('active');
      if (!isSuccess) {
        MentorDockComponent.speak(
          'Atenção ao ponto apontado no diagnóstico. Revise o formulário e faça a correção antes de gravar novamente.',
          'WARN'
        );
      }
    };

    this.activeKeydownHandler = handleKeydown;
    document.addEventListener('keydown', handleKeydown);

    const closeBtn = this.overlay.querySelector('#modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        close();
      });
    }

    const actionBtn = this.overlay.querySelector('#modal-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        close();
        if (data.onConfirm) data.onConfirm();
      });
    }

    const secondaryBtn = this.overlay.querySelector('#modal-secondary-btn');
    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', () => {
        close();
        if (data.onInspect) data.onInspect();
      });
    }

    const nextBtn = this.overlay.querySelector('#modal-next-btn');
    if (nextBtn && nextScenario) {
      nextBtn.addEventListener('click', () => {
        close();
        scenarioEngine.startScenario(nextScenario.id);
        const targetRoute = nextScenario.initialTcode || 'VA01';
        if (window.app && typeof window.app.navigate === 'function') {
          window.app.navigate(targetRoute);
        }
      });
    }

    const diagBtn = this.overlay.querySelector('#modal-diagnostic-btn');
    if (diagBtn) {
      diagBtn.addEventListener('click', () => {
        close();
        if (window.app && typeof window.app.navigate === 'function') {
          window.app.navigate('MINHA_JORNADA');
        }
      });
    }
  }
}

export const diagnosticModal = new DiagnosticModalComponent();
