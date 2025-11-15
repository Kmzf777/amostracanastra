import { MercadoPagoConfig, Preference } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";

export const mercadopago = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  }
});

export interface MercadoPagoItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    surname?: string;
    email: string;
    identification: {
      type: 'CPF';
      number: string;
    };
    phone: {
      area_code: string;
      number: string;
    };
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: string;
    };
  };
  shipments: {
    receiver_address: {
      zip_code: string;
      street_name: string;
      street_number: string;
      city_name: string;
      state_name: string;
      country_name?: string;
      complement?: string;
    };
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved';
  notification_url?: string;
  statement_descriptor: string;
  payment_methods: {
    excluded_payment_types: Array<{ id: string }>;
    installments: number;
  };
}

export async function createPreference(preferenceData: MercadoPagoPreference) {
  try {
    if (!accessToken) {
      throw new Error('Missing MERCADO_PAGO_ACCESS_TOKEN');
    }
    const preference = new Preference(mercadopago);
    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    throw error;
  }
}