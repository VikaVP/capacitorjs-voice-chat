// module.exports = {
//   basePath: '',
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         port: '',
//         pathname: '**',
//       },
//     ],
//     unoptimized: true,
//   },
//   output: 'export',
//   swcMinify: true,
//   transpilePackages: [
//     '@ionic/react',
//     '@ionic/core',
//     '@stencil/core',
//     'ionicons',
//   ],
// };

import fs from "node:fs/promises";
import path from "node:path";
// const CopyPlugin = require("copy-webpack-plugin")
import CopyPlugin from "copy-webpack-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		after: true,
	},
  basePath: '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
  output: 'standalone',
  // outputFileTracingRoot: path.join(__dirname, '../../'),
  // swcMinify: true,
  transpilePackages: [
    '@ionic/react',
    '@ionic/core',
    '@stencil/core',
    'ionicons',
  ],
  webpack: (config, {}) => {
    config.resolve.extensions.push(".ts", ".tsx")
    config.resolve.fallback = { fs: false }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: "./node_modules/onnxruntime-web/dist/*.wasm", to: "standalone/public/[name][ext]" },
          // { from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs", to: "static/chunks/[name][ext]" },
          // {
          //   from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
          //   to: "static/chunks/[name][ext]",
          // },
          // {
          //   from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm",
          //   to: "static/chunks/[name][ext]",
          // },
          // {
          //   from: "./node_modules/onnxruntime-web/dist/ort-training-wasm-simd-threaded.wasm",
          //   to: "static/chunks/[name][ext]",
          // },
          {
            from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
            to: "standalone/public/[name][ext]",
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
            to: "standalone/public/[name][ext]",
          },
        ],
      })
    )
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'javascript/auto',
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/wasm/',
          outputPath: 'static/wasm/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },
  headers: async () => {
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
						value: "require-corp",
					},
				],
			},
		];
  }
	// async headers() {
	// 	return [
	// 		{
	// 			source: "/(.*)",
	// 			headers: [
	// 				{
	// 					key: "Cross-Origin-Opener-Policy",
	// 					value: "same-origin",
	// 				},
	// 				{
	// 					key: "Cross-Origin-Embedder-Policy",
	// 					value: "require-corp",
	// 				},
	// 			],
	// 		},
	// 	];
	// },
};

export default nextConfig;

async function copyFiles() {
	try {
		await fs.access("public/");
	} catch {
		await fs.mkdir("public/", { recursive: true });
	}

	const wasmFiles = (
		await fs.readdir("node_modules/onnxruntime-web/dist/")
	).filter((file) => path.extname(file) === ".wasm");

	await Promise.all([
		fs.copyFile(
			"node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
			"public/vad.worklet.bundle.min.js"
		),
		fs.copyFile(
			"node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
			"public/silero_vad.onnx"
		),
		...wasmFiles.map((file) =>
			fs.copyFile(
				`node_modules/onnxruntime-web/dist/${file}`,
				`public/${file}`
			)
		),
	]);
}

copyFiles();
