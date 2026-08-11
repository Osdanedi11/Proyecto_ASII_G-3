import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { usePrototypeStore } from '../modules/auth/auth-store';

describe('Role permissions and audit trail', () => {
  beforeEach(() => usePrototypeStore.getState().resetStore());

  it('lets the administrator change a role and records the action', () => {
    const store = usePrototypeStore.getState();
    store.loginAsRole('administrador');
    store.updateUserRole('usr-marco', 'lider');
    expect(usePrototypeStore.getState().users.find((user) => user.id === 'usr-marco')?.role).toBe('lider');
    expect(usePrototypeStore.getState().auditLogs.some((log) => log.action === 'Cambio de rol')).toBe(true);
  });

  it('keeps the auditor route read-only and supports filtering event details', async () => {
    const user = userEvent.setup();
    usePrototypeStore.getState().loginAsRole('auditor');
    window.history.pushState({}, '', '/app/auditoria/bitacora');
    const initialLogs = usePrototypeStore.getState().auditLogs.length;
    render(<App />);

    expect(await screen.findByRole('heading', { name: /^bitácora$/i }, { timeout: 3000 })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^buscar$/i), 'invernadero');
    expect((await screen.findAllByText(/avance-prototipo-invernadero.pdf/i)).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /eliminar|modificar/i })).not.toBeInTheDocument();
    expect(usePrototypeStore.getState().auditLogs).toHaveLength(initialLogs);
  });

  it('rejects task mutations attempted by the auditor at store level', () => {
    const store = usePrototypeStore.getState();
    store.loginAsRole('auditor');
    const taskBefore = usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01');
    store.updateTaskStatus('tsk-01', 'completada');
    expect(usePrototypeStore.getState().tasks.find((task) => task.id === 'tsk-01')).toEqual(taskBefore);
  });

  it('does not let one role mark another user notification as read', () => {
    const store = usePrototypeStore.getState();
    store.loginAsRole('auditor');
    const notification = usePrototypeStore.getState().notifications.find((item) => item.userId === 'usr-ana' && !item.read);
    expect(notification).toBeDefined();
    store.markNotificationRead(notification!.id);
    expect(usePrototypeStore.getState().notifications.find((item) => item.id === notification!.id)?.read).toBe(false);
  });
});
