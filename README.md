# Nexus ERP Lab • Laboratório de Prática Profissional SAP SD

O Nexus ERP Lab é um **simulador independente de rotina profissional** para quem já fez academia, treinamento ou teve contato inicial com SAP SD e precisa colocar o conhecimento em prática. A pessoa entra como trainee em uma empresa fictícia, recebe solicitações comerciais, consulta dados, toma decisões, lida com exceções e observa o impacto operacional das suas ações.

**Referência de reciclagem:** o laboratório adota **SAP S/4HANA como linha principal**, com uma experiência inspirada em aplicações empresariais modernas e no padrão de trabalho do Fiori. ECC/ERP clássico aparece como comparação histórica, não como referência principal. Consulte [docs/S4HANA-REFERENCE.md](docs/S4HANA-REFERENCE.md).

> **Não é uma academia nem um curso de SAP.** É um ambiente de prática para construir repertório e confiança antes da primeira oportunidade — sem prometer experiência profissional real, certificação ou aprovação em processo seletivo.

> **Aviso importante:** o Nexus ERP Lab não é produzido, patrocinado, administrado, afiliado ou endossado pela SAP SE ou pelo grupo SAP. SAP, SAP S/4HANA, SAP SD, nomes de transações e terminologia relacionada são referências nominativas de contexto. Leia [LEGAL-NOTICE.md](LEGAL-NOTICE.md).

## A experiência simulada

O usuário começa no primeiro expediente como **Trainee de Operações SD**. O Chefe Wilson apresenta a empresa, entrega chamados e acompanha a evolução. Depois da avaliação de prontidão, pode ocorrer uma promoção narrativa para **Analista SAP SD Júnior**; mais adiante, a jornada pode evoluir para **Analista SAP SD Pleno**.

Aqui usamos “analista” para representar a rotina interna de operação, suporte e melhoria contínua da empresa fictícia. “Consultor” não é tratado como sinônimo: uma futura trilha de consultoria envolveria implantação, levantamento com cliente, configuração e projetos.

## Ciclo Trainee

O primeiro ciclo tem **54 missões oficiais**. Esse número é adequado como ciclo de entrada porque cobre o fluxo Order-to-Cash sem obrigar o usuário a repetir uma sequência fixa. As missões são selecionadas por um motor pseudoaleatório determinístico, que evita repetir a mesma ação ou dificuldade em sequência e permite retomar o expediente após recarregar a página.

As 54 missões atuais são a base homologada do Trainee. O catálogo já possui metadados de estágio, dificuldade, grupo de processo e trilha de carreira para receber novos blocos sem reescrever o motor. A expansão deve acontecer por qualidade e variedade, não por cópias superficiais:

| Fase | Foco | Estado |
|---|---|---|
| Trainee | Rotina assistida, consultas, pedidos, preço, ATP, crédito, remessa e faturamento | 54 missões oficiais |
| Analista Júnior | Autonomia parcial, priorização, exceções e comunicação operacional | Motor preparado; conteúdo em expansão |
| Analista Pleno | Causa-raiz, governança, alçada, incidentes O2C e apoio ao time | Motor preparado; conteúdo futuro |

## O que o simulador pratica

- Receber e interpretar uma solicitação comercial.
- Consultar dados de cliente, material, preço, disponibilidade e crédito.
- Executar decisões nos fluxos simulados S/4HANA de parceiro, ordem, preço, disponibilidade, crédito, entrega e faturamento. Os caminhos ECC clássicos, como `XD03`, `VKM1` e `MM03`, aparecem como comparação quando forem úteis.
- Investigar bloqueios e exceções.
- Trabalhar com prioridade e SLA em desafios.
- Registrar o impacto de uma decisão no atendimento, estoque, expedição, margem ou faturamento.
- Refazer uma atividade em ambiente seguro, sem alterar uma empresa real.

## Como executar

Requer Node.js 20 ou superior.

```bash
npm ci
npm run dev
```

Para validar a build e o catálogo:

```bash
npm run build
npm run audit:missions
```

O resultado esperado do catálogo atual é `54/54 aprovadas`. O acesso rápido de desenvolvimento só aparece durante `npm run dev` e nunca deve ser usado como autenticação de produção.

## Escopo e segurança

A autenticação atual é um **mock local** baseado em armazenamento do navegador. Isso é suficiente para protótipo e prática individual, mas não é segurança de produção. Não use dados reais de clientes, contratos, preços, documentos fiscais, credenciais corporativas ou informações pessoais.

Antes de vender ou abrir para múltiplos usuários, será necessário implementar autenticação real, banco isolado por usuário/tenant, autorização server-side, progresso sincronizado, recuperação de senha, rate limiting, logs, backups, LGPD e cobrança segura. Consulte [SECURITY.md](SECURITY.md) e [docs/SAAS-ROADMAP.md](docs/SAAS-ROADMAP.md).

## Empresa fictícia

A NexusTech Distribuidora S/A, seus clientes, documentos, valores, pessoas, endereços e ambientes são fictícios. O simulador não representa um sistema SAP produtivo e não substitui treinamento oficial, certificação, experiência real ou homologação profissional.
