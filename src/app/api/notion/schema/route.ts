import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/utils";
import { getDatabaseSchema, mapNotionTypeToAppType } from "@/lib/notion/schema";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const databaseId = searchParams.get("databaseId");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!databaseId) {
      return NextResponse.json(
        { error: "Database ID is required" },
        { status: 400 }
      );
    }

    // Get user's Notion data source
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        userId,
        type: "notion",
        connected: true,
      },
    });

    if (!dataSource || !dataSource.notionAccessToken) {
      return NextResponse.json(
        { error: "Notion not connected" },
        { status: 400 }
      );
    }

    const accessToken = decrypt(dataSource.notionAccessToken);
    const schema = await getDatabaseSchema(accessToken, databaseId);

    // Map Notion types to app types
    const mappedSchema = {
      ...schema,
      fields: schema.fields.map((field) => ({
        ...field,
        appType: mapNotionTypeToAppType(field.type),
      })),
    };

    return NextResponse.json({ schema: mappedSchema });
  } catch (error) {
    console.error("Get schema error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schema" },
      { status: 500 }
    );
  }
}

// Save schema mapping
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { databaseId, fieldMappings, appId } = body;

    if (!databaseId) {
      return NextResponse.json(
        { error: "Database ID is required" },
        { status: 400 }
      );
    }

    // Get or create data source
    let dataSource = await prisma.dataSource.findFirst({
      where: {
        userId,
        type: "notion",
      },
    });

    if (!dataSource) {
      return NextResponse.json(
        { error: "No Notion connection found" },
        { status: 400 }
      );
    }

    // Save or update NotionDatabase with schema
    const notionDatabase = await prisma.notionDatabase.upsert({
      where: {
        id: databaseId, // This might need to be created first
      },
      create: {
        notionId: databaseId,
        name: "Database", // Will be updated
        dataSourceId: dataSource.id,
        schema: fieldMappings || {},
      },
      update: {
        schema: fieldMappings || {},
      },
    });

    return NextResponse.json({ database: notionDatabase });
  } catch (error) {
    console.error("Save schema error:", error);
    return NextResponse.json(
      { error: "Failed to save schema" },
      { status: 500 }
    );
  }
}
