'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import type { CredentialSubject } from '@/types';

interface CertificateFormProps {
  clusterId: string;
  clusterName: string;
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
  onSubmit,
  onCancel,
  loading = false,
}: CertificateFormProps) {
  const [formData, setFormData] = useState<CertificateData>({
    recipientAddress: '',
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
    } else if (!formData.recipientAddress.startsWith('ckt')) {
      newErrors.recipientAddress = 'Invalid CKB address format (must start with ckt)';
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
      <div className="p-4 bg-slate-800/50 rounded-lg mb-6">
        <p className="text-sm text-slate-400">Issuing certificate for:</p>
        <p className="font-semibold text-white">{clusterName}</p>
      </div>

      <Input
        label="Recipient CKB Address"
        placeholder="ckt1q..."
        value={formData.recipientAddress}
        onChange={(v) => updateField('recipientAddress', v)}
        error={errors.recipientAddress}
        required
      />

      <Input
        label="Recipient Name"
        placeholder="John Doe"
        value={formData.recipientName}
        onChange={(v) => updateField('recipientName', v)}
        error={errors.recipientName}
        required
      />

      <Input
        label="Course Name"
        placeholder="CKB Development Fundamentals"
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
        <label className="block text-sm font-medium text-slate-300">
          Grade (Optional)
        </label>
        <select
          value={formData.grade}
          onChange={(e) => updateField('grade', e.target.value || undefined)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select grade...</option>
          {GRADE_OPTIONS.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Score (%)"
        type="number"
        placeholder="95"
        value={formData.score?.toString() || ''}
        onChange={(v) => updateField('score', v ? parseInt(v, 10) : undefined)}
        error={errors.score}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Skills (Optional)
        </label>
        <input
          type="text"
          placeholder="Rust, CKB-VM, Cell Model (comma-separated)"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-500">
          Enter skills separated by commas
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          Issue Certificate
        </Button>
      </div>
    </form>
  );
}
