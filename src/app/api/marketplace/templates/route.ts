import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/templates
 * List marketplace templates (public)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      published: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { downloads: "desc" },
        { rating: "desc" },
      ],
      take: 50,
    });

    return NextResponse.json(
      templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
        category: t.category,
        downloads: t.downloads,
        rating: t.rating,
        featured: t.featured,
        createdAt: t.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching marketplace templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/templates
 * Create a new marketplace template (auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, category, blocks } = body;

    if (!name || !description || !blocks) {
      return NextResponse.json(
        { error: "name, description, and blocks are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create template
    const template = await prisma.template.create({
      data: {
        name,
        description,
        icon: icon || "📦",
        category: category || "custom",
        blocks: JSON.stringify(blocks),
        userId,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
