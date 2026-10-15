import { useState, useCallback } from "react";
import {
  FileText,
  Search,
  Sparkles,
  ChevronRight,
  Download,
  Copy,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Zap,
  Target,
  Briefcase,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Alert } from "./components/ui/alert";
import { Separator } from "./components/ui/separator";
import { Tooltip } from "./components/ui/tooltip";
import { Skeleton } from "./components/ui/skeleton";
import { useToast } from "./components/ui/toast";
import { analyzeCompatibility, type AnalysisResult } from "./lib/analyzer";
import { generateATSResume, verifySafetyCheck } from "./lib/generator";
import { exportToPDF, copyToClipboard } from "./lib/export";
import {
  EXAMPLE_JOB,
  EXAMPLE_RESUME,
  EXAMPLE_JOB_ADMIN,
  EXAMPLE_RESUME_ADMIN,
} from "./lib/examples";

type Step = 1 | 2 | 3;

const MIN_CHARS = 100;

const MATCH_CONFIG: Record<
  string,
  {
    label: string;
    badgeVariant: "found" | "missing" | "default";
    colorClass: string;
    bgGradient: string;
    icon: React.ElementType;
    description: string;
  }
> = {
  low: {
    label: "Compatibilidade Baixa",
    badgeVariant: "missing",
    colorClass: "text-amber-600",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    icon: AlertTriangle,
    description:
      "Seu currículo tem pouca correspondência com as palavras-chave exigidas pela vaga. Revise os requisitos técnicos e de experiência que você já possui e certifique-se de mencioná-los de forma explícita.",
  },
  medium: {
    label: "Compatibilidade Média",
    badgeVariant: "default",
    colorClass: "text-[#0F4C5C]",
    bgGradient: "from-[#0F4C5C]/10 via-[#2EC4B6]/10 to-transparent",
    icon: Target,
    description:
      "Boa base! Você já tem vários termos em comum com a vaga. Ajustar o vocabulário e reforçar competências que você já comprova fará seu currículo subir muitas posições no ranking do ATS.",
  },
  high: {
    label: "Excelente Compatibilidade",
    badgeVariant: "found",
    colorClass: "text-emerald-700",
    bgGradient: "from-emerald-500/15 via-[#2EC4B6]/10 to-transparent",
    icon: CheckCircle,
    description:
      "Parabéns! Seu currículo apresenta forte aderência aos requisitos principais da vaga. A versão ATS friendly vai garantir que o robô faça a leitura perfeita sem ruídos.",
  },
};

export default function App() {
  const { toast } = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1 - Inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");

  // Step 2 - Analysis
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 3 - Generated resume
  const [generatedResume, setGeneratedResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  // Derived state
  const canAnalyze = jobDescription.length >= MIN_CHARS && resume.length >= MIN_CHARS;

  // ===== Handlers =====

  const handleLoadExample = useCallback(
    (type: "dev" | "admin") => {
      if (type === "dev") {
        setJobDescription(EXAMPLE_JOB);
        setResume(EXAMPLE_RESUME);
        toast("Exemplo 'Desenvolvedor Full Stack' carregado!", "info");
      } else {
        setJobDescription(EXAMPLE_JOB_ADMIN);
        setResume(EXAMPLE_RESUME_ADMIN);
        toast("Exemplo 'Assistente Administrativo' carregado!", "info");
      }
    },
    [toast]
  );

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    try {
      // Simulate a brief natural delay for analysis UX
      await new Promise((r) => setTimeout(r, 700));
      const result = analyzeCompatibility(jobDescription, resume);
      setAnalysis(result);
      setCurrentStep(2);
      toast("Análise concluída com sucesso!", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast("Erro ao analisar. Tente novamente.", "error", {
        label: "Tentar novamente",
        onClick: handleAnalyze,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [canAnalyze, jobDescription, resume, toast]);

  const handleGenerate = useCallback(async () => {
    if (!analysis) return;

    setIsGenerating(true);
    try {
      const generated = await generateATSResume(jobDescription, resume, analysis);
      setGeneratedResume(generated);

      // Safety check against hallucinations
      const warnings = verifySafetyCheck(resume, generated, analysis.missingKeywords);
      setSafetyWarnings(warnings);

      setCurrentStep(3);
      toast("Currículo ATS Friendly gerado com sucesso!", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast("Erro ao gerar currículo. Tente novamente.", "error", {
        label: "Tentar novamente",
        onClick: handleGenerate,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [analysis, jobDescription, resume, toast]);

  const handleExportPDF = useCallback(() => {
    try {
      exportToPDF(generatedResume);
      toast("PDF exportado com sucesso! Arquivo pronto para envio.", "success");
    } catch {
      toast("Erro ao exportar PDF. Tente novamente.", "error");
    }
  }, [generatedResume, toast]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(generatedResume);
    if (success) {
      toast("Texto copiado para a área de transferência!", "success");
    } else {
      toast("Erro ao copiar. Selecione e copie manualmente.", "error");
    }
  }, [generatedResume, toast]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setJobDescription("");
    setResume("");
    setAnalysis(null);
    setGeneratedResume("");
    setSafetyWarnings([]);
    toast("Campos reiniciados! Inicie uma nova análise.", "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [toast]);

  // Highlight keywords in the generated resume
  const highlightText = useCallback(
    (text: string): React.ReactNode => {
      if (!highlightKeywords || !analysis) return text;

      const keywords = analysis.foundKeywords;
      if (keywords.length === 0) return text;

      const escaped = keywords.map((kw) =>
        kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );
      const regex = new RegExp(`(${escaped.join("|")})`, "gi");

      const parts = text.split(regex);
      return parts.map((part, i) => {
        const isMatch = keywords.some(
          (kw) => part.toLowerCase() === kw.toLowerCase()
        );
        if (isMatch) {
          return (
            <mark key={i} className="keyword-highlight">
              {part}
            </mark>
          );
        }
        return part;
      });
    },
    [highlightKeywords, analysis]
  );

  return (
    <div className="min-h-screen bg-ambient-mesh flex flex-col selection:bg-[#2EC4B6] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C5C] to-[#2EC4B6] flex items-center justify-center shadow-md shadow-[#0F4C5C]/20 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-[#0F4C5C]">
                  CurrículoFit ATS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2EC4B6]/15 text-[#0F756C] border border-[#2EC4B6]/30">
                  Gratuito
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Adapte seu currículo à vaga e supere o filtro dos recrutadores
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Progresso" className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            {[
              { step: 1 as Step, label: "Entradas", icon: FileText },
              { step: 2 as Step, label: "Diagnóstico", icon: Search },
              { step: 3 as Step, label: "Currículo ATS", icon: Sparkles },
            ].map(({ step, label, icon: Icon }, idx) => {
              const isActive = currentStep === step;
              const isPast = currentStep > step;
              const isClickable =
                (step === 1) ||
                (step === 2 && analysis !== null) ||
                (step === 3 && generatedResume !== "");

              return (
                <div key={step} className="flex items-center">
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-0.5 shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => isClickable && setCurrentStep(step)}
                    disabled={!isClickable}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#0F4C5C] text-white shadow-sm shadow-[#0F4C5C]/30"
                        : isPast
                        ? "text-[#0F756C] hover:bg-white hover:shadow-xs cursor-pointer"
                        : "text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-10 flex-1 w-full">
        {/* Golden Rule Banner - Mandatory across the app */}
        <div className="mb-8">
          <Alert variant="default" className="border-[#0F4C5C]/25 bg-gradient-to-r from-[#0F4C5C]/8 via-[#2EC4B6]/8 to-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-[#0F4C5C] flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#2EC4B6]" />
                  Regra de Ouro da Aplicação
                </p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  A aplicação melhora como você se apresenta. Ela{" "}
                  <strong className="text-slate-900 font-semibold underline decoration-[#2EC4B6] decoration-2">
                    nunca inventa
                  </strong>{" "}
                  experiência, cargo, empresa, formação, certificação, ferramenta ou resultado que você não tem.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ 100% Ético
                </span>
                <span className="text-[11px] font-medium text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-full border border-sky-200">
                  🔒 Dados Privados
                </span>
              </div>
            </div>
          </Alert>
        </div>

        {/* ===== STEP 1: Inputs ===== */}
        {currentStep === 1 && (
          <div className="step-enter space-y-8">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C5C]/8 text-[#0F4C5C] text-xs font-semibold border border-[#0F4C5C]/15 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#2EC4B6]" />
                Compatível com Gupy, Kenoby, Workday, Greenhouse & Taleo
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Adapte seu currículo à vaga e{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C5C] via-[#1A6C82] to-[#2EC4B6]">
                  passe pelo filtro do ATS
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Cole a descrição da vaga e seu currículo atual. O sistema analisa palavras-chave, calcula a compatibilidade real e reorganiza seu currículo sem inventar nenhum dado.
              </p>

              {/* Quick load presets */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-slate-500 font-medium">Testar com exemplo rápido:</span>
                <button
                  type="button"
                  onClick={() => handleLoadExample("dev")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0F4C5C]/40 text-[#0F4C5C] shadow-xs hover:shadow-sm transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#2EC4B6]" />
                  Desenvolvedor Full Stack
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadExample("admin")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0F4C5C]/40 text-[#0F4C5C] shadow-xs hover:shadow-sm transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  Assistente Administrativo
                </button>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Job Description Card */}
              <Card className="hover:shadow-md transition-all duration-300 border-slate-200/90">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F4C5C]/10 flex items-center justify-center text-[#0F4C5C]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Descrição da Vaga
                        </CardTitle>
                        <CardDescription>
                          Requisitos, competências e atribuições
                        </CardDescription>
                      </div>
                    </div>
                    {jobDescription.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setJobDescription("")}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <label htmlFor="job-description" className="sr-only">
                      Descrição da vaga
                    </label>
                    <Textarea
                      id="job-description"
                      placeholder="Cole aqui a descrição completa da vaga de emprego (responsabilidades, requisitos obrigatórios, diferenciais...)"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[290px]"
                    />
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">
                        {jobDescription.length < MIN_CHARS
                          ? `Faltam ${MIN_CHARS - jobDescription.length} caracteres para análise`
                          : "✓ Conteúdo suficiente para análise"}
                      </span>
                      <span
                        className={`font-semibold ${
                          jobDescription.length < MIN_CHARS
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {jobDescription.length} caracteres
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Card */}
              <Card className="hover:shadow-md transition-all duration-300 border-slate-200/90">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2EC4B6]/15 flex items-center justify-center text-[#0F756C]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Seu Currículo Atual
                        </CardTitle>
                        <CardDescription>
                          Cole o texto puro do seu currículo
                        </CardDescription>
                      </div>
                    </div>
                    {resume.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setResume("")}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <label htmlFor="resume" className="sr-only">
                      Seu currículo
                    </label>
                    <Textarea
                      id="resume"
                      placeholder="Cole aqui o texto do seu currículo (experiências profissionais, formação acadêmica, habilidades e dados de contato...)"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      className="min-h-[290px]"
                    />
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">
                        {resume.length < MIN_CHARS
                          ? `Faltam ${MIN_CHARS - resume.length} caracteres para análise`
                          : "✓ Conteúdo suficiente para análise"}
                      </span>
                      <span
                        className={`font-semibold ${
                          resume.length < MIN_CHARS
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {resume.length} caracteres
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                size="lg"
                className={`min-w-[280px] text-base ${
                  canAnalyze ? "animate-pulse-glow" : ""
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando compatibilidade…
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analisar Compatibilidade
                  </>
                )}
              </Button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Processamento privado: seus dados não são armazenados em nenhum servidor.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Analysis Results ===== */}
        {currentStep === 2 && analysis && (
          <div className="step-enter space-y-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Diagnóstico de Compatibilidade Concluído
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Resultado do Diagnóstico ATS
              </h2>
              <p className="text-sm text-slate-600">
                Veja o score de match, as palavras-chave encontradas e as oportunidades de melhoria
              </p>
            </div>

            {/* Match Score Card */}
            {(() => {
              const info = MATCH_CONFIG[analysis.matchLevel];
              const Icon = info.icon;
              return (
                <Card className="overflow-hidden border-slate-200/90 shadow-md">
                  <div className={`p-6 sm:p-8 bg-gradient-to-r ${info.bgGradient}`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      {/* Score Value & Badge */}
                      <div className="text-center md:text-left space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Percentual de Compatibilidade
                        </span>
                        <div className="flex items-baseline justify-center md:justify-start gap-2">
                          <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 animate-count-up">
                            {analysis.matchPercentage}
                          </span>
                          <span className="text-3xl font-bold text-slate-400">%</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-xs">
                          <Icon className={`w-4 h-4 ${info.colorClass}`} />
                          <span className={`text-sm font-bold ${info.colorClass}`}>
                            {info.label}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar & Qualitative Explanation */}
                      <div className="flex-1 max-w-lg space-y-3 w-full">
                        <Progress value={analysis.matchPercentage} className="h-4" />
                        <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
                          <span>0% (Incompatível)</span>
                          <span className="text-amber-600 font-bold">40% (Médio)</span>
                          <span className="text-emerald-700 font-bold">70% (Alto)</span>
                          <span>100%</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-200/60">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Keywords Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Found Keywords */}
              <Card className="border-emerald-200/80 bg-white">
                <CardHeader className="pb-3 border-b border-emerald-100 bg-emerald-50/40 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-base font-bold text-emerald-900">
                        Palavras-chave Encontradas
                      </CardTitle>
                    </div>
                    <Badge variant="found" className="text-xs">
                      {analysis.foundKeywords.length} identificadas
                    </Badge>
                  </div>
                  <CardDescription className="text-emerald-800/70">
                    Termos da vaga que já estão presentes no seu currículo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.foundKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.foundKeywords.map((kw) => (
                        <Badge key={kw} variant="found" className="py-1 px-2.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{kw}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Nenhuma palavra-chave forte encontrada. Seu currículo precisa de termos técnicos da vaga.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Missing Keywords */}
              <Card className="border-amber-200/80 bg-white">
                <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/40 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-base font-bold text-amber-950">
                        Palavras-chave que Faltam
                      </CardTitle>
                    </div>
                    <Badge variant="missing" className="text-xs">
                      {analysis.missingKeywords.length} ausentes
                    </Badge>
                  </div>
                  <CardDescription className="text-amber-800/70">
                    Aparecem na vaga, mas não no seu currículo (passe o mouse para dicas)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {analysis.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((kw) => (
                        <Tooltip
                          key={kw}
                          content={`"${kw}" aparece na vaga. Se você domina ou já trabalhou com isso, vale adicionar. Se não tem experiência, tudo bem — nunca invente.`}
                        >
                          <Badge variant="missing" className="py-1 px-2.5 cursor-help">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{kw}</span>
                          </Badge>
                        </Tooltip>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-700 font-medium">
                      Excelente! Todas as principais palavras-chave da vaga foram encontradas no seu currículo.
                    </p>
                  )}
                  <p className="text-xs text-amber-800/80 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                    💡 <strong>Dica ética:</strong> se você possui essa vivência, vale mencioná-la. Se não tem, mantenha a transparência: o robô não deve receber mentiras.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Attention Points / ATS Format Checks */}
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C5C]/10 flex items-center justify-center text-[#0F4C5C]">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Pontos de Atenção — Formato ATS
                    </CardTitle>
                    <CardDescription>
                      Checklist estrutural para garantir que os sistemas de RH leiam seu texto sem travar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.attentionPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        point.type === "success"
                          ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-950"
                          : point.type === "warning"
                          ? "bg-amber-50/50 border-amber-200/80 text-amber-950"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      {point.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : point.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold leading-snug">{point.message}</p>
                        {point.detail && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {point.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions for Step 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="min-w-[280px] shadow-lg shadow-[#0F4C5C]/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Currículo ATS…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#2EC4B6]" />
                    Gerar Currículo ATS Friendly
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                size="lg"
              >
                Voltar e Ajustar Entradas
              </Button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {currentStep === 2 && isAnalyzing && (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-60 w-full rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
          </div>
        )}

        {/* ===== STEP 3: Generated Resume ===== */}
        {currentStep === 3 && generatedResume && (
          <div className="step-enter space-y-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-[#2EC4B6]" />
                Versão ATS Friendly Gerada
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Seu Currículo Pronto para o ATS
              </h2>
              <p className="text-sm text-slate-600">
                Revise a formatação em coluna única, títulos padronizados e palavras-chave reforçadas
              </p>
            </div>

            {/* Safety Warnings if any missing keywords slipped into generated text */}
            {safetyWarnings.length > 0 && (
              <Alert variant="warning" className="border-amber-300 bg-amber-50 shadow-sm">
                <div>
                  <p className="font-bold text-sm text-amber-900 mb-1">
                    ⚠️ Atenção — Verificação de Segurança (Safety Check)
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Os seguintes termos não estavam no seu currículo original e apareceram no texto gerado. Certifique-se de que você realmente domina essas competências antes de enviar:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {safetyWarnings.map((w) => (
                      <Badge key={w} variant="missing" className="text-xs">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Alert>
            )}

            {/* Toolbar above preview */}
            <div className="flex items-center justify-between gap-4 max-w-[760px] mx-auto px-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Formato A4 • Coluna Única • Texto Selecionável
              </div>
              <button
                type="button"
                onClick={() => setHighlightKeywords(!highlightKeywords)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0F4C5C] bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:shadow-sm transition-all"
              >
                {highlightKeywords ? (
                  <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{highlightKeywords ? "Ocultar Destaques" : "Destacar Termos da Vaga"}</span>
              </button>
            </div>

            {/* Simulated Printed Paper Sheet */}
            <div className="resume-preview-sheet max-w-[760px] mx-auto p-8 sm:p-12 md:p-16 bg-white shadow-xl rounded-xl border border-slate-200">
              <div className="space-y-1">
                {generatedResume.split("\n").map((line, idx) => {
                  const trimmed = line.trim();
                  if (trimmed === "") {
                    return <div key={idx} className="h-3" />;
                  }

                  // Separator line
                  if (/^[─═━─]+$/.test(trimmed)) {
                    return <Separator key={idx} className="my-1 bg-slate-300" />;
                  }

                  // Section Header (ALL CAPS)
                  if (
                    trimmed === trimmed.toUpperCase() &&
                    trimmed.length > 2 &&
                    /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+$/.test(trimmed)
                  ) {
                    return (
                      <h2 key={idx} className="text-slate-900 border-b border-slate-800 pb-0.5 mt-4 mb-2">
                        {highlightText(trimmed)}
                      </h2>
                    );
                  }

                  // First line = Candidate Name
                  if (idx === 0) {
                    return (
                      <h1
                        key={idx}
                        className="text-center font-bold text-xl sm:text-2xl text-slate-900 tracking-tight pb-1"
                      >
                        {trimmed}
                      </h1>
                    );
                  }

                  // Second line = Contact information
                  if (idx === 1) {
                    return (
                      <p
                        key={idx}
                        className="text-center text-xs text-slate-600 pb-3 border-b border-slate-200"
                      >
                        {trimmed}
                      </p>
                    );
                  }

                  // Bullet lists
                  if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                    return (
                      <li key={idx} className="ml-5 list-disc text-slate-800">
                        {highlightText(trimmed.replace(/^[-•]\s*/, ""))}
                      </li>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-800 leading-relaxed">
                      {highlightText(line)}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Golden Rule Reminder Card */}
            <div className="max-w-[760px] mx-auto">
              <Alert variant="default" className="bg-slate-50 border-slate-200 text-slate-700">
                <p className="text-xs leading-relaxed">
                  <strong>Revisão Final:</strong> Este currículo foi reorganizado e enriquecido com os termos da vaga sem inventar dados. Antes de se candidatar, faça uma leitura rápida para garantir que todas as datas e detalhes refletem fielmente sua trajetória.
                </p>
              </Alert>
            </div>

            {/* Actions for Step 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button onClick={handleExportPDF} size="lg" className="min-w-[220px]">
                <Download className="w-5 h-5" />
                Exportar em PDF
              </Button>

              <Button
                variant="secondary"
                onClick={handleCopy}
                size="lg"
                className="min-w-[200px]"
              >
                <Copy className="w-5 h-5" />
                Copiar Texto
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                size="lg"
                className="min-w-[180px]"
              >
                <RotateCcw className="w-5 h-5 text-slate-500" />
                Nova Análise
              </Button>
            </div>
          </div>
        )}

        {/* Loading Skeletons for Generation */}
        {currentStep === 3 && isGenerating && (
          <div className="space-y-6 max-w-[760px] mx-auto">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-64 mx-auto rounded-xl" />
              <Skeleton className="h-4 w-96 mx-auto rounded-xl" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        )}

        <Separator className="my-14 bg-slate-200/80" />

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto pb-12" id="faq">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Perguntas Frequentes sobre ATS
            </h2>
            <p className="text-sm text-slate-600">
              Entenda como os sistemas de recrutamento funcionam e aumente suas chances de entrevista
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "O que é um sistema ATS (Application Tracking System)?",
                a: "ATS é um software de triagem utilizado por empresas (como Gupy, Kenoby, Workday, Greenhouse e Lever) para gerenciar centenas ou milhares de currículos recebidos por vaga. O robô faz a leitura do documento, extrai dados e calcula um ranking de aderência baseado nas palavras-chave e requisitos exigidos pelo gestor.",
              },
              {
                q: "Por que bons candidatos são reprovados pelo ATS?",
                a: "Muitos currículos usam formatações com duas colunas, caixas de texto, ícones, tabelas ou gráficos que o leitor automático não consegue interpretar. Além disso, se o candidato usar termos genéricos em vez das palavras-chave exatas da vaga (por exemplo, escrever 'programação' quando a vaga pede 'TypeScript'), o sistema atribui uma pontuação baixa.",
              },
              {
                q: "O CurrículoFit ATS inventa experiências ou dados?",
                a: "Jamais. Nossa Regra de Ouro é absoluta: a ferramenta apenas reorganiza suas informações existentes, destaca os termos da vaga que você já comprovou e sugere termos faltantes para você refletir. Nada de dados falsificados.",
              },
              {
                q: "Por que o PDF exportado tem uma única coluna e sem fotos?",
                a: "Sistemas ATS são programados para fazer parsing linear de texto puro. Layouts com colunas duplas frequentemente misturam frases ou fazem blocos inteiros de texto desaparecerem na leitura do robô. O formato mono-coluna com marcadores simples é o padrão ouro aceito em 100% dos softwares de recrutamento.",
              },
              {
                q: "Meus dados pessoais ficam guardados em algum banco de dados?",
                a: "Não. O processamento da análise ocorre diretamente no seu navegador. Não há cadastro, login ou banco de dados armazenando seus documentos.",
              },
            ].map(({ q, a }, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-[#0F4C5C]/40 hover:shadow-xs transition-all duration-200"
              >
                <summary className="cursor-pointer font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-3">
                  <span>{q}</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 group-open:bg-[#0F4C5C]/10 group-open:text-[#0F4C5C] transition-all">
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            CurrículoFit ATS — Otimizador Ético de Currículos para o Mercado Brasileiro.
          </p>
          <p className="text-xs text-slate-500">
            Adapte seu currículo à vaga, supere o filtro do robô e conquiste a entrevista com honestidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
