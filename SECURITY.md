# Segurança e prontidão para produção

## Estado atual

O piloto usa **Firebase Authentication** para cadastro, login, logout, recuperação de senha e alteração de senha. O perfil de progresso é sincronizado no Cloud Firestore por UID, com regras que permitem acesso somente ao documento do usuário autenticado. O arquivo de regras versionado está em `firestore.rules`.

Esta configuração é adequada para um piloto fechado com dados fictícios, mas ainda **não é a arquitetura comercial completa**. O cliente continua executando o motor das missões no navegador; papéis, planos, entitlements e conclusão oficial ainda não devem ser tratados como autoridade comercial.

## Antes de vender

1. Avaliar uma camada de backend para decisões comerciais, sessões administrativas e autoridade de planos; o Firebase Auth permanece aceitável como provedor de identidade.
2. Armazenar senha somente no servidor com Argon2id ou bcrypt configurado corretamente.
3. Implementar MFA opcional/obrigatório para instrutores e administradores.
4. Colocar autorização de plano no backend: Trainee gratuito; Júnior e Pleno somente após validação server-side do entitlement.
5. Nunca confiar em `localStorage`, `role`, `plan` ou `entitlements` enviados pelo navegador.
6. Implementar recuperação de senha com token único, curto, expirável e invalidado após uso.
7. Adicionar rate limiting, proteção contra credential stuffing, CSRF quando aplicável, validação de entrada e logs de auditoria sem dados sensíveis.
8. Isolar dados por tenant/usuário no banco com autorização por linha e testes de acesso cruzado.
9. Separar ambientes dev/staging/produção e manter o acesso rápido de desenvolvimento removido da build pública.
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
