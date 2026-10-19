import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import Movie from './models/movie.model.js';
import Seat from './models/seat.model.js';
import Show from './models/show.model.js';
import Theatre from './models/theatre.model.js';
import { createTheatre } from './services/theatre.service.js';

const demoMovies = [
  { title: 'Midnight in Mumbai', description: 'A sound designer follows a mysterious melody through the sleeping city and discovers the story behind it.', genre: ['Drama', 'Romance'], language: 'Hindi', duration: 128, releaseDate: new Date('2026-09-18'), poster: '/posters/midnight-in-mumbai.svg', rating: 8.2, status: 'now_showing', cast: ['Mira Sen', 'Kabir Rao'] },
  { title: 'The Last Orbit', description: 'A small crew on a distant station races to bring its systems back online before sunrise on Earth.', genre: ['Sci-Fi', 'Thriller'], language: 'English', duration: 116, releaseDate: new Date('2026-09-25'), poster: '/posters/the-last-orbit.svg', rating: 7.8, status: 'now_showing', cast: ['Arin Cole', 'Leah Park'] },
  { title: 'Monsoon Letters', description: 'Two strangers exchange letters carried by the monsoon and slowly find their way to the same old cinema.', genre: ['Drama'], language: 'Hindi', duration: 139, releaseDate: new Date('2026-10-02'), poster: '/posters/monsoon-letters.svg', rating: 8.6, status: 'now_showing', cast: ['Naina Kapoor', 'Dev Malhotra'] },
];

async function seedDemo() {
  await connectDatabase();
  const movies = await Promise.all(demoMovies.map(async (movie) => {
    const savedMovie = await Movie.findOneAndUpdate(
      { title: movie.title },
      { $setOnInsert: movie },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!savedMovie.poster) {
      savedMovie.poster = movie.poster;
      await savedMovie.save();
    }
    return savedMovie;
  }));

  let theatre = await Theatre.findOne({ name: 'iMovies Demo Cinema', location: 'Mumbai' });
  if (!theatre) {
    theatre = await createTheatre({
      name: 'iMovies Demo Cinema',
      location: 'Mumbai',
      address: '12 Cinema Lane, Mumbai',
      screens: [{ name: 'Screen 1', capacity: 80 }],
    });
  }

  const screen = theatre.screens[0];
  const seatCount = await Seat.countDocuments({ theatre: theatre._id, screen: screen._id });
  if (!seatCount) {
    const seatsPerRow = 10;
    const inventory = Array.from({ length: screen.capacity }, (_, index) => {
      const rowIndex = Math.floor(index / seatsPerRow);
      const row = String.fromCharCode(65 + rowIndex);
      return { theatre: theatre._id, screen: screen._id, seatNumber: `${row}${(index % seatsPerRow) + 1}`, row, type: rowIndex >= Math.ceil(screen.capacity / seatsPerRow) - 2 ? 'premium' : 'regular' };
    });
    await Seat.insertMany(inventory);
  }

  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);
  for (let day = 0; day < 4; day += 1) {
    const date = new Date(midnight.getTime() + day * 24 * 60 * 60 * 1000);
    for (let index = 0; index < movies.length; index += 1) {
      const startTime = ['10:30', '15:00', '19:30'][index];
      const [hours, minutes] = startTime.split(':').map(Number);
      const end = new Date(Date.UTC(2000, 0, 1, hours, minutes) + movies[index].duration * 60 * 1000);
      const endTime = `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`;
      await Show.findOneAndUpdate(
        { movie: movies[index]._id, theatre: theatre._id, screen: screen._id, date, startTime },
        { $setOnInsert: { movie: movies[index]._id, theatre: theatre._id, screen: screen._id, date, startTime, endTime, ticketPrice: index === 2 ? 320 : 250 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }

  console.log(`Demo catalogue ready: ${movies.length} movies, ${theatre.name}, ${await Show.countDocuments({ theatre: theatre._id })} showtimes.`);
}

seedDemo().catch((error) => {
  console.error('Demo data setup failed:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
