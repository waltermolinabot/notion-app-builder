"use client";

import { useState, useCallback } from "react";
import { Block, BlockType } from "./types";
import { TableBlock } from "./TableBlock";
import { CardsBlock } from "./CardsBlock";
import { DetailBlock } from "./DetailBlock";
import { FormBlock } from "./FormBlock";

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "table", label: "Tabla", icon: "📊" },
  { type: "cards", label: "Cards", icon: "▦" },
  { type: "detail", label: "Detalle", icon: "📄" },
  { type: "form", label: "Formulario", icon: "📝" },
];

interface EditorCanvasProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export function EditorCanvas({ initialBlocks = [], onChange, readOnly = false }: EditorCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || readOnly) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: draggedType,
      config: {
        dataSourceId: "",
        title: `Nuevo ${draggedType}`,
        fields: [],
      },
    };

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onChange?.(updated);
    setDraggedType(null);
  }, [draggedType, blocks, onChange, readOnly]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateBlock = (id: string, config: Partial<Block["config"]>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, config: { ...b.config, ...config } } : b));
    setBlocks(updated);
    onChange?.(updated);
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    onChange?.(updated);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updated = [...blocks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setBlocks(updated);
    onChange?.(updated);
  };

  const renderBlock = (block: Block) => {
    // Preview placeholder - real blocks need proper config mapping
    return (
      <div key={block.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium uppercase text-gray-600">
            {block.type}
          </span>
          <span className="font-medium text-gray-900">{block.config.title || "Sin título"}</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Vista previa del bloque - configura las propiedades en el panel
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar de bloques */}
      {!readOnly && (
        <div className="w-56 shrink-0 rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Bloques</h3>
          <div className="space-y-2">
            {BLOCK_TYPES.map(({ type, label, icon }) => (
              <div
                key={type}
                draggable
                onDragStart={() => setDraggedType(type)}
                onDragEnd={() => setDraggedType(null)}
                className="flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-sm transition hover:bg-gray-100 active:cursor-grabbing"
              >
                <span>{icon}</span>
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas principal */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 min-h-[500px]"
      >
        {blocks.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Arrastra bloques aquí para construir tu app
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={`relative rounded-lg border bg-white p-4 shadow-sm transition ${
                  selectedBlockId === block.id ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
                }`}
                onClick={() => setSelectedBlockId(block.id)}
              >
                {/* Acciones del bloque */}
                {!readOnly && (
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, Math.max(0, index - 1)); }}
                      disabled={index === 0}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, Math.min(blocks.length - 1, index + 1)); }}
                      disabled={index === blocks.length - 1}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                      className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                )}
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
