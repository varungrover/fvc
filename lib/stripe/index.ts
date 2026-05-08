import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia", 
  typescript: true,
});

export async function getOrCreateCustomer(email: string, name: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0];
  }
  return stripe.customers.create({ email, name });
}

export async function createSubscriptionCheckout({
  customerId,
  email,
  priceAmount,
  productName,
  successUrl,
  cancelUrl,
  metadata
}: {
  customerId?: string;
  email: string;
  priceAmount: number;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : email,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
          },
          unit_amount: Math.round(priceAmount * 100),
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
  });
}

export async function attachPaymentMethod(customerId: string, paymentMethodId: string) {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

export async function createPaymentIntent({
  amount,
  customerId,
  description,
  metadata
}: {
  amount: number;
  customerId: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    customer: customerId,
    description,
    metadata,
  });
}
