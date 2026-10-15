import { jsPDF } from "jspdf";

/**
 * Exporta o currículo como PDF de texto selecionável,
 * uma coluna, sem tabelas, sem imagens, fonte padrão.
 */
export function exportToPDF(resumeText: string, filename = "curriculo-ats-friendly.pdf"): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let y = margin;

  const lines = resumeText.split("\n");

  for (const line of lines) {
    // Section headers (all caps or with separator)
    const isSeparator = /^[─═━─]+$/.test(line.trim());
    if (isSeparator) {
      doc.setDrawColor(51, 51, 51);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 3;
      continue;
    }

    const isHeader =
      line === line.toUpperCase() && line.trim().length > 2 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+$/.test(line.trim());

    if (isHeader) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      y += 4;
    } else if (y === margin && lines.indexOf(line) === 0) {
      // First line = name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
    } else if (y === margin + 8 || lines.indexOf(line) === 1) {
      // Contact info
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    } else if (line.startsWith("•") || line.startsWith("-")) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    // Check if we need a new page
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    if (line.trim() === "") {
      y += 3;
      continue;
    }

    // Split text to fit width
    const textLines = doc.splitTextToSize(line, maxWidth);
    for (const textLine of textLines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(textLine, margin, y);
      y += doc.getFontSize() * 0.45;
    }

    y += 1;
  }

  doc.save(filename);
}

/**
 * Copia texto para a área de transferência.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand("copy");
    document.body.removeChild(textarea);
    return result;
  }
}
