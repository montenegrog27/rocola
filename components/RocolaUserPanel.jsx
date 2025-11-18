"use client";

export default function RocolaUserPanel({ mesa, setMesa, nombre, setNombre }) {
  return (
    <section className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
      <p className="text-xs uppercase text-slate-400">Tus datos</p>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-300">Mesa:</label>
          <select
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2"
          >
            <option value="A">Mesa A</option>
            <option value="B">Mesa B</option>
            <option value="C">Mesa C</option>
            <option value="D">Mesa D</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300">Tu nombre (opcional):</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan"
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2"
          />
        </div>
      </div>
    </section>
  );
}
