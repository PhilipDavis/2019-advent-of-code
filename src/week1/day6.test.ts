import fs from 'fs';
import path from 'path';
import { calculateOrbits, getPathToRoot, calculateOrbitJumps } from './day6';

const input =
    fs.readFileSync(path.resolve(__dirname, './day6.data'))
        .toString()
        .split('\r\n')
;

describe('day6', () => {
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
                input: [ 'A)B', 'B)C', 'C)D', 'D)E', 'B)F', 'F)G' ],
                from: 'E',
                to: 'G',
                expected: 3
            },
        ];
        cases.forEach(({ input, from, to, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const nodesByName = calculateOrbits(input);
                const result = calculateOrbitJumps(nodesByName, from, to);
                expect(result).toEqual(expected);
            });
        });
    });
});
