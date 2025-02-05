const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");


app.use(express.urlencoded({ extended: true }));

// Importando as rotas unificadas de filmes e pessoas
const filmesRoutes = require("./routes/filmes");
const pessoasRoutes = require("./routes/pessoas"); // Rota unificada para atores, diretores e produtores

// Configuração do EJS para renderização de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares para parsing de dados
app.use(express.json()); // Permite receber requisições com JSON no corpo
app.use(bodyParser.urlencoded({ extended: false })); // Permite receber formulários (x-www-form-urlencoded)

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Definição das rotas
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

// Inicialização do servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
