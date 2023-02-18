import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day8.data'))
        .toString()
        .split('')
        .map(s => parseInt(s, 10))
;

type Layer = number[];

export function parseInput(input: number[], width: number, height: number): Layer[] {
    const layers = [];
    const layerSize = width * height;
    for (let i = 0; i < input.length; i += layerSize) {
        layers.push(input.slice(i, i + layerSize));
    }
    return layers;
}

function howManyZeros(layer: Layer): number {
    return layer.filter(n => n === 0).length;
}

export function findLayerWithFewestZeroes(layers: Layer[]): Layer {
    return layers.reduce((smallest, layer) =>
        howManyZeros(layer) < howManyZeros(smallest)
            ? layer
            : smallest
        , layers[0]); 
}

function onesTimesTwos(layer: Layer): number {
    let ones = layer.filter(n => n === 1).length;
    let twos = layer.filter(n => n === 2).length;
    return ones * twos;
}


export function blendLayers(layers: Layer[]): Layer {
    /*
    0 - black
    1- white
    2 - transparent
    */

    const output: Layer = [];
    for (let z = 0; z < layers[0].length; z++) {
        output.push(null as any);
    }

    for (let l = layers.length - 1; l >= 0; l--) {
        const layer = layers[l];
        for (let i = 0; i < layer.length; i++) {
            if (output[i] === null) {
                output[i] = layer[i];
            }
            else if (layer[i] !== 2) {
                output[i] = layer[i];
            }
        }
    }
    return output;
}


export function day8_part1() {
    const result = onesTimesTwos(findLayerWithFewestZeroes(parseInput(myInput, 25, 6)));
    console.log(`Day 8 part 1 result: ${result}`);
}

export function day8_part2() {
    const image = blendLayers(parseInput(myInput, 25, 6));
    for (let y = 0; y < 6; y++) {
        console.log(image.slice(y * 25, (y + 1) * 25).map(n => n ? 'X' : ' ').join(''));
    }
    // Result spelled AURCY
//    console.log(`Day 8 part 2 result: ${result}`);
}


day8_part1();
day8_part2();
