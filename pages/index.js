import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SpotifyStatus from '../components/spotify-status';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js Spotify Starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SpotifyStatus />

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}