function renderCell(value, guessValue) {
  if (typeof value === "string") {
    if (value === "correct") return <td className="correct">{guessValue} ✔</td>;
    if (value === "partial") return <td className="partial">~ {guessValue}</td>;
    return <td className="wrong">✖ {guessValue}</td>;
  }

  if (value.status === "correct") {
    return <td className="correct">{guessValue} ✔</td>;
  }

  if (value.status === "higher") {
    return <td className="partial">{guessValue} ⬆</td>;
  }

  if (value.status === "lower") {
    return <td className="partial">{guessValue} ⬇</td>;
  }

  return <td className="wrong">✖ {guessValue}</td>;
}

function getImageProxyUrl(imageUrl) {
  const apiUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : window.location.origin || '';
  return `${apiUrl}/api/game/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

export default function GuessTable({ guesses, guessedCharacters }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Gender</th>
          <th>Age</th>
          <th>Height</th>
          <th>Occupation</th>
          <th>Affiliation</th>
          <th>Anime Debut</th>
        </tr>
      </thead>
      <tbody>
        {guesses.slice().reverse().map((g, i) => {
          const originalIndex = guesses.length - 1 - i;
          const guessedChar = guessedCharacters?.[originalIndex];
          const proxyImage = guessedChar?.image ? getImageProxyUrl(guessedChar.image) : null;
          return (
            <tr key={originalIndex}>
              <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {proxyImage && (
                  <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={proxyImage}
                      alt={g.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transform: "scale(1.8)", transformOrigin: "center top" }}
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {g.name}
              </td>
              {renderCell(g.result.gender, guessedChar?.gender)}
              {renderCell(g.result.age, guessedChar?.age)}
              {renderCell(g.result.height, guessedChar?.height_cm)}
              {renderCell(g.result.occupation, guessedChar?.occupation?.join(", "))}
              {renderCell(g.result.affiliation, guessedChar?.affiliation?.join(", "))}
              {renderCell(g.result.anime_debut, guessedChar?.anime_debut)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
