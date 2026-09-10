/**
 * NexusTech ERP • Process Stepper Component
 * Visualizador Interativo da Cadeia de Processo Comercial Ponta a Ponta SD
 */

import { Icons } from '../utils/icons.js';
import { scenarioEngine } from '../core/engine/scenarioEngine.js';

export const ProcessSteps = [
  { id: 'CUSTOMER', number: 1, name: 'Mestre de Cliente', tcode: 'XD03', route: 'XD03' },
  { id: 'ORDER', number: 2, name: 'Ordem de Venda', tcode: 'VA01', route: 'VA01' },
  { id: 'ATP', number: 3, name: 'Verificação ATP / Estoque', tcode: 'MM03', route: 'MM03' },
  { id: 'PRICING', number: 4, name: 'Preço & Impostos', tcode: 'VK11', route: 'VK11' },
  { id: 'CREDIT', number: 5, name: 'Análise de Crédito', tcode: 'VKM1', route: 'VKM1' },
  { id: 'DELIVERY', number: 6, name: 'Fornecimento / Remessa', tcode: 'VL01N', route: 'VL01N' },
  { id: 'BILLING', number: 7, name: 'Fatura / Financeiro', tcode: 'VF01', route: 'VF01' }
];

export class ProcessStepperComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'process-stepper-bar';
    this.currentTCode = 'DASHBOARD';

    scenarioEngine.subscribe(() => this.render());
  }

  setCurrentTCode(tcode) {
    this.currentTCode = tcode;
    this.render();
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const isChallenge = scenario && scenario.mode === 'CHALLENGE';

    this.container.innerHTML = `
      <div class="process-stepper-meta">
        <span class="process-stepper-title">Fluxo Comercial SD</span>
        ${scenario ? `
          <span class="erp-badge ${isChallenge ? 'erp-badge-danger' : 'erp-badge-primary'}">
            ${isChallenge ? `${Icons.alertTriangle} Modo Desafio` : `${Icons.lightbulb} Modo Treinamento`}
          </span>
        ` : ''}
      </div>

      <div class="process-steps-track">
        ${ProcessSteps.map((step, index) => {
          const isActive = this.currentTCode === step.route;
          const isArrow = index < ProcessSteps.length - 1;

          return `
            <div class="process-step ${isActive ? 'active' : ''}" data-route="${step.route}" title="Ir para ${step.name} (${step.tcode})" style="cursor: pointer;">
              <span class="process-step-number">${step.number}</span>
              <span class="process-step-name">${step.name}</span>
              <span class="process-step-tcode">${step.tcode}</span>
            </div>
            ${isArrow ? `<span class="process-step-arrow">${Icons.chevronRight}</span>` : ''}
          `;
        }).join('')}
      </div>

      <div class="process-mode-indicator">
        ${scenario ? `
          <span class="erp-badge erp-badge-code">
            ${scenario.code}
          </span>
        ` : `
          <span class="text-xs text-muted">Selecione um chamado</span>
        `}
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    this.container.querySelectorAll('.process-step').forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const route = stepEl.getAttribute('data-route');
        if (route) this.onNavigate(route);
      });
    });
  }

  getElement() {
    return this.container;
  }
}
