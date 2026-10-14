/**
 * NexusTech ERP • Mentor Dock Component
 * Painel Interativo do Gestor Sr. Wilson (Coordenador Comercial | Mentor SD)
 * Exibição de Briefings, Documentos de Compra Anexos, Dicas e Orientação do Mentor
 */

import { Icons } from '../utils/icons.js';
import { Formatters } from '../utils/formatters.js';
import { scenarioEngine } from '../core/engine/scenarioEngine.js';
import { trainee } from '../core/engine/traineeEngine.js';
import { ScenarioCatalog } from '../core/scenarios/catalog.js';

export class MentorDockComponent {
  static instance = null;

  constructor(onNavigate) {
    MentorDockComponent.instance = this;
    this.onNavigate = onNavigate;
    this.container = document.createElement('aside');
    this.container.className = 'mentor-dock';

    // Inicia recolhido em telas compactas (notebooks <= 1280px) para preservar a área operacional
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1280;
    this.isCollapsed = isSmallScreen;
    if (isSmallScreen) {
      this.container.classList.add('collapsed');
    }

    this.activeTab = 'BRIEFING'; // BRIEFING, OBJECTIVES, SAP_BRIDGE
    this.currentSpeech = null;
    this.speechType = 'DEFAULT'; // DEFAULT, HELP, SUCCESS, WARN
    this.lastScenarioId = null;

    scenarioEngine.subscribe(() => {
      const scenario = scenarioEngine.getActiveScenario();
      if (scenario && scenario.id !== this.lastScenarioId) {
        this.lastScenarioId = scenario.id;
        this.currentSpeech = scenario.mentorInitialTip;
        this.speechType = 'DEFAULT';
      }
      this.render();
    });
  }

  /**
   * Dispara uma fala estática do Sr. Wilson no dock ativo
   * @param {string} speechText - Texto da fala do supervisor
   * @param {string} type - 'DEFAULT' | 'HELP' | 'SUCCESS' | 'WARN'
   */
  static speak(speechText, type = 'NORMAL') {
    if (MentorDockComponent.instance) {
      MentorDockComponent.instance.setMentorSpeech(speechText, type);
    }
  }

  /**
   * Restaura a mensagem original do cenário no dock ativo
   */
  static reset() {
    if (MentorDockComponent.instance) {
      MentorDockComponent.instance.resetSpeech();
    }
  }

  /**
   * Atualiza a mensagem falada pelo Sr. Wilson no Dock
   * @param {string} speechText - Texto da fala do supervisor
   * @param {string} type - 'DEFAULT' | 'HELP' | 'SUCCESS' | 'WARN'
   */
  setMentorSpeech(speechText, type = 'NORMAL') {
    const scenario = scenarioEngine.getActiveScenario();
    if (scenario) {
      this.lastScenarioId = scenario.id;
    }
    this.currentSpeech = speechText;
    this.speechType = type;
    this.render();
  }

  /**
   * Restaura a mensagem original do cenário ou de encerramento
   */
  resetSpeech() {
    const profile = trainee.getProfile();
    const completedScenarios = profile.completedScenarios || [];
    const allCompleted = ScenarioCatalog.length > 0 && ScenarioCatalog.every(s => completedScenarios.includes(s.id));

    if (allCompleted) {
      this.currentSpeech = 'Parabéns pela conclusão da formação prática em SAP SD! Você percorreu com excelência toda a cadeia Order-to-Cash. Continue praticando no Histórico de Atividades para consolidar sua segurança operacional.';
      this.speechType = 'SUCCESS';
    } else {
      const scenario = scenarioEngine.getActiveScenario();
      this.currentSpeech = scenario ? scenario.mentorInitialTip : null;
      this.speechType = 'DEFAULT';
    }
    this.render();
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
    const profile = trainee.getProfile();
    const completedScenarios = profile.completedScenarios || [];
    const allCompleted = ScenarioCatalog.length > 0 && ScenarioCatalog.every(s => completedScenarios.includes(s.id));

    // Sincroniza fala inicial do cenário ou encerramento
    if (allCompleted && (!scenario || completedScenarios.includes(scenario.id))) {
      if (!this.currentSpeech || this.speechType === 'DEFAULT' || this.speechType === 'SUCCESS') {
        this.currentSpeech = 'Parabéns pela conclusão da formação prática em SAP SD! Você percorreu com excelência toda a cadeia Order-to-Cash. Continue praticando no Histórico de Atividades para consolidar sua segurança operacional.';
        this.speechType = 'SUCCESS';
        this.lastScenarioId = scenario ? scenario.id : 'COMPLETED';
      }
    } else if (scenario && (this.lastScenarioId !== scenario.id || !this.currentSpeech)) {
      this.lastScenarioId = scenario.id;
      this.currentSpeech = scenario.mentorInitialTip;
      this.speechType = 'DEFAULT';
    }

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
      <!-- Cabeçalho do Mentor Chefe Wilson -->
      <div class="mentor-dock-header">
        <div class="mentor-profile">
          <div class="mentor-avatar">
            <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" class="mentor-avatar-img" />
            <span class="mentor-status-online" title="Chefe Wilson está online"></span>
          </div>
          <div class="mentor-info">
            <span class="mentor-name">Chefe Wilson</span>
            <span class="mentor-role">Mentor SAP</span>
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

        ${doc && scenario.objectives.some(objective => ['analyze_po', 'process_demand'].includes(objective.id) && !objective.done) ? `
          <button id="btn-confirm-po-analysis" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 8px;">
            Confirmar análise do pedido de compra
          </button>
        ` : ''}

        <!-- Orientação e Fala do Supervisor Sr. Wilson -->
        <div class="mentor-speech-bubble ${
          this.speechType === 'HELP' ? 'speech-help' :
          this.speechType === 'SUCCESS' ? 'speech-success' :
          this.speechType === 'WARN' ? 'speech-warn' :
          'speech-default'
        }">
          <div class="mentor-speech-title" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              ${
                this.speechType === 'SUCCESS' ? Icons.check :
                this.speechType === 'WARN' ? Icons.alertTriangle :
                this.speechType === 'HELP' ? Icons.info :
                Icons.lightbulb
              } Orientação do Chefe Wilson:
            </span>
            ${
              this.speechType === 'HELP' ? `<span class="erp-badge erp-badge-primary text-xs font-mono">AJUDA ATIVA</span>` :
              this.speechType === 'SUCCESS' ? `<span class="erp-badge erp-badge-success text-xs font-mono">AVANÇO</span>` :
              this.speechType === 'WARN' ? `<span class="erp-badge erp-badge-warning text-xs font-mono">ATENÇÃO</span>` :
              ''
            }
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: var(--erp-navy-900); margin: 0 0 10px 0; white-space: pre-line; word-break: break-word;">
            ${this.currentSpeech || scenario.mentorInitialTip}
          </p>

          <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed var(--erp-border-subtle); padding-top: 8px; margin-top: 6px;">
            <button id="btn-request-mentor-help" class="btn btn-secondary btn-xs" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600;" title="Consultar orientação do supervisor sem penalidade de XP">
              ${Icons.lightbulb} Pedir Ajuda ao Chefe Wilson
            </button>
            ${this.speechType !== 'DEFAULT' ? `
              <button id="btn-reset-mentor-speech" class="btn btn-secondary btn-xs" style="width: 100%; font-size: 11px; color: var(--erp-text-muted); background: transparent; border: none;" title="Retornar à dica inicial da atividade">
                ${Icons.refresh} Voltar à orientação inicial
              </button>
            ` : ''}
          </div>
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
        const firstScenario = ScenarioCatalog[0];
        if (firstScenario) {
          scenarioEngine.startScenario(firstScenario.id);
          this.onNavigate(firstScenario.initialTcode || 'VA01');
        }
      });
    }

    const helpBtn = this.container.querySelector('#btn-request-mentor-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        const scenario = scenarioEngine.getActiveScenario();
        if (scenario) {
          const helpText = `Olá, trainee! Estou acompanhando sua atividade.\n\n${scenario.mentorInitialTip}\n\n💡 Dica do Supervisor: Você também pode consultar a aba "Guia SAP" no topo deste painel para entender os conceitos de negócio e tabelas envolvidas nesta transação.`;
          this.setMentorSpeech(helpText, 'HELP');
        }
      });
    }

    const poAnalysisBtn = this.container.querySelector('#btn-confirm-po-analysis');
    if (poAnalysisBtn) {
      poAnalysisBtn.addEventListener('click', () => {
        const scenario = scenarioEngine.getActiveScenario();
        const poNumber = scenario?.purchaseOrderDocument?.poNumber;
        const result = scenarioEngine.validatePurchaseOrderAnalysis(poNumber);
        if (result.isValid) {
          this.setMentorSpeech(`Pedido de compra ${poNumber} analisado. Confira as metas restantes para seguir.`, 'SUCCESS');
          this.render();
        } else {
          this.setMentorSpeech(result.mentorSpeech, 'WARN');
        }
      });
    }

    const resetSpeechBtn = this.container.querySelector('#btn-reset-mentor-speech');
    if (resetSpeechBtn) {
      resetSpeechBtn.addEventListener('click', () => {
        this.resetSpeech();
      });
    }
  }

  getElement() {
    return this.container;
  }
}
