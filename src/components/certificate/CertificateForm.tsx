'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import type { CredentialSubject } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CertificateFormProps {
  clusterId: string;
  clusterName: string;
  defaultRecipientAddress?: string;
  onSubmit: (data: CertificateData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export interface CertificateData {
  recipientAddress: string;
  recipientName: string;
  courseName: string;
  completionDate: string;
  grade?: string;
  score?: number;
  skills?: string[];
}

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'Pass', 'Fail'];

export function CertificateForm({
  clusterId,
  clusterName,
  defaultRecipientAddress,
  onSubmit,
  onCancel,
  loading = false,
}: CertificateFormProps) {
  const [formData, setFormData] = useState<CertificateData>({
    recipientAddress: defaultRecipientAddress || '',
    recipientName: '',
    courseName: '',
    completionDate: new Date().toISOString().split('T')[0],
    grade: '',
    score: undefined,
    skills: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillsInput, setSkillsInput] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientAddress.trim()) {
      newErrors.recipientAddress = 'Recipient address is required';
    } else if (!formData.recipientAddress.startsWith('ckt') && !formData.recipientAddress.startsWith('ckb')) {
      newErrors.recipientAddress = 'Invalid CKB address format (must start with ckt or ckb)';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!formData.completionDate) {
      newErrors.completionDate = 'Completion date is required';
    }

    if (formData.score !== undefined && (formData.score < 0 || formData.score > 100)) {
      newErrors.score = 'Score must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      skills: skillsInput
        ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    });
  };

  const updateField = (field: keyof CertificateData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-midnight-plum rounded-xl border border-fog-line/10 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-mid-ash uppercase tracking-wider font-semibold">Issuing Provider Authority</p>
          <p className="font-semibold text-bone-white text-base mt-0.5">{clusterName}</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-shadow-plum text-lavender-spark border border-lavender-spark/20">
          Spore Cluster
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-ash-veil">
            Recipient CKB Address <span className="text-lavender-spark">*</span>
          </label>
          {defaultRecipientAddress && formData.recipientAddress !== defaultRecipientAddress && (
            <button
              type="button"
              onClick={() => updateField('recipientAddress', defaultRecipientAddress)}
              className="text-[11px] text-lavender-spark hover:underline"
            >
              Use my connected address
            </button>
          )}
        </div>
        <Input
          placeholder="ckt1qzda0cr08m85hc8j..."
          value={formData.recipientAddress}
          onChange={(v) => updateField('recipientAddress', v)}
          error={errors.recipientAddress}
          required
        />
      </div>

      <Input
        label="Recipient Full Name"
        placeholder="e.g., Jane Doe"
        value={formData.recipientName}
        onChange={(v) => updateField('recipientName', v)}
        error={errors.recipientName}
        required
      />

      <Input
        label="Course / Program Name"
        placeholder="e.g., Advanced CKB Cell Model & DOB Engineering"
        value={formData.courseName}
        onChange={(v) => updateField('courseName', v)}
        error={errors.courseName}
        required
      />

      <Input
        label="Completion Date"
        type="date"
        value={formData.completionDate}
        onChange={(v) => updateField('completionDate', v)}
        error={errors.completionDate}
        required
      />

      {/* Grade */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-ash-veil">
          Grade (Optional)
        </label>
        <select
          value={formData.grade}
          onChange={(e) => updateField('grade', e.target.value || undefined)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-plum border border-fog-line/15 text-bone-white text-sm focus:outline-none focus:ring-2 focus:ring-lavender-spark/40 focus:border-lavender-spark/50 transition-all duration-200"
        >
          <option value="" className="bg-midnight-plum text-ash-veil">Select grade...</option>
          {GRADE_OPTIONS.map((grade) => (
            <option key={grade} value={grade} className="bg-midnight-plum text-bone-white">
              {grade}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Score (% - Optional)"
        type="number"
        placeholder="98"
        value={formData.score?.toString() || ''}
        onChange={(v) => updateField('score', v ? parseInt(v, 10) : undefined)}
        error={errors.score}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-ash-veil">
          Skills Certified (Optional)
        </label>
        <input
          type="text"
          placeholder="Rust, CKB-VM, Spore DOBs, Cryptography (comma-separated)"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-plum border border-fog-line/15 text-bone-white placeholder-mid-ash text-sm focus:outline-none focus:ring-2 focus:ring-lavender-spark/40 focus:border-lavender-spark/50 transition-all duration-200"
        />
        <p className="text-[11px] text-mid-ash">
          Enter acquired skills separated by commas
        </p>
      </div>

      <div className="flex gap-3 pt-5 border-t border-fog-line/10">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1 text-xs shadow-glow-green/30 gap-1.5">
          <span>Mint Spore DOB Certificate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </form>
  );
}

