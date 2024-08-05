const path = "/daido";

const csp = {
  "script-src": [],
  "style-src": [],
  "font-src": [],
};

module.exports = {
  reactStrictMode: true,
  basePath: path,
  trailingSlash: true,
  env: {
    basePath: path,
    CI: process.env.CI,
    vercelEnv: process.env.VERCEL_ENV,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: path,
        basePath: false,
        permanent: true,
      },
    ];
  },
};
