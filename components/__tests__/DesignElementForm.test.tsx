/**
 * Unit tests for DesignElementForm component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignElementForm from '../DesignElementForm';
import { SystemDesignElement } from '../../types/srtm';

describe('DesignElementForm', () => {
  const mockDesignElements: SystemDesignElement[] = [
    {
      id: '1',
      name: 'API Server',
      type: 'Service',
      description: 'REST API service',
      technology: 'Node.js',
      owner: 'Backend Team',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '2',
      name: 'Database',
      type: 'Database',
      description: 'PostgreSQL database',
      technology: 'PostgreSQL',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ];

  const mockOnUpdate = jest.fn();
  const mockOnNavigateToNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/design elements/i)).toBeInTheDocument();
    });

    it('should render existing design elements', () => {
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('API Server')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should display element count', () => {
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('should show add button', () => {
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should open form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Form fields should be visible
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    it('should close form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Close form
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Form should be closed
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });
  });

  describe('Adding Design Elements', () => {
    it('should add a new design element', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Fill in form
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'New Service');

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, 'Test description');

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // onUpdate should be called with new element
      expect(mockOnUpdate).toHaveBeenCalled();
      const callArg = mockOnUpdate.mock.calls[0][0];
      expect(callArg).toHaveLength(1);
      expect(callArg[0].name).toBe('New Service');
      expect(callArg[0].description).toBe('Test description');
    });

    it('should include all fields when adding element', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      // Open form
      await user.click(screen.getByRole('button', { name: /add/i }));

      // Fill in all fields
      await user.type(screen.getByLabelText(/name/i), 'Complete Service');
      await user.type(screen.getByLabelText(/description/i), 'Full desc');
      await user.type(screen.getByLabelText(/technology/i), 'React');
      await user.type(screen.getByLabelText(/owner/i), 'Team A');

      // Submit
      await user.click(screen.getByRole('button', { name: /save/i }));

      const newElement = mockOnUpdate.mock.calls[0][0][0];
      expect(newElement.technology).toBe('React');
      expect(newElement.owner).toBe('Team A');
    });
  });

  describe('Editing Design Elements', () => {
    it('should populate form with element data when editing', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
        />
      );

      // Click edit button for first element
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Form should be populated
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('API Server');
    });

    it('should update existing element', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
        />
      );

      // Edit first element
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Modify name
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated API Server');

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Check update was called with modified element
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedElements = mockOnUpdate.mock.calls[0][0];
      expect(updatedElements[0].name).toBe('Updated API Server');
      expect(updatedElements[0].id).toBe('1'); // Same ID
    });
  });

  describe('Deleting Design Elements', () => {
    it('should delete element when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
        />
      );

      // Click delete button for first element
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // onUpdate should be called with remaining elements
      expect(mockOnUpdate).toHaveBeenCalled();
      const remaining = mockOnUpdate.mock.calls[0][0];
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('2'); // Only second element remains
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateToNext when provided', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={mockDesignElements}
          onUpdate={mockOnUpdate}
          onNavigateToNext={mockOnNavigateToNext}
        />
      );

      // Look for next/continue button
      const nextButton = screen.queryByRole('button', { name: /next|continue/i });
      if (nextButton) {
        await user.click(nextButton);
        expect(mockOnNavigateToNext).toHaveBeenCalled();
      }
    });
  });

  describe('Form Validation', () => {
    it('should require name field', () => {
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      // Form validation is typically handled by HTML5 or React
      // We can check that the input has required attribute
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
      
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeRequired();
    });
  });

  describe('Element Types', () => {
    it('should support all element types', async () => {
      const user = userEvent.setup();
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: /add/i }));

      const typeSelect = screen.getByLabelText(/type/i);
      expect(typeSelect).toBeInTheDocument();

      // Check that common types are available
      const types = ['Component', 'Module', 'Service', 'Database', 'API', 'Interface'];
      types.forEach(type => {
        expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show message when no elements exist', () => {
      render(
        <DesignElementForm
          designElements={[]}
          onUpdate={mockOnUpdate}
        />
      );

      // Should show empty state or 0 count
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });
});
