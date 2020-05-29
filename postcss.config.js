const pluginsProd = {
  autoprefixer: {},
  cssnano: {
    preset: 'default',
  },
};

const pluginsDev = {
  'postcss-easings': {},
};

module.exports = ({ env }) => ({
  plugins: (env === 'production') ? { ...pluginsDev, ...pluginsProd } : pluginsDev,
});
