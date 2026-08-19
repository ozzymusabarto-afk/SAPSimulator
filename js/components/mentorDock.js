/**
 * NexusTech ERP • Mentor Dock Component
 * Painel Interativo do Gestor Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Exibição de Briefings, Documentos de Compra Anexos e Dicas de Aprendizagem
 */

import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';
import { scenarioEngine } from '../core/engine/scenarioEngine.js';

export class MentorDockComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('aside');
    this.container.className = 'mentor-dock';
    this.isCollapsed = false;
    this.activeTab = 'BRIEFING'; // BRIEFING, OBJECTIVES, SAP_BRIDGE

    scenarioEngine.subscribe(() => this.render());
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.render();
  }

  render() {
    const scenario = scenarioEngine.getActiveScenario();
    const isChallenge = scenario && scenario.mode === 'CHALLENGE';
    const remainingSeconds = scenarioEngine.slaRemainingSeconds;

    if (this.isCollapsed) {
      this.container.innerHTML = `
        <div class="mentor-dock-header" style="padding: 12px 6px; justify-content: center;">
          <button id="mentor-uncollapse-btn" class="mentor-toggle-btn" title="Expandir Painel do Mentor">
            ${Icons.chevronRight}
          </button>
        </div>
      `;
      const btn = this.container.querySelector('#mentor-uncollapse-btn');
      if (btn) btn.addEventListener('click', () => this.toggleCollapse());
      return this.container;
    }

    let slaClass = 'sla-normal';
    if (remainingSeconds < 120) slaClass = 'sla-critical';
    else if (remainingSeconds < 300) slaClass = 'sla-warning';

    this.container.innerHTML = `
      <!-- Cabeçalho do Mentor Sr. Wilson -->
      <div class="mentor-dock-header">
        <div class="mentor-profile">
          <div class="mentor-avatar" style="background: linear-gradient(135deg, #0265dc 0%, #1e40af 100%);">
            SW
            <span class="mentor-status-online" title="Sr. Wilson está online"></span>
          </div>
          <div class="mentor-info">
            <span class="mentor-name">Sr. Wilson</span>
            <span class="mentor-role">Coordenador Comercial | Mentor SD</span>
          </div>
        </div>
        <button id="mentor-collapse-btn" class="mentor-toggle-btn" title="Recolher Painel">
          ${Icons.x}
        </button>
      </div>

      <!-- Abas do Dock -->
      <div class="mentor-tabs">
        <button class="mentor-tab-btn ${this.activeTab === 'BRIEFING' ? 'active' : ''}" data-tab="BRIEFING">
          ${Icons.messageSquare} Briefing
        </button>
        <button class="mentor-tab-btn ${this.activeTab === 'OBJECTIVES' ? 'active' : ''}" data-tab="OBJECTIVES">
          ${Icons.check} Metas
        </button>
        <button class="mentor-tab-btn ${this.activeTab === 'SAP_BRIDGE' ? 'active' : ''}" data-tab="SAP_BRIDGE">
          ${Icons.bookOpen} Guia SAP
        </button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div class="mentor-dock-body">
        <div class="mentor-tab-content">
          ${scenario ? this.renderActiveTabContent(scenario, isChallenge, remainingSeconds, slaClass) : `
            <div class="ticket-card" style="text-align: center; padding: 24px 16px;">
              <p class="text-sm text-muted">Nenhuma atividade iniciada no momento.</p>
              <button id="start-first-scenario-btn" class="btn btn-primary btn-sm" style="margin-top: 12px;">
                ${Icons.play} Iniciar Treinamento
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  renderActiveTabContent(scenario, isChallenge, remainingSeconds, slaClass) {
    if (this.activeTab === 'BRIEFING') {
      const doc = scenario.purchaseOrderDocument;

      return `
        <!-- Cartão do Chamado -->
        <div class="ticket-card">
          <div class="ticket-header">
            <span class="ticket-id">${scenario.code}</span>
            ${isChallenge ? `
              <div class="ticket-sla-timer ${slaClass}">
                ${Icons.clock} SLA: ${Formatters.timer(remainingSeconds)}
              </div>
            ` : `
              <span class="erp-badge erp-badge-primary text-xs">Treinamento Guiado</span>
            `}
          </div>
          <h4 class="ticket-title">${scenario.emailSubject}</h4>
          <p class="ticket-desc">${scenario.briefing}</p>
        </div>

        <!-- Documento de Compra Anexo para Análise do Trainee -->
        ${doc ? `
          <div style="background-color: #ffffff; border: 1px solid var(--erp-border); border-radius: 6px; padding: 12px; box-shadow: var(--erp-shadow-xs);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid var(--erp-border-subtle); padding-bottom: 4px;">
              <span style="font-weight: 700; font-size: 11.5px; color: var(--erp-navy-900); text-transform: uppercase;">
                ${Icons.fileText} Pedido de Compra do Cliente
              </span>
              <span class="erp-badge erp-badge-code text-xs">${doc.poNumber}</span>
            </div>

            <div style="font-size: 11.5px; display: flex; flex-direction: column; gap: 4px; color: var(--erp-navy-800);">
              <div><strong class="text-muted">Comprador:</strong> ${doc.buyerName}</div>
              <div><strong class="text-muted">CNPJ:</strong> <span class="font-mono">${doc.buyerCnpj}</span></div>
              <div><strong class="text-muted">Operação:</strong> ${doc.operationType}</div>
              <div style="margin-top: 4px; background-color: var(--erp-surface-subtle); padding: 6px; border-radius: 4px;">
                <strong class="text-muted">Itens Solicitados:</strong>
                ${doc.itemsRequested.map(it => `
                  <div style="font-weight: 600; color: var(--erp-blue-primary);">• ${it.quantity}x ${it.description}</div>
                `).join('')}
              </div>
              <div style="margin-top: 4px;"><strong class="text-muted">Entrega:</strong> ${doc.deliveryAddress}</div>
              <div><strong class="text-muted">Modalidade Frete:</strong> ${doc.freightResponsibility}</div>
              <div><strong class="text-muted">Faturamento:</strong> ${doc.paymentInstructions}</div>
            </div>
          </div>
        ` : ''}

        <!-- Orientação Pedagógica do Sr. Wilson -->
        <div class="mentor-speech-bubble">
          <div class="mentor-speech-title">
            ${Icons.lightbulb} Orientação do Sr. Wilson
          </div>
          <p>${scenario.mentorInitialTip}</p>
        </div>
      `;
    }

    if (this.activeTab === 'OBJECTIVES') {
      const completedCount = scenario.objectives.filter(o => o.done).length;
      return `
        <div class="objectives-checklist">
          <div class="checklist-title">
            <span>Metas da Atividade</span>
            <span class="text-xs text-primary font-mono font-bold">
              ${completedCount} / ${scenario.objectives.length}
            </span>
          </div>
          ${scenario.objectives.map(obj => `
            <div class="checklist-item ${obj.done ? 'done' : ''}">
              <span class="checklist-icon">${obj.done ? Icons.check : Icons.chevronRight}</span>
              <span>${obj.text}</span>
            </div>
          `).join('')}
        </div>

        <div style="background-color: var(--erp-surface-subtle); border-radius: 6px; padding: 10px; border: 1px solid var(--erp-border-subtle);">
          <div style="font-size: 11.5px; font-weight: 600; color: var(--erp-navy-800); margin-bottom: 4px;">
            Recompensa de Aprendizagem:
          </div>
          <div style="font-size: 12px; color: var(--erp-green-success); font-weight: 700;">
            +${scenario.xpReward} XP ao concluir corretamente
          </div>
          <div style="font-size: 10.5px; color: var(--erp-text-muted); margin-top: 2px;">
            Você pode tentar quantas vezes precisar. O erro faz parte do aprendizado!
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'SAP_BRIDGE') {
      return `
        <div class="sap-bridge-card">
          <div class="sap-bridge-header">
            ${Icons.bookOpen} Como funciona no SAP Real
          </div>
          <div style="margin-bottom: 8px;">
            <div class="text-xs font-semibold text-muted">Transações Relacionadas:</div>
            <div class="erp-badge erp-badge-sap text-xs font-mono" style="margin-top: 2px;">
              ${scenario.sapKnowledgeBridge.tcode}
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div class="text-xs font-semibold text-muted">Tabelas do Dicionário ABAP (SE11/SE16N):</div>
            <div class="font-mono text-xs text-primary" style="margin-top: 2px;">
              ${scenario.sapKnowledgeBridge.tables}
            </div>
          </div>
          <div>
            <div class="text-xs font-semibold text-muted">Conceito de Negócio & Processo SD:</div>
            <p class="sap-bridge-text" style="margin-top: 2px;">
              ${scenario.sapKnowledgeBridge.concept}
            </p>
          </div>
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    const collapseBtn = this.container.querySelector('#mentor-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }

    this.container.querySelectorAll('.mentor-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    const startBtn = this.container.querySelector('#start-first-scenario-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        scenarioEngine.startScenario('SCN-01');
        this.onNavigate('VA01');
      });
    }
  }

  getElement() {
    return this.container;
  }
}
