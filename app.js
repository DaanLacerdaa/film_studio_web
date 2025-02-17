const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/auth");
const filmesRoutes = require("./routes/filmes");
const pessoasRoutes = require("./routes/pessoas");

// Carregar variáveis de ambiente antes de usá-las
require("dotenv").config();
const SESSION_SECRET = process.env.SESSION_SECRET;

// Middleware para parsing de dados
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Habilite CORS para imagens do TMDB
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://image.tmdb.org");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Configuração da sessão
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Defina como true em produção com HTTPS
  })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.mensagem = req.flash("mensagem");
  res.locals.erro = req.flash("error");
  res.locals.session = req.session; // Permite acessar session nas views
  next();
});

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Definição das rotas
app.use("/filmes", filmesRoutes);
app.use("/pessoas", pessoasRoutes);
app.use(authRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.render("index");
});

// Rota protegida
app.get("/dashboard", authMiddleware, (req, res) => {
  res.send(
    `<h1>Bem-vindo, ${req.session.user.name}!</h1><a href="/logout">Sair</a>`
  );
});

// Rota 404 (Página não encontrada)
app.use((req, res) => {
  res.status(404).send("<h1>Erro 404</h1><p>Página não encontrada</p>");
});

// Inicialização do servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
