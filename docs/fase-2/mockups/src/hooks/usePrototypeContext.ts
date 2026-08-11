import { usePrototypeStore } from '../modules/auth/auth-store';

export function usePrototypeContext() {
  const currentRole = usePrototypeStore((state) => state.currentRole);
  const currentUserId = usePrototypeStore((state) => state.currentUserId);
  const activeProjectId = usePrototypeStore((state) => state.activeProjectId);
  const users = usePrototypeStore((state) => state.users);
  const projects = usePrototypeStore((state) => state.projects);

  const currentUser = users.find((entry) => entry.id === currentUserId) ?? null;

  const availableProjects = currentRole && currentUser
    ? projects.filter((project) => {
        if (currentRole === 'administrador') return true;
        if (currentRole === 'auditor') return false;
        if (currentRole === 'profesor') return project.professorId === currentUser.id;
        if (currentRole === 'lider') return project.leaderId === currentUser.id || project.memberIds.includes(currentUser.id);
        return project.memberIds.includes(currentUser.id);
      })
    : [];

  const activeProject =
    availableProjects.find((entry) => entry.id === activeProjectId) ??
    availableProjects[0] ??
    null;

  return {
    currentRole,
    currentUser,
    activeProject,
    availableProjects,
  };
}
