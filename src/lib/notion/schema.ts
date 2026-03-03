import { getNotionClient } from "./oauth";

export type NotionFieldType = 
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "files"
  | "people"
  | "relation"
  | "rollup"
  | "formula"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by";

export interface NotionField {
  id: string;
  name: string;
  type: NotionFieldType;
  options?: string[]; // For select/multi_select
  isPrimary?: boolean;
}

export interface NotionSchema {
  databaseId: string;
  fields: NotionField[];
}

export async function getDatabaseSchema(
  accessToken: string,
  databaseId: string
): Promise<NotionSchema> {
  const notion = getNotionClient(accessToken);
  
  const database = await notion.databases.retrieve({
    database_id: databaseId,
  }) as any;
  
  if (database.object !== "database") {
    throw new Error("Invalid database response");
  }
  
  const properties = database.properties;
  const fields: NotionField[] = [];
  
  // Check for title field (primary)
  if ("title" in properties && properties.title) {
    fields.push({
      id: "title",
      name: "Title",
      type: "title",
      isPrimary: true,
    });
  }
  
  // Process other properties
  for (const [key, prop] of Object.entries(properties)) {
    if (key === "title") continue;
    
    const field = mapNotionProperty(key, prop);
    if (field) {
      fields.push(field);
    }
  }
  
  return {
    databaseId,
    fields,
  };
}

function mapNotionProperty(name: string, prop: any): NotionField | null {
  const type = prop.type;
  
  switch (type) {
    case "rich_text":
    case "title":
      return {
        id: prop.id,
        name: name,
        type: type as NotionFieldType,
        isPrimary: type === "title",
      };
      
    case "number":
      return {
        id: prop.id,
        name: name,
        type: "number",
      };
      
    case "select":
      return {
        id: prop.id,
        name: name,
        type: "select",
        options: prop.select.options.map((o: any) => o.name),
      };
      
    case "multi_select":
      return {
        id: prop.id,
        name: name,
        type: "multi_select",
        options: prop.multi_select.options.map((o: any) => o.name),
      };
      
    case "date":
      return {
        id: prop.id,
        name: name,
        type: "date",
      };
      
    case "checkbox":
      return {
        id: prop.id,
        name: name,
        type: "checkbox",
      };
      
    case "url":
      return {
        id: prop.id,
        name: name,
        type: "url",
      };
      
    case "email":
      return {
        id: prop.id,
        name: name,
        type: "email",
      };
      
    case "phone_number":
      return {
        id: prop.id,
        name: name,
        type: "phone_number",
      };
      
    case "files":
      return {
        id: prop.id,
        name: name,
        type: "files",
      };
      
    case "people":
      return {
        id: prop.id,
        name: name,
        type: "people",
      };
      
    case "relation":
      return {
        id: prop.id,
        name: name,
        type: "relation",
      };
      
    case "rollup":
      return {
        id: prop.id,
        name: name,
        type: "rollup",
      };
      
    case "formula":
      return {
        id: prop.id,
        name: name,
        type: "formula",
      };
      
    case "created_time":
      return {
        id: prop.id,
        name: name,
        type: "created_time",
      };
      
    case "created_by":
      return {
        id: prop.id,
        name: name,
        type: "created_by",
      };
      
    case "last_edited_time":
      return {
        id: prop.id,
        name: name,
        type: "last_edited_time",
      };
      
    case "last_edited_by":
      return {
        id: prop.id,
        name: name,
        type: "last_edited_by",
      };
      
    default:
      return null;
  }
}

// Map Notion types to app types
export function mapNotionTypeToAppType(notionType: NotionFieldType): string {
  const typeMap: Record<NotionFieldType, string> = {
    title: "text",
    rich_text: "text",
    number: "number",
    select: "select",
    multi_select: "multiselect",
    date: "date",
    checkbox: "boolean",
    url: "url",
    email: "email",
    phone_number: "phone",
    files: "file",
    people: "user",
    relation: "relation",
    rollup: "number",
    formula: "text",
    created_time: "date",
    created_by: "user",
    last_edited_time: "date",
    last_edited_by: "user",
  };
  
  return typeMap[notionType] || "text";
}
