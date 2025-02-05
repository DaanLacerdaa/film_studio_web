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
      };
    } catch (error) {
      console.error("Erro na busca de filme:", error);
      return null;
    }
  }
  module.exports = { buscarFilme };