(() => {
  const API_BASE_URL = (window.BOOKMYSHOW_API_BASE_URL || "https://bookmyshow-backend-wl78.onrender.com").replace(/\/$/, "");
  const movieId = new URLSearchParams(window.location.search).get("id");
  const detailStatus = document.getElementById("detailStatus");
  const movieDetails = document.getElementById("movieDetails");
  const showtimes = document.getElementById("showtimes");
  const dialog = document.getElementById("bookingDialog");
  const form = document.getElementById("bookingForm");
  const bookingStatus = document.getElementById("bookingStatus");
  const submitButton = document.getElementById("submitBooking");
  let selectedShow = null;
  let currentMovie = null;

  function setDetailStatus(message, type = "info") {
    detailStatus.textContent = message;
    detailStatus.className = `status-panel ${type}`;
    detailStatus.hidden = !message;
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

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function isFutureDate(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
    const showDate = new Date(`${dateText}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(showDate.getTime()) && showDate >= today;
  }

  function renderMovie(movie) {
    movieDetails.replaceChildren();
    const layout = make("div", "movie-hero");
    const posterFrame = make("div", "detail-poster-frame");
    const imageUrl = safeImageUrl(movie.image);
    if (imageUrl) {
      const image = make("img", "detail-poster");
      image.src = imageUrl;
      image.alt = `${movie.title || "Movie"} poster`;
      image.addEventListener("error", () => image.remove(), { once: true });
      posterFrame.appendChild(image);
    } else {
      posterFrame.appendChild(make("div", "poster-fallback", "SCREEN TIME"));
    }

    const information = make("div", "movie-information");
    information.appendChild(make("p", "eyebrow", "FEATURED MOVIE"));
    information.appendChild(make("h1", "detail-title", movie.title || "Untitled movie"));
    const facts = make("p", "movie-facts", [movie.year, movie.genre, movie.duration].filter(Boolean).join(" · "));
    information.appendChild(facts);
    if (movie.director) information.appendChild(make("p", "movie-director", `Directed by ${movie.director}`));
    information.appendChild(make("h2", "about-title", "About the movie"));
    information.appendChild(make("p", "movie-description", movie.description || "No description is available for this movie."));
    layout.append(posterFrame, information);
    movieDetails.appendChild(layout);
  }

  function openBooking(show, date) {
    selectedShow = { ...show, date };
    document.getElementById("selectedShow").textContent =
      `${currentMovie.title} · ${date} · ${show.time} · ${show.seats} seats available`;
    bookingStatus.textContent = "";
    form.reset();
    const seatInput = document.getElementById("seatCount");
    seatInput.max = String(Math.min(10, Math.max(1, Number(show.seats) || 1)));
    seatInput.value = "1";
    dialog.showModal();
  }

  function renderShowtimes(movie) {
    showtimes.replaceChildren();
    const entries = Object.entries(movie.shows || {})
      .filter(([date, shows]) => isFutureDate(date) && Array.isArray(shows))
      .flatMap(([date, shows]) => shows.map((show) => ({ date, show })))
      .filter(({ show }) => show && show.id && Number(show.seats) > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!entries.length) {
      showtimes.appendChild(make("div", "status-panel empty",
        "There are no upcoming showtimes for this movie. Please check back later."));
      return;
    }

    entries.forEach(({ date, show }) => {
      const row = make("article", "showtime-card");
      const dateBlock = make("div", "show-date");
      const parsedDate = new Date(`${date}T00:00:00`);
      dateBlock.append(
        make("span", "date-day", new Intl.DateTimeFormat("en", { day: "2-digit" }).format(parsedDate)),
        make("span", "date-month", new Intl.DateTimeFormat("en", { month: "short" }).format(parsedDate))
      );
      const timeBlock = make("div", "show-time");
      timeBlock.append(make("strong", "", show.time || "Showtime unavailable"), make("span", "", `${show.seats} seats available`));
      const bookButton = make("button", "primary-button compact", "Book tickets");
      bookButton.type = "button";
      bookButton.addEventListener("click", () => openBooking(show, date));
      row.append(dateBlock, timeBlock, bookButton);
      showtimes.appendChild(row);
    });
  }

  async function loadMovie() {
    if (!movieId) {
      setDetailStatus("Movie ID is missing from the page URL. Return to the movie list and choose a movie.", "error");
      showtimes.replaceChildren();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movie/${encodeURIComponent(movieId)}`, {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || `Request failed (${response.status})`);
      if (!payload || typeof payload !== "object") throw new Error("The movie service returned invalid data.");
      currentMovie = payload;
      document.title = `${payload.title || "Movie details"} — ScreenTime`;
      renderMovie(payload);
      renderShowtimes(payload);
      setDetailStatus("");
    } catch (error) {
      console.error("Unable to load movie:", error);
      setDetailStatus(error.message || "Could not load movie details. Please try again.", "error");
      showtimes.replaceChildren();
    }
  }

  document.getElementById("closeBooking").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedShow || !form.reportValidity()) return;

    const seats = Number(document.getElementById("seatCount").value);
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    if (!Number.isInteger(seats) || seats < 1 || seats > 10) {
      bookingStatus.textContent = "Choose between 1 and 10 seats.";
      return;
    }
    if (!/^[+\d][\d\s()-]{7,19}$/.test(phoneNumber)) {
      bookingStatus.textContent = "Enter a valid phone number.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Confirming…";
    bookingStatus.textContent = "";

    try {
      const response = await fetch(`${API_BASE_URL}/movie/book-movie`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          movieId,
          showId: selectedShow.id,
          seats,
          name,
          email,
          phoneNumber,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || `Booking failed (${response.status})`);

      dialog.close();
      window.alert(payload?.message || "Booking created successfully.");
      await loadMovie();
    } catch (error) {
      bookingStatus.textContent = error.message || "Booking failed. Please try again.";
      bookingStatus.className = "form-status error";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Confirm booking";
    }
  });

  loadMovie();
})();
