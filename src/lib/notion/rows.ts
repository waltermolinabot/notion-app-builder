import { getNotionClient } from "./oauth";
import { NotionField } from "./schema";

export interface NotionRow {
  id: string;
  properties: Record<string, any>;
  createdTime: string;
  lastEditedTime: string;
  url: string;
}

export interface NotionRowsResponse {
  rows: NotionRow[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Fetch rows from a Notion database with pagination support
 */
export async function fetchNotionDatabaseRows(
  accessToken: string,
  databaseId: string,
  cursor?: string,
  pageSize: number = 100
): Promise<NotionRowsResponse> {
  const notion = getNotionClient(accessToken);

  const query: any = {
    database_id: databaseId,
    page_size: pageSize,
  };

  if (cursor) {
    query.start_cursor = cursor;
  }

  const response = await (notion as any).databases.query(query);

  const rows: NotionRow[] = [];

  for (const page of response.results) {
    if ((page as any).object === "page") {
      rows.push(transformNotionPageToRow(page, databaseId));
    }
  }

  return {
    rows,
    nextCursor: response.next_cursor,
    hasMore: response.has_more,
  };
}

/**
 * Transform Notion page to internal row format
 */
function transformNotionPageToRow(page: any, databaseId: string): NotionRow {
  const properties: Record<string, any> = {};

  // Transform each property
  for (const [key, prop] of Object.entries(page.properties)) {
    properties[key] = transformNotionProperty(prop);
  }

  return {
    id: page.id,
    properties,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    url: page.url,
  };
}

/**
 * Transform Notion property to simple value
 */
function transformNotionProperty(prop: any): any {
  const type = prop.type;

  switch (type) {
    case "title":
      return prop.title?.map((t: any) => t.plain_text).join("") || "";

    case "rich_text":
      return prop.rich_text?.map((t: any) => t.plain_text).join("") || "";

    case "number":
      return prop.number;

    case "select":
      return prop.select?.name || null;

    case "multi_select":
      return prop.multi_select?.map((s: any) => s.name) || [];

    case "date":
      return prop.date?.start || null;

    case "checkbox":
      return prop.checkbox || false;

    case "url":
      return prop.url || null;

    case "email":
      return prop.email || null;

    case "phone_number":
      return prop.phone_number || null;

    case "files":
      return prop.files?.map((f: any) => ({
        name: f.name,
        url: f.file?.url || f.external?.url,
      })) || [];

    case "people":
      return prop.people?.map((p: any) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatar_url,
      })) || [];

    case "created_time":
      return prop.created_time;

    case "last_edited_time":
      return prop.last_edited_time;

    case "created_by":
      return prop.created_by?.id || null;

    case "last_edited_by":
      return prop.last_edited_by?.id || null;

    default:
      return null;
  }
}

/**
 * Fetch a single row by ID
 */
export async function fetchNotionRow(
  accessToken: string,
  pageId: string
): Promise<NotionRow | null> {
  const notion = getNotionClient(accessToken);

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    if ((page as any).object === "page") {
      return transformNotionPageToRow(page, "");
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch Notion row:", error);
    return null;
  }
}

/**
 * Get all rows from a database (handles pagination automatically)
 */
export async function fetchAllNotionRows(
  accessToken: string,
  databaseId: string,
  maxRows: number = 1000
): Promise<NotionRow[]> {
  const allRows: NotionRow[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore && allRows.length < maxRows) {
    const response = await fetchNotionDatabaseRows(
      accessToken,
      databaseId,
      cursor || undefined,
      Math.min(100, maxRows - allRows.length)
    );

    allRows.push(...response.rows);
    cursor = response.nextCursor;
    hasMore = response.hasMore && allRows.length < maxRows;
  }

  return allRows;
}

/**
 * Create a new row in a Notion database
 */
export async function createNotionRow(
  accessToken: string,
  databaseId: string,
  properties: Record<string, any>
): Promise<NotionRow | null> {
  const notion = getNotionClient(accessToken);

  try {
    // Transform properties to Notion format
    const notionProperties: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        notionProperties[key] = {
          rich_text: [{ text: { content: value } }],
        };
      } else if (typeof value === "number") {
        notionProperties[key] = {
          number: value,
        };
      } else if (typeof value === "boolean") {
        notionProperties[key] = {
          checkbox: value,
        };
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "string") {
          notionProperties[key] = {
            multi_select: value.map((v) => ({ name: v })),
          };
        } else {
          notionProperties[key] = {
            rich_text: [{ text: { content: JSON.stringify(value) } }],
          };
        }
      } else if (typeof value === "object" && value !== null) {
        // Handle select fields
        if (value.name) {
          notionProperties[key] = {
            select: { name: value.name },
          };
        } else if (value.start) {
          notionProperties[key] = {
            date: { start: value.start, end: value.end },
          };
        } else {
          notionProperties[key] = {
            rich_text: [{ text: { content: JSON.stringify(value) } }],
          };
        }
      } else {
        notionProperties[key] = {
          rich_text: [{ text: { content: String(value) } }],
        };
      }
    }

    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: notionProperties,
    });

    return transformNotionPageToRow(page, databaseId);
  } catch (error) {
    console.error("Failed to create Notion row:", error);
    return null;
  }
}

/**
 * Update an existing row in a Notion database
 */
export async function updateNotionRow(
  accessToken: string,
  pageId: string,
  properties: Record<string, any>
): Promise<NotionRow | null> {
  const notion = getNotionClient(accessToken);

  try {
    // Transform properties to Notion format
    const notionProperties: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;

      if (value === null) {
        notionProperties[key] = {
          rich_text: [],
        };
      } else if (typeof value === "string") {
        notionProperties[key] = {
          rich_text: [{ text: { content: value } }],
        };
      } else if (typeof value === "number") {
        notionProperties[key] = {
          number: value,
        };
      } else if (typeof value === "boolean") {
        notionProperties[key] = {
          checkbox: value,
        };
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "string") {
          notionProperties[key] = {
            multi_select: value.map((v) => ({ name: v })),
          };
        } else {
          notionProperties[key] = {
            rich_text: [{ text: { content: JSON.stringify(value) } }],
          };
        }
      } else if (typeof value === "object" && value !== null) {
        if (value.name) {
          notionProperties[key] = {
            select: { name: value.name },
          };
        } else if (value.start) {
          notionProperties[key] = {
            date: { start: value.start, end: value.end },
          };
        } else {
          notionProperties[key] = {
            rich_text: [{ text: { content: JSON.stringify(value) } }],
          };
        }
      } else {
        notionProperties[key] = {
          rich_text: [{ text: { content: String(value) } }],
        };
      }
    }

    const page = await notion.pages.update({
      page_id: pageId,
      properties: notionProperties,
    });

    return transformNotionPageToRow(page, "");
  } catch (error) {
    console.error("Failed to update Notion row:", error);
    return null;
  }
}

/**
 * Delete a row from a Notion database
 */
export async function deleteNotionRow(
  accessToken: string,
  pageId: string
): Promise<boolean> {
  const notion = getNotionClient(accessToken);

  try {
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    return true;
  } catch (error) {
    console.error("Failed to delete Notion row:", error);
    return false;
  }
}
