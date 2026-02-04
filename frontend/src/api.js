import { API_URL } from './config.js';

const API = `${API_URL}/api/game`;

export async function submitGuess(name) {
  const res = await fetch(`${API}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess: name })
  });

  if (!res.ok) throw new Error("Character not found");
  const data = await res.json();
  return data;
}

export async function fetchCharacters(query) {
  if (!query) return [];

  const res = await fetch(
    `${API_URL}/api/game/characters?q=${encodeURIComponent(query)}`
  );

  return res.json();
}
