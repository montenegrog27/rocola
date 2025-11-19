"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RocolaAdmin({ params }) {
  const { slug } = params;
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch(`/api/rocola/${slug}/status`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold">🎵 Rocola – Admin</h1>
      <p className="opacity-60">Local: <b>{slug}</b></p>

      <div className="mt-10 space-y-4">
        <Link
          href={`/${slug}/admin/rocola/spotify`}
          className="block bg-green-600 hover:bg-green-500 text-black p-4 rounded-lg"
        >
          🔗 Conectar Spotify
        </Link>

        {status && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <p>Estado: {status.status}</p>
            <p>Reproduciendo: {status?.now_playing?.track_name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
