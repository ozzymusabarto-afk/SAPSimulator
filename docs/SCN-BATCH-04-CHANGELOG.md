# Changelog — lote SCN-31 a SCN-40

## Escopo auditado

O catálogo atual contém apenas seis missões neste intervalo: **SCN-31, SCN-32, SCN-33, SCN-34, SCN-35 e SCN-38**. Os IDs **SCN-36, SCN-37, SCN-39 e SCN-40 não existem** nesta versão e não foram inventados durante a correção. Eles devem ser criados como missões novas, com desenho e fixtures próprios.

## Correções realizadas

- **SCN-31:** delimitado o cenário para alteração comercial em S/4HANA on-premise/private ou app equivalente; substituição de FOB inadequado para retirada rodoviária em Campinas por FCA; inclusão de local e versão de Incoterms; remoção de promessas de transporte, billing e efeito jurídico; identificação explícita de CNPJ sintético.
- **SCN-32:** separação entre planta e shipping point; inclusão de planta, material e quantidade esperados nos critérios; troca de CIF rodoviário por DAP no cenário fictício; distinção entre GUI/private e Public Edition/Fiori; feedback limitado à criação da outbound delivery.
- **SCN-33:** remoção de promessas não modeladas de pesagem/romaneio; explicação mais correta do PGI/601; exigência de delivery, item e quantidade corretos; feedback limitado ao estado do laboratório, sem afirmar transporte ou recebimento.
- **SCN-34:** correção da referência de billing para a remessa 80000065; exigência de PGI e delivery reference; retirada de afirmações de NF-e, SEFAZ, FI-AR e cobrança real; explicitação do escopo de F2 simulado.
- **SCN-35:** troca de XD03 como referência primária por BP/ship-to, mantendo XD03 apenas como comparação de compatibilidade; critérios de material, quantidade, planta e shipping point; feedback sem alegar recebimento no datacenter.
- **SCN-38:** separação entre condição de pagamento e pricing; remoção da promessa de simular preços sem critério; troca de CIF por DAP; explicitação de que a alçada é uma evidência da fixture e não uma aprovação automática de crédito; feedback limitado à criação da ordem.

## Endurecimento do motor

- VA02 agora pode validar local nomeado e versão de Incoterms quando a interface os envia.
- Criação de delivery valida item e quantidade-alvo quando declarados pela missão.
- PGI valida número da delivery, item e quantidade-alvo.
- Billing valida a referência exata da delivery quando a missão exige isso.
- A interface VA02 envia a versão de Incoterms 2020.

## Validação executada

- `npm run audit:missions`: **50/50 aprovadas**.
- `npm ci`: **0 vulnerabilidades reportadas**.
- `npm run build`: **passou**.
- `git diff --check`: **passou**.

## Limites conhecidos

O lote ainda usa dados sintéticos e não representa SAP real conectado, NF-e, SEFAZ, FI-AR, transporte, recebimento, BP externo ou Public Edition completo. A experiência deve ser apresentada como laboratório independente de prática SD, não como certificação ou sistema SAP oficial.
