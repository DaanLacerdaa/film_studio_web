const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/auth");
const flash = require("connect-flash");

app.use(express.urlencoded({ extended: true }));

// Importando as rotas unificadas de filmes e pessoas
const filmesRoutes = require("./routes/filmes");
const pessoasRoutes = require("./routes/pessoas"); // Rota unificada para atores, diretores e produtores

app.use((req, res, next) => {
  res.locals.session = req.session; // Permite acessar session nas views
  next();
});

// Configuração do EJS para renderização de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares para parsing de dados
app.use(express.json()); // Permite receber requisições com JSON no corpo
app.use(bodyParser.urlencoded({ extended: false })); // Permite receber formulários (x-www-form-urlencoded)

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Definição das rotas
// Usar as rotas de filmes
app.use("/filmes", filmesRoutes);
app.use("/pessoas", pessoasRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.render("index");
});

// Rota 404 (Página não encontrada)
app.use((req, res) => {
  res.status(404).render("erro", { mensagem: "Página não encontrada" });
});

// Habilite CORS para imagens do TMDB
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://image.tmdb.org");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  session({
    secret: "seuSegredoSuperSeguro",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use "true" se estiver em HTTPS
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Usar as rotas de autenticação
app.use(authRoutes);

// Rota protegida
app.get("/", authMiddleware, (req, res) => {
  res.send(
    `<h1>Bem-vindo, ${req.session.user.name}!</h1><a href="/logout">Sair</a>`
  );
});

// Inicialização do servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
