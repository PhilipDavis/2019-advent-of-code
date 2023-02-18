import fs from 'fs';
import path from 'path';
import { blendLayers, parseInput } from './day8';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day8.data'))
        .toString()
        .split('')
        .map(s => parseInt(s, 10))
;

describe('day8', () => {
    describe('part1', () => {
        it('parses', () => {

        });

        const cases = [
            {
                input: '123456789012',
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
                input: '0222112222120000',
                expected: '0110'
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const result = blendLayers(parseInput(input.split('').map(s => parseInt(s,10)), 2, 2)).join('');
                expect(result).toEqual(expected);
            });
        });
    });
});
