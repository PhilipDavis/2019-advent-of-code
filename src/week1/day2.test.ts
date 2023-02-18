import { add, processStream, multiply, part2 } from "./day2";

const f = (n: number[]) => JSON.stringify(n);

describe('Day 2', () => {
    describe('part 1', () => {
        it('add', () => {
            expect(f(add([1, 2, 3, 4, 0], 0))).toEqual(f([1, 2, 3, 4, 7]));
            expect(f(add([0, 1, 0, 0, 1, 1, 1, 2], 4))).toEqual(f([0, 1, 2, 0, 1 ,1 ,1, 2]));
        });

        it('multiply', () => {
            expect(f(multiply([2, 2, 3, 4, 0], 0))).toEqual(f([2, 2, 3, 4, 12]));
        });

        const cases = [
            {
                input: [ 1, 0, 0, 0, 99 ],
                expected: [ 2, 0, 0, 0, 99 ]
            },
            {
                input: [ 2, 3, 0, 3, 99 ],
                expected: [ 2, 3, 0, 6, 99 ],
            },
            {
                input: [ 1,1,1,4,99,5,6,0,99 ],
                expected: [ 30,1,1,4,2,5,6,0,99 ],
            },
            {
                input: [
                    1,9,10,3,
                    2,3,11,0,
                    99,
                    30,40,50
                ],
                expected: [
                    3500,9,10,70,
                    2,3,11,0,
                    99,
                    30,40,50
                ],
            }
        ];

        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const result = f(processStream(input));
                expect(result).toEqual(f(expected));
            });
        });
    });

    it('answer', () => {
        expect(part2()).toEqual(8298);
    });
});
