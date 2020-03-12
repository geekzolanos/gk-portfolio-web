const vibrant = require('node-vibrant');
const materialColors = require('./materialColors');
const path = require('path');

const nearestColor = require('nearest-color').from(materialColors);

const defaultPath = './src/img/packages/pngs/';
const defaultExt = '.png';

const asyncForEach = async (arr, cb) => {
    for (let i = 0; i < arr.length; i++) {
        await cb(arr[i]);
    }
};

async function parseColors({pkgs, imgPath = defaultPath, ext = defaultExt}) {
    const res = {};

    await asyncForEach(pkgs, async (pkg) => {
        const img = path.join(imgPath, `${pkg}${ext}`);
        const pallete = await vibrant.from(img).getPalette();
        const nearest = nearestColor(pallete.Vibrant.hex);
        res[pkg] = nearest;
    });

    return res;
}

module.exports = parseColors;