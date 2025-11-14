import MercadoPago, { Preference } from 'mercadopago';

// Initialize Mercado Pago with your credentials
export const mercadopago = new MercadoPago({
  accessToken: 'APP_USR-504258963331142-090413-1e563886f87267ab3fd1511859ec2755-2664947316',
  options: {
    timeout: 5000,
    idempotencyKey: 'unique-key',
  }
});

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    email: string;
    identification: {
      type: 'CPF';
      number: string;
    };
    phone: {
      area_code: string;
      number: string;
    };
  };
  shipments: {
    receiver_address: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
      complement?: string;
    };
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved';
  notification_url?: string;
  statement_descriptor: string;
  payment_methods: {
    excluded_payment_types: Array<{ id: string }>;
    installments: number;
  };
}

export async function createPreference(preferenceData: MercadoPagoPreference) {
  try {
    const preference = new Preference(mercadopago);
    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    throw error;
  }
}