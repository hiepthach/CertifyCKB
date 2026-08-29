import type { Template, TemplateField, VisualConfig } from '@/types';

// In-memory storage for templates
const templates: Map<string, Template> = new Map();

/**
 * Clear all templates (for testing)
 */
export function clearTemplateCache(): void {
  templates.clear();
}

/**
 * Create a new template
 */
export async function createTemplate(params: {
  clusterId: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  visual?: VisualConfig;
}): Promise<Template> {
  const template: Template = {
    id: generateTemplateId(),
    clusterId: params.clusterId,
    name: params.name,
    description: params.description,
    fields: params.fields,
    visual: params.visual,
    createdAt: new Date().toISOString(),
  };

  templates.set(template.id, template);
  return template;
}

/**
 * Get template by ID
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  return templates.get(templateId) || null;
}

/**
 * Get all templates for a cluster
 */
export async function getTemplates(clusterId: string): Promise<Template[]> {
  return Array.from(templates.values()).filter((t) => t.clusterId === clusterId);
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<Omit<Template, 'id' | 'clusterId' | 'createdAt'>>
): Promise<Template | null> {
  const template = templates.get(templateId);
  if (!template) return null;

  const updated: Template = {
    ...template,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  templates.set(templateId, updated);
  return updated;
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<boolean> {
  return templates.delete(templateId);
}

/**
 * Apply template to certificate data
 */
export function applyTemplate(
  template: Template,
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Apply each field from template
  for (const field of template.fields) {
    if (field.id in data) {
      result[field.id] = data[field.id];
    } else if (field.defaultValue !== undefined) {
      result[field.id] = field.defaultValue;
    }
  }

  return result;
}

/**
 * Create a default visual config
 */
export function createDefaultVisualConfig(): VisualConfig {
  return {
    layout: 'classic',
    branding: {
      logoPosition: 'left',
      sealPosition: 'right',
      showProviderName: true,
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 'md',
      headingWeight: 'bold',
    },
    colors: {
      theme: 'blue',
    },
    background: {
      type: 'solid',
      value: '#ffffff',
    },
    effects: {
      shadow: true,
      border: true,
      borderRadius: 'md',
      animation: false,
    },
    sections: {
      header: { id: 'header', visible: true, order: 1 },
      recipient: { id: 'recipient', visible: true, order: 2 },
      course: { id: 'course', visible: true, order: 3 },
      grades: { id: 'grades', visible: true, order: 4 },
      skills: { id: 'skills', visible: true, order: 5 },
      metadata: { id: 'metadata', visible: false, order: 6 },
      footer: { id: 'footer', visible: true, order: 7 },
    },
  };
}

/**
 * Get predefined template fields for course certificates
 */
export function getDefaultCertificateFields(): TemplateField[] {
  return [
    {
      id: 'recipientName',
      name: 'recipientName',
      type: 'text',
      required: true,
      label: 'Recipient Name',
    },
    {
      id: 'courseName',
      name: 'courseName',
      type: 'text',
      required: true,
      label: 'Course Name',
    },
    {
      id: 'completionDate',
      name: 'completionDate',
      type: 'date',
      required: true,
      label: 'Completion Date',
    },
    {
      id: 'grade',
      name: 'grade',
      type: 'select',
      required: false,
      label: 'Grade',
      options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'Pass', 'Fail'],
    },
    {
      id: 'score',
      name: 'score',
      type: 'number',
      required: false,
      label: 'Score (%)',
    },
    {
      id: 'skills',
      name: 'skills',
      type: 'multiselect',
      required: false,
      label: 'Skills Acquired',
    },
  ];
}

function generateTemplateId(): string {
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `tmpl_${hex}`;
}
