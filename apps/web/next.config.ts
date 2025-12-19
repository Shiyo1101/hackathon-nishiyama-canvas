import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 画像アップロード用に10MBまで許容
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4566", // LocalStack S3
        pathname: "/nishiyama-canvas-images/**",
      },
      {
        protocol: "https",
        hostname: "nishiyama-canvas-images.s3.ap-northeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nishiyama-canvas-images-prod.s3.ap-northeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ckan.odp.jig.jp",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
