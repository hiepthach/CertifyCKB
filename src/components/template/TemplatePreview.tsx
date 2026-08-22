'use client';

import { Card, Badge } from '@/components/ui';
import type { Template, TemplateField, VisualConfig } from '@/types';

interface TemplatePreviewProps {
  template: Template;
  data?: CertificatePreviewData;
  compact?: boolean;
}

interface CertificatePreviewData {
  recipientName?: string;
  courseName?: string;
  completionDate?: string;
  grade?: string;
  issuerName?: string;
  [key: string]: string | undefined;
}

const LAYOUT_THEMES: Record<string, { primary: string; secondary: string; bg: string }> = {
  blue: { primary: '#1E40AF', secondary: '#3B82F6', bg: '#EFF6FF' },
  purple: { primary: '#6B21A8', secondary: '#9333EA', bg: '#FAF5FF' },
  green: { primary: '#166534', secondary: '#22C55E', bg: '#F0FDF4' },
  gold: { primary: '#92400E', secondary: '#F59E0B', bg: '#FFFBEB' },
  red: { primary: '#991B1B', secondary: '#EF4444', bg: '#FEF2F2' },
};

export function TemplatePreview({ template, data, compact = false }: TemplatePreviewProps) {
  const theme = template.visual?.colors?.theme || 'blue';
  const layout = template.visual?.layout || 'classic';
  const colors = LAYOUT_THEMES[theme] || LAYOUT_THEMES.blue;

  const previewData: CertificatePreviewData = {
    recipientName: data?.recipientName || 'John Doe',
    courseName: data?.courseName || 'CKB Development Fundamentals',
    completionDate: data?.completionDate || 'January 15, 2024',
    grade: data?.grade || 'A',
    issuerName: data?.issuerName || 'CKB Academy',
    ...data,
  };

  // Render based on layout type
  const renderClassicLayout = () => (
    <div
      className="border-4 border-double rounded-lg p-6 bg-white relative overflow-hidden"
      style={{ borderColor: colors.primary }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <Badge className="mb-2" style={{ backgroundColor: colors.secondary, color: 'white' }}>
          CERTIFICATE OF COMPLETION
        </Badge>
        <h2 className="text-2xl font-bold mt-2" style={{ color: colors.primary }}>
          {previewData.courseName}
        </h2>
      </div>

      {/* Decorative line */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex-1 h-px bg-gray-300" />
        <div className="mx-4 text-gray-400">★</div>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Recipient */}
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-2">This certifies that</p>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">
          {previewData.recipientName}
        </h3>
        <p className="text-gray-600">has successfully completed</p>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <p className="text-gray-700">{previewData.courseName}</p>
        <p className="text-sm text-gray-500 mt-1">
          Completion Date: {previewData.completionDate}
        </p>
        {previewData.grade && (
          <p className="text-sm text-gray-500">Grade: {previewData.grade}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-200">
        <div className="text-left">
          <p className="font-medium text-gray-700">{previewData.issuerName}</p>
          <p className="text-xs text-gray-500">Certificate Authority</p>
        </div>
        <div className="text-right">
          <div
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: colors.secondary }}
          >
            <span style={{ color: colors.secondary }}>✓</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Official Seal</p>
        </div>
      </div>
    </div>
  );

  const renderModernLayout = () => (
    <div
      className="rounded-lg overflow-hidden bg-white"
    >
      {/* Modern Header */}
      <div
        className="p-6 text-center"
        style={{ backgroundColor: colors.primary }}
      >
        <h2 className="text-white text-2xl font-bold">Certificate</h2>
        <p className="text-white/70 text-sm mt-1">of Achievement</p>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">Awarded to</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {previewData.recipientName}
          </h3>
        </div>

        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: colors.bg }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Course</p>
              <p className="font-medium text-gray-800">{previewData.courseName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Grade</p>
              <p className="font-bold" style={{ color: colors.primary }}>
                {previewData.grade || 'Pass'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
            <span className="text-gray-600">{previewData.completionDate}</span>
            <span className="font-medium" style={{ color: colors.primary }}>
              {previewData.issuerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div
      className="border rounded-lg p-4 bg-white"
      style={{ borderColor: colors.secondary }}
    >
      <div className="flex items-center justify-between">
        <div>
          <Badge style={{ backgroundColor: colors.secondary, color: 'white' }} className="mb-2">
            Certificate
          </Badge>
          <h3 className="font-bold text-gray-800">{previewData.recipientName}</h3>
          <p className="text-sm text-gray-600">{previewData.courseName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{previewData.grade}</p>
          <p className="text-xs text-gray-500">{previewData.completionDate}</p>
        </div>
      </div>
    </div>
  );

  const renderBadgeLayout = () => (
    <div className="text-center">
      <div
        className="w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: colors.primary }}
      >
        <span className="text-white text-4xl mb-1">🎓</span>
        <h4 className="text-white text-sm font-bold">CERTIFIED</h4>
      </div>
      <h3 className="mt-4 font-bold text-gray-800">{previewData.recipientName}</h3>
      <p className="text-sm text-gray-600">{previewData.courseName}</p>
      <p className="text-xs text-gray-500 mt-2">{previewData.completionDate}</p>
    </div>
  );

  const renderDetailedLayout = () => (
    <div
      className="border rounded-lg p-6 bg-white"
      style={{ borderColor: colors.primary }}
    >
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b" style={{ borderColor: colors.secondary }}>
        <Badge style={{ backgroundColor: colors.secondary, color: 'white' }} className="mb-2">
          OFFICIAL CERTIFICATE
        </Badge>
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Certificate of Excellence
        </h2>
      </div>

      {/* Recipient */}
      <div className="text-center mb-6">
        <p className="text-gray-500 mb-1">This is to certify that</p>
        <h3 className="text-3xl font-bold text-gray-800">{previewData.recipientName}</h3>
      </div>

      {/* Course */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-center">
          has successfully completed the requirements for
        </p>
        <h4 className="text-xl font-bold text-center mt-2" style={{ color: colors.primary }}>
          {previewData.courseName}
        </h4>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-medium text-gray-700">{previewData.completionDate}</p>
        </div>
        <div>
          <p className="text-gray-500">Grade</p>
          <p className="font-bold" style={{ color: colors.primary }}>{previewData.grade}</p>
        </div>
        <div>
          <p className="text-gray-500">Issuer</p>
          <p className="font-medium text-gray-700">{previewData.issuerName}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-4 border-t" style={{ borderColor: colors.secondary }}>
        <div>
          <div className="w-12 h-12 rounded-full" style={{ backgroundColor: colors.bg }} />
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-700">{previewData.issuerName}</p>
          <p className="text-xs text-gray-500">Certificate Authority</p>
        </div>
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'modern':
        return renderModernLayout();
      case 'compact':
        return renderCompactLayout();
      case 'badge':
        return renderBadgeLayout();
      case 'detailed':
        return renderDetailedLayout();
      case 'classic':
      default:
        return renderClassicLayout();
    }
  };

  if (compact) {
    return (
      <Card variant="default" padding="sm">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.bg }}
          >
            <span style={{ color: colors.primary }}>📜</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{template.name}</p>
            <p className="text-sm text-slate-400">
              {template.fields.length} fields • {layout}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-slate-400">{template.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge
            style={{ backgroundColor: colors.secondary, color: 'white' }}
          >
            {layout}
          </Badge>
          <Badge variant="neutral">{theme}</Badge>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="transform scale-[0.7] origin-top-left w-[143%]">
        {renderLayout()}
      </div>
    </div>
  );
}

// Helper component to render a list of templates as compact cards
export function TemplatePreviewList({
  templates,
  onSelect,
}: {
  templates: Template[];
  onSelect?: (template: Template) => void;
}) {
  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelect?.(template)}
          className="cursor-pointer"
        >
          <TemplatePreview template={template} compact />
        </div>
      ))}
    </div>
  );
}
