import { startTransition, useState } from 'react';
import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { actorLabels } from '../data/sourceOfTruth';
import { DEMO_PASSWORD, usePrototypeStore } from '../modules/auth/auth-store';
import { Button } from '../components/common/Button';
import { FeedbackMessage } from '../components/common/FeedbackMessage';
import { FormField } from '../components/common/FormField';
import type { Role } from '../types';

const roleOrder: Role[] = ['estudiante', 'lider', 'profesor', 'administrador', 'auditor'];
const demoEmails: Record<Role, string> = {
  estudiante: 'valeria.mora@ctp-san-isidro.demo',
  lider: 'camila.vargas@ctp-san-isidro.demo',
  profesor: 'andrea.chaves@ctp-san-isidro.demo',
  administrador: 'mauricio.rojas@ctp-san-isidro.demo',
  auditor: 'laura.jimenez@ctp-san-isidro.demo',
};
const roleHome: Record<Role, string> = {
  estudiante: '/app/estudiante',
  lider: '/app/lider',
  profesor: '/app/profesor',
  administrador: '/app/administracion',
  auditor: '/app/auditoria',
};

export function LoginPage() {
  const authenticateDemo = usePrototypeStore((state) => state.authenticateDemo);
  const [selectedRole, setSelectedRole] = useState<Role>('estudiante');
  const [email, setEmail] = useState(demoEmails.estudiante);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 p-4 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
      <section className="hidden max-w-xl lg:block">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100"><GraduationCap className="size-7" /></div>
        <p className="section-title mt-7">PGPTE</p>
        <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-white">Proyectos y tareas en equipo, sin complicaciones.</h1>
        <p className="mt-5 text-base leading-8 text-slate-300">Mockup académico del Colegio Técnico Profesional San Isidro de Heredia. Utiliza únicamente datos ficticios.</p>
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="size-5 text-emerald-300" /> Acceso diferenciado para cinco roles.</div>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-8">
        <div className="lg:hidden"><p className="section-title">PGPTE</p><h1 className="mt-2 text-2xl font-semibold text-white">Proyectos y tareas en equipo</h1></div>
        <div className="mt-6 lg:mt-0">
          <p className="section-title">Acceso simulado</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Selecciona tu rol</h2>
          <p className="mt-2 text-sm text-slate-300">Las credenciales de demostración se completan automáticamente.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Roles de demostración">
          {roleOrder.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={selectedRole === role}
              onClick={() => {
                setSelectedRole(role);
                setEmail(demoEmails[role]);
                setPassword(DEMO_PASSWORD);
                setMessage('');
              }}
              className={`min-h-12 rounded-xl px-2 text-xs font-medium transition ${selectedRole === role ? 'bg-cyan-400/14 text-cyan-100 ring-1 ring-cyan-300/30' : 'bg-white/[0.035] text-slate-300 hover:bg-white/7'}`}
            >
              {actorLabels[role]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          <FormField label="Correo institucional simulado">
            <input className="form-control" type="email" value={email} aria-invalid={isError} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
          <FormField label="Contraseña de demostración">
            <input className="form-control" type="password" value={password} aria-invalid={isError} onChange={(event) => setPassword(event.target.value)} />
          </FormField>
          {message ? <FeedbackMessage tone={isError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
          <Button className="w-full" onClick={() => {
            const result = authenticateDemo(email, password, selectedRole);
            showMessage(result.message, !result.ok);
            if (result.ok) startTransition(() => navigate(roleHome[selectedRole]));
          }}>
            Ingresar a la plataforma <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-1">
          <Button variant="ghost" onClick={() => showMessage(email.endsWith('@ctp-san-isidro.demo') ? 'Registro simulado completado.' : 'Usa el dominio ficticio @ctp-san-isidro.demo.', !email.endsWith('@ctp-san-isidro.demo'))}>Simular registro</Button>
          <Button variant="ghost" onClick={() => showMessage(email.trim() ? 'Se simuló el envío de instrucciones de recuperación.' : 'Ingresa un correo para continuar.', !email.trim())}>Recuperar acceso</Button>
        </div>
        <p className="mt-5 border-t border-white/8 pt-4 text-center text-xs leading-5 text-slate-400">Prototipo académico sin autenticación real ni almacenamiento de contraseñas.</p>
      </section>
    </main>
  );
}
