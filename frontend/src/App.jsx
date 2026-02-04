import { useState, useEffect } from "react";
import Header from "./components/Header";
import GuessInput from "./components/GuessInput";
import GuessTable from "./components/GuessTable";
import { API_URL } from "./config.js";
import "./styles.css";

export default function App() {
  const [guesses, setGuesses] = useState([]);
  const [guessedCharacters, setGuessedCharacters] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [quirk, setQuirk] = useState(null);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [usedCharacterNames, setUsedCharacterNames] = useState([]);

  useEffect(() => {
    const fetchDailyCharacter = async () => {
      try {
        const res = await fetch(`${API_URL}/api/game/daily`);
        const data = await res.json();
        setQuirk(data.quirk);
      } catch (err) {
        console.error("Failed to fetch daily character:", err);
      }
    };

    fetchDailyCharacter();
  }, []);

  const addGuess = async (name, result, character) => {
    const updatedUsedNames = [...usedCharacterNames, name];
    setGuesses(prev => [...prev, { name, result }]);
    setGuessedCharacters(prev => [...prev, character]);
    setUsedCharacterNames(updatedUsedNames);

    // Add to used characters on backend
    await fetch(`${API_URL}/api/game/add-used-character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterName: name })
    });

    if (result.name === "correct") {
      setGameWon(true);
      // Generate new character for next round, excluding all guessed characters
      await fetch(`${API_URL}/api/game/new-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exclude: updatedUsedNames })
      });
      const res = await fetch(`${API_URL}/api/game/daily`);
      const data = await res.json();
      setQuirk(data.quirk);
    }
  };

  const resetGame = async () => {
    setUsedCharacterNames([]);

    await fetch(`${API_URL}/api/game/new-round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exclude: [] })
    });

    const res = await fetch(`${API_URL}/api/game/daily`);
    const data = await res.json();
    setQuirk(data.quirk);

    setGuesses([]);
    setGuessedCharacters([]);
    setHintRevealed(false);
    setGameWon(false);
  };

  const forfeitGame = async () => {
    setUsedCharacterNames([]);

    await fetch(`${API_URL}/api/game/new-round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exclude: [] })
    });

    const res = await fetch(`${API_URL}/api/game/daily`);
    const data = await res.json();
    setQuirk(data.quirk);

    setGuesses([]);
    setGuessedCharacters([]);
    setHintRevealed(false);
    setGameWon(false);
  };

  return (
    <div className="app">
      <Header />

      <div className="top-controls">
        {guesses.length >= 5 && !gameWon && (
          <div className="hint-box" onClick={() => setHintRevealed(!hintRevealed)}>
            {hintRevealed ? `Quirk: ${quirk}` : "🔍 Click for hint"}
          </div>
        )}

        {!gameWon && (
          <button className="forfeit-btn" onClick={forfeitGame}>
            Give Up
          </button>
        )}
      </div>

      {!gameWon && <GuessInput onGuess={addGuess} />}

      <GuessTable guesses={guesses} guessedCharacters={guessedCharacters} />

      {gameWon && (
        <div className="win-panel">
          <h2>🎉 You got it!</h2>
          <button onClick={resetGame}>New round</button>
        </div>
      )}
    </div>
  );
}
