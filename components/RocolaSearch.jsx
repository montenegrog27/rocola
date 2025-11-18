"use client";

import { useState } from "react";
import DialogModal from "./DialogModal";

export default function RocolaSearch({ slug }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // User info inside modal
  const [nombre, setNombre] = useState("");
  const [mesa, setMesa] = useState("");

  async function searchSongs(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rocola/${slug}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.tracks || []);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(track) {
    setSelectedTrack(track);
    setModalOpen(true);
  }

async function confirmarPedido() {
  if (!selectedTrack) return;

  const payload = {
    trackId: selectedTrack.id,
    name: selectedTrack.name,
    artist: selectedTrack.artist,
    image: selectedTrack.image,
    mesa,
    nombreCliente: nombre || null,
  };

  console.log("📤 Enviando JSON:", payload);

  const res = await fetch(`/api/rocola/${slug}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("📥 Response backend:", data);

  if (!res.ok) {
    alert(`❌ Hubo un error: ${data.error}`);
    return;
  }

  alert("🎶 Canción agregada!");
  setModalOpen(false);
}


  return (
    <>
      {/* SEARCH BAR */}
      <section className="space-y-4">
        <form onSubmit={searchSongs} className="flex gap-2">
          <input
            className="flex-1 bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
            placeholder="Buscar canción o artista..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-emerald-500 text-black px-4 rounded-xl font-semibold"
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
                onClick={() => abrirModal(t)}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                {t.image && <img src={t.image} className="w-10 h-10 rounded-lg" alt="" />}
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.artist}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Click para pedir 🎶</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MODAL */}
      <DialogModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedTrack && (
          <div className="space-y-5">

            {/* Track preview */}
            <div className="flex gap-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700">
              {selectedTrack.image && (
                <img src={selectedTrack.image} className="w-16 h-16 rounded-lg" />
              )}
              <div>
                <p className="font-medium">{selectedTrack.name}</p>
                <p className="text-sm text-slate-400">{selectedTrack.artist}</p>
              </div>
            </div>

            {/* Inputs */}
            <input
              className="w-full bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
              placeholder="Tu nombre (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              className="w-full bg-slate-900/70 border border-slate-700 px-3 py-2 rounded-xl"
              placeholder="Mesa (ej: A, B, 3)"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
            />

            {/* Submit */}
            <button
              className="w-full bg-emerald-500 text-black font-semibold py-3 rounded-xl hover:bg-emerald-400"
              onClick={confirmarPedido}
            >
              Confirmar canción 🎵
            </button>
          </div>
        )}
      </DialogModal>
    </>
  );
}
