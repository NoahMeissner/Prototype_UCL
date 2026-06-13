import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Prototype_UCL",
  assetPrefix: "/Prototype_UCL",
  images: { unoptimized: true },
};

export default nextConfig;
