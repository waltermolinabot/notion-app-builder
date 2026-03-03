import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface PlanLimits {
  apps: number;
  records: number;
  users: number;
  publishedApps: number;
  customDomains: number;
  apiCalls: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    apps: 1,
    records: 100,
    users: 3,
    publishedApps: 0,
    customDomains: 0,
    apiCalls: 1000,
  },
  pro: {
    apps: 10,
    records: 10000,
    users: 50,
    publishedApps: 5,
    customDomains: 1,
    apiCalls: 50000,
  },
  agency: {
    apps: 100,
    records: 100000,
    users: 500,
    publishedApps: 50,
    customDomains: 10,
    apiCalls: 500000,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    // Get user subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    const plan = subscription?.plan || "free";
    const limits = PLAN_LIMITS[plan];

    // Get current usage
    const [appCount, userCount] = await Promise.all([
      prisma.app.count({ where: { userId } }),
      prisma.userRole.count({
        where: { role: { app: { userId } } },
      }),
    ]);

    const usage = {
      apps: appCount,
      users: userCount,
      records: 0, // Would need separate tracking
      publishedApps: await prisma.app.count({
        where: { userId, published: true },
      }),
      customDomains: 0,
      apiCalls: 0,
    };

    const overages: Record<string, boolean> = {
      apps: usage.apps >= limits.apps,
      users: usage.users >= limits.users,
    };

    return NextResponse.json({
      plan,
      limits,
      usage,
      overages,
      canPublish: !overages.apps,
    });
  } catch (error) {
    console.error("Error checking limits:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Check if user can perform action
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // "createApp", "publishApp", "addUser"

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    const plan = subscription?.plan || "free";
    const limits = PLAN_LIMITS[plan];

    switch (action) {
      case "createApp": {
        const appCount = await prisma.app.count({ where: { userId } });
        if (appCount >= limits.apps) {
          return NextResponse.json({
            allowed: false,
            reason: `Limite alcanzado: ${limits.apps} apps maximas en plan ${plan}`,
            upgradeTo: plan === "free" ? "pro" : "agency",
          });
        }
        break;
      }
      case "publishApp": {
        const publishedCount = await prisma.app.count({
          where: { userId, published: true },
        });
        if (publishedCount >= limits.publishedApps) {
          return NextResponse.json({
            allowed: false,
            reason: `Limite alcanzado: ${limits.publishedApps} apps publicadas maximas`,
            upgradeTo: plan === "free" ? "pro" : "agency",
          });
        }
        break;
      }
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Error checking action:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
