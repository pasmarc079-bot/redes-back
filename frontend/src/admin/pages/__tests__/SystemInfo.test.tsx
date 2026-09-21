import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SystemInfo from '@/admin/pages/SystemInfo';

describe('SystemInfo — Layout & Spacing', () => {
  it('renders the main container with proper padding classes', () => {
    render(<SystemInfo />);
    const container = screen.getByTestId('system-info-container');
    expect(container).toHaveClass('p-6');
    expect(container).toHaveClass('md:p-8');
    expect(container).toHaveClass('max-w-7xl');
    expect(container).toHaveClass('mx-auto');
  });

  it('has vertical spacing between sections', () => {
    render(<SystemInfo />);
    const container = screen.getByTestId('system-info-container');
    expect(container).toHaveClass('space-y-8');
  });

  it('renders the header title', () => {
    render(<SystemInfo />);
    expect(screen.getByRole('heading', { level: 1, name: /Acerca del Sistema/ })).toBeInTheDocument();
  });

  it('renders the architecture section', () => {
    render(<SystemInfo />);
    expect(screen.getByText('Arquitectura General')).toBeInTheDocument();
    expect(screen.getByText(/Frontend \(Puerto 5173\)/)).toBeInTheDocument();
    expect(screen.getByText(/Admin \(Puerto 5173\)/)).toBeInTheDocument();
    expect(screen.getByText(/Backend \(Puerto 8080\)/)).toBeInTheDocument();
  });

  it('architecture cards have proper padding and rounded corners', () => {
    render(<SystemInfo />);
    const frontendCard = screen.getByText(/Frontend \(Puerto 5173\)/).closest('div')!;
    expect(frontendCard).toHaveClass('p-4');
    expect(frontendCard).toHaveClass('rounded-xl');
  });

  it('renders the technologies section', () => {
    render(<SystemInfo />);
    expect(screen.getByText('Tecnologías Utilizadas')).toBeInTheDocument();
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL 16')).toBeInTheDocument();
    expect(screen.getByText('Cloudinary')).toBeInTheDocument();
  });

  it('technology items are in a grid layout', () => {
    render(<SystemInfo />);
    const techGrid = screen.getByText('Tecnologías Utilizadas')
      .closest('.card')!
      .querySelector('.grid');
    expect(techGrid).toBeInTheDocument();
    expect(techGrid).toHaveClass('grid-cols-1');
    expect(techGrid).toHaveClass('md:grid-cols-2');
    expect(techGrid).toHaveClass('lg:grid-cols-3');
  });

  it('renders the API endpoints table', () => {
    render(<SystemInfo />);
    expect(screen.getByText('Endpoints Principales')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/health')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/admin/media/upload')).toBeInTheDocument();
  });

  it('endpoints table has method badges', () => {
    render(<SystemInfo />);
    const getBadges = screen.getAllByText('GET');
    expect(getBadges.length).toBeGreaterThan(0);
    getBadges.forEach((badge) => {
      expect(badge).toHaveClass('badge');
    });
  });

  it('renders the credentials section', () => {
    render(<SystemInfo />);
    expect(screen.getByText('Credenciales de Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('pasmarc079')).toBeInTheDocument();
    expect(screen.getByText('Excelencia079')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.getByText('editor123')).toBeInTheDocument();
  });

  it('credentials cards have proper padding', () => {
    render(<SystemInfo />);
    const adminCard = screen.getByText('Admin Principal').closest('.p-4')!;
    expect(adminCard).toHaveClass('p-4');
    expect(adminCard).toHaveClass('rounded-lg');
  });

  it('all cards use the card CSS class', () => {
    render(<SystemInfo />);
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('all card-body sections have explicit padding class', () => {
    render(<SystemInfo />);
    const cardBodies = document.querySelectorAll('.card-body');
    expect(cardBodies.length).toBeGreaterThanOrEqual(4);
    cardBodies.forEach((body) => {
      expect(body.className).toContain('card-body');
      expect(body.className).toContain('p-6');
    });
  });

  it('container has max-w-7xl and mx-auto classes', () => {
    render(<SystemInfo />);
    const container = screen.getByTestId('system-info-container');
    expect(container.className).toContain('max-w-7xl');
    expect(container.className).toContain('mx-auto');
  });
});
