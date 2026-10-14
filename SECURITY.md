# Segurança e prontidão para produção

## Estado atual

O Nexus ERP Lab contém um **Auth Mock de desenvolvimento** baseado em `localStorage`. Ele é útil para prototipação e testes locais, mas **não é autenticação segura para usuários reais, cobrança ou dados comerciais**.

Não publique este modo como SaaS de produção. Qualquer dado no navegador pode ser lido ou alterado pelo usuário; hash local não substitui hashing no servidor; e entitlement salvo no cliente não protege um plano pago.

## Antes de vender

1. Migrar autenticação para um provedor/backend real com sessões seguras, cookies `HttpOnly`, `Secure` e `SameSite` adequado.
2. Armazenar senha somente no servidor com Argon2id ou bcrypt configurado corretamente.
3. Implementar MFA opcional/obrigatório para instrutores e administradores.
4. Colocar autorização de plano no backend: Trainee gratuito; Júnior e Pleno somente após validação server-side do entitlement.
5. Nunca confiar em `localStorage`, `role`, `plan` ou `entitlements` enviados pelo navegador.
6. Implementar recuperação de senha com token único, curto, expirável e invalidado após uso.
7. Adicionar rate limiting, proteção contra credential stuffing, CSRF quando aplicável, validação de entrada e logs de auditoria sem dados sensíveis.
8. Isolar dados por tenant/usuário no banco com autorização por linha e testes de acesso cruzado.
9. Separar ambientes dev/staging/produção e remover o acesso rápido de desenvolvimento da build pública.
10. Criar backup, restauração, retenção, exclusão de conta e fluxo compatível com LGPD.
11. Usar gateway de pagamento/tokenização; o app nunca deve armazenar dados de cartão.
12. Executar SAST, dependency scanning, DAST, testes de autorização e revisão independente antes de vender.

## Modelo de planos proposto

- **Trainee:** acesso gratuito aos fundamentos e a um conjunto definido de missões.
- **Júnior — Pro:** trilhas avançadas, cenários de crédito/logística/faturamento, métricas e certificado.
- **Pleno — Pro:** desafios O2C completos, SLA, casos avançados, competências e relatórios.

O plano deve ser uma decisão do servidor, não do frontend. O frontend somente apresenta o resultado autorizado.

## Reportar vulnerabilidades

Até existir um canal privado oficial, não publique detalhes sensíveis em issues públicas. Ao receber uma denúncia, preservar evidências, reproduzir em ambiente isolado, corrigir, testar e registrar impacto e mitigação.
