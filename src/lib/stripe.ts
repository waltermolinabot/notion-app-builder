import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey 
  ? new Stripe(stripeKey, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  : null;

// Helper to check if Stripe is configured
export const isStripeConfigured = () => !!stripe;

// Plan configuration
export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    appsLimit: 1,
    usersLimit: 100,
    customDomain: false,
    features: ['1 app', '100 users', 'Basic blocks'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    appsLimit: 10,
    usersLimit: 1000,
    customDomain: true,
    features: ['10 apps', '1000 users', 'Custom domain', 'All blocks', 'Analytics'],
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    appsLimit: 50,
    usersLimit: 10000,
    customDomain: true,
    features: ['50 apps', '10000 users', 'Custom domain', 'All blocks', 'Analytics', 'Priority support'],
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function getOrCreateCustomer(userId: string, email: string) {
  if (!stripe) throw new Error('Stripe not configured');
  const { prisma } = await import('@/lib/prisma');
  
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    metadata: { userId },
    email,
  });

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.subscriptions.cancel(subscriptionId);
}
