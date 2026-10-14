# Plano de evolução — Nexus ERP Lab

## Direção do produto

O Nexus ERP Lab não é uma academia, curso ou material oficial SAP. É um **laboratório de prática profissional simulada** para pessoas que já fizeram academia, treinamento ou experiência inicial em SAP SD e precisam exercitar decisões em um ambiente parecido com uma empresa.

A promessa passa a ser: **“Você estudou. Agora pratique como se estivesse no expediente.”** O simulador ajuda a transformar conhecimento teórico em repertório operacional, sem prometer certificação, experiência profissional real ou equivalência a um emprego.

A referência tecnológica principal será **SAP S/4HANA**, com interface inspirada em aplicações Fiori-like e uma nota comparativa para ECC/ERP clássico. Isso atende à necessidade de reciclagem do criador e evita perpetuar uma experiência baseada apenas na academia de 2013. A simulação sempre separará conceito S/4HANA, customizing fictício da NexusTech e simplificação pedagógica. A decisão está detalhada em `docs/S4HANA-REFERENCE.md`.

## Carreira simulada

A jornada é uma experiência narrativa de contratação e evolução:

- **Trainee:** integração, primeiro expediente, rotina assistida, 50 missões de prática e avaliação de prontidão.
- **Analista SAP SD Júnior:** promoção narrativa pelo Chefe Wilson, chamados com autonomia parcial, priorização, exceções e comunicação operacional.
- **Analista SAP SD Pleno:** análise de causa-raiz, governança, decisões de alçada, incidentes O2C e apoio ao time.

“Analista” e “consultor” não serão tratados como sinônimos. O produto usará Analista SAP SD para a rotina interna da empresa fictícia. Consultor será uma possível trilha futura, porque normalmente envolve implantação, configuração, levantamento com cliente e projeto, enquanto analista pode atuar na operação, suporte e melhoria contínua.

## Motor de missões

O catálogo continuará dirigido por dados. Cada missão terá estágio, competência, modo, dificuldade, pré-requisitos e variações. A seleção será pseudoaleatória e determinística por usuário/ciclo: evita sequência fixa, evita repetir a mesma família em seguida e permite reproduzir a fila em caso de recarga.

A versão atual mantém 50 missões Trainee como primeiro ciclo. O motor será preparado para crescer com missões Júnior e Pleno sem alterar o fluxo de execução. O trainee não precisa concluir necessariamente todas as 50 para “aprender”; o ciclo usa as 50 como repertório completo de homologação e o usuário recebe uma amostra variada por expediente.

## Interface

A entrada será mais suave: uma tela de expediente com saudação, cargo atual, missão recomendada, progresso curto e uma ação primária. A densidade ERP permanece dentro das transações, onde ela é útil para a simulação, mas o dashboard e o onboarding ficam mais humanos e objetivos.

## Identidade, direitos e escopo

A comunicação deve declarar que o produto é independente, não é produzido, patrocinado ou endossado pela SAP SE. “SAP”, nomes de transações e terminologia são usados apenas como referência de compatibilidade e estudo, conforme avaliação jurídica. Não haverá promessa de certificação, vaga, experiência equivalente ou autorização para uso de dados reais.

## Estrutura principal

- `js/core/models/journey.js`: fases, status, competências e metadados de promoção.
- `js/core/scenarios/catalog.js`: dados das missões e seus requisitos.
- `js/core/engine/traineeEngine.js`: perfil, fila determinística, progresso e promoção narrativa.
- `js/core/engine/scenarioEngine.js`: execução da missão e validação operacional.
- `js/components/welcomeModal.js`: onboarding do primeiro expediente.
- `js/components/transactions/dashboardView.js`: painel de expediente e próxima ação.
- `README.md`, `SECURITY.md`, `docs/SAAS-ROADMAP.md`: escopo, avisos e evolução futura.
- `docs/S4HANA-REFERENCE.md`: linha de referência S/4HANA e comparação com ECC/ERP clássico.
