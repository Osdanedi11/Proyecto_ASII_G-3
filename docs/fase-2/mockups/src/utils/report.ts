import type { Deliverable, Evaluation, Project, Task } from '../types';
import { formatDate, statusLabel } from './format';

export async function exportProjectReport(
  project: Project,
  tasks: Task[],
  deliverables: Deliverable[],
  evaluations: Evaluation[],
) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFillColor(6, 22, 40);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(229, 243, 255);
  doc.setFontSize(18);
  doc.text('PGPTE - Reporte Academico del Proyecto', 14, 18);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text(`Proyecto: ${project.name}`, 14, 40);
  doc.text(`Curso: ${project.course}`, 14, 48);
  doc.text(`Estado: ${statusLabel(project.status)}`, 14, 56);
  doc.text(`Progreso general: ${project.progress}%`, 14, 64);
  doc.text(`Fecha limite: ${formatDate(project.dueDate)}`, 14, 72);

  let y = 88;
  doc.setFontSize(14);
  doc.text('Tareas clave', 14, y);
  y += 8;
  doc.setFontSize(11);
  tasks.slice(0, 5).forEach((task) => {
    doc.text(`- ${task.title} | ${statusLabel(task.status)} | ${formatDate(task.dueDate)}`, 16, y);
    y += 7;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text('Entregables', 14, y);
  y += 8;
  doc.setFontSize(11);
  deliverables.forEach((item) => {
    doc.text(`- ${item.title} (${item.version}) | ${item.status}`, 16, y);
    y += 7;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text('Evaluaciones registradas', 14, y);
  y += 8;
  doc.setFontSize(11);
  evaluations.forEach((evaluation) => {
    doc.text(`- ${formatDate(evaluation.createdAt)} | ${evaluation.score}/100 | ${evaluation.summary}`, 16, y, {
      maxWidth: 175,
    });
    y += 14;
  });

  doc.save(`PGPTE-${project.id}-reporte.pdf`);
}
