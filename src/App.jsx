import { useEffect, useReducer } from "react";

const CARD_VALUES = [
  { emoji: "🐶", name: "dog" },
  { emoji: "🐱", name: "cat" },
  { emoji: "🦊", name: "fox" },
  { emoji: "🐻", name: "bear" },
  { emoji: "🐼", name: "panda" },
  { emoji: "🦁", name: "lion" },
  { emoji: "🐵", name: "monkey" },
  { emoji: "🐸", name: "frog" },
];

function shuffleArray(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function generateDeck() {
  return shuffleArray([...CARD_VALUES, ...CARD_VALUES]).map((card, index) => ({
    id: index,
    ...card,
    revealed: false,
    matched: false,
  }));
}

function createGame() {
  return {
    cards: generateDeck(),
    selectedIds: [],
    mismatchIds: [],
    moves: 0,
    time: 0,
    started: false,
    completed: false,
    announcement: "Choose two cards to find a matching pair.",
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case "reveal": {
      if (state.completed || state.mismatchIds.length > 0) return state;

      const card = state.cards.find((item) => item.id === action.id);
      if (!card || card.revealed || card.matched) return state;

      const revealedCards = state.cards.map((item) =>
        item.id === action.id ? { ...item, revealed: true } : item
      );
      const started = true;

      if (state.selectedIds.length === 0) {
        return {
          ...state,
          cards: revealedCards,
          selectedIds: [action.id],
          started,
          announcement: `${card.name} revealed. Choose another card.`,
        };
      }

      const firstCard = state.cards.find(
        (item) => item.id === state.selectedIds[0]
      );
      const moves = state.moves + 1;

      if (firstCard.name === card.name) {
        const cards = revealedCards.map((item) =>
          item.id === firstCard.id || item.id === card.id
            ? { ...item, matched: true }
            : item
        );
        const completed = cards.every((item) => item.matched);

        return {
          ...state,
          cards,
          selectedIds: [],
          moves,
          started,
          completed,
          announcement: completed
            ? `Match found. You won in ${moves} moves and ${formatTime(state.time)}!`
            : `Match found: ${card.name}.`,
        };
      }

      return {
        ...state,
        cards: revealedCards,
        selectedIds: [...state.selectedIds, action.id],
        mismatchIds: [firstCard.id, card.id],
        moves,
        started,
        announcement: "No match. The cards will turn back over.",
      };
    }
    case "hide-mismatch":
      if (
        action.ids.length !== state.mismatchIds.length ||
        !action.ids.every((id) => state.mismatchIds.includes(id))
      ) {
        return state;
      }

      return {
        ...state,
        cards: state.cards.map((card) =>
          action.ids.includes(card.id) ? { ...card, revealed: false } : card
        ),
        selectedIds: [],
        mismatchIds: [],
        announcement: "Cards turned back over. Choose another pair.",
      };
    case "tick":
      if (!state.started || state.completed) return state;
      return { ...state, time: state.time + 1 };
    case "reset":
      return action.game;
    default:
      return state;
  }
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Card({ card, disabled, onReveal }) {
  const isRevealed = card.revealed || card.matched;

  return (
    <button
      className={`card${isRevealed ? " flipped" : ""}${card.matched ? " matched" : ""}`}
      type="button"
      aria-label={`Card ${card.id + 1}, ${isRevealed ? card.name : "face down"}${card.matched ? ", matched" : ""}`}
      aria-pressed={isRevealed}
      disabled={disabled || card.matched}
      onClick={() => onReveal(card.id)}
    >
      <span className="inner" aria-hidden="true">
        <span className="front">{card.emoji}</span>
        <span className="back">?</span>
      </span>
    </button>
  );
}

export default function App() {
  const [game, dispatch] = useReducer(gameReducer, undefined, createGame);
  const { cards, mismatchIds, moves, time, started, completed, announcement } =
    game;

  useEffect(() => {
    if (!started || completed) return undefined;

    const timerId = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timerId);
  }, [started, completed]);

  useEffect(() => {
    if (mismatchIds.length === 0) return undefined;

    const timeoutId = window.setTimeout(
      () => dispatch({ type: "hide-mismatch", ids: mismatchIds }),
      800
    );
    return () => window.clearTimeout(timeoutId);
  }, [mismatchIds]);

  function resetGame() {
    dispatch({ type: "reset", game: createGame() });
  }

  return (
    <main className="app">
      <header className="game-header">
        <div>
          <p className="eyebrow">Match every pair</p>
          <h1>Memory Card Game</h1>
        </div>
        <button className="reset-button" type="button" onClick={resetGame}>
          New game
        </button>
      </header>

      <section className="stats" aria-label="Game statistics">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value" role="timer" aria-label={`Elapsed time ${formatTime(time)}`}>
            {formatTime(time)}
          </span>
        </div>
      </section>

      <p className="game-status" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <section className="grid" role="group" aria-label="Memory cards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            disabled={mismatchIds.length > 0 || completed}
            onReveal={(id) => dispatch({ type: "reveal", id })}
          />
        ))}
      </section>

      <p className="game-hint">Choose two cards to find a matching pair.</p>
    </main>
  );
}
