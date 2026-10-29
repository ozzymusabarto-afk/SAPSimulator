/**
 * NexusTech ERP • Sidebar Component (SAP Simulator Global Navigation)
 * Menu lateral fixo institucional e painel de identidade do Trainee
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';
import { aboutModal } from './aboutModal.js';
import { welcomeModal } from './welcomeModal.js';
import { authService } from '../core/auth/authService.js';

export class SidebarComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('aside');
    this.container.className = 'sap-sidebar';
    this.currentActiveRoute = 'DASHBOARD';

    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'sidebar-mobile-backdrop';
    this.backdropEl.id = 'sidebar-mobile-backdrop';

    // Inscreve para atualizações em tempo real de XP, Nível e Autenticação
    trainee.subscribe(() => this.updateTraineeCard());
    authService.onAuthStateChanged(() => this.updateTraineeCard());
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();
    const currentUser = authService.getCurrentUser();
    const displayName = currentUser ? currentUser.name : profile.name;
    const displayInitial = (displayName || 'T').charAt(0).toUpperCase();

    // Garante que o backdrop esteja no DOM
    if (!document.getElementById('sidebar-mobile-backdrop')) {
      document.body.appendChild(this.backdropEl);
    }

    this.container.innerHTML = `
      <!-- Cabeçalho / Brand Oficial: NEXUS ERP LAB -->
      <div class="sidebar-brand-container" id="sidebar-brand-btn" title="Nexus ERP Lab • Ir para o Início">
        <div class="sidebar-brand-badge">NEXUS</div>
        <div class="sidebar-brand-info">
          <div class="sidebar-brand-text">ERP LAB</div>
          <div class="sidebar-brand-sub">SD PRACTICE</div>
        </div>
        <button class="sidebar-close-btn" id="sidebar-close-btn" title="Fechar Menu" aria-label="Fechar Menu">
          ${Icons.x}
        </button>
      </div>

      <!-- Menu de Navegação Principal -->
      <nav class="sidebar-nav">
        <button class="sidebar-nav-item ${this.currentActiveRoute === 'DASHBOARD' ? 'active' : ''}" data-route="DASHBOARD">
          <span class="sidebar-nav-icon">${Icons.home}</span>
          <span class="sidebar-nav-label">Início</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'MISSOES' ? 'active' : ''}" data-route="MISSOES">
          <span class="sidebar-nav-icon">${Icons.target}</span>
          <span class="sidebar-nav-label">Missões</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'TREINAMENTO' ? 'active' : ''}" data-route="TREINAMENTO">
          <span class="sidebar-nav-icon">${Icons.zap}</span>
          <span class="sidebar-nav-label">Treinamento</span>
        </button>

        <button class="sidebar-nav-item" id="sidebar-tutorial-btn" title="Reabrir o tutorial do primeiro expediente">
          <span class="sidebar-nav-icon">${Icons.bookOpen}</span>
          <span class="sidebar-nav-label">Tutorial do expediente</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'MINHA_JORNADA' ? 'active' : ''}" data-route="MINHA_JORNADA">
          <span class="sidebar-nav-icon">${Icons.compass}</span>
          <span class="sidebar-nav-label">Minha Jornada</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'BONUS' ? 'active' : ''}" data-route="BONUS">
          <span class="sidebar-nav-icon">${Icons.gift}</span>
          <span class="sidebar-nav-label">Bônus</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'PROGRESSO' ? 'active' : ''}" data-route="PROGRESSO">
          <span class="sidebar-nav-icon">${Icons.trendingUp}</span>
          <span class="sidebar-nav-label">Meu Progresso</span>
        </button>

        <button class="sidebar-nav-item ${this.currentActiveRoute === 'CONFIGURACOES' ? 'active' : ''}" data-route="CONFIGURACOES">
          <span class="sidebar-nav-icon">${Icons.settings}</span>
          <span class="sidebar-nav-label">Configurações</span>
        </button>

        <button class="sidebar-nav-item" id="sidebar-about-btn" title="Conheça o projeto e o manifesto de independência">
          <span class="sidebar-nav-icon">${Icons.bookOpen}</span>
          <span class="sidebar-nav-label">Sobre o Nexus</span>
        </button>
      </nav>

      <!-- Área Inferior do Trainee -->
      <div class="sidebar-footer">
        <div class="sidebar-trainee-card" id="sidebar-trainee-trigger" title="Ver Painel do Trainee">
          <div class="sidebar-trainee-header">
            <div class="sidebar-trainee-avatar">
              <span class="sidebar-trainee-avatar-text">${displayInitial}</span>
            </div>
            <div class="sidebar-trainee-info">
              <div class="sidebar-trainee-name">${displayName}</div>
              <div class="sidebar-trainee-level">Nível ${levelInfo.level}</div>
            </div>
          </div>
          <div class="sidebar-xp-container">
            <div class="sidebar-xp-bar">
              <div class="sidebar-xp-fill" style="width: ${levelInfo.progressPercent}%;"></div>
            </div>
            <div class="sidebar-xp-label">
              <span>${profile.xp.toLocaleString('pt-BR')} / ${levelInfo.nextMinXp.toLocaleString('pt-BR')} XP</span>
            </div>
          </div>
        </div>

        <!-- Ação Discreta de Logout -->
        <div class="sidebar-logout-container" style="margin-top: 0.6rem; text-align: center;">
          <button class="sidebar-logout-btn" id="sidebar-logout-btn" title="Encerrar Sessão no Simulador" style="background: none; border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-size: 0.72rem; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; font-family: inherit;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sair do Nexus</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Clique no backdrop ou botão fechar fecha o menu mobile
    this.backdropEl.onclick = () => this.closeMobileDrawer();

    const closeBtn = this.container.querySelector('#sidebar-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeMobileDrawer();
    }

    // Clique na marca leva ao Início
    const brandBtn = this.container.querySelector('#sidebar-brand-btn');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => {
        this.closeMobileDrawer();
        this.setActiveRoute('DASHBOARD');
        this.onNavigate('DASHBOARD');
      });
    }

    // Clique em Sobre o Nexus
    const aboutBtn = this.container.querySelector('#sidebar-about-btn');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => {
        this.closeMobileDrawer();
        aboutModal.show();
      });
    }

    const tutorialBtn = this.container.querySelector('#sidebar-tutorial-btn');
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => {
        this.closeMobileDrawer();
        welcomeModal.showTutorial();
      });
    }

    // Clique nos itens de navegação
    this.container.querySelectorAll('.sidebar-nav-item[data-route]').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        if (route) {
          this.closeMobileDrawer();
          this.setActiveRoute(route);
          this.onNavigate(route);
        }
      });
    });

    // Clique no card do trainee
    const traineeTrigger = this.container.querySelector('#sidebar-trainee-trigger');
    if (traineeTrigger) {
      traineeTrigger.addEventListener('click', () => {
        this.closeMobileDrawer();
        this.setActiveRoute('DASHBOARD');
        this.onNavigate('DASHBOARD');
      });
    }

    // Botão de Logout
    const logoutBtn = this.container.querySelector('#sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileDrawer();
        this.onNavigate('LOGOUT');
      });
    }
  }

  openMobileDrawer() {
    this.container.classList.add('mobile-open');
    if (this.backdropEl) {
      this.backdropEl.classList.add('active');
    }
  }

  closeMobileDrawer() {
    this.container.classList.remove('mobile-open');
    if (this.backdropEl) {
      this.backdropEl.classList.remove('active');
    }
  }

  toggleMobileDrawer() {
    if (this.container.classList.contains('mobile-open')) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  setActiveRoute(routeKey) {
    this.currentActiveRoute = routeKey;
    this.container.querySelectorAll('.sidebar-nav-item').forEach(btn => {
      const r = btn.getAttribute('data-route');
      if (r === routeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateTraineeCard() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();

    const nameEl = this.container.querySelector('.sidebar-trainee-name');
    const levelEl = this.container.querySelector('.sidebar-trainee-level');
    const fillEl = this.container.querySelector('.sidebar-xp-fill');
    const xpLabelEl = this.container.querySelector('.sidebar-xp-label span');

    if (nameEl) nameEl.textContent = profile.name;
    if (levelEl) levelEl.textContent = `Nível ${levelInfo.level}`;
    if (fillEl) fillEl.style.width = `${levelInfo.progressPercent}%`;
    if (xpLabelEl) xpLabelEl.textContent = `${profile.xp.toLocaleString('pt-BR')} / ${levelInfo.nextMinXp.toLocaleString('pt-BR')} XP`;
  }

  getElement() {
    return this.container;
  }
}
