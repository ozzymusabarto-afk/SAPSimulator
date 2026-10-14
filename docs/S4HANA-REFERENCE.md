# Referência de plataforma: S/4HANA como linha principal

## Decisão do produto

O Nexus ERP Lab usará **SAP S/4HANA como referência principal de reciclagem profissional**. A experiência visual seguirá uma direção inspirada em aplicações empresariais modernas e no padrão de trabalho do SAP Fiori: páginas orientadas por tarefa, cards, filtros, listas, status, navegação contextual e foco no próximo passo do processo.

Isso não significa que o Nexus ERP Lab reproduza o SAP Fiori, o SAP S/4HANA ou qualquer tela oficial da SAP. O produto continua sendo um simulador independente, com interface e dados próprios.

## Regra de precisão

Cada missão deverá declarar qual destes níveis está usando:

1. **Prática S/4HANA:** fluxo e conceitos alinhados ao modelo moderno, como Business Partner, crédito FSCM/Documented Credit Decision, availability check com data/planta/linhas de programação e apps orientados por tarefa.
2. **Customizing da NexusTech:** códigos, organizações, condições, políticas, papéis e nomes inventados para a empresa fictícia.
3. **Simplificação do simulador:** comportamento reduzido para permitir prática no navegador sem um backend SAP real.

Nenhuma dessas três categorias deve ser apresentada como regra universal de toda instalação SAP.

## Comparação resumida

| Tema | Referência principal do Nexus | Nota comparativa ECC/ERP clássico |
|---|---|---|
| Cliente | Business Partner e papéis de parceiro | XD01/XD02/XD03 e mestre clássico de cliente aparecem como legado/variante |
| Crédito | FSCM Credit Management e decisão documentada, conforme cenário | VKM1/VKM3/FD32 podem existir em ambientes clássicos, dependendo do customizing |
| Disponibilidade | ATP por planta, data, escopo e linhas de programação | A lógica também existe no ECC, mas telas, apps e integrações podem variar |
| Pricing | Condition technique, procedure, condition records e validade | PR00/RB00 continuam sendo exemplos de configuração, não códigos universais |
| Execução | Apps e páginas orientadas a tarefa com aparência Fiori-like | Transações GUI clássicas podem ser usadas como comparação histórica |
| O2C | Ordem, confirmação, entrega, picking, PGI e billing conforme configuração | A sequência é semelhante, mas não idêntica em toda instalação |

## Como isso afeta a primeira revisão

O primeiro lote será corrigido sem fingir que XD03/VKM1 são o padrão atual universal. Quando uma missão precisar manter esses códigos por familiaridade com a academia de 2013, eles serão apresentados como **comparação ECC/ERP clássica**, enquanto a solução principal será descrita em termos S/4HANA.

Para crédito, um trainee não liberará uma exposição arriscada só porque o chamado está urgente. A prática padrão será analisar a decisão, registrar a recomendação e escalar quando não houver alçada ou aprovação documentada.

Para disponibilidade, a missão não reduzirá automaticamente a quantidade da PO. O usuário deverá interpretar quantidade confirmada, data, planta e saldo pendente; o resultado poderá ser confirmação parcial, data futura, negociação ou escalada, conforme o caso.

Para pricing, o usuário deverá identificar a condição, chave, validade, moeda, unidade e autorização. A ausência de preço não será mascarada por um preço-base genérico.

## Limites

O Nexus não possui um sistema S/4HANA real conectado. Portanto, a simulação não deve alegar que reproduz tabelas, status, autorização, impostos ou apps de uma instalação SAP específica. O objetivo é praticar raciocínio operacional e vocabulário moderno com dados fictícios, deixando visível o que é conceito S/4HANA, o que é decisão da NexusTech e o que é simplificação do laboratório.
