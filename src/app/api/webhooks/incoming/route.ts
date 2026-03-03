import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { prisma as globalPrisma } from "@/lib/prisma";

// Webhook endpoints for external integrations
// These allow other services to send data to the Notion App Builder

/**
 * POST /api/webhooks/incoming
 * Generic webhook endpoint for external integrations
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = request.headers.get("x-webhook-secret");
    const envSecret = process.env.WEBHOOK_SECRET;
    
    if (envSecret && webhookSecret !== envSecret) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const body = await request.json();
    const { event, data, appId, userId: providedUserId } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: "event and data are required" },
        { status: 400 }
      );

    }

    // If appId is provided, verify access
    if (appId) {
      const app = await prisma.app.findUnique({
        where: { id: appId },
      });

      if (!app) {
        return NextResponse.json(
          { error: "App not found" },
          { status: 404 }
        );
      }

      // Process webhook event based on type
      const result = await processWebhookEvent(event, data, app);

      return NextResponse.json({
        success: true,
        event,
        processed: result,
      });
    }

    // If no appId, return event info
    return NextResponse.json({
      success: true,
      event,
      message: "Event received. Provide appId to process.",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

/**
 * Process webhook events
 */
async function processWebhookEvent(event: string, data: any, app: any) {
  switch (event) {
    case "row.created":
    case "row.updated":
    case "row.deleted":
      return await handleRowEvent(event, data, app);
    
    case "sync.requested":
      return await handleSyncRequest(data, app);
    
    case "notification.send":
      return await handleNotification(data, app);
    
    default:
      // Custom events can be logged for later processing
      console.log(`Received custom event: ${event}`, data);
      return { processed: false, reason: "Unknown event type" };
  }
}

/**
 * Handle row-related webhook events
 */
async function handleRowEvent(event: string, data: any, app: any) {
  // Get data source linked to the app
  const dataSource = await prisma.dataSource.findFirst({
    where: { appId: app.id },
    include: { notionDatabases: true },
  });

  if (!dataSource || !dataSource.notionAccessToken) {
    return { processed: false, reason: "No connected data source" };
  }

  const databaseId = data.databaseId;
  const properties = data.properties;

  // Find matching database
  const database = dataSource.notionDatabases.find(
    (db) => db.notionId === databaseId
  );

  if (!database) {
    return { processed: false, reason: "Database not found" };
  }

  // Import row handling - sync to Notion
  const { createNotionRow, updateNotionRow, deleteNotionRow } = await import("@/lib/notion/rows");

  let result = null;

  switch (event) {
    case "row.created":
      result = await createNotionRow(
        dataSource.notionAccessToken,
        databaseId,
        properties
      );
      break;
    
    case "row.updated":
      if (data.rowId) {
        result = await updateNotionRow(
          dataSource.notionAccessToken,
          data.rowId,
          properties
        );
      }
      break;
    
    case "row.deleted":
      if (data.rowId) {
        result = await deleteNotionRow(
          dataSource.notionAccessToken,
          data.rowId
        );
      }
      break;
  }

  return { 
    processed: result !== null && result !== false, 
    notionId: result && typeof result === 'object' ? (result as any).id || null : null 
  };
}

/**
 * Handle sync request webhook
 */
async function handleSyncRequest(data: any, app: any) {
  // Trigger a full sync for the app
  const dataSource = await prisma.dataSource.findFirst({
    where: { appId: app.id },
  });

  if (!dataSource) {
    return { processed: false, reason: "No data source" };
  }

  // Update last sync timestamp
  await prisma.dataSource.update({
    where: { id: dataSource.id },
    data: { lastSyncAt: new Date() },
  });

  return { processed: true, syncStarted: true };
}

/**
 * Handle notification webhook
 */
async function handleNotification(data: any, app: any) {
  // For now, just log the notification
  // In production, could integrate with email, Slack, etc.
  console.log(`Notification for app ${app.id}:`, data.message);

  return { processed: true };
}

/**
 * GET /api/webhooks/incoming
 * List available webhook events and configuration
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");

  const availableEvents = [
    { event: "row.created", description: "Triggered when a new row is created" },
    { event: "row.updated", description: "Triggered when a row is updated" },
    { event: "row.deleted", description: "Triggered when a row is deleted" },
    { event: "sync.requested", description: "Request a full sync of the app" },
    { event: "notification.send", description: "Send a notification" },
  ];

  if (appId) {
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: { dataSources: true },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({
      appId: app.id,
      appName: app.name,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com"}/api/webhooks/incoming`,
      availableEvents,
      dataSources: app.dataSources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        connected: ds.connected,
      })),
    });
  }

  return NextResponse.json({
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com"}/api/webhooks/incoming`,
    availableEvents,
    documentation: "POST to this endpoint with { event, data, appId }",
  });
}
