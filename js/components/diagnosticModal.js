/**
 * NexusTech ERP • Diagnostic Modal Component
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Modal de Diagnóstico Pedagógico com Feedback em 3 Camadas
 */

import { Icons } from '../utils/icons.js';

export class DiagnosticModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    document.body.appendChild(this.overlay);
  }

  /**
   * Abre o modal com diagnóstico estruturado
   * @param {Object} data - { isValid, mentorSpeech, whatHappened, why, businessImpact, onConfirm }
   */
  show(data) {
    const isSuccess = data.isValid;

    this.overlay.innerHTML = `
      <div class="erp-modal-window">
        <div class="erp-modal-header" style="background-color: ${isSuccess ? '#15803d' : '#0f172a'};">
          <div class="erp-modal-title">
            ${isSuccess ? `${Icons.check} Conformidade Aprovada!` : `${Icons.lightbulb} Orientação do Sr. Wilson`}
          </div>
          <button class="erp-modal-close" id="modal-close-btn" title="Fechar">
            ${Icons.x}
          </button>
        </div>

        <div class="erp-modal-body">
          <!-- Fala Encorajadora do Sr. Wilson -->
          ${data.mentorSpeech ? `
            <div class="mentor-speech-bubble" style="border-left-color: ${isSuccess ? '#15803d' : '#0265dc'};">
              <div class="mentor-speech-title" style="color: ${isSuccess ? '#15803d' : '#0265dc'};">
                ${isSuccess ? Icons.award : Icons.lightbulb} Sr. Wilson (Mentor SD):
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
        </div>

        <div class="erp-modal-footer">
          <button class="btn ${isSuccess ? 'btn-success' : 'btn-primary'}" id="modal-action-btn">
            ${isSuccess ? `${Icons.check} Avançar no Processo` : `${Icons.refresh} Corrigir e Tentar Novamente`}
          </button>
        </div>
      </div>
    `;

    this.overlay.classList.add('active');

    const close = () => {
      this.overlay.classList.remove('active');
      if (data.onConfirm) data.onConfirm();
    };

    this.overlay.querySelector('#modal-close-btn').addEventListener('click', close);
    this.overlay.querySelector('#modal-action-btn').addEventListener('click', close);
  }
}

export const diagnosticModal = new DiagnosticModalComponent();
