import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/utils";
import { getWorkspaceDatabases } from "@/lib/notion/databases";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const databases = await getWorkspaceDatabases(
      accessToken,
      dataSource.notionWorkspaceId || ""
    );

    return NextResponse.json({ databases });
  } catch (error) {
    console.error("Get databases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch databases" },
      { status: 500 }
    );
  }
}
