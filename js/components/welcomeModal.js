/**
 * NexusTech ERP • Welcome Modal Component (Onboarding - Primeiro Dia na Empresa)
 * Mentor: Chefe Wilson (Coordenador Comercial | Mentor SD)
 * Experiência de Primeiro Acesso Corporativo, Acolhimento e Orientação Inicial
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';

export const ONBOARDING_STORAGE_KEY = 'nexustech_onboarding_completed';

function onboardingKey() {
  try {
    const userId = trainee.getProfile()?.journey?.userId || 'local';
    return `${ONBOARDING_STORAGE_KEY}_${userId}`;
  } catch {
    return `${ONBOARDING_STORAGE_KEY}_local`;
  }
}

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
      const isCompleted = localStorage.getItem(onboardingKey()) === 'true';
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
   * Abre o modal de boas-vindas do Chefe Wilson
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
              <span>Seu Primeiro Dia de Expediente</span>
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
                Chefe de Operações SD • Nexus ERP Lab
              </div>
            </div>
          </div>

          <!-- Mensagem Humana e Profissional -->
          <div style="font-size: 13px; color: var(--erp-navy-900); line-height: 1.6; display: flex; flex-direction: column; gap: 10px;">
            <p style="margin: 0;">
              Olá, <strong>${traineeName}</strong>! Seu processo de contratação como <strong>Trainee de Operações SD</strong> foi concluído.
            </p>
            <p style="margin: 0;">
              Eu sou o Chefe Wilson, seu gestor nesta empresa fictícia. Você já estudou SAP SD; aqui não vamos dar uma aula. Você vai receber solicitações de uma rotina comercial e colocar em prática o que aprendeu, consultando dados, tomando decisões e lidando com exceções.
            </p>
            <p style="margin: 0;">
              Nosso princípio é a fidelidade operacional. O objetivo é construir segurança para uma primeira oportunidade profissional — sem fingir que o simulador substitui experiência real, certificação ou treinamento oficial.
            </p>
          </div>

          <!-- Pílulas de Recursos de Apoio -->
          <div style="background-color: var(--erp-surface-subtle); border: 1px solid var(--erp-border-subtle); border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--erp-navy-900); margin-bottom: 2px;">
              💡 Seus Recursos Durante o Expediente:
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-blue-primary); font-weight: 700;">• Tecla F1 ou [?]</span> Ajuda contextual para você consultar durante a prática.
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-blue-primary); font-weight: 700;">• Painel do gestor:</span> Contexto do chamado e pistas graduais, sem entregar a resposta de imediato.
            </div>
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--erp-green-success); font-weight: 700;">• Ambiente seguro:</span> Você pode errar, analisar o impacto e refazer atividades sem risco para uma empresa real.
            </div>
          </div>

        </div>

        <!-- Footer com Botão de Ação -->
        <div class="erp-modal-footer" style="padding: 12px 20px; background-color: #f8fafc; border-top: 1px solid var(--erp-border-subtle); display: flex; align-items: center; justify-content: flex-end;">
          <button class="btn btn-primary" id="welcome-start-btn" style="padding: 9px 22px; font-weight: 600; font-size: 13px; box-shadow: var(--erp-shadow-sm);">
            ${Icons.play} Iniciar expediente
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
      localStorage.setItem(onboardingKey(), 'true');
    } catch (e) {
      // Ignora erro se localStorage indisponível
    }
  }

  resetOnboarding() {
    try {
      localStorage.removeItem(onboardingKey());
    } catch (e) {
      // Ignora erro
    }
  }
}

export const welcomeModal = new WelcomeModalComponent();
