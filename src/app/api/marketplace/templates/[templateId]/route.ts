import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/templates/[templateId]
 * Get a specific template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // If not published, only owner can view
    const { userId } = await auth();
    if (!template.published && userId !== template.userId) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      blocks: template.blocks,
      downloads: template.downloads,
      rating: template.rating,
      published: template.published,
      featured: template.featured,
      createdAt: template.createdAt,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/templates/[templateId]
 * Update a template (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, category, blocks, published, featured } = body;

    const updatedTemplate = await prisma.template.update({
      where: { id: templateId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(category && { category }),
        ...(blocks && { blocks: JSON.stringify(blocks) }),
        ...(published !== undefined && { published }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/templates/[templateId]
 * Delete a template (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
