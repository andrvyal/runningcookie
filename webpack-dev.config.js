const entries = require('./entries');
const path = require('path');

module.exports = (env = {}) => {
  return {
    context: path.resolve(__dirname, 'src'),
    entry: entries,
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, 'dist')
    },
    watch: env.watch
  };
}
