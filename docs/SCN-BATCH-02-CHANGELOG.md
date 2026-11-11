# Changelog — SCN-11 a SCN-20

## Referência

- Linha principal: **S/4HANA**, com comparação explícita a ECC/GUI quando útil.
- Todos os dados de clientes, materiais, documentos e valores são fictícios.
- O simulador é independente e não é produto, treinamento oficial, suporte ou sistema SAP.

## Correções aplicadas

### SCN-11 — decisão de crédito sob SLA

- Substituída a liberação automática por decisão `ESCALATE` documentada.
- Mantidos limite, utilização e valor do pedido como evidências a reconciliar.
- Removida a promessa de expedição imediata após a decisão.

### SCN-12 — outbound delivery

- Corrigido o CNPJ para o parceiro mestre do pedido 10000007.
- Separadas criação de remessa, picking, PGI e billing.
- Adicionados ponto de expedição e reconciliação da ordem como critérios explícitos.

### SCN-13 — picking e PGI

- Corrigida a identidade fictícia do cliente e os dados descritivos do MAT-3020.
- Removidas promessas de documento MM produtivo, transportadora liberada e faturamento automático.
- Incluídos centro, depósito, material e quantidade no contrato da missão.

### SCN-14 — crédito de cliente grande

- Reescrita a missão que ainda executava expedição/PGI como um desafio de decisão documentada de crédito para a UltraLink (Ordem 10000006).
- Corrigidos cliente, contrato CIF, limite, utilizado e valor líquido do documento mestre.
- O caso exige `ESCALATE` com parecer e mantém a ordem bloqueada quando a alçada não estiver comprovada.

### SCN-15 — billing

- Corrigido o CNPJ para o cadastro do cliente 100150.
- Billing agora é descrito como documento F2 simulado.
- Removidas alegações de NF-e, SEFAZ, FI-AR, título bancário e liquidação.

### SCN-16 — operação multi-item

- Alinhados parceiro, PO, localidade e material ao pedido mestre 10000009.
- Esclarecido que NF-e e integração contábil estão fora do escopo do laboratório.

### SCN-17 — desafio máximo

- Reduzido de O2C ponta a ponta para decisão de crédito sob SLA.
- Removidas etapas de entrega, PGI e faturamento dos objetivos da missão.
- Mantido `ESCALATE` para impedir bypass de alçada por urgência executiva.

### SCN-18 — venda corporativa

- Adicionadas exigências de análise de BP, PO e material antes da gravação.
- Removidas promessas de alocação e entrega imediata.

### SCN-19 — pricing e desconto

- RB00 passou a ser tratada como condição fictícia que precisa de autorização, vigência e evidência.
- Adicionada PR00 do MAT-2020 para a área 1000/20 e valor esperado de R$ 8.188,00.

### SCN-20 — ATP regional

- Adicionado contrato ATP explícito para 20 unidades: solicitada, confirmada, saldo zero, data, centro 2000, DEP1 e ponto de expedição 2000.
- Adicionadas análises obrigatórias de BP, PO, material e pricing antes da gravação.
- O ATP é explicitamente simplificado e não representa aATP produtivo.

## Endurecimento do motor

- PGI não completa mais picking silenciosamente.
- Todas as posições precisam estar separadas antes da baixa física.
- A evidência ATP valida, quando declarados, centro, depósito e ponto de expedição; a interface também suporta confirmação integral (`FULL`).
- A auditoria executa `applyCreditDecision` e verifica que `HOLD`/`ESCALATE` preservam o bloqueio.
- A checagem automatizada continua cobrindo o catálogo inteiro.

## Validação

- `npm run audit:missions` — **54/54 aprovadas**
- `npm run build` — **aprovado**
- `git diff --check` — **aprovado**
- `npm audit --omit=dev --audit-level=high` — **4 vulnerabilidades high em @grpc/grpc-js via Firebase; correção automática exige downgrade breaking para firebase 9.14.0 e não foi aplicada**
