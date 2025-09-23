import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from '../api';
import Retrieve from '../pages/Retrieve';

// Mock axios
jest.mock('../api');

describe('Retrieve Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should show loading message initially', async () => {
      // Mock a delayed response
      axios.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: [] }), 100)
      ));

      render(<Retrieve />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });

    it('should call retrieve API on mount', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/retrieve');
      });
    });
  });

  describe('Success States', () => {
    it('should render data list when loaded successfully', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Retrieve Data')).toBeInTheDocument();
        
        mockData.forEach(item => {
          expect(screen.getByText(item.name)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });
      });
    });

    it('should delete item successfully', async () => {
      const user = userEvent.setup();
      const initialData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const updatedData = [
        { id: 2, name: 'Item 2' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: initialData }); // Initial load
      axios.delete.mockResolvedValue({}); // Delete response
      axios.get.mockResolvedValueOnce({ data: updatedData }); // Refetch response

      render(<Retrieve />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
      });

      // Find and click delete button for first item
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('/retrieve/1');
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial + refetch
      });
    });

    it('should show empty state when no data', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Retrieve Data')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when fetch fails', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to retrieve data. Please try again later.')).toBeInTheDocument();
      });

      // Should not show loading or data
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should show error message when delete fails', async () => {
      const user = userEvent.setup();
      const mockData = [
        { id: 1, name: 'Item 1' }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });
      axios.delete.mockRejectedValue(new Error('Delete failed'));

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete item. Please try again.')).toBeInTheDocument();
      });

      // Item should still be visible
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      const authError = { response: { status: 401, data: { message: 'Unauthorized' } } };
      axios.get.mockRejectedValue(authError);

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to retrieve data. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      const serverError = { response: { status: 500, data: { message: 'Internal Server Error' } } };
      axios.get.mockRejectedValue(serverError);

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to retrieve data. Please try again later.')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should render list with correct structure', async () => {
      const mockData = [
        { id: 1, name: 'First Item' },
        { id: 2, name: 'Second Item' },
        { id: 3, name: 'Third Item' }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      render(<Retrieve />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        
        // Check each list item
        mockData.forEach(item => {
          expect(screen.getByText(item.name)).toBeInTheDocument();
        });

        // Check that we have correct number of delete buttons
        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons).toHaveLength(mockData.length);
      });
    });

    it('should handle items without required properties', async () => {
      const mockData = [
        { id: 1 }, // Missing name
        { name: 'Item without ID' }, // Missing id
        { id: 3, name: 'Valid Item' }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      render(<Retrieve />);
      
      await waitFor(() => {
        // Should still render the valid item
        expect(screen.getByText('Valid Item')).toBeInTheDocument();
      });
    });
  });

  describe('UI Interactions', () => {
    it('should handle multiple delete operations', async () => {
      const user = userEvent.setup();
      const initialData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];
      
      axios.get.mockResolvedValue({ data: initialData });
      axios.delete.mockResolvedValue({});

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(3);
      });

      // Delete first item
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('/retrieve/1');
      });

      // Delete second item
      await user.click(deleteButtons[1]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('/retrieve/2');
      });

      expect(axios.delete).toHaveBeenCalledTimes(2);
    });

    it('should refetch data after successful deletion', async () => {
      const user = userEvent.setup();
      const mockData = [{ id: 1, name: 'Item 1' }];
      
      axios.get.mockResolvedValue({ data: mockData });
      axios.delete.mockResolvedValue({});

      render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Initial load should have been called once
      expect(axios.get).toHaveBeenCalledTimes(1);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        // Should refetch data after deletion
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Component State Management', () => {
    it('should reset error state when data loads successfully', async () => {
      // First render with error
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      const { rerender } = render(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to retrieve data. Please try again later.')).toBeInTheDocument();
      });

      // Re-render with successful data
      axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Item 1' }] });
      
      rerender(<Retrieve />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.queryByText('Failed to retrieve data. Please try again later.')).not.toBeInTheDocument();
      });
    });

    it('should maintain loading state during operations', async () => {
      axios.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: [] }), 200)
      ));

      render(<Retrieve />);
      
      // Should be loading initially
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      
      // Loading should persist for the duration
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      
      // Should finish loading
      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });
  });
});