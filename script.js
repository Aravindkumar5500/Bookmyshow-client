(() => {
  const API_BASE_URL = (window.BOOKMYSHOW_API_BASE_URL || "https://bookmyshow-backend-wl78.onrender.com").replace(/\/$/, "");
  const cardsContainer = document.getElementById("movieCards");
  const status = document.getElementById("movieStatus");
  const statusMessage = document.getElementById("statusMessage");
  const retryButton = document.getElementById("retryButton");
  const searchForm = document.getElementById("movieSearch");
  const searchInput = document.getElementById("searchInput");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const signInButton = document.getElementById("signInButton");
  let allMovies = [];

  function setStatus(message, type, canRetry) {
    statusMessage.textContent = message || "";
    status.className = "movie-status" + (type ? " " + type : "");
    status.hidden = !message;
    retryButton.hidden = !canRetry;
  }

  function safeImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function normalizeMovieList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.movies)) return payload.movies;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return null;
  }

  function createPoster(movie) {
    const frame = document.createElement("div");
    frame.className = "poster-stage";
    const imageUrl = safeImageUrl(movie.image);

    if (!imageUrl) {
      const placeholder = document.createElement("div");
      placeholder.className = "poster-placeholder";
      placeholder.textContent = movie.title || "Movie poster unavailable";
      frame.appendChild(placeholder);
      return frame;
    }

    const image = document.createElement("img");
    image.className = "movie-poster";
    image.src = imageUrl;
    image.alt = (movie.title || "Movie") + " poster";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function () {
      const placeholder = document.createElement("div");
      placeholder.className = "poster-placeholder";
      placeholder.textContent = movie.title || "Movie poster unavailable";
      frame.replaceChildren(placeholder);
    }, { once: true });
    frame.appendChild(image);

    const meta = document.createElement("div");
    meta.className = "poster-meta";
    const icon = document.createElement("span");
    icon.className = "poster-meta-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▣";
    const label = document.createElement("span");
    label.className = "poster-meta-label";
    label.textContent = "RELEASE";
    const value = document.createElement("span");
    value.className = "poster-meta-value";
    value.textContent = movie.year ? String(movie.year) : "MOVIE";
    meta.append(icon, label, value);
    frame.appendChild(meta);
    return frame;
  }

  function createMovieCard(movie) {
    const card = document.createElement("a");
    card.className = "movie-card";
    if (movie._id) {
      card.href = "./details.html?id=" + encodeURIComponent(movie._id);
    } else {
      card.href = "#recommended";
      card.addEventListener("click", function (event) { event.preventDefault(); });
    }

    card.appendChild(createPoster(movie));

    const title = document.createElement("h2");
    title.textContent = movie.title || "Untitled movie";
    const genre = document.createElement("p");
    genre.className = "movie-genre";
    genre.textContent = String(movie.genre || "Movie").replace(/,/g, " / ");

    card.append(title, genre);
    return card;
  }

  function renderMovies(movies, isSearch) {
    cardsContainer.replaceChildren();

    if (!movies.length) {
      setStatus(isSearch ? "No movies match your search. Try another title." : "No movies are available right now.", "empty", false);
      return;
    }

    const fragment = document.createDocumentFragment();
    movies.forEach(function (movie) {
      if (movie && typeof movie === "object") fragment.appendChild(createMovieCard(movie));
    });
    cardsContainer.appendChild(fragment);
    setStatus("", "", false);
  }

  async function loadMovies() {
    setStatus("Loading movies…", "", false);
    cardsContainer.replaceChildren();

    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, 15000);

    try {
      const response = await fetch(API_BASE_URL + "/movie/get-movies", {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      const payload = await response.json().catch(function () { return null; });
      if (!response.ok) {
        const message = payload && payload.message ? payload.message : "Movie service returned HTTP " + response.status + ".";
        throw new Error(message);
      }

      const movies = normalizeMovieList(payload);
      if (!movies) throw new Error("The movie service returned an unexpected response. Expected a movie list.");

      allMovies = movies.filter(function (movie) { return movie && typeof movie === "object"; });
      renderMovies(allMovies, false);
    } catch (error) {
      console.error("Unable to load movies:", error);
      let message = error.message || "Could not load movies.";
      if (error.name === "AbortError") {
        message = "The movie service took too long to respond. Please try again.";
      } else if (error instanceof TypeError) {
        message = "Could not connect to the movie service. Check that the backend is live and that this Vercel domain is allowed in the backend CLIENT_ORIGIN CORS setting.";
      }
      setStatus(message, "error", true);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filtered = allMovies.filter(function (movie) {
      return [movie.title, movie.genre, movie.director, movie.year].some(function (value) {
        return String(value == null ? "" : value).toLocaleLowerCase().includes(query);
      });
    });
    renderMovies(filtered, Boolean(query));
  });

  document.getElementById("nextMovies").addEventListener("click", function () {
    cardsContainer.scrollBy({ left: cardsContainer.clientWidth * 0.82, behavior: "smooth" });
  });
  document.getElementById("previousMovies").addEventListener("click", function () {
    cardsContainer.scrollBy({ left: -cardsContainer.clientWidth * 0.82, behavior: "smooth" });
  });

  menuToggle.addEventListener("click", function () {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    mobileMenu.hidden = isOpen;
  });
  mobileMenu.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      mobileMenu.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  });
  signInButton.addEventListener("click", function () {
    window.alert("Sign-in is not connected to the booking API yet.");
  });
  retryButton.addEventListener("click", loadMovies);

  loadMovies();
})();
