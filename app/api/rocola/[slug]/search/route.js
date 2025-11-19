export const dynamic = "force-dynamic";
export const revalidate = 0;

import { dbAdmin } from "@/lib/firebaseAdmin";
import { getAccessToken, spotifyFetch } from "@/lib/spotifyServer";

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return Response.json({ tracks: [] });
    }

    // settings
    const settingsSnap = await dbAdmin.collection("settings").doc("rocola").get();
    if (!settingsSnap.exists) {
      return Response.json({ tracks: [] });
    }

    const { spotifyRefreshToken: refreshToken } = settingsSnap.data();
    if (!refreshToken) return Response.json({ tracks: [] });

    // access token
    const { access_token } = await getAccessToken(refreshToken);

    const data = await spotifyFetch(
      access_token,
      `/search?limit=10&type=track&q=${encodeURIComponent(q)}`
    );

    const tracks = data.tracks.items.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map(a => a.name).join(", "),
      image: t.album.images?.[0]?.url,
      uri: t.uri
    }));

    return Response.json({ tracks });
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return Response.json({ tracks: [] });
  }
}
