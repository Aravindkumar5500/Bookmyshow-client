# BookMyShow — Movie Booking UI

A responsive movie-listing and booking-interface prototype for the companion [Movie Booking API](https://github.com/Aravindkumar5500/Bookmyshow-backend). This independent educational project is not affiliated with BookMyShow.

## Run locally

Start the backend API first, then serve this folder with a static server:

```bash
npx serve .
```

Open the local URL printed by the server. Do not open the HTML files directly from the filesystem; use a local HTTP server so API requests and browser behavior are consistent.

## Configure the API

Edit `config.js` and set `BOOKMYSHOW_API_BASE_URL` to your backend origin. The default points to the project's existing hosted API. For local development, use `http://localhost:8000`.

When deploying this frontend to Vercel, add the exact deployed Vercel origin (for example, `https://your-project.vercel.app`) to the backend `CLIENT_ORIGIN` environment variable. Include custom domains too, and do not add a trailing slash.

## Included

- Responsive movie listing and detail pages
- Client-side movie search
- Loading, empty and API error states
- Upcoming-showtime filtering (past dates are not bookable)
- Booking form validation and server error feedback
- Accessible dialog and responsive layouts

## Prototype limitations

This is a learning project. It does not process payments or provide user accounts, seat selection maps, booking cancellation, or production-grade authentication. Booking requests are validated and inventory is guarded by the companion API.
