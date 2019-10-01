const path = require('path');

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, './'),
  entry: './app/app.jsx',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'jsx-loader',
        exclude: /node_modules/,
        include: path.resolve(__dirname, './app'),
      }
    ],
  }
};
