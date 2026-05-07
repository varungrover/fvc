/**
 * MOCK STRIPE CLIENT
 * Used for Module 8 implementation when Stripe is not yet configured.
 * Interface matches real Stripe SDK for easy replacement.
 */

export const stripe = {
  customers: {
    create: async (params: { email: string; name?: string }) => {
      console.log("[MOCK STRIPE] Creating customer:", params.email);
      return { id: `cus_mock_${Math.random().toString(36).substring(7)}` };
    },
  },
  paymentMethods: {
    attach: async (pmId: string, params: { customer: string }) => {
      console.log(`[MOCK STRIPE] Attaching PM ${pmId} to customer ${params.customer}`);
      return { id: pmId };
    },
    detach: async (pmId: string) => {
      console.log(`[MOCK STRIPE] Detaching PM ${pmId}`);
      return { id: pmId };
    },
  },
  paymentIntents: {
    create: async (params: {
      amount: number;
      currency: string;
      customer?: string;
      payment_method?: string;
      confirm?: boolean;
      off_session?: boolean;
    }) => {
      console.log(`[MOCK STRIPE] Creating PaymentIntent for ${params.amount} ${params.currency}`);
      return {
        id: `pi_mock_${Math.random().toString(36).substring(7)}`,
        status: "succeeded",
        client_secret: `pi_mock_secret_${Math.random().toString(36).substring(7)}`,
      };
    },
  },
  webhooks: {
    constructEvent: (payload: any, sig: string, secret: string) => {
      // Return a dummy event for testing
      return {
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_mock_123", customer: "cus_mock_123" } },
      };
    },
  },
};

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}

export async function attachPaymentMethod(stripeCustomerId: string, stripePmId: string) {
  return stripe.paymentMethods.attach(stripePmId, { customer: stripeCustomerId });
}

export async function createPaymentIntent(
  amountCents: number,
  currency: string,
  stripeCustomerId?: string,
  stripePmId?: string
) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: stripeCustomerId,
    payment_method: stripePmId,
    confirm: !!stripePmId,
    off_session: !!stripePmId,
  });
}
