const path = require("path");
const webpack = require("webpack");
const { version } = require("./package.json");

module.exports = {
  entry: "./src/mod.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    usedExports: true,
  },
  output: {
    filename: "unity-web-modkit.[hash].js",
    path: path.resolve(__dirname, "dist"),
    library: "UnityWebModkit",
    libraryTarget: "window",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new webpack.DefinePlugin({
      DEVELOPMENT: "true",
      VERSION: JSON.stringify(version),
    }),
  ],
};
