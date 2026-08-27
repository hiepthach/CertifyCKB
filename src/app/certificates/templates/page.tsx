'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Button, Modal, Card, Spinner } from '@/components/ui';
import { TemplateList, TemplateForm, TemplatePreview } from '@/components/template';
import { Plus, ArrowLeft } from 'lucide-react';
import type { Cluster, Template } from '@/types';
import { getCluster, getTemplates } from '@/lib/credentials';

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isLoadingAddress } = useWallet();
  const clusterId = searchParams.get('cluster');

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (clusterId) {
        try {
          const [clusterData, templateData] = await Promise.all([
            getCluster(clusterId),
            getTemplates(clusterId),
          ]);
          setCluster(clusterData);
          setTemplates(templateData);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [clusterId]);

  const handleTemplateCreated = (template: Template) => {
    setTemplates((prev) => [...prev, template]);
    setShowCreateModal(false);
  };

  const handleTemplateDeleted = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setSelectedTemplate(null);
  };

  if (isLoadingAddress || loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading templates..." />
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Cluster Not Selected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Please select a cluster to manage certificate templates.
          </p>
          <Button onClick={() => router.push('/clusters')} className="text-xs">
            Go to Clusters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-fog-line/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="text-mid-ash hover:text-bone-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-lavender-spark text-sm font-bold">✱</span>
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Credential Templates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Templates</h1>
          <p className="text-sm text-ash-veil mt-1">
            Create and manage certificate templates for {cluster.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-1.5 text-xs shadow-glow-green/30">
          <Plus className="w-3.5 h-3.5" />
          Create Template
        </Button>
      </div>

      {/* Templates List */}
      <TemplateList
        templates={templates}
        clusterId={clusterId}
        onSelect={setSelectedTemplate}
        onDelete={handleTemplateDeleted}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Certificate Template"
        size="lg"
      >
        <TemplateForm
          clusterId={clusterId}
          onSave={handleTemplateCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name || 'Template Preview'}
        size="xl"
      >
        {selectedTemplate && (
          <TemplatePreview
            template={selectedTemplate}
            data={{
              recipientName: 'John Doe',
              courseName: 'CKB Development Fundamentals',
              completionDate: 'January 15, 2024',
              grade: 'A',
              issuerName: cluster.name,
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <TemplatesPageContent />
    </Suspense>
  );
}
