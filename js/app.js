/**
 * NexusTech ERP • Application Central Orchestrator (App.js)
 * Gerenciador de Ciclo de Vida, Rotas de Transações e Estado do Simulador
 */

import { TopbarComponent } from './components/topbar.js';
import { ProcessStepperComponent } from './components/processStepper.js';
import { MentorDockComponent } from './components/mentorDock.js';

import { DashboardViewComponent } from './components/transactions/dashboardView.js';
import { Va01ViewComponent } from './components/transactions/va01View.js';
import { Va02ViewComponent } from './components/transactions/va02View.js';
import { Va03ViewComponent } from './components/transactions/va03View.js';
import { Xd03ViewComponent } from './components/transactions/xd03View.js';
import { Mm03ViewComponent } from './components/transactions/mm03View.js';
import { Vk11ViewComponent } from './components/transactions/vk11View.js';
import { Vkm1ViewComponent } from './components/transactions/vkm1View.js';
import { Vl01nViewComponent } from './components/transactions/vl01nView.js';
import { Vl02nViewComponent } from './components/transactions/vl02nView.js';
import { Vl03nViewComponent } from './components/transactions/vl03nView.js';
import { Vf01ViewComponent } from './components/transactions/vf01View.js';
import { Vf02ViewComponent } from './components/transactions/vf02View.js';
import { Vf03ViewComponent } from './components/transactions/vf03View.js';

import { scenarioEngine } from './core/engine/scenarioEngine.js';
import { trainee } from './core/engine/traineeEngine.js';
import { fieldHelpModal } from './components/fieldHelpModal.js';
import { welcomeModal } from './components/welcomeModal.js';

class App {
  constructor() {
    this.rootEl = document.getElementById('root');
    this.currentRoute = 'DASHBOARD';
    this.routeParams = {};

    // Componentes de Layout Persistentes
    this.topbar = new TopbarComponent(this.navigate.bind(this));
    this.processStepper = new ProcessStepperComponent(this.navigate.bind(this));
    this.mentorDock = new MentorDockComponent(this.navigate.bind(this));

    // Instâncias das Visualizações de Transação
    this.views = {
      DASHBOARD: new DashboardViewComponent(this.navigate.bind(this)),
      VA01: new Va01ViewComponent(this.navigate.bind(this)),
      VA02: new Va02ViewComponent(this.navigate.bind(this)),
      VA03: new Va03ViewComponent(this.navigate.bind(this)),
      XD03: new Xd03ViewComponent(this.navigate.bind(this)),
      MM03: new Mm03ViewComponent(this.navigate.bind(this)),
      VK11: new Vk11ViewComponent(this.navigate.bind(this)),
      VKM1: new Vkm1ViewComponent(this.navigate.bind(this)),
      VL01N: new Vl01nViewComponent(this.navigate.bind(this)),
      VL02N: new Vl02nViewComponent(this.navigate.bind(this)),
      VL03N: new Vl03nViewComponent(this.navigate.bind(this)),
      VF01: new Vf01ViewComponent(this.navigate.bind(this)),
      VF02: new Vf02ViewComponent(this.navigate.bind(this)),
      VF03: new Vf03ViewComponent(this.navigate.bind(this))
    };

    // Subscrição para atualizar a statusbar
    trainee.subscribe(() => this.updateStatusBar());
  }

  init() {
    // Inicia a missão em andamento ou a próxima pendente da trilha oficial
    const targetScenarioId = scenarioEngine.getCurrentActiveOrPendingScenarioId();
    scenarioEngine.startScenario(targetScenarioId);

    this.renderLayout();
    this.navigate('DASHBOARD');

    // Exibe a experiência de boas-vindas / primeiro dia se for o primeiro acesso
    if (welcomeModal.shouldShowOnboarding()) {
      welcomeModal.show();
    }
  }

  renderLayout() {
    this.rootEl.innerHTML = `
      <div id="app-root">
        <!-- Topbar Fixa -->
        <div id="layout-topbar-slot"></div>

        <!-- Barra de Processos Comerciais SD -->
        <div id="layout-stepper-slot"></div>

        <!-- Estrutura de Trabalho e Mentor Dock -->
        <div class="app-workspace-layout">
          <!-- Área Central de Transações -->
          <main class="app-main-content" id="layout-workspace-slot"></main>

          <!-- Dock Lateral do Gestor Carlos Eduardo -->
          <div id="layout-mentor-slot"></div>
        </div>

        <!-- Statusbar Corporativa no Rodapé -->
        <footer class="erp-statusbar" id="layout-statusbar-slot">
          <div class="erp-status-message">
            <span class="erp-status-icon-ok">●</span>
            <span id="status-message-text">Sistema conectado • NexusTech Distribuidora S/A • Ambiente Educacional Ativo</span>
          </div>
          <div class="erp-status-system-info">
            <span style="color: #cbd5e1; font-weight: 500;">Desenvolvido por Adriana Martins</span>
            <span>Servidor: PRD-SD01</span>
            <span>Mandante: 800</span>
            <span>Usuário: TRAINEE_01</span>
          </div>
        </footer>
      </div>
    `;

    document.getElementById('layout-topbar-slot').appendChild(this.topbar.render());
    document.getElementById('layout-stepper-slot').appendChild(this.processStepper.render());
    document.getElementById('layout-mentor-slot').appendChild(this.mentorDock.render());
  }

  /**
   * Navega para uma transação ou tela
   * @param {string} route - ex: 'VA01', 'XD03', 'MM03', 'VK11', 'VKM1', 'DASHBOARD'
   * @param {Object} params - Parâmetros opcionais (ex: { docNumber: '10000001' })
   */
  navigate(route, params = {}) {
    const cleanRoute = route.toUpperCase().replace('/', '');
    
    // Normalização de rotas
    let targetViewKey = cleanRoute;
    if (cleanRoute === 'DASH' || cleanRoute === 'HOME' || cleanRoute === 'INICIO') {
      targetViewKey = 'DASHBOARD';
    }

    if (!this.views[targetViewKey]) {
      this.setStatusMessage(`Transação /n${cleanRoute} não encontrada no mandante 800. Tente VA01, VA03, XD03, MM03, VK11 ou VKM1.`, 'WARN');
      return;
    }

    this.currentRoute = targetViewKey;
    this.routeParams = params;

    // Atualiza indicadores de rota no Topbar e ProcessStepper
    this.topbar.setActiveRoute(targetViewKey);
    this.processStepper.setCurrentTCode(targetViewKey);

    // Renderiza a view no workspace slot
    const workspaceSlot = document.getElementById('layout-workspace-slot');
    workspaceSlot.innerHTML = '';

    const viewInstance = this.views[targetViewKey];
    if (viewInstance.setParams) {
      viewInstance.setParams(params);
    }
    workspaceSlot.appendChild(viewInstance.render());

    // Scroll para o topo
    workspaceSlot.scrollTop = 0;

    this.setStatusMessage(`Transação /n${targetViewKey} carregada com sucesso no ambiente de trabalho.`, 'OK');
  }

  setStatusMessage(msg, type = 'OK') {
    const textEl = document.getElementById('status-message-text');
    if (textEl) {
      textEl.textContent = msg;
    }
  }

  updateStatusBar() {
    const profile = trainee.getProfile();
    const lastAction = profile.auditLog[0];
    if (lastAction) {
      this.setStatusMessage(`${lastAction.action}: ${lastAction.description}`, lastAction.status === 'ERROR' ? 'WARN' : 'OK');
    }
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
