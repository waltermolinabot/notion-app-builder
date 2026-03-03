"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Star, ExternalLink } from "lucide-react";

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  downloads: number;
  rating: number;
  featured: boolean;
}

interface TemplateMarketplaceProps {
  onSelectTemplate?: (template: MarketplaceTemplate) => void;
  mode?: "browse" | "publish";
}

export function TemplateMarketplace({ onSelectTemplate, mode = "browse" }: TemplateMarketplaceProps) {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [category, search]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/marketplace/templates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "Todos" },
    { value: "crm", label: "CRM" },
    { value: "internal", label: "Interno" },
    { value: "projects", label: "Proyectos" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="publish">Publicar</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Templates grid */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron templates
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{template.icon}</div>
                      {template.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {template.rating.toFixed(1)}
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="publish">
          <PublishTemplateForm onSuccess={() => fetchTemplates()} />
        </TabsContent>
      </Tabs>

      {/* Template detail modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-4xl">{selectedTemplate.icon}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ×
                </Button>
              </div>
              <CardTitle className="mt-2">{selectedTemplate.name}</CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {selectedTemplate.downloads} descargas
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {selectedTemplate.rating.toFixed(1)} rating
                </div>
              </div>
              <Badge>{selectedTemplate.category}</Badge>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  onSelectTemplate?.(selectedTemplate);
                  setSelectedTemplate(null);
                }}
              >
                Usar template
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`/templates/${selectedTemplate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver detalle
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function PublishTemplateForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📦",
    category: "custom",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        setFormData({ name: "", description: "", icon: "📦", category: "custom" });
      }
    } catch (error) {
      console.error("Error publishing template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar template</CardTitle>
        <CardDescription>
          Comparte tu template con la comunidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mi Template"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="w-full px-3 py-2 rounded-md border bg-background min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu template..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Icono</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📦"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
              >
                <option value="crm">CRM</option>
                <option value="internal">Interno</option>
                <option value="projects">Proyectos</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Publicando..." : "Publicar template"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
