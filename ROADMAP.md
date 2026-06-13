# Tatá Sushi — Gestão de Alimentação · Roadmap técnico

Sistema corporativo de gestão de alimentação: cardápio inteligente, compras,
estoque, desperdício, aceitação, radar de preços, previsão de demanda,
simulador financeiro, assistente e ROI. Protótipo funcional em Next.js 14 +
TypeScript + Tailwind, com persistência em `localStorage` e arquitetura já
preparada para multiusuário.

## Arquitetura atual (fase 1 — entregue)

```
src/lib/cardapio/
  dados.json        histórico consolidado (405 dias, 370 combos, 319 itens)
  tipos.ts          modelos de dados (cardápio + camada corporativa)
  motor.ts          regras de negócio: proteínas, lista de compras, sugestões
  estado.tsx        hooks de estado + persistência + auditoria global
  org.ts            papéis e MATRIZ de permissões (fonte única de acesso)
  indicadores.ts    KPIs do painel, previsão de demanda, necessidade, ROI
  radar.ts          tendência e alertas de preço, substituição de proteína
  assistente.ts     motor de respostas por regras (ponto único de troca p/ IA)
src/components/cardapio/
  AbaDashboard      Módulo 1 (KPIs) + 6 (previsão) + 12 (ROI)
  AbaEstoque        Módulo 2 (estoque + baixa pelo cardápio + necessidade)
  AbaDesperdicio    Módulo 3
  AbaAceitacao      Módulo 4 + eventos de demanda (M6)
  AbaRadar          Módulo 5
  AbaSimulador      Módulo 7
  AbaAuditoria      Módulo 9 + matriz de acessos (M10)
  Assistente        Módulo 8 (flutuante)
```

Princípios mantidos: nenhum fluxo existente foi quebrado (cotação, geração de
cardápio, lista de compras, workflow e `localStorage` seguem idênticos); os
novos módulos só leem o estado já existente e gravam chaves novas.

### Chaves de persistência (prefixo `cardapio.v1.`)

| Chave | Conteúdo |
|---|---|
| `semana.<id>` | documento da semana (existente) |
| `precos`, `fornecedores`, `itensExtras` | preços/fornecedores/itens (existente) |
| `aprendizado`, `mediaRefeicoes` | aprendizado de quantidades/demanda (existente) |
| `estoque`, `estoqueMov` | saldo e movimentos de estoque |
| `desperdicio.<id>` | sobras por semana |
| `aceitacao` | avaliações por prato |
| `historicoPrecos` | série temporal por item (radar) |
| `eventos` | eventos/feriados de demanda |
| `auditoria` | trilha de ações |
| `papel` | papel ativo (simulação de setor) |

## Fase 2 — Supabase e multiusuário

1. **Modelagem** (tabelas espelham `tipos.ts`): `empresas`, `unidades`,
   `usuarios`, `semanas`, `itens_semana`, `precos`, `estoque`, `movimentos`,
   `desperdicio`, `aceitacao`, `eventos`, `auditoria`.
2. **RLS** derivada de `org.ts` → cada `Permissao` vira policy por
   `empresa_id`/`unidade_id`/`papel`. A matriz já é a fonte única.
3. **Camada de dados**: trocar os hooks de `estado.tsx` por um cliente
   Supabase mantendo a mesma assinatura (`useSemana`, `usePrecos`, …) — os
   componentes não mudam. Realtime via `postgres_changes` para sincronizar
   gestor/cozinha/compras/recebimento ao vivo.
4. **Auth**: e-mail/senha + convite por unidade; `papelAtual` deixa de ser
   simulação e passa a vir do perfil autenticado.
5. **Migração**: exportar `localStorage` → seed inicial por unidade.

## Fase 3 — OCR de notas fiscais

- Upload da foto da nota (já existe `NotaFiscal`) → OCR (ex.: Google Vision /
  Textract / Tesseract serverless) → extração de itens e valores.
- Casar linhas com o catálogo via `casarItem` (já existe no parser de cotação).
- Alimentar `precoPago` e `historicoPrecos` automaticamente, fechando o ciclo
  cotado × pago e refinando o radar.

## Fase 4 — IA real no assistente

- `assistente.ts` já isola a lógica em `responder(pergunta, contexto)`.
- Substituir por chamada à API Claude com *tool use*: as funções de
  `indicadores.ts`/`radar.ts` viram ferramentas que a IA consulta, mantendo as
  respostas ancoradas nos dados reais (sem alucinação de números).
- Acrescentar geração de cardápio por linguagem natural ("monte uma semana
  econômica sem peixe") reaproveitando `sugerirSemana`/`sugerirSemanaCriativa`.

## Fase 5 — Feedback da equipe (QR)

- QR no pôster → página pública de 1 toque (😋/😐/👎) gravando em `aceitacao`.
- Realimenta ranking e o cruzamento aceitação × desperdício, e pode entrar
  como bônus na pontuação das sugestões.
