## Objetivo
- Remover código não utilizado e tornar a página de resumo reativa via Supabase Realtime, redirecionando imediatamente quando `payment_link_status = true`.

## Backend
- Webhook (`src/app/api/webhook/mercado-pago/route.ts`):
  - Remover caminhos e funções não utilizadas (ex.: `getPaymentStatus` e lógica de `resource/topic` do Mercado Pago) para focar apenas no formato vindo do n8n.
  - Persistir somente `payment_link_id` e `payment_link_status` (já corrigido) e padronizar resposta.
  - Logar o `payment_link_id` e status de forma concisa.
- Endpoint de status (`src/app/api/order-status/route.ts`):
  - Usar apenas colunas existentes (`payment_link_status`, `payment_link_id`, `created_at`).
  - Opcional: manter como fallback; caso queira “remover tudo não utilizado”, podemos retirar o polling e esse endpoint (confirmar).

## Frontend
- Página de resumo (`src/app/checkout/resumo/page.tsx`):
  - Ativar Supabase Realtime: assinar `postgres_changes` em `public.vendas_amostra` com filtro `payment_link_id=eq.<id>` e, ao receber `payment_link_status = true`, redirecionar para `/checkout/sucesso`.
  - Remover o polling periódico se a preferência for 100% realtime; opcional: manter fallback discreto (3–5s) com timeout de 5min por robustez.
  - Garantir obtenção do `payment_link_id` (estado/localStorage) após clique em pagamento.

## Remoções
- Webhook: remover função `getPaymentStatus` e caminho de MP direto, caso a fonte única seja n8n.
- Páginas/arquivos duplicados: avaliar `src/app/checkout/summary/page.tsx` vs `src/app/checkout/resumo/page.tsx` e remover o que não é usado.
- Qualquer referência a `order_status`/`updated_at` nas APIs.

## Testes
- Teste manual (produção):
  - Acionar o n8n para enviar `{ payment_link_id, payment_link_status: true }` ao webhook e verificar redirecionamento imediato.
- Teste controlado:
  - Atualizar via Supabase (SQL) `UPDATE public.vendas_amostra SET payment_link_status = true WHERE payment_link_id = '<id>'` e verificar a página redirecionando.
- Observabilidade: checar logs na Vercel para receber evento realtime e confirmar redirecionamento.

## Deploy
- Commit das mudanças, push para `master` e validar no `amostra.cafecanastra.com`.

## Segurança (próximo passo, opcional)
- Assinar/validar webhooks do n8n.
- Limitar origem/ratelimit.

Confirma que removemos o polling e todo o caminho de Mercado Pago (API direta), mantendo somente n8n + Supabase Realtime? Se sim, aplico as mudanças, faço o deploy e valido com um teste setando `payment_link_status = true` para garantir o redirecionamento.