"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

interface TableBlockProps {
  config: {
    title?: string;
    databaseId?: string;
    columns?: Array<{ field: string; label: string; width?: string }>;
    sortable?: boolean;
    searchable?: boolean;
    pagination?: boolean;
    pageSize?: number;
  };
  appId: string;
}

export function TableBlock({ config, appId }: TableBlockProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  const pageSize = config.pageSize || 25;

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

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a.properties?.[sortField];
    const bVal = b.properties?.[sortField];
    
    if (aVal === bVal) return 0;
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function handleSort(field: string) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  async function handleExport(format: "json" | "csv") {
    const response = await fetch(
      `/api/notion/export?databaseId=${config.databaseId}&format=${format}`
    );
    
    if (format === "csv") {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${config.databaseId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${config.databaseId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{config.title || "Tabla"}</CardTitle>
          <div className="flex items-center gap-2">
            {config.searchable && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Exportar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={fetchRows}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode("table")}>
                  Vista de tabla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("cards")}>
                  Vista de tarjetas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "table" ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {config.columns?.map((col) => (
                      <TableHead
                        key={col.field}
                        style={{ width: col.width }}
                        className={config.sortable ? "cursor-pointer select-none" : ""}
                        onClick={() => config.sortable && handleSort(col.field)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.field && (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={(config.columns?.length || 0) + 1}
                        className="text-center text-muted-foreground"
                      >
                        No hay datos
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((row) => (
                      <TableRow key={row.id}>
                        {config.columns?.map((col) => (
                          <TableCell key={col.field}>
                            {renderCellValue(row.properties?.[col.field])}
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {config.pagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, sortedRows.length)} de{" "}
                  {sortedRows.length} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRows.map((row) => (
              <Card key={row.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  {config.columns?.slice(0, 3).map((col) => (
                    <div key={col.field} className="mb-2">
                      <Label className="text-xs text-muted-foreground">
                        {col.label}
                      </Label>
                      <div className="text-sm">
                        {renderCellValue(row.properties?.[col.field])}
                      </div>
                    </div>
                  ))}
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
 * Render cell value based on type
 */
function renderCellValue(value: any): React.ReactNode {
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
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <Badge key={i} variant="outline">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </Badge>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return <span>{value.name || JSON.stringify(value)}</span>;
  }

  return <span>{String(value)}</span>;
}

export default TableBlock;
