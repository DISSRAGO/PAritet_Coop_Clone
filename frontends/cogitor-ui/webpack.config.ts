import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const devServer: DevServerConfiguration = {
  host: "0.0.0.0",
  port: 3001,

  hot: true,
  open: true,

  historyApiFallback: true,

  client: {
    overlay: {
      errors: true,
      warnings: false,
    },
  },

  proxy: {
    /**
     * Старый COGI PHP-style API.
     *
     * Frontend:
     *   /cogi/location/location.php
     *   /cogi/thanka/getThanka.php
     *   /cogi/community/community.php
     *
     * Backend FastAPI:
     *   http://127.0.0.1:8000/cogi/...
     */
    "/cogi": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      secure: false,
    },

    /**
     * Новый API:
     *
     * Frontend:
     *   /api/auth
     *   /api/user
     *   /api/payment
     *   /api/thanka
     *   /api/address
     *
     * Backend FastAPI:
     *   http://127.0.0.1:8000/api/...
     */
    "/api": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      secure: false,
    },

    /**
     * Если frontend запрашивает файлы или данные через /data.
     */
    "/data": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      secure: false,
    },
  },
};

const config: Configuration = {
  mode: "development",

  entry: path.resolve(__dirname, "src", "index.tsx"),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    publicPath: "/",
    clean: true,
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },

      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },

      {
        test: /\.(scss|sass)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[hash][ext]",
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name].[hash][ext]",
        },
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
  ],

  devtool: "eval-source-map",

  devServer,
};

export default config;