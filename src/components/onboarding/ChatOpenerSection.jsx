import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const chatOpeners = [
  {
    question:
      "If we had to go on an unplanned adventure right now, where would you take me?",
    hint: "Spontaneous, fun, reveals personality.",
  },
  {
    question: "What’s something small that instantly makes your day better?",
    hint: "Gentle, emotional insight.",
  },
  {
    question: "What’s your comfort movie or series when life gets too serious?",
    hint: "Relatable and easy to build on.",
  },
  {
    question: "What kind of music would you play on our first road trip?",
    hint: "Fun, reveals taste and vibe.",
  },
  {
    question:
      "If your friends had to describe you in three emojis — which ones would they pick?",
    hint: "Playful and visual.",
  },
  {
    question: "What’s a hobby or interest you could talk about for hours?",
    hint: "Shows passion and opens depth.",
  },
  {
    question: "If you could teleport anywhere for a weekend, where would you go?",
    hint: "Encourages imagination.",
  },
  {
    question: "What’s something people usually get wrong about you at first?",
    hint: "Opens vulnerability and connection.",
  },
  {
    question:
      "If you could relive one perfect day from your past, which one would it be?",
    hint: "Nostalgic and meaningful.",
  },
  {
    question: "What’s a simple thing someone could do to instantly win your heart?",
    hint: "Flirty and insightful.",
  },
];

const ChatOpenerSection = ({ value = [], onChange }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(value);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (question) => {
    let updated;

    // Already selected → remove
    if (selected.includes(question)) {
      updated = selected.filter((q) => q !== question);
      setWarning("");
    } else {
      // New selection → limit to 3
      if (selected.length >= 3) {
        setWarning("You can only select up to 3 questions!");
        return;
      }
      updated = [...selected, question];
      setWarning("");
    }

    setSelected(updated);
    onChange?.(updated);
  };

  const filtered = chatOpeners.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Header */}
      <div className="my-4 text-left">
        <h1 className="text-2xl font-semibold mb-2">
          Pick Your Perfect Icebreakers 💬
        </h1>
        <p className="text-gray-600 mb-4">
          Choose up to <span className="font-semibold text-primary">3 chat opener questions</span> 
          that will appear on your profile — others can answer them to start a fun, meaningful chat!
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
        />
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-4">
        {filtered.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(item.question)}
            className={`text-left border p-4 rounded-lg transition hover:bg-gray-50 ${
              selected.includes(item.question)
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-300 text-gray-800"
            }`}
          >
            <p className="font-medium mb-1">{item.question}</p>
            <p className="text-sm text-gray-500 italic">{item.hint}</p>
          </button>
        ))}
      </div>

      {/* Warning */}
      {warning && (
        <p className="mt-4 text-sm text-red-500 font-medium">{warning}</p>
      )}

      {/* Selected Display */}
      {selected.length > 0 && (
        <div className="mt-6 p-4 border border-green-400 bg-green-50 rounded-lg text-left">
          <p className="text-green-800 font-medium mb-2">
            ✅ Selected Questions ({selected.length}/3):
          </p>
          <ul className="list-disc ml-5 text-green-700 space-y-1">
            {selected.map((q, i) => (
              <li key={i}>“{q}”</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatOpenerSection;
