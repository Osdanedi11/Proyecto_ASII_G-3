import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Leader workflows', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetStore();
    usePrototypeStore.getState().loginAsRole('lider');
  });

  it('edits a task through an accessible modal', async () => {
    window.history.pushState({}, '', '/app/lider/tareas');
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: /tareas del equipo/i }, { timeout: 3000 })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /editar/i })[0]);
    const title = screen.getByLabelText(/^título$/i);
    await user.clear(title);
    await user.type(title, 'Calibración final de sensores');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(screen.getByText(/tarea se actualizó correctamente/i)).toBeInTheDocument();
    expect(usePrototypeStore.getState().auditLogs[0].action).toBe('Tarea editada');
  });

  it('creates a project with members and a mock schedule', async () => {
    window.history.pushState({}, '', '/app/lider/proyecto');
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: /proyecto actual/i }, { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: /crear proyecto$/i }));
    await user.type(screen.getByLabelText(/nombre del proyecto/i), 'Robot seguidor de línea');
    await user.type(screen.getByLabelText(/asignatura o especialidad/i), 'Electrónica');
    await user.type(screen.getByLabelText(/descripción y objetivo académico/i), 'Construir un robot autónomo para la feria técnica.');
    await user.click(screen.getByRole('checkbox', { name: /Valeria Mora/i }));
    await user.click(screen.getByRole('button', { name: /crear proyecto y cronograma/i }));

    const project = usePrototypeStore.getState().projects.find((entry) => entry.name === 'Robot seguidor de línea');
    expect(project?.leaderId).toBe('usr-sofia');
    expect(usePrototypeStore.getState().projectSchedules.some((schedule) => schedule.projectId === project?.id)).toBe(true);
  });
});
