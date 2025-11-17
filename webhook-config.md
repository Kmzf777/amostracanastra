# Configuração do Webhook Mercado Pago

## URL do Webhook

A URL do seu webhook é:
```
https://seu-dominio.com/api/webhook/mercado-pago
```

## Configuração no Mercado Pago

1. Acesse o painel de desenvolvedor do Mercado Pago
2. Vá para "Notificações Webhook"
3. Configure a URL: `https://seu-dominio.com/api/webhook/mercado-pago`
4. Selecione os eventos:
   - `merchant_order` (ordens de pagamento)
   - `payment` (pagamentos)

## Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Token de acesso do Mercado Pago (produção)
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# Chave secreta para validação do webhook (opcional)
MERCADO_PAGO_WEBHOOK_SECRET=SUA_CHAVE_SECRETA_AQUI
```

## Testes

### Testar se o webhook está funcionando:
```bash
# GET - Verificar status
curl https://seu-dominio.com/api/webhook/mercado-pago

# POST - Testar com dados simulados
curl -X POST https://seu-dominio.com/api/webhook/mercado-pago \
  -H "Content-Type: application/json" \
  -H "x-signature: test-signature" \
  -H "x-request-id: test-request-id" \
  -d '{
    "resource": "https://api.mercadolibre.com/merchant_orders/123456",
    "topic": "merchant_order"
  }'
```

## Estrutura da Tabela

A tabela `vendas_amostra` foi criada com os seguintes campos:

- `id`: Identificador único
- `payment_link_id`: ID do link de pagamento (preference_id)
- `payment_link_status`: Status do pagamento (true/false)
- `order_status`: Status da ordem (paid, pending, etc)
- `follow_up_counter`: Contador de follow-ups
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Fluxo de Funcionamento

1. Mercado Pago envia notificação para seu webhook
2. Webhook valida os dados básicos
3. Consulta a API do Mercado Pago para obter detalhes
4. Atualiza o status na tabela `vendas_amostra`
5. Se o pagamento foi confirmado, pode disparar ações adicionais (email, etc)

## Observações Importantes

- O webhook aceita apenas o tópico `merchant_order`
- Se o registro não existir, ele será criado automaticamente
- A validação de assinatura está desativada para testes
- Em produção, implemente a validação HMAC completa

## Debug

Os logs mostram:
- 📡 Recebimento do webhook
- 🔐 Validação da assinatura
- 🆔 ID do pedido
- 📊 Dados do Mercado Pago
- 💰 Status do pagamento
- 🔄 Atualização no banco de dados
- ✅ Resultado final