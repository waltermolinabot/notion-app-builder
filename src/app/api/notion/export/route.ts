import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notion/export?databaseId=xxx&format=json|csv
 * Export data from a Notion database
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("databaseId");
    const format = searchParams.get("format") || "json";
    const appId = searchParams.get("appId");

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

    // Fetch all rows from Notion
    const { fetchAllNotionRows } = await import("@/lib/notion/rows");
    const rows = await fetchAllNotionRows(
      dataSource.notionAccessToken,
      databaseId
    );

    // Get database schema for column names
    const notionDatabase = dataSource.notionDatabases[0];
    const schema = notionDatabase?.schema as Record<string, any> || {};

    if (format === "csv") {
      // Convert to CSV
      if (rows.length === 0) {
        return new NextResponse("", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="export-${databaseId}.csv"`,
          },
        });
      }

      const headers = Object.keys(rows[0].properties || {});
      const csvRows = [
        headers.join(","),
        ...rows.map((row: any) => 
          headers.map((h) => {
            const val = row.properties?.[h];
            const str = JSON.stringify(val || "");
            return str.includes(",") || str.includes('"') 
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(",")
        ),
      ];

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="export-${databaseId}.csv"`,
        },
      });
    }

    // Default: JSON format
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      databaseId,
      databaseName: notionDatabase?.name,
      totalRows: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notion/import
 * Import data into a Notion database
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { databaseId, data, mode = "create" } = body;

    if (!databaseId || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "databaseId and data array are required" },
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
    });

    if (!dataSource || !dataSource.notionAccessToken) {
      return NextResponse.json(
        { error: "Data source not found or not connected" },
        { status: 404 }
      );
    }

    // Import rows to Notion
    const { createNotionRow } = await import("@/lib/notion/rows");
    
    const results = await Promise.allSettled(
      data.map((row: Record<string, any>) => 
        createNotionRow(dataSource.notionAccessToken!, databaseId, row)
      )
    );

    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({
      imported: successful,
      failed,
      total: data.length,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
