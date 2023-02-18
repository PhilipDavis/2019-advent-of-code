import { shortestPath, locateSymbol, findMinimumStepsWithDeepDives } from "./day18";

describe('day18', () => {
    describe('part1', () => {
        const cases = [
            {
                input: [
                    '########################',
                    '#@..............ac.GI.b#',
                    '###d#e#f################',
                    '###A#B#C################',
                    '###g#h#i################',
                    '########################',
                ],
                keyCount: 9,
                expected: 81
            },
        ];
        cases.forEach(({ input, keyCount, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const result = findMinimumStepsWithDeepDives(input, keyCount);
                expect(result).toEqual(expected);
            });
        });
    });

    describe('part2', () => {
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
});
