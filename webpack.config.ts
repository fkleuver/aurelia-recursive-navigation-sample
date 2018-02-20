import * as webpack from "webpack";
import * as path from "path";
import { AureliaPlugin } from "aurelia-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";

const outDir: string = path.resolve(__dirname, "dist");
const srcDir: string = path.resolve(__dirname, "src");
const nodeModulesDir: string = path.resolve(__dirname, "node_modules");

const baseUrl: string = "/";
const config: webpack.Configuration = {
  resolve: {
    extensions: [".ts", ".js"],
    modules: [srcDir, "node_modules"],
    alias: {
      bluebird: path.join(nodeModulesDir, "bluebird/js/browser/bluebird")
    }
  },
  entry: {
    app: ["aurelia-bootstrapper"],
    vendor: ["bluebird"]
  },
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: "[name].[hash].bundle.js",
    sourceMapFilename: "[name].[hash].bundle.map",
    chunkFilename: "[name].[hash].chunk.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: outDir,
    historyApiFallback: true
  },
  module: {
    rules: [
      /**
       * CSS
       */
      {
        test: /\.css$/i,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{ loader: "css-loader" }]
        }),
        issuer: [{ not: [{ test: /\.html$/i }] }]
      },
      {
        test: /\.css$/i,
        use: [{ loader: "css-loader" }],
        issuer: [{ test: /\.html$/i }]
      },
      /**
       * HTML
       */
      {
        test: /\.html$/i,
        use: [{ loader: "html-loader" }]
      },
      /**
       * TypeScript
       */
      {
        test: /\.ts$/i,
        use: [{ loader: "ts-loader" }],
        exclude: nodeModulesDir
      },
      /**
       * JSON
       */
      {
        test: /\.json$/i,
        use: [{ loader: "json-loader" }]
      },
      {
        test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/,
        use: [{ loader: "expose-loader?Promise" }]
      }
    ]
  },
  plugins: [
    new AureliaPlugin(),
    new webpack.ProvidePlugin({
      Promise: "bluebird"
    }),
    new HtmlWebpackPlugin({
      template: "index.html"
    }),
    new ExtractTextPlugin({
      filename: "[id].css",
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "common"
    })
  ]
};

export default config;
