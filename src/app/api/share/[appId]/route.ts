import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * GET /api/share/[appId]
 * Get share settings for an app
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

    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        userId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isPublic: true,
        published: true,
        publicAccessToken: true,
        publicPassword: true,
      },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Don't expose password
    return NextResponse.json({
      ...app,
      hasPassword: !!app.publicPassword,
      publicPassword: undefined,
    });
  } catch (error) {
    console.error("Error getting share settings:", error);
    return NextResponse.json(
      { error: "Failed to get share settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/share/[appId]
 * Update share settings for an app
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isPublic, password, generateNewToken } = body;

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

    // Build update data
    const updateData: any = {
      isPublic: isPublic ?? false,
    };

    // Handle password
    if (password !== undefined) {
      updateData.publicPassword = password || null;
    }

    // Generate new token if requested
    if (generateNewToken) {
      updateData.publicAccessToken = randomBytes(32).toString("hex");
    } else if (!app.publicAccessToken) {
      // Generate initial token if doesn't exist
      updateData.publicAccessToken = randomBytes(32).toString("hex");
    }

    // Update published status if making public
    if (isPublic && !app.published) {
      updateData.published = true;
      updateData.publishedAt = new Date();
    }

    const updatedApp = await prisma.app.update({
      where: { id: appId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        isPublic: true,
        published: true,
        publicAccessToken: true,
      },
    });

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error("Error updating share settings:", error);
    return NextResponse.json(
      { error: "Failed to update share settings" },
      { status: 500 }
    );
  }
}
