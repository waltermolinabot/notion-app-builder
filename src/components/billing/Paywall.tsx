"use client";

import { useState, useEffect } from "react";

interface PaywallProps {
  feature: string;
  currentPlan: string;
  onUpgrade?: () => void;
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "1 app",
    "100 registros",
    "3 usuarios",
    "Soporte por email",
  ],
  pro: [
    "10 apps",
    "10,000 registros",
    "50 usuarios",
    "Apps publicadas",
    "Dominio custom",
    "Soporte prioritario",
  ],
  agency: [
    "100 apps",
    "100,000 registros",
    "500 usuarios",
    "Apps ilimitadas",
    "Multi-dominio",
    "Soporte dedicado",
    "API access",
  ],
};

export function Paywall({ feature, currentPlan, onUpgrade }: PaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (targetPlan: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setLoading(false);
    }
  };

  const planOrder = ["free", "pro", "agency"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const nextPlan = currentIndex < 2 ? planOrder[currentIndex + 1] : null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Función no disponible en tu plan</h3>
          <p className="mt-1 text-sm text-amber-700">
            <strong>{feature}</strong> requiere el plan {nextPlan || "Super Agency"}.
          </p>

          {/* Current plan features */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Tu plan actual ({currentPlan})</p>
            <ul className="mt-2 space-y-1">
              {PLAN_FEATURES[currentPlan]?.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-amber-700">
                  <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade CTA */}
          {nextPlan && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
                Con {nextPlan} también obtienes:
              </p>
              <ul className="mt-1 space-y-1">
                {PLAN_FEATURES[nextPlan]
                  ?.filter((f) => !PLAN_FEATURES[currentPlan]?.includes(f))
                  .slice(0, 3)
                  .map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-amber-700">
                      <span className="text-amber-500">+</span> {f}
                    </li>
                  ))}
              </ul>
              <button
                onClick={() => handleUpgrade(nextPlan)}
                disabled={loading}
                className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Redirect..." : `Upgrade a ${nextPlan}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Usage warning component
export function UsageWarning({ usage, limits }: { usage: number; limits: number }) {
  const percentage = (usage / limits) * 100;
  
  if (percentage < 80) return null;
  
  const variant = percentage >= 100 ? "error" : "warning";
  const colors = variant === "error" 
    ? "bg-red-50 border-red-200 text-red-700" 
    : "bg-yellow-50 border-yellow-200 text-yellow-700";

  return (
    <div className={`rounded-lg border p-4 ${colors}`}>
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-medium">
          {variant === "error" ? "Límite alcanzado" : "Casi llegas al límite"}
        </span>
      </div>
      <p className="mt-1 text-sm">
        Has usado {usage} de {limits} ({percentage.toFixed(0)}%). Considere hacer upgrade.
      </p>
    </div>
  );
}
