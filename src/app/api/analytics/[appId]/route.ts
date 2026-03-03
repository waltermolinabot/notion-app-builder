import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics/[appId]
 * Track an analytics event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const { eventType, metadata } = await request.json();

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    // Validate app exists
    const app = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Create analytics event
    const analytics = await prisma.appAnalytics.create({
      data: {
        appId,
        eventType,
        metadata: metadata || {},
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/[appId]
 * Get analytics for an app (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d
    const eventType = searchParams.get("eventType");

    // Verify ownership
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        userId,
      },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build where clause
    const where: any = {
      appId,
      createdAt: {
        gte: startDate,
      },
    };

    if (eventType) {
      where.eventType = eventType;
    }

    // Get total counts by event type
    const eventCounts = await prisma.appAnalytics.groupBy({
      by: ["eventType"],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get time series data
    const timeSeries = await prisma.appAnalytics.groupBy({
      by: ["eventType", "createdAt"],
      where: {
        ...where,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get unique visitors (simplified - using sessionId or IP)
    const uniqueVisitors = await prisma.appAnalytics.findMany({
      where,
      select: {
        ipAddress: true,
        sessionId: true,
      },
      distinct: ["ipAddress", "sessionId"],
    });

    // Calculate totals
    const totalEvents = eventCounts.reduce((sum: number, e: { _count: { id: number } }) => sum + e._count.id, 0);

    return NextResponse.json({
      period,
      summary: {
        totalEvents,
        uniqueVisitors: uniqueVisitors.length,
        eventsByType: eventCounts.map((e) => ({
          eventType: e.eventType,
          count: e._count.id,
        })),
      },
      periodStart: startDate,
      periodEnd: now,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
