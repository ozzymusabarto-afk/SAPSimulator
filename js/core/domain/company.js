/**
 * NexusTech ERP • Estrutura Organizacional
 * Simulação da Estrutura Comercial do SAP SD
 */

export const CompanyStructure = {
  // Código da Empresa Contábil (FI)
  companyCode: {
    id: 'BR10',
    name: 'NexusTech Brasil Distribuidora S/A',
    country: 'BR',
    currency: 'BRL'
  },

  // Organizações de Vendas (SD)
  salesOrganizations: [
    { id: '1000', name: '1000 - NexusTech Vendas Nacionais (BRL)', currency: 'BRL' },
    { id: '2000', name: '2000 - NexusTech Vendas Exportação (USD)', currency: 'USD' },
    { id: '3000', name: '3000 - NexusTech Serviços & Projetos Especiais', currency: 'BRL' }
  ],

  // Canais de Distribuição (SD)
  distributionChannels: [
    { id: '10', name: '10 - Venda Direta / Corporativo (B2B)' },
    { id: '20', name: '20 - Revenda / Atacado Distribuidor' },
    { id: '30', name: '30 - E-commerce & Varejo Digital' }
  ],

  // Setores de Atividade (SD)
  divisions: [
    { id: '01', name: '01 - Equipamentos & Hardware de Rede' },
    { id: '02', name: '02 - Componentes, Peças & Acessórios' },
    { id: '03', name: '03 - Serviços Corporativos & Licenças' }
  ],

  // Centros de Distribuição e Produção (Plant / MM)
  plants: [
    { id: '1000', name: '1000 - CD Matriz São Paulo (SP)', state: 'SP' },
    { id: '2000', name: '2000 - CD Filial Itajaí (SC)', state: 'SC' }
  ],

  // Depósitos de Armazenagem (Storage Location / MM)
  storageLocations: [
    { id: 'DEP1', name: 'DEP1 - Depósito Geral de Produtos Acabados', plantId: '1000' },
    { id: 'DEP2', name: 'DEP2 - Depósito de Peças & Componentes Críticos', plantId: '1000' },
    { id: 'AVAR', name: 'AVAR - Depósito de Avarias / Quarentena', plantId: '1000' }
  ],

  // Tipos de Ordem de Venda Padrão SD
  orderTypes: [
    { id: 'OR', code: 'OR/TA', name: 'OR/TA - Ordem Padrão (Venda Normal)' },
    { id: 'QT', code: 'QT/AN', name: 'QT/AN - Cotação Comercial (Sem Saída)' },
    { id: 'RE', code: 'RE/RE', name: 'RE/RE - Ordem de Devolução de Mercadoria' },
    { id: 'FD', code: 'FD/FD', name: 'FD/FD - Fornecimento Gratuito (Amostra)' }
  ],

  // Condições de Pagamento Padrão
  paymentTerms: [
    { id: 'Z001', name: 'Z001 - À vista (Imediato no Faturamento)', days: 0 },
    { id: 'Z015', name: 'Z015 - 15 dias líquido', days: 15 },
    { id: 'Z030', name: 'Z030 - 30 dias líquido', days: 30 },
    { id: 'Z060', name: 'Z060 - 60 dias líquido', days: 60 },
    { id: 'Z28D', name: 'Z28D - 28/56 dias (2 parcelas)', days: 28 }
  ],

  // Incoterms Padrão
  incotermsList: [
    { id: 'CIF', name: 'CIF - Custo, Seguro e Frete (Por conta do vendedor)' },
    { id: 'FOB', name: 'FOB - Livre a Bordo (Por conta do comprador)' },
    { id: 'EXW', name: 'EXW - Na Origem (Retira no CD NexusTech)' }
  ]
};
