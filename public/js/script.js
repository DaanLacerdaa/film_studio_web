document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema();
  configurarToggleTema();
  configurarMenuDropdown();
  configurarConfirmacaoExclusao();
  configurarFiltroTabela();
  iniciarAnimacoes();
  configurarPopups();

  await carregarFilmesDoBanco();
  await carregarPessoasDoBanco();
});

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
        <p><strong>Duração:</strong> ${filme.duracao} min</p>
        <p><strong>Idioma:</strong> ${filme.idioma}</p>
        <p><strong>Gênero:</strong> ${filme.genero}</p>
        <p><strong>Diretor:</strong> ${
          filme.diretor?.nome || "Desconhecido"
        }</p>
        <p><strong>Produtores:</strong> ${
          filme.produtores?.map((p) => p.nome).join(", ") || "Nenhum"
        }</p>
        <p><strong>Atores Principais:</strong> ${
          filme.elenco
            ?.filter((a) => a.Atuacao.is_principal)
            .map((a) => a.nome)
            .join(", ") || "Nenhum"
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
        <p><strong>Sinopse:</strong> ${filmeDadosExternos?.sinopse || "Não disponível"}</p>

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

async function carregarPessoasDoBanco() {
  try {
    const containers = {
      atores: document.getElementById("atores-container"),
      diretores: document.getElementById("diretores-container"),
      produtores: document.getElementById("produtores-container"),
    };

    function formatarData(data) {
      if (!data) return "N/A";
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    for (const [categoria, container] of Object.entries(containers)) {
      if (!container) continue;

      const pessoas = JSON.parse(container.dataset[categoria.toLowerCase()] || "[]");
      container.innerHTML = "";

      for (const pessoa of pessoas) {
        const imgUrl = await buscarImagemPessoa(pessoa.nome);
        
        // Verifica se o ator participou de filmes e exibe a relação
        const filmesParticipados = pessoa.filmes?.map((f) => 
          `${f.titulo} (${f.Atuacao.is_principal ? "Protagonista" : "Coadjuvante"})`
        ).join(", ") || "Nenhum filme registrado";

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <h2>${pessoa.nome}</h2>
          <div class="person-photo">
            <img class="popup-trigger" data-nome="${pessoa.nome}" src="${imgUrl}" alt="Foto de ${pessoa.nome}">
          </div>
          <p><strong>Data Nasc.:</strong> ${formatarData(pessoa.data_nascimento)}</p>
          <p><strong>Sexo:</strong> ${pessoa.sexo || "N/A"}</p>
          <p><strong>Nacionalidade:</strong> ${pessoa.nacionalidade || "N/A"}</p>
          <p><strong>Filmes:</strong> ${filmesParticipados}</p>
          <div class="actions">
            <a href="/pessoas/editar/${pessoa.id}">Editar</a>
            <form action="/pessoas/deletar/${pessoa.id}" method="POST" class="delete-form">
              <button type="submit">Deletar</button>
            </form>
          </div>
        `;

        container.appendChild(card);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar pessoas:", error);
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
      rottenTomatoes: dataOMDB.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value || "N/A",
      sinopse: filmeTMDB.overview || dataOMDB.Plot || "Sinopse não disponível."
    };
    
  } catch (error) {
    console.error("Erro na busca de filme:", error);
    return null;
  }
}
// ========== 🌐 FUNÇÕES DE API ==========
async function buscarImagemPessoa(nome) {
  const apiKey = "50c08b07f173158a7370068b082b9294";; // Certifique-se de inserir sua API key

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(nome)}&include_adult=false`
    );

    if (!response.ok) throw new Error("Erro na resposta da API TMDB");

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`Nenhum resultado encontrado para: ${nome}`);
      return "/images/default-person.jpg"; // Retorna a imagem padrão caso não encontre
    }

    const pessoa = data.results[0];

    return pessoa.profile_path
      ? `https://image.tmdb.org/t/p/w276_and_h350_face${pessoa.profile_path}`
      : "/images/default-person.jpg";
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return "/images/default-person.jpg"; // Em caso de erro, retorna a imagem padrão
  }
}



document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("[data-pessoas]").forEach(async (container) => {
    const tipo = container.getAttribute("data-tipo"); // Obtém o tipo (atores, diretores, produtores)
    const pessoas = JSON.parse(container.getAttribute("data-pessoas") || "[]");

    // Buscar imagens para todas as pessoas de forma assíncrona
    for (let pessoa of pessoas) {
      pessoa.imagem = await buscarImagemPessoa(pessoa.nome);
    }

    // Atualizar o HTML com as imagens já carregadas
    container.innerHTML = pessoas
      .map(
        (pessoa) => `
        <div class="card">
          <h2>${pessoa.nome}</h2>
          <div class="person-photo">
            <img src="${pessoa.imagem}" alt="Foto de ${pessoa.nome}">
          </div>
          <p><strong>Data de Nascimento:</strong> ${pessoa.data_nascimento || "Não disponível"}</p>
          <p><strong>Sexo:</strong> ${pessoa.sexo || "Não informado"}</p>
          <p><strong>Nacionalidade:</strong> ${pessoa.nacionalidade || "Não disponível"}</p>
        </div>
      `
      )
      .join("");
  });
});




// ========== 🖼️ FUNÇÕES DE POPUP ==========
function configurarPopups() {
  let popupAtivo = null;

document.addEventListener("mouseover", async (e) => {
  if (e.target.classList.contains("popup-trigger") && !popupAtivo) {
    popupAtivo = criarPopup(e.target);
    document.body.appendChild(popupAtivo);
  }
});

document.addEventListener("mouseout", (e) => {
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
  imgClone.style.maxWidth = "300px";
  imgClone.style.maxHeight = "400px";

  popup.appendChild(imgClone);
  posicionarPopup(popup, imgElement);
  return popup;
}

function posicionarPopup(popup, target) {
  const rect = target.getBoundingClientRect();
  popup.style.position = "absolute";
  popup.style.top = `${rect.top + window.scrollY}px`;
  popup.style.left = `${rect.left + rect.width + 20}px`;
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
      document.querySelectorAll('.card').forEach(card => {
        card.style.display = "none";
        card.offsetHeight; // Força reflow
        card.style.display = "block";
      });
    });
  }
}

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema();  // Aplica o tema armazenado
  configurarToggleTema();  // Configura o botão de alternância
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
  document.querySelectorAll(".botao-filtro").forEach(botao => {
    botao.addEventListener("click", () => {
      const tipo = botao.getAttribute("data-tipo");
      document.querySelectorAll(".card-grid").forEach(grid => {
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
