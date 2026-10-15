# Changelog — SCN-21 a SCN-30

## Resultado

O lote foi revisado com referência principal em S/4HANA e comparação explícita com GUI/ECC quando a missão ainda usa VA03, VA02, VF01, VF03, VL01N, VL02N, XD03 ou VK11 como interface didática.

A auditoria do catálogo terminou com **50/50 missões aprovadas** e o build de produção passou.

## Correções principais

### SCN-21 — crédito

A missão deixou de ensinar liberação automática de uma grande conta hospitalar. Agora ela exige reconciliação de BP, limite, exposição e pendências, com decisão `ESCALATE` e próxima alçada. A urgência hospitalar não substitui autorização de crédito.

XD03, VKM1, KNKK e VBUK foram tratados como referências legadas ou simplificações. A referência principal passou a ser Business Partner e Documented Credit Decisions em S/4HANA.

### SCN-22 — logística

FOB foi substituído por FCA no CD fictício, pois o caso representa retirada no estabelecimento da NexusTech. Foram adicionados centro, depósito, material, quantidade e localização do Incoterm ao contrato da missão.

O texto deixou de prometer transferência de custódia, carregamento do caminhão ou chegada a Rondonópolis. O PGI simulado representa apenas baixa de estoque e atualização de fluxo em memória.

### SCN-23 — billing

A missão agora trata F2 como documento de faturamento simulado relacionado à entrega. Foram removidas as alegações de NF-e, SEFAZ, FI-AR, duplicata e cobrança bancária reais.

A condição `requiresDeliveryReference` foi adicionada. A VF01 não permite faturamento nesses cenários sem uma remessa selecionada.

### SCN-24 — alteração de pedido

A missão foi reposicionada como alteração formal de um pedido OR, e não como alteração de contrato. O valor líquido esperado após passar para 5 unidades foi explicitado como R$ 4.450,00 antes de impostos e frete.

O feedback agora informa que delivery, PGI, billing, ATP e recheck de crédito ficam para etapas posteriores.

### SCN-25 — desafio O2C

O desafio agora se limita ao O2C que o laboratório realmente simula: pedido, entrega, picking, PGI e F2. Foram removidas promessas de voo, NF-e, chegada hospitalar e impacto clínico.

### SCN-26 — Business Partner e ship-to

A missão foi reposicionada para validar BP/ship-to e criar a ordem. XD03 ficou como comparação GUI/ECC, enquanto BP é a referência principal S/4HANA.

CIF foi substituído por DAP no endereço fictício do hospital.

### SCN-27 — canal indireto

A missão mantém o canal 20, mas não promete mais a criação automática de remessa. CIF foi substituído por DAP com localização nomeada para o centro de distribuição fictício.

### SCN-28 — pricing

A missão agora distingue condição mestre de preço e resultado de pricing do documento. Foram adicionados BRL, unidade de preço e valor líquido esperado de R$ 1.300,00.

O texto não afirma mais que toda ausência de PR00 impede universalmente a gravação, pois o comportamento depende do customizing de incompletion e pricing.

### SCN-30 — desconto

RB00 passou a ser tratada como condição comercial que exige aplicação correta e autorização. O valor líquido esperado após 8% de desconto foi definido como R$ 17.250,00 antes de impostos e frete.

O feedback não promete impostos recalculados nem fatura futura automática.

## Guardrails do motor

- A VF01 bloqueia cenários marcados com `requiresDeliveryReference` quando nenhuma remessa está selecionada.
- O ScenarioEngine rejeita billing sem referência à outbound delivery quando essa regra está ativa.
- O PGI não completa mais picking automaticamente; todas as posições precisam estar separadas.
- Os dados hospitalares do cliente 100150 foram uniformizados para o mesmo identificador fictício em catálogo e cadastro.

## Limites preservados

O simulador continua sendo independente, com dados fictícios e execução em memória. Ele não é SAP, não é endossado pela SAP e não substitui um ambiente S/4HANA real. NF-e, SEFAZ, FI-AR, transporte físico, voo e recebimento continuam fora do escopo quando não há capability específica implementada.
