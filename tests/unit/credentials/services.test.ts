/**
 * Template Service Tests - Services Module
 *
 * Tests for template CRUD operations and template application.
 * Reference: Design_spec/05_Template_Service.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Template, TemplateField, VisualConfig } from '@/types';
import {
  createTemplate,
  getTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  createDefaultVisualConfig,
  getDefaultCertificateFields,
  clearMockTemplates,
} from '../../../src/lib/credentials/services';

describe('Template Service', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    clearMockTemplates();
  });

  // Test fixtures
  const testClusterId = 'cluster_123';
  const testTemplateName = 'Standard Certificate';
  const testTemplateDescription = 'Default template for course completion certificates';

  const defaultFields: TemplateField[] = [
    { id: 'recipientName', name: 'recipientName', type: 'text', required: true, label: 'Recipient Name' },
    { id: 'courseName', name: 'courseName', type: 'text', required: true, label: 'Course Name' },
    { id: 'completionDate', name: 'completionDate', type: 'date', required: true, label: 'Completion Date' },
  ];

  const customVisualConfig: VisualConfig = {
    layout: 'modern',
    branding: {
      logoUrl: 'https://example.com/logo.png',
      sealUrl: 'https://example.com/seal.png',
      logoPosition: 'left',
      sealPosition: 'right',
      showProviderName: true,
    },
    typography: {
      fontFamily: 'Inter',
      headingFontFamily: 'Inter',
      fontSize: 'md',
      headingWeight: 'bold',
    },
    colors: {
      theme: 'blue',
      primaryColor: '#3B82F6',
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
      grades: { id: 'grades', visible: false, order: 4 },
      skills: { id: 'skills', visible: false, order: 5 },
      metadata: { id: 'metadata', visible: false, order: 6 },
      footer: { id: 'footer', visible: true, order: 7 },
    },
  };

  describe('createTemplate', () => {
    // Test: Create template with required fields only
    // Input: clusterId, name, fields array
    // Expected: Template created with generated id and timestamps
    it('should create template with required fields', async () => {
      const result = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^tmpl_[0-9a-f]+$/);
      expect(result.clusterId).toBe(testClusterId);
      expect(result.name).toBe(testTemplateName);
      expect(result.fields).toEqual(defaultFields);
      expect(result.createdAt).toBeDefined();
    });

    // Test: Create template with description
    // Input: Template with description
    // Expected: Description is stored
    it('should create template with description', async () => {
      const result = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        description: testTemplateDescription,
        fields: defaultFields,
      });

      expect(result.description).toBe(testTemplateDescription);
    });

    // Test: Create template with visual config
    // Input: Template with custom visual config
    // Expected: Visual config is stored
    it('should create template with visual config', async () => {
      const result = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
        visual: customVisualConfig,
      });

      expect(result.visual).toBeDefined();
      expect(result.visual?.layout).toBe('modern');
    });

    // Test: Template ID is unique
    // Input: Create two templates
    // Expected: Each has unique id
    it('should generate unique template IDs', async () => {
      const template1 = await createTemplate({
        clusterId: testClusterId,
        name: 'Template 1',
        fields: defaultFields,
      });

      const template2 = await createTemplate({
        clusterId: testClusterId,
        name: 'Template 2',
        fields: defaultFields,
      });

      expect(template1.id).not.toBe(template2.id);
    });
  });

  describe('getTemplate', () => {
    // Test: Retrieve existing template by ID
    // Input: templateId from created template
    // Expected: Returns full template object
    it('should retrieve existing template by ID', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const retrieved = await getTemplate(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(testTemplateName);
    });

    // Test: Return null for non-existent template
    // Input: Template ID that was never created
    // Expected: Returns null
    it('should return null for non-existent template', async () => {
      const result = await getTemplate('tmpl_nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTemplates', () => {
    // Test: Get all templates for a cluster
    // Input: Create 3 templates for same cluster
    // Expected: Returns all 3 templates
    it('should get all templates for a cluster', async () => {
      await createTemplate({ clusterId: testClusterId, name: 'Template 1', fields: defaultFields });
      await createTemplate({ clusterId: testClusterId, name: 'Template 2', fields: defaultFields });
      await createTemplate({ clusterId: testClusterId, name: 'Template 3', fields: defaultFields });

      const templates = await getTemplates(testClusterId);

      expect(templates).toHaveLength(3);
    });

    // Test: Return empty array for cluster with no templates
    // Input: Cluster ID with no templates
    // Expected: Returns empty array
    it('should return empty array for cluster with no templates', async () => {
      const templates = await getTemplates('cluster_no_templates');

      expect(templates).toHaveLength(0);
    });

    // Test: Only return templates for specified cluster
    // Input: Templates for cluster A and cluster B
    // Expected: getTemplates(clusterA) returns only cluster A templates
    it('should only return templates for specified cluster', async () => {
      await createTemplate({ clusterId: 'cluster_A', name: 'Template A1', fields: defaultFields });
      await createTemplate({ clusterId: 'cluster_A', name: 'Template A2', fields: defaultFields });
      await createTemplate({ clusterId: 'cluster_B', name: 'Template B1', fields: defaultFields });

      const clusterATemplates = await getTemplates('cluster_A');

      expect(clusterATemplates).toHaveLength(2);
      expect(clusterATemplates.every((t) => t.clusterId === 'cluster_A')).toBe(true);
    });
  });

  describe('updateTemplate', () => {
    // Test: Update template name
    // Input: Existing template with new name
    // Expected: Name is updated, other fields preserved
    it('should update template name', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: 'Original Name',
        fields: defaultFields,
      });

      const updated = await updateTemplate(created.id, { name: 'Updated Name' });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.fields).toEqual(defaultFields);
      expect(updated?.updatedAt).toBeDefined();
    });

    // Test: Update template description
    // Input: Template with new description
    // Expected: Description is updated
    it('should update template description', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const updated = await updateTemplate(created.id, { description: 'New description' });

      expect(updated?.description).toBe('New description');
    });

    // Test: Update template fields
    // Input: Template with new fields array
    // Expected: Fields are updated
    it('should update template fields', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const newFields: TemplateField[] = [
        { id: 'name', name: 'name', type: 'text', required: true },
      ];

      const updated = await updateTemplate(created.id, { fields: newFields });

      expect(updated?.fields).toEqual(newFields);
    });

    // Test: Update non-existent template
    // Input: Template ID that doesn't exist
    // Expected: Returns null
    it('should return null for non-existent template update', async () => {
      const result = await updateTemplate('tmpl_nonexistent', { name: 'New Name' });

      expect(result).toBeNull();
    });

    // Test: Update sets updatedAt timestamp
    // Input: Existing template
    // Expected: updatedAt is set when update succeeds
    it('should set updatedAt timestamp on update', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const updated = await updateTemplate(created.id, { name: 'Updated' });

      expect(updated?.updatedAt).toBeDefined();
    });
  });

  describe('deleteTemplate', () => {
    // Test: Delete existing template
    // Input: Template ID that exists
    // Expected: Returns true, template no longer retrievable
    it('should delete existing template', async () => {
      const created = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const deleted = await deleteTemplate(created.id);

      expect(deleted).toBe(true);

      // Verify it's gone
      const retrieved = await getTemplate(created.id);
      expect(retrieved).toBeNull();
    });

    // Test: Delete non-existent template
    // Input: Template ID that doesn't exist
    // Expected: Returns false (Map.delete returns false for missing key)
    it('should return false for non-existent template deletion', async () => {
      const result = await deleteTemplate('tmpl_nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('applyTemplate', () => {
    // Test: Apply template to data with all fields
    // Input: Template with fields and data containing all field values
    // Expected: Returns object with all field values applied
    it('should apply template to data with all fields', async () => {
      const template = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const data = {
        recipientName: 'John Doe',
        courseName: 'CKB Fundamentals',
        completionDate: '2024-01-15',
      };

      const applied = applyTemplate(template, data);

      expect(applied).toEqual(data);
    });

    // Test: Apply template with default values
    // Input: Template with field that has defaultValue, data missing that field
    // Expected: Default value is applied
    it('should apply template default values', async () => {
      const templateWithDefaults: Template = {
        id: 'tmpl_test',
        clusterId: testClusterId,
        name: 'Template with Defaults',
        fields: [
          { id: 'name', name: 'name', type: 'text', required: true },
          { id: 'course', name: 'course', type: 'text', required: false, defaultValue: 'Default Course' },
        ],
        createdAt: new Date().toISOString(),
      };

      const data = { name: 'John' };
      const applied = applyTemplate(templateWithDefaults, data);

      expect(applied.name).toBe('John');
      expect(applied.course).toBe('Default Course');
    });

    // Test: Apply template to partial data
    // Input: Data missing some template fields
    // Expected: Only present fields are applied
    it('should handle partial data', async () => {
      const template = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const partialData = {
        recipientName: 'Jane Doe',
        courseName: 'CKB Advanced',
        // Missing completionDate
      };

      const applied = applyTemplate(template, partialData);

      expect(applied.recipientName).toBe('Jane Doe');
      expect(applied.courseName).toBe('CKB Advanced');
      expect('completionDate' in applied).toBe(false);
    });

    // Test: Apply template with empty data
    // Input: Empty data object
    // Expected: Returns object with only default values
    it('should handle empty data', async () => {
      const template = await createTemplate({
        clusterId: testClusterId,
        name: testTemplateName,
        fields: defaultFields,
      });

      const applied = applyTemplate(template, {});

      expect(Object.keys(applied)).toHaveLength(0);
    });
  });

  describe('createDefaultVisualConfig', () => {
    // Test: Create default visual config
    // Input: No arguments
    // Expected: Returns complete VisualConfig with defaults
    it('should create complete default visual config', () => {
      const config = createDefaultVisualConfig();

      expect(config.layout).toBe('classic');
      expect(config.branding).toBeDefined();
      expect(config.branding.logoPosition).toBe('left');
      expect(config.branding.sealPosition).toBe('right');
      expect(config.typography).toBeDefined();
      expect(config.typography.fontFamily).toBe('Inter, system-ui, sans-serif');
      expect(config.colors).toBeDefined();
      expect(config.colors.theme).toBe('blue');
      expect(config.effects).toBeDefined();
      expect(config.effects.shadow).toBe(true);
      expect(config.sections).toBeDefined();
      expect(config.sections.header.visible).toBe(true);
    });
  });

  describe('getDefaultCertificateFields', () => {
    // Test: Get default certificate fields
    // Input: No arguments
    // Expected: Returns array of standard certificate fields
    it('should return standard certificate fields', () => {
      const fields = getDefaultCertificateFields();

      expect(fields.length).toBeGreaterThan(0);
      expect(fields.find((f) => f.id === 'recipientName')).toBeDefined();
      expect(fields.find((f) => f.id === 'courseName')).toBeDefined();
      expect(fields.find((f) => f.id === 'completionDate')).toBeDefined();
    });

    // Test: Required fields are marked correctly
    // Input: Default certificate fields
    // Expected: recipientName, courseName, completionDate are required
    it('should mark required fields correctly', () => {
      const fields = getDefaultCertificateFields();

      const recipientField = fields.find((f) => f.id === 'recipientName');
      const courseField = fields.find((f) => f.id === 'courseName');
      const dateField = fields.find((f) => f.id === 'completionDate');

      expect(recipientField?.required).toBe(true);
      expect(courseField?.required).toBe(true);
      expect(dateField?.required).toBe(true);
    });

    // Test: Optional fields are marked correctly
    // Input: Default certificate fields
    // Expected: grade, score are not required
    it('should mark optional fields correctly', () => {
      const fields = getDefaultCertificateFields();

      const gradeField = fields.find((f) => f.id === 'grade');
      const scoreField = fields.find((f) => f.id === 'score');

      expect(gradeField?.required).toBe(false);
      expect(scoreField?.required).toBe(false);
    });

    // Test: Select field has options
    // Input: Default certificate fields
    // Expected: grade field has options array
    it('should have options for select fields', () => {
      const fields = getDefaultCertificateFields();

      const gradeField = fields.find((f) => f.id === 'grade');
      expect(gradeField?.options).toBeDefined();
      expect(gradeField?.options?.length).toBeGreaterThan(0);
    });
  });

  describe('Template CRUD integration', () => {
    // Test: Full CRUD lifecycle
    // Input: Create, read, update, delete
    // Expected: Each operation works correctly
    it('should handle full CRUD lifecycle', async () => {
      // Create
      const created = await createTemplate({
        clusterId: testClusterId,
        name: 'CRUD Test Template',
        description: 'Testing CRUD operations',
        fields: defaultFields,
      });
      expect(created.id).toBeDefined();

      // Read
      const retrieved = await getTemplate(created.id);
      expect(retrieved?.name).toBe('CRUD Test Template');

      // Update
      const updated = await updateTemplate(created.id, {
        name: 'Updated CRUD Template',
        description: 'Updated description',
      });
      expect(updated?.name).toBe('Updated CRUD Template');
      expect(updated?.description).toBe('Updated description');

      // Delete
      const deleted = await deleteTemplate(created.id);
      expect(deleted).toBe(true);

      // Verify deleted
      const afterDelete = await getTemplate(created.id);
      expect(afterDelete).toBeNull();
    });
  });
});
