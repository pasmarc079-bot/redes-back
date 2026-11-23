import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetricsSettings from '@/admin/pages/settings/MetricsSettings';
import { siteApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  siteApi: {
    getSettingsFull: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

vi.mock('@/admin/components/ui/Toast', () => ({ showToast: vi.fn() }));

const metrics = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `metric-${index + 1}`,
    value: (index + 1) * 100,
    suffix: '+',
    label: `Métrica ${index + 1}`,
  }));

const mockSettings = (items: unknown[]) => {
  (siteApi.getSettingsFull as any).mockResolvedValue({
    data: [{ key: 'metrics_items', value: JSON.stringify(items) }],
  });
};

const savedMetrics = () => JSON.parse((siteApi.updateSettings as any).mock.calls[0][0].metrics_items);

describe('MetricsSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (siteApi.updateSettings as any).mockResolvedValue({ data: { success: true } });
  });

  it('muestra las métricas en una tabla con número, sufijo, etiqueta y acciones', async () => {
    mockSettings(metrics(3));
    render(<MetricsSettings />);

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const table = within(screen.getByRole('table'));
    expect(table.getByRole('columnheader', { name: 'Número' })).toBeInTheDocument();
    expect(table.getByRole('columnheader', { name: 'Sufijo' })).toBeInTheDocument();
    expect(table.getByRole('columnheader', { name: 'Etiqueta' })).toBeInTheDocument();
    expect(table.getByText('Métrica 2')).toBeInTheDocument();
    expect(table.getByText('200+')).toBeInTheDocument();
    expect(table.getAllByRole('button', { name: /Editar métrica/ })).toHaveLength(3);
    expect(table.getAllByRole('button', { name: /Quitar métrica/ })).toHaveLength(3);
  });

  it('agrega una métrica desde el modal y la guarda al instante', async () => {
    mockSettings(metrics(2));
    render(<MetricsSettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Agregar métrica/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Agregar métrica' })).toBeInTheDocument();

    await userEvent.clear(within(dialog).getByLabelText('Número'));
    await userEvent.type(within(dialog).getByLabelText('Número'), '750');
    await userEvent.type(within(dialog).getByLabelText('Etiqueta'), 'Personas bautizadas');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Agregar métrica' }));

    await waitFor(() => expect(siteApi.updateSettings).toHaveBeenCalled());
    const saved = savedMetrics();
    expect(saved).toHaveLength(3);
    expect(saved[2]).toMatchObject({ value: 750, suffix: '+', label: 'Personas bautizadas' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('abre el modal de edición con los valores guardados', async () => {
    mockSettings(metrics(2));
    render(<MetricsSettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    await userEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /Editar métrica 1/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Editar métrica' })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Número')).toHaveValue(100);
    expect(within(dialog).getByLabelText('Etiqueta')).toHaveValue('Métrica 1');
  });

  it('pide la etiqueta antes de guardar y explica qué falta', async () => {
    mockSettings(metrics(1));
    render(<MetricsSettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Agregar métrica/ }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Agregar métrica' }));

    expect(within(dialog).getByText('Escribe la etiqueta que aparecerá debajo del número.')).toBeInTheDocument();
    expect(siteApi.updateSettings).not.toHaveBeenCalled();
  });

  it('en el máximo de 8 el botón sigue activo y explica por qué no se puede agregar', async () => {
    mockSettings(metrics(8));
    render(<MetricsSettings />);
    await waitFor(() => expect(screen.getByText('8 de 8. Cada cambio se guarda al instante.')).toBeInTheDocument());

    const addButton = screen.getByRole('button', { name: /Agregar métrica/ });
    expect(addButton).toBeEnabled();
    await userEvent.click(addButton);

    expect(screen.getByRole('status')).toHaveTextContent('hasta 8 números, en dos filas de cuatro');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
