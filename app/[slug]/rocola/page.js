"use client";

import RocolaPlayer from "@/components/RocolaPlayer";
import RocolaForm from "@/components/RocolaForm";

export default function RocolaPage({ params }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">🎵 Rocola Digital</h1>

        <RocolaPlayer slug={params.slug} />
        <RocolaForm slug={params.slug} />
      </div>
    </main>
  );
}
