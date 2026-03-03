"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "crm" | "internal" | "projects";
}

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando plantillas...</div>
      </div>
    );
  }

  const templatesByCategory = {
    crm: templates.filter((t) => t.category === "crm"),
    internal: templates.filter((t) => t.category === "internal"),
    projects: templates.filter((t) => t.category === "projects"),
  };

  const categoryLabels = {
    crm: "CRM & Ventas",
    internal: "Gestión Interna",
    projects: "Proyectos",
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Elige una plantilla</h2>
        <p className="text-muted-foreground">
          Selecciona una plantilla para comenzar más rápido
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="crm">{categoryLabels.crm}</TabsTrigger>
          <TabsTrigger value="internal">{categoryLabels.internal}</TabsTrigger>
          <TabsTrigger value="projects">{categoryLabels.projects}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={template.id === selectedTemplateId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === selectedTemplateId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  selected: boolean;
  onSelect: (templateId: string) => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  const categoryLabels = {
    crm: "CRM",
    internal: "Interno",
    projects: "Proyectos",
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? "border-primary ring-2 ring-primary/20" : ""
      }`}
      onClick={() => onSelect(template.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{template.icon}</span>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
            {categoryLabels[template.category]}
          </span>
        </div>
        <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{template.description}</CardDescription>
        {selected && (
          <Button className="w-full mt-4" size="sm">
            Seleccionada
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
