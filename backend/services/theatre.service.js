import Theatre from '../models/theatre.model.js';
import Seat from '../models/seat.model.js';

function rowName(index) {
  let value = index + 1;
  let label = '';
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function findTheatres() { return Theatre.find().sort({ name: 1 }).lean(); }
export function findTheatreById(theatreId) { return Theatre.findById(theatreId).lean(); }
export async function createTheatre(data) {
  const theatre = await Theatre.create(data);
  const inventory = theatre.screens.flatMap((screen) => {
    const seatCount = screen.capacity;
    const seatsPerRow = 10;
    const rows = Math.ceil(seatCount / seatsPerRow);
    return Array.from({ length: seatCount }, (_, index) => {
      const rowIndex = Math.floor(index / seatsPerRow);
      const row = rowName(rowIndex);
      return {
        theatre: theatre._id,
        screen: screen._id,
        seatNumber: `${row}${(index % seatsPerRow) + 1}`,
        row,
        type: rowIndex >= Math.max(0, rows - 2) ? 'premium' : 'regular',
      };
    });
  });
  if (inventory.length) await Seat.insertMany(inventory);
  return theatre;
}
export function updateTheatreById(theatreId, data) { return Theatre.findByIdAndUpdate(theatreId, data, { new: true, runValidators: true }).lean(); }
export function deleteTheatreById(theatreId) { return Theatre.findByIdAndDelete(theatreId); }
