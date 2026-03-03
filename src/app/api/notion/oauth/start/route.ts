import { NextRequest, NextResponse } from "next/server";
import { getNotionAuthUrl } from "@/lib/notion/oauth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/oauth/callback`;
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    
    const authUrl = getNotionAuthUrl(redirectUri, state);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("OAuth start error:", error);
    return NextResponse.json(
      { error: "Failed to start OAuth flow" },
      { status: 500 }
    );
  }
}
