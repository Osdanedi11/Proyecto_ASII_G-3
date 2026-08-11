import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import { getNavigationByRole, navigationItems } from '../routes/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatDateTime } from '../utils/format';

export function AppLayout() {
  const { currentRole, currentUser, availableProjects } = usePrototypeContext();
  const notifications = usePrototypeStore((state) => state.notifications);
  const logout = usePrototypeStore((state) => state.logout);
  const setActiveProject = usePrototypeStore((state) => state.setActiveProject);
  const activeProjectId = usePrototypeStore((state) => state.activeProjectId);
  const markNotificationRead = usePrototypeStore((state) => state.markNotificationRead);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!currentRole) return null;

  const items = getNavigationByRole(currentRole);
  const currentPage =
    [...navigationItems]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))?.label ??
    'Plataforma';
  const unreadCount = notifications.filter((item) => item.userId === currentUser?.id && !item.read).length;
  const userNotifications = notifications
    .filter((item) => item.userId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hideProjectSelector =
    currentRole === 'administrador' ||
    currentRole === 'auditor' ||
    (currentRole === 'profesor' && ['/app/profesor/inicio', '/app/profesor/proyectos'].includes(location.pathname)) ||
    (currentRole === 'estudiante' && ['/app/estudiante/proyectos', '/app/estudiante/notificaciones'].includes(location.pathname));

  return (
    <div className="mx-auto flex min-h-screen max-w-[1680px]">
      <div className="shrink-0 p-0 lg:p-4">
        <Sidebar
          role={currentRole}
          items={items}
          open={menuOpen}
          collapsed={collapsed}
          onClose={() => setMenuOpen(false)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <Topbar
          pageTitle={currentPage}
          role={currentRole}
          userName={currentUser?.name ?? ''}
          projects={hideProjectSelector ? [] : availableProjects}
          activeProjectId={activeProjectId}
          unreadCount={unreadCount}
          onProjectChange={setActiveProject}
          onNotificationsOpen={() => setNotificationsOpen(true)}
          onMenuOpen={() => setMenuOpen(true)}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
        />
        <main className="px-4 py-5 md:px-6 md:py-6">
          <Breadcrumbs />
          <Outlet />
        </main>
        <Modal
          open={notificationsOpen}
          title="Notificaciones"
          description="Avisos simulados asociados a tu cuenta y a las acciones recientes."
          onClose={() => setNotificationsOpen(false)}
        >
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {userNotifications.slice(0, 8).map((notification) => (
              <article key={notification.id} className="rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{notification.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read ? <Button variant="ghost" onClick={() => markNotificationRead(notification.id)}>Marcar leída</Button> : null}
                </div>
              </article>
            ))}
            {!userNotifications.length ? <p className="py-6 text-center text-sm text-slate-400">No hay notificaciones para este rol.</p> : null}
          </div>
        </Modal>
      </div>
    </div>
  );
}
