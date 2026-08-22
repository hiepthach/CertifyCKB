// Template exports placeholder
// Template functionality will be implemented in future versions

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  visualConfig: VisualConfig;
  createdAt: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface VisualConfig {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  backgroundImage?: string;
  fontFamily: string;
}

export function createDefaultTemplate(): CertificateTemplate {
  return {
    id: 'default',
    name: 'Standard Certificate',
    description: 'Standard course completion certificate template',
    fields: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
      { key: 'courseName', label: 'Course Name', type: 'text', required: true },
      { key: 'completionDate', label: 'Completion Date', type: 'date', required: true },
      { key: 'grade', label: 'Grade', type: 'select', required: false, options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'Pass', 'Fail'] },
    ],
    visualConfig: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E293B',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    createdAt: new Date().toISOString(),
  };
}

export function getDefaultVisualConfig(): VisualConfig {
  return {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E293B',
    fontFamily: 'Inter, system-ui, sans-serif',
  };
}

export function getDefaultCertificateFields(): TemplateField[] {
  return [
    { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
    { key: 'courseName', label: 'Course Name', type: 'text', required: true },
    { key: 'completionDate', label: 'Completion Date', type: 'date', required: true },
  ];
}
