import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getNotionClient } from "@/lib/notion/oauth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_failed`
      );
    }

    // Decode state to get userId
    let userId: string;
    try {
      const decodedState = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      userId = decodedState.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state`
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/oauth/callback`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    if (!tokenData) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
      );
    }

    // Get workspace info
    const notion = getNotionClient(tokenData.access_token);
    const user = await notion.users.me({});

    // Encrypt the access token before storing
    const encryptedToken = encrypt(tokenData.access_token);

    // Save or update data source
    await prisma.dataSource.upsert({
      where: {
        id: userId, // We'll use userId as base, but create proper unique constraint
      },
      create: {
        userId,
        name: user.name || "Notion Workspace",
        type: "notion",
        notionAccessToken: encryptedToken,
        notionWorkspaceId: user.id,
        notionWorkspaceName: user.name || "Notion",
        connected: true,
      },
      update: {
        notionAccessToken: encryptedToken,
        notionWorkspaceId: user.id,
        notionWorkspaceName: user.name || "Notion",
        connected: true,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=notion_connected`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_error`
    );
  }
}
