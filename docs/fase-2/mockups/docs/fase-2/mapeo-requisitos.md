# Mapeo de requisitos funcionales

`Implementado` significa que la interacción modifica el estado local. `Simulado` representa un servicio externo o
persistencia que deliberadamente no forma parte del mockup.

| Requisito | Historias | Pantalla o ruta | Estado | Evidencia demostrable |
|---|---|---|---|---|
| RF-01: iniciar sesión con credenciales institucionales | HU-01, HU-02 | `/login` | Simulado | Valida correo, clave compartida, rol y cuenta activa; registro y recuperación muestran confirmación local. |
| RF-02: registrar proyectos en equipo | HU-03 | `/app/lider/proyecto` | Implementado | Modal con nombre, asignatura, descripción, fechas e integrantes; crea también el cronograma. |
| RF-03: asociar estudiantes a un proyecto | HU-03, HU-13 | `/app/lider/proyecto`, `/app/lider/equipo` | Implementado | Selección inicial e incorporación posterior de integrantes. |
| RF-04: asignar tareas a integrantes | HU-04, HU-05 | `/app/lider/tareas` | Implementado | Crea y edita título, descripción, responsable, fecha y prioridad; registra notificación y bitácora. |
| RF-05: actualizar estados de tareas | HU-05, HU-06 | `/app/estudiante/tareas/:id` | Implementado | Actualiza estado, progreso derivado, notificación y bitácora. |
| RF-06: adjuntar evidencias | HU-19 | `/app/estudiante/tareas/:id`, `/app/profesor/revisiones/:id` | Simulado | Valida tipo y tamaño; muestra tipo legible, tamaño, fecha y usuario sin subir el archivo. |
| RF-07: comentarios y retroalimentación | HU-08, HU-11 | `/app/estudiante/tareas/:id`, `/app/profesor/revisiones/:id` | Implementado | Comentarios por tarea y retroalimentación del profesor. |
| RF-08: mostrar avance del proyecto | HU-07, HU-20, HU-21 | páginas de Inicio, `/app/lider/equipo`, detalles de proyecto | Implementado | Porcentaje calculado desde tareas y carga por integrante. |
| RF-09: generar reportes | HU-22 | `/app/profesor/reportes`, `/app/auditoria/reportes` | Simulado | PDF académico y corte JSON generados localmente. |
| RF-10: registrar acciones importantes | HU-15, HU-18 | `/app/auditoria/bitacora`, `/app/lider/historial` | Implementado | Tareas, comentarios, evidencias, evaluaciones y administración crean eventos consultables. |

## Funcionalidades complementarias

| Historia | Ruta | Estado | Observación |
|---|---|---|---|
| HU-16: calendario | `/app/estudiante/calendario`, `/app/lider/cronograma` | Implementado | Fechas de tareas, entregables e hitos. |
| HU-17: recordatorios | `/app/estudiante/notificaciones` | Simulado | Avisos semilla y generados por acciones; no hay servicio programado. |
| HU-18: historial | `/app/lider/historial` | Implementado | Lista paginada basada en la bitácora local. |
| HU-19: archivos | detalles de tarea y revisión | Simulado | Metadatos únicamente; sin almacenamiento remoto. |
| HU-20: panel resumen | ruta inicial de cada rol | Implementado | Entre tres y cuatro métricas y accesos prioritarios. |
| HU-21: carga de trabajo | `/app/lider/equipo` | Implementado | Horas estimadas por integrante. |
| HU-22: exportar reporte | rutas de Reportes | Simulado | Descargas locales con los datos actuales. |
| HU-23: notificaciones | `/app/estudiante/notificaciones` | Implementado | Lectura, paginación y preferencias en memoria. |

No quedan requisitos pendientes dentro del alcance acordado del mockup.
