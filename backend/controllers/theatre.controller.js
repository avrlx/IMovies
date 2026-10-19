import { createTheatre as saveTheatre, deleteTheatreById, findTheatreById, findTheatres, updateTheatreById } from '../services/theatre.service.js';

export async function listTheatres(_request, response) {
  const theatres = await findTheatres();
  return response.json({ success: true, theatres });
}

export async function getTheatre(request, response) {
  const theatre = await findTheatreById(request.params.theatreId);
  if (!theatre) return response.status(404).json({ success: false, message: 'Theatre not found' });
  return response.json({ success: true, theatre });
}

export async function createTheatre(request, response) {
  const theatre = await saveTheatre(request.body);
  return response.status(201).json({ success: true, theatre });
}

export async function updateTheatre(request, response) {
  const theatre = await updateTheatreById(request.params.theatreId, request.body);
  if (!theatre) return response.status(404).json({ success: false, message: 'Theatre not found' });
  return response.json({ success: true, theatre });
}

export async function deleteTheatre(request, response) {
  const theatre = await deleteTheatreById(request.params.theatreId);
  if (!theatre) return response.status(404).json({ success: false, message: 'Theatre not found' });
  return response.json({ success: true, message: 'Theatre deleted' });
}
