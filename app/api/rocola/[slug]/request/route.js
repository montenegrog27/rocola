import { dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { getAccessToken, spotifyFetch } from "@/lib/spotifyServer";

export async function POST(req, { params }) {
  console.log("🔵 [REQUEST] Iniciando request…");

  try {
    const { slug } = params;
    console.log("🔹 slug recibido:", slug);

    const body = await req.json();
    console.log("🔹 Body recibido:", body);

    const { trackId, name, artist, image, mesa, nombreCliente } = body;

    if (!trackId) {
      console.log("❌ ERROR: trackId faltante");
      return Response.json({ ok: false, error: "trackId faltante" }, { status: 400 });
    }

    // 1) REFERENCIA FIREBASE
    const ref = dbAdmin.collection("settings").doc("rocola");
    console.log("🔹 Firebase ref OK");

    // 2) ARMAR TRACKDATA
    const trackData = {
      id: trackId,
      name,
      artist,
      image,
      mesa: mesa || null,
      nombreCliente: nombreCliente || null,
      timestamp: Date.now(),
    };

    console.log("🔹 trackData armado:", trackData);

    // 3) GUARDAR EN FIREBASE
    console.log("🟡 Intentando guardar en Firebase…");

    try {
      await ref.update({
        queue: admin.firestore.FieldValue.arrayUnion(trackData),
      });
      console.log("🟢 Firebase: track agregado con éxito!");
    } catch (fbErr) {
      console.log("❌ ERROR Firebase update():", fbErr);
      return Response.json({ ok: false, error: "Firebase update error" }, { status: 500 });
    }

    // 4) LEER SETTINGS
    const snap = await ref.get();
    const settings = snap.data();

    console.log("🔹 Settings actuales Firebase:", settings);

    if (!settings.spotifyRefreshToken) {
      console.log("❌ ERROR: No hay refresh token en Firebase");
      return Response.json(
        { ok: false, error: "Refresh token faltante" },
        { status: 500 }
      );
    }

    // 5) TOKEN SPOTIFY
    console.log("🟡 Solicitando access token…");
    let access_token = null;
    try {
      const res = await getAccessToken(settings.spotifyRefreshToken);
      access_token = res.access_token;
      console.log("🟢 Access token OK:", access_token.substring(0, 10) + "...");
    } catch (tkErr) {
      console.log("❌ ERROR access token:", tkErr);
      return Response.json({ ok: false, error: "Error token Spotify" }, { status: 500 });
    }

    // 6) AGREGAR A LA QUEUE REAL
    console.log("🟡 Agregando a Spotify queue…");

    try {
      await spotifyFetch(
        access_token,
        `/me/player/queue?uri=spotify:track:${trackId}`,
        { method: "POST" }
      );
      console.log("🟢 Spotify: agregado a queue OK");
    } catch (qErr) {
      console.log("❌ ERROR Spotify queue:", qErr);
      return Response.json({ ok: false, error: "Error Spotify queue" }, { status: 500 });
    }

    // 7) LEER PLAYER
    console.log("🟡 Leyendo player Spotify…");

    let player = null;
    try {
      player = await spotifyFetch(access_token, `/me/player`, { method: "GET" });
      console.log("🟢 Player info:", player);
    } catch (pErr) {
      console.log("⚠️ No se pudo leer el player:", pErr.message);
    }

    // 8) SI NO HAY PLAYER → REPRODUCIR YA
    if (!player || !player.is_playing) {
      console.log("🟡 No hay música → intentando reproducir YA MISMO");

      try {
        await spotifyFetch(
          access_token,
          `/me/player/play`,
          {
            method: "PUT",
            body: JSON.stringify({
              uris: [`spotify:track:${trackId}`],
            }),
          }
        );

        console.log("🟢 Reproducción inmediata OK");
      } catch (playErr) {
        console.log("❌ ERROR reproducción inmediata:", playErr);
      }
    }

    return Response.json({ ok: true, queued: trackData });

  } catch (err) {
    console.log("❌ [EXCEPCIÓN GENERAL] ROCOLA REQUEST ERROR:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
