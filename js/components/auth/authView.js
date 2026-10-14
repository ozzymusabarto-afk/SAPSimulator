/**
 * Nexus ERP Lab • Authentication View Component
 * Módulo: js/components/auth/authView.js
 * 
 * Componente de interface para Login, Cadastro e Recuperação de Senha.
 * Desacoplado, corporativo e com sinalização explícita de ambiente de desenvolvimento.
 */

import { authService, AUTH_DEV_ENV_BANNER } from '../../core/auth/authService.js';
import { Icons } from '../../utils/icons.js';

export class AuthViewComponent {
  /**
   * @param {Object} options
   * @param {Function} options.onAuthSuccess - Callback chamado após login ou cadastro com sucesso
   */
  constructor({ onAuthSuccess } = {}) {
    this.onAuthSuccess = onAuthSuccess || (() => {});
    this.container = document.createElement('div');
    this.container.className = 'nexus-auth-wrapper nexus-auth-container';
    this.container.id = 'nexus-auth-wrapper';

    this.currentMode = 'LOGIN'; // 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'
    this.statusMessage = null;
    this.statusType = 'INFO'; // 'INFO' | 'ERROR'
  }

  setMode(mode, clearMessage = true) {
    this.currentMode = mode;
    if (clearMessage) {
      this.statusMessage = null;
    }
    this.render();
  }

  setMessage(msg, type = 'ERROR') {
    this.statusMessage = msg;
    this.statusType = type;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- Banner de Notificação Obrigatório de Ambiente de Desenvolvimento -->
      <div class="auth-dev-badge nexus-dev-banner" title="Simulador desacoplado operando com Mock Local de Autenticação">
        <span class="auth-dev-badge-dot"></span>
        <span>${AUTH_DEV_ENV_BANNER}</span>
      </div>

      <!-- Cartão Principal -->
      <div class="auth-card">
        <!-- Cabeçalho Institucional com Chefe Wilson -->
        <header class="auth-card-header">
          <div class="auth-brand-row">
            <div class="auth-brand-logo">
              <span class="auth-brand-badge">NEXUS</span>
              <span class="auth-brand-text">ERP LAB</span>
            </div>
            <span class="auth-client-badge">PRD-SD01 • Mandante 800</span>
          </div>

          <div class="auth-mentor-spotlight">
            <img 
              src="./assets/images/chief_wilson.jpg" 
              alt="Chefe Wilson" 
              class="auth-mentor-avatar"
            />
            <div class="auth-mentor-info">
              <span class="auth-mentor-name">Chefe Wilson</span>
              <span class="auth-mentor-role">Mentor SAP • SD Practice</span>
              <span class="auth-mentor-quote">"Excelência se constrói na prática. Identifique-se para iniciar o expediente."</span>
            </div>
          </div>
        </header>

        <!-- Corpo com Conteúdo Dinâmico por Modo -->
        <main class="auth-card-body">
          ${this._renderAlert()}
          ${this._renderBodyContent()}
        </main>
      </div>

      <!-- Rodapé do Wrapper -->
      <footer class="auth-wrapper-footer">
        <span>Nexus ERP Lab • SD Practice Environment</span>
        <span>Ambiente Educacional de Simulação • Autenticação Desacoplada</span>
      </footer>
    `;

    this._bindEvents();
    return this.container;
  }

  _renderAlert() {
    if (!this.statusMessage) return '';
    const alertClass = this.statusType === 'ERROR' ? 'auth-alert-error' : 'auth-alert-info';
    return `
      <div class="auth-alert ${alertClass}">
        <span>${this.statusMessage}</span>
      </div>
    `;
  }

  _renderBodyContent() {
    if (this.currentMode === 'REGISTER') {
      return this._renderRegisterForm();
    }
    if (this.currentMode === 'FORGOT_PASSWORD') {
      return this._renderForgotPasswordForm();
    }
    return this._renderLoginForm();
  }

  _renderLoginForm() {
    return `
      <h2 class="auth-view-title">Acessar Simulador</h2>
      <p class="auth-view-subtitle">Entre com suas credenciais corporativas de Trainee para acessar a esteira SD.</p>

      <form id="auth-login-form">
        <div class="auth-form-group">
          <label class="auth-form-label" for="login-email">E-mail Corporativo</label>
          <input 
            type="email" 
            id="login-email" 
            class="auth-form-input" 
            placeholder="ex: trainee.sd@nexus.lab" 
            value="trainee.sd@nexus.lab"
            required 
            autocomplete="username"
          />
        </div>

        <div class="auth-form-group">
          <label class="auth-form-label" for="login-password">Senha de Acesso</label>
          <input 
            type="password" 
            id="login-password" 
            class="auth-form-input" 
            placeholder="••••••••" 
            value="trainee123"
            required 
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="auth-btn-primary" id="btn-submit-login">
          <span>Entrar no Nexus ERP Lab</span>
        </button>

        <button type="button" class="auth-btn-secondary" id="btn-quick-dev-login" title="Login imediato como Trainee SD padrão">
          <span>Entrar como Trainee SD (Acesso Rápido Dev)</span>
        </button>

        <div class="auth-divider">
          <span>ou</span>
        </div>

        <button type="button" class="auth-btn-google auth-btn-google--disabled" id="btn-google-login" title="Autenticação Google será integrada via OAuth em ambiente de produção" disabled style="opacity: 0.55; cursor: not-allowed;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Entrar com Google</span>
          <span class="auth-google-badge" style="background: #64748b;">EM BREVE</span>
        </button>

        <div class="auth-links-row">
          <button type="button" class="auth-link" id="link-go-register">Criar nova conta</button>
          <button type="button" class="auth-link" id="link-go-forgot">Esqueci minha senha</button>
        </div>
      </form>
    `;
  }

  _renderRegisterForm() {
    return `
      <h2 class="auth-view-title">Criar Conta de Trainee</h2>
      <p class="auth-view-subtitle">Cadastre seu usuário para iniciar sua formação prática de ponta a ponta no SAP SD.</p>

      <form id="auth-register-form">
        <div class="auth-form-group">
          <label class="auth-form-label" for="reg-name">Nome Completo</label>
          <input 
            type="text" 
            id="reg-name" 
            class="auth-form-input" 
            placeholder="ex: Carlos Drummond de Andrade" 
            required 
            autocomplete="name"
          />
        </div>

        <div class="auth-form-group">
          <label class="auth-form-label" for="reg-email">E-mail Corporativo</label>
          <input 
            type="email" 
            id="reg-email" 
            class="auth-form-input" 
            placeholder="ex: carlos.trainee@empresa.com" 
            required 
            autocomplete="email"
          />
        </div>

        <div class="auth-form-group">
          <label class="auth-form-label" for="reg-password">Senha de Acesso</label>
          <input 
            type="password" 
            id="reg-password" 
            class="auth-form-input" 
            placeholder="Mínimo 6 caracteres" 
            required 
            autocomplete="new-password"
          />
          <div class="auth-form-help">Mínimo de 6 caracteres.</div>
        </div>

        <div class="auth-form-group">
          <label class="auth-form-label" for="reg-password-confirm">Confirmar Senha</label>
          <input 
            type="password" 
            id="reg-password-confirm" 
            class="auth-form-input" 
            placeholder="Repita a senha informada" 
            required 
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="auth-btn-primary" id="btn-submit-register">
          <span>Criar Minha Conta</span>
        </button>

        <div class="auth-links-row" style="justify-content: center;">
          <button type="button" class="auth-link" id="link-back-login">Já tem uma conta? Fazer Login</button>
        </div>
      </form>
    `;
  }

  _renderForgotPasswordForm() {
    return `
      <h2 class="auth-view-title">Recuperação de Senha</h2>
      <p class="auth-view-subtitle">Informe seu e-mail corporativo cadastrado para receber as orientações de redefinição.</p>

      <form id="auth-forgot-form">
        <div class="auth-form-group">
          <label class="auth-form-label" for="forgot-email">E-mail Cadastrado</label>
          <input 
            type="email" 
            id="forgot-email" 
            class="auth-form-input" 
            placeholder="ex: trainee.sd@nexus.lab" 
            required 
            autocomplete="email"
          />
        </div>

        <div class="auth-alert auth-alert-info" style="margin-top: 0.5rem;">
          <span>Este simulador opera com Mock Local de Autenticação. O fluxo visual está 100% homologado e preparado para posterior integração via backend SMTP/OAuth.</span>
        </div>

        <button type="submit" class="auth-btn-primary" id="btn-submit-forgot">
          <span>Solicitar Link de Recuperação</span>
        </button>

        <div class="auth-links-row" style="justify-content: center;">
          <button type="button" class="auth-link" id="link-back-login-2">Voltar ao Login</button>
        </div>
      </form>
    `;
  }

  _bindEvents() {
    // Links de navegação entre modos
    const linkGoReg = this.container.querySelector('#link-go-register');
    if (linkGoReg) linkGoReg.onclick = () => this.setMode('REGISTER');

    const linkGoForgot = this.container.querySelector('#link-go-forgot');
    if (linkGoForgot) linkGoForgot.onclick = () => this.setMode('FORGOT_PASSWORD');

    const linkBackLogin = this.container.querySelector('#link-back-login');
    if (linkBackLogin) linkBackLogin.onclick = () => this.setMode('LOGIN');

    const linkBackLogin2 = this.container.querySelector('#link-back-login-2');
    if (linkBackLogin2) linkBackLogin2.onclick = () => this.setMode('LOGIN');

    // Botão de acesso rápido do Trainee Dev padrão
    const btnQuick = this.container.querySelector('#btn-quick-dev-login');
    if (btnQuick) {
      btnQuick.onclick = async () => {
        try {
          const { user } = await authService.switchToDefaultTrainee();
          this.onAuthSuccess(user);
        } catch (e) {
          this.setMessage(e.message, 'ERROR');
        }
      };
    }

    // Botão Google Placeholder
    const btnGoogle = this.container.querySelector('#btn-google-login');
    if (btnGoogle) {
      btnGoogle.onclick = async () => {
        try {
          const { user } = await authService.loginWithGoogle();
          this.onAuthSuccess(user);
        } catch (e) {
          this.setMessage(e.message, 'ERROR');
        }
      };
    }

    // Formulário de Login com proteção estrita contra submissão duplicada
    const loginForm = this.container.querySelector('#auth-login-form');
    const btnSubmitLogin = this.container.querySelector('#btn-submit-login');
    let isLoginSubmitting = false;

    const executeLogin = async () => {
      if (isLoginSubmitting) return;
      isLoginSubmitting = true;
      if (btnSubmitLogin) {
        btnSubmitLogin.disabled = true;
        btnSubmitLogin.setAttribute('aria-busy', 'true');
      }

      const emailInput = this.container.querySelector('#login-email') || document.getElementById('login-email');
      const passInput = this.container.querySelector('#login-password') || document.getElementById('login-password');
      const email = (emailInput?.value || '').trim();
      const pass = (passInput?.value || '').trim();

      try {
        const { user } = await authService.loginWithEmail(email, pass);
        this.onAuthSuccess(user);
      } catch (err) {
        this.setMessage(err.message, 'ERROR');
      } finally {
        isLoginSubmitting = false;
        if (btnSubmitLogin) {
          btnSubmitLogin.disabled = false;
          btnSubmitLogin.removeAttribute('aria-busy');
        }
      }
    };

    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        await executeLogin();
      };
    }

    if (btnSubmitLogin) {
      btnSubmitLogin.onclick = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        await executeLogin();
      };
    }

    // Formulário de Cadastro
    const regForm = this.container.querySelector('#auth-register-form');
    if (regForm) {
      regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = this.container.querySelector('#reg-name').value;
        const email = this.container.querySelector('#reg-email').value;
        const pass = this.container.querySelector('#reg-password').value;
        const confirm = this.container.querySelector('#reg-password-confirm').value;

        try {
          const { user } = await authService.register({
            name,
            email,
            password: pass,
            passwordConfirm: confirm
          });
          this.onAuthSuccess(user);
        } catch (err) {
          this.setMessage(err.message, 'ERROR');
        }
      };
    }

    // Formulário de Recuperação
    const forgotForm = this.container.querySelector('#auth-forgot-form');
    if (forgotForm) {
      forgotForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = this.container.querySelector('#forgot-email').value;
        try {
          const res = await authService.sendPasswordReset(email);
          this.setMessage(res.message, 'INFO');
        } catch (err) {
          this.setMessage(err.message, 'ERROR');
        }
      };
    }
  }
}
