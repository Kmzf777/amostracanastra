# Configuração do Webhook n8n para Pagamentos

## URL do Webhook

A URL do seu webhook é:
```
https://seu-dominio.com/api/webhook/mercado-pago
```

## Configuração no n8n

### 1. Criar o Workflow no n8n

Crie um workflow que receba os webhooks do Mercado Pago e envie para o seu site.

### 2. Configurar o Webhook Node

Configure o webhook node do n8n com:
- **Método**: POST
- **Path**: `/webhook/mercado-pago` (ou o path que você configurar)
- **Response**: 200

### 3. Adicionar Assinatura de Segurança

No n8n, adicione um header `x-n8n-signature` com um HMAC do body usando seu segredo.

Exemplo de código no n8n (Function Node):
```javascript
const crypto = require('crypto');
const secret = 'seu-segredo-aqui'; // Configure em process.env.N8N_WEBHOOK_SECRET

// Criar assinatura
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(items[0].json))
  .digest('hex');

// Adicionar header de assinatura
items[0].json.headers = {
  'x-n8n-signature': signature
};

return items;
```

### 4. Enviar para o Site

Configure um HTTP Request Node para enviar para seu site:

```json
{
  "method": "POST",
  "url": "https://seu-dominio.com/api/webhook/mercado-pago",
  "headers": {
    "Content-Type": "application/json",
    "x-n8n-signature": "{{$node['Function'].json.headers['x-n8n-signature']}}"
  },
  "body": {
    "payment_link_id": "{{$json.payment_link_id}}",
    "payment_link_status": "{{$json.payment_link_status}}"
  }
}
```

## Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Segredo para validação de webhooks do n8n
N8N_WEBHOOK_SECRET=seu-segredo-seguro-aqui

# Token de acesso do Mercado Pago (se ainda usar webhooks diretos)
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# Chave secreta para validação do webhook do Mercado Pago (opcional)
MERCADO_PAGO_WEBHOOK_SECRET=SUA_CHAVE_SECRETA_AQUI
```

## Formato do Webhook

O seu n8n deve enviar um webhook no seguinte formato:

```json
{
  "payment_link_id": "444235983-c6aa0a94-ede1-4dc4-b2f2-a73135483dae",
  "payment_link_status": "true"
}
```

Onde:
- `payment_link_id`: ID do link de pagamento (preference_id do Mercado Pago)
- `payment_link_status`: Status do pagamento (`true` para pago, `false` para pendente)

## Fluxo de Funcionamento

1. **Mercado Pago** → Envia webhook para o **n8n**
2. **n8n** → Processa e valida o webhook
3. **n8n** → Envia webhook simplificado para seu **site**
4. **Seu site** → Atualiza o status no Supabase
5. **Página de checkout** → Detecta mudança e redireciona usuário

## Testes

### Testar o endpoint de status:
```bash
curl "https://seu-dominio.com/api/order-status?payment_link_id=444235983-c6aa0a94-ede1-4dc4-b2f2-a73135483dae"
```

### Testar o webhook:
```bash
curl -X POST https://seu-dominio.com/api/webhook/mercado-pago \
  -H "Content-Type: application/json" \
  -H "x-n8n-signature: sua-assinatura-aqui" \
  -d '{
    "payment_link_id": "444235983-c6aa0a94-ede1-4dc4-b2f2-a73135483dae",
    "payment_link_status": "true"
  }'
```

## Segurança

- **Sempre use HTTPS** em produção
- **Configure assinaturas HMAC** para validar a origem dos webhooks
- **Mantenha seus segredos seguros** e não os commite no código
- **Use rate limiting** para proteger contra abuso
- **Valide os dados** recebidos antes de processar

## Debugging

Os logs mostrarão:
- 📡 Recebimento do webhook
- 🔐 Validação da assinatura
- 🔄 Atualização no banco de dados
- ✅ Resultado final
- 🎯 Redirecionamento do usuário

Para ver os logs em tempo real:
```bash
npm run dev
# ou
pm2 logs
```