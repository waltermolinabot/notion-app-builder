"use client";

import { useState } from "react";
import { EditorCanvas, Block } from "@/components/blocks";

export default function BuilderPage({ params }: { params: { appId: string } }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [appName, setAppName] = useState("Mi App");
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = async () => {
    // TODO: Save to DB via API
    // eslint-disable-next-line no-console
    console.log("Saving blocks:", blocks);
    alert("Configuración guardada (demo)");
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="text-lg font-semibold text-gray-900 outline-none hover:border-b hover:border-gray-300"
          />
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {previewMode ? "Editar" : "Vista previa"}
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </header>

      {/* Editor / Preview */}
      <main className="flex-1 overflow-hidden p-4">
        {previewMode ? (
          <div className="h-full rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">{appName}</h2>
            <p className="text-gray-500">Vista previa del portal - Coming soon</p>
          </div>
        ) : (
          <EditorCanvas
            initialBlocks={blocks}
            onChange={setBlocks}
          />
        )}
      </main>
    </div>
  );
}
