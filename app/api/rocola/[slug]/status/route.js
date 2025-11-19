export const dynamic = "force-dynamic";
export const revalidate = 0;

import { dbAdmin } from "@/lib/firebaseAdmin";
import { getAccessToken, spotifyFetch } from "@/lib/spotifyServer";

export async function GET(req, { params }) {
  try {

    const { slug } = params;

    // 1. FIRESTORE SETTINGS
    const settingsSnap = await dbAdmin.collection("settings").doc("rocola").get();

    if (!settingsSnap.exists) {
      return Response.json({ error: "Rocola no configurada" }, { status: 400 });
    }

    const settings = settingsSnap.data();

    const refreshToken = settings.spotifyRefreshToken;
    const playlistId = settings.spotifyPlaylistId;

    if (!refreshToken || !playlistId) {
      return Response.json({ error: "Spotify no vinculado" }, { status: 400 });
    }

    // 2. ACCESS TOKEN
    const { access_token } = await getAccessToken(refreshToken);

    // 3. PLAYER STATUS
    const player = await spotifyFetch(access_token, "/me/player");

    let nowPlaying = null;

    if (player && player.item) {
      nowPlaying = {
        id: player.item.id,
        name: player.item.name,
        artist: player.item.artists.map(a => a.name).join(", "),
        image: player.item.album.images?.[0]?.url,
      };
    }

    // 4. PLAYLIST
    const playlist = await spotifyFetch(
      access_token,
      `/playlists/${playlistId}?fields=tracks.items(track(id,name,artists,album(images)))`
    );

    const tracks = playlist.tracks.items.map(i => ({
      id: i.track.id,
      name: i.track.name,
      artist: i.track.artists.map(a => a.name).join(", "),
      image: i.track.album.images?.[0]?.url,
    }));

    return Response.json({
      nowPlaying,
      upNext: tracks.slice(1, 6),
    });
  } catch (err) {
    console.error("❌ ROCOLA STATUS ERROR:", err);
    return Response.json({ error: "Error interno", details: err.message }, { status: 500 });
  }
}
