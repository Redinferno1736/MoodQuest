"use client";

import React, { useState, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";

export default function PetPage() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("Ask me anything...");
  const [isLoading, setIsLoading] = useState(false);
  const textBoxRef = useRef(null);

  // Optional: Speech Synthesis for voice output
  const speakReply = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setReply("Thinking...");

    try {
      // Call Gemini API through your backend proxy or direct call
      const response = await fetch("http://127.0.0.1:5000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input.trim() }),
      });
      const data = await response.json();

      // data.reply should have the Gemini API output text
      // Simulate stress level decision here or use backend info
      // For demo, just use the reply as is
      setReply(data.reply);

      // Speak out the reply (optional)
      speakReply(data.reply);
    } catch (error) {
      setReply("Sorry, I couldn't get a response.");
    }
    setIsLoading(false);
    setInput("");
  };

  return (
    <div className="flex h-full w-full p-4 gap-4 bg-gray-100">
      {/* Left: Spline 3D Model */}
      <div className="w-1/2 h-full border rounded-lg shadow-lg">
        <Spline scene="https://prod.spline.design/g7UNYT7AVq4LJ3eO/scene.splinecode" />
      </div>

      {/* Right: Reply Box and Input */}
      <div className="w-1/2 h-full flex flex-col justify-between bg-white shadow-lg rounded-lg p-6">
        {/* Reply Text Box near mouth */}
        <div
          ref={textBoxRef}
          className="relative flex-1 border border-gray-300 rounded-lg p-4 text-lg font-semibold text-gray-900"
          style={{ minHeight: "150px" }}
        >
          {isLoading ? "Loading..." : reply}
        </div>

        {/* User Input */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-lime-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-lime-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
