const pluginsProd = {
  autoprefixer: {},
  cssnano: {},
};

const pluginsDev = {
  'postcss-easings': {},
};

module.exports = ({ env }) => ({
  plugins: (env === 'production') ? pluginsDev : { ...pluginsDev, ...pluginsProd },
});
