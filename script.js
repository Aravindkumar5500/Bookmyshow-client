
async function fetchMovies() {
  const movieCardsContainer = document.getElementById("movieCards");
  movieCardsContainer.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("https://bookmyshow-backend-wl78.onrender.com/movie/get-movies");
    const movies = await response.json();
    movieCardsContainer.innerHTML = "";

    if (response.ok) {
      console.log(movies.length); // Check if you're getting all 29 movies
      movies.forEach((movie) => {
        const card = document.createElement("div");
        card.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
        card.innerHTML = `
          <div class="card" style="cursor: pointer" onclick="location.href='details.html?id=${movie._id}'">
            <img
              src="${movie.image || 'default-placeholder-image-url'}"
              alt="${movie.title} poster"
            />
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <p class="card-text">${movie.genre}</p>
            </div>
          </div>`;
        movieCardsContainer.appendChild(card);
      });
    } else {
      movieCardsContainer.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
    }
  } catch (error) {
    console.log(error);
    movieCardsContainer.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
  }
}

fetchMovies();


