"use client";

export default function SpotifyConnectPage({ params }) {
  const { slug } = params;

  const handleLogin = () => {
    window.location.href = `/api/spotify/login?slug=${slug}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 text-center">
      <h1 className="text-3xl font-bold">Conectar Spotify</h1>
      <p className="opacity-60 mt-3">Local: {slug}</p>

      <button
        onClick={handleLogin}
        className="mt-10 bg-green-500 text-black px-6 py-3 rounded-lg font-bold"
      >
        Iniciar sesión con Spotify
      </button>
    </div>
  );
}
