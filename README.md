# NexusTech ERP • Simulador Educacional de Treinamento SAP SD

Um simulador web moderno, profissional e interativo projetado no conceito de **"Enterprise Serious Game"** para capacitar iniciantes, trainees e consultores juniores no módulo de **Vendas e Distribuição (Sales & Distribution - SAP® SD)**.

---

## 🌟 Diferenciais do Simulador

1. **Foco no Processo Comercial Ponta a Ponta**:
   $$\text{Cliente (XD03)} \longrightarrow \text{Ordem (VA01)} \longrightarrow \text{Disponibilidade ATP (MM03)} \longrightarrow \text{Preço (VK11)} \longrightarrow \text{Crédito (VKM1)} \longrightarrow \text{Remessa} \longrightarrow \text{Faturamento}$$
   O usuário aprende o impacto de cada decisão na cadeia de valor da empresa, e não apenas comandos isolados.

2. **Modo Treinamento vs. Modo Desafio**:
   - **Modo Treinamento**: O gestor Carlos Eduardo orienta passo a passo, sugere consultas e fornece dicas conceituais.
   - **Modo Desafio**: O trainee recebe chamados reais com cronômetro de **SLA (ex: 8 minutos)** e precisa diagnosticar o problema sozinho usando as ferramentas e transações disponíveis.

3. **Diagnóstico Estruturado com Impacto no Negócio**:
   Ao errar ou acertar, o sistema apresenta um feedback pedagógico em 3 partes:
   - **1. O que ocorreu**: Análise do preenchimento ou decisão tomada.
   - **2. Por quê? (Regra SAP SD)**: O conceito e a tabela mestre que regem aquela validação (`VBAK`, `VBAP`, `KNVV`, `MARA`, `KONP`, `KNKK`).
   - **3. Impacto no Negócio**: A consequência real na operação da empresa (ex: parada de expedição, recusa fiscal, perda de margem de lucro ou inadimplência).

4. **Identidade Visual Corporativa "Enterprise Grade"**:
   - Desenvolvido com paleta de cores corporativa, tipografia precisa (`Inter` e `JetBrains Mono`), tabelas densas com alta legibilidade e barra de comandos executável (OK-Code: `VA01`, `VA03`, `XD03`, `MM03`, `VK11`, `VKM1`).

5. **Gamificação e Trilha de Carreira**:
   - Progressão: *Estagiário de SD* $\rightarrow$ *Trainee Comercial* $\rightarrow$ *Analista Júnior I* $\rightarrow$ *Analista Júnior II*.
   - Indicadores de desempenho: Acurácia Comercial (%), Pontualidade em SLA (%), Conquistas (Badges) e Trilha de Auditoria com log de decisões.

---

## 🏢 A Empresa Fictícia: NexusTech Distribuidora S/A

- **Empresa Contábil (FI)**: `BR10 - NexusTech Brasil Distribuidora S/A`
- **Organização de Vendas (SD)**: `1000 - NexusTech Vendas Nacionais`
- **Canais de Distribuição**:
  - `10 - Venda Direta / Corporativo (B2B)`
  - `20 - Revenda / Atacado Distribuidor`
- **Setores de Atividade**: `01 - Equipamentos & Hardware` | `02 - Componentes e Peças`
- **Centro / Depósito (MM)**: `1000 (CD Matriz São Paulo)` / `DEP1 (Geral)` | `DEP2 (Críticos)`

---

## 🚀 Como Executar

O simulador foi construído em **HTML5, CSS Vanilla e Módulos JavaScript (ES6 Nativos)** sem dependência de processos de build complexos.

### Opção 1: Abrir diretamente no navegador
Basta dar um duplo clique no arquivo `index.html` ou abri-lo no Google Chrome / Microsoft Edge / Firefox.

### Opção 2: Executar via servidor local
No terminal (PowerShell / Command Prompt), dentro da pasta do projeto:
```bash
python -m http.server 3000
```
E acesse no navegador: `http://localhost:3000`

---

## 🧭 Transações Disponíveis no Simulador

| Transação | Nome / Finalidade | Principais Tabelas SAP SD |
|---|---|---|
| `/nVA01` | Criar Ordem do Cliente (Cabeçalho, Itens, Condições, Parceiros) | `VBAK`, `VBAP`, `VBPA` |
| `/nVA03` | Exibir Ordem & Fluxo de Documentos Comercial | `VBAK`, `VBFA` |
| `/nXD03` | Consulta ao Mestre de Clientes (Área de Vendas & Crédito) | `KNA1`, `KNVV`, `KNKK` |
| `/nMM03` | Consulta ao Mestre de Materiais (Estoque Físico & ATP) | `MARA`, `MARC`, `MARD` |
| `/nVK11` | Manutenção de Condições de Preço (`PR00`, Descontos) | `KONP`, `KONH` |
| `/nVKM1` | Liberação de Ordens Bloqueadas por Crédito Comercial | `VBUK`, `KNKK` |
| `/nDASH` | Central de Chamados, KPIs e Painel de Carreira | - |
