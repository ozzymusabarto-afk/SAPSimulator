/**
 * NexusTech ERP • Welcome Modal Component (Onboarding - Primeiro Dia na Empresa)
 * Mentor: Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Experiência de Primeiro Acesso Corporativo, Acolhimento e Orientação Inicial
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';

export const ONBOARDING_STORAGE_KEY = 'nexustech_onboarding_completed';

export class WelcomeModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    this.isOpen = false;
    document.body.appendChild(this.overlay);
  }

  /**
   * Verifica se o onboarding deve ser exibido para o trainee atual
   * Regra: totalActions === 0 && completedScenarios.length === 0 && !onboardingCompleted
   */
  shouldShowOnboarding() {
    try {
      const isCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      if (isCompleted) return false;

      const profile = trainee.getProfile();
      const hasNoActions = (profile.totalActions || 0) === 0;
      const hasNoCompletedScenarios = (!profile.completedScenarios || profile.completedScenarios.length === 0);

      return hasNoActions && hasNoCompletedScenarios;
    } catch (e) {
      return false;
    }
  }

  /**
   * Abre o modal de boas-vindas do Sr. Wilson
   */
  show() {
    const profile = trainee.getProfile();
    const traineeName = profile.name || 'Trainee SD';

    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 580px;">
        <!-- Header Corporativo -->
        <div class="erp-modal-header" style="background-color: var(--erp-navy-900); padding: 14px 20px;">
          <div class="erp-modal-title" style="font-size: 14.5px; display: flex; align-items: center; gap: 8px;">
            <span style="background: var(--erp-blue-primary); color: #fff; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;">
              N
            </span>
            <span>Seu Primeiro Dia no Nexus ERP Lab</span>
          </div>
          <button class="erp-modal-close" id="welcome-close-btn" title="Fechar (Esc)">
            ${Icons.x}
          </button>
        </div>

        <!-- Corpo com Mensagem do Chefe Wilson -->
        <div class="erp-modal-body" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Identidade do Mentor Chefe Wilson -->
          <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--erp-border-subtle); padding-bottom: 12px;">
            <div style="width: 46px; height: 46px; border-radius: 50%; overflow: hidden; border: 2px solid #0070f2; flex-shrink: 0; box-shadow: var(--erp-shadow-xs);">
              <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div>
              <div style="font-size: 14.5px; font-weight: 700; color: var(--erp-navy-900);">
                Chefe Wilson
              </div>
              <div style="font-size: 11.5px; color: var(--erp-text-muted);">
                Mentor SAP • Nexus ERP Lab (SD Practice Environment)
              </div>
            </div>
          </div>

          <!-- Mensagem Humana e Profissional -->
          <div style="font-size: 13px; color: var(--erp-navy-900); line-height: 1.6; display: flex; flex-direction: column; gap: 10px;">
            <p style="margin: 0;">
              Olá, <strong>${traineeName}</strong>! Seja muito bem-vindo ao <strong>Nexus ERP Lab</strong>.
            </p>
            <p style="margin: 0;">
              Eu sou o Chefe Wilson e vou acompanhar seu desenvolvimento durante esta jornada prática. Aqui você vai trabalhar com processos reais da rotina de Vendas e Distribuição (SD): clientes, ordens de venda, estoque ATP, condições de preço, análise de crédito, remessa e faturamento.
            </p>
            <p style="margin: 0;">
              Nosso princípio aqui é a fidelidade operacional ao processo. O objetivo não é correr nem decorar telas, mas sim aprender a identificar os dados necessários e tomar decisões comerciais com total segurança.
            </p>
          </div>

          <!-- Pílulas de Recursos de Apoio -->
          <div style="background-color: var(--erp-surface-subtle); border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--erp-navy-900); margin-bottom: 2px;">
              💡 Seus Recursos Durante o Expediente:
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-blue-primary); font-weight: 700;">• Tecla F1 ou [?]</span> Documentação técnica dos campos no SAP a qualquer momento.
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-blue-primary); font-weight: 700;">• Painel do Mentor:</span> Orientação do chamado e botão para tirar dúvidas comigo.
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-green-success); font-weight: 700;">• Segurança:</span> Você pode errar, ajustar dados e refazer atividades para praticar.
            </div>
          </div>

        </div>

        <!-- Footer com Botão de Ação -->
        <div class="erp-modal-footer" style="padding: 12px 20px; background-color: #f8fafc; border-top: 1px solid var(--erp-border-subtle); display: flex; align-items: center; justify-content: flex-end;">
          <button class="btn btn-primary" id="welcome-start-btn" style="padding: 9px 22px; font-weight: 600; font-size: 13px; box-shadow: var(--erp-shadow-sm);">
            ${Icons.play} Começar Meu Primeiro Dia
          </button>
        </div>
      </div>
    `;

    this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        handleStart();
      }
    };

    const handleStart = () => {
      document.removeEventListener('keydown', handleKeydown);
      this.markAsCompleted();
      this.close();
    };

    document.addEventListener('keydown', handleKeydown);

    const startBtn = this.overlay.querySelector('#welcome-start-btn');
    const closeBtn = this.overlay.querySelector('#welcome-close-btn');

    if (startBtn) startBtn.addEventListener('click', handleStart);
    if (closeBtn) closeBtn.addEventListener('click', handleStart);
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
  }

  markAsCompleted() {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      // Ignora erro se localStorage indisponível
    }
  }

  resetOnboarding() {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (e) {
      // Ignora erro
    }
  }
}

export const welcomeModal = new WelcomeModalComponent();
