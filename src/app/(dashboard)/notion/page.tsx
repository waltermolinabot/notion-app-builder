"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";

// Helper to check if user is logged in
async function getUserId(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const data = await response.json();
      return data.userId;
    }
  } catch (e) {
    console.error("Error checking auth:", e);
  }
  return null;
}

export default function NotionIntegrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  useEffect(() => {
    async function checkUser() {
      try {
        const userId = await getUserId();
        if (!userId) {
          router.push("/sign-in");
          return;
        }
        setUserId(userId);
        
        // Check if user already has Notion connected (mock for now)
        // In production, check your database
        const storedConnection = localStorage.getItem(`notion_connection_${userId}`);
        if (storedConnection) {
          const conn = JSON.parse(storedConnection);
          setIsConnected(true);
          setWorkspaceName(conn.workspaceName || "Notion");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkUser();
  }, [router]);

  const handleConnect = async () => {
    if (!userId) return;
    
    setIsConnecting(true);
    try {
      // Redirect to OAuth start endpoint
      window.location.href = `/api/notion/oauth/start?userId=${userId}`;
    } catch (error) {
      console.error("Failed to start OAuth:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (!userId) return;
    localStorage.removeItem(`notion_connection_${userId}`);
    setIsConnected(false);
    setWorkspaceName("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Notion Integration</h1>
        <p className="text-slate-600 mt-1">Connect your Notion workspace to start building apps</p>
      </div>

      {isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Notion Connected
            </CardTitle>
            <CardDescription>
              Connected to workspace: {workspaceName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Your Notion workspace is connected. You can now select databases to use in your apps.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                viewBox="0 0 100 100"
                className="h-6 w-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.64 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
                  fill="#fff"
                />
                <path
                  d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.527 0.967 5.054 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.253 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.413 -1.937L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.357 -1.947l53.36 -3.887c4.467 -0.39 6.793 1.167 8.54 2.14l13.107 9.367c0.39 0.197 1.36 1.36 0.193 1.36l-54.833 3.307 -4.667 0.58zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.357 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.84v28.967l6.02 1.357s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.103 -4.473l14.367 -0.967 19.8 30.233v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.497 -3.893l13.107 -0.39z"
                  fill="#000"
                />
              </svg>
              Connect Notion
            </CardTitle>
            <CardDescription>
              Connect your Notion workspace to start building apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect with Notion
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
