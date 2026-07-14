/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      "**/*.{js,jsx,ts,tsx}": {
        loaders: [
          {
            loader: "@locator/webpack-loader",
            options: {
              env: "development",
            },
          },
        ],
      },
    },
  },
};

export default nextConfig;
