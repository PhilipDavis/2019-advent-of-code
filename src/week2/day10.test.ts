import { calculateBestAsteroid, findAllAsteroids, whichIsNthAsteroid } from "./day10";

describe('day10', () => {
    describe('part1', () => {
        const cases = [
            {
                input: [
                    '.#..#',
                    '.....',
                    '#####',
                    '....#',
                    '...##',
                ],
                expected: { n: 8, pt: { x: 3, y: 4 } }
            },
        ];
        cases.forEach(({ input, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const pts = findAllAsteroids(input);
                const result = calculateBestAsteroid(pts);
                expect(result).toEqual(expected);
            });
        });
    });

    describe('part2', () => {
        const cases = [
            {
                origin: { x: 8, y: 3 },
                input: [
                    '.#....#####...#..',
                    '##...##.#####..##',
                    '##...#...#.#####.',
                    '..#.....X...###..',
                    '..#.#.....#....##',
                ],
                blasts: 1,
                expected: 801
            },
            {
                origin: { x: 8, y: 3 },
                input: [
                    '.#....#####...#..',
                    '##...##.#####..##',
                    '##...#...#.#####.',
                    '..#.....X...###..',
                    '..#.#.....#....##',
                ],
                blasts: 2,
                expected: 900
            },
        ];
        cases.forEach(({ origin, input, blasts, expected }, i) => {
            it(`case ${i + 1}`, () => {
                const pts = findAllAsteroids(input);
                const { x, y } = whichIsNthAsteroid(pts, origin, blasts);
                const result = x * 100 + y;
                expect(result).toEqual(expected);
            });
        });
    });
});
