import { ContextRegistryEntry } from "../../registry/types.js";

/**
 * High-fidelity generator for Stripe context.
 */
export function generateStripeContext(entry: ContextRegistryEntry, answer: string): string {
  const isSubscriptions = answer.toLowerCase().includes("subscription");
  const isConnect = answer.toLowerCase().includes("connect");

  return `# Stripe Billing Context: ${isSubscriptions ? "Subscriptions" : isConnect ? "Connect" : "Standalone Payments"}

This project uses Stripe for ${entry.description}

## Useful Reference
- **API Version**: 2024-04-10
- **Webhooks**: Required for ${isSubscriptions ? "billing lifecycle" : "payment success"}.
- **CLI**: Use \`stripe listen --forward-to localhost:3000/api/webhooks/stripe\`

## ${isSubscriptions ? "Subscription" : "Payment"} Flow
${isSubscriptions ? "- Customer creates intent\n- Webhook handles `customer.subscription.created`" : "- One-time payment via Checkout\n- Webhook handles `checkout.session.completed`"}

## Keys to Configure
- \`STRIPE_SECRET_KEY\`: For backend SDK
- \`STRIPE_WEBHOOK_SECRET\`: For signature verification
- \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\`: For frontend elements
`;
}
