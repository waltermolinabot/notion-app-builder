"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Save } from "lucide-react";

type NotionFieldType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "files"
  | "people"
  | "relation"
  | "rollup"
  | "formula"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by";

interface NotionField {
  id: string;
  name: string;
  type: NotionFieldType;
  options?: string[];
  isPrimary?: boolean;
  appType?: string;
}

interface SchemaMappingProps {
  databaseId: string;
  onComplete?: () => void;
}

export function SchemaMapping({ databaseId, onComplete }: SchemaMappingProps) {
  const [fields, setFields] = useState<NotionField[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, { displayName: string; type: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (databaseId) {
      fetchSchema();
    }
  }, [databaseId]);

  const fetchSchema = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notion/schema?databaseId=${databaseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch schema");
      }
      
      const schema = data.schema;
      setFields(schema.fields || []);
      
      // Initialize mappings with default values
      const initialMappings: Record<string, { displayName: string; type: string }> = {};
      schema.fields.forEach((field: NotionField) => {
        initialMappings[field.id] = {
          displayName: field.name,
          type: field.appType || "text",
        };
      });
      setFieldMappings(initialMappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schema");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapping = (fieldId: string, key: "displayName" | "type", value: string) => {
    setFieldMappings((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/notion/schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseId,
          fieldMappings,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save schema");
      }
      
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schema");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading schema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schema Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Fields</CardTitle>
        <CardDescription>
          Configure how each Notion field appears in your app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <div className="flex-1">
              <Label className="text-sm font-medium">
                Notion Field
              </Label>
              <p className="text-sm text-muted-foreground">
                {field.name}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {field.type}
                </span>
                {field.isPrimary && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </p>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex-1 space-y-2">
              <Label htmlFor={`name-${field.id}`}>Display Name</Label>
              <Input
                id={`name-${field.id}`}
                value={fieldMappings[field.id]?.displayName || ""}
                onChange={(e) => updateMapping(field.id, "displayName", e.target.value)}
                placeholder="Field display name"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <Label htmlFor={`type-${field.id}`}>App Type</Label>
              <select
                id={`type-${field.id}`}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={fieldMappings[field.id]?.type || "text"}
                onChange={(e) => updateMapping(field.id, "type", e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-select</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="file">File</option>
                <option value="user">User</option>
                <option value="relation">Relation</option>
              </select>
            </div>
          </div>
        ))}
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Schema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
