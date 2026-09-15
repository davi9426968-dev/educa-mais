/**
 * Banco de perguntas da plataforma, usado para montar jogos solo por matéria.
 * Cada entrada vira um Quiz com `doBanco: true` — sem dono e sem turma, visível
 * para qualquer aluno que escolher aquela disciplina.
 *
 * A primeira opção de cada pergunta é sempre a correta aqui por legibilidade;
 * o embaralhamento acontece na hora de jogar, no serviço de sessões.
 */
export interface PerguntaBanco {
  enunciado: string;
  /** A primeira opção é a correta. */
  opcoes: [string, string, string, string];
  tempoLimiteSegundos?: number;
}

export interface QuizBanco {
  id: string;
  titulo: string;
  descricao: string;
  disciplina: string;
  tema: string;
  perguntas: PerguntaBanco[];
}

export const BANCO_DE_QUIZZES: QuizBanco[] = [
  {
    id: "banco-matematica-fracoes",
    titulo: "Frações na prática",
    descricao: "Some, compare e simplifique frações.",
    disciplina: "Matemática",
    tema: "Frações",
    perguntas: [
      {
        enunciado: "Quanto é 1/2 + 1/4?",
        opcoes: ["3/4", "2/6", "1/6", "2/4"],
      },
      {
        enunciado: "Qual fração é equivalente a 2/4?",
        opcoes: ["1/2", "2/3", "3/4", "1/4"],
      },
      {
        enunciado: "Qual destas frações é a maior?",
        opcoes: ["3/4", "2/4", "1/4", "1/8"],
      },
      {
        enunciado: "A fração 6/8 simplificada é:",
        opcoes: ["3/4", "2/4", "6/4", "1/2"],
      },
      {
        enunciado: "Quanto é 3/5 de 20?",
        opcoes: ["12", "15", "10", "8"],
      },
      {
        enunciado: "Para somar 1/3 + 1/4, qual é o denominador comum?",
        opcoes: ["12", "7", "6", "4"],
      },
    ],
  },
  {
    id: "banco-matematica-geometria",
    titulo: "Geometria básica",
    descricao: "Formas, ângulos e áreas do dia a dia.",
    disciplina: "Matemática",
    tema: "Geometria",
    perguntas: [
      {
        enunciado: "Quantos lados tem um hexágono?",
        opcoes: ["6", "5", "7", "8"],
      },
      {
        enunciado: "A soma dos ângulos internos de um triângulo é:",
        opcoes: ["180°", "360°", "90°", "270°"],
      },
      {
        enunciado: "A área de um quadrado de lado 5 cm é:",
        opcoes: ["25 cm²", "10 cm²", "20 cm²", "50 cm²"],
      },
      {
        enunciado: "Um ângulo de 90° é chamado de:",
        opcoes: ["Reto", "Agudo", "Obtuso", "Raso"],
      },
      {
        enunciado: "Qual figura tem todos os lados iguais e 4 ângulos retos?",
        opcoes: ["Quadrado", "Retângulo", "Losango", "Trapézio"],
      },
    ],
  },
  {
    id: "banco-ciencias-sistema-solar",
    titulo: "Viagem pelo Sistema Solar",
    descricao: "Planetas, estrelas e movimentos da Terra.",
    disciplina: "Ciências",
    tema: "Sistema solar",
    perguntas: [
      {
        enunciado: "Qual é o planeta mais próximo do Sol?",
        opcoes: ["Mercúrio", "Vênus", "Terra", "Marte"],
      },
      {
        enunciado: "Quantos planetas existem no Sistema Solar?",
        opcoes: ["8", "9", "7", "10"],
      },
      {
        enunciado: "O que causa o dia e a noite na Terra?",
        opcoes: [
          "A rotação da Terra",
          "A translação da Terra",
          "As fases da Lua",
          "A distância até o Sol",
        ],
      },
      {
        enunciado: "Qual é o maior planeta do Sistema Solar?",
        opcoes: ["Júpiter", "Saturno", "Netuno", "Terra"],
      },
      {
        enunciado: "O Sol é classificado como:",
        opcoes: ["Uma estrela", "Um planeta", "Um satélite", "Um cometa"],
      },
      {
        enunciado: "Quanto tempo a Terra leva para dar uma volta em torno do Sol?",
        opcoes: ["365 dias", "30 dias", "24 horas", "100 dias"],
      },
    ],
  },
  {
    id: "banco-ciencias-corpo-humano",
    titulo: "Corpo humano",
    descricao: "Órgãos e sistemas do nosso corpo.",
    disciplina: "Ciências",
    tema: "Corpo humano",
    perguntas: [
      {
        enunciado: "Qual órgão bombeia o sangue pelo corpo?",
        opcoes: ["Coração", "Pulmão", "Fígado", "Rim"],
      },
      {
        enunciado: "Onde acontece a troca de gases na respiração?",
        opcoes: ["Nos pulmões", "No estômago", "No coração", "No intestino"],
      },
      {
        enunciado: "Qual é o maior órgão do corpo humano?",
        opcoes: ["Pele", "Fígado", "Intestino", "Cérebro"],
      },
      {
        enunciado: "Os ossos fazem parte de qual sistema?",
        opcoes: ["Esquelético", "Digestório", "Nervoso", "Respiratório"],
      },
      {
        enunciado: "Qual órgão comanda os movimentos e pensamentos?",
        opcoes: ["Cérebro", "Coração", "Estômago", "Pâncreas"],
      },
    ],
  },
  {
    id: "banco-portugues-classes-palavras",
    titulo: "Classes de palavras",
    descricao: "Substantivo, verbo, adjetivo e companhia.",
    disciplina: "Português",
    tema: "Gramática",
    perguntas: [
      {
        enunciado: 'Na frase "O menino correu rápido", qual palavra é o verbo?',
        opcoes: ["correu", "menino", "rápido", "o"],
      },
      {
        enunciado: "Qual das palavras abaixo é um adjetivo?",
        opcoes: ["bonito", "correr", "casa", "rapidamente"],
      },
      {
        enunciado: 'A palavra "felicidade" é um:',
        opcoes: ["Substantivo", "Verbo", "Advérbio", "Artigo"],
      },
      {
        enunciado: "Qual é o plural de 'cidadão'?",
        opcoes: ["cidadãos", "cidadães", "cidadões", "cidadans"],
      },
      {
        enunciado: 'Em "Ela cantou bem", a palavra "bem" é um:',
        opcoes: ["Advérbio", "Adjetivo", "Substantivo", "Pronome"],
      },
      {
        enunciado: "Qual frase está escrita corretamente?",
        opcoes: [
          "Houve muitos alunos na sala.",
          "Houveram muitos alunos na sala.",
          "Ouve muitos alunos na sala.",
          "Havia muitos aluno na sala.",
        ],
      },
    ],
  },
  {
    id: "banco-historia-brasil",
    titulo: "Brasil: Colônia e Império",
    descricao: "Da chegada dos portugueses à Proclamação da República.",
    disciplina: "História",
    tema: "História do Brasil",
    perguntas: [
      {
        enunciado: "Em que ano os portugueses chegaram ao Brasil?",
        opcoes: ["1500", "1492", "1600", "1450"],
      },
      {
        enunciado: "Quem comandou a esquadra que chegou ao Brasil em 1500?",
        opcoes: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Vasco da Gama", "Dom Pedro I"],
      },
      {
        enunciado: "Qual foi o primeiro produto explorado em larga escala no Brasil colonial?",
        opcoes: ["Pau-brasil", "Café", "Ouro", "Algodão"],
      },
      {
        enunciado: "Em que ano foi proclamada a Independência do Brasil?",
        opcoes: ["1822", "1889", "1808", "1500"],
      },
      {
        enunciado: "A Lei Áurea, de 1888, foi responsável por:",
        opcoes: [
          "Abolir a escravidão",
          "Proclamar a República",
          "Declarar a Independência",
          "Criar o voto secreto",
        ],
      },
    ],
  },
];
