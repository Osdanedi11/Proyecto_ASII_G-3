# Fase 2 - Mockup funcional PGPTE

Esta carpeta documenta la representación navegable de la Plataforma de Gestión de Proyectos y Tareas en Equipo para
el Colegio Técnico Profesional San Isidro de Heredia.

## Fuentes aplicadas

1. Documento vigente de PGPTE, edición 1: identidad, organización, actores, HU-01 a HU-23, RF-01 a RF-10, seguridad
   y alcance conceptual.
2. Diccionario de datos PGPTE: entidades, campos, relaciones y valores permitidos.
3. Documento histórico del prototipo anterior: inventario de pantallas y componentes reutilizables.
4. Código del repositorio: React/TypeScript/Vite, Zustand, rutas, gráficos, mocks, pruebas y reportes.

En caso de contradicción se aplicó la fuente vigente de PGPTE. El mockup funcional solicitado se mantiene como
demostración local y no pretende implementar infraestructura productiva.

## Entregables

- `mapeo-requisitos.md`: relación entre requisitos, historias, rutas y estado.
- `flujo-demo.md`: guion verificable para los cinco roles.
- `redisenio-ui-ux.md`: auditoría, decisiones de simplificación, accesibilidad y alcance.
- `flujo-demo-simplificado.md`: recorrido breve por la navegación orientada a tareas.
- `flujo-navegacion-pantallas.md`: diagramas de acceso y transición entre pantallas para los cinco roles.
- Documento histórico de migración: registro de decisiones y cambios de identidad.

## Criterios técnicos

- Datos ficticios y estado en memoria.
- Progreso derivado de las tareas.
- Acciones importantes agregan bitácora y, cuando corresponde, notificaciones.
- Evidencias limitadas a metadatos locales y tipos/tamaños permitidos.
- Protección de rutas y validación de permisos en las acciones del store.
- Auditoría de solo lectura.

Consulte el [README principal](../../README.md) para instalación, usuarios ficticios y comandos.
