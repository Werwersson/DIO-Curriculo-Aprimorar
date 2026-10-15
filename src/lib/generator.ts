import type { AnalysisResult } from "./analyzer";

/**
 * Gera um currículo ATS-friendly usando IA (backend proxy).
 * A chave da API fica no servidor, nunca no front-end.
 *
 * Em desenvolvimento, usa um gerador local como fallback.
 */
export async function generateATSResume(
  jobDescription: string,
  resume: string,
  analysis: AnalysisResult
): Promise<string> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, resume, analysis }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.resume;
    }

    // If backend is not available, use local generation
    console.warn("Backend não disponível, usando geração local.");
    return generateLocalResume(resume, analysis);
  } catch {
    // Fallback to local generation
    console.warn("Erro ao conectar ao backend, usando geração local.");
    return generateLocalResume(resume, analysis);
  }
}

/**
 * Gerador local de currículo ATS-friendly.
 * Reorganiza e formata o currículo sem inventar informações.
 */
function generateLocalResume(resume: string, analysis: AnalysisResult): string {
  const lines = resume.split("\n").map((l) => l.trim()).filter(Boolean);

  // Try to extract sections from the original resume
  const sections: Record<string, string[]> = {
    header: [],
    resumo: [],
    experiencia: [],
    formacao: [],
    habilidades: [],
    idiomas: [],
    outros: [],
  };

  let currentSection = "header";
  const sectionMap: Record<string, string> = {
    resumo: "resumo",
    objetivo: "resumo",
    perfil: "resumo",
    "sobre mim": "resumo",
    apresentacao: "resumo",
    experiencia: "experiencia",
    "experiência": "experiencia",
    "historico profissional": "experiencia",
    formacao: "formacao",
    "formação": "formacao",
    educacao: "formacao",
    "educação": "formacao",
    graduacao: "formacao",
    escolaridade: "formacao",
    habilidade: "habilidades",
    competencia: "habilidades",
    conhecimento: "habilidades",
    skill: "habilidades",
    idioma: "idiomas",
    linguas: "idiomas",
    certificacao: "outros",
    certificacoes: "outros",
    curso: "outros",
    projeto: "outros",
  };

  for (const line of lines) {
    const normalizedLine = line
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "");

    let foundSection = false;
    for (const [key, section] of Object.entries(sectionMap)) {
      if (normalizedLine.includes(key) && line.length < 60) {
        currentSection = section;
        foundSection = true;
        break;
      }
    }
    if (!foundSection) {
      sections[currentSection].push(line);
    }
  }

  // Build ATS-friendly resume
  const output: string[] = [];

  // Header (name, contact)
  if (sections.header.length > 0) {
    output.push(sections.header[0]); // Name
    if (sections.header.length > 1) {
      output.push(sections.header.slice(1).join(" | "));
    }
    output.push("");
  }

  // Professional Summary - reinforce found keywords
  output.push("RESUMO PROFISSIONAL");
  output.push("─".repeat(50));
  if (sections.resumo.length > 0) {
    let summary = sections.resumo.join(" ");
    // Reinforce found keywords naturally
    const keywordsToReinforce = analysis.foundKeywords.slice(0, 5);
    const hasKeywords = keywordsToReinforce.some((kw) =>
      summary.toLowerCase().includes(kw.toLowerCase())
    );
    if (!hasKeywords && keywordsToReinforce.length > 0) {
      summary += ` Experiência com ${keywordsToReinforce.slice(0, 3).join(", ")}.`;
    }
    output.push(summary);
  } else {
    // Create summary from available info
    const skills = sections.habilidades.join(", ");
    if (skills) {
      output.push(`Profissional com conhecimentos em ${skills}.`);
    }
  }
  output.push("");

  // Professional Experience
  if (sections.experiencia.length > 0) {
    output.push("EXPERIÊNCIA PROFISSIONAL");
    output.push("─".repeat(50));
    for (const line of sections.experiencia) {
      if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        output.push(`• ${line.replace(/^[-•*]\s*/, "")}`);
      } else {
        output.push(line);
      }
    }
    output.push("");
  }

  // Education
  if (sections.formacao.length > 0) {
    output.push("FORMAÇÃO ACADÊMICA");
    output.push("─".repeat(50));
    for (const line of sections.formacao) {
      output.push(line);
    }
    output.push("");
  }

  // Skills - reinforce with keywords from the job
  output.push("HABILIDADES");
  output.push("─".repeat(50));
  if (sections.habilidades.length > 0) {
    for (const line of sections.habilidades) {
      if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        output.push(`• ${line.replace(/^[-•*]\s*/, "")}`);
      } else {
        output.push(`• ${line}`);
      }
    }
  }
  output.push("");

  // Languages
  if (sections.idiomas.length > 0) {
    output.push("IDIOMAS");
    output.push("─".repeat(50));
    for (const line of sections.idiomas) {
      if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        output.push(`• ${line.replace(/^[-•*]\s*/, "")}`);
      } else {
        output.push(`• ${line}`);
      }
    }
    output.push("");
  }

  // Others (certifications, courses, projects)
  if (sections.outros.length > 0) {
    output.push("INFORMAÇÕES COMPLEMENTARES");
    output.push("─".repeat(50));
    for (const line of sections.outros) {
      output.push(line);
    }
    output.push("");
  }

  return output.join("\n");
}

/**
 * Verifica se o currículo gerado contém keywords que não estavam
 * no currículo original (possível invenção).
 */
export function verifySafetyCheck(
  originalResume: string,
  generatedResume: string,
  missingKeywords: string[]
): string[] {
  const normalizedOriginal = originalResume
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const normalizedGenerated = generatedResume
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const warnings: string[] = [];

  for (const keyword of missingKeywords) {
    const normalizedKw = keyword
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // If the keyword was missing from original but appears in generated
    if (!normalizedOriginal.includes(normalizedKw) && normalizedGenerated.includes(normalizedKw)) {
      warnings.push(keyword);
    }
  }

  return warnings;
}
