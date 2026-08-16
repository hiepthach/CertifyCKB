export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: string[]; // For select/multiselect
  defaultValue?: string | number | string[];
}

export interface BrandingConfig {
  logoUrl?: string;
  sealUrl?: string;
  logoPosition: 'left' | 'center' | 'right';
  sealPosition: 'left' | 'center' | 'right';
  showProviderName: boolean;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily?: string;
  fontSize: 'sm' | 'md' | 'lg';
  headingWeight: 'normal' | 'medium' | 'bold';
}

export interface ColorConfig {
  theme: 'blue' | 'purple' | 'green' | 'gold' | 'red' | 'custom';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface VisualSection {
  id: string;
  visible: boolean;
  order: number;
  style?: Record<string, string>;
}

export interface VisualConfig {
  layout: 'classic' | 'modern' | 'compact' | 'detailed' | 'badge';
  branding: BrandingConfig;
  typography: TypographyConfig;
  colors: ColorConfig;
  background: {
    type: 'solid' | 'gradient' | 'pattern' | 'image';
    value: string;
  };
  effects: {
    shadow: boolean;
    border: boolean;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    animation: boolean;
  };
  sections: {
    header: VisualSection;
    recipient: VisualSection;
    course: VisualSection;
    grades: VisualSection;
    skills: VisualSection;
    metadata: VisualSection;
    footer: VisualSection;
  };
}

export interface Template {
  id: string;
  clusterId: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  visual?: VisualConfig;
  createdAt: string;
  updatedAt?: string;
}
