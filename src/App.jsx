import React, { useEffect, useState, useRef } from "react";

const CARD_VALUES = [
  "🐶",
  "🐱",
  "🦊",
  "🐻",
  "🐼",
  "🦁",
  "🐵",
  "🐸",
];

function shuffleArray(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
}

function generateDeck() {
  const pairs = CARD_VALUES.slice(0, 8);
  const deck = shuffleArray([...pairs, ...pairs]).map((value, idx) => ({
    id: idx,
    value,
    flipped: false,
    matched: false,
  }));
  return deck;
}

function Card({ card, onClick }) {
  return (
    <div
      className={`card ${card.flipped || card.matched ? "flipped" : ""}`}
      onClick={() => onClick(card)}
    >
      <div className="inner">
        <div className="front">{card.value}</div>
        <div className="back">?</div>
      </div>
    </div>
  );
}

export default function App() {
  const [deck, setDeck] = useState(generateDeck);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (first && second) {
      setMoves((m) => m + 1);
      if (first.value === second.value) {
        setDeck((d) =>
          d.map((c) =>
            c.value === first.value ? { ...c, matched: true } : c
          )
        );
        resetSelection();
      } else {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, flipped: false }
                : c
            )
          );
          resetSelection();
        }, 800);
      }
    }
  }, [first, second]);

  useEffect(() => {
    if (deck.every((c) => c.matched)) {
      setRunning(false);
    }
  }, [deck]);

  function handleCardClick(card) {
    if (!running) setRunning(true);
    if (card.flipped || card.matched) return;

    setDeck((d) => d.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)));

    if (!first) setFirst(card);
    else if (!second) setSecond(card);
  }

  function resetSelection() {
    setFirst(null);
    setSecond(null);
  }

  function resetGame() {
    clearInterval(timerRef.current);
    setDeck(generateDeck());
    setFirst(null);
    setSecond(null);
    setMoves(0);
    setTime(0);
    setRunning(false);
  }

  return (
    <div className="app">
      <header>
        <h1>Memory Card Game</h1>
        <div className="controls">
          <div>Moves: {moves}</div>
          <div>Time: {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</div>
          <button onClick={resetGame}>Reset</button>
        </div>
      </header>

      <div className="grid">
        {deck.map((card) => (
          <Card key={card.id} card={card} onClick={handleCardClick} />
        ))}
      </div>

      <footer>
        <p>Flip cards to match pairs</p>
      </footer>
    </div>
  );
}
