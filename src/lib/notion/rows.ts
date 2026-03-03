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
