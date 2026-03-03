import { Client } from "@notionhq/client";

let notionClient: Client | null = null;

export function getNotionClient(accessToken: string): Client {
  return new Client({ auth: accessToken });
}

export async function testNotionConnection(accessToken: string): Promise<boolean> {
  try {
    const client = getNotionClient(accessToken);
    await client.users.me({});
    return true;
  } catch (error) {
    console.error("Notion connection test failed:", error);
    return false;
  }
}

// Notion OAuth URLs
export const NOTION_OAUTH_URL = "https://api.notion.com/v1/oauth/authorize";
export const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";

export function getNotionAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.NOTION_CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    owner: "user",
    state,
  });
  return `${NOTION_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  secret: string;
} | null> {
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;

    const response = await fetch(NOTION_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Token exchange error:", error);
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
} | null> {
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;

    const response = await fetch(NOTION_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Token refresh failed");
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}
