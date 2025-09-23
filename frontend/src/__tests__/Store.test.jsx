import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from '../api';
import Store from '../pages/Store';

// Mock axios
jest.mock('../api');

describe('Store Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should show loading message initially', async () => {
      // Mock a delayed response
      axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));

      render(<Store />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });

    it('should call fetchData API on mount', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<Store />);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/data');
      });
    });
  });

  describe('Success States', () => {
    it('should render form and data list when loaded successfully', async () => {
      const mockData = ['Item 1', 'Item 2', 'Item 3'];
      axios.get.mockResolvedValue({ data: mockData });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Data Store')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('New Item')).toBeInTheDocument();
        expect(screen.getByText('Add Item')).toBeInTheDocument();
        
        mockData.forEach(item => {
          expect(screen.getByText(item)).toBeInTheDocument();
        });
      });
    });

    it('should add new item successfully', async () => {
      const user = userEvent.setup();
      const initialData = ['Item 1'];
      const newItemResponse = { data: 'New Item' };
      
      axios.get.mockResolvedValue({ data: initialData });
      axios.post.mockResolvedValue(newItemResponse);

      render(<Store />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');
      const button = screen.getByText('Add Item');

      // Type in input
      await user.type(input, 'New Item');
      expect(input).toHaveValue('New Item');

      // Submit form
      await user.click(button);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/data', { item: 'New Item' });
      });

      // Check that input is cleared
      expect(input).toHaveValue('');
    });

    it('should show submitting state when adding item', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });
      
      // Mock a delayed post response
      axios.post.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: 'New Item' }), 100)
      ));

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');
      const button = screen.getByText('Add Item');

      await user.type(input, 'Test Item');
      await user.click(button);

      // Should show submitting state
      expect(screen.getByText('Adding...')).toBeInTheDocument();
      expect(button).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when fetch fails', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      });

      // Should not show loading or data
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should show error message when add item fails', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });
      axios.post.mockRejectedValue(new Error('Server Error'));

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');
      const button = screen.getByText('Add Item');

      await user.type(input, 'Test Item');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to add item')).toBeInTheDocument();
      });

      // Form should be reset and enabled
      expect(input).toHaveValue('');
      expect(button).toBeEnabled();
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      const authError = { response: { status: 401 } };
      axios.get.mockRejectedValue(authError);

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require input before submission', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });

      const button = screen.getByText('Add Item');
      
      // Try to submit empty form
      await user.click(button);

      // Should not call API
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should clear input after successful submission', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });
      axios.post.mockResolvedValue({ data: 'New Item' });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');

      await user.type(input, 'Test Item');
      await user.click(screen.getByText('Add Item'));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('UI Interactions', () => {
    it('should handle form submission with Enter key', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });
      axios.post.mockResolvedValue({ data: 'New Item' });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('New Item')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');

      await user.type(input, 'Test Item');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/data', { item: 'Test Item' });
      });
    });

    it('should update input value as user types', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValue({ data: [] });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('New Item')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('New Item');

      await user.type(input, 'Testing 123');
      expect(input).toHaveValue('Testing 123');

      await user.clear(input);
      expect(input).toHaveValue('');
    });
  });

  describe('Data Display', () => {
    it('should render empty state when no data', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<Store />);
      
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });

      // Should still show the form
      expect(screen.getByPlaceholderText('New Item')).toBeInTheDocument();
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    it('should render list with multiple items', async () => {
      const mockData = ['First Item', 'Second Item', 'Third Item'];
      axios.get.mockResolvedValue({ data: mockData });

      render(<Store />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        
        mockData.forEach((item, index) => {
          expect(screen.getByText(item)).toBeInTheDocument();
        });
      });
    });
  });
});