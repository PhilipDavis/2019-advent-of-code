import { generatePhasePermutations, calculateMaxPhaseSettings, calculateMaxPhaseSettingsWithFeedback } from './day7';

describe('day7', () => {
    describe('part1', () => {
        const cases = [
            {
                stream: '3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0',
                expected: 43210,
            },
            {
                stream: '3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0',
                expected: 54321,
            }
        ];
        cases.forEach(({ stream, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const input = stream.split(',').map(s => parseInt(s, 10));

                const result = calculateMaxPhaseSettings(input);

                expect(result).toEqual(expected);
            });
        });
    });

    describe('part2', () => {
        const cases = [
            {
                stream: '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5',
                expected: 139629729,
            },
            {
                stream: '3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10',
                expected: 18216,
            }
        ];
        cases.forEach(({ stream, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const input = stream.split(',').map(s => parseInt(s, 10));

                const result = calculateMaxPhaseSettingsWithFeedback(input);

                expect(result).toEqual(expected);
            });
        });
    });
});
