import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10-11 dígitos)'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  address_line1: z.string().min(3, 'Endereço inválido'),
  address_line2: z.string().optional(),
  number: z.string().min(1, 'Número obrigatório'),
  district: z.string().min(2, 'Bairro inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  postal_code: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  complemento: z.string().optional()
});

export const productSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive()
});

export const checkoutRequestSchema = z.object({
  code: z.string().min(6, 'Código de afiliado deve ter no mínimo 6 caracteres').max(9, 'Código de afiliado deve ter no máximo 9 caracteres'),
  customer: customerSchema,
  product: productSchema
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CustomerData = z.infer<typeof customerSchema>;
