// Function to get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Get the 'id' parameter from the URL
}

// Load movie details when the page is loaded
window.onload = async () => {
  const movieId = getQueryParams(); // Get the movie ID from the URL
  console.log("Movie ID from URL:", movieId); // Debugging log to check if movie ID is correct
  if (movieId) {
    await fetchMovieDetails(movieId); // Fetch and display movie details
  } else {
    console.error("Movie ID is missing in the URL.");
    alert("Movie ID is missing. Please check the URL.");
  }
};

// Fetch movie details from the backend and render them
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://bookmyshow-backend-wl78.onrender.com/movie/${movieId}`
    );
    const movie = await response.json();
    console.log("Movie Data:", movie); // Log the fetched movie data for debugging

    if (response.ok && movie) {
      const movieDetailsContainer = document.getElementById("movieDetails");

      // Fallback values for missing data
      const movieImage = movie.image ? movie.image : 'default-image-url.jpg';
      const movieTitle = movie.title || "Title not available";
      const movieDirector = movie.director || "Director not available";
      const movieGenre = movie.genre || "Genre not available";
      const movieDescription = movie.description || "Description not available";

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
                  <h4 class="mb-4">Director : ${movieDirector}</h4>
                  <h4 class="mb-4">Genre : ${movieGenre}</h4>
                  <h2>About the movie</h2>
                  <p>${movieDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr style="margin-top: 50px" />
        <h2 class="mt-4 mb-4 text-center">Book Tickets</h2>`;

      // Create and render the showtimes table
      const showContainer = document.createElement("div");
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
                ${Object.entries(movie.shows).flatMap(([date, showtimes]) =>
                  showtimes.map((show, index) => `
                    <tr>
                      ${index === 0 ? `<td rowSpan="${showtimes.length}" class="align-middle"><strong>${date}</strong></td>` : ""}
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
                ).join("")}
              </tbody>
            </table>
          </div>
        </div>`;

      document.body.appendChild(showContainer);
    } else {
      console.error("Error fetching movie details:", movie ? movie.message : "Movie not found.");
      alert("Movie details not found.");
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    alert("An error occurred while fetching the movie details.");
  }
}

// Handle booking ticket button click
function bookTickets(movieId, showId, date) {
  // Set the values of modal input fields
  document.getElementById("modalMovieId").value = movieId;
  document.getElementById("modalShowId").value = showId;
  document.getElementById("modalShowDate").value = date;

  // Show the booking modal (using Bootstrap modal)
  const bookingModal = new bootstrap.Modal(document.getElementById("bookingModal"));
  bookingModal.show();
}

// Handle booking form submission
document.getElementById("submitBooking").addEventListener("click", async () => {
  const movieId = document.getElementById("modalMovieId").value;
  const showId = document.getElementById("modalShowId").value;
  const seats = document.getElementById("seatCount").value;

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;

  // Validate form fields
  if (!name || !email || !phoneNumber || !seats) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(
      "https://bookmyshow-backend-wl78.onrender.com/movie/book-movie",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          showId,
          seats,
          name,
          email,
          phoneNumber,
        }),
      }
    );
    const result = await response.json();

    if (response.ok) {
      const bookingModal = bootstrap.Modal.getInstance(document.getElementById("bookingModal"));
      bookingModal.hide();
      alert("Tickets booked successfully!");
      window.location.reload();
    }
  } catch (error) {
    alert("Something Went Wrong!");
  }
});
