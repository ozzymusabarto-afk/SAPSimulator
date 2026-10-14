/**
 * NexusTech ERP • Banco de Dados Simulado em Memória (ERP State)
 * Guarda e manipula ordens de venda, clientes, materiais e condições
 */

import { InitialCustomers } from '../domain/customers.js';
import { InitialMaterials } from '../domain/materials.js';
import { InitialPricingRecords } from '../domain/pricing.js';
import { InitialSalesOrders } from '../domain/salesOrders.js';

class ErpDatabase {
  constructor() {
    this.listeners = [];
    this.resetDatabase();
  }

  /**
   * Inscreve um ouvinte para alterações no estado do ERP
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // --- Métodos de Clientes ---
  getCustomer(identifier) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();
    // 1. Busca direta por código exato (KUNNR)
    let found = this.customers.find(c => c.id === cleanId);
    if (found) return found;

    // 2. Busca por CNPJ
    found = this.customers.find(c => c.cnpj && c.cnpj.replace(/\D/g, '') === cleanId.replace(/\D/g, ''));
    if (found) return found;

    // 3. Busca por Nome / Razão Social ou Nome Fantasia (case-insensitive substring)
    const lower = cleanId.toLowerCase();
    found = this.customers.find(c => 
      (c.name && c.name.toLowerCase().includes(lower)) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(lower))
    );
    return found || null;
  }

  getAllCustomers() {
    return this.customers;
  }

  // --- Métodos de Materiais ---
  getMaterial(id) {
    return this.materials.find(m => m.id === id) || null;
  }

  getAllMaterials() {
    return this.materials;
  }

  updateMaterialStock(materialId, quantityDeduction) {
    const mat = this.getMaterial(materialId);
    if (mat) {
      mat.stockAvailable = Math.max(0, mat.stockAvailable - quantityDeduction);
      mat.stockReserved += quantityDeduction;
      this.notify();
    }
  }

  // --- Métodos de Condições de Preço ---
  getPricingRecord(materialId, salesOrg = '1000', distChannel = '10', conditionCode = 'PR00') {
    return this.pricingRecords.find(p => 
      p.materialId === materialId &&
      p.salesOrg === salesOrg &&
      p.distChannel === distChannel &&
      p.conditionCode === conditionCode
    ) || null;
  }

  addOrUpdatePricingRecord(record) {
    const index = this.pricingRecords.findIndex(p => 
      p.materialId === record.materialId &&
      p.salesOrg === record.salesOrg &&
      p.distChannel === record.distChannel &&
      p.conditionCode === record.conditionCode
    );

    if (index >= 0) {
      this.pricingRecords[index] = { ...this.pricingRecords[index], ...record };
    } else {
      this.pricingRecords.push(record);
    }

    // Se for PR00, atualiza flag do material
    if (record.conditionCode === 'PR00') {
      const mat = this.getMaterial(record.materialId);
      if (mat) {
        mat.basePrice = record.amount;
        mat.hasPricingCondition = true;
      }
    }

    this.notify();
  }

  // --- Métodos de Ordens de Venda (VA01 / VA03) ---
  createSalesOrder(orderData, customDocNumber = null) {
    const docNumber = customDocNumber || orderData.docNumber || String(this.nextOrderNumber++);

    // Cálculo automático de valores caso não fornecidos
    let calculatedNet = orderData.netValue;
    let calculatedTax = orderData.taxValue;
    let calculatedTotal = orderData.totalValue;

    if (calculatedTotal === undefined || calculatedTotal === 0) {
      let gross = 0;
      let discount = 0;
      (orderData.items || []).forEach(it => {
        const mat = this.getMaterial(it.materialId);
        const pr = this.getPricingRecord(it.materialId, orderData.salesOrg || '1000', orderData.distChannel || '10', 'PR00');
        const basePrice = pr ? pr.amount : (mat ? mat.basePrice : 0);
        const q = Number(it.quantity) || 0;
        const g = basePrice * q;
        const d = g * ((Number(it.manualDiscountPercent) || 0) / 100);
        gross += g;
        discount += d;
      });
      calculatedNet = Math.max(0, gross - discount);
      calculatedTax = calculatedNet * (0.18 + 0.0925);
      calculatedTotal = calculatedNet + calculatedTax;
    }

    const newOrder = {
      docNumber,
      orderType: orderData.orderType || 'OR',
      salesOrg: orderData.salesOrg || '1000',
      distChannel: orderData.distChannel || '10',
      division: orderData.division || '01',
      customerId: orderData.customerId,
      customerPoNumber: orderData.customerPoNumber || '',
      paymentTerms: orderData.paymentTerms,
      incoterms: orderData.incoterms,
      incotermsLocation: orderData.incotermsLocation || '',
      orderDate: orderData.orderDate || new Date().toISOString(),
      items: orderData.items || [],
      netValue: calculatedNet || 0,
      taxValue: calculatedTax || 0,
      totalValue: calculatedTotal || 0,
      overallStatus: orderData.overallStatus || 'OPEN', // OPEN, CREDIT_BLOCKED, COMPLETED, CANCELLED
      creditStatus: orderData.creditStatus || 'NOT_CHECKED',
      deliveryStatus: orderData.deliveryStatus || 'NOT_DELIVERED',
      billingStatus: orderData.billingStatus || 'NOT_BILLED',
      documentFlow: orderData.documentFlow || [
        { type: 'ORDER', number: docNumber, status: 'OPEN', date: new Date().toLocaleDateString('pt-BR') }
      ]
    };

    // Verificação de Limite de Crédito
    const customer = this.getCustomer(orderData.customerId);
    if (customer && !orderData.creditStatus) {
      const projectedCredit = customer.creditUsed + newOrder.totalValue;
      if (projectedCredit > customer.creditLimit || customer.creditStatus === 'BLOCKED') {
        newOrder.overallStatus = 'CREDIT_BLOCKED';
        newOrder.creditStatus = 'BLOCKED';
        this.creditBlockedOrders.push({
          orderDocNumber: docNumber,
          customer,
          totalValue: newOrder.totalValue,
          blockedDate: new Date().toLocaleDateString('pt-BR'),
          reason: `Limite de Crédito Excedido (Utilizado: R$ ${customer.creditUsed.toFixed(2)} + Pedido: R$ ${newOrder.totalValue.toFixed(2)} > Limite: R$ ${customer.creditLimit.toFixed(2)})`
        });
      } else {
        newOrder.creditStatus = 'RELEASED';
        customer.creditUsed += newOrder.totalValue;
      }
    }

    this.salesOrders.push(newOrder);
    this.notify();
    return newOrder;
  }

  /**
   * Semeadura genérica e idempotente de documentos iniciais declarados pelo cenário ativo
   * @param {Array} documents - Lista declarativa de documentos
   */
  seedScenarioDocuments(documents = []) {
    if (!Array.isArray(documents) || documents.length === 0) return;

    documents.forEach(doc => {
      if (doc.docType === 'SALES_ORDER' || !doc.docType) {
        // Idempotência: não duplica se já existir
        const exists = doc.docNumber ? this.getSalesOrder(doc.docNumber) : false;
        if (!exists) {
          this.createSalesOrder(doc, doc.docNumber);
        }
      }
    });
  }

  /**
   * Atualiza uma ordem de venda existente e recalcula seus valores comerciais
   * @param {string} docNumber
   * @param {Object} updatedData
   */
  updateSalesOrder(docNumber, updatedData) {
    const orderIndex = this.salesOrders.findIndex(o => o.docNumber === docNumber);
    if (orderIndex === -1) return null;

    const existing = this.salesOrders[orderIndex];
    const items = updatedData.items || existing.items;

    let gross = 0;
    let discount = 0;
    items.forEach(it => {
      const mat = this.getMaterial(it.materialId);
      const pr = this.getPricingRecord(it.materialId, updatedData.salesOrg || existing.salesOrg, updatedData.distChannel || existing.distChannel, 'PR00');
      const basePrice = pr ? pr.amount : (mat ? mat.basePrice : 0);
      const q = Number(it.quantity) || 0;
      const g = basePrice * q;
      const d = g * ((Number(it.manualDiscountPercent) || 0) / 100);
      gross += g;
      discount += d;
    });

    const net = updatedData.netValue !== undefined ? updatedData.netValue : Math.max(0, gross - discount);
    const taxes = updatedData.taxValue !== undefined ? updatedData.taxValue : net * (0.18 + 0.0925);
    const total = updatedData.totalValue !== undefined ? updatedData.totalValue : net + taxes;

    const updatedOrder = {
      ...existing,
      ...updatedData,
      items,
      netValue: net,
      taxValue: taxes,
      totalValue: total,
      lastModifiedDate: new Date().toISOString()
    };

    this.salesOrders[orderIndex] = updatedOrder;
    this.notify();
    return updatedOrder;
  }

  getSalesOrder(docNumber) {
    return this.salesOrders.find(o => o.docNumber === docNumber) || null;
  }

  getAllSalesOrders() {
    return this.salesOrders;
  }

  // --- Liberação de Crédito Comercial (VKM1) ---
  releaseCreditOrder(docNumber, managerNotes = 'Liberado por alçada comercial') {
    const order = this.getSalesOrder(docNumber);
    if (!order) return false;

    order.overallStatus = 'OPEN';
    order.creditStatus = 'RELEASED_MANUAL';
    order.creditReleaseNotes = managerNotes;

    this.creditBlockedOrders = this.creditBlockedOrders.filter(b => b.orderDocNumber !== docNumber);
    this.notify();
    return true;
  }

  // --- Gestão de Entregas e Expedição (VL01N / VL02N / VL03N) ---
  createDelivery(deliveryData) {
    const order = this.getSalesOrder(deliveryData.salesOrderNumber);
    if (!order) {
      return { success: false, error: `Ordem de venda nº ${deliveryData.salesOrderNumber} não encontrada no mandante 800.` };
    }

    if (order.overallStatus === 'CANCELLED') {
      return { success: false, error: `A Ordem de Venda nº ${order.docNumber} está CANCELADA. Fornecimento não autorizado.` };
    }

    if (order.overallStatus === 'CREDIT_BLOCKED' || order.creditStatus === 'BLOCKED') {
      return { success: false, error: `A Ordem de Venda nº ${order.docNumber} possui Bloqueio de Crédito Comercial (VKM1). A remessa não pode ser criada sem prévia liberação financeira.` };
    }

    // Lote F: Verificação de unicidade — impede múltiplas remessas ativas para a mesma OR
    const existingDelivery = this.deliveries.find(
      d => d.salesOrderNumber === deliveryData.salesOrderNumber && d.status !== 'CANCELLED'
    );
    if (existingDelivery) {
      return {
        success: false,
        error: `A Ordem de Venda nº ${deliveryData.salesOrderNumber} já possui uma remessa ativa (Documento ${existingDelivery.deliveryNumber}). Para processar o fornecimento, utilize a transação VL02N.`
      };
    }

    const deliveryNumber = deliveryData.deliveryNumber || String(this.nextDeliveryNumber++);
    const shippingPoint = deliveryData.shippingPoint || '1000';
    const deliveryDate = deliveryData.deliveryDate || new Date().toISOString();

    let totalQuantity = 0;
    let totalWeightKg = 0;

    const deliveryItems = (order.items || []).map((it, idx) => {
      const mat = this.getMaterial(it.materialId);
      const qty = Number(it.quantity) || 0;
      const weight = mat ? (mat.weightKg || 1) * qty : qty;
      totalQuantity += qty;
      totalWeightKg += weight;

      return {
        itemPosition: (idx + 1) * 10,
        materialId: it.materialId,
        description: mat ? mat.description : it.materialId,
        plantId: mat ? mat.plantId : '1000',
        storageLocation: mat ? mat.storageLocation : 'DEP1',
        deliveryQuantity: qty,
        pickedQuantity: 0,
        unit: mat ? mat.baseUnit : 'UN',
        weightKg: weight
      };
    });

    const newDelivery = {
      deliveryNumber,
      shippingPoint,
      salesOrderNumber: order.docNumber,
      customerId: order.customerId,
      customerPoNumber: order.customerPoNumber || '',
      deliveryDate,
      plannedGoodsIssueDate: deliveryDate,
      actualGoodsIssueDate: null,
      status: 'OPEN', // OPEN, PICKED, COMPLETED
      pickingStatus: 'NOT_PICKED', // NOT_PICKED, COMPLETED
      goodsIssueStatus: 'NOT_ISSUED', // NOT_ISSUED, COMPLETED
      items: deliveryItems,
      totalQuantity,
      totalWeightKg,
      documentFlow: [
        { type: 'ORDER', number: order.docNumber, status: 'OPEN', date: new Date().toLocaleDateString('pt-BR') },
        { type: 'DELIVERY', number: deliveryNumber, status: 'OPEN', date: new Date().toLocaleDateString('pt-BR') }
      ]
    };

    // Atualiza status da ordem de venda
    order.deliveryStatus = 'IN_PROCESS';
    if (!order.documentFlow.some(f => f.type === 'DELIVERY' && f.number === deliveryNumber)) {
      order.documentFlow.push({
        type: 'DELIVERY',
        number: deliveryNumber,
        status: 'OPEN',
        date: new Date().toLocaleDateString('pt-BR')
      });
    }

    this.deliveries.push(newDelivery);
    this.notify();
    return { success: true, delivery: newDelivery };
  }

  getDelivery(deliveryNumber) {
    return this.deliveries.find(d => d.deliveryNumber === deliveryNumber) || null;
  }

  getAllDeliveries() {
    return this.deliveries;
  }

  postGoodsIssue(deliveryNumber) {
    const delivery = this.getDelivery(deliveryNumber);
    if (!delivery) {
      return { success: false, error: `Documento de Remessa nº ${deliveryNumber} não encontrado.` };
    }

    if (delivery.status === 'COMPLETED' || delivery.goodsIssueStatus === 'COMPLETED') {
      return { success: false, error: `A Saída de Mercadorias (PGI) já foi registrada anteriormente para a Remessa nº ${deliveryNumber}. Movimento não pode ser duplicado.` };
    }

    // 1. Confirmação do Picking
    delivery.items.forEach(it => {
      it.pickedQuantity = it.deliveryQuantity;
    });
    delivery.pickingStatus = 'COMPLETED';

    // 2. Baixa física de estoque (Movimento 601)
    delivery.items.forEach(it => {
      const mat = this.getMaterial(it.materialId);
      if (mat) {
        mat.stockPhysical = Math.max(0, mat.stockPhysical - it.deliveryQuantity);
        mat.stockReserved = Math.max(0, mat.stockReserved - it.deliveryQuantity);
        mat.stockAvailable = Math.max(0, mat.stockPhysical - mat.stockReserved);
      }
    });

    // 3. Atualização de status da Remessa
    delivery.status = 'COMPLETED';
    delivery.goodsIssueStatus = 'COMPLETED';
    delivery.actualGoodsIssueDate = new Date().toISOString();

    const matDocNumber = '49' + deliveryNumber.slice(2);
    delivery.documentFlow.push({
      type: 'MATERIAL_DOC',
      number: matDocNumber,
      status: 'COMPLETED',
      movement: '601',
      date: new Date().toLocaleDateString('pt-BR')
    });

    // 4. Atualização da Ordem de Venda vinculada
    const order = this.getSalesOrder(delivery.salesOrderNumber);
    if (order) {
      order.deliveryStatus = 'COMPLETED';
      const flowDel = order.documentFlow.find(f => f.type === 'DELIVERY' && f.number === deliveryNumber);
      if (flowDel) {
        flowDel.status = 'COMPLETED';
      }
      order.documentFlow.push({
        type: 'MATERIAL_DOC',
        number: matDocNumber,
        status: 'COMPLETED',
        movement: '601',
        date: new Date().toLocaleDateString('pt-BR')
      });
    }

    this.notify();
    return { success: true, delivery, materialDocNumber: matDocNumber };
  }

  // --- Gestão de Faturamento / Billing (VF01 / VF02 / VF03) ---
  createInvoice(invoiceData) {
    let order = null;
    let delivery = null;

    if (invoiceData.deliveryNumber) {
      delivery = this.getDelivery(invoiceData.deliveryNumber);
      if (!delivery) {
        return { success: false, error: `Documento de Remessa nº ${invoiceData.deliveryNumber} não encontrado no sistema.` };
      }

      if (delivery.status !== 'COMPLETED' && delivery.goodsIssueStatus !== 'COMPLETED') {
        return {
          success: false,
          error: `A Remessa nº ${delivery.deliveryNumber} ainda não possui Saída de Mercadorias (PGI / Mov. 601) registrada na VL02N. O faturamento não pode ser emitido antes da baixa física de estoque.`
        };
      }

      order = this.getSalesOrder(delivery.salesOrderNumber);
    } else if (invoiceData.salesOrderNumber) {
      order = this.getSalesOrder(invoiceData.salesOrderNumber);
    }

    if (!order) {
      return { success: false, error: 'Ordem de Venda de origem não encontrada.' };
    }

    if (order.overallStatus === 'CANCELLED') {
      return { success: false, error: `A Ordem de Venda nº ${order.docNumber} está CANCELADA. Faturamento não autorizado.` };
    }

    if (order.overallStatus === 'CREDIT_BLOCKED' || order.creditStatus === 'BLOCKED') {
      return { success: false, error: `A Ordem de Venda nº ${order.docNumber} possui Bloqueio de Crédito Comercial ativo (VKM1).` };
    }

    const invoiceNumber = invoiceData.invoiceNumber || String(this.nextInvoiceNumber++);
    const billingType = invoiceData.billingType || 'F2';
    const billingDate = invoiceData.billingDate || new Date().toISOString();

    const invoiceItems = (order.items || []).map((it, idx) => {
      const mat = this.getMaterial(it.materialId);
      const pr = this.getPricingRecord(it.materialId, order.salesOrg, order.distChannel, 'PR00');
      const unitPrice = pr ? pr.amount : (mat ? mat.basePrice : 0);
      const discountPct = Number(it.manualDiscountPercent) || 0;
      const gross = unitPrice * it.quantity;
      const discount = gross * (discountPct / 100);
      const net = gross - discount;
      const taxes = net * (0.18 + 0.0925);
      const total = net + taxes;

      return {
        itemPosition: (idx + 1) * 10,
        materialId: it.materialId,
        description: mat ? mat.description : it.materialId,
        quantity: it.quantity,
        unit: mat ? mat.baseUnit : 'UN',
        unitPrice,
        discountPercent: discountPct,
        grossValue: gross,
        discountValue: discount,
        netValue: net,
        taxValue: taxes,
        totalValue: total
      };
    });

    const newInvoice = {
      invoiceNumber,
      billingType,
      billingDate,
      deliveryNumber: delivery ? delivery.deliveryNumber : null,
      salesOrderNumber: order.docNumber,
      customerId: order.customerId,
      paymentTerms: order.paymentTerms,
      incoterms: order.incoterms,
      items: invoiceItems,
      netValue: order.netValue,
      taxValue: order.taxValue,
      totalValue: order.totalValue,
      status: 'COMPLETED', // COMPLETED, CANCELLED
      fiscalNotes: invoiceData.notes || 'Fatura Comercial F2 emitida com integração contábil e fiscal automática.',
      documentFlow: [
        { type: 'ORDER', number: order.docNumber, status: 'COMPLETED', date: new Date().toLocaleDateString('pt-BR') },
        ...(delivery ? [{ type: 'DELIVERY', number: delivery.deliveryNumber, status: 'COMPLETED', date: new Date().toLocaleDateString('pt-BR') }] : []),
        { type: 'INVOICE', number: invoiceNumber, status: 'COMPLETED', date: new Date().toLocaleDateString('pt-BR') }
      ]
    };

    // Atualiza a Ordem de Venda
    order.billingStatus = 'COMPLETED';
    order.overallStatus = 'COMPLETED';
    if (!order.documentFlow.some(f => f.type === 'INVOICE' && f.number === invoiceNumber)) {
      order.documentFlow.push({
        type: 'INVOICE',
        number: invoiceNumber,
        status: 'COMPLETED',
        date: new Date().toLocaleDateString('pt-BR')
      });
    }

    // Atualiza a Remessa vinculada
    if (delivery && !delivery.documentFlow.some(f => f.type === 'INVOICE' && f.number === invoiceNumber)) {
      delivery.documentFlow.push({
        type: 'INVOICE',
        number: invoiceNumber,
        status: 'COMPLETED',
        date: new Date().toLocaleDateString('pt-BR')
      });
    }

    this.invoices.push(newInvoice);
    this.notify();
    return { success: true, invoice: newInvoice };
  }

  getInvoice(invoiceNumber) {
    return this.invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
  }

  getAllInvoices() {
    return this.invoices;
  }

  updateInvoice(invoiceNumber, updatedData) {
    const inv = this.getInvoice(invoiceNumber);
    if (!inv) return false;

    if (updatedData.fiscalNotes !== undefined) inv.fiscalNotes = updatedData.fiscalNotes;
    if (updatedData.status !== undefined) inv.status = updatedData.status;

    this.notify();
    return true;
  }

  cancelInvoice(invoiceNumber, reason = 'Estorno solicitado') {
    const inv = this.getInvoice(invoiceNumber);
    if (!inv) return { success: false, error: 'Fatura não encontrada.' };

    inv.status = 'CANCELLED';
    inv.fiscalNotes += ` • Estorno: ${reason}`;

    const order = this.getSalesOrder(inv.salesOrderNumber);
    if (order) {
      order.billingStatus = 'NOT_BILLED';
    }

    this.notify();
    return { success: true, invoice: inv };
  }

  // Reset total para estado inicial do treinamento
  resetDatabase() {
    this.customers = JSON.parse(JSON.stringify(InitialCustomers));
    this.materials = JSON.parse(JSON.stringify(InitialMaterials));
    this.pricingRecords = JSON.parse(JSON.stringify(InitialPricingRecords));
    this.salesOrders = [];
    this.deliveries = [];
    this.invoices = [];
    this.creditBlockedOrders = [];
    this.nextOrderNumber = 10000100;
    this.nextDeliveryNumber = 80000001;
    this.nextInvoiceNumber = 90000001;

    // Carrega a base inicial de ordens de venda de forma idempotente
    this.seedScenarioDocuments(InitialSalesOrders);
    this.notify();
  }
}

export const db = new ErpDatabase();
