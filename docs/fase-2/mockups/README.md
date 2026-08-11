# PGPTE - Plataforma de Gestión de Proyectos y Tareas en Equipo

Mockup funcional y navegable para demostrar la gestión de proyectos académicos realizados por estudiantes en equipo
en el Colegio Técnico Profesional San Isidro de Heredia. El entregable forma parte del curso Análisis de Sistemas II
de la Universidad Politécnica Internacional.

PGPTE es un prototipo académico: usa exclusivamente datos ficticios y estado en memoria. No incluye base de datos,
autenticación institucional, servicios externos ni despliegue productivo.

## Módulos

- Autenticación y acceso: credenciales institucionales simuladas, selección de rol, validaciones, registro y
  recuperación simulados, redirección por rol y cierre de sesión.
- Gestión de proyectos y tareas: proyectos, integrantes, líder de equipo, cronogramas, asignación de tareas,
  responsables, prioridades, estados, comentarios, progreso derivado de tareas y carga de trabajo.
- Seguimiento, evidencias y retroalimentación: metadatos de archivos simulados, revisión del profesor, evaluaciones,
  notificaciones, reportes PDF/JSON, historial y bitácora de auditoría.

## Stack real

- React 19 y TypeScript 5
- Vite 6
- React Router 7
- Zustand 5
- Tailwind CSS 4
- Recharts
- jsPDF
- Vitest, Testing Library y JSDOM
- npm

## Requisitos

- Node.js 22 recomendado
- npm 10 o compatible

El runtime portátil conservado en el repositorio puede estar incompleto en algunas copias del proyecto. Si sus scripts
de npm no funcionan, use una instalación local de Node.js.

## Instalación y ejecución

### Ejecución portátil (sin instalar programas)

Para abrir la versión compilada incluida en el repositorio, ejecute:

```powershell
.\iniciar-proyecto.cmd
```

Después abra `http://127.0.0.1:4173`. Este método usa únicamente el `node.exe` portátil y no requiere npm, cambios en
el `PATH` ni modificar la política de ejecución de PowerShell. Presione `Ctrl+C` para detener el servidor.

### Desarrollo

```powershell
npm install
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

Si PowerShell indica que `npm` no se reconoce, instale Node.js 22 LTS y abra una terminal nueva. Como alternativa,
agregue temporalmente a `PATH` la carpeta de una distribución portátil completa de Node.js antes de ejecutar npm.

Validación completa:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Vista previa del build:

```powershell
npm run preview
```

## Usuarios ficticios

Todos los perfiles usan la misma clave simulada: `PGPTE-demo-2026`.

| Rol | Correo ficticio | Ruta principal |
|---|---|---|
| Estudiante | `valeria.mora@ctp-san-isidro.demo` | `/app/estudiante` |
| Líder de equipo | `camila.vargas@ctp-san-isidro.demo` | `/app/lider` |
| Profesor | `andrea.chaves@ctp-san-isidro.demo` | `/app/profesor` |
| Administrador | `mauricio.rojas@ctp-san-isidro.demo` | `/app/administracion` |
| Auditor | `laura.jimenez@ctp-san-isidro.demo` | `/app/auditoria` |

La pantalla de acceso completa automáticamente el correo y la clave al elegir un rol. La clave no se almacena en los
datos de usuario ni representa una contraseña real.

## Capacidades por rol

- Estudiante: consulta proyectos y tareas propias, actualiza estados, comenta, adjunta evidencia simulada, revisa
  calendario/carga y configura notificaciones.
- Líder de equipo: crea proyectos, incorpora integrantes, crea y asigna tareas, cambia el estado del proyecto,
  consulta cronograma, progreso, carga e historial.
- Profesor: consulta proyectos, integrantes, tareas y evidencias; registra retroalimentación, calificación y
  observaciones; genera un PDF simulado.
- Administrador: consulta proyectos, modifica roles, activa/desactiva cuentas y actualiza estados administrativos.
- Auditor: filtra y consulta eventos, revisa detalles y exporta un corte JSON. La vista y las acciones de estado son de
  solo lectura.

Las rutas y las acciones del store validan el rol activo; ocultar una opción en el menú no es el único control.

## Navegación simplificada

Cada opción del menú corresponde a un objetivo concreto. Las pantallas de detalle, formularios y confirmaciones se
abren solo cuando la persona los necesita; los paneles iniciales muestran como máximo cuatro métricas y las acciones
prioritarias.

- Estudiante: Inicio, Mis proyectos, Mis tareas, Calendario y Notificaciones.
- Líder de equipo: Inicio, Proyecto actual, Tareas, Equipo, Cronograma e Historial.
- Profesor: Inicio, Proyectos, Revisiones, Evaluaciones y Reportes.
- Administrador: Resumen, Usuarios, Proyectos, Actividad y Configuración.
- Auditor: Resumen, Bitácora y Reportes de auditoría.

La barra lateral es colapsable en escritorio y se presenta como un panel desplegable en móvil.

## Persistencia y privacidad

El estado vive en memoria con Zustand y vuelve a los datos semilla al recargar. Los archivos no se suben: solo se
guardan nombre, tipo MIME, tamaño, fecha y una referencia `mock://` durante la sesión. Se aceptan PDF, DOCX, XLSX,
PNG, JPG y ZIP de hasta 5 MB.

No se usan datos reales de estudiantes. El mockup adopta controles inspirados en buenas prácticas de seguridad, pero
no afirma estar certificado bajo ISO/IEC 27001.

## Estructura principal

```text
src/
  components/         Componentes comunes, layout, estados y gráficos
  data/               Matriz de permisos y datos ficticios
  hooks/              Contexto derivado y carga visual
  layouts/            Layout autenticado
  modules/auth/       Store, autenticación simulada y acciones protegidas
  pages/              Vistas de los cinco roles
  routes/             Navegación y protección de rutas
  tests/              Pruebas de acceso y flujos
  types/              Modelos alineados con el diccionario de datos
  utils/              Formato, permisos y reportes
docs/fase-2/           Mapeo, demo y decisiones de migración
scripts/lint.mjs      Verificación de identidad y contexto funcional
```

## Documentación de Fase 2

- [Resumen de Fase 2](docs/fase-2/README.md)
- [Mapeo de requisitos](docs/fase-2/mapeo-requisitos.md)
- [Flujos de demostración](docs/fase-2/flujo-demo.md)
- [Decisiones del rediseño UI/UX](docs/fase-2/redisenio-ui-ux.md)
- [Guion de demostración simplificado](docs/fase-2/flujo-demo-simplificado.md)
- [Flujo de navegación entre pantallas](docs/fase-2/flujo-navegacion-pantallas.md)
- Historial de migración disponible en la carpeta `docs/fase-2`.

## Limitaciones

- No hay backend, base de datos ni persistencia después de recargar.
- Registro, recuperación, notificaciones automáticas y archivos son simulaciones locales.
- Los reportes PDF y JSON se generan en el navegador con los datos visibles.
- No existe autenticación institucional real, correo saliente, firma digital ni integración externa.
- Los controles representan el comportamiento esperado del mockup, no una solución de seguridad productiva.
