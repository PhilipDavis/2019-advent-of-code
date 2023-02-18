import fs from 'fs';
import path from 'path';
import { Stream, Map, makeIndex, parseMap, floodFillOxygen } from './day15';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day15.data'))
        .toString()
        .split(',')
        .filter(s => !!s)
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n))
;

describe('day15', () => {
    describe('part1', () => {
        const cases = [
            {
                input: '',
                expected: 0
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const result = 0; // TODO
                expect(result).toEqual(expected);
            });
        });
    });

    describe('part2', () => {
        const cases = [
            {
                input: [
                    ' ##   ',
                    '#..## ',
                    '#.#..#',
                    '#.O.# ',
                    ' ###  ',
                ],
                expected: 4
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const { map, x, y } = parseMap(input);
                const result = floodFillOxygen(myInput, map, { x, y }, true);
                expect(result).toEqual(expected);
            });
        });
    });
});
