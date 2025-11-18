
export async function GET() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: [
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-modify-private",
      "playlist-modify-public",
    ].join(" "),
  });

  const redirectUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return Response.redirect(redirectUrl);
}
