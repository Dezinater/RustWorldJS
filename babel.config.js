module.exports = (api) => {
  // Cache configuration is a required option
  api.cache(false);

  const presets = [
    "@babel/preset-typescript",
    "@babel/preset-env"
  ];

  const plugins = [["@babel/plugin-proposal-decorators", { legacy: true }], 'babel-plugin-transform-import-meta'];

  return { presets, plugins };
};