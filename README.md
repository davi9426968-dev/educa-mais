# Educa+

Sistema web (não é aplicativo mobile) para apoiar a aprendizagem de estudantes do ensino
básico e secundário, com perfis de **aluno**, **professor**, **responsável** e **coordenação**.

> Protótipo completo — todas as 7 etapas do plano original foram implementadas e testadas ponta
> a ponta (API + navegador), mais duas etapas extras: turmas inspiradas no Google Sala de Aula
> (código, mural e tópicos) e **jogos interativos estilo Kahoot**.

## Stack

**Front-end:** React + TypeScript + Vite, Tailwind CSS, React Router, Recharts.

**Back-end:** Node.js + Express, PostgreSQL, Prisma ORM, JWT + bcrypt, Multer (upload local).

**Infra:** Docker Compose (PostgreSQL), monorepo `/frontend` + `/backend`.

## Funcionalidades implementadas

**Todos os perfis**
- Cadastro e login com JWT, senhas com hash bcrypt, rotas protegidas por perfil (front e back)

**Turmas, ao estilo Google Sala de Aula** *(novo)*
- Professor cria a turma e recebe um **código curto** (ex: `K7X9QP`) para compartilhar
- Aluno **entra sozinho na turma** digitando o código — antes só era possível matricular pelo banco
- Grade de turmas com cartões visuais (cor por turma) como tela inicial de navegação
- **Mural da turma**: feed único e cronológico juntando atividades, materiais e avisos daquela
  turma, com criação rápida dos três direto da página
- Atividades e materiais podem ser marcados com um **tópico/unidade** (ex: "Unidade 2 — Frações"),
  que agrupa o mural em seções — igual aos "Topics" do Classroom
- Professor pode gerar um novo código a qualquer momento (invalida o antigo)

**Jogos interativos, estilo Kahoot** *(novo)*
- **Modo solo**: o aluno escolhe a matéria e o sistema monta um jogo na hora, sorteando um dos
  questionários daquela disciplina. Cronômetro por pergunta e pontuação por acerto + rapidez.
- **Modo ao vivo**: o professor abre uma sala com **PIN de 6 dígitos**, os alunos entram, todos
  veem a mesma pergunta ao mesmo tempo e o ranking atualiza durante a partida.
- Professor pode **criar o próprio questionário** (perguntas, 4 alternativas, tempo por pergunta)
  ou usar um dos jogos prontos do **banco da plataforma** (33 perguntas em 4 matérias).
- Interface no estilo Kahoot: alternativas em cores + formas (triângulo, losango, círculo,
  quadrado), barra de tempo, revelação da resposta certa e **pódio final** com os 3 primeiros.
- Pontuação: até 1000 pontos por acerto, caindo conforme o tempo usado (mínimo 500 no último
  segundo). Errar ou não responder vale zero.

**Aluno**
- Agenda de estudos: tarefas pessoais (criar/editar/excluir) e tarefas da turma atribuídas pelo
  professor, marcar como concluída, agrupamento por dia
- Materiais de apoio: busca por assunto, organizados por disciplina, com texto/link/vídeo/arquivo
- Canal de dúvidas: enviar dúvida com foto opcional, nível de dificuldade, ver respostas do
  professor e a biblioteca de explicações da turma (anonimizada)
- Painel com progresso semanal (gráfico) e próximas tarefas

**Professor**
- Gestão de turmas e atividades atribuídas a elas, com resumo de conclusão por tarefa
  (ex: "3/22 concluíram")
- Publicação de materiais (texto, link, vídeo ou upload de arquivo)
- Resposta a dúvidas dos alunos, com opção de destacar a resposta na biblioteca da turma
- Envio de avisos (para uma turma específica ou para toda a escola)
- Painel com indicadores por turma: % de entrega, dúvidas pendentes, tema com mais dúvidas,
  gráfico comparativo quando há mais de uma turma

**Responsável** *(reformulado)*
- **Vínculo por código**: o aluno vê um código no painel dele (o professor também vê o de cada
  aluno da turma) e o responsável digita esse código para passar a acompanhá-lo
- **Acompanhamento**: progresso semanal em gráfico, **próximos prazos e tarefas** do aluno
  (somente leitura), com destaque para o que está atrasado
- **Avisos com confirmação de leitura**: o responsável marca "ciente" e o professor vê quem já
  confirmou e quem ainda falta
- **Mensagens diretas** com os professores do aluno, com contador de não lidas
- **Observações pedagógicas** registradas pelos professores (elogio / ponto de atenção)

**Professor ↔ família**
- Aba **Alunos**: lista dos alunos das suas turmas, com o código de acompanhamento de cada um e
  quais responsáveis já estão vinculados
- Registrar observações pedagógicas sobre um aluno, visíveis ao responsável
- Conversar com o responsável, sempre no contexto de um aluno
- Ver, em cada aviso enviado, quantos e quais responsáveis confirmaram a leitura

**Coordenação**
- Perfil e rota já modelados no banco e na navegação; painel funcional fica como próximo passo
  (era opcional no escopo original, "se der tempo")

**Modo escuro** *(novo)*
- Botão de alternância na barra superior (e também na tela de login, antes de entrar)
- Começa acompanhando a preferência do sistema operacional; a escolha manual fica salva e passa
  a valer sobre o sistema
- Sem "piscada" branca ao carregar: o tema é aplicado antes do primeiro paint
- Gráficos, cores das alternativas do jogo e estados de erro/sucesso foram ajustados para os dois
  temas — não é só inverter preto e branco

**Acessibilidade**
- HTML semântico, labels associados a todos os campos, `aria-live`/`role="alert"` em erros,
  foco visível consistente, link "pular para o conteúdo", 100% navegável por teclado

## Estrutura de pastas

```
projeto/
├── docker-compose.yml       # serviço do PostgreSQL
├── backend/                 # API Express + Prisma
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   ├── uploads/              # arquivos enviados (dev local)
│   └── src/
│       ├── modules/          # auth, turmas, tarefas, materiais, duvidas, progresso, avisos, responsavel
│       ├── middlewares/       # auth (JWT + papel), upload (multer), erros
│       ├── validators/        # schemas Zod por recurso
│       └── lib/storage.ts     # ponto único de resolução de URL de arquivos
└── frontend/                # SPA React + Vite + Tailwind
    └── src/
        ├── pages/aluno | professor | responsavel | coordenacao | auth
        │     └── inclui Turmas (grade) e TurmaMural (feed) em aluno/ e professor/
        ├── components/tarefas | materiais | duvidas | avisos | turmas | charts | ui | layout
        └── services/          # um arquivo por recurso, chamando a API
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior + npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o PostgreSQL)

## Como rodar localmente

### 1. Subir o banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL em `localhost:5432` (usuário `educa`, senha `educa123`, banco `educa_mais`).

### 2. Configurar e rodar o back-end

```bash
cd backend
npm install

# copie o arquivo de exemplo e ajuste se necessário
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env

npm run prisma:migrate      # cria as tabelas no banco (peça um nome para a migration, ex: "init")
npm run prisma:seed         # cria usuários de teste (ver tabela abaixo)
npm run dev                 # inicia a API em http://localhost:3333
```

> Se o `npm install` avisar sobre "scripts pendentes" (`npm warn allow-scripts`), rode
> `npm approve-scripts --all` e depois `npm rebuild` — é um recurso de segurança do npm recente
> que bloqueia scripts de instalação (usados pelo bcrypt e pelo Prisma) até serem aprovados.

### 3. Configurar e rodar o front-end

Em outro terminal:

```bash
cd frontend
npm install

cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env

npm run dev                 # inicia o app em http://localhost:5173
```

Acesse **http://localhost:5173** no navegador.

## Contas de teste (criadas pelo seed)

Senha para todas: `123456`

| Perfil | E-mail |
|---|---|
| Professor | professor@educa.com |
| Aluno | ana@educa.com |
| Aluno | bruno@educa.com |
| Responsável (vinculado à Ana) | responsavel@educa.com |

Também é possível criar novas contas de Aluno, Professor ou Responsável pela tela de Cadastro
(o perfil Coordenação não é autocadastrável — precisa ser criado diretamente no banco/seed).

## Variáveis de ambiente

### `backend/.env`

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`) |
| `PORT` | Porta da API (padrão `3333`) |
| `CORS_ORIGIN` | Origem permitida para CORS (URL do front-end) |
| `UPLOADS_DIR` | Pasta local de upload de arquivos em desenvolvimento |

### `frontend/.env`

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (ex: `http://localhost:3333/api`) |

## Scripts disponíveis

**Backend** (`cd backend`)

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia a API em modo desenvolvimento (hot reload) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Roda a API compilada (produção) |
| `npm run prisma:migrate` | Cria/aplica migrations em desenvolvimento |
| `npm run prisma:deploy` | Aplica migrations existentes (produção) |
| `npm run prisma:seed` | Popula o banco com dados de teste |
| `npm run prisma:studio` | Abre o Prisma Studio (interface visual do banco) |

**Frontend** (`cd frontend`)

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite |
| `npm run build` | Type-check + build de produção |
| `npm run preview` | Serve o build de produção localmente |

## Status do desenvolvimento

- [x] **Etapa 1** — Autenticação e cadastro por perfil
- [x] **Etapa 2** — Agenda de estudos
- [x] **Etapa 3** — Materiais de apoio
- [x] **Etapa 4** — Canal de dúvidas
- [x] **Etapa 5** — Acompanhamento de progresso (gráficos)
- [x] **Etapa 6** — Comunicação com responsáveis (avisos)
- [x] **Etapa 7** — Revisão de acessibilidade e teste ponta a ponta
- [x] **Etapa 8** — Turmas com código de acesso, mural e tópicos (inspirado no Google Sala de Aula)
- [x] **Etapa 9** — Jogos interativos estilo Kahoot (modo solo por matéria e modo ao vivo com PIN)
- [x] **Etapa 10** — Modo escuro com tokens de cor semânticos
- [x] **Etapa 11** — Comunicação professor ↔ responsável (vínculo por código, prazos do aluno,
      confirmação de leitura, mensagens diretas e observações pedagógicas)
- [x] **Etapa 11** — Comunicação professor ↔ responsável (vínculo por código, prazos do aluno,
      confirmação de leitura, mensagens diretas e observações pedagógicas)

## Decisões técnicas que valem explicação

- **Gráfico de progresso calculado sob demanda, não por job agendado.** O schema do Prisma
  mantém a tabela `ProgressoAluno` como um "snapshot" semanal (pensada originalmente como cache
  para um job agendado). Como o protótipo não tem infraestrutura de scheduler, o endpoint
  `GET /api/progresso` calcula a evolução semanal ao vivo a partir de `Tarefa`/`TarefaConclusao`
  — o resultado é o mesmo para o usuário, só não fica em cache. A tabela continua no schema como
  ponto de partida para essa otimização futura.
- **Upload de arquivos com uma função de resolução de URL, não uma classe `StorageProvider`
  completa.** `backend/src/lib/storage.ts` expõe um único ponto (`resolveUploadUrl`) que hoje
  aponta para `/uploads/*` local; trocar para S3/Supabase Storage significa mudar essa função,
  sem tocar nos módulos de materiais/dúvidas.
- **IDs de turma validados como string não-vazia, não como `cuid()`.** A validação Zod inicial
  usava `.cuid()`, mas isso quebrou com o ID legível usado no seed (`seed-turma-9a-matematica`).
  Validar só a presença da string e deixar o Prisma/serviço checar existência e posse é mais
  robusto a essa mudança de formato de ID.
- **Datas de entrega formatadas em UTC no front-end.** `dataEntrega` representa uma data de
  calendário (sem horário relevante) vinda de `<input type="date">`. Formatá-la no fuso local do
  navegador fazia a data "voltar" um dia em fusos negativos (ex: Brasil); por isso a formatação
  força `timeZone: "UTC"`.
- **Sem sistema de notas/pontuação, diferente do Classroom real.** O PDF de referência do projeto
  é explícito: os indicadores devem apoiar a decisão pedagógica do professor, não avaliar o aluno
  sozinhos. Por isso a inspiração no Google Sala de Aula ficou nos mecanismos de organização
  (código de turma, mural, tópicos) e não copiou o sistema de notas.
- **O vínculo responsável↔aluno era um fluxo quebrado.** `VinculoResponsavel` só era criado pelo
  seed: nenhuma rota da API criava vínculo, então um responsável que se cadastrasse pela tela de
  cadastro ficava com a página vazia para sempre. Agora existe um código de acompanhamento por
  aluno (mesma mecânica do código de turma), visível para o próprio aluno e para o professor da
  turma dele.
- **Observações pedagógicas são um canal professor↔família, e o aluno não as vê.** Foi uma escolha
  consciente: é o comportamento dos "registros de ocorrência" dos portais de referência, e evita
  que um "ponto de atenção" vire exposição pública do estudante — na linha do que o projeto define
  sobre não expor o aluno sem autorização. O professor vê apenas o que ele mesmo registrou; o
  responsável vê tudo sobre o aluno que acompanha.
- **Sem boletim de notas, apesar de ser o recurso mais comum nos portais pesquisados.** As
  referências giram em torno de notas e frequência, mas o projeto define que os indicadores são
  apoio à decisão pedagógica e não critério único de avaliação. Por isso o foco ficou em
  comunicação e acompanhamento (prazos, avisos, mensagens, observações).
- **Vínculo responsável↔aluno por código, e não por cadastro manual no banco.** Antes desta etapa
  o vínculo só existia no seed: uma conta de responsável criada pela tela de cadastro ficava
  permanentemente vazia, sem nenhuma forma de se ligar ao aluno. O código (mesma mecânica do
  código de turma) resolve isso sem exigir uma área administrativa.
- **Observações pedagógicas são visíveis ao professor autor e ao responsável — não ao aluno.**
  É um canal professor↔família, como o "registro de ocorrências" dos portais de referência.
  A intenção é que um "ponto de atenção" não vire exposição do estudante, na linha do que o
  projeto define sobre não expor o aluno sem autorização. O professor vê apenas o que ele mesmo
  registrou; o responsável vê tudo sobre o aluno que acompanha.
- **Modo escuro com tokens semânticos, não com `dark:` espalhado pelo código.** As cores viraram
  variáveis CSS (`--surface`, `--ink`, `--line`...) expostas ao Tailwind como nomes semânticos
  (`bg-surface`, `text-ink`, `border-line`). Os componentes nunca escrevem `bg-white` ou
  `text-slate-800`, então trocar o tema é só trocar o valor das variáveis — em vez de manter uma
  variante `dark:` para cada uma das ~150 classes de cor espalhadas em 52 arquivos.
  Os gráficos (Recharts) são a exceção: desenham em SVG e precisam de cores concretas, então
  recebem a paleta via o hook `useCoresGrafico`.
- **Jogo ao vivo sincronizado por polling (1 s), não por WebSocket.** Para uma turma o efeito é
  o mesmo do Kahoot, e o jogo continua usando a mesma autenticação JWT do resto da API — sem
  precisar de infraestrutura nova (autenticação em socket, reconexão, novo servidor). O hook
  `useEstadoJogo` descarta respostas que chegam fora de ordem e força uma recarga imediata depois
  de responder/avançar, para a tela nunca ficar mostrando a pergunta anterior.
- **O gabarito nunca é enviado ao aluno antes da hora.** A API só inclui a resposta correta
  depois que o jogador respondeu, quando o tempo da pergunta acaba, ou para o professor que está
  conduzindo uma sala ao vivo. Atenção ao caso do modo solo: ali o próprio aluno é o "host" da
  sessão, então a regra de host **não** pode liberar o gabarito (senão daria para ver a resposta
  certa inspecionando a rede).
- **As alternativas são embaralhadas na hora de semear o banco**, não na hora de jogar. No arquivo
  `bancoDeQuizzes.ts` a alternativa correta é sempre a primeira (fica legível para quem edita);
  o seed embaralha antes de gravar, para a resposta certa não cair sempre no mesmo botão.
- **Migration do código de turma escrita manualmente, não gerada pelo `prisma migrate dev`.**
  Adicionar uma coluna `codigo` obrigatória e única a uma tabela que já tinha linhas exigiria
  apagar dados em modo interativo. Em vez disso, a migration
  (`add_turma_codigo_e_topico`) primeiro adiciona a coluna como opcional, gera um código
  aleatório para as turmas existentes, e só depois aplica `NOT NULL` + `UNIQUE` — preserva 100%
  dos dados já cadastrados.

## Próximos passos (fora do escopo desta versão)

- Recomendações automáticas de conteúdo por IA com base no desempenho do aluno.
- **Geração de perguntas por IA** a partir de um material publicado — hoje o "sistema cria o jogo"
  sorteando questionários do banco da plataforma, que é semeado manualmente.
- Notificações reais (Web Push / e-mail via Nodemailer) para tarefas, prazos e avisos — hoje
  tudo é consultado dentro do app, sem envio ativo.
- Job agendado para popular `ProgressoAluno` periodicamente (ver decisão técnica acima).
- Painel funcional da Coordenação (visão agregada de múltiplas turmas).
- Testes automatizados (unitários/integração) e pipeline de CI.
- Deploy do protótipo (Vercel para o front-end, Render/Railway para o back-end) — ver PDF de
  referência do projeto para a proposta original de hospedagem.
