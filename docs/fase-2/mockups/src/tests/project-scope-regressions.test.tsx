import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Project-scoped functional flows', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetStore();
  });

  it('creates a task in the project explicitly selected by the leader', async () => {
    usePrototypeStore.getState().loginAsRole('lider');
    window.history.pushState({}, '', '/app/lider/tareas');
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: /tareas del equipo/i }, { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: /crear tarea/i }));
    await user.selectOptions(screen.getByLabelText(/^proyecto$/i), 'prj-data');
    await user.type(screen.getByLabelText(/^título$/i), 'Validar cableado del laboratorio');
    await user.type(screen.getByLabelText(/^descripción$/i), 'Comprobar puntos de red y documentar los resultados.');
    await user.click(screen.getByRole('button', { name: /guardar tarea/i }));

    const task = usePrototypeStore.getState().tasks.find((item) => item.title === 'Validar cableado del laboratorio');
    expect(task?.projectId).toBe('prj-data');
    expect(usePrototypeStore.getState().activeProjectId).toBe('prj-data');
    expect(screen.getByText(/la tarea se creó en diseño de red lan/i)).toBeInTheDocument();
  });

  it('uses the active project as the source of truth for student task filtering', async () => {
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/estudiante/tareas');
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: /mis tareas/i }, { timeout: 3000 });
    expect(screen.getByText(/calibrar sensores/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/proyecto activo/i), 'prj-data');

    expect(await screen.findByText(/elaborar topologia fisica/i)).toBeInTheDocument();
    expect(screen.queryByText(/calibrar sensores/i)).not.toBeInTheDocument();
  });

  it('limits professor reviews to the active project', async () => {
    usePrototypeStore.getState().loginAsRole('profesor');
    window.history.pushState({}, '', '/app/profesor/revisiones');
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: /revisiones pendientes/i }, { timeout: 3000 });
    expect(screen.getByText(/calibrar sensores/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/proyecto activo/i), 'prj-data');

    expect(await screen.findByText(/este proyecto no tiene tareas con evidencia pendiente/i)).toBeInTheDocument();
    expect(screen.queryByText(/calibrar sensores/i)).not.toBeInTheDocument();
  });

  it('rejects assigning a task to someone outside the selected project', () => {
    const store = usePrototypeStore.getState();
    store.loginAsRole('lider');
    const count = usePrototypeStore.getState().tasks.length;
    const result = usePrototypeStore.getState().createTask({
      projectId: 'prj-data',
      title: 'Asignación inválida',
      description: 'No debe guardarse.',
      assigneeIds: ['usr-prof'],
      dueDate: '2026-08-20',
      priority: 'media',
      module: 'Tareas',
    });

    expect(result.ok).toBe(false);
    expect(usePrototypeStore.getState().tasks).toHaveLength(count);
  });

  it('recalculates progress when a completed task is reopened', () => {
    const store = usePrototypeStore.getState();
    store.loginAsRole('estudiante');
    expect(usePrototypeStore.getState().updateTaskStatus('tsk-01', 'completada').ok).toBe(true);
    expect(usePrototypeStore.getState().updateTaskStatus('tsk-01', 'en_progreso').ok).toBe(true);
    expect(usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01')?.progress).toBe(50);
  });

  it('shows a valid next action for an overdue task and rejects invalid routes', async () => {
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/estudiante/tareas/tsk-05');
    render(<App />);

    await screen.findByRole('heading', { name: /subir informe/i }, { timeout: 3000 });
    expect(screen.getByLabelText(/nuevo estado/i)).toHaveValue('en_progreso');

    act(() => {
      window.history.pushState({}, '', '/app/estudiante/tareas/no-existe');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByText(/tarea no encontrada/i)).toBeInTheDocument();
  });

  it('opens the notification control and marks an item as read', async () => {
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/estudiante');
    const user = userEvent.setup();
    render(<App />);

    const bell = await screen.findByRole('button', { name: /abrir notificaciones/i }, { timeout: 3000 });
    const unreadBefore = usePrototypeStore.getState().notifications.filter((item) => item.userId === 'usr-ana' && !item.read).length;
    await user.click(bell);
    expect(screen.getByRole('dialog', { name: /^notificaciones$/i })).toBeInTheDocument();
    const markButton = screen.getAllByRole('button', { name: /marcar leída/i })[0];
    await user.click(markButton);
    expect(usePrototypeStore.getState().notifications.filter((item) => item.userId === 'usr-ana' && !item.read)).toHaveLength(unreadBefore - 1);
  });
});
