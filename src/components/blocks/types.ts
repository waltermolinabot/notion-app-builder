export type BlockType = "table" | "cards" | "detail" | "form";

export interface BlockField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "relation";
  required?: boolean;
  options?: string[];
}

export interface Block {
  id: string;
  type: BlockType;
  config: {
    dataSourceId: string;
    title: string;
    fields: BlockField[];
    // Table specific
    columns?: string[];
    sortable?: boolean;
    // Cards specific
    cardLayout?: "grid" | "list";
    imageField?: string;
    // Detail specific
    showFields?: string[];
    // Form specific
    submitAction?: "create" | "update";
    redirectUrl?: string;
  };
}

export interface AppConfig {
  id: string;
  name: string;
  description?: string;
  template: "portal" | "directory" | "projects";
  blocks: Block[];
  branding: {
    logo?: string;
    primaryColor?: string;
    font?: string;
  };
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
