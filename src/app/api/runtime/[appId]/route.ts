import { NextRequest, NextResponse } from "next/server";
import { Block } from "@/components/blocks";

interface AppRuntimeConfig {
  id: string;
  name: string;
  blocks: Block[];
  branding: {
    logo?: string;
    primaryColor?: string;
    font?: string;
  };
}

// Simulated app registry - in production this would come from DB
const appRegistry = new Map<string, AppRuntimeConfig>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  
  // Get app config from registry or DB
  const app = appRegistry.get(appId);
  
  if (!app) {
    // For demo, return a sample app
    return NextResponse.json({
      id: appId,
      name: "App de ejemplo",
      blocks: [
        {
          id: "block-1",
          type: "table",
          config: {
            dataSourceId: "demo",
            title: "Clientes",
            fields: [
              { key: "name", label: "Nombre", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "status", label: "Estado", type: "select", options: ["Activo", "Inactivo"] },
            ],
          },
        },
      ],
      branding: {
        primaryColor: "#2563EB",
        font: "inter",
      },
    });
  }
  
  return NextResponse.json(app);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const body = await request.json() as AppRuntimeConfig;
  
  // Validate and store app config
  if (!body.blocks || !Array.isArray(body.blocks)) {
    return NextResponse.json({ error: "Invalid blocks configuration" }, { status: 400 });
  }
  
  appRegistry.set(appId, body);
  
  return NextResponse.json({ success: true, appId });
}

// Runtime renderer - generates the actual app HTML
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;
  const body = await request.json();
  const { action, blockId, data } = body;
  
  const app = appRegistry.get(appId);
  
  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }
  
  switch (action) {
    case "updateBlock":
      // Update a specific block's data
      return NextResponse.json({ success: true });
    
    case "submitForm":
      // Handle form submission
      return NextResponse.json({ success: true, message: "Form submitted" });
    
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
