/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IncidentCard } from '../../components/IncidentCard';

// Mock the Button component since it's from a UI library
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>{children}</h3>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>{children}</div>
  ),
}));

// Mock the Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

// Mock the getBadgeVariantForStatus utility
jest.mock('@/lib/getBadgeVariantForStatus', () => ({
  getBadgeVariantForStatus: jest.fn().mockReturnValue('default'),
}));

describe('IncidentCard', () => {
  const mockProps = {
    title: 'Test Incident',
    status: 'Open',
    reporter: 'John Doe',
    department: 'IT',
    createdAt: new Date('2023-12-25'),
  };

  it('renders incident information correctly', () => {
    render(<IncidentCard {...mockProps} />);
    
    // Check that the title is rendered
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
    
    // Check that the status badge is rendered
    expect(screen.getByText('Open')).toBeInTheDocument();
    
    // Check that reporter information is rendered
    expect(screen.getByText('Reported by John Doe')).toBeInTheDocument();
    
    // Check that department information is rendered
    expect(screen.getByText('Department: IT')).toBeInTheDocument();
    
    // Check that creation date is rendered
    expect(screen.getByText('Created: 12/25/2023')).toBeInTheDocument();
    
    // Check that the button is rendered
    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
  });

  it('applies the correct badge variant', () => {
    const { getBadgeVariantForStatus } = require('@/lib/getBadgeVariantForStatus');
    getBadgeVariantForStatus.mockReturnValue('destructive');
    
    render(<IncidentCard {...mockProps} />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });
});