"use client";

import { useState } from "react";
import RocolaPlayer from "@/components/RocolaPlayer";
import RocolaSearch from "@/components/RocolaSearch";
import RocolaQueue from "@/components/RocolaQueue";
import RocolaUserPanel from "@/components/RocolaUserPanel";

export default function RocolaPage({ params }) {
  const slug = params.slug;

  const [mesa, setMesa] = useState("A");
  const [nombre, setNombre] = useState("");

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-10">
        
        <h1 className="text-3xl font-bold text-center">🎵 Rocola Digital</h1>

        {/* <RocolaUserPanel mesa={mesa} setMesa={setMesa} nombre={nombre} setNombre={setNombre} /> */}

        <RocolaPlayer slug={slug} />

        <RocolaSearch slug={slug} mesa={mesa} nombre={nombre} />

        {/* <RocolaQueue slug={slug} /> */}
      </div>
    </main>
  );
}
