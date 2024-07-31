import useSWR from "swr";
import { useState, useEffect } from "react";
import {
  formatDistanceToNowStrict,
  parseISO,
  differenceInSeconds,
} from "date-fns";

const fetcher = (url) => fetch(url).then((r) => r.json());

const SpotifyStatus = () => {
  const {
    data: nowPlaying,
    error: nowPlayingError,
    mutate: mutateNowPlaying,
  } = useSWR(
    "/api/now-playing",
    fetcher,
    { refreshInterval: 10000 } // refresh every 10 seconds
  );
  const { data: recentlyPlayed, error: recentError } = useSWR(
    "/api/recently-played",
    fetcher,
    { refreshInterval: 60000 } // refresh every minute
  );
  const [progress, setProgress] = useState(0);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (nowPlaying) {
      setProgress(nowPlaying.progress);

      if (nowPlaying.isPlaying) {
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= nowPlaying.duration) {
              clearInterval(timer);
              mutateNowPlaying(); // trigger revalidation when track should have ended
              return nowPlaying.duration;
            }
            return prev + 1000;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [nowPlaying, mutateNowPlaying]);

  useEffect(() => {
    if (recentlyPlayed && !recentlyPlayed.error) {
      const playedAt = parseISO(recentlyPlayed.played_at);

      const updateTimeAgo = () => {
        const now = new Date();
        const secondsAgo = differenceInSeconds(now, playedAt);

        if (secondsAgo < 60) {
          setTimeAgo(`${secondsAgo} second${secondsAgo !== 1 ? "s" : ""} ago`);
          return true;
        } else {
          setTimeAgo(formatDistanceToNowStrict(playedAt, { addSuffix: true }));
          return false;
        }
      };

      let isWithinFirstMinute = updateTimeAgo();

      const timer = setInterval(() => {
        isWithinFirstMinute = updateTimeAgo();

        // if we're past the first minute, switch to less frequent updates
        if (!isWithinFirstMinute) {
          clearInterval(timer);
          setInterval(updateTimeAgo, 60000);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [recentlyPlayed]);

  if (nowPlayingError)
    console.error("Error fetching now playing:", nowPlayingError);
  if (recentError)
    console.error("Error fetching recently played:", recentError);

  if (!nowPlaying || !recentlyPlayed) return <div>Loading...</div>;

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusAndTrack = () => {
    if (nowPlaying.isPlaying) {
      return {
        status: "Currently Playing",
        track: nowPlaying,
        progressText: `${formatTime(progress)} / ${formatTime(
          nowPlaying.duration
        )}`,
      };
    } else if (nowPlaying.title) {
      return {
        status: "Paused",
        track: nowPlaying,
        progressText: `${formatTime(progress)} / ${formatTime(
          nowPlaying.duration
        )}`,
      };
    } else if (recentlyPlayed && !recentlyPlayed.error) {
      return {
        status: "Offline",
        track: recentlyPlayed,
        progressText: `Played ${timeAgo}`,
      };
    } else {
      return {
        status: "Offline",
        track: null,
        progressText: "No recent tracks",
      };
    }
  };

  const { status, track, progressText } = getStatusAndTrack();

  return (
    <div>
      <h2>{status}</h2>
      {track && (
        <>
          <a href={track.albumUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={track.albumImageUrl}
              alt={`${track.album} by ${track.albumArtists}`}
            />
          </a>
          <p>
            <a href={track.songUrl} target="_blank" rel="noopener noreferrer">
              {track.title}
            </a>{" "}
            by{" "}
            {track.artists.map((artist, index) => (
              <span key={artist.name}>
                {index > 0 && ", "}
                <a href={artist.url} target="_blank" rel="noopener noreferrer">
                  {artist.name}
                </a>
              </span>
            ))}
          </p>
        </>
      )}
      <p>{progressText}</p>
    </div>
  );
};

export default SpotifyStatus;
