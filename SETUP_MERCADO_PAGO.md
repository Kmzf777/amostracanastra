# 🚀 Setup Final - Integração Mercado Pago

## ✅ O que foi implementado

### Arquivos Criados:
- ✅ [src/lib/mercadopago.ts](src/lib/mercadopago.ts) - Cliente singleton MP
- ✅ [src/lib/schemas/checkout.ts](src/lib/schemas/checkout.ts) - Validação Zod checkout
- ✅ [src/lib/schemas/webhook.ts](src/lib/schemas/webhook.ts) - Validação Zod webhook
- ✅ [src/app/api/checkout/create/route.ts](src/app/api/checkout/create/route.ts) - Endpoint criação de preferência
- ✅ [supabase/migrations/20260204_add_mp_fields_to_vendas_amostra.sql](supabase/migrations/20260204_add_mp_fields_to_vendas_amostra.sql) - Migration SQL

### Arquivos Modificados:
- ✅ [src/app/api/webhook/mercado-pago/route.ts](src/app/api/webhook/mercado-pago/route.ts) - Webhook MP direto (removido n8n)
- ✅ [src/app/checkout/resumo/page.tsx](src/app/checkout/resumo/page.tsx) - Frontend atualizado
- ✅ [.env.local](.env.local) - Variáveis de ambiente

---

## 📋 Passos Finais Obrigatórios

### 1️⃣ Executar Migration SQL no Supabase

**Ação Necessária:** Adicionar colunas MP à tabela `vendas_amostra`

1. Acesse o painel do Supabase: https://dlkfpjismifzzzyphqtn.supabase.co
2. Vá em **SQL Editor**
3. Copie o conteúdo de [supabase/migrations/20260204_add_mp_fields_to_vendas_amostra.sql](supabase/migrations/20260204_add_mp_fields_to_vendas_amostra.sql)
4. Cole no editor e clique em **RUN**
5. Verifique se apareceu: **Success. No rows returned**

**Colunas que serão adicionadas:**
- `mp_preference_id` - ID da preferência MP
- `external_reference` - UUID único de rastreamento
- `init_point` - URL de checkout MP
- `affiliate_code` - Código do afiliado
- `customer_email` - Email do cliente
- `customer_name` - Nome do cliente
- `payment_method` - Método de pagamento (credit_card, pix, etc)
- `transaction_amount` - Valor da transação
- `mp_payment_id` - ID do pagamento MP
- `payment_status` - Status: pending, approved, rejected
- `integration_type` - Tipo: 'direct' (nova integração)

---

### 2️⃣ Configurar Webhook no Mercado Pago

**Ação Necessária:** Registrar URL de webhook no painel MP

#### Passo a Passo:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Clique em **Configurar Webhooks**
5. Cole a URL de produção:
   ```
   https://seu-dominio.com/api/webhook/mercado-pago
   ```
   ⚠️ **Importante:** Deve ser HTTPS em produção
6. Selecione os eventos:
   - ✅ `payment.created`
   - ✅ `payment.updated`
7. Clique em **Salvar**
8. **COPIE O WEBHOOK SECRET** gerado

#### Atualizar .env.local:

Abra [.env.local](.env.local) e substitua:

```bash
MERCADO_PAGO_WEBHOOK_SECRET=o_secret_copiado_do_painel_mp
```

---

### 3️⃣ Testar em Ambiente de Desenvolvimento

#### A. Iniciar servidor de desenvolvimento:

```bash
npm run dev
```

#### B. Testar endpoint de checkout:

```bash
curl -X POST http://localhost:3000/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456789",
    "customer": {
      "full_name": "Teste Silva",
      "email": "teste@example.com",
      "phone": "11999999999",
      "cpf": "12345678901",
      "address_line1": "Rua Teste",
      "number": "123",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "postal_code": "01000000"
    },
    "product": {
      "name": "Frete Amostra Grátis Café Especial",
      "price": 24.90,
      "quantity": 1
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "preference_id": "123456789-abc-def-...",
  "external_reference": "AMO-1738608000-X7K9P2"
}
```

#### C. Testar fluxo completo no navegador:

1. Acesse: http://localhost:3000/checkout?code=123456789
2. Preencha o formulário de checkout
3. Clique em "Pagar"
4. Verifique se abre o Mercado Pago
5. Use cartão de teste (modo sandbox):
   - **Número:** `5031 4332 1540 6351`
   - **CVV:** `123`
   - **Validade:** `11/25`
   - **Nome:** Qualquer nome
6. Complete o pagamento
7. Verifique os logs do webhook no terminal
8. Confirme que o código único de 6 dígitos foi gerado

---

### 4️⃣ Verificar Banco de Dados

Após um pagamento de teste bem-sucedido, verifique no Supabase:

#### Query para verificar:

```sql
-- Ver último registro criado
SELECT
  id,
  external_reference,
  mp_preference_id,
  customer_name,
  customer_email,
  payment_status,
  codigo_gerado,
  integration_type,
  created_at
FROM vendas_amostra
WHERE integration_type = 'direct'
ORDER BY created_at DESC
LIMIT 1;
```

**Campos que devem estar preenchidos:**
- ✅ `external_reference` - UUID único (ex: AMO-1738608000-X7K9P2)
- ✅ `mp_preference_id` - ID da preferência
- ✅ `customer_name` e `customer_email` - Dados do cliente
- ✅ `payment_status` - 'approved' após webhook
- ✅ `codigo_gerado` - Código de 6 dígitos (quando aprovado)
- ✅ `integration_type` - 'direct'

---

## 🧪 Testes em Sandbox (Ambiente de Teste)

### Obter credenciais de teste:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Alterne para **Credenciais de Teste**
3. Copie o `TEST-xxx` access token
4. Crie um arquivo `.env.test.local`:

```bash
# Copiar tudo do .env.local e substituir apenas:
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-xxx-xxx
```

### Cartões de teste:

| Resultado | Número | CVV | Validade | CPF |
|-----------|--------|-----|----------|-----|
| ✅ Aprovado | 5031 4332 1540 6351 | 123 | 11/25 | Qualquer |
| ❌ Rejeitado | 5031 4332 1540 6351 | 123 | 11/25 | Qualquer (valor > R$ 1000) |

### Testar PIX (sandbox):

1. No checkout MP, selecione PIX
2. Copie o código QR
3. No painel de teste do MP, simule pagamento
4. Webhook será acionado automaticamente

---

## 🔒 Checklist de Segurança

Antes de ir para produção:

- [ ] ✅ Migration SQL executada no Supabase
- [ ] ✅ Webhook configurado no painel MP (HTTPS)
- [ ] ✅ `MERCADO_PAGO_WEBHOOK_SECRET` configurado corretamente
- [ ] ✅ Credenciais de **PRODUÇÃO** no `.env.local`
- [ ] ✅ `NEXT_PUBLIC_BASE_URL` aponta para domínio de produção
- [ ] ✅ Testado em sandbox com sucesso
- [ ] ✅ Verificado que código único é gerado após pagamento
- [ ] ✅ Verificado que registro é criado em `affiliates`
- [ ] ❌ **NÃO committar** arquivos `.env*` no Git

---

## 🚨 Troubleshooting

### ❌ Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"

**Solução:** Verifique se o `.env.local` tem o token correto e reinicie o servidor (`npm run dev`)

### ❌ Erro: "Venda não encontrada" no webhook

**Solução:** O webhook chegou antes do banco salvar. O MP tentará novamente automaticamente (retry até 24h).

### ❌ Erro: "Assinatura inválida" no webhook

**Solução:** Verifique se o `MERCADO_PAGO_WEBHOOK_SECRET` está correto no `.env.local`

### ❌ Erro: "column vendas_amostra.external_reference does not exist"

**Solução:** Execute a migration SQL no Supabase (Passo 1)

### ❌ Webhook não está sendo chamado

**Soluções:**
1. Verifique se a URL do webhook está correta no painel MP
2. Em desenvolvimento local, use **ngrok** ou **localtunnel** para expor localhost:
   ```bash
   npx localtunnel --port 3000
   ```
3. Configure o webhook com a URL gerada (ex: `https://xxx.loca.lt/api/webhook/mercado-pago`)

---

## 📊 Monitoramento

### Logs importantes:

**Backend (terminal):**
```
🆔 External Reference gerado: AMO-1738608000-X7K9P2
🚀 Criando preferência no Mercado Pago...
✅ Preferência criada: 123456789-abc
💾 Pedido salvo no banco: 42
```

**Webhook (terminal):**
```
📡 Webhook Mercado Pago recebido
🔍 Buscando detalhes do pagamento: 123456
💳 Pagamento: { id: 123456, status: 'approved', external_reference: 'AMO-...' }
💳 Pagamento aprovado! Gerando código único...
🎉 Código gerado: 123456
✅ Venda atualizada com sucesso
```

### Painel do Mercado Pago:

- Acesse: https://www.mercadopago.com.br/movements
- Verifique transações recebidas
- Veja logs de webhooks enviados

---

## 🎯 Fluxo Completo Funcionando

```
1. Usuário clica em "Pagar" →
2. Frontend chama POST /api/checkout/create →
3. Backend cria preferência MP e salva no Supabase →
4. Backend retorna init_point para o frontend →
5. Frontend redireciona usuário para Mercado Pago →
6. Usuário completa pagamento →
7. Mercado Pago envia webhook para /api/webhook/mercado-pago →
8. Backend busca detalhes do pagamento via API MP →
9. Backend atualiza status e gera código único de 6 dígitos →
10. Backend cria registro em affiliates →
11. Usuário clica em "Confirmar Pagamento" →
12. Frontend mostra página de sucesso com código gerado ✅
```

---

## ℹ️ Informações Adicionais

### Diferenças do fluxo anterior (n8n):

| Aspecto | Fluxo Antigo (n8n) | Fluxo Novo (Direto) |
|---------|-------------------|---------------------|
| Endpoint de pagamento | Webhook externo n8n | `/api/checkout/create` |
| Criação de preferência | n8n → Mercado Pago | Backend → Mercado Pago SDK |
| Webhook | n8n → Backend | Mercado Pago → Backend |
| Rastreamento | `payment_link_id` | `external_reference` |
| Dependências externas | n8n (SaaS) | Nenhuma |
| Latência | ~2-3s | ~1s |
| Controle | Baixo | Total |

### Vantagens da nova integração:

- ✅ **Zero dependências externas** (não precisa mais de n8n)
- ✅ **Menor latência** (uma chamada a menos)
- ✅ **Melhor rastreamento** com `external_reference` único
- ✅ **Mais controle** sobre o fluxo de pagamento
- ✅ **Validação robusta** com Zod
- ✅ **Verificação de assinatura** no webhook (segurança)
- ✅ **Logs detalhados** para debugging

---

**Data de Implementação:** 2026-02-04
**Versão:** 1.0.0 - Integração Direta Mercado Pago
