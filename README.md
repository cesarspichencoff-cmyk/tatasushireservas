# Tatá House — Sistema de Gestão do Refeitório

App completo para planejamento e operação da refeição dos funcionários do Tatá Sushi.

## Funcionalidades principais

- **🏠 Início** — Painel do Diretor com cards de decisão (economia, risco, fornecedor destaque, favorito, estoque crítico) + Briefing inteligente com alertas priorizados e insight proativo da IA. Fluxo da semana com progresso por etapa.

- **📅 Cardápio** — Montagem da semana com sugestão automática (histórico de 485 dias, 32.837+ refeições reais) respeitando regras de rotação de proteínas. Inteligência por prato (nota★, frequência, custo/pessoa) direto na seleção. Receitas com quantidades calculadas por dia. Pôster imprimível.

- **💬 Cotação integrada** — Cole a mensagem do fornecedor; a IA extrai itens e preços. Comparação automática entre fornecedores. Selos de confiança (🟢/🟡/🔴) com base em evidências históricas. Radar de preços com Parecer do Comprador.

- **🛒 Compras** — Lista gerada automaticamente descontando o estoque. Leitura de nota fiscal por IA (foto ou PDF). Perfis de fornecedores com histórico de qualidade e entregas. Pedido pelo WhatsApp em 1 toque.

- **📦 Estoque** — Saldo em tempo real, alertas de mínimo, baixa automática ao concluir semana, inventário mensal.

- **📊 Relatórios** — Visão financeira, custos por categoria, DNA da casa (linha do tempo + conquistas + campeões + proteínas), previsão de demanda com 3 cenários, auditoria de alterações.

- **🤖 Assistente de IA** — Abre tomando iniciativa: apresenta análise da semana, frentes de economia e plano de ação antes de receber qualquer pergunta. Badge vermelho quando há algo crítico detectado.

- **⭐ Avaliação** — QR Code no refeitório para avaliação em 20 segundos. Histórico permanente que alimenta o Chef IA e o ranking de pratos.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar

GitHub Pages via Actions. Push na branch `tata-house` dispara o deploy automaticamente.

## Atualizar o banco de dados do histórico

Os dados ficam em `src/lib/cardapio/dados.json`. Quando um novo período fechar, coloque as planilhas em uma pasta e rode:

```bash
python3 scripts/cardapio/consolidar.py
```

Veja `scripts/cardapio/README.md` para detalhes.
