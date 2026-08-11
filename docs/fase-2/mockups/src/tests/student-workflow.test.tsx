import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Student workflow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetStore();
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/estudiante/tareas/tsk-01');
  });

  it('updates task status, recalculates progress, comments and attaches evidence', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: /calibrar sensores/i }, { timeout: 3000 })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/nuevo estado/i), 'completada');
    await user.click(screen.getByRole('button', { name: /actualizar tarea/i }));
    expect(screen.getByText(/tarea se actualizó correctamente/i)).toBeInTheDocument();
    expect(usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01')?.status).toBe('completada');
    expect(usePrototypeStore.getState().projects.find((project) => project.id === 'prj-invernadero')?.progress).toBeGreaterThan(46);

    await user.type(screen.getByLabelText(/nuevo comentario/i), 'Se completó la revisión de la calibración.');
    await user.click(screen.getByRole('button', { name: /publicar comentario/i }));
    expect(screen.getByText(/Se completó la revisión de la calibración/i)).toBeInTheDocument();

    const file = new File(['evidencia ficticia'], 'prueba-sensor.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/adjuntar evidencia simulada/i), file);
    expect(screen.getByText(/evidencia se adjuntó correctamente/i)).toBeInTheDocument();
    expect(usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01')?.evidences.some((item) => item.fileName === file.name)).toBe(true);
  });
});
