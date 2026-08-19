/**
 * NexusTech ERP • Topbar Component
 * Barra Superior Corporativa com Command Bar (T-Codes) e Trainee HUD
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';

export class TopbarComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('header');
    this.container.className = 'erp-topbar';
    
    // Inscreve para atualizações de XP e Nível
    trainee.subscribe(() => this.render());
  }

  render() {
    const profile = trainee.getProfile();
    const levelInfo = trainee.getCurrentLevelInfo();

    this.container.innerHTML = `
      <!-- Brand & Identidade Corporativa -->
      <div class="erp-brand-container">
        <div class="erp-brand-logo">N</div>
        <div class="erp-brand-info">
          <div class="erp-brand-title">
            NexusTech ERP
            <span class="erp-badge erp-badge-sap text-xs">Simulador SD</span>
          </div>
          <div class="erp-brand-subtitle">Ambiente Educacional de Treinamento Comercial</div>
        </div>
      </div>

      <!-- Barra de Comandos / T-Codes (OK-Code) -->
      <div class="erp-command-bar">
        <span class="erp-tcode-prefix">/n</span>
        <input 
          type="text" 
          id="tcode-input" 
          class="erp-tcode-input" 
          placeholder="Digitar transação (ex: VA01, XD03, MM03, VKM1)" 
          autocomplete="off" 
          spellcheck="false"
        />
        <button id="tcode-submit-btn" class="erp-tcode-btn" title="Executar Transação (Enter)">
          ${Icons.play} Executar
        </button>
      </div>

      <!-- Atalhos Rápidos & Trainee HUD -->
      <div class="erp-trainee-hud">
        <!-- Botões de Navegação Rápida -->
        <div class="erp-quick-nav">
          <button class="erp-nav-btn" data-route="DASHBOARD" title="Visão Geral & Central de Chamados">
            ${Icons.layers} Início
          </button>
          <button class="erp-nav-btn" data-route="VA01" title="Criar Ordem de Venda">
            ${Icons.fileText} VA01
          </button>
          <button class="erp-nav-btn" data-route="XD03" title="Consultar Clientes">
            ${Icons.users} XD03
          </button>
          <button class="erp-nav-btn" data-route="MM03" title="Consultar Materiais & Estoque">
            ${Icons.package} MM03
          </button>
          <button class="erp-nav-btn" data-route="VKM1" title="Liberação de Crédito Comercial">
            ${Icons.shieldAlert} VKM1
          </button>
        </div>

        <!-- Perfil do Trainee & Barra de XP -->
        <div class="erp-trainee-level-badge" id="trainee-profile-trigger" title="Clique para ver o Painel de Carreira">
          <div class="erp-trainee-avatar">${levelInfo.level}</div>
          <div class="erp-trainee-meta">
            <span class="erp-trainee-name">${profile.name}</span>
            <span class="erp-trainee-role">${profile.role}</span>
          </div>
          <div class="erp-xp-bar-container">
            <div class="erp-xp-label">
              <span>XP</span>
              <span>${profile.xp} / ${levelInfo.nextMinXp}</span>
            </div>
            <div class="erp-xp-track">
              <div class="erp-xp-fill" style="width: ${levelInfo.progressPercent}%;"></div>
            </div>
          </div>
        </div>
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

    // Atalhos de botões rápidos
    this.container.querySelectorAll('.erp-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        if (route) this.onNavigate(route);
      });
    });

    // Clique no perfil para ir ao Dashboard de Carreira
    const profileBadge = this.container.querySelector('#trainee-profile-trigger');
    if (profileBadge) {
      profileBadge.addEventListener('click', () => {
        this.onNavigate('DASHBOARD');
      });
    }
  }

  setActiveRoute(tcode) {
    this.container.querySelectorAll('.erp-nav-btn').forEach(btn => {
      const r = btn.getAttribute('data-route');
      if (r === tcode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  getElement() {
    return this.container;
  }
}
