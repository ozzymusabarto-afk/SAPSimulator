/**
 * NexusTech ERP • Application Central Orchestrator (App.js)
 * Gerenciador de Ciclo de Vida, Rotas de Transações e Estado do Simulador
 */

import { TopbarComponent } from './components/topbar.js';
import { SidebarComponent } from './components/sidebar.js';
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
import { MyJourneyViewComponent } from './components/transactions/myJourneyView.js';
import { TrainingViewComponent } from './components/transactions/trainingView.js';
import { BonusViewComponent } from './components/transactions/bonusView.js';
import { RankingViewComponent } from './components/transactions/rankingView.js';
import { ConfiguracoesViewComponent } from './components/transactions/configuracoesView.js';

import { scenarioEngine } from './core/engine/scenarioEngine.js';
import { trainee } from './core/engine/traineeEngine.js';
import { traineeRepository } from './core/repository/traineeRepository.js';
import { authService } from './core/auth/authService.js';
import { AuthViewComponent } from './components/auth/authView.js';
import { fieldHelpModal } from './components/fieldHelpModal.js';
import { welcomeModal } from './components/welcomeModal.js';
import { aboutModal } from './components/aboutModal.js';

class App {
  constructor() {
    this.rootEl = document.getElementById('root');
    this.currentRoute = 'DASHBOARD';
    this.routeParams = {};

    // Componente de Autenticação (Fase 1A.10)
    this.authView = new AuthViewComponent({
      onAuthSuccess: this.handleAuthSuccess.bind(this)
    });

    // Componentes de Layout Persistentes
    this.sidebar = new SidebarComponent(this.navigate.bind(this));
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
      VF03: new Vf03ViewComponent(this.navigate.bind(this)),
      MINHA_JORNADA: new MyJourneyViewComponent(this.navigate.bind(this)),
      TREINAMENTO: new TrainingViewComponent(this.navigate.bind(this)),
      BONUS: new BonusViewComponent(this.navigate.bind(this)),
      RANKING: new RankingViewComponent(this.navigate.bind(this)),
      CONFIGURACOES: new ConfiguracoesViewComponent(this.navigate.bind(this))
    };

    // Subscrição para atualizar a statusbar e mudanças de autenticação
    trainee.subscribe(() => this.updateStatusBar());
    authService.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
  }

  async handleAuthStateChanged(user) {
    if (!user) {
      // Usuário deslogado: renderiza a tela de login/auth guard
      if (this.rootEl) {
        this.rootEl.innerHTML = '';
        this.rootEl.appendChild(this.authView.render());
      }
      const appRoot = document.getElementById('app-root');
      if (appRoot) appRoot.classList.remove('mission-mode');
    } else {
      // Usuário autenticado: associa sessão no traineeRepository e recarrega perfil correto
      traineeRepository.setSessionUserId(user.uid);
      await traineeRepository.hydrateProfileFromCloud(user.uid);
      trainee.reloadForUser(user.uid); // F1-D: garante perfil isolado por userId
      if (!document.getElementById('app-root')) {
        this.renderLayout();
        const targetScenarioId = scenarioEngine.getCurrentActiveOrPendingScenarioId();
        if (targetScenarioId) {
          scenarioEngine.startScenario(targetScenarioId);
        }
        const targetRoute = this.currentRoute && this.views[this.currentRoute] && this.currentRoute !== 'LOGIN' ? this.currentRoute : 'DASHBOARD';
        this.navigate(targetRoute);
      }
    }
  }

  async handleAuthSuccess(user) {
    if (user) {
      traineeRepository.setSessionUserId(user.uid);
      await traineeRepository.hydrateProfileFromCloud(user.uid);
      trainee.reloadForUser(user.uid); // F1-D: garante perfil isolado por userId
      if (!document.getElementById('app-root')) {
        this.renderLayout();
      }
      const targetScenarioId = scenarioEngine.getCurrentActiveOrPendingScenarioId();
      if (targetScenarioId) {
        scenarioEngine.startScenario(targetScenarioId);
      }
      const targetRoute = this.currentRoute && this.views[this.currentRoute] && this.currentRoute !== 'LOGIN' ? this.currentRoute : 'DASHBOARD';
      this.navigate(targetRoute);
      if (welcomeModal.shouldShowOnboarding()) {
        welcomeModal.show();
      }
    }
  }

  init() {
    window.app = this;

    // Verifica estado inicial de autenticação (Auth Guard)
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(this.authView.render());
    } else {
      traineeRepository.setSessionUserId(currentUser.uid);

      // Inicia a missão em andamento ou a próxima pendente da trilha oficial
      const targetScenarioId = scenarioEngine.getCurrentActiveOrPendingScenarioId();
      scenarioEngine.startScenario(targetScenarioId);

      this.renderLayout();

      const hashRoute = window.location.hash ? window.location.hash.replace('#', '') : 'DASHBOARD';
      this.navigate(hashRoute || 'DASHBOARD');

      // Exibe a experiência de boas-vindas / primeiro dia se for o primeiro acesso
      if (welcomeModal.shouldShowOnboarding()) {
        welcomeModal.show();
      }
    }

    window.addEventListener('hashchange', () => {
      const r = window.location.hash ? window.location.hash.replace('#', '') : 'DASHBOARD';
      this.navigate(r || 'DASHBOARD');
    });

    // F1-A: Aviso ao fechar/recarregar aba com missão ativa em andamento.
    // O estado ERP (ORs, remessas, faturas) é 100% em memória e será perdido ao recarregar.
    // O trainee precisa ser avisado para não perder o contexto da missão.
    window.addEventListener('beforeunload', (e) => {
      const activeScenario = scenarioEngine.getActiveScenario();
      if (!activeScenario) return;

      // Só alerta se a missão ainda não foi concluída
      if (trainee.isScenarioCompleted(activeScenario.id)) return;

      // Mensagem padrão do browser (texto customizado é ignorado na maioria dos browsers modernos,
      // mas a presença do returnValue ativa o diálogo nativo de confirmação)
      const msg = 'Você tem uma missão SAP em andamento. Recarregar a página vai reiniciar o estado do ERP (documentos criados serão perdidos). Deseja continuar?';
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    });
  }

  renderLayout() {
    if (document.getElementById('app-root')) return;
    this.rootEl.innerHTML = `
      <div id="app-root">
        <!-- Sidebar Global de Navegação (Nexus ERP Lab) -->
        <div id="layout-sidebar-slot"></div>

        <!-- Coluna Principal da Aplicação -->
        <div class="app-main-column">
          <!-- Topbar Fixa -->
          <div id="layout-topbar-slot"></div>

          <!-- Barra de Processos Comerciais SD -->
          <div id="layout-stepper-slot"></div>

          <!-- Estrutura de Trabalho e Mentor Dock -->
          <div class="app-workspace-layout">
            <!-- Área Central de Transações / Dashboard -->
            <main class="app-main-content" id="layout-workspace-slot"></main>

            <!-- Dock Lateral do Mentor Chefe Wilson -->
            <div id="layout-mentor-slot"></div>
          </div>

          <!-- Statusbar Corporativa no Rodapé -->
          <footer class="erp-statusbar" id="layout-statusbar-slot">
            <div class="erp-status-message">
              <span class="erp-status-icon-ok">●</span>
              <span id="status-message-text">Sistema conectado • Nexus ERP Lab • SD Practice Environment</span>
            </div>
            <div class="erp-status-system-info">
              <span style="color: #cbd5e1; font-weight: 500;">Desenvolvido por Adriana Martins</span>
              <span>Servidor: PRD-SD01</span>
              <span>Mandante: 800</span>
              <span id="statusbar-user-display">Usuário: ${authService.getCurrentUser() ? (authService.getCurrentUser().displayName || authService.getCurrentUser().email) : 'TRAINEE_01'}</span>
            </div>
          </footer>
        </div>
      </div>
    `;

    document.getElementById('layout-sidebar-slot').appendChild(this.sidebar.render());
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
    let cleanRoute = (route || '').toUpperCase().replace('/', '');

    // Auth Guard: se usuário não autenticado, restringe acesso aos fluxos de autenticação
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      if (cleanRoute === 'REGISTER') {
        this.authView.setMode('REGISTER');
      } else if (cleanRoute === 'FORGOT_PASSWORD' || cleanRoute === 'ESQUECI_SENHA') {
        this.authView.setMode('FORGOT_PASSWORD');
      } else {
        this.authView.setMode('LOGIN');
      }
      if (this.rootEl && !this.rootEl.querySelector('.nexus-auth-container')) {
        this.rootEl.innerHTML = '';
        this.rootEl.appendChild(this.authView.render());
      }
      return;
    }

    // Se usuário já autenticado tentar acessar rotas de autenticação, redireciona ao DASHBOARD
    if (['LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'ESQUECI_SENHA'].includes(cleanRoute)) {
      cleanRoute = 'DASHBOARD';
    }

    // Rota de Logout explícita
    if (cleanRoute === 'LOGOUT' || cleanRoute === 'SAIR') {
      authService.logout();
      return;
    }
    
    // Normalização de rotas
    let targetViewKey = cleanRoute;
    if (cleanRoute === 'DASH' || cleanRoute === 'HOME' || cleanRoute === 'INICIO') {
      targetViewKey = 'DASHBOARD';
    } else if (cleanRoute === 'MISSOES') {
      targetViewKey = 'DASHBOARD';
      this.sidebar.setActiveRoute('MISSOES');
      setTimeout(() => {
        const targetSection = document.getElementById('completion-summary-card') || document.querySelector('.erp-card');
        if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (cleanRoute === 'PROGRESSO') {
      targetViewKey = 'DASHBOARD';
      this.sidebar.setActiveRoute('PROGRESSO');
      setTimeout(() => {
        const kpiGrid = document.querySelector('.kpi-grid');
        if (kpiGrid) kpiGrid.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (cleanRoute === 'MINHA_JORNADA' || cleanRoute === 'JOURNEY' || cleanRoute === 'JORNADA') {
      targetViewKey = 'MINHA_JORNADA';
    } else if (cleanRoute === 'TREINAMENTO' || cleanRoute === 'TRAINING' || cleanRoute === 'TREINO') {
      targetViewKey = 'TREINAMENTO';
    } else if (cleanRoute === 'BONUS' || cleanRoute === 'BONUSES') {
      targetViewKey = 'BONUS';
    } else if (cleanRoute === 'ABOUT' || cleanRoute === 'SOBRE') {
      aboutModal.show();
      return;
    }

    if (!this.views[targetViewKey]) {
      this.setStatusMessage(`Transação /n${cleanRoute} não encontrada no mandante 800. Tente VA01, VA03, XD03, MM03, VK11 ou VKM1.`, 'WARN');
      return;
    }

    this.currentRoute = targetViewKey;
    this.routeParams = params;

    // Atualiza indicadores de rota na Sidebar, Topbar e ProcessStepper
    if (cleanRoute !== 'MISSOES' && cleanRoute !== 'PROGRESSO') {
      this.sidebar.setActiveRoute(targetViewKey);
    }
    this.topbar.setActiveRoute(targetViewKey);
    this.processStepper.setCurrentTCode(targetViewKey);

    // Modo Missão / Modo Operacional: desativa a sidebar nas telas de missão operacional para priorizar o workspace
    // Mantém a sidebar aberta e oculta o Mentor Dock/Stepper em telas institucionais/pedagógicas
    const isInstitutionalView = ['DASHBOARD', 'MINHA_JORNADA', 'TREINAMENTO', 'BONUS', 'PROGRESSO', 'CONFIGURACOES', 'RANKING'].includes(targetViewKey);
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      if (isInstitutionalView) {
        appRoot.classList.remove('mission-mode');
      } else {
        appRoot.classList.add('mission-mode');
      }
    }

    // Ajusta visibilidade contextual do Mentor Dock e Stepper (apenas durante transações operacionais ativas)
    const mentorSlot = document.getElementById('layout-mentor-slot');
    const stepperSlot = document.getElementById('layout-stepper-slot');
    if (mentorSlot) {
      mentorSlot.style.display = isInstitutionalView ? 'none' : 'flex';
    }
    if (stepperSlot) {
      stepperSlot.style.display = isInstitutionalView ? 'none' : 'flex';
    }

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
    const userEl = document.getElementById('statusbar-user-display');
    if (userEl) {
      const user = authService.getCurrentUser();
      userEl.textContent = user ? `Usuário: ${user.displayName || user.email}` : 'Usuário: TRAINEE_01';
    }
  }
}

// Inicializa quando o DOM estiver pronto ou de imediato se o documento já estiver carregado
const bootApp = () => {
  if (!window.app) {
    const app = new App();
    window.app = app;
    app.init();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
