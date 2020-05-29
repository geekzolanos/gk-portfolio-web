// eslint-disable-next-line import/order
const materialColors = require('./materialColors');

const vibrant = require('node-vibrant');
const path = require('path');

const DefaultPath = './src/img/packages/';
const DefaultExt = 'png';

const nearestColor = require('nearest-color').from(materialColors);

const asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await cb(arr[i]);
  }
};

async function parseColors({ pkgs, imgPath = DefaultPath, ext = DefaultExt }) {
  const res = {};

  await asyncForEach(pkgs, async (pkg) => {
    const img = path.join(`${imgPath}/${pkg}/`, `thumb.${ext}`);
    const pallete = await vibrant.from(img).getPalette();
    const nearest = nearestColor(pallete.Vibrant.hex);
    res[pkg] = nearest;
  });

  return res;
}

module.exports = parseColors;
