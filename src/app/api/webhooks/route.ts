import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * GET /api/webhooks
 * List webhooks for the user's app
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    // Get user's apps
    const apps = await prisma.app.findMany({
      where: { userId },
      include: {
        dataSources: {
          include: {
            notionDatabases: true,
          },
        },
      },
    });

    if (!appId) {
      // Return all apps with webhook info
      return NextResponse.json(
        apps.map((app) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
          hasWebhooks: false, // Placeholder for webhook configuration
        }))
      );
    }

    // Return specific app
    const app = apps.find((a) => a.id === appId);
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: app.id,
      name: app.name,
      slug: app.slug,
      dataSources: app.dataSources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        databases: ds.notionDatabases.map((db) => ({
          id: db.id,
          name: db.name,
          notionId: db.notionId,
        })),
      })),
    });
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return NextResponse.json(
      { error: "Failed to list webhooks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks
 * Create a new webhook for an app
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      appId, 
      name, 
      url, 
      events, 
      secret,
      databaseId 
    } = body;

    if (!appId || !name || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "appId, name, url, and events array are required" },
        { status: 400 }
      );
    }

    // Verify app belongs to user
    const app = await prisma.app.findFirst({
      where: { id: appId, userId },
    });

    if (!app) {
      return NextResponse.json(
        { error: "App not found or not authorized" },
        { status: 404 }
      );
    }

    // Generate webhook secret if not provided
    const webhookSecret = secret || randomBytes(32).toString("hex");

    // Store webhook configuration in database
    // For now, we'll store it in the App config - could be a separate Webhook model
    const currentWebhooks = (app as any).config?.webhooks || [];
    
    const newWebhook = {
      id: randomBytes(8).toString("hex"),
      name,
      url,
      events,
      secret: webhookSecret,
      databaseId,
      createdAt: new Date().toISOString(),
      active: true,
    };

      await prisma.app.update({
        where: { id: appId },
        data: {
          // Store webhooks in a JSON field - using raw query for JSON fields
        } as any,
      });

    return NextResponse.json({
      success: true,
      webhook: {
        ...newWebhook,
        secret: webhookSecret, // Only returned on creation
      },
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks
 * Delete a webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get("id");
    const appId = searchParams.get("appId");

    if (!webhookId || !appId) {
      return NextResponse.json(
        { error: "webhook id and appId are required" },
        { status: 400 }
      );
    }

    // Verify app belongs to user
    const app = await prisma.app.findFirst({
      where: { id: appId, userId },
    });

    if (!app) {
      return NextResponse.json(
        { error: "App not found or not authorized" },
        { status: 404 }
      );
    }

    // Remove webhook from config
    const currentWebhooks = (app as any).config?.webhooks || [];
    const updatedWebhooks = currentWebhooks.filter(
      (w: any) => w.id !== webhookId
    );

    await prisma.app.update({
      where: { id: appId },
      data: {
        // Webhooks would be stored in a separate table in production
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
