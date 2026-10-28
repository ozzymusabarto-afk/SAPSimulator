/**
 * Auditoria isolada das 54 missões com o banco em memória do simulador.
 * Execute com: npm run audit:missions
 * Não acessa o localStorage do navegador nem grava dados do trainee real.
 */
import assert from 'node:assert/strict';
import { ScenarioCatalog } from '../js/core/scenarios/catalog.js';
import { scenarioEngine } from '../js/core/engine/scenarioEngine.js';
import { db } from '../js/core/engine/erpDatabase.js';
import { trainee } from '../js/core/engine/traineeEngine.js';
import { traineeRepository } from '../js/core/repository/traineeRepository.js';

const failures = [];
const expectedActions = new Set([
  'SALES_ORDER_SUBMISSION', 'CREDIT_RELEASE', 'SALES_ORDER_MODIFICATION',
  'CREATE_DELIVERY', 'POST_GOODS_ISSUE', 'CREATE_INVOICE', 'FULL_O2C'
]);
const supportedTcodes = new Set(['XD03', 'VA01', 'VA02', 'VA03', 'VK11', 'VKM1', 'VL01N', 'VL02N', 'VL03N', 'VF01', 'VF02', 'VF03', 'MM03']);

function useIsolatedProfile(userId) {
  traineeRepository.setSessionUserId(userId);
  trainee.profile = trainee.createDefaultProfile(userId);
}

function createOrderData(scenario) {
  const target = scenario.targetCriteria || {};
  const customerId = target.customerId || scenario.initialDocuments?.[0]?.customerId || '100045';
  const sourceItems = target.items?.length ? target.items : scenario.initialDocuments?.[0]?.items || [{ materialId: 'MAT-1001', quantity: 1 }];
  const items = sourceItems.map(item => ({
    materialId: item.materialId,
    quantity: Number(item.quantity || 1),
    manualDiscountPercent: Number(item.discountPercent ?? item.manualDiscountPercent ?? 0)
  }));
  const gross = items.reduce((sum, item) => {
    const unitPrice = db.getPricingRecord(item.materialId, target.salesOrg || '1000', target.distChannel || '10')?.amount
      ?? db.getMaterial(item.materialId)?.basePrice ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);
  const netValue = items.reduce((sum, item) => {
    const unitPrice = db.getPricingRecord(item.materialId, target.salesOrg || '1000', target.distChannel || '10')?.amount
      ?? db.getMaterial(item.materialId)?.basePrice ?? 0;
    return sum + unitPrice * item.quantity * (1 - item.manualDiscountPercent / 100);
  }, 0);
  return {
    orderType: target.orderType || 'OR',
    salesOrg: target.salesOrg || '1000',
    distChannel: target.distChannel || '10',
    division: target.division || '01',
    customerId,
    customerPoNumber: target.customerPoNumber || scenario.purchaseOrderDocument?.poNumber
      || scenario.initialDocuments?.[0]?.customerPoNumber || `AUDIT-${scenario.code}`,
    paymentTerms: target.paymentTerms || scenario.initialDocuments?.[0]?.paymentTerms || 'Z030',
    incoterms: target.incoterms || scenario.initialDocuments?.[0]?.incoterms || 'CIF',
    items,
    netValue,
    taxValue: netValue * 0.2725,
    totalValue: netValue * 1.2725
  };
}

function findOrCreateOrder(scenario, docNumber) {
  const existing = docNumber ? db.getSalesOrder(docNumber) : null;
  return existing || db.createSalesOrder(createOrderData(scenario), docNumber || null);
}

function getOpenOrder(scenario, docNumber) {
  const order = findOrCreateOrder(scenario, docNumber);
  if (order.overallStatus === 'CREDIT_BLOCKED' || order.creditStatus === 'BLOCKED') {
    db.releaseCreditOrder(order.docNumber);
  }
  return db.getSalesOrder(order.docNumber);
}

function getDelivery(scenario, salesOrderNumber) {
  const existing = db.getAllDeliveries().find(item => item.salesOrderNumber === salesOrderNumber && item.status !== 'CANCELLED');
  if (existing) return existing;
  const result = db.createDelivery({
    salesOrderNumber,
    shippingPoint: scenario.targetCriteria?.shippingPoint || '1000'
  });
  assert.equal(result.success, true, result.error || 'Falha ao criar remessa.');
  return result.delivery;
}

function postGoodsIssue(delivery) {
  if (delivery.status === 'COMPLETED' || delivery.goodsIssueStatus === 'COMPLETED') return delivery;
  for (const item of delivery.items || []) item.pickedQuantity = item.deliveryQuantity;
  delivery.pickingStatus = 'COMPLETED';
  const result = db.postGoodsIssue(delivery.deliveryNumber);
  assert.equal(result.success, true, result.error || 'Falha ao registrar PGI.');
  return result.delivery;
}

function finishCreditMission(scenario, order) {
  const target = scenario.targetCriteria;
  assert.ok(!target.targetDocNumber || order.docNumber === target.targetDocNumber, 'VKM1 recebeu ordem diferente da missão.');
  assert.ok(!target.customerId || order.customerId === target.customerId, 'VKM1 recebeu cliente diferente da missão.');

  const customerId = target.customerId || order.customerId;
  const analysis = scenarioEngine.validateCustomerAnalysis(customerId);
  assert.equal(analysis.isValid, true, analysis.feedback?.mentorSpeech || 'XD03 rejeitou a análise do cliente-alvo.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'A consulta XD03 concluiu a missão antes da ação VKM1.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'A análise XD03 concluiu todos os objetivos antes da liberação VKM1.');

  if (target.creditDecision && target.creditDecision !== 'RELEASE') {
    assert.ok(['HOLD', 'ESCALATE', 'REJECT'].includes(target.creditDecision), 'Decisão de crédito não suportada pelo laboratório.');
    scenarioEngine.completeObjectives(['access_vkm1', 'release_with_notes', 'release_credit_order', 'analyze_credit', 'release_order']);
    assert.equal(order.overallStatus, 'CREDIT_BLOCKED', 'Uma decisão sem RELEASE não pode desbloquear a ordem.');
    assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), true, 'A decisão documentada deveria concluir os objetivos do chamado.');
    assert.equal(
      scenarioEngine.completeActiveScenarioIfReady('Decisão documentada de crédito', `Ordem ${order.docNumber} com decisão ${target.creditDecision}`),
      true,
      'A decisão documentada deveria homologar a missão.'
    );
    return;
  }

  assert.equal(db.releaseCreditOrder(order.docNumber), true, 'VKM1 não liberou a ordem-alvo.');
  // Replica os objetivos registrados pelo handler da VKM1 após uma liberação válida.
  scenarioEngine.completeObjectives(['access_vkm1', 'release_with_notes', 'release_credit_order', 'analyze_credit', 'release_order']);

  const isFinalCreditMission = Boolean(
    target.requiresVkm1Release ||
    target.action === 'CREDIT_RELEASE' ||
    scenario.validationRules?.actionType === 'CREDIT_RELEASE'
  );
  assert.equal(isFinalCreditMission, true, 'A liberação VKM1 não deveria encerrar esta missão.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), true, 'A liberação VKM1 deveria concluir todos os objetivos da missão de crédito.');
  assert.equal(
    scenarioEngine.completeActiveScenarioIfReady('Liberação de Crédito VKM1', `Ordem ${order.docNumber} liberada no auditador`),
    true,
    'A conclusão do fluxo de crédito deveria homologar a missão.'
  );
}

function assertScenarioFeedback(scenario, result, stage, fields = ['mentorSpeech', 'whatHappened', 'why', 'businessImpact']) {
  if (!scenario.completionFeedback) return;
  for (const field of fields) {
    assert.ok(result[field], `${scenario.code}: ${stage} não retornou ${field}.`);
    assert.equal(result[field], scenario.completionFeedback[field], `${scenario.code}: ${stage} divergiu de completionFeedback.${field}.`);
  }
}

function auditScenario(scenario) {
  const target = scenario.targetCriteria || {};
  scenarioEngine.startScenario(scenario.id);
  let completed = false;

  if (scenario.objectives.some(objective => ['check_customer', 'check_customer_xd03', 'investigate_credit'].includes(objective.id))) {
    const customerId = target.customerId || scenario.initialDocuments?.[0]?.customerId;
    if (customerId) scenarioEngine.validateCustomerAnalysis(customerId);
  }

  if (scenario.objectives.some(objective => ['analyze_po', 'process_demand'].includes(objective.id))) {
    scenarioEngine.validatePurchaseOrderAnalysis(scenario.purchaseOrderDocument?.poNumber || target.customerPoNumber);
  }

  const targetDocNumber = target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber;
  const needsOrderInspection = scenario.objectives.some(objective =>
    ['check_order_va03', 'check_flow_va03', 'analyze_order', 'diagnose_situation', 'verify_document_flow'].includes(objective.id)
  );
  if (target.action !== 'SALES_ORDER_SUBMISSION' && needsOrderInspection && targetDocNumber) {
    const order = findOrCreateOrder(scenario, targetDocNumber);
    const inspection = scenarioEngine.validateSalesOrderInspection(order.docNumber);
    assert.equal(inspection.isValid, true, inspection.mentorSpeech || `${scenario.code}: VA03 rejeitou o documento-alvo.`);
  }

  for (const item of target.items || []) {
    if (scenario.objectives.some(objective => ['check_stock_atp', 'check_stock_mm03', 'check_material', 'investigate_availability'].includes(objective.id))) {
      const analysis = scenarioEngine.validateMaterialAnalysis(item.materialId);
      assert.equal(analysis.isValid, true, analysis.mentorSpeech || `${scenario.code}: MM03 rejeitou o material esperado.`);
    }
  }

  if (scenario.objectives.some(objective => objective.id === 'simulate_pricing')) {
    const hasMissingPrice = (target.items || []).some(item => {
      const unitPrice = db.getPricingRecord(item.materialId, target.salesOrg || '1000', target.distChannel || '10')?.amount
        ?? db.getMaterial(item.materialId)?.basePrice ?? 0;
      return !(Number(unitPrice) > 0);
    });
    assert.equal(hasMissingPrice, false, `${scenario.code}: a simulação de preço encontrou material sem PR00.`);
    scenarioEngine.completeObjective('simulate_pricing');
  }

  const atpTarget = (target.items || []).find(item => item.requestedQuantity !== undefined && item.atpFeedback);
  if (atpTarget && scenario.objectives.some(objective => objective.id === 'check_atp_error')) {
    const attempted = createOrderData(scenario);
    attempted.items = attempted.items.map(item => item.materialId === atpTarget.materialId
      ? { ...item, quantity: atpTarget.requestedQuantity }
      : item);
    const rejected = scenarioEngine.validateSalesOrderSubmission(attempted);
    assert.equal(rejected.isValid, false, `${scenario.code}: a quantidade acima do ATP deveria ser rejeitada.`);
    assert.equal(scenarioEngine.getActiveScenario().objectives.find(objective => objective.id === 'check_atp_error')?.done, true,
      `${scenario.code}: a tentativa acima do ATP não registrou o diagnóstico.`);
  }

  if (target.targetMaterialId && target.targetAmount !== undefined) {
    if (scenario.objectives.some(objective => objective.id === 'check_pricing_error')) {
      const missingPriceAttempt = scenarioEngine.validateSalesOrderSubmission(createOrderData(scenario));
      assert.equal(missingPriceAttempt.isValid, false, `${scenario.code}: a ordem sem condição de preço deveria ser rejeitada.`);
      assert.equal(scenarioEngine.getActiveScenario().objectives.find(objective => objective.id === 'check_pricing_error')?.done, true,
        `${scenario.code}: a falta de preço não foi identificada como objetivo.`);
    }
    if (scenario.objectives.some(objective => objective.id === 'create_pricing_record')) {
      db.addOrUpdatePricingRecord({
        materialId: target.targetMaterialId,
        salesOrg: target.salesOrg || '1000',
        distChannel: target.distChannel || '10',
        conditionCode: target.conditionCode || 'PR00',
        amount: target.targetAmount,
        validTo: '31.12.2028'
      });
      scenarioEngine.completeObjective('create_pricing_record');
    }
  }

  if (target.action !== 'CREDIT_RELEASE' && targetDocNumber && scenario.objectives.some(objective =>
    ['release_credit_order', 'release_order'].includes(objective.id)
  )) {
    const order = db.getSalesOrder(targetDocNumber);
    assert.ok(order, `${scenario.code}: a ordem para liberação de crédito não existe.`);
    assert.equal(db.releaseCreditOrder(order.docNumber, 'Parecer de crédito simulado pelo auditador.'), true,
      `${scenario.code}: a ordem não pôde ser liberada na VKM1.`);
    scenarioEngine.completeObjectives([
      'access_vkm1', 'release_with_notes', 'release_credit_order', 'analyze_credit', 'release_order'
    ]);
  }

  switch (target.action) {
    case 'SALES_ORDER_SUBMISSION': {
      const orderData = createOrderData(scenario);
      assert.ok(orderData.netValue > 0, `${scenario.code}: VA01 não pode gravar ordem com valor líquido zero.`);
      const validation = scenarioEngine.validateSalesOrderSubmission(orderData);
      assert.equal(validation.isValid, true, validation.mentorSpeech || 'VA01 rejeitou os dados corretos.');
      if (validation.completed) assertScenarioFeedback(scenario, validation, 'VA01');
      const order = db.createSalesOrder(orderData);
      assert.ok(order.docNumber, 'VA01 não gerou número de ordem.');
      completed = trainee.isScenarioCompleted(scenario.id);
      if (scenario.objectives.some(objective => ['verify_created_order', 'verify_order'].includes(objective.id))) {
        assert.equal(completed, false, `${scenario.code}: a VA01 concluiu a missão antes da inspeção exigida na VA03.`);
        const inspection = scenarioEngine.validateSalesOrderInspection(order.docNumber);
        assert.equal(inspection.isValid, true, inspection.mentorSpeech || 'VA03 rejeitou a ordem correta.');
        completed = trainee.isScenarioCompleted(scenario.id);
        if (inspection.completed) assertScenarioFeedback(scenario, { mentorSpeech: inspection.mentorSpeech }, 'VA03', ['mentorSpeech']);
      }
      break;
    }

    case 'CREDIT_RELEASE': {
      let order;
      if (scenario.objectives?.some(objective => objective.id === 'create_blocked_order')) {
        const orderData = createOrderData(scenario);
        const validation = scenarioEngine.validateSalesOrderSubmission(orderData);
        assert.equal(validation.isValid, true, validation.mentorSpeech || 'VA01 rejeitou os dados corretos.');
        assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'VA01 concluiu a missão antes da liberação VKM1.');
        order = db.createSalesOrder(orderData);
        assert.equal(order.overallStatus, 'CREDIT_BLOCKED', 'A ordem de crédito deveria ficar bloqueada.');
        scenarioEngine.completeObjective('create_blocked_order');
      } else {
        order = findOrCreateOrder(scenario, target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber);
      }
      assert.equal(order.customerId, target.customerId, 'A ordem-alvo tem cliente diferente do solicitado.');
      finishCreditMission(scenario, order);
      completed = trainee.isScenarioCompleted(scenario.id);
      break;
    }

    case 'SALES_ORDER_MODIFICATION': {
      const docNumber = target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber;
      const existing = db.getSalesOrder(docNumber);
      assert.ok(existing, `VA02 não encontrou a ordem ${docNumber}.`);
      const updated = structuredClone(existing);
      if (target.paymentTerms) updated.paymentTerms = target.paymentTerms;
      if (target.incoterms) updated.incoterms = target.incoterms;
      for (const item of target.items || []) {
        let line = updated.items.find(candidate => candidate.materialId === item.materialId);
        if (!line) {
          line = { materialId: item.materialId, quantity: item.quantity, manualDiscountPercent: 0 };
          updated.items.push(line);
        }
        if (item.quantity !== undefined) line.quantity = item.quantity;
        if (item.discountPercent !== undefined) line.manualDiscountPercent = item.discountPercent;
      }
      updated.netValue = updated.items.reduce((sum, item) => {
        const unitPrice = db.getPricingRecord(item.materialId, target.salesOrg || updated.salesOrg || '1000', target.distChannel || updated.distChannel || '10')?.amount
          ?? db.getMaterial(item.materialId)?.basePrice ?? 0;
        return sum + unitPrice * Number(item.quantity || 0) * (1 - Number(item.manualDiscountPercent || 0) / 100);
      }, 0);
      updated.taxValue = updated.netValue * 0.2725;
      updated.totalValue = updated.netValue + updated.taxValue;
      const validation = scenarioEngine.validateSalesOrderModification(docNumber, updated);
      assert.equal(validation.isValid, true, validation.mentorSpeech || 'VA02 rejeitou as alterações corretas.');
      if (validation.completed) assertScenarioFeedback(scenario, validation, 'VA02');
      assert.ok(db.updateSalesOrder(docNumber, updated), 'VA02 não persistiu a alteração.');
      completed = trainee.isScenarioCompleted(scenario.id);
      break;
    }

    case 'CREATE_DELIVERY': {
      const order = getOpenOrder(scenario, target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber);
      const result = db.createDelivery({ salesOrderNumber: order.docNumber, shippingPoint: target.shippingPoint || '1000' });
      assert.equal(result.success, true, result.error || 'VL01N não criou remessa.');
      const validation = scenarioEngine.validateDeliveryCreation(target.shippingPoint || '1000', order.docNumber, result.delivery);
      assert.equal(validation.isValid, true, validation.mentorSpeech || 'VL01N rejeitou a remessa correta.');
      if (validation.completed) assertScenarioFeedback(scenario, validation, 'VL01N');
      completed = trainee.isScenarioCompleted(scenario.id);
      break;
    }

    case 'POST_GOODS_ISSUE': {
      const order = getOpenOrder(scenario, target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber);
      const delivery = getDelivery(scenario, order.docNumber);
      const deliveryValidation = scenarioEngine.validateDeliveryCreation(
        scenario.targetCriteria?.shippingPoint || '1000', order.docNumber, delivery
      );
      assert.equal(deliveryValidation.isValid, true, deliveryValidation.mentorSpeech || 'VL01N rejeitou a remessa correta.');
      const posted = postGoodsIssue(delivery);
      const validation = scenarioEngine.validatePostGoodsIssue(delivery.deliveryNumber, posted);
      assert.equal(validation.isValid, true, validation.mentorSpeech || 'VL02N rejeitou o PGI correto.');
      if (validation.completed) assertScenarioFeedback(scenario, validation, 'VL02N');
      completed = trainee.isScenarioCompleted(scenario.id);
      break;
    }

    case 'CREATE_INVOICE': {
      const order = getOpenOrder(scenario, target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber);
      if (scenario.objectives.some(objective => ['check_order_va03', 'check_flow_va03'].includes(objective.id))) {
        const inspection = scenarioEngine.validateSalesOrderInspection(order.docNumber);
        assert.equal(inspection.isValid, true, inspection.mentorSpeech || 'VA03 rejeitou a análise correta.');
      }
      const delivery = postGoodsIssue(getDelivery(scenario, order.docNumber));
      const pgiValidation = scenarioEngine.validatePostGoodsIssue(delivery.deliveryNumber, delivery);
      assert.equal(pgiValidation.isValid, true, pgiValidation.mentorSpeech || 'VL02N rejeitou o PGI correto.');
      const billingType = target.billingType || 'F2';
      const result = db.createInvoice({ deliveryNumber: delivery.deliveryNumber, salesOrderNumber: order.docNumber, billingType });
      assert.equal(result.success, true, result.error || 'VF01 não criou fatura.');
      const validation = scenarioEngine.validateInvoiceCreation(billingType, delivery.deliveryNumber, result.invoice);
      assert.equal(validation.isValid, true, validation.mentorSpeech || 'VF01 rejeitou a fatura correta.');
      if (!scenario.objectives.some(objective => objective.id === 'verify_invoice')) {
        assertScenarioFeedback(scenario, validation, 'VF01');
      }
      completed = trainee.isScenarioCompleted(scenario.id);
      if (scenario.objectives.some(objective => objective.id === 'verify_invoice')) {
        assert.equal(completed, false, 'A missão foi concluída antes da inspeção explícita na VF03.');
        const inspection = scenarioEngine.validateInvoiceVerification(result.invoice.invoiceNumber);
        assert.equal(inspection.isValid, true, inspection.mentorSpeech || 'VF03 rejeitou a inspeção correta.');
        if (inspection.completed) assertScenarioFeedback(scenario, inspection, 'VF03', ['mentorSpeech']);
        completed = trainee.isScenarioCompleted(scenario.id);
      }
      break;
    }

    case 'FULL_O2C': {
      const order = getOpenOrder(scenario, target.targetDocNumber || scenario.initialDocuments?.[0]?.docNumber);
      if (scenario.objectives.some(objective => ['check_order_va03', 'check_flow_va03'].includes(objective.id))) {
        const inspection = scenarioEngine.validateSalesOrderInspection(order.docNumber);
        assert.equal(inspection.isValid, true, inspection.mentorSpeech || 'VA03 rejeitou a análise correta no O2C.');
      }
      if (scenario.objectives.some(objective => objective.id === 'release_credit_order')) {
        assert.equal(db.releaseCreditOrder(order.docNumber, 'Liberação de crédito simulada pelo auditador.'), true, 'VKM1 não liberou a ordem alvo.');
        scenarioEngine.completeObjective('release_credit_order');
      }
      const deliveryResult = db.createDelivery({ salesOrderNumber: order.docNumber, shippingPoint: target.shippingPoint || '1000' });
      assert.equal(deliveryResult.success, true, deliveryResult.error || 'VL01N não criou remessa no O2C.');
      const deliveryValidation = scenarioEngine.validateDeliveryCreation(target.shippingPoint || '1000', order.docNumber, deliveryResult.delivery);
      assert.equal(deliveryValidation.isValid, true, deliveryValidation.mentorSpeech || 'Validação VL01N falhou no O2C.');
      const delivery = postGoodsIssue(deliveryResult.delivery);
      const pgiValidation = scenarioEngine.validatePostGoodsIssue(delivery.deliveryNumber, delivery);
      assert.equal(pgiValidation.isValid, true, pgiValidation.mentorSpeech || 'Validação VL02N falhou no O2C.');
      const billingType = target.billingType || 'F2';
      const invoiceResult = db.createInvoice({ deliveryNumber: delivery.deliveryNumber, salesOrderNumber: order.docNumber, billingType });
      assert.equal(invoiceResult.success, true, invoiceResult.error || 'VF01 não criou fatura no O2C.');
      const invoiceValidation = scenarioEngine.validateInvoiceCreation(billingType, delivery.deliveryNumber, invoiceResult.invoice);
      assert.equal(invoiceValidation.isValid, true, invoiceValidation.mentorSpeech || 'Validação VF01 falhou no O2C.');
      const requiresInvoiceInspection = scenario.objectives.some(objective => objective.id === 'verify_invoice');
      if (!requiresInvoiceInspection) assertScenarioFeedback(scenario, invoiceValidation, 'VF01 O2C');
      completed = trainee.isScenarioCompleted(scenario.id);
      if (requiresInvoiceInspection) {
        assert.equal(completed, false, 'A missão O2C foi concluída antes da inspeção explícita na VF03.');
        const inspection = scenarioEngine.validateInvoiceVerification(invoiceResult.invoice.invoiceNumber);
        assert.equal(inspection.isValid, true, inspection.mentorSpeech || 'VF03 rejeitou a inspeção correta do O2C.');
        if (inspection.completed) assertScenarioFeedback(scenario, inspection, 'VF03 O2C', ['mentorSpeech']);
        completed = trainee.isScenarioCompleted(scenario.id);
      }
      break;
    }

    default:
      throw new Error(`Ação não coberta: ${target.action}`);
  }

  assert.equal(completed, true, 'O fluxo correto não concluiu a missão.');
  const pendingObjectives = scenarioEngine.getActiveScenario().objectives.filter(objective => !objective.done);
  assert.equal(pendingObjectives.length, 0,
    `A missão foi concluída com objetivos pendentes: ${pendingObjectives.map(objective => objective.id).join(', ')}.`);
}

function verifyCustomerAnalysisRewardIsIdempotent() {
  useIsolatedProfile('audit-xd03-idempotency');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-140');
  scenarioEngine.startScenario(scenario.id);
  scenarioEngine.validateCustomerAnalysis(scenario.targetCriteria.customerId);
  assert.equal(trainee.getProfile().xp, 30, 'A primeira consulta deveria conceder 30 XP.');
  scenarioEngine.validateCustomerAnalysis(scenario.targetCriteria.customerId);
  assert.equal(trainee.getProfile().xp, 30, 'Repetir a consulta duplicou XP.');
  scenarioEngine.startScenario(scenario.id);
  scenarioEngine.validateCustomerAnalysis(scenario.targetCriteria.customerId);
  assert.equal(trainee.getProfile().xp, 30, 'Reabrir a missão duplicou XP.');
}

function verifyCustomerLookupNeverCompletesMissionAlone() {
  useIsolatedProfile('audit-xd03-no-premature-completion');
  const customerObjectiveIds = new Set(['check_customer', 'check_customer_xd03', 'investigate_credit']);

  for (const scenario of ScenarioCatalog) {
    if (!scenario.objectives?.some(objective => customerObjectiveIds.has(objective.id))) continue;

    const customerId = scenario.targetCriteria?.customerId || scenario.initialDocuments?.[0]?.customerId;
    if (!customerId) continue;

    scenarioEngine.startScenario(scenario.id);
    const analysis = scenarioEngine.validateCustomerAnalysis(customerId);
    assert.equal(analysis.isValid, true, `${scenario.code}: XD03 rejeitou o cliente previsto na missão.`);
    assert.equal(trainee.isScenarioCompleted(scenario.id), false, `${scenario.code}: consultar XD03 concluiu a missão prematuramente.`);
    assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, `${scenario.code}: XD03 concluiu todos os objetivos antes da próxima ação.`);
    scenarioEngine.stopSlaTimer();
  }
}

function verifyUnrelatedVa02DoesNotCompleteCreditMission() {
  useIsolatedProfile('audit-cross-transaction-guard');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-140');
  scenarioEngine.startScenario(scenario.id);

  const order = db.getSalesOrder(scenario.targetCriteria.targetDocNumber);
  assert.ok(order, 'A ordem-alvo da TRN-140 precisa estar disponível para a regressão cruzada.');
  const result = scenarioEngine.validateSalesOrderModification(order.docNumber, structuredClone(order));

  assert.equal(result.isValid, true, result.mentorSpeech || 'A transação VA02 deve continuar validando a ordem.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'Uma alteração VA02 concluiu indevidamente a missão TRN-140.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'VA02 marcou os objetivos da missão TRN-140 como concluídos.');
  assert.equal(trainee.getProfile().xp, 0, 'VA02 concedeu XP de missão fora do objetivo ativo.');
  scenarioEngine.stopSlaTimer();
}

function verifyUnrelatedVa01DoesNotCompleteInvoiceMission() {
  useIsolatedProfile('audit-va01-cross-transaction-guard');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-111');
  scenarioEngine.startScenario(scenario.id);

  const result = scenarioEngine.validateSalesOrderSubmission(createOrderData(scenario));
  assert.equal(result.isValid, true, result.mentorSpeech || 'A VA01 independente deve continuar disponível.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'Uma gravação VA01 concluiu indevidamente a missão TRN-111.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'VA01 marcou os objetivos da missão TRN-111 como concluídos.');
  assert.equal(trainee.getProfile().xp, 0, 'VA01 concedeu XP de missão fora do objetivo ativo.');
  scenarioEngine.stopSlaTimer();
}

function verifyMissingAndWrongPricingAreRejected() {
  useIsolatedProfile('audit-pricing-guards');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-103');
  scenarioEngine.startScenario(scenario.id);

  const missingPriceResult = scenarioEngine.validateSalesOrderSubmission(createOrderData(scenario));
  assert.equal(missingPriceResult.isValid, false, 'Uma VA01 sem PR00 não deve permitir uma ordem com valor zero.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'A tentativa sem PR00 não deve homologar a missão.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'A tentativa sem PR00 não deve concluir os objetivos.');
  assert.equal(scenarioEngine.getActiveScenario().objectives.find(objective => objective.id === 'check_pricing_error')?.done, true,
    'A tentativa sem PR00 deveria registrar o diagnóstico da falta de preço.');

  db.addOrUpdatePricingRecord({
    materialId: 'MAT-4099', salesOrg: '1000', distChannel: '10', conditionCode: 'PR00', amount: 64.99, validTo: '31.12.2028'
  });
  const wrongPriceResult = scenarioEngine.validateSalesOrderSubmission(createOrderData(scenario));
  assert.equal(wrongPriceResult.isValid, false, 'A VA01 deve rejeitar preço unitário diferente do autorizado.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'Um preço divergente não deve homologar a missão.');
  scenarioEngine.stopSlaTimer();
}

function verifyMm03CanIdentifyMissingPricing() {
  useIsolatedProfile('audit-mm03-pricing-diagnosis');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-103');
  scenarioEngine.startScenario(scenario.id);
  const result = scenarioEngine.validateMaterialAnalysis('MAT-4099');
  assert.equal(result.isValid, true, 'MM03 deve abrir o material solicitado para inspeção.');
  assert.equal(scenarioEngine.getActiveScenario().objectives.find(objective => objective.id === 'check_pricing_error')?.done, true,
    'A ausência de PR00 consultada na MM03 deveria cumprir o objetivo de diagnóstico.');
  assert.equal(trainee.isScenarioCompleted(scenario.id), false, 'A consulta MM03 não deve concluir a missão sem VK11, VA01 e VA03.');
  scenarioEngine.stopSlaTimer();
}

function verifyRedoUsesCurrentAttemptForCompletionCard() {
  useIsolatedProfile('audit-redo-completion-card');
  const scenario = ScenarioCatalog.find(item => item.code === 'TRN-140');
  trainee.profile.completedScenarios = [scenario.id];
  trainee.saveProfile();
  scenarioEngine.startScenario(scenario.id);

  assert.equal(trainee.isScenarioCompleted(scenario.id), true, 'Pré-condição: missão deve constar do histórico.');
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'O replay deve começar com objetivos pendentes.');
  scenarioEngine.validateCustomerAnalysis(scenario.targetCriteria.customerId);
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), false, 'A consulta XD03 não deve parecer conclusão durante o replay.');

  for (const objective of scenario.objectives) scenarioEngine.completeObjective(objective.id);
  assert.equal(scenarioEngine.areActiveScenarioObjectivesComplete(), true, 'A tentativa atual só termina quando todos os objetivos forem concluídos.');
  scenarioEngine.stopSlaTimer();
}

verifyCustomerAnalysisRewardIsIdempotent();
verifyCustomerLookupNeverCompletesMissionAlone();
verifyUnrelatedVa02DoesNotCompleteCreditMission();
verifyUnrelatedVa01DoesNotCompleteInvoiceMission();
verifyMissingAndWrongPricingAreRejected();
verifyMm03CanIdentifyMissingPricing();
verifyRedoUsesCurrentAttemptForCompletionCard();
useIsolatedProfile('audit-all-54-missions');
assert.equal(ScenarioCatalog.length, 54, 'O catálogo precisa conter exatamente 54 missões.');
assert.equal(new Set(ScenarioCatalog.map(item => item.id)).size, 54, 'Há IDs de missão duplicados.');
assert.equal(new Set(ScenarioCatalog.map(item => item.code)).size, 54, 'Há códigos de missão duplicados.');
for (const scenario of ScenarioCatalog) {
  try {
    assert.ok(scenario.title?.trim() && scenario.briefing?.trim() && scenario.mentorInitialTip?.trim(), 'Título, briefing ou dica inicial ausente.');
    assert.ok(supportedTcodes.has(scenario.initialTcode), `Transação inicial inválida: ${scenario.initialTcode}.`);
    assert.ok(Array.isArray(scenario.objectives) && scenario.objectives.length > 0, 'Missão sem objetivos.');
    assert.equal(new Set(scenario.objectives.map(objective => objective.id)).size, scenario.objectives.length, 'Há objetivos duplicados nesta missão.');
    for (const objective of scenario.objectives) {
      assert.ok(objective.id?.trim() && objective.text?.trim(), 'Objetivo sem ID ou texto.');
    }
    if (scenario.completionFeedback) {
      for (const field of ['mentorSpeech', 'whatHappened', 'why', 'businessImpact']) {
        assert.ok(scenario.completionFeedback[field]?.trim(), `completionFeedback sem ${field}.`);
      }
      for (const match of scenario.completionFeedback.mentorSpeech.matchAll(/\+(\d+)\s*XP/gi)) {
        assert.equal(Number(match[1]), Number(scenario.xpReward || 300), 'XP na mensagem não corresponde à recompensa configurada.');
      }
    }
    const targetDoc = scenario.targetCriteria?.targetDocNumber;
    const seededDocs = (scenario.initialDocuments || []).map(document => document.docNumber || document.salesOrderNumber);
    if (targetDoc && seededDocs.length && scenario.targetCriteria.action !== 'SALES_ORDER_SUBMISSION') {
      assert.ok(seededDocs.includes(targetDoc), `Documento-alvo ${targetDoc} não consta nos documentos iniciais.`);
    }
    assert.ok(expectedActions.has(scenario.targetCriteria?.action), 'Ação sem fluxo de validação.');
    auditScenario(scenario);
  } catch (error) {
    failures.push({ code: scenario.code, message: error.message });
  }
  scenarioEngine.stopSlaTimer();
}

console.log(`Auditoria de missões: ${ScenarioCatalog.length - failures.length}/${ScenarioCatalog.length} aprovadas.`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
