# Rediseño UI/UX de Fase 2

## Objetivo

Reducir carga cognitiva sin reemplazar la arquitectura React existente ni eliminar los flujos funcionales de PGPTE.
La regla aplicada es **una página, un objetivo principal**.

## Auditoría inicial

La versión de partida concentraba casi todas las funciones de cada rol en una sola página. Esto producía recorridos
largos, acciones competidoras, formularios siempre visibles y una barra lateral que no reflejaba la estructura real.
También se mostraban valores técnicos como estados internos o tipos MIME y el acceso ocupaba más de una pantalla.

## Decisiones aplicadas

- Rutas separadas por tarea y protegidas por rol.
- Barra lateral colapsable en escritorio y panel desplegable con fondo modal en móvil.
- Encabezado contextual, migas de navegación y selector de proyecto solo cuando es pertinente.
- Inicio de cada rol orientado a la siguiente decisión, con un máximo de cuatro métricas.
- Formularios complejos y confirmaciones dentro de diálogos.
- Tablas y listas con búsqueda, filtros, estados vacíos y paginación.
- Estados, roles, tipos de archivo, tamaños y fechas transformados a lenguaje natural.
- Botones con propósito real; no se mantienen acciones decorativas.
- Mensajes visibles de éxito o error después de mutaciones.

## Accesibilidad

- Campos con etiquetas asociadas y ayudas visibles.
- Controles interactivos con altura mínima de 44 px y foco perceptible.
- Diálogos con nombre accesible, cierre explícito, cierre con Escape y `aria-modal`.
- Navegaciones con nombre y elemento actual indicado mediante `aria-current`.
- Respeto por `prefers-reduced-motion`.
- Contraste conservado sobre una paleta académica oscura simplificada.

## Divulgación progresiva

El resumen muestra únicamente información para decidir qué hacer después. Los detalles se abren en rutas dedicadas;
las acciones de creación, edición, configuración o confirmación aparecen en modales. Los archivos muestran metadatos
útiles, no referencias locales ni MIME.

## Responsividad

El contenido usa una sola columna en pantallas pequeñas y adopta rejillas solo cuando existe ancho suficiente. Las
tablas administrativas permiten desplazamiento horizontal contenido; el menú móvil se abre bajo demanda.

## Funcionalidad preservada

Se reutilizaron el store Zustand, los datos ficticios, el cálculo de progreso, los gráficos, la autenticación simulada,
la exportación de reportes y las verificaciones de permisos. Se añadió edición real de tareas y creación simulada de
usuarios para que los nuevos controles no sean únicamente visuales.

## Alcance

El resultado sigue siendo un mockup local. No se agregó backend, persistencia, autenticación real ni servicios
externos. Las evidencias conservan solo metadatos durante la sesión.
