"use client";

import { useState } from "react";
import RocolaSearch from "./RocolaSearch";

export default function RocolaForm({ slug }) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [name, setName] = useState("");
  const [table, setTable] = useState("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function requestSong() {
    if (!selectedTrack) {
      setFeedback("Primero seleccioná una canción.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/rocola/${slug}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId: selectedTrack.id,
          name: selectedTrack.name,
          artist: selectedTrack.artist,
          image: selectedTrack.image,
          mesa: table || null,
          nombreCliente: name || null,
          couponCode: coupon || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback("Error: " + data.error);
      } else {
        setFeedback(`🎉 ¡Listo! Tu canción se agregó.`);
        setSelectedTrack(null);
        setName("");
        setTable("");
        setCoupon("");
      }
    } catch (err) {
      console.error("Error:", err);
      setFeedback("Error inesperado");
    }

    setLoading(false);
  }

  return (
    <section className="space-y-6">

      <RocolaSearch slug={slug} onSelectTrack={setSelectedTrack} />

      {selectedTrack && (
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex gap-3">
          {selectedTrack.image && (
            <img src={selectedTrack.image} className="w-14 h-14 rounded-lg" />
          )}
          <div>
            <p className="text-sm font-medium">{selectedTrack.name}</p>
            <p className="text-xs text-slate-400">{selectedTrack.artist}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <input
          className="w-full bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
          placeholder="Tu nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
          placeholder="Mesa"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />

        <input
          className="w-full bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
          placeholder="Cupón de descuento"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
        />
      </div>

      <button
        onClick={requestSong}
        disabled={loading}
        className="w-full bg-emerald-500 text-black font-semibold py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Agregar canción 🎵"}
      </button>

      {feedback && (
        <p className="text-center text-sm text-slate-300">{feedback}</p>
      )}
    </section>
  );
}
