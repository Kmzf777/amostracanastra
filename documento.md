# Especificação do E‑commerce de Amostra Grátis com Códigos de Afiliado

## Visão Geral

- Produto único: cliente paga apenas o frete, recebe uma amostra grátis.
- Acesso por link com código afiliado de 9 dígitos: `amostra.com/[codigo]`.
- Sem criação de contas para compradores; dashboard administrativa segura.
- Banco: Supabase Postgres com RLS e criptografia de dados sensíveis.
- Pagamentos: Mercado Pago (Checkout Pro) com confirmação via webhook.
- Cada venda confirmada gera um novo código afiliado (efeito de rede).

## Fluxo do Usuário

- Entrada: visita `amostra.com/123456789` (via QR/link) valida afiliado sem input manual.
- Checkout: coleta dados pessoais e de entrega (nome, e‑mail, telefone, CPF, endereço completo) e calcula frete.
- Pagamento: cria preferência no Mercado Pago; redireciona para Checkout Pro; pedido fica `pending_payment`.
- Pós‑pagamento: webhook atualiza `orders/payments`; se aprovado, pedido vira `paid` e cria novo afiliado para o comprador; página de sucesso e e‑mail com código.
- Dashboard: exibe vendas, status, origem (código/UTM), mapa de entrega, ranking de afiliados.

## Funcionalidades

- Página dinâmica de código (`/[codigo]`) com validação silenciosa e tracking.
- Checkout com validação de CPF, endereço e cálculo de frete por CEP/UF.
- Integração Mercado Pago: preferência com `external_reference` vinculado à ordem.
- Webhook idempotente: processa eventos, reconcilia status, atualiza banco.
- Criação automática de novo código afiliado ao aprovar pagamento.
- Atribuição de vendas: registra código, UTM, `referer`, dispositivo e IP hash.
- Dashboard admin: KPIs, funil, filtros, exportação CSV, mapa de entregas, ranking.
- Controles: banir/reativar afiliado/código, reenvio de e‑mail, criação manual de códigos.

## Arquitetura

- Frontend: Next.js (App Router) e React; Server Components para páginas; Client Components em formulários e mapa.
- Backend: route handlers em `src/app/api/*` para códigos, checkout, webhooks e dashboard.
- Banco: Supabase Postgres; extensões `pgcrypto` para cifrar campos sensíveis; índices e constraints.
- Segredos: `MERCADO_PAGO_ACCESS_TOKEN` apenas no servidor; sem exposição no client.
- Observabilidade: logs estruturados e tabela de auditoria; KPIs agregadas.

## Banco de Dados

### Tabelas

- `affiliates`
  - `id uuid pk`
  - `code char(9) unique` (somente dígitos)
  - `status enum('active','blocked','expired')`
  - `parent_affiliate_id uuid null` (afiliado que originou)
  - `customer_id uuid null` (se criado a partir de um comprador)
  - `created_at timestamptz`
  - `blocked_reason text`
  - `last_sale_at timestamptz`
  - Índices: `unique(code)`, `idx_affiliates_parent`, `idx_affiliates_status`

- `customers`
  - `id uuid pk`
  - `full_name text`
  - `email text unique`
  - `phone text`
  - `cpf text encrypted` (via `pgcrypto`)
  - `created_at timestamptz`
  - Índices: `unique(email)`, `idx_customers_cpf`

- `orders`
  - `id uuid pk`
  - `affiliate_id uuid` e `code char(9)` (redundância útil para consultas)
  - `customer_id uuid`
  - `status enum('created','pending_payment','paid','cancelled','refunded','failed')`
  - `currency char(3) default 'BRL'`
  - `subtotal numeric(12,2)`
  - `shipping_amount numeric(12,2)`
  - `total_amount numeric(12,2)`
  - `external_reference text unique`
  - `mp_preference_id text`
  - `mp_payment_id text`
  - `created_at timestamptz`
  - `paid_at timestamptz`
  - Índices: `idx_orders_code`, `idx_orders_affiliate`, `unique(external_reference)`

- `shipments`
  - `id uuid pk`
  - `order_id uuid unique`
  - `receiver_name text`
  - `address_line1 text`, `address_line2 text`
  - `number text`, `district text`
  - `city text`, `state text`, `postal_code text`, `country char(2) default 'BR'`
  - `geo jsonb null`
  - `status enum('pending','ready','shipped','delivered','returned')`
  - `tracking_code text`, `carrier text`
  - `updated_at timestamptz`

- `payments`
  - `id uuid pk`
  - `order_id uuid unique`
  - `provider text default 'mercado_pago'`
  - `status enum('pending','approved','rejected','cancelled','refunded')`
  - `amount numeric(12,2)`
  - `data jsonb`
  - `mp_payment_id text unique`
  - `received_at timestamptz`

- `attributions`
  - `id uuid pk`
  - `order_id uuid`
  - `affiliate_id uuid`
  - `code char(9)`
  - `utm_source text`, `utm_medium text`, `utm_campaign text`, `utm_content text`
  - `referer text`, `device text`
  - `ip_hash text` (hash com salt)
  - `created_at timestamptz`
  - Índices: `idx_attr_affiliate`, `idx_attr_code`, `idx_attr_order`

- `events`
  - `id uuid pk`
  - `order_id uuid`
  - `type text` (ex.: `checkout_view`, `payment_approved`)
  - `metadata jsonb`
  - `created_at timestamptz`

- `admin_users`
  - `id uuid pk`
  - `email text unique`
  - `role enum('admin')`
  - `created_at timestamptz`

- `audit_logs`
  - `id uuid pk`
  - `actor text`, `action text`
  - `target_type text`, `target_id text`
  - `ip text`, `data jsonb`
  - `created_at timestamptz`

### Políticas RLS

- Leitura/escrita nas tabelas de negócio apenas via `service role` do servidor ou usuário `admin` autenticado.
- Dashboard consome endpoints server‑side; nenhum acesso direto ao `service_key` no client.

## APIs

- `POST /api/codes/validate`
  - Body `{ code }`; valida código e retorna metadados do afiliado.

- `POST /api/checkout/create`
  - Body `{ code, customer, shipment }`; cria `order`, `shipment`, preferência no MP; retorna `{ init_point, preference_id, external_reference }`.

- `POST /api/webhooks/mercadopago`
  - Recebe notificação; valida assinatura; busca `mp_payment_id`/`external_reference`; aplica idempotência; atualiza `payments` e `orders`; cria novo afiliado/código ao aprovar.

- `GET /api/dashboard/summary`
  - KPIs agregados (vendas, receita, aprovação, média de frete, últimas transações).

- `GET /api/dashboard/orders`
  - Listagem paginada e filtrável por data, status, afiliado/código, cidade/UF.

- `GET /api/dashboard/affiliates`
  - Ranking e detalhes de afiliados.

- `POST /api/dashboard/affiliates/{id}/ban|unban`
  - Controle administrativo de status do afiliado.

- `POST /api/dashboard/codes/create`
  - Criação manual de código afiliado.

## Integração Mercado Pago

- Preferência de pagamento:
  - `items`: 1 item “Amostra Grátis – Frete” com `unit_price = shipping_amount`, `quantity = 1`.
  - `payer`: `name`, `email`, `identification` (CPF).
  - `back_urls`: `success`, `failure`, `pending` para páginas Next.
  - `notification_url`: `https://amostra.com/api/webhooks/mercadopago`.
  - `external_reference`: `order.id`.

- Webhook:
  - Validar origem e assinatura (header/token).
  - Buscar pagamento via API pelo `id` do evento.
  - Atualizar `payments.status` (`approved`, `rejected`, etc.).
  - Se `approved`: `orders.status = 'paid'`, `paid_at` e criação de novo afiliado com código de 9 dígitos vinculado ao `customer_id` e `parent_affiliate_id` do vendedor.

- Idempotência:
  - `unique(mp_payment_id)` e registro em `events`; ignorar reprocessamentos já aplicados.

## Dashboard

- Visão geral: total de vendas, receita, taxa de aprovação, média de frete, últimas transações.
- Mapa de entregas: agregação por `city/UF`, heatmap.
- Ranking de afiliados: vendas por código, conversão, último movimento.
- Funil: visitas (`attributions`) → checkouts criados → pagamentos aprovados.
- Filtros: data, status, código/afiliado, cidade/UF, campanha.
- Exportação: CSV de pedidos e afiliados.
- Ações: banir/reativar afiliado, criar código manual, reenvio de e‑mail de confirmação.

## Atribuição e Tracking

- Capturar UTM e `referer` em `amostra.com/[code]?utm_source=...`.
- Registrar `device` e `ip_hash` (hash com salt) para privacidade.
- Associar `attributions` ao `order` criado; visitas sem compra geram `events` (`checkout_view`).

## Segurança

- Rate limiting por IP em validação de código e criação de checkout.
- CAPTCHA invisível no submit do checkout para mitigar bots.
- Mensagens genéricas para códigos inválidos (não revelar existência).
- CSP estrita, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`.
- Criptografia de `cpf` e, opcionalmente, `phone`; mascarar nos logs.
- Sanitização/validação de entradas; nunca logar tokens ou dados de pagamento.
- Bloqueio de códigos: `affiliates.status = 'blocked'` impede uso imediato.

## Webhooks e Idempotência

- Verificação assinada com token secreto em header próprio.
- Cada evento armazenado em `events` com `type` e `payment_id`.
- Processar somente se não processado; reconciliar alterações de status (`approved` → `refunded`).

## Geração de Código

- 9 dígitos aleatórios como string (`char(9)`), somente números.
- Garantir unicidade via índice único; tratar colisão por retry.
- PRNG criptográfico; evitar padrões previsíveis.
- Estado inicial `active`; `parent_affiliate_id` aponta para quem originou a venda.

## Observabilidade

- Logs estruturados por endpoint e webhook; correlação por `order.id`/`external_reference`.
- KPIs diárias e alertas de falhas de webhook/pagamentos rejeitados.
- Auditoria de ações admin e mudanças de status.

## Testes e Homologação

- Ambiente sandbox Mercado Pago para testes fim‑a‑fim.
- Testes de:
  - Validação de código e rate limiting.
  - Cálculo de frete e validações de endereço/CPF.
  - Criação de preferência e redirecionamento.
  - Webhook (`approved`, `rejected`, `refunded`).
  - Idempotência e criação de novo afiliado.
  - RLS: acesso apenas admin.
  - Funil e atribuição.

## Prompt Mestre (Resumo Operacional)

- Stack: Next.js (App Router), React, Supabase Postgres, Mercado Pago Checkout Pro; sem contas para compradores; dashboard admin segura.
- Fluxo: `amostra.com/[codigo]` valida afiliado; checkout coleta dados e calcula frete; cria preferência MP com `external_reference = order.id`; redireciona; webhook atualiza `orders/payments`; se `approved` cria novo afiliado com código de 9 dígitos e vincula `parent_affiliate_id`; envia e‑mail e atualiza dashboard.
- Banco: tabelas `affiliates`, `customers`, `orders`, `shipments`, `payments`, `attributions`, `events`, `admin_users`, `audit_logs` com RLS.
- APIs: `POST /api/codes/validate`, `POST /api/checkout/create`, `POST /api/webhooks/mercadopago`, `GET /api/dashboard/*`, `POST /api/dashboard/affiliates/{id}/ban|unban`, `POST /api/dashboard/codes/create`.
- Segurança: rate limit, CAPTCHA invisível, CSP, criptografia de CPF, logs sem segredos, ban de código/afiliado, validação de entrada.
- Dashboard: KPIs, mapa de entregas, ranking de afiliados, funil, filtros, exportação CSV, ações admin.
- Atribuição: UTM, `referer`, `device`, `ip_hash` associado ao pedido.
- Testes: sandbox MP, webhooks, idempotência, RLS, funil.

## Próximos Passos

- Definir valores e regras de frete por CEP/UF.
- Configurar credenciais Mercado Pago (sandbox/produção) e URLs de retorno/notificação.
- Implementar geração segura de códigos e políticas anti‑brute force.
- Construir endpoints e RLS conforme especificação e validar no sandbox.
- Montar dashboard com KPIs e mapa de entregas prioritários.
- Preparar conteúdos de e‑mail e página de sucesso com o novo código.