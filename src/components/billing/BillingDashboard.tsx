"use client";

import { useState, useEffect } from "react";
import { UsageWarning, Paywall } from "@/components/billing/Paywall";

interface Subscription {
  plan: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Usage {
  apps: number;
  users: number;
  records: number;
  publishedApps: number;
}

interface Limits {
  apps: number;
  users: number;
  records: number;
  publishedApps: number;
}

export function BillingDashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subRes, limitsRes] = await Promise.all([
          fetch("/api/billing/subscription"),
          fetch("/api/billing/limits"),
        ]);
        const subData = await subRes.json();
        const limitsData = await limitsRes.json();
        
        setSubscription(subData);
        setUsage(limitsData.usage);
      } catch (error) {
        console.error("Error loading billing:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const plan = subscription?.plan || "free";
  const limits: Limits = { apps: 10, users: 50, records: 10000, publishedApps: 5 }; // Would come from API

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plan actual</h3>
            <p className="mt-1">
              <span className="text-2xl font-bold capitalize">{plan}</span>
              {subscription?.status === "active" && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Activo
                </span>
              )}
              {subscription?.status === "past_due" && (
                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Payment failed
                </span>
              )}
            </p>
          </div>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cambiar plan
          </button>
        </div>
        
        {subscription?.currentPeriodEnd && (
          <p className="mt-4 text-sm text-gray-500">
            Periodo de facturación hasta el{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Usage */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Uso actual</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UsageCard
            label="Apps"
            usage={usage?.apps || 0}
            limit={limits.apps}
          />
          <UsageCard
            label="Usuarios"
            usage={usage?.users || 0}
            limit={limits.users}
          />
          <UsageCard
            label="Registros"
            usage={usage?.records || 0}
            limit={limits.records}
          />
          <UsageCard
            label="Apps publicadas"
            usage={usage?.publishedApps || 0}
            limit={limits.publishedApps}
          />
        </div>
      </div>

      {/* Billing history */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Historial de facturación</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                <th className="pb-3 text-right text-xs font-medium uppercase text-gray-500">Monto</th>
                <th className="pb-3 text-right text-xs font-medium uppercase text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">1 Feb 2026</td>
                <td className="py-3 text-sm text-gray-500">Plan Pro - Mensual</td>
                <td className="py-3 text-sm text-gray-900 text-right">€39.00</td>
                <td className="py-3 text-right">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Pagado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Método de pago</h3>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <span className="text-xs font-bold text-gray-600">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-500">Expira 12/2027</p>
          </div>
          <button className="ml-auto text-sm text-blue-600 hover:text-blue-700">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ label, usage, limit }: { label: string; usage: number; limit: number }) {
  const percentage = (usage / limit) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`text-sm font-semibold ${isError ? "text-red-600" : isWarning ? "text-yellow-600" : "text-gray-900"}`}>
          {usage} / {limit}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${
            isError ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
