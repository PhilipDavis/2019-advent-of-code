import { fft, fft10000 } from "./day16";

describe('day16', () => {
    describe('part1', () => {
        const cases = [
            {
                input: '12345678',
                phases: 1,
                expected: '48226158'
            },
            {
                input: '12345678',
                phases: 2,
                expected: '34040438'
            },
            /*
            {
                input: '80871224585914546619083218645595',
                phases: 100,
                expected: '24176176'
            },
            */
        ];
        cases.forEach(({ input, phases, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const result = fft(input.split('').map(s => parseInt(s, 10)), phases);
                expect(result).toEqual(expected);
            });
        });
    });

    describe.skip('part2', () => {
        const cases = [
            {
                input: '03036732577212944063491565474664',
                expected: '84462026'
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const input2 = input.split('').map(s => parseInt(s, 10));
                const offset = parseInt(input2.slice(0, 7).join(''), 10);
                const result = fft10000(input2, 100, offset);
                expect(result).toEqual(expected);
            });
        });
    });
});
