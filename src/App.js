import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import correctSoundFile from "./Sounds/mixkit-instant-win-2021.wav";
import wrongSoundFile from "./Sounds/mixkit-player-losing-or-failing-2042.wav";
import "./index.css";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

const categories = {
  Animals: [
    { name: "Dog", symbol: "🐶" },
    { name: "Cat", symbol: "🐱" },
    { name: "Monkey", symbol: "🐵" },
    { name: "Tiger", symbol: "🐯" },
    { name: "Panda", symbol: "🐼" },
    { name: "Lion", symbol: "🦁" },
    { name: "Elephant", symbol: "🐘" },
    { name: "Rabbit", symbol: "🐰" },
  ],
  Fruits: [
    { name: "Apple", symbol: "🍎" },
    { name: "Banana", symbol: "🍌" },
    { name: "Grapes", symbol: "🍇" },
    { name: "Pineapple", symbol: "🍍" },
    { name: "Orange", symbol: "🍊" },
    { name: "Watermelon", symbol: "🍉" },
    { name: "Strawberry", symbol: "🍓" },
    { name: "Cherry", symbol: "🍒" },
  ],
};

function fetchRandomEmojis(category, count = 4) {
  const shuffled = [...categories[category]].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function App() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [category, setCategory] = useState("Animals");
  const [showPopup, setShowPopup] = useState(false);
  const [playerName, setPlayerName] = useState("");
const nameInputRef = useRef(null);
// Auto-focus when the game loads
useEffect(() => {
  if (nameInputRef.current) {
    nameInputRef.current.focus();
  }
}, []);
  const timerRef = useRef(null);
  const correctSound = useRef(new Audio(correctSoundFile));
  const wrongSound = useRef(new Audio(wrongSoundFile));

  const startGame = () => {
    setLoading(true);
    setMoves(0);
    setTimer(0);
    setGameStarted(true);
    setShowPopup(false);

    const emojis = fetchRandomEmojis(category, 4);
    const duplicatedEmojis = [...emojis, ...emojis];
    const pairedCards = duplicatedEmojis.map((item, index) => ({
      ...item,
      id: `${index}-${Math.random()}-${Date.now()}`,
      flipped: false,
      matched: false,
    }));
    setCards(shuffleArray(pairedCards));
    setFlippedCards([]);
    setLoading(false);
  };

  useEffect(() => {
    if (gameStarted) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted]);

  const handleCardClick = (clickedCard) => {
    if (
      flippedCards.length === 2 ||
      clickedCard.flipped ||
      clickedCard.matched
    )
      return;

    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );
    setCards(updatedCards);

    const flippedCard = updatedCards.find((card) => card.id === clickedCard.id);
    const newFlipped = [...flippedCards, flippedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      if (newFlipped[0].name === newFlipped[1].name) {
        correctSound.current.play();
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.name === newFlipped[0].name
                ? { ...card, matched: true }
                : card
            )
          );
          setFlippedCards([]);
        }, 800);
      } else {
        wrongSound.current.play();
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === newFlipped[0].id || card.id === newFlipped[1].id
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every((card) => card.matched);

  useEffect(() => {
    if (allMatched) {
      clearInterval(timerRef.current);
      setShowPopup(true);
    }
  }, [allMatched]);

  const closePopup = () => {
    setShowPopup(false);
    startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 to-yellow-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-pink-700">Emoji Matching Game 🎮</h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <label className="text-lg">Select Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md p-2 shadow-md"
        >
          {Object.keys(categories).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
<input
  ref={nameInputRef}
  type="text"
  placeholder="Enter your name"
  className="p-2 border border-gray-300 rounded-md shadow-md mb-4 w-full max-w-xs text-center"
  value={playerName}
  onChange={(e) => setPlayerName(e.target.value)}
/>
<button
  className={`${
    playerName
      ? "bg-pink-500 hover:bg-pink-600 cursor-pointer"
      : "bg-gray-400 cursor-not-allowed"
  } text-white px-6 py-2 rounded-md font-semibold shadow-lg mb-4 transition`}
  onClick={startGame}
  disabled={!playerName}
>
  🔄 Start / Restart Game
</button>


      <div className="flex space-x-6 text-lg mb-6">
        <p>Moves: {moves}</p>
        <p>Time: {timer} sec</p>
      </div>

      {loading ? (
        <p className="text-lg">Loading cards...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`w-24 h-24 bg-white border rounded-lg shadow-md flex items-center justify-center text-4xl cursor-pointer select-none transition duration-300 ease-in-out transform hover:scale-105 ${
                card.flipped || card.matched ? "bg-yellow-100" : "bg-pink-200"
              }`}
              onClick={() => handleCardClick(card)}
            >
              {card.flipped || card.matched ? (
                <span>{card.symbol}</span>
              ) : (
                <div>❓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {allMatched && <Confetti />}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center space-y-4 animate-scaleIn">
            <h2 className="text-2xl font-bold text-pink-600">🎉 Well Played{playerName ? `, ${playerName}` : ""}! 🎉</h2>
            <p>You matched all the cards!</p>
            <p>Time Taken: {timer} sec</p>
            <p>Total Moves: {moves}</p>
            <button
              onClick={closePopup}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition"
            >
              Play Again 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
