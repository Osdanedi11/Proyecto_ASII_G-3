# Guion de demostración PGPTE

Abra `/login`, elija un rol y use las credenciales ficticias que completa la pantalla. La clave compartida está en el
README principal. Los flujos detallados y sus tiempos sugeridos están en
[`flujo-demo-simplificado.md`](flujo-demo-simplificado.md).

## Estudiante

1. Inicio muestra el proyecto, la próxima tarea y los avisos prioritarios.
2. En **Mis tareas**, abra una tarea y cambie su estado.
3. Agregue un comentario y una evidencia PDF ficticia menor a 5 MB.
4. Consulte **Calendario** y **Notificaciones**; abra Configurar para cambiar una preferencia.

## Líder de equipo

1. En **Proyecto actual**, cree un proyecto y confirme que se genera el cronograma.
2. En **Equipo**, incorpore un estudiante.
3. En **Tareas**, cree o edite una tarea.
4. Consulte **Cronograma** e **Historial**.

## Profesor

1. En **Proyectos**, abra el detalle y cambie entre Resumen, Tareas, Evidencias y Evaluaciones.
2. En **Revisiones**, abra una tarea con evidencia y registre retroalimentación.
3. En **Evaluaciones**, registre y confirme una calificación.
4. En **Reportes**, genere el PDF local.

## Administrador

1. En **Usuarios**, busque, cree una cuenta ficticia y confirme un cambio de rol o estado.
2. En **Proyectos**, confirme un cambio de estado.
3. Consulte **Actividad** con filtros.

## Auditor

1. Confirme el aviso de solo lectura.
2. En **Bitácora**, filtre por texto, usuario, módulo, acción o fecha.
3. Abra el detalle de un evento y confirme que no existen acciones de edición.
4. Genere el corte JSON en **Reportes de auditoría**.

## Validaciones negativas

- Una ruta de otro rol redirige al inicio autorizado.
- Un archivo no permitido o mayor a 5 MB muestra un error.
- Escape cierra los modales sin ejecutar la acción.
- El Auditor no modifica la bitácora ni siquiera desde las acciones del estado.
