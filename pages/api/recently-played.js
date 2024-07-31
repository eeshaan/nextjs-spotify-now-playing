import { getAccessToken } from "../../lib/spotify";

export default async function handler(req, res) {
  try {
    const access_token = await getAccessToken();

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 204 || response.status > 400) {
      return res.status(200).json({ error: "No recently played tracks" });
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(200).json({ error: "No recently played tracks" });
    }

    const recentTrack = data.items[0].track;
    const track = {
      title: recentTrack.name,
      artists: recentTrack.artists.map((artist) => ({
        name: artist.name,
        url: artist.external_urls.spotify,
      })),
      album: recentTrack.album.name,
      albumArtists: recentTrack.album.artists
        .map((artist) => artist.name)
        .join(", "),
      albumImageUrl: recentTrack.album.images[0].url,
      albumUrl: recentTrack.album.external_urls.spotify,
      songUrl: recentTrack.external_urls.spotify,
      played_at: data.items[0].played_at,
    };

    res.status(200).json(track);
  } catch (error) {
    console.error("Error fetching recently played:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
