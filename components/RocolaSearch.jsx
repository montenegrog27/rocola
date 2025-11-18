"use client";

import { useState } from "react";

export default function RocolaSearch({ slug, onSelectTrack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchSongs(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/rocola/${slug}/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.tracks || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      {/* SEARCH BAR */}
      <form onSubmit={searchSongs} className="flex gap-2">
        <input
          className="flex-1 bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none"
          placeholder="Buscar canción o artista..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-emerald-500 text-black px-4 rounded-xl font-semibold hover:bg-emerald-400 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {/* RESULTS */}
      {results.length > 0 && (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((t) => (
            <li
              key={t.id}
              onClick={() => onSelectTrack(t)}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 cursor-pointer"
            >
              {t.image && (
                <img src={t.image} className="w-10 h-10 rounded-lg" alt="" />
              )}
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-slate-400">{t.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
