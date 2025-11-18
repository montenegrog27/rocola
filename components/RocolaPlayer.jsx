"use client";

import { useEffect, useState } from "react";

export default function RocolaPlayer({ slug }) {
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [upNext, setUpNext] = useState([]);

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/rocola/${slug}/status`, { cache: "no-store" });
      const data = await res.json();

      setNowPlaying(data.nowPlaying || null);
      setUpNext(data.upNext || []);
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [slug]);

  if (loading) {
    return <p className="text-center opacity-70">Cargando rocola...</p>;
  }

  return (
    <section className="space-y-6">
      {/* NOW PLAYING */}
      {nowPlaying ? (
        <div className="flex gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {nowPlaying.image && (
            <img
              src={nowPlaying.image}
              className="w-20 h-20 rounded-xl object-cover"
              alt="Now Playing Cover"
            />
          )}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase text-slate-400">Sonando ahora</p>
            <h3 className="text-lg font-semibold">{nowPlaying.name}</h3>
            <p className="text-sm text-slate-400">{nowPlaying.artist}</p>
          </div>
        </div>
      ) : (
        <p className="text-center opacity-70">No hay nada sonando.</p>
      )}

      {/* UP NEXT */}
      {upNext.length > 0 && (
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs uppercase text-slate-400 mb-3">Próximas canciones</p>
          <ul className="space-y-3">
            {upNext.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                {t.image && (
                  <img
                    src={t.image}
                    className="w-10 h-10 rounded-lg object-cover"
                    alt="Track cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
