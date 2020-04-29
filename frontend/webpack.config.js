const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {

  mode: "production",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  entry: './src/index.tsx',

  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "awesome-typescript-loader"
          }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /public\/.*/,
        loader: "raw-loader"
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      {from: 'public', to: '.'}
    ]),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ],
  // Loaded directly via CDN
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  }
};
