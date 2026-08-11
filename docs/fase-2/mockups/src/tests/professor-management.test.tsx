import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Professor review workflow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetStore();
    usePrototypeStore.getState().loginAsRole('profesor');
    window.history.pushState({}, '', '/app/profesor/revisiones/tsk-01');
  });

  it('reviews friendly evidence metadata, records feedback and evaluates the project', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: /calibrar sensores/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/Hoja de cálculo de Excel · 180 KB/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/comentario para el estudiante/i), 'La evidencia es pertinente; agreguen una prueba de calibración.');
    await user.click(screen.getByRole('button', { name: /guardar retroalimentación/i }));
    expect(usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01')?.comments.at(-1)?.content).toMatch(/prueba de calibración/i);

    await user.click(screen.getByRole('link', { name: /^evaluaciones$/i }));
    expect(await screen.findByRole('heading', { name: /evaluar proyecto/i })).toBeInTheDocument();
    const score = screen.getByLabelText(/calificación/i);
    await user.clear(score);
    await user.type(score, '92');
    await user.type(screen.getByLabelText(/observaciones/i), 'La evidencia cumple los criterios definidos para el prototipo.');
    await user.click(screen.getByRole('button', { name: /guardar evaluación/i }));
    expect(screen.getByRole('dialog', { name: /confirmar evaluación/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirmar y guardar/i }));
    expect(usePrototypeStore.getState().evaluations).toHaveLength(2);
  });
});
