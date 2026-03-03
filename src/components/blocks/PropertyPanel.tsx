"use client";

import { Block, BlockField } from "./types";

interface PropertyPanelProps {
  block: Block;
  onUpdate: (config: Partial<Block["config"]>) => void;
  onClose: () => void;
}

export function PropertyPanel({ block, onUpdate, onClose }: PropertyPanelProps) {
  const updateTitle = (title: string) => onUpdate({ title });

  const addField = () => {
    const newField: BlockField = {
      key: `field_${Date.now()}`,
      label: "Nuevo campo",
      type: "text",
      required: false,
    };
    const currentFields = block.config.fields || [];
    onUpdate({ fields: [...currentFields, newField] });
  };

  const updateField = (fieldKey: string, updates: Partial<BlockField>) => {
    const currentFields = block.config.fields || [];
    const updated = currentFields.map((f) => (f.key === fieldKey ? { ...f, ...updates } : f));
    onUpdate({ fields: updated });
  };

  const removeField = (fieldKey: string) => {
    const currentFields = block.config.fields || [];
    onUpdate({ fields: currentFields.filter((f) => f.key !== fieldKey) });
  };

  const renderFieldConfig = (field: BlockField) => (
    <div key={field.key} className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={field.label}
          onChange={(e) => updateField(field.key, { label: e.target.value })}
          className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm"
          placeholder="Label"
        />
        <button
          onClick={() => removeField(field.key)}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value={field.type}
          onChange={(e) => updateField(field.key, { type: e.target.value as BlockField["type"] })}
          className="rounded border border-gray-200 px-2 py-1 text-xs"
        >
          <option value="text">Texto</option>
          <option value="number">Número</option>
          <option value="date">Fecha</option>
          <option value="select">Selección</option>
          <option value="relation">Relación</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => updateField(field.key, { required: e.target.checked })}
            className="rounded"
          />
          Requerido
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-80 border-l border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Propiedades</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Título del bloque */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Título</label>
          <input
            type="text"
            value={block.config.title || ""}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Título del bloque"
          />
        </div>

        {/* Configuraciones específicas por tipo de bloque */}
        {block.type === "table" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Configuración de tabla</label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={block.config.sortable || false}
                onChange={(e) => onUpdate({ sortable: e.target.checked })}
                className="rounded"
              />
              Ordenable
            </label>
          </div>
        )}

        {block.type === "cards" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Layout</label>
            <select
              value={block.config.cardLayout || "grid"}
              onChange={(e) => onUpdate({ cardLayout: e.target.value as "grid" | "list" })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="grid">Grid</option>
              <option value="list">Lista</option>
            </select>
          </div>
        )}

        {block.type === "form" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Acción al enviar</label>
            <select
              value={block.config.submitAction || "create"}
              onChange={(e) => onUpdate({ submitAction: e.target.value as "create" | "update" })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="create">Crear registro</option>
              <option value="update">Actualizar registro</option>
            </select>
          </div>
        )}

        {/* Campos */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500">Campos</label>
            <button
              onClick={addField}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Añadir campo
            </button>
          </div>
          <div className="space-y-2">
            {(block.config.fields || []).map(renderFieldConfig)}
          </div>
        </div>
      </div>
    </div>
  );
}
