import { calculateFuelRequired, part1, part2, calculateTotalFuelRequired } from "./day1";

describe('Day 1', () => {
    describe('part 1', () => {
        const cases = [
            { mass: 12, expected: 2 },
            { mass: 14, expected: 2 },
            { mass: 1969, expected: 654 },
            { mass: 100756, expected: 33583 },
        ];
        cases.forEach(({ mass, expected }) => {
            it(`${mass} -> ${expected}`, () => {
                expect(calculateFuelRequired(mass)).toEqual(expected);
            });
        });

        it('answer', () => {
            expect(part1()).toEqual(3299598);
        });
    });

    describe('part 2', () => {
        const cases = [
            { mass: 14, expected: 2 },
            { mass: 1969, expected: 966 },
            { mass: 100756, expected: 50346 },
        ];
        cases.forEach(({ mass, expected }) => {
            it(`${mass} -> ${expected}`, () => {
                expect(calculateTotalFuelRequired(mass)).toEqual(expected);
            });
        });

        it('answer', () => {
            expect(part2()).toEqual(4946546);
        });
    });
});
