"use client";

import { useState, useEffect } from "react";
import type { Block } from "./types";

interface AppConfig {
  id: string;
  name: string;
  blocks: Block[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    font?: string;
  };
}

interface PortalRuntimeProps {
  appId: string;
}

export function PortalRuntime({ appId }: PortalRuntimeProps) {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await fetch(`/api/runtime/${appId}`);
        if (!res.ok) throw new Error("App no encontrada");
        const data = await res.json();
        setAppConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [appId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!appConfig) return null;
  
  const { name, blocks, branding } = appConfig;
  const primaryColor = branding?.primaryColor || "#2563EB";

  // Demo data for visualization
  const demoData = [
    { id: 1, name: "Acme Corp", email: "contacto@acme.com", status: "Activo" },
    { id: 2, name: "TechStart", email: "hello@techstart.io", status: "Activo" },
    { id: 3, name: "Global Inc", email: "info@global.com", status: "Inactivo" },
  ];

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "table":
        return (
          <div key={block.id} className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {demoData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{item.email}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        item.status === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <button
                        onClick={() => { setSelectedItem(item); setView("detail"); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "detail":
        if (!selectedItem) return <div className="text-gray-500">Selecciona un elemento</div>;
        return (
          <div key={block.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detalles</h3>
              <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700">
                ← Volver
              </button>
            </div>
            <dl className="divide-y divide-gray-200">
              {Object.entries(selectedItem).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2">
                  <dt className="font-medium text-gray-500">{key}</dt>
                  <dd className="text-gray-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        );

      case "form":
        return (
          <div key={block.id} className="max-w-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nuevo registro</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Enviado (demo)"); }}>
              {block.config.fields?.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field.label} {field.required && "*"}
                  </label>
                  {field.type === "select" ? (
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
                      {field.options?.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      required={field.required}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full rounded-lg py-2 font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Enviar
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: branding?.font || "inter" }}>
      {/* Header */}
      <header className="bg-white shadow-sm" style={{ borderTop: `4px solid ${primaryColor}` }}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-3">
            {branding?.logo && (
              <img src={branding.logo} alt={name} className="h-8 w-8 object-contain" />
            )}
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation tabs */}
        {blocks.length > 1 && (
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            {blocks.map((block, i) => (
              <button
                key={block.id}
                className={`px-4 py-2 text-sm font-medium transition ${
                  i === 0 ? "border-b-2 text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ borderColor: i === 0 ? primaryColor : "transparent" }}
              >
                {block.config.title}
              </button>
            ))}
          </div>
        )}

        {/* Block content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {blocks.map(renderBlock)}
        </div>
      </main>
    </div>
  );
}
