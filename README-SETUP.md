# MHAdle

A My Hero Academia character guessing game, inspired by Wordle. Guess the character based on their traits like age, height, gender, occupation, and affiliation!

## Features

- 🎨 Search characters with autocomplete and image previews
- 📊 See detailed comparison of guessed attributes (correct ✔️, too high ⬆️, too low ⬇️, partial ~)
- 💡 Hint system: Get the character's quirk after 5 unsuccessful guesses
- 🎯 No duplicates: Each character can only be guessed once per round
- 🏗️ Responsive design optimized for mobile and desktop

## Tech Stack

- **Frontend**: React + Vite (supports Vercel deployment)
- **Backend**: Express.js (Node.js)
- **Data**: Character database from My Hero Academia

## Local Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArthurMateus/MHAdle.git
   cd MHAdle-main
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running Locally

1. **Start the backend** (from `backend` directory)
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend** (from `frontend` directory)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Deployment on Vercel

### Setup

1. Push your repository to GitHub (if not already done)
2. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and select your MHAdle repository
4. Vercel will automatically detect the configuration and deploy both frontend and backend

### Environment Variables

No environment variables are required for basic setup. The app automatically detects local vs production URLs.

## How to Play

1. A random character from My Hero Academia is selected
2. Enter character names to make guesses
3. For each attribute, you'll see:
   - ✔️ **Correct**: You guessed the right attribute
   - ⬆️ **Too Low**: The actual value is higher (for numbers)
   - ⬇️ **Too High**: The actual value is lower (for numbers)
   - ~ **Partial**: Some entries match but not all (for arrays)
   - ✖️ **Wrong**: The attribute doesn't match at all
4. You can give up anytime with the "Give Up" button
5. After 5 guesses, a hint button appears showing the character's quirk

## File Structure

```
MHAdle-main/
├── backend/
│   ├── data/
│   │   └── characterInfo.json
│   ├── routes/
│   │   └── game.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GuessInput.jsx
│   │   │   ├── GuessTable.jsx
│   │   │   └── Header.jsx
│   │   ├── api.js
│   │   ├── config.js
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── vercel.json
├── .gitignore
└── README.md
```

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT
