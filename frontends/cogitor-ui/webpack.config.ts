import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import type { Configuration, WebpackPluginInstance } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

// При запуске через `webpack serve` webpack-cli выставляет WEBPACK_SERVE=true.
// Используем это как единственный надёжный признак dev-сервера: фронт-dev-server
// крутится отдельно от основного start_cogiteka_hybrid.sh (на 3001), а production
// build идёт командой `webpack --mode production` без serve.
const isDevServer = process.env.WEBPACK_SERVE === "true";

const devServer: DevServerConfiguration = {
  host: "0.0.0.0",
  port: 3001,

  // hot:true + react-refresh-webpack-plugin = HMR с сохранением состояния React.
  // Без плагина webpack делал полный reload страницы при любом изменении — теряли
  // открытый редактор тханки, форму, прокрутку. Теперь правки в jsx подхватываются
  // «на лету», состояние компонентов сохраняется.
  hot: true,

  // open:false — на сервере нет браузера, прежнее open:true спамило ошибками
  // "xdg-open: not found" в логах. Локально девелопер откроет :3001 сам.
  open: false,

  historyApiFallback: true,

  // Явно фиксируем тип WS-сервера. webpack-dev-server по умолчанию
  // и так использует ws, но без явного указания клиент в браузере
  // иногда промахивается с протоколом при port-forwarding.
  webSocketServer: "ws",

  client: {
    overlay: {
      errors: true,
      warnings: false,
    },

    // Явный webSocketURL клиента. Без него браузер вычисляет URL
    // из location.host + дефолтный путь, и при доступе через SSH
    // local-port-forward (-L 3001:127.0.0.1:3001) промахивается:
    // клиент пытается коннектиться к auto-угаданному хосту, который
    // на стороне сервера не резолвится → в DevTools получаем
    // "[webpack-dev-server] Disconnected! Trying to reconnect..."
    // и hot reload перестаёт работать до перезагрузки страницы.
    // hostname:0.0.0.0 + port:0 заставляет клиент использовать
    // именно тот origin, через который страница была загружена —
    // то есть localhost:3001 в браузере девелопера.
    webSocketURL: {
      hostname: "0.0.0.0",
      port: 0,
      protocol: "ws",
      pathname: "/ws",
    },

    // Сокращаем количество попыток reconnect до 10 (вместо дефолтных
    // бесконечных) — этого достаточно для типичных кратковременных
    // обрывов SSH-туннеля, но не плодит сотни записей в DevTools-консоли
    // если сервер реально упал.
    reconnect: 10,
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

  // В dev-режиме entry расширяем prelude'ом react-refresh — иначе babel-плагин
  // рефреша вставляет в транспилированный код вызовы $RefreshReg$/$RefreshSig$, но
  // их рантайм не загружен — падает "$RefreshReg$ is not defined" в первом
  // же компоненте (AppFooter.tsx и т.д.).
  entry: isDevServer
    ? [
        "@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js",
        path.resolve(__dirname, "src", "index.tsx"),
      ]
    : path.resolve(__dirname, "src", "index.tsx"),

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
          options: {
            // react-refresh/babel подключаем именно здесь, а не в babel.config.json:
            // babel.config.json подхватывается всеми babel-инстансами в проекте,
            // включая child compiler'ов вроде html-webpack-plugin — их плагин
            // ReactRefreshWebpackPlugin не обрабатывает (только лоадеры),
            // и получали "$RefreshReg$ is not defined" при загрузке первого
            // компонента (AppFooter.tsx). Локальный plugins[] в webpack-руле
            // работает только для файлов под этим правилом и не влияет на child
            // compiler'ы.
            plugins: isDevServer ? [require.resolve("react-refresh/babel")] : [],
          },
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

  plugins: ([
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
    // React Refresh работает только при включённом dev-server. В production
    // build плагин подключать нельзя — он подмешивает HMR-рантайм в бандл.
    isDevServer && new ReactRefreshWebpackPlugin({
      // overlay уже даёт webpack-dev-server через client.overlay — отключаем,
      // чтобы не было двух перекрывающихся оверлеев с ошибками.
      overlay: false,
    }),
  ].filter(Boolean)) as WebpackPluginInstance[],

  // На SSH/смонтированных ФС inotify-события иногда теряются —
  // включаем polling-fallback. 1000мс — компромисс между задержкой
  // подхвата изменений (≤1с) и нагрузкой на CPU. ignored для
  // node_modules чтобы polling не молотил впустую тысячи файлов.
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 300,
    ignored: /node_modules/,
  },

  devtool: "eval-source-map",

  devServer,
};

export default config;