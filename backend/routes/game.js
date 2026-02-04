import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const router = express.Router();

let usedCharacters = [];

router.post("/new-round", (req, res) => {
  const { exclude = [] } = req.body;
  const excludedNames = new Set([...exclude, dailyCharacter.character_name]);
  
  const availableCharacters = characters.filter(
    c => !excludedNames.has(c.character_name)
  );
  
  if (availableCharacters.length === 0) {
    usedCharacters = [];
    dailyCharacter = characters[Math.floor(Math.random() * characters.length)];
  } else {
    dailyCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  }
  
  res.json({ ok: true });
});

// Corrigir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o JSON manualmente
const charactersPath = path.join(__dirname, "../data/characterInfo.json");
const characters = JSON.parse(fs.readFileSync(charactersPath, "utf-8"));

// Escolhe personagem do dia (random por enquanto)
let dailyCharacter =
  characters[Math.floor(Math.random() * characters.length)];

router.get("/daily", (req, res) => {
  res.json({ nameLength: dailyCharacter.character_name.length, quirk: dailyCharacter.quirk });
});

router.get("/image-proxy", (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  https.get(imageUrl, (imgRes) => {
    res.set("Content-Type", imgRes.headers["content-type"]);
    res.set("Cache-Control", "public, max-age=3600");
    imgRes.pipe(res);
  }).on("error", (err) => {
    res.status(404).json({ error: "Failed to load image" });
  });
});

router.get("/characters", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  if (!q || q.length < 1) {
    return res.json([]);
  }

  const results = characters
    .filter(c => c.character_name.toLowerCase().includes(q))
    .map(c => ({ name: c.character_name, image: c.image }))
    .slice(0, 8); // limite tipo Narutodle

  res.json(results);
});

router.post("/add-used-character", (req, res) => {
  const { characterName } = req.body;
  if (characterName && !usedCharacters.includes(characterName)) {
    usedCharacters.push(characterName);
  }
  res.json({ ok: true });
});

router.post("/guess", (req, res) => {
  const { guess } = req.body;

  const guessedChar = characters.find(
    c => c.character_name.toLowerCase() === guess.toLowerCase()
  );

  if (!guessedChar) {
    return res.status(404).json({ error: "Character not found" });
  }

  const compareNumber = (guessVal, targetVal) => {
    if (guessVal === targetVal) return { status: "correct" };
    if (guessVal < targetVal) return { status: "higher" };
    return { status: "lower" };
  };

  const compareArray = (guessArr = [], targetArr = []) => {
    const matches = guessArr.filter(v => targetArr.includes(v));
    if (matches.length === 0) return "wrong";
    if (matches.length === guessArr.length && matches.length === targetArr.length) return "correct";
    return "partial";
  };

  res.json({
    name:
      guessedChar.character_name === dailyCharacter.character_name
        ? "correct"
        : "wrong",

    gender:
      guessedChar.gender === dailyCharacter.gender
        ? "correct"
        : "wrong",

    age: guessedChar.age
      ? compareNumber(guessedChar.age, dailyCharacter.age)
      : "wrong",

    height: compareNumber(
      guessedChar.height_cm,
      dailyCharacter.height_cm
    ),

    occupation: compareArray(
      guessedChar.occupation,
      dailyCharacter.occupation
    ),

    affiliation: compareArray(
      guessedChar.affiliation,
      dailyCharacter.affiliation
    ),

    anime_debut: guessedChar.anime_debut && dailyCharacter.anime_debut
      ? (() => {
          const guessNum = parseInt(guessedChar.anime_debut.match(/\d+/)?.[0]);
          const targetNum = parseInt(dailyCharacter.anime_debut.match(/\d+/)?.[0]);
          if (isNaN(guessNum) || isNaN(targetNum)) return "wrong";
          return compareNumber(guessNum, targetNum);
        })()
      : "wrong",

    quirk:
      guessedChar.quirk === dailyCharacter.quirk
        ? "correct"
        : "wrong",

    character: {
      gender: guessedChar.gender,
      age: guessedChar.age,
      height_cm: guessedChar.height_cm,
      occupation: guessedChar.occupation,
      affiliation: guessedChar.affiliation,
      anime_debut: guessedChar.anime_debut ? parseInt(guessedChar.anime_debut.match(/\d+/)?.[0]) || null : null,
      image: guessedChar.image
    }
  });
});

export default router;
