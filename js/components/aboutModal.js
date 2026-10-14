/**
 * Nexus ERP Lab • About Modal Component (Sobre o Nexus ERP Lab)
 * Manifesto de Independência Institucional e Princípio de Fidelidade Operacional
 */

import { Icons } from '../utils/icons.js';

export class AboutModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    this.isOpen = false;
    document.body.appendChild(this.overlay);
  }

  show() {
    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 660px; max-height: 88vh; display: flex; flex-direction: column;">
        <!-- Header Corporativo -->
        <div class="erp-modal-header" style="background-color: var(--erp-navy-900); padding: 14px 20px; border-bottom: 1px solid var(--erp-navy-800);">
          <div class="erp-modal-title" style="font-size: 15px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 10px;">
            <span style="background: #0070f2; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">
              NEXUS
            </span>
            <span>Sobre o Nexus ERP Lab</span>
          </div>
          <button class="erp-modal-close" id="about-close-btn" title="Fechar (Esc)">
            ${Icons.x}
          </button>
        </div>

        <!-- Corpo com Conteúdo Institucional -->
        <div class="erp-modal-body" style="padding: 22px 26px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; font-size: 13px; line-height: 1.6; color: var(--erp-navy-900);">
          
          <!-- Seção: Propósito do Laboratório -->
          <div>
            <h3 style="font-size: 14.5px; font-weight: 700; color: var(--erp-navy-950); margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #0070f2;">${Icons.target}</span> Prática Operacional Segura
            </h3>
            <p style="margin: 0 0 8px 0;">
              O <strong>Nexus ERP Lab</strong> é um projeto independente criado para fins educacionais e de prática operacional.
            </p>
            <p style="margin: 0 0 8px 0;">
              Ele nasceu de uma dificuldade prática: depois de estudar SAP e processos de SAP SD, nem sempre é fácil encontrar um ambiente seguro onde seja possível praticar aquilo que foi aprendido. O Nexus foi criado para preencher esse espaço.
            </p>
            <p style="margin: 0;">
              O laboratório é destinado principalmente a pessoas que já tiveram contato com SAP SD por meio de cursos, academias, treinamentos, estudos próprios ou experiências anteriores e desejam desenvolver segurança para aplicar esse conhecimento na prática.
            </p>
          </div>

          <!-- Alerta Importante: Não é um curso -->
          <div style="background-color: var(--erp-surface-subtle); border-left: 4px solid #0070f2; border-radius: 4px; padding: 12px 14px;">
            <p style="margin: 0; font-size: 12.5px; color: var(--erp-text-muted);">
              <strong>Nota Pedagógica:</strong> O Nexus ERP Lab <em>não é um curso</em> e não substitui uma formação profissional ou a experiência em um ambiente empresarial real. As missões foram desenvolvidas para permitir que o usuário pratique raciocínio operacional, identificação de dados, sequência de processos, preenchimento de campos e tomada de decisão.
            </p>
          </div>

          <!-- Seção: Princípio de Fidelidade Operacional -->
          <div>
            <h3 style="font-size: 14.5px; font-weight: 700; color: var(--erp-navy-950); margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--erp-blue-primary);">${Icons.fileText}</span> Princípio de Fidelidade Operacional
            </h3>
            <p style="margin: 0 0 8px 0;">
              O Nexus possui identidade visual própria, mas algumas telas, campos e sequências operacionais são deliberadamente próximas da lógica encontrada em ambientes ERP profissionais.
            </p>
            <p style="margin: 0 0 8px 0;">
              Isso acontece porque o objetivo é praticar o processo, e não apenas responder perguntas. A experiência não pretende reproduzir visualmente o SAP Fiori nem representar o software SAP real.
            </p>
            <p style="margin: 0;">
              O que deve ser aprendido é o processo, o raciocínio e a identificação das informações necessárias — não a memorização da posição exata de cada botão.
            </p>
          </div>

          <!-- Seção: Aviso Legal de Independência -->
          <div style="background-color: #f8fafc; border: 1px solid var(--erp-border); border-radius: 6px; padding: 14px 16px;">
            <h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--erp-navy-700); margin: 0 0 6px 0;">
              Aviso de Independência e Marcas
            </h4>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: var(--erp-text-muted); line-height: 1.5;">
              O <strong>Nexus ERP Lab</strong> é um projeto independente, criado para fins educacionais e de prática. Não é desenvolvido, patrocinado, aprovado, mantido ou afiliado à <strong>SAP SE</strong> ou às empresas do grupo SAP.
            </p>
            <p style="margin: 0; font-size: 12px; color: var(--erp-text-muted); line-height: 1.5;">
              SAP e demais marcas relacionadas são marcas de seus respectivos titulares. Este projeto utiliza referências a conceitos, terminologias e processos empresariais para fins de simulação e aprendizagem e não representa o software SAP real.
            </p>
          </div>

          <!-- Seção: Autoria e Origem do Projeto -->
          <div style="background-color: #ffffff; border: 1px solid var(--erp-border); border-radius: 6px; padding: 14px 16px;">
            <h4 style="font-size: 13px; font-weight: 700; color: var(--erp-navy-950); margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #0070f2;">${Icons.user || Icons.users}</span> Criado por Adriana Martins
            </h4>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: var(--erp-text-muted); line-height: 1.5;">
              O Nexus ERP Lab nasceu de uma necessidade prática: depois de estudar SAP SD, percebi a dificuldade de encontrar um ambiente onde fosse possível praticar os processos aprendidos de forma estruturada e próxima da realidade operacional.
            </p>
            <p style="margin: 0; font-size: 12px; color: var(--erp-text-muted); line-height: 1.5;">
              Assim nasceu o Nexus: um laboratório independente criado para transformar conhecimento estudado em prática.
            </p>
          </div>

          <!-- Seção: Mentoria do Chefe Wilson -->
          <div style="display: flex; align-items: center; gap: 14px; background-color: var(--erp-blue-subtle); border: 1px solid var(--erp-blue-border); border-radius: 6px; padding: 12px 14px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #0070f2; flex-shrink: 0;">
              <img src="./assets/images/chief_wilson.jpg" alt="Chefe Wilson" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: var(--erp-navy-900);">
                Chefe Wilson • Mentor SAP
              </div>
              <div style="font-size: 12px; color: var(--erp-navy-700); line-height: 1.4;">
                Supervisiona as atividades práticas comerciais no fluxo Order-to-Cash, oferecendo orientações, dicas operacionais e feedback contínuo a cada decisão.
              </div>
            </div>
          </div>

        </div>

        <!-- Footer com Botão de Fechamento -->
        <div class="erp-modal-footer" style="padding: 12px 20px; background-color: #f8fafc; border-top: 1px solid var(--erp-border-subtle); display: flex; align-items: center; justify-content: flex-end;">
          <button class="btn btn-primary" id="about-ok-btn" style="padding: 8px 22px; font-weight: 600; font-size: 12.5px;">
            Entendido
          </button>
        </div>
      </div>
    `;

    this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');

    const handleClose = () => {
      document.removeEventListener('keydown', handleKeydown);
      this.close();
    };

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    const closeBtn = this.overlay.querySelector('#about-close-btn');
    const okBtn = this.overlay.querySelector('#about-ok-btn');

    if (closeBtn) closeBtn.addEventListener('click', handleClose);
    if (okBtn) okBtn.addEventListener('click', handleClose);

    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        handleClose();
      }
    };
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
  }
}

export const aboutModal = new AboutModalComponent();
