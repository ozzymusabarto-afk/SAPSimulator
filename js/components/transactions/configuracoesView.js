/**
 * NexusTech ERP • Configurações View Component
 * Perfil do Trainee, Preferências e Controles de Sessão
 */

import { Icons } from '../../utils/icons.js';
import { trainee } from '../../core/engine/traineeEngine.js';
import { authService } from '../../core/auth/authService.js';
import { scenarioEngine } from '../../core/engine/scenarioEngine.js';

export class ConfiguracoesViewComponent {
  constructor(onNavigate) {
    this.onNavigate = onNavigate;
    this.container = document.createElement('div');
    this.container.className = 'settings-view';
    this.saveStatus = null; // null | 'saving' | 'saved' | 'error'
    this.resetConfirm = false;
  }

  setParams() { this.render(); }

  render() {
    const profile = trainee.getProfile();
    const user = authService.getCurrentUser();
    const completed = (profile.completedScenarios || []).length;

    this.container.innerHTML = `
      <!-- Cabeçalho -->
      <div class="transaction-header-bar" style="margin-bottom: 20px;">
        <div class="transaction-title-group">
          <span class="transaction-tcode-badge">${Icons.settings || '⚙'}</span>
          <div class="transaction-title-text-block">
            <div class="transaction-title">Configurações da Conta</div>
            <div class="text-xs text-muted">Perfil do Trainee, Preferências e Controles de Sessão</div>
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-secondary btn-sm" id="btn-settings-back">
            ${Icons.chevronLeft} Painel
          </button>
        </div>
      </div>

      <!-- Seção: Perfil -->
      <div class="settings-section">
        <div class="settings-section-header">${Icons.user} Perfil do Trainee</div>
        <div class="settings-section-body">
          <div class="settings-field">
            <label>Nome Exibido</label>
            <input type="text" class="erp-input" id="cfg-name" value="${this._escape(profile.name || '')}" placeholder="Seu nome completo" maxlength="60">
          </div>
          <div class="settings-field">
            <label>E-mail (Conta)</label>
            <input type="email" class="erp-input" id="cfg-email" value="${this._escape(user?.email || '')}" disabled style="opacity: 0.6; cursor: not-allowed;">
            <span class="text-xs text-muted">O e-mail é definido no cadastro e não pode ser alterado aqui.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-save-profile">
              ${Icons.check} Salvar Nome
            </button>
            ${this.saveStatus === 'saved' ? `<span class="text-sm" style="color: var(--erp-green-success); font-weight: 600;">${Icons.check} Nome salvo com sucesso!</span>` : ''}
            ${this.saveStatus === 'error' ? `<span class="text-sm" style="color: #e11d48; font-weight: 600;">${Icons.alertTriangle} Erro ao salvar. Tente novamente.</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Seção: Progresso -->
      <div class="settings-section">
        <div class="settings-section-header">${Icons.target} Progresso da Trilha</div>
        <div class="settings-section-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 8px;">
            <div style="background: var(--erp-surface-subtle); border-radius: 8px; padding: 12px 14px; border: 1px solid var(--erp-border-subtle);">
              <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Missões Concluídas</div>
              <div style="font-size: 22px; font-weight: 800; color: var(--erp-blue-primary); font-family: var(--font-mono);">${completed} / 50</div>
            </div>
            <div style="background: var(--erp-surface-subtle); border-radius: 8px; padding: 12px 14px; border: 1px solid var(--erp-border-subtle);">
              <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">XP Total da Carreira</div>
              <div style="font-size: 22px; font-weight: 800; color: var(--erp-green-success); font-family: var(--font-mono);">${(profile.totalCareerXp || 0).toLocaleString('pt-BR')}</div>
            </div>
            <div style="background: var(--erp-surface-subtle); border-radius: 8px; padding: 12px 14px; border: 1px solid var(--erp-border-subtle);">
              <div style="font-size: 10.5px; color: var(--erp-text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Cargo Atual</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--erp-navy-900); margin-top: 4px;">${profile.role}</div>
            </div>
          </div>
          <div class="text-xs text-muted" style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 10px 14px;">
            ${Icons.alertTriangle} <strong>Nota:</strong> O progresso (XP e missões concluídas) é persistido no seu perfil e não é afetado ao fechar a aba.
            Apenas os documentos ERP criados durante a missão são perdidos ao recarregar (estão em memória).
          </div>
        </div>
      </div>

      <!-- Seção: Alterar Senha -->
      <div class="settings-section">
        <div class="settings-section-header">${Icons.lock || '🔒'} Segurança</div>
        <div class="settings-section-body">
          <div class="settings-field">
            <label>Senha Atual</label>
            <input type="password" class="erp-input" id="cfg-pwd-current" placeholder="••••••••" maxlength="80" style="max-width: 360px;">
          </div>
          <div class="settings-field">
            <label>Nova Senha</label>
            <input type="password" class="erp-input" id="cfg-pwd-new" placeholder="Mínimo 6 caracteres" maxlength="80" style="max-width: 360px;">
          </div>
          <div class="settings-field">
            <label>Confirmar Nova Senha</label>
            <input type="password" class="erp-input" id="cfg-pwd-confirm" placeholder="Repita a nova senha" maxlength="80" style="max-width: 360px;">
          </div>
          <div id="cfg-pwd-msg" style="font-size: 12.5px; font-weight: 600;"></div>
          <button class="btn btn-secondary" id="btn-change-password">
            ${Icons.edit} Alterar Senha
          </button>
          <div class="text-xs text-muted">
            Em ambiente local (mock), a senha é armazenada com hash simulado no localStorage.
            Em produção com backend real, a alteração será processada de forma segura via servidor.
          </div>
        </div>
      </div>

      <!-- Seção: Danger Zone -->
      <div class="settings-danger-zone">
        <div style="font-weight: 700; font-size: 14px; color: #9f1239; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          ${Icons.alertTriangle} Zona de Risco
        </div>
        <div class="text-sm" style="color: #be123c; margin-bottom: 14px; line-height: 1.5;">
          Reiniciar o progresso apaga permanentemente todas as missões concluídas, XP acumulado, insígnias e log de auditoria.
          <strong>Esta ação não pode ser desfeita.</strong>
        </div>
        ${this.resetConfirm ? `
          <div style="background: #fff; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 13px; color: #9f1239; margin-bottom: 6px;">Tem certeza absoluta?</div>
            <div class="text-sm" style="color: #be123c; margin-bottom: 12px;">
              Digite <strong>REINICIAR</strong> abaixo para confirmar:
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <input type="text" class="erp-input" id="cfg-reset-confirm-input" placeholder="Digite REINICIAR" style="max-width: 200px; border-color: #fca5a5;">
              <button class="btn" id="btn-confirm-reset" style="background: #e11d48; color: #fff; border: none;">
                ${Icons.trash || '🗑'} Confirmar Reset Total
              </button>
              <button class="btn btn-secondary" id="btn-cancel-reset">Cancelar</button>
            </div>
          </div>
        ` : `
          <button class="btn" id="btn-reset-progress" style="background: #fff1f2; color: #e11d48; border: 1px solid #fca5a5; font-weight: 600;">
            ${Icons.trash || '🗑'} Reiniciar Todo o Progresso
          </button>
        `}
      </div>

      <!-- Sessão / Logout -->
      <div class="settings-section">
        <div class="settings-section-header">${Icons.logOut || '↩'} Sessão</div>
        <div class="settings-section-body">
          <div class="text-sm text-muted">Usuário autenticado: <strong>${this._escape(user?.email || 'TRAINEE_01')}</strong></div>
          <button class="btn btn-secondary" id="btn-logout-settings">
            ${Icons.logOut || '↩'} Sair da Conta
          </button>
        </div>
      </div>
    `;

    this._bindEvents();
    return this.container;
  }

  _escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _bindEvents() {
    const q = id => this.container.querySelector(id);

    // Voltar
    const back = q('#btn-settings-back');
    if (back) back.onclick = () => this.onNavigate('DASHBOARD');

    // Logout
    const logout = q('#btn-logout-settings');
    if (logout) logout.onclick = () => this.onNavigate('LOGOUT');

    // Salvar Nome
    const saveProfile = q('#btn-save-profile');
    if (saveProfile) {
      saveProfile.onclick = () => {
        const nameInput = q('#cfg-name');
        const newName = (nameInput?.value || '').trim();
        if (!newName || newName.length < 2) {
          this.saveStatus = 'error';
          this.render();
          return;
        }
        // P6: Guard para profile nulo (segurança defensiva)
        if (!trainee.profile) {
          this.saveStatus = 'error';
          this.render();
          return;
        }
        try {
          trainee.profile.name = newName;
          trainee.saveProfile();
          this.saveStatus = 'saved';
        } catch (e) {
          this.saveStatus = 'error';
        }
        this.render();
        // Limpa o status após 3s
        setTimeout(() => { this.saveStatus = null; this.render(); }, 3000);
      };
    }

    // Alterar Senha
    const changePwd = q('#btn-change-password');
    if (changePwd) {
      changePwd.onclick = () => {
        const current = q('#cfg-pwd-current')?.value || '';
        const newPwd  = q('#cfg-pwd-new')?.value || '';
        const confirm = q('#cfg-pwd-confirm')?.value || '';
        const msg = q('#cfg-pwd-msg');

        if (!current || !newPwd || !confirm) {
          if (msg) { msg.textContent = 'Preencha todos os campos de senha.'; msg.style.color = '#e11d48'; }
          return;
        }
        if (newPwd.length < 12) {
          if (msg) { msg.textContent = 'A nova senha deve ter no mínimo 6 caracteres.'; msg.style.color = '#e11d48'; }
          return;
        }
        if (newPwd !== confirm) {
          if (msg) { msg.textContent = 'As senhas não coincidem.'; msg.style.color = '#e11d48'; }
          return;
        }

        // Atualiza hash no localStorage mock
        try {
          const storage = window.localStorage;
          const raw = storage.getItem('nexustech_auth_users_dev_v1');
          const users = raw ? JSON.parse(raw) : [];
          const user = authService.getCurrentUser();
          const idx = users.findIndex(u => u.email === user?.email);
          if (idx < 0) {
            if (msg) { msg.textContent = 'Usuário não encontrado.'; msg.style.color = '#e11d48'; }
            return;
          }
          // Simula hash (mesmo método do authService)
          const devHash = str => {
            let h = 0x811c9dc5;
            for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
            return 'dev_hash_' + (h >>> 0).toString(16);
          };
          if (users[idx].passwordHash !== devHash(current)) {
            if (msg) { msg.textContent = 'Senha atual incorreta.'; msg.style.color = '#e11d48'; }
            return;
          }
          users[idx].passwordHash = devHash(newPwd);
          storage.setItem('nexustech_auth_users_dev_v1', JSON.stringify(users));
          if (msg) { msg.textContent = '✓ Senha alterada com sucesso!'; msg.style.color = 'var(--erp-green-success)'; }
          q('#cfg-pwd-current').value = '';
          q('#cfg-pwd-new').value = '';
          q('#cfg-pwd-confirm').value = '';
          setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
        } catch (e) {
          if (msg) { msg.textContent = 'Erro ao alterar senha. Tente novamente.'; msg.style.color = '#e11d48'; }
        }
      };
    }

    // Reset de progresso — primeiro clique
    const resetBtn = q('#btn-reset-progress');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.resetConfirm = true;
        this.render();
      };
    }

    // Cancelar reset
    const cancelReset = q('#btn-cancel-reset');
    if (cancelReset) {
      cancelReset.onclick = () => {
        this.resetConfirm = false;
        this.render();
      };
    }

    // Confirmar reset
    const confirmReset = q('#btn-confirm-reset');
    if (confirmReset) {
      confirmReset.onclick = () => {
        const confirmInput = q('#cfg-reset-confirm-input');
        if ((confirmInput?.value || '').trim().toUpperCase() !== 'REINICIAR') {
          confirmInput.style.borderColor = '#e11d48';
          confirmInput.focus();
          return;
        }
        // Executa o reset real
        scenarioEngine.stopSlaTimer?.();
        trainee.resetProfile();
        this.resetConfirm = false;
        this.render();
      };
    }
  }

  getElement() { return this.container; }
}
