import { parseInput, findClosestIntersection } from "./day3";

describe('day3', () => {
    describe('parseInput', () => {
        it('parses', () => {
            expect(parseInput('U1,D10,L100,R1000')).toEqual([
                { direction: 'U', distance: 1 },
                { direction: 'D', distance: 10 },
                { direction: 'L', distance: 100 },
                { direction: 'R', distance: 1000 },
            ]);                
        });
    });

    describe('findClosestIntersection', () => {
        const cases = [
            {
                wire1: 'R8,U5,L5,D3',
                wire2: 'U7,R6,D4,L4',
                expected: 6
            },
            {
                wire1: 'R75,D30,R83,U83,L12,D49,R71,U7,L72',
                wire2: 'U62,R66,U55,R34,D71,R55,D58,R83',
                expected: 159
            },
            {
                wire1: 'R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
                wire2: 'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7',
                expected: 135
            },
        ];
        cases.forEach(({ wire1, wire2, expected }, i) => {
            it(`case ${i + 1}`, () => {
                expect(findClosestIntersection(wire1, wire2)).toEqual(expected);
            });
        });
    });
});
