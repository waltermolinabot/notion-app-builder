import { getNotionClient } from "./oauth";

export interface NotionWorkspace {
  id: string;
  name: string;
  type: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
}

export async function getUserWorkspaces(accessToken: string): Promise<NotionWorkspace[]> {
  const notion = getNotionClient(accessToken);
  
  // Get bot's associated workspaces
  const bot = await notion.users.me({});
  
  return [{
    id: bot.id,
    name: bot.name || "My Workspace",
    type: "workspace",
  }];
}

export async function getWorkspaceDatabases(accessToken: string, workspaceId: string): Promise<NotionDatabase[]> {
  const notion = getNotionClient(accessToken);
  
  const response = await notion.search({
    filter: {
      property: "object",
      value: "database",
    } as any,
    page_size: 100,
  });
  
  const databases: NotionDatabase[] = [];
  
  for (const page of response.results) {
    if ((page as any).object === "database" && "title" in page) {
      const title = (page as any).title
        .map((t: any) => t.plain_text)
        .join("") || "Untitled";
      
      databases.push({
        id: page.id,
        title,
        icon: (page as any).icon?.external?.url || (page as any).icon?.emoji,
        lastEditedTime: page.last_edited_time,
      });
    }
  }
  
  return databases;
}
