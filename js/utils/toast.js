/**
 * NexusTech ERP • Toast Notification Service
 * Sistema de notificações flutuantes para conquistas, insígnias (badges) e avisos do sistema.
 */

import { Icons } from './icons.js';

class ToastNotificationService {
  constructor() {
    this.container = null;
    this._ensureContainer();
  }

  _ensureContainer() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('erp-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'erp-toast-container';
      el.className = 'erp-toast-container';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  /**
   * Exibe um toast de conquista de insígnia (Badge)
   * @param {Object} badge { id, title, icon, desc }
   */
  showBadge(badge) {
    if (typeof document === 'undefined') return;
    this._ensureContainer();

    const toast = document.createElement('div');
    toast.className = 'erp-toast erp-toast-achievement animate-slide-in';

    toast.innerHTML = `
      <div class="erp-toast-icon-wrapper">
        <span class="erp-toast-badge-glow">★</span>
        <span class="erp-toast-icon">${Icons[badge.icon] || Icons.award || '🏆'}</span>
      </div>
      <div class="erp-toast-content">
        <div class="erp-toast-tag">NOVA CONQUISTA DESBLOQUEADA!</div>
        <div class="erp-toast-title">${badge.title}</div>
        <div class="erp-toast-desc">${badge.desc || ''}</div>
      </div>
      <button class="erp-toast-close" aria-label="Fechar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.erp-toast-close');
    const dismiss = () => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 350);
    };

    if (closeBtn) closeBtn.onclick = dismiss;

    this.container.appendChild(toast);

    // Auto-dismiss após 5 segundos
    setTimeout(() => {
      if (toast.parentElement) dismiss();
    }, 5000);
  }

  /**
   * Exibe um toast comum de sucesso/info/alerta
   */
  show(message, type = 'info', title = null) {
    if (typeof document === 'undefined') return;
    this._ensureContainer();

    const toast = document.createElement('div');
    toast.className = `erp-toast erp-toast-${type} animate-slide-in`;

    let iconHtml = Icons.info || 'ℹ';
    if (type === 'success') iconHtml = Icons.checkCircle || '✓';
    if (type === 'warning') iconHtml = Icons.alertTriangle || '⚠';
    if (type === 'error') iconHtml = Icons.alertCircle || '✕';

    toast.innerHTML = `
      <div class="erp-toast-icon-wrapper erp-toast-icon-small">
        <span>${iconHtml}</span>
      </div>
      <div class="erp-toast-content">
        ${title ? `<div class="erp-toast-title text-sm font-bold">${title}</div>` : ''}
        <div class="erp-toast-desc">${message}</div>
      </div>
      <button class="erp-toast-close" aria-label="Fechar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.erp-toast-close');
    const dismiss = () => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 350);
    };

    if (closeBtn) closeBtn.onclick = dismiss;

    this.container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) dismiss();
    }, 4000);
  }
}

export const toastService = new ToastNotificationService();
