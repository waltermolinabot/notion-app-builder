"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Globe, Lock, Check } from "lucide-react";

interface ShareSettingsProps {
  appId: string;
  initialData?: {
    name: string;
    slug: string;
    isPublic: boolean;
    published: boolean;
    hasPassword: boolean;
    publicAccessToken?: string;
  };
}

export function ShareSettings({ appId, initialData }: ShareSettingsProps) {
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accessToken, setAccessToken] = useState(initialData?.publicAccessToken);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${initialData?.slug || ""}`;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic,
          password: password || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.publicAccessToken);
      }
    } catch (error) {
      console.error("Error saving share settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic,
          generateNewToken: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.publicAccessToken);
      }
    } catch (error) {
      console.error("Error generating token:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            Compartir aplicación
          </CardTitle>
          <CardDescription>
            Configura quién puede acceder a tu aplicación públicamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Acceso público</p>
              <p className="text-sm text-muted-foreground">
                Permite que cualquiera acceda a tu app sin autenticación
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <>
              {/* Public URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">URL pública</label>
                <div className="flex gap-2">
                  <Input
                    value={publicUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password protection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña (opcional)</label>
                <Input
                  type="password"
                  placeholder="Dejar vacío para sin contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Protege el acceso con una contraseña
                </p>
              </div>

              {/* Access Token */}
              {accessToken && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Token de acceso</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateNewToken}
                      disabled={loading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerar
                    </Button>
                  </div>
                  <Input
                    value={accessToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa este token para acceder vía API
                  </p>
                </div>
              )}

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <Badge variant={isPublic ? "default" : "secondary"}>
                  {isPublic ? "Público" : "Privado"}
                </Badge>
                {initialData?.published && (
                  <Badge variant="outline">Publicado</Badge>
                )}
              </div>
            </>
          )}

          {/* Save button */}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
