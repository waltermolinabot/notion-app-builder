import { Block } from "@prisma/client";

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

export interface BlockConfig {
  title?: string;
  databaseId?: string;
  columns?: Array<{ field: string; label: string; width?: string }>;
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  fields?: string[] | FormField[];
  imageField?: string;
  numColumns?: number;
  sections?: Array<{ 
    title: string; 
    fields: string[] | Array<{ name: string; label: string; type: string; required?: boolean; options?: string[] }> 
  }>;
  submitLabel?: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "crm" | "internal" | "projects";
  blocks: Array<{
    type: string;
    position: number;
    config: BlockConfig;
  }>;
}

// Template: Portal de Clientes
export const portalClientesTemplate: AppTemplate = {
  id: "portal-clientes",
  name: "Portal de Clientes",
  description: "Gestión completa de clientes con seguimiento comercial",
  icon: "👥",
  category: "crm",
  blocks: [
    {
      type: "table",
      position: 0,
      config: {
        title: "Lista de Clientes",
        databaseId: "",
        columns: [
          { field: "name", label: "Nombre", width: "200px" },
          { field: "email", label: "Email", width: "200px" },
          { field: "phone", label: "Teléfono", width: "150px" },
          { field: "status", label: "Estado", width: "120px" },
          { field: "company", label: "Empresa", width: "180px" },
        ],
        sortable: true,
        searchable: true,
        pagination: true,
        pageSize: 25,
      },
    },
    {
      type: "cards",
      position: 1,
      config: {
        title: "Clientes Recientes",
        databaseId: "",
        fields: ["name", "email", "status", "company"],
        imageField: "",
        numColumns: 3,
      },
    },
    {
      type: "detail",
      position: 2,
      config: {
        title: "Detalle del Cliente",
        sections: [
          {
            title: "Información",
            fields: ["name", "email", "phone", "company"],
          },
          {
            title: "Notas",
            fields: ["notes"],
          },
        ],
      },
    },
    {
      type: "form",
      position: 3,
      config: {
        title: "Nuevo Cliente",
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Teléfono", type: "phone", required: false },
          { name: "company", label: "Empresa", type: "text", required: false },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Lead", "Prospecto", "Cliente", "Inactivo"] },
        ],
        submitLabel: "Crear Cliente",
      },
    },
  ],
};

// Template: Directorio de Empleados
export const directorioEmpleadosTemplate: AppTemplate = {
  id: "directorio-empleados",
  name: "Directorio de Empleados",
  description: "Gestión de empleados y directorio interno",
  icon: "🏢",
  category: "internal",
  blocks: [
    {
      type: "table",
      position: 0,
      config: {
        title: "Empleados",
        databaseId: "",
        columns: [
          { field: "name", label: "Nombre", width: "180px" },
          { field: "position", label: "Puesto", width: "180px" },
          { field: "department", label: "Departamento", width: "150px" },
          { field: "email", label: "Email", width: "220px" },
          { field: "status", label: "Estado", width: "100px" },
        ],
        sortable: true,
        searchable: true,
        pagination: true,
        pageSize: 20,
      },
    },
    {
      type: "cards",
      position: 1,
      config: {
        title: "Equipo",
        databaseId: "",
        fields: ["name", "position", "department", "email"],
        imageField: "avatar",
        numColumns: 4,
      },
    },
    {
      type: "detail",
      position: 2,
      config: {
        title: "Perfil del Empleado",
        sections: [
          {
            title: "Datos Personales",
            fields: ["name", "email", "phone", "address"],
          },
          {
            title: "Información Laboral",
            fields: ["position", "department", "startDate", "manager"],
          },
        ],
      },
    },
  ],
};

// Template: Seguimiento de Proyectos
export const seguimientoProyectosTemplate: AppTemplate = {
  id: "seguimiento-proyectos",
  name: "Seguimiento de Proyectos",
  description: "Gestión de proyectos con kanban y seguimiento de tareas",
  icon: "📋",
  category: "projects",
  blocks: [
    {
      type: "table",
      position: 0,
      config: {
        title: "Proyectos",
        databaseId: "",
        columns: [
          { field: "name", label: "Proyecto", width: "200px" },
          { field: "client", label: "Cliente", width: "150px" },
          { field: "status", label: "Estado", width: "120px" },
          { field: "priority", label: "Prioridad", width: "100px" },
          { field: "dueDate", label: "Fecha Límite", width: "130px" },
          { field: "progress", label: "Progreso", width: "100px" },
        ],
        sortable: true,
        searchable: true,
        pagination: true,
        pageSize: 15,
      },
    },
    {
      type: "cards",
      position: 1,
      config: {
        title: "Proyectos Activos",
        databaseId: "",
        fields: ["name", "client", "status", "progress"],
        imageField: "",
        numColumns: 3,
      },
    },
    {
      type: "detail",
      position: 2,
      config: {
        title: "Detalle del Proyecto",
        sections: [
          {
            title: "Información General",
            fields: ["name", "description", "client", "startDate", "dueDate"],
          },
          {
            title: "Estado",
            fields: ["status", "priority", "progress", "budget"],
          },
          {
            title: "Equipo",
            fields: ["owner", "teamMembers"],
          },
        ],
      },
    },
    {
      type: "form",
      position: 3,
      config: {
        title: "Nuevo Proyecto",
        fields: [
          { name: "name", label: "Nombre del Proyecto", type: "text", required: true },
          { name: "description", label: "Descripción", type: "textarea", required: false },
          { name: "client", label: "Cliente", type: "text", required: true },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Planificado", "En Progreso", "En Revisión", "Completado"] },
          { name: "priority", label: "Prioridad", type: "select", required: true, options: ["Baja", "Media", "Alta", "Urgente"] },
          { name: "dueDate", label: "Fecha Límite", type: "date", required: false },
        ],
        submitLabel: "Crear Proyecto",
      },
    },
  ],
};

// All templates
export const appTemplates: AppTemplate[] = [
  portalClientesTemplate,
  directorioEmpleadosTemplate,
  seguimientoProyectosTemplate,
];

// Get template by ID
export function getTemplateById(id: string): AppTemplate | undefined {
  return appTemplates.find((t) => t.id === id);
}

// Get templates by category
export function getTemplatesByCategory(category: AppTemplate["category"]): AppTemplate[] {
  return appTemplates.filter((t) => t.category === category);
}
