/** @type {import('next').NextConfig} */

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.module.rules.push({
      test: /\.(md|mdx)?$/,
      loader: "@mdx-js/loader",
      /** @type {import("@mdx-js/loader").Options} */
      options: {},
    });
    return config;
  },
};

export default nextConfig;
