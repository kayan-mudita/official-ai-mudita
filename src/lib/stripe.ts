import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    })
  : (null as unknown as Stripe);

/**
 * Plan configuration mapping plan names to Stripe Price IDs.
 * Price IDs are loaded from environment variables so they can differ
 * between Stripe test mode and live mode.
 */
export const PLAN_CONFIG: Record<
  string,
  { name: string; priceId: string | undefined }
> = {
  professional: {
    name: "Professional",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
  },
  authority: {
    name: "Authority",
    priceId: process.env.STRIPE_PRICE_AUTHORITY,
  },
  expert: {
    name: "Expert",
    priceId: process.env.STRIPE_PRICE_EXPERT,
  },
};

/**
 * Look up which plan name corresponds to a given Stripe Price ID.
 * Returns "free" if no match is found.
 */
export function planFromPriceId(priceId: string): string {
  for (const [planKey, config] of Object.entries(PLAN_CONFIG)) {
    if (config.priceId === priceId) return planKey;
  }
  return "free";
}

/**
 * Create a Stripe Checkout Session for subscribing to a plan.
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  plan,
  stripeCustomerId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  plan: string;
  stripeCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const planConfig = PLAN_CONFIG[plan];
  if (!planConfig || !planConfig.priceId) {
    throw new Error(`Invalid plan or missing price ID for plan: ${plan}`);
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
  };

  // If the user already has a Stripe customer ID, reuse it.
  // Otherwise let Stripe create a new customer and pre-fill their email.
  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else {
    sessionParams.customer_email = userEmail;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

/**
 * Create a Stripe Customer Portal session so users can manage
 * their subscription, update payment methods, or cancel.
 */
export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}
