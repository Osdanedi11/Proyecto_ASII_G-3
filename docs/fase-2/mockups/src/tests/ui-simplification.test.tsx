import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Simplified and accessible interface', () => {
  beforeEach(() => usePrototypeStore.getState().resetStore());

  it('shows task-oriented navigation without internal role values', async () => {
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/estudiante');
    render(<App />);
    const navigation = await screen.findByRole('navigation', { name: /navegación principal/i });
    expect(navigation).toHaveTextContent('Mis proyectos');
    expect(navigation).toHaveTextContent('Mis tareas');
    expect(document.body).not.toHaveTextContent('en_progreso');
  });

  it('closes a modal with Escape and returns to the underlying page', async () => {
    usePrototypeStore.getState().loginAsRole('lider');
    window.history.pushState({}, '', '/app/lider/tareas');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: /tareas del equipo/i }, { timeout: 3000 });
    await user.click(screen.getByRole('button', { name: /crear tarea/i }));
    expect(screen.getByRole('dialog', { name: /crear tarea/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
