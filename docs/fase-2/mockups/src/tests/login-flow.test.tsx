import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('PGPTE access flow', () => {
  beforeEach(() => {
    usePrototypeStore.getState().resetStore();
    window.history.pushState({}, '', '/login');
  });

  it('allows entering the platform as professor', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /profesor/i }));
    await user.click(screen.getByRole('button', { name: /ingresar a la plataforma/i }));

    expect(await screen.findByRole('heading', { name: /requiere tu atención/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toHaveTextContent('Revisiones');
  });

  it('protects the auditor route from a student session', async () => {
    usePrototypeStore.getState().loginAsRole('estudiante');
    window.history.pushState({}, '', '/app/auditoria/bitacora');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /qué debes hacer ahora/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /bitácora/i })).not.toBeInTheDocument();
  });
});
