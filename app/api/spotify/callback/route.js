import { dbAdmin } from "@/lib/firebaseAdmin";
import qs from "querystring";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return Response.json({ error: "No code returned" }, { status: 400 });
    }

    // Hacemos el intercambio
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    console.log("🟡 SPOTIFY TOKEN RESPONSE:", tokenData);

    if (!tokenRes.ok) {
      return Response.json(
        {
          error: "Spotify token error",
          status: tokenRes.status,
          tokenData: tokenData,
        },
        { status: 500 }
      );
    }

    if (!tokenData.refresh_token) {
      return Response.json(
        {
          error: "No refresh token",
          tokenData: tokenData,
        },
        { status: 500 }
      );
    }

    await dbAdmin.collection("settings").doc("rocola").set(
      {
        spotifyRefreshToken: tokenData.refresh_token,
      },
      { merge: true }
    );

    return Response.json({
      ok: true,
      saved: tokenData.refresh_token,
    });
  } catch (err) {
    console.error("🔥 CALLBACK ERROR:", err);
    return Response.json({ error: "Internal Error", details: err.message });
  }
}
