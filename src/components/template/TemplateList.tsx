'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import type { Template, TemplateField } from '@/types';
import { getTemplates, deleteTemplate } from '@/lib/credentials/services';
import { getDefaultCertificateFields } from '@/lib/credentials/services';
import { Plus, FileText, Pencil, Trash2, Copy } from 'lucide-react';

interface TemplateListProps {
  clusterId: string;
  onSelectTemplate?: (template: Template) => void;
  onCreateTemplate?: () => void;
  onEditTemplate?: (template: Template) => void;
}

const LAYOUT_LABELS: Record<string, string> = {
  classic: 'Classic',
  modern: 'Modern',
  compact: 'Compact',
  detailed: 'Detailed',
  badge: 'Badge',
};

const THEME_COLORS: Record<string, string> = {
  blue: 'bg-blue-900 text-blue-400 border-blue-700',
  purple: 'bg-purple-900 text-purple-400 border-purple-700',
  green: 'bg-green-900 text-green-400 border-green-700',
  gold: 'bg-yellow-900 text-yellow-400 border-yellow-700',
  red: 'bg-red-900 text-red-400 border-red-700',
  custom: 'bg-slate-900 text-slate-400 border-slate-700',
};

export function TemplateList({
  clusterId,
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
}: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [clusterId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loaded = await getTemplates(clusterId);
      setTemplates(loaded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!confirm(`Delete template "${template.name}"?`)) return;

    try {
      await deleteTemplate(template.id);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleDuplicate = (template: Template) => {
    // Clone template for editing
    if (onEditTemplate) {
      const duplicated: Template = {
        ...template,
        id: '', // Will be assigned new ID on create
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      onEditTemplate(duplicated);
    }
  };

  const getFieldCount = (fields: TemplateField[]): number => {
    return fields.length;
  };

  const getRequiredFieldCount = (fields: TemplateField[]): number => {
    return fields.filter((f) => f.required).length;
  };

  const getLayoutBadge = (template: Template): string => {
    const layout = template.visual?.layout || 'classic';
    return LAYOUT_LABELS[layout] || layout;
  };

  const getThemeBadge = (template: Template): { label: string; className: string } => {
    const theme = template.visual?.colors?.theme || 'blue';
    return {
      label: theme.charAt(0).toUpperCase() + theme.slice(1),
      className: THEME_COLORS[theme] || THEME_COLORS.blue,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="default" padding="lg">
        <p className="text-red-400">{error}</p>
        <Button onClick={loadTemplates} variant="secondary" className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="No templates yet"
        description="Create your first certificate template to define the structure and design of your certificates."
        action={
          onCreateTemplate
            ? { label: 'Create Template', onClick: onCreateTemplate }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Certificate Templates ({templates.length})
        </h3>
        {onCreateTemplate && (
          <Button onClick={onCreateTemplate} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Template
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {templates.map((template) => {
          const themeBadge = getThemeBadge(template);

          return (
            <Card
              key={template.id}
              variant="interactive"
              padding="lg"
              onClick={() => onSelectTemplate?.(template)}
              className="hover:border-slate-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white truncate">{template.name}</h4>
                    <Badge className={themeBadge.className}>{themeBadge.label}</Badge>
                    <Badge variant="neutral">{getLayoutBadge(template)}</Badge>
                  </div>

                  {template.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>
                      {getFieldCount(template.fields)} fields
                    </span>
                    <span>
                      {getRequiredFieldCount(template.fields)} required
                    </span>
                    <span>
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {onSelectTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template);
                      }}
                    >
                      Use
                    </Button>
                  )}
                  {onEditTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTemplate(template);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(template);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Re-export for convenience
export { getDefaultCertificateFields } from '@/lib/credentials/services';
