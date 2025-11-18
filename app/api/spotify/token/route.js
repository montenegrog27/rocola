import { dbAdmin } from "@/lib/firebaseAdmin";
import { getAccessToken } from "@/lib/spotifyServer";

export async function GET() {
  const settingsSnap = await dbAdmin.collection("settings").doc("rocola").get();

  if (!settingsSnap.exists) {
    return Response.json({ error: "Settings missing" }, { status: 400 });
  }

  const { spotifyRefreshToken } = settingsSnap.data();

  if (!spotifyRefreshToken) {
    return Response.json({ error: "Missing refresh token" }, { status: 400 });
  }

  const token = await getAccessToken(spotifyRefreshToken);

  return Response.json(token); // { access_token, token_type, expires_in }
}
