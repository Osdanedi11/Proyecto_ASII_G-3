# Flujo de navegación entre pantallas

Este documento representa la navegación implementada en el mockup PGPTE. Los flujos se derivan de las rutas declaradas en `src/routes/AppRoutes.tsx`, del menú definido en `src/routes/navigation.tsx` y de los accesos directos disponibles en cada pantalla.

## Reglas generales de navegación

- La aplicación inicia en `/login`.
- Después de autenticar las credenciales de demostración, el sistema redirige a la pantalla inicial del rol seleccionado.
- Las rutas bajo `/app` requieren una sesión activa.
- Cada rol solo puede acceder a sus propias rutas. Un intento de acceso a otra sección redirige al inicio del rol actual.
- La barra lateral permite cambiar entre las pantallas principales autorizadas.
- La ruta de navegación superior permite regresar desde una pantalla de detalle a su listado.
- Cerrar sesión devuelve a `/login`.
- Una ruta inexistente muestra la pantalla **Página no encontrada**.

```mermaid
flowchart TD
    ROOT["Raíz /"] --> LOGIN["Acceso /login"]
    LOGIN -->|"Credenciales válidas"| ROLE{"Rol seleccionado"}
    LOGIN -->|"Credenciales inválidas"| LOGIN

    ROLE -->|"Estudiante"| EST["Inicio estudiante"]
    ROLE -->|"Líder"| LID["Inicio líder"]
    ROLE -->|"Profesor"| PRO["Inicio profesor"]
    ROLE -->|"Administrador"| ADM["Resumen administrativo"]
    ROLE -->|"Auditor"| AUD["Resumen de auditoría"]

    PROTECTED["Ruta /app sin sesión"] --> LOGIN
    WRONG["Ruta de otro rol"] --> CURRENT["Inicio del rol actual"]
    UNKNOWN["Ruta inexistente"] --> NOTFOUND["Página no encontrada"]

    EST -->|"Cerrar sesión"| LOGIN
    LID -->|"Cerrar sesión"| LOGIN
    PRO -->|"Cerrar sesión"| LOGIN
    ADM -->|"Cerrar sesión"| LOGIN
    AUD -->|"Cerrar sesión"| LOGIN
```

## Estudiante

```mermaid
flowchart LR
    E0["Inicio<br/>/app/estudiante"]
    E1["Mis proyectos<br/>/app/estudiante/proyectos"]
    E1D["Detalle de proyecto<br/>/app/estudiante/proyectos/:id"]
    E2["Mis tareas<br/>/app/estudiante/tareas"]
    E2D["Detalle de tarea<br/>/app/estudiante/tareas/:id"]
    E3["Calendario<br/>/app/estudiante/calendario"]
    E4["Notificaciones<br/>/app/estudiante/notificaciones"]

    E0 -->|"Mis proyectos / Abrir proyecto"| E1
    E0 -->|"Proyecto activo"| E1D
    E0 -->|"Ver todas / Ver mis tareas"| E2
    E0 -->|"Continuar tarea"| E2D
    E0 -->|"Ver calendario"| E3
    E0 -->|"Ver todas"| E4
    E1 -->|"Abrir proyecto"| E1D
    E1D -->|"Ver detalle de tarea"| E2D
    E2 -->|"Ver detalle"| E2D
    E1D -->|"Volver mediante ruta de navegación"| E1
    E2D -->|"Volver mediante ruta de navegación"| E2
```

## Líder de equipo

```mermaid
flowchart LR
    L0["Inicio<br/>/app/lider"]
    L1["Proyecto actual<br/>/app/lider/proyecto"]
    L2["Tareas<br/>/app/lider/tareas"]
    L3["Equipo<br/>/app/lider/equipo"]
    L4["Cronograma<br/>/app/lider/cronograma"]
    L5["Historial<br/>/app/lider/historial"]

    L0 -->|"Ver proyecto"| L1
    L0 -->|"Abrir tareas"| L2
    L0 -->|"Menú lateral"| L3
    L0 -->|"Menú lateral"| L4
    L0 -->|"Menú lateral"| L5
    L1 <-->|"Menú lateral"| L2
    L2 <-->|"Menú lateral"| L3
    L3 <-->|"Menú lateral"| L4
    L4 <-->|"Menú lateral"| L5
```

## Profesor

```mermaid
flowchart LR
    P0["Inicio<br/>/app/profesor"]
    P1["Proyectos<br/>/app/profesor/proyectos"]
    P1D["Detalle de proyecto<br/>/app/profesor/proyectos/:id"]
    P2["Revisiones<br/>/app/profesor/revisiones"]
    P2D["Detalle de revisión<br/>/app/profesor/revisiones/:id"]
    P3["Evaluaciones<br/>/app/profesor/evaluaciones"]
    P4["Reportes<br/>/app/profesor/reportes"]

    P0 -->|"Ver todos"| P1
    P0 -->|"Proyecto reciente"| P1D
    P0 -->|"Revisar pendientes"| P2
    P1 -->|"Revisar proyecto"| P1D
    P2 -->|"Abrir revisión"| P2D
    P0 -->|"Menú lateral"| P3
    P0 -->|"Menú lateral"| P4
    P1D -->|"Volver mediante ruta de navegación"| P1
    P2D -->|"Volver mediante ruta de navegación"| P2
```

## Administrador

```mermaid
flowchart LR
    A0["Resumen<br/>/app/administracion"]
    A1["Usuarios<br/>/app/administracion/usuarios"]
    A1D["Detalle de usuario<br/>/app/administracion/usuarios/:id"]
    A2["Proyectos<br/>/app/administracion/proyectos"]
    A2D["Detalle de proyecto<br/>/app/administracion/proyectos/:id"]
    A3["Actividad<br/>/app/administracion/actividad"]
    A4["Configuración<br/>/app/administracion/configuracion"]

    A0 -->|"Gestionar usuarios"| A1
    A0 -->|"Gestionar proyectos"| A2
    A0 -->|"Ver toda la actividad"| A3
    A0 -->|"Menú lateral"| A4
    A1 -->|"Seleccionar usuario"| A1D
    A2 -->|"Seleccionar proyecto"| A2D
    A1D -->|"Volver mediante ruta de navegación"| A1
    A2D -->|"Volver mediante ruta de navegación"| A2
```

## Auditor

```mermaid
flowchart LR
    U0["Resumen<br/>/app/auditoria"]
    U1["Bitácora<br/>/app/auditoria/bitacora"]
    U1D["Detalle de evento<br/>/app/auditoria/bitacora/:id"]
    U2["Reportes de auditoría<br/>/app/auditoria/reportes"]

    U0 -->|"Consultar bitácora"| U1
    U0 -->|"Evento reciente"| U1D
    U1 -->|"Ver detalle"| U1D
    U0 -->|"Menú lateral"| U2
    U1D -->|"Volver mediante ruta de navegación"| U1
```

## Convenciones

| Elemento | Significado |
|---|---|
| Nodo | Pantalla o decisión de navegación |
| Flecha | Transición disponible para el usuario o redirección automática |
| `:id` | Segmento dinámico que identifica el registro seleccionado |
| Menú lateral | Acceso directo entre las pantallas principales del mismo rol |
