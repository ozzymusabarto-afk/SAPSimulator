/**
 * NexusTech ERP • Topbar Component
 * Barra Superior Corporativa com Command Bar (T-Codes) e Trainee HUD
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';
import { authService } from '../core/auth/authService.js';

export class TopbarComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('header');
    this.container.className = 'erp-topbar';
    
    // Inscreve para atualizações de XP, Nível e Autenticação
    trainee.subscribe(() => this.render());
    authService.onAuthStateChanged(() => this.render());
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();
    const currentUser = authService.getCurrentUser();
    const displayName = currentUser ? currentUser.name : profile.name;
    const displayInitial = (displayName || 'T').charAt(0).toUpperCase();

    this.container.innerHTML = `
      <!-- Left: Contexto do Sistema e Retorno ao Início em Modo Missão -->
      <div class="erp-topbar-left">
        <button class="topbar-mobile-menu-btn" id="topbar-mobile-menu-btn" title="Abrir Menu de Navegação" aria-label="Abrir Menu">
          ${Icons.menu}
        </button>
        <button class="topbar-home-btn" id="topbar-home-btn" title="Voltar ao Início / Dashboard">
          ${Icons.home} <span class="topbar-home-btn-text">Início</span>
        </button>
        <span class="erp-badge erp-badge-sap text-xs font-mono">PRD-SD01 • Mandante 800</span>
        <span class="topbar-context-title" id="topbar-brand-title" title="Ir para o Início">Nexus ERP Lab • SD Practice Environment</span>
      </div>

      <!-- Center: Barra de Comandos / T-Codes (OK-Code) -->
      <div class="erp-command-bar">
        <span class="erp-tcode-prefix">/n</span>
        <input 
          type="text" 
          id="tcode-input" 
          class="erp-tcode-input" 
          placeholder="Digitar transação ou buscar (ex: VA01, XD03, MM03, VKM1)"
          autocomplete="off" 
          spellcheck="false"
        />
        <button id="tcode-submit-btn" class="erp-tcode-btn" title="Executar Transação (Enter)">
          ${Icons.play} <span class="tcode-btn-text">Executar</span>
        </button>
      </div>

      <!-- Right: Notificações, Chip do Trainee & Logout -->
      <div class="erp-topbar-right">
        <!-- Ícone de Notificações -->
        <button class="topbar-icon-btn" id="topbar-notif-btn" title="Notificações do Sistema">
          ${Icons.bell}
          <span class="topbar-notif-badge"></span>
        </button>

        <!-- Chip de Perfil do Trainee -->
        <div class="topbar-trainee-chip" id="trainee-profile-trigger" title="Ir para Painel Principal">
          <div class="topbar-trainee-avatar">${displayInitial}</div>
          <div class="topbar-trainee-info">
            <span class="topbar-trainee-name">${displayName}</span>
            <span class="topbar-trainee-status">Nível ${levelInfo.level} • Trainee</span>
          </div>
        </div>

        <!-- Botão de Logout -->
        <button class="topbar-icon-btn" id="topbar-logout-btn" title="Encerrar Sessão / Logout" aria-label="Sair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const input = this.container.querySelector('#tcode-input');
    const submitBtn = this.container.querySelector('#tcode-submit-btn');

    const handleExecuteTCode = () => {
      let val = input.value.trim().toUpperCase();
      if (val.startsWith('/N')) {
        val = val.substring(2);
      }
      if (val) {
        this.onNavigate(val);
        input.value = '';
      }
    };

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleExecuteTCode();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', handleExecuteTCode);
    }

    // Botão de Menu Hambúrguer Mobile (Drawer)
    const mobileMenuBtn = this.container.querySelector('#topbar-mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        if (window.app && window.app.sidebar && typeof window.app.sidebar.toggleMobileDrawer === 'function') {
          window.app.sidebar.toggleMobileDrawer();
        }
      });
    }

    // Clique para voltar ao Dashboard no modo missão
    const homeBtn = this.container.querySelector('#topbar-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        this.onNavigate('DASHBOARD');
      });
    }

    const brandTitle = this.container.querySelector('#topbar-brand-title');
    if (brandTitle) {
      brandTitle.addEventListener('click', () => {
        this.onNavigate('DASHBOARD');
      });
    }

    // Clique no perfil para ir ao Dashboard
    const profileBadge = this.container.querySelector('#trainee-profile-trigger');
    if (profileBadge) {
      profileBadge.addEventListener('click', () => {
        this.onNavigate('DASHBOARD');
      });
    }

    // Notificações
    const notifBtn = this.container.querySelector('#topbar-notif-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        const profile = trainee.getProfile();
        const lastAction = profile.auditLog[0];
        const msg = lastAction ? `Última ação: ${lastAction.action} (${lastAction.description})` : 'Nenhuma notificação recente pendente.';
        alert(`Central de Notificações:\n\n${msg}`);
      });
    }

    // Botão de Logout
    const logoutBtn = this.container.querySelector('#topbar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.onNavigate('LOGOUT');
      });
    }
  }

  setActiveRoute(tcode) {
    // Topbar agora é focada em comando e perfil; estado é gerenciado centralmente
  }

  getElement() {
    return this.container;
  }
}
