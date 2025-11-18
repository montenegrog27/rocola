import { dbAdmin } from "@/lib/firebaseAdmin";
import { getAccessToken, spotifyFetch } from "@/lib/spotifyServer";

export async function GET(req, { params }) {
  try {
    const { slug } = params;

    const ref = dbAdmin.collection("settings").doc("rocola");
    const snap = await ref.get();
    const data = snap.data();

    const refreshToken = data.spotifyRefreshToken;
    const queue = data.queue || [];

    if (!queue.length) {
      return Response.json({ ok: true, removed: false });
    }

    // 1) Obtener lo que está sonando
    const { access_token } = await getAccessToken(refreshToken);

    let player;
    try {
      player = await spotifyFetch(access_token, "/me/player");
    } catch (err) {
      console.log("Error leyendo player:", err);
      return Response.json({ ok: false, error: "No se pudo leer Spotify" });
    }

    if (!player || !player.item) {
      return Response.json({ ok: true, removed: false });
    }

    const currentTrackId = player.item?.id;

    // 2) Ver si la FIRST canción de la cola ya se reprodujo
    const first = queue[0];

    if (!first) {
      return Response.json({ ok: true, removed: false });
    }

    // La canción que está PRIMERA en queue ya no coincide con la que sigue → remover
    if (first.id !== currentTrackId) {
      // Significa que ya sonó y Spotify avanzó
      await ref.update({
        queue: queue.slice(1), // borrar la primera
      });

      return Response.json({
        ok: true,
        removed: true,
        removedTrack: first,
      });
    }

    return Response.json({ ok: true, removed: false });
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
