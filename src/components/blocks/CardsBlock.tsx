"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  RefreshCw,
  Grid3X3,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Calendar
} from "lucide-react";

interface CardsBlockProps {
  config: {
    title?: string;
    databaseId?: string;
    fields?: string[];
    imageField?: string;
    numColumns?: number;
  };
  appId: string;
}

export function CardsBlock({ config, appId }: CardsBlockProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const numColumns = config.numColumns || 3;

  useEffect(() => {
    fetchRows();
  }, [config.databaseId]);

  async function fetchRows() {
    if (!config.databaseId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/notion/rows?databaseId=${config.databaseId}&syncAll=true`);
      const data = await response.json();
      setRows(data.rows || []);
    } catch (error) {
      console.error("Failed to fetch rows:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter rows
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return Object.values(row.properties || {}).some(
      (val) => String(val).toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedCard) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
              ← Volver
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={selectedCard.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Notion
              </a>
            </Button>
          </div>
          <CardTitle className="text-xl">
            {selectedCard.properties?.name || 
             selectedCard.properties?.title || 
             "Detalle"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.fields?.map((field) => (
              <div key={field}>
                <Label className="text-muted-foreground text-sm">{field}</Label>
                <div className="mt-1">
                  {renderFieldValue(selectedCard.properties?.[field])}
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-4">Acciones rápidas</h4>
            <div className="flex gap-2">
              {selectedCard.properties?.email && (
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar email
                </Button>
              )}
              {selectedCard.properties?.phone && (
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
              )}
              {selectedCard.properties?.date && (
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{config.title || "Tarjetas"}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchRows}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos para mostrar
          </div>
        ) : (
          <div 
            className="grid gap-4"
            style={{ 
              gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` 
            }}
          >
            {filteredRows.map((row) => (
              <Card 
                key={row.id} 
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedCard(row)}
              >
                {config.imageField && row.properties?.[config.imageField]?.[0]?.url && (
                  <div className="h-32 overflow-hidden rounded-t-lg">
                    <img 
                      src={row.properties[config.imageField][0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {config.fields?.slice(0, 4).map((field) => (
                      <div key={field} className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[80px]">
                          {field}:
                        </span>
                        <span className="text-sm line-clamp-1">
                          {renderFieldValue(row.properties?.[field])}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalle <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Render field value based on type
 */
function renderFieldValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (typeof value === "boolean") {
    return value ? (
      <Badge variant="secondary">Activo</Badge>
    ) : (
      <Badge variant="outline">Inactivo</Badge>
    );
  }

  if (Array.isArray(value)) {
    if (value.length > 0 && value[0]?.url) {
      // Files
      return (
        <div className="flex gap-1">
          {value.map((file: any, i: number) => (
            <a 
              key={i}
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {file.name}
            </a>
          ))}
        </div>
      );
    }
    return value.join(", ");
  }

  if (typeof value === "object") {
    if (value.name) {
      return (
        <Badge variant="outline">{value.name}</Badge>
      );
    }
    return String(value);
  }

  return String(value);
}

export default CardsBlock;
