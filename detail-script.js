// Function to fetch and display movie details
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://bookmyshow-backend-wl78.onrender.com/movie/${movieId}`
    );
    const movie = await response.json();

    // Check if the response is valid and contains the expected movie data
    if (response.ok && movie) {
      const movieDetailsContainer = document.getElementById("movieDetails");

      // Add fallback values for missing properties
      const movieImage = movie.image ? movie.image : 'default-image-url.jpg'; // Use a default image if not present
      const movieTitle = movie.title ? movie.title : "Title not available";
      const movieDirector = movie.director ? movie.director : "Director not available";
      const movieGenre = movie.genre ? movie.genre : "Genre not available";
      const movieDescription = movie.description ? movie.description : "Description not available";

      movieDetailsContainer.innerHTML = `
        <div style="color: #fff; padding: 0px">
          <div class="container">
            <div class="row">
              <div class="col-md-4">
                <img
                  src="${movieImage}"
                  alt="Movie Image"
                  class="img-fluid mb-4"
                  style="max-width: 100%; height: 100%; object-fit: cover"
                />
              </div>
              <div class="col-md-8">
                <div style="color: black; padding: 0px">
                  <h1 class="mb-4">${movieTitle}</h1>
                  <h4 class="mb-4">Director: ${movieDirector}</h4>
                  <h4 class="mb-4">Genre: ${movieGenre}</h4>
                  <h2>About the movie</h2>
                  <p>${movieDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr style="margin-top: 50px" />
        <h2 class="mt-4 mb-4 text-center">Book Tickets</h2>
      `;

      // Proceed with rendering the showtime table
      const showContainer = document.createElement("div");

      // Check if the movie has shows and render them
      if (movie.shows && Object.keys(movie.shows).length > 0) {
        showContainer.innerHTML = `
          <div class="container mt-4">
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Showtime</th>
                    <th>Seats</th>
                    <th>Book Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(movie.shows)
                    .flatMap(([date, showtimes]) =>
                      showtimes.map(
                        (show, index) => `
                        <tr>
                          ${
                            index === 0
                              ? `<td rowspan="${showtimes.length}" class="align-middle"><strong>${date}</strong></td>`
                              : ""
                          }
                          <td>
                            <div class="border p-1" style="display: flex; flex-direction: column; align-items: center;">
                              <div>${show.time}</div>
                              <div class="text-muted" style="font-size: 15px;">4K Dolby Atmos 7.1</div>
                            </div>
                          </td>
                          <td>
                            <div class="border p-3" style="display: flex; flex-direction: column; align-items: center;">
                              <div>${show.seats}</div>
                            </div>
                          </td>
                          <td>
                            <button class="btn btn-sm btn-danger p-3 d-block w-100" onclick="bookTickets('${movie._id}', '${show.id}', '${date}')">Book Tickets</button>
                          </td>
                        </tr>`
                      )
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `;
        document.body.appendChild(showContainer);
      } else {
        console.log("No shows available for this movie.");
      }
    } else {
      console.error("Error fetching movie details:", movie ? movie.message : "Movie not found.");
      alert("Movie details not found.");
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    alert("An error occurred while fetching the movie details.");
  }
}
