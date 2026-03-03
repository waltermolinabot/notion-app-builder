import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchNotionDatabaseRows, fetchAllNotionRows } from "@/lib/notion/rows";
import { cacheKeys, CACHE_TTL, getCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/notion/rows?databaseId=xxx
 * Fetch rows from a Notion database
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("databaseId");
    const cursor = searchParams.get("cursor");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const syncAll = searchParams.get("syncAll") === "true";
    const noCache = searchParams.get("noCache") === "true";

    if (!databaseId) {
      return NextResponse.json(
        { error: "databaseId is required" },
        { status: 400 }
      );
    }

    // Get the data source with the Notion token
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        userId,
        connected: true,
        notionDatabases: {
          some: {
            notionId: databaseId,
          },
        },
      },
      include: {
        notionDatabases: {
          where: {
            notionId: databaseId,
          },
        },
      },
    });

    if (!dataSource || !dataSource.notionAccessToken) {
      return NextResponse.json(
        { error: "Data source not found or not connected" },
        { status: 404 }
      );
    }

    // Try to get from cache first (unless noCache is true)
    if (!noCache && !syncAll && !cursor) {
      const cachedKey = cacheKeys.rows(databaseId);
      const cache = getCache();
      const cached = cache.get<{ rows: any[]; nextCursor: string | null; hasMore: boolean }>(cachedKey);
      if (cached !== null) {
        return NextResponse.json({
          ...cached,
          cached: true,
        });
      }
    }

    // Fetch rows from Notion
    let result;
    if (syncAll) {
      const rows = await fetchAllNotionRows(
        dataSource.notionAccessToken,
        databaseId
      );
      result = {
        rows,
        nextCursor: null,
        hasMore: false,
        total: rows.length,
      };
    } else {
      result = await fetchNotionDatabaseRows(
        dataSource.notionAccessToken,
        databaseId,
        cursor || undefined,
        pageSize
      );
    }

    // Cache the result (only for first page without cursor)
    if (!noCache && !syncAll && !cursor) {
      const cacheKey = cacheKeys.rows(databaseId);
      const cache = getCache();
      cache.set(cacheKey, result, CACHE_TTL.rows);
    }

    // Update last sync timestamp
    await prisma.dataSource.update({
      where: { id: dataSource.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching Notion rows:", error);
    return NextResponse.json(
      { error: "Failed to fetch rows" },
      { status: 500 }
    );
  }
}
