document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema();
  configurarToggleTema();
  configurarMenuDropdown();
  configurarConfirmacaoExclusao();
  configurarFiltroTabela();
  iniciarAnimacoes();
  configurarPopups();

  // Carregar de forma sequencial
  await carregarFilmesDoBanco();
  await carregarPessoasDoBanco();

  formatarData();
});

// ========== 🌐 CONFIGURAÇÕES GLOBAIS ==========
const apiKeyTMDB = "50c08b07f173158a7370068b082b9294";
const defaultImage = "/images/default-person.jpg"; // ← Adicionar aqui
const defaultMovieImage = "/images/default-movie.jpg";

// ========== 🎬 FUNÇÕES PRINCIPAIS ==========
async function carregarFilmesDoBanco() {
  const container = document.getElementById("filmes-container");
  if (!container) return;

  try {
    const filmes = JSON.parse(container.dataset.filmes);
    container.innerHTML = "";

    for (const filme of filmes) {
      const filmeDadosExternos = await buscarFilme(filme.titulo);

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h2>${filme.titulo} (${filme.ano_lancamento})</h2>
        <p><strong>Duração:</strong> ${filme.duracao || "N/A"} min</p>
        <p><strong>Idioma:</strong> ${filme.idioma || "Desconhecido"}</p>
        <p><strong>Gênero:</strong> ${filme.genero || "Desconhecido"}</p>
        <p><strong>Diretor:</strong> ${
          filme.diretor?.nome || "Desconhecido"
        }</p>
        <p><strong>Produtores:</strong> ${
          Array.isArray(filme.produtores) && filme.produtores.length > 0
            ? filme.produtores.map((p) => p.nome).join(", ")
            : "Nenhum"
        }</p>
        <p><strong>Atores Principais:</strong> ${
          Array.isArray(filme.elenco) && filme.elenco.length > 0
            ? filme.elenco
                .filter((a) => a.Atuacao?.is_principal)
                .map((a) => a.nome)
                .join(", ")
            : "Nenhum"
        }</p>
        <p><strong>Título Original:</strong> ${
          filmeDadosExternos?.tituloOriginal || "N/A"
        }</p>
        <p><strong>Nota IMDb:</strong> ${
          filmeDadosExternos?.imdbRating || "N/A"
        }</p>
        <p><strong>Rotten Tomatoes:</strong> ${
          filmeDadosExternos?.rottenTomatoes || "N/A"
        }</p>
        <p><strong>Sinopse:</strong> ${
          filmeDadosExternos?.sinopse || "Não disponível"
        }</p>

        <div class="movie-cover">
          <img src="${
            filmeDadosExternos?.posterPath || "/images/default-movie.jpg"
          }" class="movie-poster" alt="Poster de ${filme.titulo}">
        </div>
        <div class="actions">
          <a href="/filmes/editar/${filme.id}">Editar</a>
          <form 
            action="/filmes/deletar/${filme.id}" 
            method="POST" 
            class="delete-form"
          >
            <button type="submit">Deletar</button>
          </form>
        </div>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Erro ao carregar filmes:", error);
  }
}

// ========== 🌐 FUNÇÕES DE API ==========
async function buscarFilme(titulo) {
  const apiKeyTMDB = "50c08b07f173158a7370068b082b9294";
  const apiKeyOMDB = "ea8906de";

  try {
    // Primeira busca no TMDB
    const responseTMDB = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKeyTMDB}&query=${encodeURIComponent(
        titulo
      )}&language=pt-BR`
    );

    const dataTMDB = await responseTMDB.json();
    if (!dataTMDB.results?.length) return null;

    const filmeTMDB = dataTMDB.results[0];

    // Busca complementar no OMDB
    const responseOMDB = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(
        filmeTMDB.original_title
      )}&apikey=${apiKeyOMDB}`
    );

    const dataOMDB = await responseOMDB.json();

    return {
      tituloOriginal: filmeTMDB.original_title,
      posterPath: filmeTMDB.poster_path
        ? `https://image.tmdb.org/t/p/w500${filmeTMDB.poster_path}`
        : dataOMDB.Poster || "/images/default-movie.jpg",
      imdbRating: dataOMDB.imdbRating || "N/A",
      rottenTomatoes:
        dataOMDB.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value ||
        "N/A",
      sinopse: filmeTMDB.overview || dataOMDB.Plot || "Sinopse não disponível.",
    };
  } catch (error) {
    console.error("Erro na busca de filme:", error);
    return null;
  }
}
// ========== 🌐 FUNÇÕES DE API ==========
async function buscarImagemPessoa(nome) {
  const baseURL = "https://api.themoviedb.org/3/search/person";
  const apiKeyTMDB = "50c08b07f173158a7370068b082b9294";
  const defaultImage = "/images/default-person.jpg";
  // Formatação do nome para a query
  const nomeFormatado = nome.trim().toLowerCase();
  if (!nomeFormatado) return defaultImage;
  const query = encodeURIComponent(nome)
    .replace(/%20/g, "+") // Espaços para '+'
    .replace(/%2B/g, "+") // Mantém sinais de '+'
    .toLowerCase();

  try {
    const response = await fetch(
      `${baseURL}?api_key=${apiKeyTMDB}&query=${query}&language=pt-BR`
    );

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    // Verifica resultados e caminho da imagem
    if (data.results?.[0]?.profile_path) {
      const tamanhos = ["w185", "w342", "original"];
      return tamanhos.map(
        (t) => `https://image.tmdb.org/t/p/${t}${data.results[0].profile_path}`
      )[0];
    }

    console.warn(`Imagem não encontrada para: ${nome}`);
    return defaultImage;
  } catch (error) {
    console.error(`Erro ao buscar imagem para ${nome}:`, error.message);
    return defaultImage;
  }
}

// ========== 🃏 CRIAÇÃO DE CARDS ==========
function criarCardPessoa(pessoa, imagemURL) {
  const card = document.createElement("div");
  card.className = "card-pessoa";

  // Usar a variável global corretamente
  const imagem = imagemURL?.startsWith("http") ? imagemURL : defaultImage; // ← Agora usando a variável global

  card.innerHTML = `
    <img src="${imagem}" alt="${pessoa.nome}" class="foto-perfil">
    <div class="info-pessoa">
        <h3>${pessoa.nome}</h3>
        <p><strong>Nascimento:</strong> ${formatarData(
          pessoa.data_nascimento
        )}</p>
        <p><strong>Nacionalidade:</strong> ${pessoa.nacionalidade || "N/A"}</p>
        <p><strong>Sexo:</strong> ${pessoa.sexo || "N/A"}</p>
        <p><strong>Tipo:</strong> ${pessoa.tipo || "N/A"}</p>
        ${gerarDetalhesFilmes(pessoa)}
    </div>
  `;

  return card;
}

// ========== 🚀 CARREGAMENTO DE DADOS ==========
async function carregarPessoasDoBanco() {
  const categorias = ["ATOR", "DIRETOR", "PRODUTOR"];

  for (const categoria of categorias) {
    const container = document.getElementById(
      `${categoria.toLowerCase()}-container`
    );
    if (!container) continue;

    // Acesso correto ao dataset (categoria em minúsculas)
    const pessoasData = container.dataset[categoria.toLowerCase()];
    if (!pessoasData) {
      console.warn(`Dados de ${categoria} não encontrados.`);
      continue;
    }

    let pessoas;
    try {
      pessoas = JSON.parse(pessoasData);
    } catch (error) {
      console.error(`Erro ao parsear dados de ${categoria}:`, error);
      continue;
    }

    if (!Array.isArray(pessoas) || pessoas.length === 0) {
      console.warn(`Nenhuma pessoa encontrada em ${categoria}.`);
      continue;
    }

    container.innerHTML = ""; // Limpar container

    // Processar cada pessoa individualmente
    for (const pessoa of pessoas) {
      if (!pessoa?.nome) {
        console.warn("Pessoa inválida:", pessoa);
        continue;
      }

      const imagem = await buscarImagemPessoa(pessoa.nome);
      const card = criarCardPessoa(pessoa, imagem);
      container.appendChild(card);
    }
  }
}

// ========== 🎬 INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
  carregarPessoasDoBanco();

  // Filtro dinâmico (caso exista)
  const tipoFiltro = document.getElementById("tipoFiltro");
  if (tipoFiltro) {
    tipoFiltro.addEventListener("change", async function () {
      const tipo = this.value.toUpperCase();
      try {
        const response = await fetch(`/pessoas/${tipo.toLowerCase()}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const dados = await response.json();
        atualizarLista(dados);
      } catch (error) {
        console.error("Falha ao filtrar:", error);
      }
    });
  }
});

// ========== 🔄 ATUALIZAÇÃO DINÂMICA ==========
function atualizarLista(pessoas) {
  const container = document.getElementById("dynamic-container");
  if (!container) return;

  container.innerHTML = ""; // Resetar conteúdo

  if (!Array.isArray(pessoas) || pessoas.length === 0) {
    container.innerHTML = `<p class="sem-dados">Nenhum resultado encontrado</p>`;
    return;
  }

  // Criar cards para os resultados filtrados
  pessoas.forEach(async (pessoa) => {
    const imagem = await buscarImagemPessoa(pessoa.nome);
    container.appendChild(criarCardPessoa(pessoa, imagem));
  });
}
function criarCardFilme(filme, imagem) {
  const card = document.createElement("div");
  card.className = "card-filme";
  card.innerHTML = `
      <img src="${imagem}" alt="${filme.titulo}">
      <h3>${filme.titulo}</h3>
      <p>Lançamento: ${filme.ano_lancamento}</p>
  `;
  return card;
}

// Função corrigida para formatar data corretamente
function formatarData(data) {
  if (!data) return "N/A";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch (e) {
    return "Data inválida";
  }
}
function gerarDetalhesFilmes(pessoa) {
  if (!pessoa.filmes?.length) return "";

  const filmesList = pessoa.filmes
    .map(
      (f) => `
    <li>
      ${f.titulo} 
      <em>(${f.Atuacao?.is_principal ? "Protagonista" : "Coadjuvante"})</em>
    </li>
  `
    )
    .join("");

  return `
    <details>
      <summary>Participações (${pessoa.filmes.length})</summary>
      <ul class="filmes-list">${filmesList}</ul>
    </details>
  `;
}

// Atualizar o DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  carregarFilmesDoBanco();
  carregarPessoasDoBanco();
});

// ========== 🖼️ FUNÇÕES DE POPUP ==========
function configurarPopups() {
  let popupAtivo = null;

  document.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("popup-trigger") && !popupAtivo) {
      popupAtivo = criarPopup(e.target);
      document.body.appendChild(popupAtivo);
    }
  });

  document.addEventListener("mouseout", () => {
    if (popupAtivo) {
      popupAtivo.remove();
      popupAtivo = null;
    }
  });
}

function criarPopup(imgElement) {
  const popup = document.createElement("div");
  popup.id = "image-popup";
  popup.className = "image-popup";

  const imgClone = imgElement.cloneNode();
  Object.assign(imgClone.style, {
    maxWidth: "300px",
    maxHeight: "400px",
  });

  popup.appendChild(imgClone);
  posicionarPopup(popup, imgElement);
  return popup;
}

function posicionarPopup(popup, target) {
  const rect = target.getBoundingClientRect();
  Object.assign(popup.style, {
    position: "absolute",
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + rect.width + 20}px`,
  });
}

// ========== 🛠️ FUNÇÕES UTILITÁRIAS ==========
// Função para aplicar o tema armazenado no localStorage
// ========== 🛠 MELHORIAS NO CONTROLE DE TEMA ==========

// ========== 🛠 FUNÇÕES UTILITÁRIAS ==========

// Função para aplicar o tema salvo no localStorage
function aplicarTema() {
  const temaSalvo = localStorage.getItem("tema") || "dark";
  document.documentElement.setAttribute("data-theme", temaSalvo);

  // Atualizar o estado do checkbox
  const toggleBtn = document.getElementById("tema-toggle");
  if (toggleBtn) {
    toggleBtn.checked = temaSalvo === "dark";
  }
}

// Função para alternar o tema
function configurarToggleTema() {
  const toggleBtn = document.getElementById("tema-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("change", () => {
      const novoTema = toggleBtn.checked ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", novoTema);
      localStorage.setItem("tema", novoTema);

      // Forçar re-render dos elementos
      document.querySelectorAll(".card").forEach((card) => {
        card.style.display = "none";
        card.offsetHeight; // Força reflow
        card.style.display = "block";
      });
    });
  }
}

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(); // Aplica o tema armazenado
  configurarToggleTema(); // Configura o botão de alternância
});

function configurarMenuDropdown() {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  });
}

function configurarConfirmacaoExclusao() {
  document.addEventListener("submit", (e) => {
    if (e.target.classList.contains("delete-form")) {
      if (!confirm("Tem certeza que deseja excluir este item?")) {
        e.preventDefault();
      }
    }
  });
}

async function filtrarPessoas(tipo) {
  try {
    const response = await fetch(`/pessoas?tipo=${tipo}`);
    if (!response.ok) throw new Error("Erro ao buscar dados");

    const data = await response.json();

    // Atualiza a interface (exemplo: lista de pessoas)
    const listaPessoas = document.getElementById("lista-pessoas");
    if (!listaPessoas) return;

    listaPessoas.innerHTML = "";
    data.forEach((pessoa) => {
      const item = document.createElement("li");
      item.textContent = pessoa.nome;
      listaPessoas.appendChild(item);
    });
  } catch (error) {
    console.error("Erro ao carregar pessoas:", error);
  }
}

// Adiciona eventos aos botões de filtro (se existirem)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".botao-filtro").forEach((botao) => {
    botao.addEventListener("click", () => {
      const tipo = botao.getAttribute("data-tipo");
      document.querySelectorAll(".card-grid").forEach((grid) => {
        grid.style.display = grid.id.includes(tipo) ? "grid" : "none";
      });
    });
  });
});
function configurarFiltroTabela() {
  const filtroInput = document.getElementById("filtro-tabela");
  if (filtroInput) {
    filtroInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      document.querySelectorAll(".tabela-dados tr").forEach((linha) => {
        const textoLinha = linha.textContent.toLowerCase();
        linha.style.display = textoLinha.includes(termo) ? "" : "none";
      });
    });
  }
}

function iniciarAnimacoes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  document.querySelectorAll(".animate-on-scroll").forEach((element) => {
    observer.observe(element);
  });
}
