import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, createCheckoutSession, PLANS, PlanType } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: PlanType };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    
    if (!planConfig.priceId) {
      return NextResponse.json({ 
        error: "Free plan does not require checkout" 
      }, { status: 400 });
    }

    // Get user email from Clerk or database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found. Please complete registration." 
      }, { status: 404 });
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(userId, user.email);

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?billing=success&plan=${plan}`;
    const cancelUrl = `${baseUrl}/dashboard?billing=cancelled`;

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      planConfig.priceId,
      userId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
