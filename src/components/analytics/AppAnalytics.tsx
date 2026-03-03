"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, MousePointer, TrendingUp, Calendar } from "lucide-react";

interface AnalyticsData {
  period: string;
  summary: {
    totalEvents: number;
    uniqueVisitors: number;
    eventsByType: Array<{
      eventType: string;
      count: number;
    }>;
  };
  periodStart: string;
  periodEnd: string;
}

interface AppAnalyticsProps {
  appId: string;
}

export function AppAnalytics({ appId }: AppAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${appId}?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return <Eye className="h-4 w-4" />;
      case "row_view":
        return <Eye className="h-4 w-4" />;
      case "form_submit":
        return <MousePointer className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return "Vistas de página";
      case "row_view":
        return "Vistas de registro";
      case "form_submit":
        return "Envíos de formulario";
      default:
        return eventType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          {["24h", "7d", "30d", "90d"].map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Cargando analytics...
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de eventos</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  {analytics.summary.totalEvents}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Visitantes únicos</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  {analytics.summary.uniqueVisitors}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Período</CardDescription>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(analytics.periodStart)} - {formatDate(analytics.periodEnd)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Events breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos por tipo</CardTitle>
              <CardDescription>
                Desglose de las interacciones en tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.summary.eventsByType.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hay datos de analytics todavía
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.summary.eventsByType.map((event) => (
                    <div
                      key={event.eventType}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-background">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {getEventLabel(event.eventType)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.eventType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{event.count}</p>
                        <p className="text-xs text-muted-foreground">
                          {((event.count / analytics.summary.totalEvents) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Track custom event */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo trackear eventos</CardTitle>
              <CardDescription>
                Añade tracking a tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fetch">
                <TabsList>
                  <TabsTrigger value="fetch">fetch</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="fetch">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`fetch('/api/analytics/${appId}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'page_view',
    metadata: { page: '/dashboard' }
  })
})`}
                  </pre>
                </TabsContent>
                <TabsContent value="javascript">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Track page views
await fetch('/api/analytics/${appId}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'page_view',
    metadata: { 
      page: window.location.pathname,
      title: document.title 
    }
  })
})`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se pudo cargar analytics
          </CardContent>
        </Card>
      )}
    </div>
  );
}
