import type { NextConfig } from "next";

const clientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

const nextConfig: NextConfig = {
  ...(clientId ? { env: { NEXT_PUBLIC_GOOGLE_CLIENT_ID: clientId } } : {}),
};

export default nextConfig;
