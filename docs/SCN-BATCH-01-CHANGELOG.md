# Lote SCN-01 a SCN-10 — correções S/4HANA

## Resultado

- **50/50 missões aprovadas** no auditor isolado.
- **Build de produção aprovada** com Vite.
- `git diff --check` sem erros.

## Conteúdo corrigido

- SCN-01: reconciliação da PO, Business Partner, ship-to, material, disponibilidade e termo logístico.
- SCN-02: condição PR00 válida para o canal atacadista 1000/20 e desconto de 5% calculado sobre a base correta.
- SCN-03: reescrita como decisão documentada de crédito; trainee não libera exposição de alto risco sem aprovação.
- SCN-04: aditivo identificado como `PO-TL-2026-042-AD01`, com recálculo e validação de disponibilidade.
- SCN-05: ausência de preço tratada como incidente de Pricing; condição não deve ser criada sem autorização.
- SCN-06: ATP deixou de ser uma redução automática da PO; a quantidade confirmada e o saldo pendente são tratados separadamente.
- SCN-07: confirmação parcial passou a preservar a demanda original e registrar saldo pendente.
- SCN-08: a missão autônoma deixou de prometer atendimento integral; exige decisão sobre confirmação parcial e pendência.
- SCN-09: exposição, limite e valores foram reconciliados; o fluxo exige decisão de crédito documentada.
- SCN-10: reescrita para diagnóstico de crédito, corrigindo o total e impedindo liberação sem governança.

## Motor e interface

- A gravação da ordem agora bloqueia quando a missão exige análise prévia de cliente, PO, material, disponibilidade ou pricing.
- Materiais extras que não pertencem à PO ou ao escopo da missão são rejeitados.
- Missões com pricing obrigatório não usam preço-base silencioso quando não existe condição válida.
- A auditoria da VA03 só é concluída depois da inspeção real do documento.
- A análise ATP é registrada após consulta/ação, não apenas porque a ordem foi salva.
- A tela de crédito recebeu seleção explícita de `RELEASE`, `HOLD`, `ESCALATE` ou `REJECT` e campo de parecer.
- Decisões sem RELEASE mantêm a ordem bloqueada e exigem parecer com evidência.
- A fila de crédito valida ordem, cliente e PO antes de aceitar a decisão.

## Limites conhecidos

Este é um simulador independente. Ele usa dados fictícios e representa conceitos S/4HANA, regras da empresa NexusTech e simplificações de navegador. Não é uma conexão com SAP S/4HANA real e não garante que nomes de apps, status, tabelas, autorizações ou regras tributárias sejam idênticos em uma instalação produtiva.

O próximo lote deve revisar a interface e os dados das transações modernas de Business Partner, crédito e ATP, além de cobrir cenários Júnior e Pleno sem copiar a sequência Trainee.
