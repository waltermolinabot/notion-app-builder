"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle2 } from "lucide-react";

interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
}

interface DatabaseSelectorProps {
  onSelect: (databaseId: string) => void;
  selectedDatabaseId?: string;
}

export function DatabaseSelector({ onSelect, selectedDatabaseId }: DatabaseSelectorProps) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notion/databases");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch databases");
      }
      
      setDatabases(data.databases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load databases");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading databases...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Database</CardTitle>
          <CardDescription>Choose a database from your Notion workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={fetchDatabases} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (databases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Database</CardTitle>
          <CardDescription>No databases found in your Notion workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create a database in Notion to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Select Database
        </CardTitle>
        <CardDescription>
          Choose a database from your Notion workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {databases.map((db) => (
            <Button
              key={db.id}
              variant={selectedDatabaseId === db.id ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => onSelect(db.id)}
            >
              <div className="flex items-center gap-3">
                {selectedDatabaseId === db.id && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="text-lg">{db.icon || "📄"}</span>
                <span>{db.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
