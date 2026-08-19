/**
 * NexusTech ERP • Esquema de Cálculo de Preços (Pricing Procedure / V/08 / KONP / VK11)
 */

export const ConditionTypes = [
  {
    code: 'PR00',
    name: 'Preço Base do Material (Tabela Padrão)',
    type: 'BASE_PRICE',
    calcType: 'FIXED_PER_UNIT',
    isMandatory: true,
    description: 'Preço de tabela registrado no mestre ou na transação VK11.'
  },
  {
    code: 'RB00',
    name: 'Desconto Comercial (%)',
    type: 'DISCOUNT',
    calcType: 'PERCENTAGE',
    isMandatory: false,
    description: 'Desconto comercial negociado com o cliente (negativo).'
  },
  {
    code: 'KF00',
    name: 'Frete Fixo por Item',
    type: 'SURCHARGE',
    calcType: 'FIXED_AMOUNT',
    isMandatory: false,
    description: 'Taxa de frete quando a modalidade for CIF ou entrega especial.'
  },
  {
    code: 'MWST',
    name: 'ICMS (Imposto Estadual / 18%)',
    type: 'TAX',
    calcType: 'PERCENTAGE',
    rate: 0.18,
    isMandatory: true,
    description: 'Imposto sobre Circulação de Mercadorias e Serviços.'
  },
  {
    code: 'PIS_COF',
    name: 'PIS/COFINS (Tributo Federal / 9.25%)',
    type: 'TAX',
    calcType: 'PERCENTAGE',
    rate: 0.0925,
    isMandatory: true,
    description: 'Programa de Integração Social e Contribuição para Financiamento da Seguridade Social.'
  }
];

export const InitialPricingRecords = [
  { materialId: 'MAT-1001', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 8500.00, validTo: '31.12.2028' },
  { materialId: 'MAT-2004', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 1250.00, validTo: '31.12.2028' },
  { materialId: 'MAT-3050', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 980.00, validTo: '31.12.2028' }
  // Nota: MAT-4099 intencionalmente não possui registro de PR00 para simular erro de precificação
];
