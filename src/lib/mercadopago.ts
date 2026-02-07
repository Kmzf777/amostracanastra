import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

class MercadoPagoClient {
  private static instance: MercadoPagoClient;
  private client: MercadoPagoConfig;

  private constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });
  }

  public static getInstance(): MercadoPagoClient {
    if (!MercadoPagoClient.instance) {
      MercadoPagoClient.instance = new MercadoPagoClient();
    }
    return MercadoPagoClient.instance;
  }

  public getClient(): MercadoPagoConfig {
    return this.client;
  }

  public createPreference() {
    return new Preference(this.client);
  }

  public createPayment() {
    return new Payment(this.client);
  }
}

export default MercadoPagoClient;
