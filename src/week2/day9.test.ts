import { processStream, Stream } from "./day9";

describe('day 9', () => {
    describe('part1', () => {
        const cases = [
            {
                input: '109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99',
                expected: '109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99',
            },
            {
                input: '104,1125899906842624,99',
                expected: '1125899906842624',
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const stream = new Stream(input);
                const output: number[] = [];
                processStream(stream.stream, [], 0, n => {
                    output.push(n);
                });
                const result = output.join(',');
                expect(result).toEqual(expected);
            });
        });
    });
});
