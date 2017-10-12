const entries = require('./entries');
const path = require('path');
const webpack = require('webpack');

module.exports = (env = {}) => {
  return {
    context: path.resolve(__dirname, 'src'),
    devtool: 'source-map',
    entry: entries,
    module: {
      loaders: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              query: {
                presets: ['env']
              }
            }
          ]
        }
      ]
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      })
    ],
    watch: env.watch
  };
};
