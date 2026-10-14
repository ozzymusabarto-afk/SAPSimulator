# Roadmap para o Nexus ERP Lab 11/10

## Visão de produto

O **Trainee** é a porta de entrada gratuita. O produto evolui por competência, não apenas por quantidade de telas:

- Trainee: fundamentos de dados mestres, ordem de venda e primeiro ciclo guiado.
- Júnior Pro: preço, ATP, crédito, remessa, PGI, faturamento e desafios com SLA.
- Pleno Pro: casos O2C completos, exceções, análise de causa-raiz, decisões de alçada, relatórios e trilhas avançadas.

## Arquitetura necessária para venda

### Frontend

- Continuar como camada de apresentação e simulação.
- Não guardar autoridade de plano, papel ou conclusão oficial no navegador.
- Usar feature flags recebidas do servidor.
- Adicionar telemetria de produto anonimizada e consentida.

### Backend

- API versionada para autenticação, perfil, progresso, tentativas, competências e entitlements.
- Banco relacional com isolamento por usuário/tenant.
- Serviço de autenticação e sessão segura.
- Worker para e-mail, recuperação de senha e notificações.
- Gateway de assinatura com webhooks idempotentes.
- Auditoria de eventos e trilha de alterações.

### Billing e planos

- Produto e preço definidos no provedor de pagamento.
- Webhook valida assinatura e atualiza entitlement no backend.
- Cancelamento, período de carência, upgrade, downgrade e reembolso precisam ter estados explícitos.
- O frontend nunca libera Júnior/Pleno por parâmetro local.

## Critérios 11/10

### Produto

- Primeiro acesso compreensível em menos de dois minutos.
- Cada missão tem objetivo, pré-requisito, pista, validação e explicação do impacto.
- Modo prática não contamina a certificação oficial.
- Instrutor consegue acompanhar progresso e pontos de dificuldade.
- Conteúdo revisado por especialista SAP SD.

### Confiabilidade

- Build limpo em CI.
- Testes unitários das engines e regras de negócio.
- Teste de cada missão crítica ponta a ponta.
- Smoke test de todas as transações.
- Testes de regressão visual para desktop e mobile.
- Monitoramento de erros e performance.

### Segurança

- Threat model revisado.
- Autorização server-side e testes de acesso cruzado.
- Sem segredos no frontend.
- Dependências atualizadas e verificadas.
- Rate limiting, MFA para equipe, backups e resposta a incidentes.
- LGPD: consentimento, exportação, correção e exclusão.

### Experiência

- Acessibilidade WCAG 2.2 AA como meta.
- Navegação por teclado, leitor de tela, foco e contraste.
- Layout funcional em 320 px até telas grandes.
- Carregamento inicial enxuto com code splitting.
- Conteúdo e identidade do mentor consistentes.

## Fases

1. **Estabilização:** build, documentação, nomenclatura, testes e acessibilidade básica.
2. **Backend seguro:** auth real, banco, progresso sincronizado e autorização.
3. **Monetização:** billing, webhooks, planos e portal do assinante.
4. **Beta fechado:** 10–30 trainees, métricas, entrevistas e correção de conteúdo.
5. **Lançamento:** observabilidade, suporte, termos, privacidade e processo de incidentes.
