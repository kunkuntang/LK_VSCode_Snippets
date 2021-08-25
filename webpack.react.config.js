var path = require("path");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "webview/App/main.js"),
    sidebar: path.resolve(__dirname, "webview/SideBar/sidebar.js"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [{
      test: /\.jsx?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      }
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    port: 9000,
    hot: true,
    writeToDisk: true,
  },
  devtool: 'source-map',
};
