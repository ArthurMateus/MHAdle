import { useState, useEffect } from "react";
import { submitGuess, fetchCharacters } from "../api";

function getImageProxyUrl(imageUrl) {
  const apiUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : window.location.origin || '';
  return `${apiUrl}/api/game/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

export default function GuessInput({ onGuess }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        return;
      }

      const result = await fetchCharacters(value);
      setSuggestions(result);
    };

    load();
  }, [value]);

  const handleSubmit = async name => {
    try {
      const result = await submitGuess(name);
      onGuess(name, result, result.character);
      setValue("");
      setSuggestions([]);
      setError("");
    } catch {
      setError("Character not found");
    }
  };

  return (
    <div className="autocomplete">
      <input
        placeholder="Enter character name..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            handleSubmit(value);
          }
        }}
      />

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map(suggestion => {
            const name = typeof suggestion === "string" ? suggestion : suggestion.name;
            const image = typeof suggestion === "string" ? null : suggestion.image;
            const proxyImage = image ? getImageProxyUrl(image) : null;
            return (
              <li
                key={name}
                onClick={() => handleSubmit(name)}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {proxyImage && (
                  <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={proxyImage}
                      alt={name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transform: "scale(1.8)", transformOrigin: "center top" }}
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {name}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
