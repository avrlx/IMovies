import Show from '../models/show.model.js';

export function findShows(filter) { return Show.find(filter).populate('movie', 'title poster genre').populate('theatre', 'name location screens').sort({ date: 1, startTime: 1 }).lean(); }
export function findShowById(showId) { return Show.findById(showId).populate('movie', 'title poster genre').populate('theatre', 'name location screens').lean(); }
export function createShow(data) { return Show.create(data); }
export function updateShowById(showId, data) { return Show.findByIdAndUpdate(showId, data, { new: true, runValidators: true }).lean(); }
export function deleteShowById(showId) { return Show.findByIdAndDelete(showId); }
