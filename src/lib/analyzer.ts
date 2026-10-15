import { ALL_STOPWORDS } from "./stopwords";

// ===== Types =====
export interface AnalysisResult {
  matchPercentage: number;
  matchLevel: "low" | "medium" | "high";
  foundKeywords: string[];
  missingKeywords: string[];
  attentionPoints: AttentionPoint[];
  jobKeywords: KeywordInfo[];
}

export interface KeywordInfo {
  keyword: string;
  found: boolean;
  weight: number; // 1 = normal, 2 = appears in requisitos/obrigatório, 3 = repeated
}

export interface AttentionPoint {
  type: "success" | "warning" | "info";
  message: string;
  detail?: string;
}

// ===== Normalization =====

/**
 * Remove acentos de uma string para comparação.
 */
function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza texto: lowercase, sem acentos, sem pontuação extra.
 */
function normalize(text: string): string {
  return removeAccents(text.toLowerCase())
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trata plural simples em português.
 */
function singularize(word: string): string {
  if (word.length > 4 && word.endsWith("s")) {
    if (word.endsWith("oes")) return word.slice(0, -3) + "ao";
    if (word.endsWith("ais")) return word.slice(0, -2) + "l";
    if (word.endsWith("eis")) return word.slice(0, -2) + "l";
    return word.slice(0, -1);
  }
  return word;
}

// ===== Seções da Vaga =====

function isRequirementSection(line: string): boolean {
  const norm = normalize(line);
  const markers = [
    "requisito", "obrigatorio", "qualificacao", "competencia",
    "habilidade", "requirement", "required", "must have",
    "o que esperamos", "o que buscamos", "perfil desejado",
    "conhecimento necessario", "experiencia necessaria",
  ];
  return markers.some((m) => norm.includes(m));
}

function isIgnoredSection(line: string): boolean {
  const norm = normalize(line);
  const markers = [
    "beneficio", "beneficios", "o que oferecemos", "oferecemos",
    "remuneracao", "salario", "sobre a empresa", "quem somos",
    "sobre nos", "cultura", "processo seletivo", "etapas",
  ];
  return markers.some((m) => norm.includes(m));
}

// ===== Dicionário de Termos Técnicos & Expressões Chave =====
// Termos conhecidos no mercado de trabalho brasileiro (Tech, Negócios, Admin, Design)
const KNOWN_INDUSTRY_TERMS: { display: string; matchers: string[] }[] = [
  // Front-end & Mobile
  { display: "React.js", matchers: ["react js", "reactjs", "react"] },
  { display: "TypeScript", matchers: ["typescript", "ts"] },
  { display: "JavaScript", matchers: ["javascript", "js"] },
  { display: "Next.js", matchers: ["next js", "nextjs", "next"] },
  { display: "Vue.js", matchers: ["vue js", "vuejs", "vue"] },
  { display: "Angular", matchers: ["angular", "angularjs"] },
  { display: "HTML5 & CSS3", matchers: ["html5", "css3", "html css", "html", "css"] },
  { display: "Tailwind CSS", matchers: ["tailwind", "tailwindcss"] },
  { display: "Redux", matchers: ["redux"] },
  { display: "React Native", matchers: ["react native"] },
  { display: "Flutter", matchers: ["flutter"] },

  // Back-end & Linguagens
  { display: "Node.js", matchers: ["node js", "nodejs", "node"] },
  { display: "Python", matchers: ["python"] },
  { display: "Java", matchers: ["java"] },
  { display: "C# / .NET", matchers: ["c#", "csharp", "dotnet", ".net"] },
  { display: "PHP", matchers: ["php", "laravel"] },
  { display: "Go / Golang", matchers: ["golang", "go"] },

  // APIs & Arquitetura
  { display: "APIs RESTful", matchers: ["apis restful", "api restful", "restful", "rest api", "apis rest", "api rest"] },
  { display: "GraphQL", matchers: ["graphql"] },
  { display: "Microsserviços", matchers: ["microsservicos", "microservices"] },

  // Bancos de Dados
  { display: "PostgreSQL", matchers: ["postgresql", "postgres"] },
  { display: "MongoDB", matchers: ["mongodb", "mongo"] },
  { display: "MySQL", matchers: ["mysql"] },
  { display: "SQL", matchers: ["sql", "banco de dados relacional", "bancos relacionais"] },
  { display: "Bancos NoSQL", matchers: ["nosql", "nao relacionais", "nao-relacionais"] },
  { display: "Redis", matchers: ["redis"] },

  // DevOps & Cloud
  { display: "Docker", matchers: ["docker"] },
  { display: "Kubernetes", matchers: ["kubernetes", "k8s"] },
  { display: "CI/CD", matchers: ["ci cd", "ci/cd", "continuous integration"] },
  { display: "AWS", matchers: ["aws", "amazon web services"] },
  { display: "Google Cloud (GCP)", matchers: ["gcp", "google cloud"] },
  { display: "Azure", matchers: ["azure", "microsoft azure"] },
  { display: "Linux", matchers: ["linux"] },

  // Versionamento & Qualidade
  { display: "Git / GitHub", matchers: ["git", "github", "gitlab", "versionamento"] },
  { display: "Testes Automatizados (Jest)", matchers: ["jest", "testing library", "testes automatizados", "testes unitarios", "cypress"] },

  // Metodologias & Gestão
  { display: "Metodologias Ágeis", matchers: ["metodologias ageis", "metodologia agil", "agile"] },
  { display: "Scrum", matchers: ["scrum"] },
  { display: "Kanban", matchers: ["kanban"] },
  { display: "Gestão de Projetos", matchers: ["gestao de projetos", "project management"] },
  { display: "UX / UI Design", matchers: ["ux ui", "ux/ui", "ui/ux", "figma"] },

  // Administrativo, Financeiro & Operações
  { display: "Pacote Office / Excel Avançado", matchers: ["excel", "pacote office", "tabelas dinamicas", "procv", "office"] },
  { display: "Sistemas ERP (TOTVS/ContaAzul)", matchers: ["erp", "totvs", "contaazul", "sap"] },
  { display: "Emissão de NF-e e Faturamento", matchers: ["nf e", "nf-e", "notas fiscais", "faturamento", "nota fiscal"] },
  { display: "Conciliação Bancária", matchers: ["conciliacao bancaria", "fluxo de caixa", "contas a pagar", "contas a receber"] },
  { display: "Atendimento ao Cliente", matchers: ["atendimento ao cliente", "customer success", "suporte ao cliente", "relacionamento com cliente"] },

  // Idiomas
  { display: "Inglês Técnico", matchers: ["ingles", "english"] },
  { display: "Espanhol", matchers: ["espanhol", "spanish"] },
];

/**
 * Extrai palavras-chave da vaga com alta precisão contextual.
 */
function extractJobKeywords(jobText: string): KeywordInfo[] {
  const normJob = normalize(jobText);
  const lines = jobText.split("\n");

  // Determine section boundaries
  let inReq = false;
  let inIgnored = false;
  let reqText = "";
  let generalText = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isIgnoredSection(trimmed)) {
      inIgnored = true;
      inReq = false;
      continue;
    }

    if (isRequirementSection(trimmed)) {
      inReq = true;
      inIgnored = false;
      continue;
    }

    if (inIgnored) continue;

    if (inReq) {
      reqText += " " + trimmed;
    } else {
      generalText += " " + trimmed;
    }
  }

  const normReq = normalize(reqText);
  const keywordsMap = new Map<string, KeywordInfo>();

  // 1. Match known technical & professional terms
  for (const term of KNOWN_INDUSTRY_TERMS) {
    const appearsInJob = term.matchers.some((m) => normJob.includes(m));
    if (appearsInJob) {
      const isReq = term.matchers.some((m) => normReq.includes(m));
      keywordsMap.set(term.display, {
        keyword: term.display,
        found: false,
        weight: isReq ? 3 : 2,
      });
    }
  }

  // 2. Extract bullet items from requirement section (custom domain terms)
  const reqLines = reqText.split(/[•\-*\n]/);
  for (const rLine of reqLines) {
    const trimmed = rLine.trim();
    if (trimmed.length < 4 || trimmed.length > 50) continue;

    // Check if it's already covered by a known term
    const normLine = normalize(trimmed);
    const alreadyCovered = [...keywordsMap.keys()].some((k) =>
      normLine.includes(normalize(k))
    );
    if (alreadyCovered) continue;

    // Look for technical compounds (2-3 words)
    const words = normLine.split(" ").filter((w) => !ALL_STOPWORDS.has(w) && w.length > 2);
    if (words.length >= 1 && words.length <= 3) {
      const phrase = words.map(singularize).join(" ");
      if (phrase.length > 4 && !ALL_STOPWORDS.has(phrase)) {
        // Capitalize for display
        const display = phrase
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        if (!keywordsMap.has(display)) {
          keywordsMap.set(display, {
            keyword: display,
            found: false,
            weight: 2,
          });
        }
      }
    }
  }

  // Convert to array and sort by weight
  const keywords = Array.from(keywordsMap.values());
  keywords.sort((a, b) => b.weight - a.weight);

  // Return top 20 most relevant keywords
  return keywords.slice(0, 20);
}

// ===== Comparison =====

/**
 * Verifica se uma palavra-chave está comprovada no currículo.
 */
function isKeywordInResume(keyword: string, normalizedResume: string): boolean {
  const normKw = normalize(keyword);

  // Match against known term variants
  const known = KNOWN_INDUSTRY_TERMS.find(
    (t) => t.display.toLowerCase() === keyword.toLowerCase()
  );
  if (known) {
    return known.matchers.some((m) => normalizedResume.includes(m));
  }

  // Direct match
  if (normalizedResume.includes(normKw)) return true;

  // Singular match
  const singular = normKw
    .split(" ")
    .map(singularize)
    .join(" ");
  if (normalizedResume.includes(singular)) return true;

  // Words breakdown
  const words = normKw.split(" ").filter((w) => !ALL_STOPWORDS.has(w) && w.length > 2);
  if (words.length >= 2) {
    return words.every(
      (w) => normalizedResume.includes(w) || normalizedResume.includes(singularize(w))
    );
  }

  return false;
}

// ===== ATS Format Checks =====

function checkATSFormat(resumeText: string): AttentionPoint[] {
  const points: AttentionPoint[] = [];
  const normalized = normalize(resumeText);

  // Check for standard sections
  const sections: Record<string, string[]> = {
    "Resumo Profissional": ["resumo", "objetivo", "perfil", "sobre mim", "apresentacao"],
    "Experiência Profissional": ["experiencia", "historico profissional", "atuacao"],
    "Formação Acadêmica": ["formacao", "educacao", "graduacao", "escolaridade"],
    "Habilidades": ["habilidade", "competencia", "conhecimento", "skill"],
  };

  for (const [section, markers] of Object.entries(sections)) {
    const found = markers.some((m) => normalized.includes(m));
    if (found) {
      points.push({
        type: "success",
        message: `Seção "${section}" identificada`,
        detail: "Seções padrão ajudam o ATS a classificar seu currículo corretamente.",
      });
    } else {
      points.push({
        type: "warning",
        message: `Seção "${section}" não encontrada`,
        detail: `Considere adicionar a seção de "${section}" para evitar que o leitor automático ignore seus dados.`,
      });
    }
  }

  // Check length
  const wordCount = resumeText.trim().split(/\s+/).length;
  if (wordCount < 100) {
    points.push({
      type: "warning",
      message: "Currículo muito curto",
      detail: `Seu currículo tem aproximadamente ${wordCount} palavras. Recomendamos pelo menos 200 palavras para uma boa análise pelo ATS.`,
    });
  } else if (wordCount > 1500) {
    points.push({
      type: "warning",
      message: "Currículo muito longo",
      detail: `Seu currículo tem aproximadamente ${wordCount} palavras. Currículos com mais de 2 páginas podem perder a atenção do recrutador.`,
    });
  } else {
    points.push({
      type: "success",
      message: "Tamanho adequado",
      detail: `Seu currículo tem aproximadamente ${wordCount} palavras, dentro do recomendado.`,
    });
  }

  return points;
}

// ===== Main Analysis =====

export function analyzeCompatibility(jobDescription: string, resume: string): AnalysisResult {
  const normalizedResume = normalize(resume);
  const keywords = extractJobKeywords(jobDescription);

  // Check each keyword against resume
  for (const kw of keywords) {
    kw.found = isKeywordInResume(kw.keyword, normalizedResume);
  }

  const foundKeywords = keywords.filter((k) => k.found).map((k) => k.keyword);
  const missingKeywords = keywords.filter((k) => !k.found).map((k) => k.keyword);

  // Calculate weighted match
  const totalWeight = keywords.reduce((sum, k) => sum + k.weight, 0);
  const foundWeight = keywords.filter((k) => k.found).reduce((sum, k) => sum + k.weight, 0);
  const matchPercentage = totalWeight > 0 ? Math.round((foundWeight / totalWeight) * 100) : 0;

  // Determine match level
  let matchLevel: "low" | "medium" | "high";
  if (matchPercentage < 40) matchLevel = "low";
  else if (matchPercentage < 70) matchLevel = "medium";
  else matchLevel = "high";

  // ATS format checks
  const attentionPoints = checkATSFormat(resume);

  return {
    matchPercentage,
    matchLevel,
    foundKeywords,
    missingKeywords,
    attentionPoints,
    jobKeywords: keywords,
  };
}
