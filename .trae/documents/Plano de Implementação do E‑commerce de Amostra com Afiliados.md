## Estado Atual do Repositório
- Apenas `documento.md` encontrado no diretório atual; não há projeto Next.js inicializado nem arquivos de código.
- Supabase já integrado (no serviço), mas o app ainda não consome o banco; prosseguirei com o bootstrap do app e a ligação com Supabase.

## Arquitetura Técnica
- Frontend: Next.js (App Router) com React, TypeScript, Server Components para páginas, Client Components para formulários/mapa.
- Backend: route handlers em `app/api/*` cobrindo validação de código, checkout, webhook Mercado Pago e endpoints da dashboard.
- Banco: Supabase Postgres com RLS; acesso somente server-side via `service role` para operações sensíveis.
- Pagamentos: Mercado Pago Checkout Pro; `external_reference = order.id`; webhook assinado e idempotente.
- Observabilidade: logs estruturados com correlação por `order.id`/`external_reference`; tabela `events` e KPIs agregadas.

## Fase 1 — Bootstrap e Configuração
- Inicializar projeto Next.js com TypeScript, ESLint e configuração de App Router.
- Criar estrutura: `app/[code]/page.tsx`, `app/(checkout)/checkout/page.tsx`, `app/success/page.tsx`, `app/failure/page.tsx`, `app/pending/page.tsx`.
- Configurar envs: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (apenas no servidor), `SITE_URL`; placeholders para `MERCADO_PAGO_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET`.
- Implementar cliente Supabase:
  - `lib/supabaseServer.ts` usando `@supabase/supabase-js` com service role (server-only) para rotas API.
  - Tipagem gerada dos esquemas para segurança de tipos.

## Fase 2 — Banco de Dados e Tipos
- Validar/alinhar esquema das tabelas conforme especificação (`affiliates`, `customers`, `orders`, `shipments`, `payments`, `attributions`, `events`, `admin_users`, `audit_logs`).
- Gerar tipos TypeScript a partir do schema do Supabase para uso nas rotas e serviços.
- Criar utilitários de acesso com segurança (RLS): apenas endpoints server-side tocam dados sensíveis.

## Fase 3 — Validação de Código e Atribuição
- `POST /api/codes/validate`: recebe `{ code }`, valida afiliado (`active`) e retorna metadados.
- Página dinâmica `/[code]`: valida silenciosamente, captura UTM e `referer`, registra `events.checkout_view` e pré-carrega contexto para o checkout.
- `attributions`: registrar `utm_*`, `referer`, `device`, `ip_hash` (hash com salt) ao criar `order`.

## Fase 4 — Checkout e Frete
- Formulário client-side com validação de CPF, telefone e endereço completo; máscaras e feedback.
- Cálculo de frete por CEP/UF: implementar serviço com tabela/regra parametrizável; usar valores temporários até definição final.
- `POST /api/checkout/create`: cria `order`, `shipment`, preferência Mercado Pago e retorna `{ init_point, preference_id, external_reference }`.

## Fase 5 — Integração Mercado Pago
- Criar preferência com item único “Amostra Grátis – Frete” (`unit_price = shipping_amount`), `payer` com CPF, `back_urls` e `notification_url` para o webhook.
- Armazenar `external_reference = order.id`; salvar `mp_preference_id` em `orders`.
- Não expor `MERCADO_PAGO_ACCESS_TOKEN` no client; toda integração é server-side.

## Fase 6 — Webhook Idempotente
- `POST /api/webhooks/mercadopago`: validar assinatura (`MP_WEBHOOK_SECRET`), buscar pagamento por `id` do evento, reconciliar status.
- Atualizar `payments.status`; se `approved`: `orders.status = 'paid'`, `paid_at`.
- Criar novo afiliado para o comprador: gerar código `char(9)` único, PRNG criptográfico; setar `parent_affiliate_id`.
- Idempotência: `unique(mp_payment_id)` e registro em `events` para ignorar reprocessamentos.

## Fase 7 — Dashboard Admin
- Páginas server-side com filtros e tabelas:
  - `GET /api/dashboard/summary`: KPIs (vendas, receita, aprovação, média de frete, últimas transações).
  - `GET /api/dashboard/orders`: paginação por data, status, afiliado/código, cidade/UF.
  - `GET /api/dashboard/affiliates`: ranking e detalhes; ações de `ban|unban` e criação manual de códigos.
- Autorização: apenas usuários `admin` autenticados; nada de `service_key` no client.

## Fase 8 — Segurança e Observabilidade
- Rate limiting por IP em `codes/validate` e `checkout/create` (implementação inicial in-memory, com opção de persistência futura).
- CAPTCHA invisível no submit do checkout para mitigar bots.
- Políticas de cabeçalhos: CSP, `X-Frame-Options`, `Referrer-Policy`, HSTS.
- Criptografia de `cpf` (via `pgcrypto`) e mascaramento em logs; sanitização/validação de inputs.

## Fase 9 — Testes e Homologação
- Sandbox Mercado Pago para testes fim-a-fim.
- Testes de unidade e integração: validação de código, frete, criação de preferência, webhook (`approved`, `rejected`, `refunded`), idempotência e criação de novo afiliado.
- Testes de RLS e funil (visitas → checkouts → pagamentos aprovados).

## Entregáveis da Primeira Iteração
- Projeto Next.js inicializado com estrutura de pastas, configuração Supabase server-side e variáveis de ambiente.
- `/[code]` funcional com validação silenciosa; `POST /api/codes/validate` implementado.
- Checkout com formulário validado e cálculo de frete básico; `POST /api/checkout/create` retorna preferência (com placeholders de credenciais).
- Webhook estruturado e idempotente pronto para ativação após credenciais.

## Variáveis de Ambiente
- `SUPABASE_URL` (server), `SUPABASE_SERVICE_ROLE_KEY` (server-only), `SITE_URL`.
- `MERCADO_PAGO_ACCESS_TOKEN` (server-only), `MP_WEBHOOK_SECRET`.

## Considerações de Pasta
- Não deletar pastas existentes; criar apenas novas pastas/arquivos necessários dentro do diretório atual.

## Confirmação
- Posso inicializar o projeto Next.js e implementar a Fase 1–3 imediatamente (sem credenciais do Mercado Pago, usando placeholders), seguindo o plano acima?