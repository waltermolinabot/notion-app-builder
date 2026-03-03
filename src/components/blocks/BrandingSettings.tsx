"use client";

import { useState } from "react";

interface BrandingSettingsProps {
  initialBranding?: {
    logo?: string;
    primaryColor?: string;
    font?: string;
  };
  onSave?: (branding: { logo?: string; primaryColor?: string; font?: string }) => void;
}

const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "poppins", label: "Poppins" },
];

const COLOR_PRESETS = [
  "#0F172A", // Slate
  "#2563EB", // Blue
  "#16A34A", // Green
  "#DC2626", // Red
  "#7C3AED", // Violet
  "#EA580C", // Orange
  "#0891B2", // Cyan
  "#BE185D", // Pink
];

export function BrandingSettings({ initialBranding = {}, onSave }: BrandingSettingsProps) {
  const [logo, setLogo] = useState(initialBranding.logo || "");
  const [primaryColor, setPrimaryColor] = useState(initialBranding.primaryColor || "#2563EB");
  const [font, setFont] = useState(initialBranding.font || "inter");
  const [customColor, setCustomColor] = useState(primaryColor);
  const [showCustom, setShowCustom] = useState(false);

  const handleSave = () => {
    onSave?.({ logo, primaryColor, font });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Logo</label>
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
              <button
                onClick={() => setLogo("")}
                className="absolute top-0 right-0 bg-white/80 px-1 py-0.5 text-xs text-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
              <span className="text-2xl">+</span>
            </div>
          )}
          <div>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="URL del logo"
              className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">URL pública de tu logo (PNG, SVG)</p>
          </div>
        </div>
      </div>

      {/* Color primario */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Color primario</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => { setPrimaryColor(color); setCustomColor(color); }}
              className={`h-8 w-8 rounded-full border-2 transition ${
                primaryColor === color ? "border-gray-900 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-100 to-gray-300"
          >
            +
          </button>
        </div>
        {showCustom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => { setCustomColor(e.target.value); setPrimaryColor(e.target.value); }}
              className="h-8 w-14 cursor-pointer rounded border border-gray-200"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => { setCustomColor(e.target.value); setPrimaryColor(e.target.value); }}
              className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm uppercase"
              placeholder="#000000"
            />
          </div>
        )}
      </div>

      {/* Previsualización */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Vista previa</label>
        <div
          className="rounded-lg border border-gray-200 p-4"
          style={{ fontFamily: font }}
        >
          <div className="flex items-center gap-3">
            {logo && <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />}
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              Nombre de tu app
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
          <button
            className="mt-3 rounded px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Botón de ejemplo
          </button>
        </div>
      </div>

      {/* Tipografía */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Tipografía</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Guardar branding
        </button>
      </div>
    </div>
  );
}
