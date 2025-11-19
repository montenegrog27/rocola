"use client";

import Link from "next/link";

export default function AdminHome({ params }) {
  const { slug } = params;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold">Panel Admin – {slug}</h1>

      <div className="mt-8 space-y-3">
        <Link
          href={`/${slug}/admin/rocola`}
          className="block bg-slate-800 hover:bg-slate-700 p-4 rounded-lg"
        >
          🎵 Configurar Rocola
        </Link>
      </div>
    </div>
  );
}
