/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
  },
  // SPA-style routing: all client routes serve the root page
  async rewrites() {
    return [
      { source: "/loom", destination: "/" },
      { source: "/studio", destination: "/" },
      { source: "/agents", destination: "/" },
      { source: "/bridges", destination: "/" },
      { source: "/write", destination: "/" },
      { source: "/post/:id", destination: "/" },
      { source: "/article/:id", destination: "/" },
      { source: "/profile/:id", destination: "/" },
    ];
  },
};

module.exports = nextConfig;
