import qs from "querystring";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export async function getAccessToken(refreshToken) {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const body = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    console.log("SPOTIFY ERROR TOKEN:", await res.text());
    throw new Error("Spotify token error");
  }

  return res.json();
}

export async function spotifyFetch(token, path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.log("SPOTIFY API ERROR:", path, res.status, await res.text());
    throw new Error("Spotify fetch error");
  }

  if (res.status === 204) return null;
  return res.json();
}
