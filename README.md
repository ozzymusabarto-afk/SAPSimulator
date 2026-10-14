# Nexus ERP Lab • Simulador Educacional SAP SD

O Nexus ERP Lab é um simulador web de treinamento prático em **Vendas e Distribuição (SAP SD)**. Ele usa cenários de negócio, transações, feedback do Chefe Wilson, competências, tentativas e progresso para ensinar o fluxo Order-to-Cash.

> **Estado atual:** protótipo/MVP educacional com autenticação mock local. Não usar para dados reais, cobrança, informações de clientes ou controle de acesso comercial.

## Produto e progressão

O **Trainee** é a experiência gratuita de entrada. A evolução planejada é:

| Nível | Proposta |
|---|---|
| Trainee | Fundamentos, primeiro ciclo guiado e missões introdutórias gratuitas |
| Júnior Pro | Preço, ATP, crédito, remessa, PGI, faturamento e desafios com SLA |
| Pleno Pro | Ciclos O2C completos, exceções, análise de causa-raiz, alçada e relatórios |

A versão atual contém **50 missões** distribuídas em pilares de dados mestres, ordens, preço, ATP, crédito, expedição e faturamento. O catálogo e o script `npm run audit:missions` são a fonte operacional da contagem.

## Diferenciais

- Processo comercial ponta a ponta: `XD03 → VA01 → MM03 → VK11 → VKM1 → VL01N/VL02N → VF01/VF03`.
- Modo treinamento com orientação e Modo Desafio com SLA.
- Diagnóstico estruturado: o que ocorreu, por que ocorreu e qual impacto no negócio.
- Hub de prática para repetir cenários sem conceder XP vitalício novamente.
- Mapa de competências, jornada, ranking, bônus, progresso e histórico.
- Interface corporativa com command bar, stepper, sidebar, PWA e deploy para GitHub Pages.

## Como executar

Requer Node.js 20 ou superior.

```bash
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. Para validar uma build de produção:

```bash
npm run build
npm run preview
```

Para validar a integridade das missões:

```bash
npm run audit:missions
```

O acesso rápido de desenvolvimento existe somente durante `npm run dev`. Em uma build pública, ele não é renderizado.

## Segurança

A autenticação atual é um **mock de desenvolvimento baseado em armazenamento local**. Hash local, role no navegador e entitlement local não constituem segurança. O projeto ainda não está pronto para vender planos ou guardar dados de usuários reais.

Antes de liberar Júnior/Pleno pagos, é obrigatório implementar backend de autenticação, sessão segura, autorização server-side, banco isolado por usuário/tenant, cobrança por webhook idempotente, recuperação de senha real, MFA para equipe, rate limiting, logs, backups e requisitos de LGPD.

Leia [SECURITY.md](SECURITY.md) e [docs/SAAS-ROADMAP.md](docs/SAAS-ROADMAP.md) para o plano detalhado.

## Empresa fictícia

- Empresa contábil: `BR10 - NexusTech Brasil Distribuidora S/A`
- Organização de vendas: `1000 - NexusTech Vendas Nacionais`
- Canais: `10 - Venda Direta / Corporativo` e `20 - Revenda / Atacado`
- Centro principal: `1000 - CD Matriz São Paulo`

## Licença e escopo

Este repositório é uma demonstração educacional. SAP, nomes de transações e tabelas são referências de treinamento; o comportamento do simulador é simplificado e não substitui um sistema SAP real nem uma homologação profissional.
