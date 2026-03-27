import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of Turbopack — Sherpa-ONNX WASM bridge uses
  // dynamic import(url) which Turbopack can't resolve
  turbopack: {},
  experimental: {
    webpackBuildWorker: true,
  },
  // Large local AI model assets are served directly from disk at runtime
  // and should not be pulled into server output traces.
  outputFileTracingExcludes: {
    "/*": ["./models/**/*", "../models/**/*", "./sherpa-onnx-whisper-base.en/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Keep transformers out of server webpack graph, but allow client bundling
    // so dynamic import("@xenova/transformers") works in the browser.
    if (isServer) {
      const currentExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      currentExternals.push({
        "@xenova/transformers": "commonjs @xenova/transformers",
      });
      config.externals = currentExternals;
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Treat ONNX files as static assets so webpack does not parse/process model binaries.
    config.module.rules.push({
      test: /\.onnx$/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
