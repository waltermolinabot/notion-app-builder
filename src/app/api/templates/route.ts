import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTemplateById } from "@/lib/templates";

/**
 * POST /api/templates
 * Create an app from a template
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, name, slug, description, dataSourceId, databaseId } = body;

    if (!templateId || !name || !slug) {
      return NextResponse.json(
        { error: "templateId, name, and slug are required" },
        { status: 400 }
      );
    }

    // Get the template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if slug is already taken
    const existingApp = await prisma.app.findUnique({
      where: { slug },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "Slug already taken" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user if doesn't exist (should exist from Clerk webhook)
      await prisma.user.create({
        data: {
          id: userId,
          email: body.email || `${userId}@example.com`,
        },
      });
    }

    // Create the app with blocks from template
    const app = await prisma.app.create({
      data: {
        name,
        slug,
        description: description || template.description,
        userId,
        blocks: {
          create: template.blocks.map((block) => ({
            type: block.type,
            position: block.position,
            config: {
              ...block.config,
              // Override databaseId if provided
              ...(databaseId && { databaseId }),
            },
          })),
        },
      },
      include: {
        blocks: true,
      },
    });

    // If dataSourceId provided, link it to the app
    if (dataSourceId) {
      await prisma.dataSource.update({
        where: { id: dataSourceId },
        data: { appId: app.id },
      });
    }

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error creating app from template:", error);
    return NextResponse.json(
      { error: "Failed to create app" },
      { status: 500 }
    );
  }
}
