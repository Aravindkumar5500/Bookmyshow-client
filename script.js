(() => {
  const API_BASE_URL = (window.BOOKMYSHOW_API_BASE_URL || "https://bookmyshow-backend-wl78.onrender.com").replace(/\/$/, "");
  const cardsContainer = document.getElementById("movieCards");
  const status = document.getElementById("movieStatus");
  const searchForm = document.getElementById("movieSearch");
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("resultCount");
  let allMovies = [];

  function setStatus(message, type = "info") {
    status.textContent = message;
    status.className = `status-panel ${type}`;
    status.hidden = !message;
  }

  function safeImageUrl(value) {
    if (typeof value !== "string") return "";
    try {
      const url = new URL(value, window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function renderMovies(movies) {
    cardsContainer.replaceChildren();
    resultCount.textContent = `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`;

    if (!movies.length) {
      setStatus(allMovies.length ? "No movies match your search. Try another title." : "No movies are available right now.", "empty");
      return;
    }

    setStatus("");
    const fragment = document.createDocumentFragment();

    movies.forEach((movie) => {
      const card = document.createElement("a");
      card.className = "movie-card";
      card.href = `./details.html?id=${encodeURIComponent(movie._id || "")}`;
      const posterWrap = document.createElement("div");
      posterWrap.className = "poster-wrap";
      const poster = document.createElement("img");
      poster.className = "movie-poster";
      poster.src = safeImageUrl(movie.image) || "./";
      poster.alt = movie.title ? `${movie.title} poster` : "Movie poster";
      poster.loading = "lazy";
      poster.decoding = "async";
      poster.addEventListener("error", () => {
        poster.remove();
        posterWrap.classList.add("poster-fallback");
        posterWrap.textContent = "SCREEN TIME";
      }, { once: true });
      posterWrap.appendChild(poster);

      const content = document.createElement("div");
      content.className = "movie-card-content";
      const title = document.createElement("h3");
      title.textContent = movie.title || "Untitled movie";
      const meta = document.createElement("p");
      meta.textContent = [movie.year, movie.genre].filter(Boolean).join(" · ") || "Movie";
      const action = document.createElement("span");
      action.className = "text-link";
      action.textContent = "View details →";
      content.append(title, meta, action);
      card.append(posterWrap, content);
      fragment.appendChild(card);
    });

    cardsContainer.appendChild(fragment);
  }

  async function loadMovies() {
    setStatus("Loading movies…");
    cardsContainer.replaceChildren();
    try {
      const response = await fetch(`${API_BASE_URL}/movie/get-movies`, {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || `Request failed (${response.status})`);
      if (!Array.isArray(payload)) throw new Error("The movie service returned an unexpected response.");
      allMovies = payload;
      renderMovies(allMovies);
    } catch (error) {
      console.error("Unable to load movies:", error);
      setStatus(error.message || "Could not load movies. Please refresh and try again.", "error");
      resultCount.textContent = "";
    }
  }

  searchForm.addEventListener("submit", (event) => event.preventDefault());
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filtered = allMovies.filter((movie) =>
      [movie.title, movie.genre, movie.director, movie.year]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(query))
    );
    renderMovies(filtered);
  });

  loadMovies();
})();
