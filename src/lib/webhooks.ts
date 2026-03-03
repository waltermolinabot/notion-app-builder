import { prisma } from "@/lib/prisma";

interface WebhookPayload {
  event: string;
  timestamp: string;
  appId: string;
  data: {
    databaseId?: string;
    rowId?: string;
    properties?: Record<string, any>;
    changes?: Record<string, any>;
  };
}

/**
 * Send webhook notification to all registered webhooks for an app
 */
export async function sendWebhooks(
  appId: string,
  event: string,
  data: WebhookPayload["data"]
): Promise<{ sent: number; failed: number }> {
  try {
    const app = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!app) {
      console.error(`App ${appId} not found`);
      return { sent: 0, failed: 0 };
    }

    const webhooks = (app as any).config?.webhooks || [];
    const activeWebhooks = webhooks.filter((w: any) => w.active);

    if (activeWebhooks.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      appId,
      data,
    };

    // Send webhooks in parallel
    const results = await Promise.allSettled(
      activeWebhooks.map((webhook: any) =>
        sendWebhook(webhook, payload)
      )
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return { sent, failed };
  } catch (error) {
    console.error("Error sending webhooks:", error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send a single webhook
 */
async function sendWebhook(
  webhook: { url: string; secret: string; events: string[] },
  payload: WebhookPayload
): Promise<void> {
  // Check if this webhook cares about this event
  if (!webhook.events.includes(payload.event) && !webhook.events.includes("*")) {
    return;
  }

  const response = await fetch(webhook.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Event": payload.event,
      "X-Webhook-Timestamp": payload.timestamp,
      "X-Webhook-App-Id": payload.appId,
      "X-Webhook-Signature": await generateSignature(payload, webhook.secret),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }
}

/**
 * Generate HMAC signature for webhook payload
 */
async function generateSignature(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Notify when a row is created
 */
export async function notifyRowCreated(
  appId: string,
  databaseId: string,
  rowId: string,
  properties: Record<string, any>
): Promise<void> {
  await sendWebhooks(appId, "row.created", {
    databaseId,
    rowId,
    properties,
  });
}

/**
 * Notify when a row is updated
 */
export async function notifyRowUpdated(
  appId: string,
  databaseId: string,
  rowId: string,
  properties: Record<string, any>,
  changes?: Record<string, any>
): Promise<void> {
  await sendWebhooks(appId, "row.updated", {
    databaseId,
    rowId,
    properties,
    changes,
  });
}

/**
 * Notify when a row is deleted
 */
export async function notifyRowDeleted(
  appId: string,
  databaseId: string,
  rowId: string
): Promise<void> {
  await sendWebhooks(appId, "row.deleted", {
    databaseId,
    rowId,
  });
}
