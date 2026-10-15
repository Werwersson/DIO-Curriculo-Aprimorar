// Backend API server for CurrículoFit ATS
// Handles AI-powered resume generation with API key securely on server-side.
//
// Usage:
//   1. Set environment variable: OPENAI_API_KEY=your-key-here
//   2. Run: node server/api.js
//
// The Vite dev server proxies /api/* requests to this server on port 3001.

import http from "node:http";

const PORT = 3001;
const API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Você é um especialista em currículos ATS (Application Tracking System) no mercado brasileiro.

Sua tarefa é reescrever o currículo fornecido em formato ATS-friendly, seguindo estas regras ABSOLUTAS:

FORMATO:
- Seções padrão: Resumo Profissional, Experiência Profissional, Formação Acadêmica, Habilidades, Idiomas
- Títulos de seção simples em CAIXA ALTA
- Marcadores simples (•) para listar itens
- Ordem cronológica reversa na experiência
- Texto puro, sem tabelas, sem colunas, sem ícones
- Uma única coluna

CONTEÚDO:
- Use o vocabulário da vaga SOMENTE quando corresponder a algo que o currículo original já comprova
- Reforce no resumo e nas habilidades as palavras-chave encontradas na análise
- NUNCA adicione informação que não esteja no currículo original
- NUNCA invente experiências, cargos, empresas, formações, certificações, ferramentas ou resultados
- NUNCA invente números, métricas, datas ou nomes
- Mantenha todos os dados verdadeiros (datas, empresas, cargos, números exatos)
- Se o currículo original não tem uma seção, crie-a apenas com informações que podem ser extraídas do texto existente

IDIOMA:
- Responda em português do Brasil
- Retorne APENAS o texto do currículo, sem explicações ou comentários adicionais`;

async function handleGenerate(req, res) {
  if (!API_KEY) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API key not configured" }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  try {
    const { jobDescription, resume, analysis } = JSON.parse(body);

    const userPrompt = `DESCRIÇÃO DA VAGA:
${jobDescription}

CURRÍCULO ORIGINAL:
${resume}

PALAVRAS-CHAVE ENCONTRADAS: ${analysis.foundKeywords.join(", ")}
PALAVRAS-CHAVE AUSENTES (NÃO adicione estas se não tiverem base no currículo): ${analysis.missingKeywords.join(", ")}

Reescreva o currículo acima em formato ATS-friendly, usando o vocabulário da vaga onde aplicável, sem inventar nenhuma informação.`;

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!apiResponse.ok) {
      const err = await apiResponse.text();
      console.error("OpenAI API error:", err);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "AI service error" }));
      return;
    }

    const data = await apiResponse.json();
    const generatedResume = data.choices[0].message.content;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ resume: generatedResume }));
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    await handleGenerate(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`✅ CurrículoFit ATS API server running on http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn("⚠️  OPENAI_API_KEY not set. AI generation will fall back to local mode.");
  }
});
