/**
 * NexusTech ERP • Motor de Determinação e Cálculo de Preços (Pricing Engine)
 */

import { db } from './erpDatabase.js';

export const PricingEngine = {
  /**
   * Calcula as condições de preço de um item individual
   * @param {Object} item - { materialId, quantity, manualDiscountPercent, manualFreight }
   * @param {string} salesOrg
   * @param {string} distChannel
   * @returns {Object} Detalhamento das condições e valores
   */
  calculateItemPricing(item, salesOrg = '1000', distChannel = '10') {
    const mat = db.getMaterial(item.materialId);
    const pricingRecord = db.getPricingRecord(item.materialId, salesOrg, distChannel, 'PR00');
    
    const quantity = Number(item.quantity) || 1;
    const basePrice = pricingRecord ? pricingRecord.amount : (mat ? mat.basePrice : 0);
    const hasBasePrice = basePrice > 0;

    // Condição PR00 (Preço Base Bruto)
    const grossAmount = basePrice * quantity;

    // Condição RB00 (Desconto Comercial %)
    const discountPercent = Number(item.manualDiscountPercent) || 0;
    const discountAmount = grossAmount * (discountPercent / 100);

    // Condição KF00 (Frete Fixo)
    const freightAmount = Number(item.manualFreight) || 0;

    // Valor Líquido Comercial (Net Value)
    const netValue = Math.max(0, grossAmount - discountAmount + freightAmount);

    // Impostos (MWST: ICMS 18%, PIS/COFINS: 9.25%)
    const icmsValue = netValue * 0.18;
    const pisCofinsValue = netValue * 0.0925;
    const totalTaxValue = icmsValue + pisCofinsValue;

    // Valor Total com Impostos
    const totalValue = netValue + totalTaxValue;

    const conditionLines = [
      { code: 'PR00', name: 'Preço Base Material', rate: basePrice, value: grossAmount, type: 'BASE' }
    ];

    if (discountPercent > 0) {
      conditionLines.push({
        code: 'RB00',
        name: `Desconto Comercial (${discountPercent}%)`,
        rate: -discountPercent,
        value: -discountAmount,
        type: 'DISCOUNT'
      });
    }

    if (freightAmount > 0) {
      conditionLines.push({
        code: 'KF00',
        name: 'Frete Fixo',
        rate: freightAmount,
        value: freightAmount,
        type: 'SURCHARGE'
      });
    }

    conditionLines.push(
      { code: 'MWST', name: 'ICMS Destino (18%)', rate: 18, value: icmsValue, type: 'TAX' },
      { code: 'PIS_COF', name: 'PIS/COFINS (9.25%)', rate: 9.25, value: pisCofinsValue, type: 'TAX' }
    );

    return {
      hasBasePrice,
      basePrice,
      quantity,
      grossAmount,
      discountPercent,
      discountAmount,
      freightAmount,
      netValue,
      icmsValue,
      pisCofinsValue,
      totalTaxValue,
      totalValue,
      conditionLines
    };
  },

  /**
   * Calcula o resumo total do pedido somando todos os itens
   * @param {Array} items
   * @param {string} salesOrg
   * @param {string} distChannel
   */
  calculateOrderTotals(items, salesOrg = '1000', distChannel = '10') {
    let totalNet = 0;
    let totalTaxes = 0;
    let totalGross = 0;
    let totalDiscount = 0;
    let totalFreight = 0;
    let hasPricingError = false;

    const calculatedItems = items.map((item, index) => {
      const pricing = this.calculateItemPricing(item, salesOrg, distChannel);
      if (!pricing.hasBasePrice) {
        hasPricingError = true;
      }
      totalNet += pricing.netValue;
      totalTaxes += pricing.totalTaxValue;
      totalGross += pricing.grossAmount;
      totalDiscount += pricing.discountAmount;
      totalFreight += pricing.freightAmount;

      return {
        ...item,
        itemNumber: (index + 1) * 10, // 10, 20, 30... padrão de numeração de itens do SAP
        pricing
      };
    });

    return {
      items: calculatedItems,
      totalGross,
      totalDiscount,
      totalFreight,
      totalNet,
      totalTaxes,
      totalOrderValue: totalNet + totalTaxes,
      hasPricingError
    };
  }
};
