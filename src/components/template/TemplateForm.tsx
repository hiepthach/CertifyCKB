'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import type { Template, TemplateField, VisualConfig } from '@/types';
import { createTemplate, updateTemplate, createDefaultVisualConfig, getDefaultCertificateFields } from '@/lib/credentials/services';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';

interface TemplateFormProps {
  clusterId: string;
  template?: Template; // If provided, we're editing
  onSave: (template: Template) => void;
  onCancel: () => void;
  loading?: boolean;
}

type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect';
type LayoutType = 'classic' | 'modern' | 'compact' | 'detailed' | 'badge';
type ThemeType = 'blue' | 'purple' | 'green' | 'gold' | 'red' | 'custom';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-Select' },
];

const LAYOUTS: { value: LayoutType; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Traditional certificate style' },
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'compact', label: 'Compact', description: 'Space-efficient layout' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive with all sections' },
  { value: 'badge', label: 'Badge', description: 'Small badge-style certificate' },
];

const THEMES: { value: ThemeType; label: string; primary: string }[] = [
  { value: 'blue', label: 'Blue', primary: '#1E40AF' },
  { value: 'purple', label: 'Purple', primary: '#6B21A8' },
  { value: 'green', label: 'Green', primary: '#166534' },
  { value: 'gold', label: 'Gold', primary: '#92400E' },
  { value: 'red', label: 'Red', primary: '#991B1B' },
];

export function TemplateForm({
  clusterId,
  template,
  onSave,
  onCancel,
  loading = false,
}: TemplateFormProps) {
  const isEditing = !!template?.id;

  // Form state
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [fields, setFields] = useState<TemplateField[]>(template?.fields || getDefaultCertificateFields());
  const [layout, setLayout] = useState<LayoutType>(template?.visual?.layout || 'classic');
  const [theme, setTheme] = useState<ThemeType>(template?.visual?.colors?.theme || 'blue');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFieldEditor, setShowFieldEditor] = useState(false);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (name.length > 100) {
      newErrors.name = 'Template name must be less than 100 characters';
    }

    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    // Check for required fields without id
    const fieldsWithoutId = fields.filter((f) => !f.id);
    if (fieldsWithoutId.length > 0) {
      newErrors.fields = 'All fields must have an ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    // Build visual config
    const visual: VisualConfig = {
      layout,
      branding: template?.visual?.branding || {
        logoPosition: 'left',
        sealPosition: 'right',
        showProviderName: true,
      },
      typography: template?.visual?.typography || {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 'md',
        headingWeight: 'bold',
      },
      colors: {
        theme,
        primaryColor: THEMES.find((t) => t.value === theme)?.primary,
      },
      background: template?.visual?.background || { type: 'solid', value: '#ffffff' },
      effects: template?.visual?.effects || {
        shadow: true,
        border: true,
        borderRadius: 'md',
        animation: false,
      },
      sections: template?.visual?.sections || createDefaultVisualConfig().sections,
    };

    try {
      let savedTemplate: Template;

      if (isEditing) {
        savedTemplate = (await updateTemplate(template.id, {
          name,
          description,
          fields,
          visual,
        })) as Template;
      } else {
        savedTemplate = await createTemplate({
          clusterId,
          name,
          description,
          fields,
          visual,
        });
      }

      onSave(savedTemplate);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to save template',
      });
    }
  };

  // Field management
  const addField = () => {
    const newField: TemplateField = {
      id: `field_${fields.length + 1}`,
      name: `field_${fields.length + 1}`,
      type: 'text',
      required: false,
      label: `Field ${fields.length + 1}`,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-white mb-4">Template Details</h3>

        <div className="space-y-4">
          <Input
            label="Template Name"
            placeholder="Professional Certificate"
            value={name}
            onChange={setName}
            error={errors.name}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe your template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Layout Selection */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-white mb-4">Certificate Layout</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLayout(l.value)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                layout === l.value
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="font-medium text-sm">{l.label}</div>
              <div className="text-xs mt-1 opacity-70">{l.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Theme Selection */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-white mb-4">Color Theme</h3>

        <div className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                theme === t.value
                  ? 'border-blue-500 bg-slate-700'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-white/20"
                style={{ backgroundColor: t.primary }}
              />
              <span className="text-xs mt-2 text-slate-300">{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Fields Editor */}
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Form Fields</h3>
          <Button variant="secondary" size="sm" onClick={() => setShowFieldEditor(!showFieldEditor)}>
            {showFieldEditor ? 'Hide' : 'Edit'} Fields
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFieldEditor ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {errors.fields && <p className="text-red-400 text-sm mb-4">{errors.fields}</p>}

        {/* Field Summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {fields.map((field, index) => (
            <div
              key={field.id || index}
              className={`px-3 py-1 rounded-full text-sm ${
                field.required
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  : 'bg-slate-700 text-slate-300 border border-slate-600'
              }`}
            >
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </div>
          ))}
        </div>

        {/* Full Field Editor */}
        {showFieldEditor && (
          <div className="border-t border-slate-700 pt-4 mt-4 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id || index}
                className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-500 hover:text-white disabled:opacity-30"
                >
                  <GripVertical className="w-5 h-5" />
                </button>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input
                    label="ID"
                    value={field.id}
                    onChange={(v) => updateField(index, { id: v, name: v })}
                    placeholder="field_id"
                  />
                  <Input
                    label="Label"
                    value={field.label || ''}
                    onChange={(v) => updateField(index, { label: v })}
                    placeholder="Field Label"
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-600"
                      />
                      Required
                    </label>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button variant="secondary" onClick={addField}>
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          </div>
        )}
      </Card>

      {/* Actions */}
      {errors.submit && (
        <p className="text-red-400 text-sm">{errors.submit}</p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={loading}>
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
