# Especificação do E‑commerce de Amostra Grátis com Códigos de Afiliado

## Visão Geral

- Produto único: cliente recebe uma amostra grátis sem pagar frete.
- Acesso por link com código afiliado de 9 dígitos: `amostra.com/[codigo]`.
- Sem criação de contas para compradores; dashboard administrativa segura.
- Banco: Supabase Postgres com RLS e criptografia de dados sensíveis.
- Cada venda confirmada gera um novo código afiliado (efeito de rede).

## Fluxo do Usuário

- Entrada: visita `amostra.com/123456789` (via QR/link) valida afiliado sem input manual.
- Checkout: coleta dados pessoais e de entrega (nome, e‑mail, telefone, CPF, endereço completo).
- Confirmação: pedido é criado e confirmado automaticamente sem necessidade de pagamento.
- Pós-confirmação: pedido vira `confirmed` e cria novo afiliado para o comprador; página de sucesso e e‑mail com código.
- Dashboard: exibe vendas, status, origem (código/UTM), mapa de entrega, ranking de afiliados.

## Funcionalidades

- Página dinâmica de código (`/[codigo]`) com validação silenciosa e tracking.
- Checkout com validação de CPF, endereço.
- Criação automática de novo código afiliado ao confirmar pedido.
- Atribuição de vendas: registra código, UTM, `referer`, dispositivo e IP hash.
- Dashboard admin: KPIs, funil, filtros, exportação CSV, mapa de entregas, ranking.
- Controles: banir/reativar afiliado/código, criar código manual, reenvio de e‑mail de confirmação.

## Arquitetura

- Frontend: Next.js (App Router) e React; Server Components para páginas; Client Components em formulários e mapa.
- Backend: route handlers em `src/app/api/*` para códigos, checkout, e dashboard.
- Banco: Supabase Postgres; extensões `pgcrypto` para cifrar campos sensíveis; índices e constraints.
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
  - `status enum('created','confirmed','cancelled','failed')`
  - `currency char(3) default 'BRL'`
  - `subtotal numeric(12,2)` (será 0 para amostras grátis)
  - `shipping_amount numeric(12,2)` (será 0 para frete grátis)
  - `total_amount numeric(12,2)` (será 0 para pedidos grátis)
  - `external_reference text unique`
  - `created_at timestamptz`
  - `confirmed_at timestamptz`
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
  - `type text` (ex.: `checkout_view`, `order_confirmed`)
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
- Dashboard consome endpoints server-side; nenhum acesso direto ao `service_key` no client.

## APIs

- `POST /api/codes/validate`
  - Body `{ code }`; valida código e retorna metadados do afiliado.

- `POST /api/checkout/create`
  - Body `{ code, customer, shipment }`; cria `order`, `shipment`; retorna `{ order_id, external_reference }`.

- `GET /api/dashboard/summary`
  - KPIs agregados (vendas, origem, últimas transações).

- `GET /api/dashboard/orders`
  - Listagem paginada e filtrável por data, status, afiliado/código, cidade/UF.

- `GET /api/dashboard/affiliates`
  - Ranking e detalhes de afiliados.

- `POST /api/dashboard/affiliates/{id}/ban|unban`
  - Controle administrativo de status do afiliado.

- `POST /api/dashboard/codes/create`
  - Criação manual de código afiliado.

## Dashboard

- Visão geral: total de vendas, origem, últimas transações.
- Mapa de entregas: agregação por `city/UF`, heatmap.
- Ranking de afiliados: vendas por código, conversão, último movimento.
- Funil: visitas (`attributions`) → pedidos confirmados.
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
- Sanitização/validação de entradas; nenhum dado sensível exposto.
- Bloqueio de códigos: `affiliates.status = 'blocked'` impede uso imediato.

## Webhooks e Idempotência

- Verificação assinada com token secreto em header próprio.
- Cada evento armazenado em `events` com `type` e `order_id`.
- Processar somente se não processado; reconciliar alterações de status.

## Geração de Código

- 9 dígitos aleatórios como string (`char(9)`), somente números.
- Garantir unicidade via índice único; tratar colisão por retry.
- PRNG criptográfico; evitar padrões previsíveis.
- Estado inicial `active`; `parent_affiliate_id` aponta para quem originou a venda.

## Observabilidade

- Logs estruturados por endpoint e webhook; correlação por `order.id`/`external_reference`.
- KPIs diárias e alertas de falhas.
- Auditoria de ações admin e mudanças de status.

## Testes e Homologação

- Testes de:
  - Validação de código e rate limiting.
  - Validações de endereço/CPF.
  - Criação de pedido e confirmação.
  - Idempotência e criação de novo afiliado.
  - RLS: acesso apenas admin.
  - Funil e atribuição.

## Prompt Mestre (Resumo Operacional)

- Stack: Next.js (App Router), React, Supabase Postgres; sem contas para compradores; dashboard admin segura.
- Fluxo: `amostra.com/[codigo]` valida afiliado; checkout coleta dados e cria pedido; confirmação automática; cria novo afiliado com código de 9 dígitos e vincula `parent_affiliate_id`; envia e‑mail e atualiza dashboard.
- Banco: tabelas `affiliates`, `customers`, `orders`, `shipments`, `attributions`, `events`, `admin_users`, `audit_logs` com RLS.
- APIs: `POST /api/codes/validate`, `POST /api/checkout/create`, `GET /api/dashboard/*`, `POST /api/dashboard/affiliates/{id}/ban|unban`, `POST /api/dashboard/codes/create`.
- Segurança: rate limit, CAPTCHA invisível, CSP, criptografia de CPF, logs sem segredos, ban de código/afiliado, validação de entrada.
- Dashboard: KPIs, mapa de entregas, ranking de afiliados, funil, filtros, exportação CSV, ações admin.
- Atribuição: UTM, `referer`, `device`, `ip_hash` associado ao pedido.
- Testes: RLS, funil.

## Próximos Passos

- Definir regras de frete (agora gratuito).
- Implementar geração segura de códigos e políticas anti‑brute force.
- Construir endpoints e RLS conforme especificação.
- Montar dashboard com KPIs e mapa de entregas prioritários.
- Preparar conteúdos de e‑mail e página de sucesso com o novo código.