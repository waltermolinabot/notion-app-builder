import { prisma } from '@/lib/prisma';
import { PLANS, PlanType } from './stripe';

export interface UsageStats {
  appsCount: number;
  usersCount: number;
  customDomainEnabled: boolean;
  plan: PlanType;
  limits: {
    apps: number;
    users: number;
    customDomain: boolean;
  };
  canCreateApp: boolean;
  canAddUser: boolean;
  canUseCustomDomain: boolean;
  usagePercentages: {
    apps: number;
    users: number;
  };
}

export async function getUserUsage(userId: string): Promise<UsageStats> {
  // Get user's subscription
  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });

  const plan = (subscription?.plan || 'free') as PlanType;
  const planConfig = PLANS[plan];

  // Count current usage
  const appsCount = await prisma.app.count({
    where: { userId },
  });

  // Count users across all apps (unique user roles)
  const usersCount = await prisma.userRole.count({
    where: {
      role: {
        app: {
          userId,
        },
      },
    },
  });

  const usagePercentages = {
    apps: Math.round((appsCount / planConfig.appsLimit) * 100),
    users: Math.round((usersCount / planConfig.usersLimit) * 100),
  };

  return {
    appsCount,
    usersCount,
    customDomainEnabled: subscription?.customDomain || false,
    plan,
    limits: {
      apps: planConfig.appsLimit,
      users: planConfig.usersLimit,
      customDomain: planConfig.customDomain,
    },
    canCreateApp: appsCount < planConfig.appsLimit,
    canAddUser: usersCount < planConfig.usersLimit,
    canUseCustomDomain: planConfig.customDomain,
    usagePercentages,
  };
}

export async function checkAppLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  upgradePlan?: PlanType;
}> {
  const usage = await getUserUsage(userId);
  
  if (usage.canCreateApp) {
    return {
      allowed: true,
      current: usage.appsCount,
      limit: usage.limits.apps,
    };
  }

  // Find next plan that allows more apps
  let upgradePlan: PlanType | undefined;
  if (usage.plan === 'free') upgradePlan = 'pro';
  else if (usage.plan === 'pro') upgradePlan = 'agency';

  return {
    allowed: false,
    current: usage.appsCount,
    limit: usage.limits.apps,
    upgradePlan,
  };
}

export async function checkUserLimit(appId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  upgradePlan?: PlanType;
}> {
  // Get the app to find the owner
  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: { user: true },
  });

  if (!app) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const usage = await getUserUsage(app.userId);

  if (usage.canAddUser) {
    return {
      allowed: true,
      current: usage.usersCount,
      limit: usage.limits.users,
    };
  }

  let upgradePlan: PlanType | undefined;
  if (usage.plan === 'free') upgradePlan = 'pro';
  else if (usage.plan === 'pro') upgradePlan = 'agency';

  return {
    allowed: false,
    current: usage.usersCount,
    limit: usage.limits.users,
    upgradePlan,
  };
}

export async function checkCustomDomainLimit(userId: string): Promise<{
  allowed: boolean;
  plan: PlanType;
}> {
  const usage = await getUserUsage(userId);
  
  return {
    allowed: usage.canUseCustomDomain,
    plan: usage.plan,
  };
}
