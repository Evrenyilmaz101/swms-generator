import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.swmssorted.com.au" }],
        destination: "https://swmssorted.com.au/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
