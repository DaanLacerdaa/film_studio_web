const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/auth");

// Importação de rotas
const filmesRoutes = require("./routes/filmes");
const pessoasRoutes = require("./routes/pessoas"); // Unificação de atores, diretores e produtores

// Configuração do EJS para renderização de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para parsing de dados
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Configuração do Session
require("dotenv").config();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // secure: false para desenvolvimento
  })
);

// Middleware de flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.session = req.session; // Permite acessar session nas views
  next();
});

// Habilitar CORS para imagens do TMDB
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://image.tmdb.org");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Definição das rotas
app.use("/filmes", filmesRoutes);
app.use("/pessoas", pessoasRoutes);
app.use(authRoutes); // Mover a rota de autenticação para antes da rota principal

// Rota principal (ajustada para não sobrescrever a rota protegida)
app.get("/", (req, res) => {
  if (req.session.user) {
    res.send(
      `<h1>Bem-vindo, ${req.session.user.email}!</h1><a href="/logout">Sair</a>`
    );
  } else {
    res.render("index");
  }
});

// Rota 404 (Página não encontrada)
app.use((req, res) => {
  res.status(404).render("erro", { mensagem: "Página não encontrada" });
});

// Inicialização do servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
