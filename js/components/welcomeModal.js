/**
 * Nexus ERP Lab • Tutorial e boas-vindas do primeiro expediente
 * O primeiro acesso apresenta o tutorial antes da fala do Chefe Wilson.
 */

import { Icons } from '../utils/icons.js';
import { trainee } from '../core/engine/traineeEngine.js';

export const ONBOARDING_STORAGE_KEY = 'nexustech_onboarding_completed';
export const TUTORIAL_STORAGE_KEY = 'nexustech_tutorial_completed';

function currentUserKey() {
  try {
    return trainee.getProfile()?.journey?.userId || 'local';
  } catch {
    return 'local';
  }
}

function storageKey(prefix) {
  return `${prefix}_${currentUserKey()}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class WelcomeModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    this.isOpen = false;
    this.tutorialStep = 0;
    document.body.appendChild(this.overlay);
  }

  _getStorage() {
    try { return window.localStorage; } catch { return null; }
  }

  isTutorialCompleted() {
    return this._getStorage()?.getItem(storageKey(TUTORIAL_STORAGE_KEY)) === 'true';
  }

  isWelcomeCompleted() {
    return this._getStorage()?.getItem(storageKey(ONBOARDING_STORAGE_KEY)) === 'true';
  }

  shouldShowOnboarding() {
    const profile = trainee.getProfile();
    const hasNoActions = (profile.totalActions || 0) === 0;
    const hasNoCompletedScenarios = !profile.completedScenarios?.length;
    return !this.isTutorialCompleted() && hasNoActions && hasNoCompletedScenarios;
  }

  show() {
    this.showTutorial();
  }

  showTutorial() {
    this.tutorialStep = 0;
    this._renderTutorial();
    this.open();
  }

  _tutorialSteps() {
    return [
      {
        eyebrow: 'Antes de começar',
        title: 'Bem-vinda ao seu primeiro expediente',
        icon: Icons.compass,
        body: `
          <p>Este é um laboratório de prática para quem já estudou SAP SD e quer ganhar segurança executando uma rotina comercial. Aqui você vai receber solicitações, procurar informações, decidir o próximo passo e observar o impacto da sua escolha.</p>
          <p><strong>Não é uma aula.</strong> A proposta é praticar o raciocínio operacional como se você tivesse acabado de entrar na equipe.</p>
        `
      },
      {
        eyebrow: 'Como você vai trabalhar',
        title: 'Uma missão por vez, com contexto de verdade',
        icon: Icons.target,
        body: `
          <p>Cada missão traz um pedido de negócio, dados para consultar, uma sequência de atividades e critérios de conclusão. Você pode usar as transações disponíveis, conferir documentos e corrigir o caminho quando necessário.</p>
          <div class="tutorial-callout tutorial-callout-blue"><strong>Importante:</strong> nem sempre a resposta é executar. Às vezes o procedimento correto é investigar, documentar uma divergência ou escalar a decisão.</div>
        `
      },
      {
        eyebrow: 'Conheça o ambiente',
        title: 'O painel mostra onde você está',
        icon: Icons.layout,
        body: `
          <p>No <strong>Início</strong>, você acompanha sua jornada, o expediente atual e as missões pendentes. Em <strong>Missões</strong> e <strong>Treinamento</strong>, você encontra o trabalho prático. Em <strong>Minha Jornada</strong>, acompanha sua evolução.</p>
          <p>O menu lateral fica disponível durante todo o expediente. Você não precisa decorar tudo agora: o ambiente foi feito para ser consultado.</p>
        `
      },
      {
        eyebrow: 'Você não está sozinha',
        title: 'O Chefe Wilson acompanha suas decisões',
        icon: Icons.messageCircle,
        body: `
          <p>O painel do gestor apresenta o contexto do chamado e oferece pistas graduais. Use a ajuda contextual com <strong>F1</strong> ou com os botões <strong>?</strong> quando precisar entender um campo.</p>
          <p>As pistas ajudam a pensar, mas não entregam automaticamente a resposta. O objetivo é construir autonomia e segurança.</p>
        `
      },
      {
        eyebrow: 'Aviso importante',
        title: 'Prática segura e independente',
        icon: Icons.shield,
        body: `
          <div class="tutorial-callout tutorial-callout-amber"><strong>Os dados, clientes, materiais e documentos são fictícios.</strong> Nada aqui altera uma empresa ou um sistema SAP real.</div>
          <p>O Nexus ERP Lab é um projeto educacional independente. Ele não é desenvolvido, patrocinado, aprovado ou afiliado à SAP SE. SAP e outras marcas pertencem aos seus respectivos titulares.</p>
          <p>O laboratório também não substitui academia, treinamento oficial, certificação ou experiência profissional real. Ele existe para ajudar você a transformar estudo em prática com tranquilidade.</p>
        `
      },
      {
        eyebrow: 'Antes de iniciar uma missão',
        title: 'Uma regra operacional importante',
        icon: Icons.alertTriangle,
        body: `
          <p>O progresso da carreira é salvo na sua conta. Já os documentos criados dentro de uma missão são um estado operacional de prática.</p>
          <div class="tutorial-callout tutorial-callout-rose"><strong>Se você recarregar a página durante uma missão, documentos criados naquela sessão podem ser reiniciados.</strong> Antes de atualizar ou fechar a aba, conclua a missão ou saia dela conscientemente.</div>
          <p>Erros fazem parte do treino. Você pode analisar o impacto e tentar novamente sem risco para uma empresa real.</p>
        `
      }
    ];
  }

  _renderTutorial() {
    const steps = this._tutorialSteps();
    const step = steps[this.tutorialStep];
    const isLast = this.tutorialStep === steps.length - 1;
    const progress = Math.round(((this.tutorialStep + 1) / steps.length) * 100);

    this.overlay.innerHTML = `
      <div class="erp-modal-window tutorial-modal" style="max-width: 650px; max-height: 88vh; display: flex; flex-direction: column;">
        <div class="erp-modal-header" style="background-color: var(--erp-navy-900); padding: 15px 22px;">
          <div class="erp-modal-title" style="font-size: 14.5px; display: flex; align-items: center; gap: 9px;">
            <span style="background: var(--erp-blue-primary); color: #fff; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">${step.icon || Icons.info}</span>
            <span>Guia de chegada • Nexus ERP Lab</span>
          </div>
          <button class="erp-modal-close" id="tutorial-close-btn" title="Fechar">${Icons.x}</button>
        </div>

        <div class="erp-modal-body tutorial-body" style="padding: 26px 30px; overflow-y: auto;">
          <div style="font-size: 11px; font-weight: 800; color: var(--erp-blue-primary); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px;">${step.eyebrow}</div>
          <h2 style="font-size: 22px; line-height: 1.2; color: var(--erp-navy-900); margin: 0 0 16px;">${step.title}</h2>
          <div class="tutorial-copy" style="font-size: 14px; line-height: 1.65; color: var(--erp-navy-800);">${step.body}</div>
        </div>

        <div class="erp-modal-footer" style="padding: 13px 22px; background-color: #f8fafc; border-top: 1px solid var(--erp-border-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; width: 100%;">
            <div style="flex: 1; min-width: 100px;">
              <div style="font-size: 11px; color: var(--erp-text-muted); margin-bottom: 5px;">Etapa ${this.tutorialStep + 1} de ${steps.length}</div>
              <div style="height: 5px; background: #e2e8f0; border-radius: 99px; overflow: hidden;"><div style="width: ${progress}%; height: 100%; background: var(--erp-blue-primary); border-radius: inherit;"></div></div>
            </div>
            <button class="btn btn-primary" id="tutorial-next-btn" style="padding: 9px 18px; font-weight: 700; font-size: 13px;">${isLast ? 'Concluir tutorial' : 'Próximo'} ${Icons.arrowRight || ''}</button>
          </div>
        </div>
      </div>
    `;
    this._bindTutorialEvents(isLast);
  }

  _bindTutorialEvents(isLast) {
    const next = this.overlay.querySelector('#tutorial-next-btn');
    const close = this.overlay.querySelector('#tutorial-close-btn');
    if (next) next.onclick = () => {
      if (isLast) this._finishTutorial();
      else { this.tutorialStep += 1; this._renderTutorial(); }
    };
    if (close) close.onclick = () => {
      if (this.shouldShowOnboarding()) return;
      this.close();
    };
  }

  _finishTutorial() {
    try { this._getStorage()?.setItem(storageKey(TUTORIAL_STORAGE_KEY), 'true'); } catch {}
    this.showWelcome();
  }

  showWelcome() {
    const profile = trainee.getProfile();
    const traineeName = escapeHtml(profile.name || 'Trainee SD');
    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 580px;">
        <div class="erp-modal-header" style="background-color: var(--erp-navy-900); padding: 14px 20px;">
          <div class="erp-modal-title" style="font-size: 14.5px; display: flex; align-items: center; gap: 8px;">
            <span style="background: var(--erp-blue-primary); color: #fff; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700;">N</span>
            <span>Seu primeiro dia de expediente</span>
          </div>
          <button class="erp-modal-close" id="welcome-close-btn" title="Fechar">${Icons.x}</button>
        </div>
        <div class="erp-modal-body" style="padding: 22px 26px; display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--erp-border-subtle); padding-bottom: 13px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 2px solid #0070f2; flex-shrink: 0;"><img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 100%; height: 100%; object-fit: cover;" /></div>
            <div><div style="font-size: 15px; font-weight: 800; color: var(--erp-navy-900);">Chefe Wilson</div><div style="font-size: 12px; color: var(--erp-text-muted);">Gestor de Operações SD</div></div>
          </div>
          <div style="font-size: 14px; color: var(--erp-navy-900); line-height: 1.65; display: flex; flex-direction: column; gap: 10px;">
            <p style="margin: 0;">Olá, <strong>${traineeName}</strong>! Que bom ter você com a gente. Seu primeiro expediente começa agora — fique tranquila: vou acompanhar seus primeiros passos.</p>
            <p style="margin: 0;">Eu sou o Wilson, seu gestor de Operações SD. Você já estudou SAP SD; aqui você não vai assistir a outra aula. Vai receber solicitações da rotina comercial, consultar os dados disponíveis, tomar decisões e aprender a lidar com as exceções que aparecem no dia a dia.</p>
            <p style="margin: 0;">Não precisa acertar tudo de primeira. Leia o contexto, confira as informações e, quando ficar em dúvida, use as pistas e a ajuda do ambiente. O mais importante é entender por que uma decisão é correta e qual impacto ela produz.</p>
            <p style="margin: 0;">Vamos começar com calma. Depois da primeira missão, você já vai se sentir mais à vontade com a rotina.</p>
          </div>
          <div style="background-color: var(--erp-surface-subtle); border: 1px solid var(--erp-border-subtle); border-radius: 7px; padding: 13px 15px; display: flex; flex-direction: column; gap: 7px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--erp-navy-900);">Durante o expediente, você pode contar com</div>
            <div style="font-size: 12px; color: var(--erp-text-muted);"><strong style="color: var(--erp-blue-primary);">F1 ou ?</strong> para consultar a ajuda contextual de um campo ou tela.</div>
            <div style="font-size: 12px; color: var(--erp-text-muted);"><strong style="color: var(--erp-blue-primary);">Painel do gestor</strong> para rever o contexto e pedir uma pista sem receber a resposta pronta.</div>
            <div style="font-size: 12px; color: var(--erp-text-muted);"><strong style="color: var(--erp-green-success);">Ambiente de prática</strong> para errar, analisar e tentar de novo sem risco para uma empresa real.</div>
          </div>
        </div>
        <div class="erp-modal-footer" style="padding: 12px 20px; background-color: #f8fafc; border-top: 1px solid var(--erp-border-subtle); display: flex; justify-content: flex-end;">
          <button class="btn btn-primary" id="welcome-start-btn" style="padding: 9px 22px; font-weight: 700; font-size: 13px;">${Icons.play} Começar meu expediente</button>
        </div>
      </div>
    `;
    this._bindWelcomeEvents();
  }

  _bindWelcomeEvents() {
    const start = () => {
      try { this._getStorage()?.setItem(storageKey(ONBOARDING_STORAGE_KEY), 'true'); } catch {}
      this.close();
    };
    this.overlay.querySelector('#welcome-start-btn')?.addEventListener('click', start);
    this.overlay.querySelector('#welcome-close-btn')?.addEventListener('click', start);
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
  }

  markAsCompleted() {
    try { this._getStorage()?.setItem(storageKey(ONBOARDING_STORAGE_KEY), 'true'); } catch {}
  }

  resetOnboarding() {
    try {
      const storage = this._getStorage();
      storage?.removeItem(storageKey(ONBOARDING_STORAGE_KEY));
      storage?.removeItem(storageKey(TUTORIAL_STORAGE_KEY));
    } catch {}
  }
}

export const welcomeModal = new WelcomeModalComponent();
