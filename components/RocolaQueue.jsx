"use client";

import { useEffect, useState } from "react";

export default function RocolaQueue({ slug }) {
  const [queue, setQueue] = useState([]);

  async function fetchQueue() {
    const res = await fetch(`/api/rocola/${slug}/status`);
    const data = await res.json();
    setQueue(data.upNext || []);
  }

  useEffect(() => {
    fetchQueue();
    const i = setInterval(fetchQueue, 8000);
    return () => clearInterval(i);
  }, [slug]);

  if (queue.length === 0) return null;

  return (
    <section className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
      <p className="text-xs uppercase text-slate-400 mb-3">Próximas canciones</p>

      <ul className="space-y-3">
        {queue.map((t, i) => (
          <li key={t.id + t.timestamp} className="flex items-center gap-3">
            {t.image && <img src={t.image} className="w-10 h-10 rounded-lg" alt="" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-slate-400">{t.artist}</p>

              {(t.mesa || t.nombreCliente) && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Pedido por  
                  {t.nombreCliente ? ` ${t.nombreCliente}` : ""}  
                  {t.mesa ? ` (Mesa ${t.mesa})` : ""}
                </p>
              )}
            </div>
            <span className="text-xs text-slate-500">{i + 1}°</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
