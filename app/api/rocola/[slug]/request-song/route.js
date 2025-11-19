export const dynamic = "force-dynamic";
export const revalidate = 0;

import { dbAdmin } from "@/lib/firebaseAdmin";
import { getAccessToken, spotifyFetch } from "@/lib/spotifyServer";
import admin from "firebase-admin";

export async function POST(req, { params }) {
  try {
    const { slug } = params;
    const body = await req.json();

    const {
      trackUri,
      trackId,
      trackName,
      artistName,
      userName,
      table,
      couponCode
    } = body;

    if (!trackUri || !trackId) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // 1. SETTINGS
    const settingsSnap = await dbAdmin.collection("settings").doc("rocola").get();
    if (!settingsSnap.exists) {
      return Response.json({ error: "Rocola no configurada" }, { status: 400 });
    }

    const settings = settingsSnap.data();
    const refreshToken = settings.spotifyRefreshToken;
    const playlistId = settings.spotifyPlaylistId;
    const basePrice = settings.songPrice || 100;

    // 2. CUPÓN
    let discount = 0;
    let finalPrice = basePrice;
    let couponDocId = null;

    if (couponCode) {
      const q = await dbAdmin
        .collection("coupons")
        .where("code", "==", couponCode.toUpperCase())
        .where("active", "==", true)
        .limit(1)
        .get();

      if (!q.empty) {
        const doc = q.docs[0];
        couponDocId = doc.id;
        const c = doc.data();

        const now = new Date();

        if (
          (!c.validUntil || c.validUntil.toDate() >= now) &&
          (c.maxUses == null || c.usedCount < c.maxUses)
        ) {
          if (c.type === "percent") {
            discount = Math.round((basePrice * c.value) / 100);
          } else if (c.type === "fixed") {
            discount = c.value;
          }

          finalPrice = Math.max(0, basePrice - discount);
        }
      }
    }

    // 3. SPOTIFY ACCESS TOKEN
    const { access_token } = await getAccessToken(refreshToken);

    // 4. Agregar al final de la playlist
    await spotifyFetch(access_token, `/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({ uris: [trackUri] })
    });

    // 5. Obtener playlist para saber posiciones
    const playlist = await spotifyFetch(
      access_token,
      `/playlists/${playlistId}?fields=tracks.items(track(id,uri)),snapshot_id`
    );

    const items = playlist.tracks.items;
    const snapshotId = playlist.snapshot_id;

    // El track recién agregado es el último
    const lastIndex = items.length - 1;

    // Moverlo a la posición 1 (segunda canción)
    await spotifyFetch(access_token, `/playlists/${playlistId}/tracks`, {
      method: "PUT",
      body: JSON.stringify({
        range_start: lastIndex,
        insert_before: 1,
        range_length: 1,
        snapshot_id: snapshotId
      })
    });

    // 6. Guardar en Firebase
    await dbAdmin.collection("songRequests").add({
      slug,
      createdAt: admin.firestore.Timestamp.now(),
      trackId,
      trackName,
      artistName,
      userName: userName || null,
      table: table || null,
      price: basePrice,
      discount,
      finalPrice,
      couponCode: couponCode || null,
      status: "accepted"
    });

    // 7. Actualizar cupón
    if (couponDocId && discount > 0) {
      await dbAdmin
        .collection("coupons")
        .doc(couponDocId)
        .update({
          usedCount: admin.firestore.FieldValue.increment(1)
        });
    }

    return Response.json({ ok: true, finalPrice });
  } catch (err) {
    console.error("REQUEST SONG ERROR:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
