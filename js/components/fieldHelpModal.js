/**
 * NexusTech ERP • Field Help Modal Component (F1 Contextual Documentation)
 * Documentação Técnica e Conceitual de Campos e Transações SAP SD
 */

import { Icons } from '../utils/icons.js';

export const FIELD_HELP_CATALOG = {
  // === CABEÇALHO DA ORDEM DE VENDA (VBAK) ===
  orderType: {
    title: 'Tipo de Documento de Venda (AUART)',
    sapCode: 'VBAK-AUART',
    description: 'Classifica o processo comercial da transação e parametriza os fluxos subsequentes de remessa, separação física e faturamento.',
    importance: 'Define a faixa de numeração da ordem, a obrigatoriedade de remessa de mercadorias e a integração contábil da fatura.',
    example: 'OR (Standard Order / Ordem de Venda Padrão de Mercadorias)',
    table: 'VBAK (Documento de Vendas: Dados de Cabeçalho)'
  },
  salesOrg: {
    title: 'Organização de Vendas (VKORG)',
    sapCode: 'VBAK-VKORG / KNVV-VKORG',
    description: 'Unidade organizacional responsável legal e comercialmente pela venda, negociação, garantias e faturamento dos produtos.',
    importance: 'Chave primária para determinação de tabelas de preço (VK11/PR00), dados fiscais e centros de distribuição autorizados.',
    example: '1000 - NexusTech Distribuição Nacional',
    table: 'VBAK / KNVV (Área de Vendas do Cliente)'
  },
  distChannel: {
    title: 'Canal de Distribuição (VTWEG)',
    sapCode: 'VBAK-VTWEG / KNVV-VTWEG',
    description: 'Meio ou estratégia comercial pelo qual as mercadorias chegam ao cliente final (ex: Venda Direta Corporativa, Revenda Atacado ou Varejo).',
    importance: 'Permite segmentar políticas de descontos comerciais, margens mínimas e alçadas de liberação.',
    example: '10 (Venda Direta / Corporativa) ou 20 (Revenda / Atacado)',
    table: 'VBAK / KNVV'
  },
  division: {
    title: 'Setor de Atividade (SPART)',
    sapCode: 'VBAK-SPART / KNVV-SPART',
    description: 'Linha ou segmento de mercadorias comercializadas pela organização (ex: Hardware, Software, Peças).',
    importance: 'Agrupa materiais correlatos para determinação de contas de receita contábil no módulo financeiro (FI-AR).',
    example: '01 - Equipamentos e Hardware Corporativo',
    table: 'VBAK / KNVV'
  },
  customerId: {
    title: 'Emissor da Ordem / Sold-to Party (KUNNR)',
    sapCode: 'VBAK-KUNNR / KNA1-KUNNR',
    description: 'Cliente ou entidade jurídica que firmou o compromisso de compra com a NexusTech.',
    importance: 'Determina automaticamente as 4 funções de parceiro (SP, SH, BP, PY), a Área de Vendas aplicável e o limite de crédito disponível.',
    example: '100045 - Varejo Eletro Brasil Ltda',
    table: 'KNA1 (Mestre de Clientes: Geral) / KNVV (Vendas)'
  },
  customerPoNumber: {
    title: 'Nº Pedido de Compra do Cliente (BSTNK)',
    sapCode: 'VBAK-BSTNK',
    description: 'Número do documento formal de compra (Purchase Order / PO) emitido pelo cliente.',
    importance: 'Garante rastreabilidade entre o pedido do comprador e o faturamento, sendo impresso na Nota Fiscal / DANFE e nos boletos.',
    example: 'PO-2026-EB01 ou PO-TL-2026-042',
    table: 'VBAK'
  },
  paymentTerms: {
    title: 'Condição de Pagamento (ZTERM)',
    sapCode: 'VBAK-ZTERM / KNVV-ZTERM',
    description: 'Especifica o prazo financeiro e as datas de vencimento para liquidação da fatura comercial.',
    importance: 'Alimenta o módulo financeiro (FI-AR) para provisionamento de duplicatas e cálculo de fluxo de caixa da empresa.',
    example: 'Z030 (30 dias líquido) ou Z015 (15 dias líquido)',
    table: 'VBAK / KNVV'
  },
  incoterms: {
    title: 'Termos Internacionais de Comércio (INCO1 / INCO2)',
    sapCode: 'VBAK-INCO1 / VBAK-INCO2',
    description: 'Define as cláusulas padronizadas de responsabilidade por frete, custos de transporte e seguro entre comprador e vendedor.',
    importance: 'Determina quem contrata a transportadora e quem assume os riscos da carga durante o trânsito da entrega.',
    example: 'CIF (Custo, Seguro e Frete por conta do vendedor) ou FOB (Frete por conta do comprador)',
    table: 'VBAK'
  },

  // === ITENS DA ORDEM DE VENDA (VBAP) ===
  materialId: {
    title: 'Código do Material (MATNR)',
    sapCode: 'VBAP-MATNR / MARA-MATNR',
    description: 'Identificador único do produto ou mercadoria no Cadastro Geral de Materiais.',
    importance: 'Determina a descrição comercial, peso, cubagem, preço base (PR00), centro fornecedor e saldos em estoque.',
    example: 'MAT-1001 (Servidor Enterprise Nexus Pro X)',
    table: 'MARA (Geral) / MARC (Centro) / VBAP (Item da Ordem)'
  },
  quantity: {
    title: 'Quantidade Solicitada do Item (KWMENG)',
    sapCode: 'VBAP-KWMENG',
    description: 'Quantidade física demandada pelo cliente na unidade de medida de vendas (VRKME).',
    importance: 'Base para verificação de disponibilidade (ATP), reserva de lote de estoque e cálculo do valor total do pedido.',
    example: '2 UN (Unidades)',
    table: 'VBAP'
  },
  manualDiscountPercent: {
    title: 'Desconto Comercial Especial (RB00)',
    sapCode: 'KONP / KOMV',
    description: 'Percentual de redução comercial concedido sobre o preço de tabela do material.',
    importance: 'Deduz a receita bruta no esquema de cálculo de preços (Pricing), alterando a base de cálculo de impostos.',
    example: '5% ou 10%',
    table: 'KOMV (Estrutura de Cálculo de Preços)'
  },

  // === EXPEDIÇÃO E REMESSA (LIKP / LIPS) ===
  shippingPoint: {
    title: 'Local de Expedição / Shipping Point (VSTEL)',
    sapCode: 'LIKP-VSTEL / TVST',
    description: 'Unidade organizacional física responsável pelo processamento, embalagem e carregamento das remessas.',
    importance: 'Parâmetro obrigatório na VL01N para direcionar a remessa à equipe de logística correta.',
    example: '1000 - Expedição Central SP',
    table: 'LIKP (Cabeçalho da Remessa)'
  },
  pickingQty: {
    title: 'Quantidade Separada / Picking (PIKMG)',
    sapCode: 'LIPS-PIKMG',
    description: 'Quantidade de mercadoria fisicamente retirada das prateleiras do depósito para conferência.',
    importance: 'No processo SAP SD, a Saída de Mercadorias (PGI / VL02N) exige que a quantidade de picking seja 100% igual à quantidade da remessa.',
    example: '2 UN (Conferida e pronta para despacho)',
    table: 'LIPS (Itens da Remessa)'
  },

  // === CRÉDITO E FATURAMENTO (KNKK / VBRK) ===
  creditStatus: {
    title: 'Status Geral de Liberação de Crédito (CMGST)',
    sapCode: 'VBUK-CMGST / VBAK-CMGST',
    description: 'Indica se a ordem de venda está retida ou liberada pela análise de risco financeiro.',
    importance: 'Bloqueia o faturamento ou a remessa caso o montante do pedido supere o limite de crédito aprovado.',
    example: 'A (Aprovado / Liberado) ou B (Retido por Crédito / Credit Block)',
    table: 'VBUK / KNKK'
  },
  billingType: {
    title: 'Tipo de Documento de Faturamento (FKART)',
    sapCode: 'VBRK-FKART',
    description: 'Classifica o documento contábil e fiscal a ser gerado na VF01.',
    importance: 'Determina a escrituração contábil em Contas a Receber (FI-AR) e a baixa da provisão de receita.',
    example: 'F2 (Fatura Comercial de Vendas / Nota Fiscal)',
    table: 'VBRK (Cabeçalho da Fatura)'
  }
};

export const TRANSACTION_GENERAL_HELP = {
  VA01: {
    title: 'Transação VA01 • Criar Ordem de Venda',
    description: 'A transação VA01 é a porta de entrada do ciclo Order-to-Cash (O2C). Nela você define a estrutura organizacional comercial (Org. Vendas, Canal, Setor), informa o cliente comprador, termos financeiros e as posições de materiais solicitadas.',
    tip: 'Selecione um campo específico e pressione F1 ou clique no botão [?] para ver a documentação técnica detalhada daquele dado.'
  },
  VA02: {
    title: 'Transação VA02 • Modificar Ordem de Venda',
    description: 'Utilizada para alterar dados comerciais de ordens já gravadas, como correção de quantidades, inserção de condições de desconto, ou alteração de endereços de entrega.',
    tip: 'Campos já processados em documentos subsequentes (remessa ou fatura) podem apresentar restrição de modificação.'
  },
  VA03: {
    title: 'Transação VA03 • Exibir Ordem de Venda & Fluxo de Documentos',
    description: 'Consulta abrangente de pedidos de venda com acesso ao Fluxo de Documentos (VBFA), permitindo rastrear o status de remessas, saídas de mercadorias e faturamento.',
    tip: 'Utilize a aba Fluxo de Documentos para verificar a integridade da cadeia de suprimentos.'
  },
  XD03: {
    title: 'Transação XD03 • Exibir Mestre de Clientes',
    description: 'Consulta centralizada dos dados cadastrais do cliente (KNA1), dados da Área de Vendas (KNVV), condições comerciais aprovadas e controle de limite de crédito (KNKK).',
    tip: 'Observe a aba Vendas para identificar a combinação exata de Org. Vendas / Canal / Setor antes de preencher uma ordem.'
  },
  MM03: {
    title: 'Transação MM03 • Exibir Mestre de Materiais',
    description: 'Consulta os dados técnicos e logísticos dos materiais, incluindo saldo disponível em estoque no centro/depósito e preço base da tabela.',
    tip: 'Verifique o saldo disponível para garantir que a quantidade pedida não sofrerá ruptura de estoque.'
  },
  VK11: {
    title: 'Transação VK11 • Criar Condição de Preço',
    description: 'Permite registrar preços base (PR00), descontos (RB00) ou sobretaxas comerciais para uma chave de combinação (Área de Vendas / Material / Cliente).',
    tip: 'Sem uma condição de preço PR00 ativa, ordens de venda são bloqueadas com erro de determinação de preço.'
  },
  VKM1: {
    title: 'Transação VKM1 • Documentos de Vendas Bloqueados por Crédito',
    description: 'Painel gerencial de análise de risco financeiro para liberar ou rejeitar ordens de venda retidas por ultrapassagem do limite de crédito.',
    tip: 'A liberação na VKM1 remove o bloqueio global de remessa (Credit Block), permitindo a continuidade do fluxo.'
  },
  VL01N: {
    title: 'Transação VL01N • Criar Remessa com Referência à Ordem',
    description: 'Gera o documento de remessa (Outbound Delivery) no módulo de expedição (SD-LE) a partir de uma ordem de venda liberada.',
    tip: 'Informe o Local de Expedição (Shipping Point 1000) e o número do pedido com crédito liberado.'
  },
  VL02N: {
    title: 'Transação VL02N • Processar Remessa, Picking e Post Goods Issue (PGI)',
    description: 'Permite realizar a conferência de separação física (Picking) e contabilizar a Saída de Mercadorias (PGI / Baixa de Estoque).',
    tip: 'A Saída de Mercadorias (PGI) atualiza o estoque físico e gera o status liberado para faturamento fiscal.'
  },
  VL03N: {
    title: 'Transação VL03N • Consultar Documento de Remessa',
    description: 'Exibe os dados detalhados da remessa, status de separação (picking) e status de movimento de mercadorias.',
    tip: 'Utilizada para auditar o progresso logístico da expedição.'
  },
  VF01: {
    title: 'Transação VF01 • Criar Documento de Faturamento',
    description: 'Emite a fatura comercial e fiscal (Billing Document) referenciando a remessa concluída com Saída de Mercadorias (PGI).',
    tip: 'Gera a integração automática com Contas a Receber (FI-AR) e encerra o ciclo operacional Order-to-Cash.'
  },
  VF02: {
    title: 'Transação VF02 • Modificar Documento de Faturamento',
    description: 'Permite gerenciar e liberar documentos de faturamento com bloqueio contábil ou fiscal.',
    tip: 'Utilizada para regularizar bloqueios e efetivar a escrituração contábil.'
  },
  VF03: {
    title: 'Transação VF03 • Consultar Fatura Comercial',
    description: 'Exibe a fatura comercial emitida, valores líquidos, impostos apurados e fluxo completo de documentos da venda.',
    tip: 'Confirma o encerramento do processo comercial com sucesso.'
  },
  DASHBOARD: {
    title: 'Mesa de Trabalho do Trainee SD',
    description: 'Ambiente de atendimento de solicitações comerciais e acompanhamento da carreira profissional em SAP SD.',
    tip: 'Clique em "Atender Solicitação no SAP" para iniciar a execução da missão na transação mapeada.'
  }
};

export class FieldHelpModalComponent {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'erp-modal-overlay';
    this.isOpen = false;
    document.body.appendChild(this.overlay);

    this.bindGlobalEvents();
  }

  /**
   * Abre a ajuda contextual para um campo específico
   * @param {string} fieldKey - Identificador do campo no catálogo
   */
  showHelp(fieldKey) {
    const data = FIELD_HELP_CATALOG[fieldKey];

    if (!data) {
      this.showGenericFieldHelp(fieldKey);
      return;
    }

    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 520px;">
        <div class="erp-modal-header" style="background-color: #0f172a; padding: 12px 18px;">
          <div class="erp-modal-title" style="font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #0265dc; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">?</span>
            <span>F1 • Ajuda Contextual de Campo</span>
          </div>
          <button class="erp-modal-close" id="field-help-close-btn" title="Fechar (Esc)">
            ${Icons.x}
          </button>
        </div>

        <div class="erp-modal-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
          <div style="border-bottom: 1px solid var(--erp-border-subtle); padding-bottom: 8px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--erp-navy-900);">${data.title}</div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--erp-blue-primary); margin-top: 2px;">
              Elemento Técnico SAP: <strong>${data.sapCode}</strong>
            </div>
          </div>

          <div style="font-size: 12.5px; color: var(--erp-navy-900); line-height: 1.5;">
            ${data.description}
          </div>

          <div style="background-color: var(--erp-surface-subtle); border-left: 3px solid var(--erp-blue-primary); border-radius: 4px; padding: 10px 12px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--erp-navy-900); margin-bottom: 3px;">
              Por que isso é importante no processo SD?
            </div>
            <div style="font-size: 12px; color: var(--erp-text-muted); line-height: 1.45;">
              ${data.importance}
            </div>
          </div>

          ${data.example ? `
            <div style="font-size: 11.5px; color: var(--erp-text-muted); display: flex; gap: 6px; background: #ffffff; padding: 6px 10px; border: 1px solid var(--erp-border-subtle); border-radius: 4px;">
              <strong style="color: var(--erp-navy-900);">Exemplo no Processo:</strong>
              <span>${data.example}</span>
            </div>
          ` : ''}

          <div style="font-size: 10.5px; color: var(--erp-text-muted); font-family: var(--font-mono); border-top: 1px dashed var(--erp-border-subtle); padding-top: 6px;">
            Tabela do Dicionário ABAP: ${data.table}
          </div>
        </div>

        <div class="erp-modal-footer" style="padding: 10px 18px;">
          <button class="btn btn-secondary btn-sm" id="field-help-action-btn" style="padding: 6px 16px;">
            Fechar (Esc)
          </button>
        </div>
      </div>
    `;

    this.open();
  }

  /**
   * Ajuda genérica de campo quando não há entrada específica cadastrada
   */
  showGenericFieldHelp(fieldKey) {
    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 480px;">
        <div class="erp-modal-header" style="background-color: #0f172a; padding: 12px 18px;">
          <div class="erp-modal-title" style="font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #0265dc; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">?</span>
            <span>F1 • Ajuda de Campo</span>
          </div>
          <button class="erp-modal-close" id="field-help-close-btn" title="Fechar (Esc)">${Icons.x}</button>
        </div>
        <div class="erp-modal-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 14px; font-weight: 700; color: var(--erp-navy-900);">
            Campo: ${fieldKey || 'Parâmetro do Formulário'}
          </div>
          <div style="font-size: 12.5px; color: var(--erp-navy-800); line-height: 1.5;">
            Este campo faz parte da composição do formulário da transação atual. Certifique-se de preenchê-lo com base nas diretrizes do chamado comercial e nas informações cadastradas no mestre de dados.
          </div>
        </div>
        <div class="erp-modal-footer" style="padding: 10px 18px;">
          <button class="btn btn-secondary btn-sm" id="field-help-action-btn">Fechar (Esc)</button>
        </div>
      </div>
    `;

    this.open();
  }

  /**
   * Abre a ajuda geral da transação quando F1 é pressionado sem campo focado
   */
  showGeneralHelp(tcode) {
    const cleanTcode = (tcode || 'VA01').toUpperCase().replace('/', '');
    const data = TRANSACTION_GENERAL_HELP[cleanTcode] || TRANSACTION_GENERAL_HELP.VA01;

    this.overlay.innerHTML = `
      <div class="erp-modal-window" style="max-width: 520px;">
        <div class="erp-modal-header" style="background-color: #0f172a; padding: 12px 18px;">
          <div class="erp-modal-title" style="font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #0265dc; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;">?</span>
            <span>F1 • Visão Geral da Transação</span>
          </div>
          <button class="erp-modal-close" id="field-help-close-btn" title="Fechar (Esc)">${Icons.x}</button>
        </div>

        <div class="erp-modal-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 15px; font-weight: 700; color: var(--erp-navy-900);">
            ${data.title}
          </div>
          <div style="font-size: 12.5px; color: var(--erp-navy-900); line-height: 1.5;">
            ${data.description}
          </div>
          <div style="background-color: var(--erp-blue-bg); border-left: 3px solid var(--erp-blue-primary); border-radius: 4px; padding: 10px 12px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--erp-blue-primary); margin-bottom: 2px;">
              💡 Dica de Utilização do F1:
            </div>
            <div style="font-size: 12px; color: var(--erp-navy-900); line-height: 1.45;">
              ${data.tip}
            </div>
          </div>
        </div>

        <div class="erp-modal-footer" style="padding: 10px 18px;">
          <button class="btn btn-secondary btn-sm" id="field-help-action-btn">Fechar (Esc)</button>
        </div>
      </div>
    `;

    this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');

    const close = () => this.close();
    const closeBtn = this.overlay.querySelector('#field-help-close-btn');
    const actionBtn = this.overlay.querySelector('#field-help-action-btn');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (actionBtn) actionBtn.addEventListener('click', close);
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
  }

  /**
   * Identifica o elemento focado e aciona o F1 correspondente
   */
  handleF1Trigger() {
    const activeEl = document.activeElement;

    if (activeEl && activeEl !== document.body) {
      // 1. Verifica se tem data-help-id
      const helpId = activeEl.getAttribute('data-help-id');
      if (helpId) {
        this.showHelp(helpId);
        return;
      }

      // 2. Verifica se o elemento tem um ID mapeável (ex: input-sales-org -> salesOrg)
      const elId = activeEl.id || '';
      const mappedKey = this.mapElementIdToFieldKey(elId);
      if (mappedKey) {
        this.showHelp(mappedKey);
        return;
      }

      // 3. Procura no container mais próximo se há um label ou botão com data-help-id
      const formGroup = activeEl.closest('.erp-form-group') || activeEl.closest('td');
      if (formGroup) {
        const helpBtn = formGroup.querySelector('.erp-field-help-btn');
        if (helpBtn) {
          const btnHelpId = helpBtn.getAttribute('data-help-id');
          if (btnHelpId) {
            this.showHelp(btnHelpId);
            return;
          }
        }
      }
    }

    // Se nenhum campo específico com ajuda estiver focado, abre a ajuda geral da tela atual
    const tcode = this.detectCurrentTCode();
    this.showGeneralHelp(tcode);
  }

  mapElementIdToFieldKey(id) {
    const idMap = {
      'input-order-type': 'orderType',
      'input-sales-org': 'salesOrg',
      'input-dist-channel': 'distChannel',
      'input-division': 'division',
      'input-customer-id': 'customerId',
      'input-po-number': 'customerPoNumber',
      'input-payment-terms': 'paymentTerms',
      'input-incoterms': 'incoterms',
      'input-shipping-point': 'shippingPoint',
      'input-billing-type': 'billingType',
      'input-customer-search': 'customerId'
    };
    return idMap[id] || null;
  }

  detectCurrentTCode() {
    const activeBadge = document.querySelector('.transaction-tcode-badge') || document.querySelector('.erp-nav-btn.active');
    if (activeBadge) {
      const text = activeBadge.textContent.trim().replace('/N', '').replace('/', '');
      if (text) return text;
    }
    return 'VA01';
  }

  bindGlobalEvents() {
    // Tecla F1 global e tecla Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.handleF1Trigger();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Clique em qualquer botão de ajuda [?] na aplicação
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.erp-field-help-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const helpId = btn.getAttribute('data-help-id');
        if (helpId) {
          this.showHelp(helpId);
        }
      }
    });
  }
}

export const fieldHelpModal = new FieldHelpModalComponent();
