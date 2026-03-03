import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/[slug]
 * Get public app by slug (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get("token");
    const password = searchParams.get("password");

    // Find app by slug
    const app = await prisma.app.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        blocks: {
          orderBy: { position: "asc" },
        },
        dataSources: {
          where: { connected: true },
          include: {
            notionDatabases: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if app is public
    if (!app.isPublic && !app.published) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check password protection
    if (app.publicPassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required", requiresPassword: true },
          { status: 401 }
        );
      }
      // Simple password check (in production, use proper hashing)
      if (app.publicPassword !== password) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Check token access
    if (app.publicAccessToken && accessToken !== app.publicAccessToken) {
      // If token is required but not provided or invalid
      if (!app.isPublic && !app.published) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Track analytics (async, don't await)
    prisma.appAnalytics
      .create({
        data: {
          appId: app.id,
          eventType: "page_view",
          metadata: {
            slug,
            userAgent: request.headers.get("user-agent"),
          },
        },
      })
      .catch(console.error);

    // Return app data (excluding sensitive info)
    return NextResponse.json({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
      logo: app.logo,
      primaryColor: app.primaryColor,
      blocks: app.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        position: block.position,
        config: block.config,
      })),
      dataSources: app.dataSources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        notionDatabases: ds.notionDatabases.map((db) => ({
          id: db.id,
          name: db.name,
          icon: db.icon,
          schema: db.schema,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching public app:", error);
    return NextResponse.json(
      { error: "Failed to fetch app" },
      { status: 500 }
    );
  }
}
