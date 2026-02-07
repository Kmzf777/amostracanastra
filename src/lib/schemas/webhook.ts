import { z } from 'zod';

// Schema para webhook n8n (legado)
export const n8nWebhookSchema = z.object({
  payment_link_id: z.string(),
  payment_link_status: z.union([z.boolean(), z.string()])
});

// Schema para webhook Mercado Pago direto
export const mercadoPagoWebhookSchema = z.object({
  action: z.string().optional(),
  api_version: z.string().optional(),
  data: z.object({
    id: z.string()
  }),
  date_created: z.string().optional(),
  id: z.number().optional(),
  live_mode: z.boolean().optional(),
  type: z.string(),
  user_id: z.string().optional()
});

export type N8nWebhook = z.infer<typeof n8nWebhookSchema>;
export type MercadoPagoWebhook = z.infer<typeof mercadoPagoWebhookSchema>;
