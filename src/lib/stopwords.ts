/**
 * Stopwords em português e inglês para remoção na análise de keywords.
 */

export const STOPWORDS_PT = new Set([
  "a", "à", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo",
  "as", "até", "com", "como", "da", "das", "de", "dela", "delas", "dele",
  "deles", "depois", "do", "dos", "e", "ela", "elas", "ele", "eles", "em",
  "entre", "era", "essa", "essas", "esse", "esses", "esta", "estas", "este",
  "estes", "eu", "foi", "for", "foram", "há", "isso", "isto", "já", "lhe",
  "lhes", "lo", "mas", "me", "mesmo", "meu", "meus", "minha", "minhas",
  "muito", "na", "nas", "não", "nem", "no", "nos", "nós", "nossa", "nossas",
  "nosso", "nossos", "num", "numa", "o", "os", "ou", "para", "pela", "pelas",
  "pelo", "pelos", "por", "qual", "quando", "que", "quem", "são", "se", "sem",
  "ser", "será", "seu", "seus", "só", "sobre", "sua", "suas", "também", "te",
  "tem", "tendo", "ter", "teu", "teus", "ti", "tido", "tinha", "toda", "todas",
  "todo", "todos", "tu", "tua", "tuas", "tudo", "um", "uma", "umas", "uns",
  "você", "vocês", "vos",
  // Verbos comuns
  "ser", "estar", "ter", "haver", "fazer", "poder", "dever", "ir", "vir",
  "dar", "ficar", "dizer", "ver", "saber", "querer", "buscar", "buscamos",
  "esperamos", "desejamos", "atuar", "desenvolver", "manter", "otimizar",
  "criar", "gerenciar", "apoiar", "executar", "colaborar", "integrar",
  // Palavras de preenchimento em anúncios de vagas
  "vaga", "candidato", "candidata", "candidatos", "candidatas", "necessário",
  "necessária", "necessários", "desejável", "desejáveis", "obrigatório",
  "obrigatória", "obrigatórios", "requisito", "requisitos", "diferencial",
  "diferenciais", "experiência", "experiencias", "conhecimento", "conhecimentos",
  "domínio", "habilidade", "habilidades", "competência", "competências",
  "empresa", "trabalho", "equipe", "time", "dia", "ano", "anos", "mes",
  "meses", "nível", "pleno", "sênior", "júnior", "estágio", "clt", "pj",
  "remoto", "híbrido", "presencial", "salário", "remuneração", "benefício",
  "benefícios", "plano", "saúde", "odontológico", "vale", "refeição",
  "alimentação", "gympass", "aniversário", "day", "off", "budget", "bolsa",
  "sobre", "local", "contrato", "atividades", "responsabilidades", "funções",
  "boa", "bom", "excelente", "forte", "capacidade", "perfil", "pessoa",
  "pessoas", "profissional", "profissionais", "área", "setor", "ambiente",
  "cultura", "oportunidade", "oportunidades", "soluções", "digitais",
]);

export const STOPWORDS_EN = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by",
  "can", "do", "does", "did", "for", "from", "had", "has", "have", "he",
  "her", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "me", "my", "no", "not", "of", "on", "or", "our", "out", "own", "she",
  "so", "some", "than", "that", "the", "their", "them", "then", "there",
  "these", "they", "this", "those", "to", "too", "up", "us", "very", "was",
  "we", "were", "what", "when", "which", "while", "who", "whom", "why",
  "will", "with", "would", "you", "your",
  "required", "preferred", "requirements", "responsibilities", "job",
  "company", "team", "years", "experience", "knowledge", "skills",
  "benefits", "plus", "must", "have", "good", "strong",
]);

export const ALL_STOPWORDS = new Set([...STOPWORDS_PT, ...STOPWORDS_EN]);
