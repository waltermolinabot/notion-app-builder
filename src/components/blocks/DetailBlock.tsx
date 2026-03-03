"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  Building,
  FileText,
  Edit,
  Copy,
  Check
} from "lucide-react";

interface DetailBlockProps {
  config: {
    title?: string;
    sections?: Array<{ 
      title: string; 
      fields: string[] | Array<{ name: string; label: string; type: string; required?: boolean; options?: string[] }> 
    }>;
  };
  appId: string;
  databaseId?: string;
  selectedRowId?: string;
}

export function DetailBlock({ config, appId, databaseId, selectedRowId }: DetailBlockProps) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRowId && databaseId) {
      fetchRow(selectedRowId);
    } else {
      // Fetch first row as preview
      if (databaseId) {
        fetchFirstRow();
      } else {
        setLoading(false);
      }
    }
  }, [selectedRowId, databaseId]);

  async function fetchRow(rowId: string) {
    try {
      const response = await fetch(`/api/notion/rows?databaseId=${databaseId}&noCache=true`);
      const data = await response.json();
      const foundRow = (data.rows || []).find((r: any) => r.id === rowId);
      setRow(foundRow);
    } catch (error) {
      console.error("Failed to fetch row:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFirstRow() {
    if (!databaseId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/notion/rows?databaseId=${databaseId}`);
      const data = await response.json();
      setRow(data.rows?.[0] || null);
    } catch (error) {
      console.error("Failed to fetch row:", error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  }

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

  if (!row) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Selecciona un elemento para ver los detalles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get fields from config
  type SectionType = { title: string; fields: (string | { name: string; label: string; type?: string; required?: boolean; options?: string[] })[] };
  
  const getFields = (section?: SectionType) => {
    if (!section || !Array.isArray(section.fields)) {
      return [];
    }
    return section.fields.map((f: any) => typeof f === "string" ? { name: f, label: f } : f);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{config.title || "Detalle"}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={row.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Notion
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={config.sections?.[0]?.title || "General"}>
          <TabsList className="w-full justify-start">
            {config.sections?.map((section, i) => (
              <TabsTrigger key={i} value={section.title}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.sections?.map((section, sectionIndex) => (
            <TabsContent key={sectionIndex} value={section.title} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFields(section).map((field) => (
                  <DetailField 
                    key={field.name}
                    field={field}
                    value={row.properties?.[field.name]}
                    onCopy={copyToClipboard}
                    copied={copied}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick actions */}
        <Separator className="my-6" />
        
        <div>
          <h4 className="font-medium mb-3">Acciones rápidas</h4>
          <div className="flex flex-wrap gap-2">
            {row.properties?.email && (
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Enviar email
              </Button>
            )}
            {row.properties?.phone && (
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            )}
            {row.properties?.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={row.properties.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visitar web
                </a>
              </Button>
            )}
            {row.properties?.company && (
              <Button variant="outline" size="sm">
                <Building className="h-4 w-4 mr-2" />
                Ver empresa
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DetailFieldProps {
  field: { name: string; label: string };
  value: any;
  onCopy: (value: string) => void;
  copied: string | null;
}

function DetailField({ field, value, onCopy, copied }: DetailFieldProps) {
  // Determine icon based on field name
  const getIcon = () => {
    const name = field.name.toLowerCase();
    if (name.includes("email")) return <Mail className="h-4 w-4" />;
    if (name.includes("phone") || name.includes("telefono")) return <Phone className="h-4 w-4" />;
    if (name.includes("date") || name.includes("fecha")) return <Calendar className="h-4 w-4" />;
    if (name.includes("name") || name.includes("nombre")) return <User className="h-4 w-4" />;
    if (name.includes("company") || name.includes("empresa")) return <Building className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="secondary">Sí</Badge>
      ) : (
        <Badge variant="outline">No</Badge>
      );
    }

    if (Array.isArray(value)) {
      if (value.length > 0 && value[0]?.url) {
        return (
          <div className="flex flex-col gap-1">
            {value.map((file: any, i: number) => (
              <a 
                key={i}
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                {file.name}
              </a>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item: string, i: number) => (
            <Badge key={i} variant="outline">{item}</Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      if (value.name) {
        return <Badge variant="outline">{value.name}</Badge>;
      }
      if (value.start) {
        const date = new Date(value.start);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
      return String(value);
    }

    // Check if it's a URL
    if (String(value).startsWith("http")) {
      return (
        <a 
          href={String(value)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center gap-1"
        >
          {String(value)}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    return String(value);
  };

  const stringValue = String(value || "");
  const canCopy = stringValue.length > 0 && stringValue.length < 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {getIcon()}
        </span>
        <Label className="text-sm text-muted-foreground">
          {field.label}
        </Label>
        {canCopy && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 ml-auto"
            onClick={() => onCopy(stringValue)}
          >
            {copied === stringValue ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      <div className="text-sm pl-6">
        {renderValue()}
      </div>
    </div>
  );
}

export default DetailBlock;
