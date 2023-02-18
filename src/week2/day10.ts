import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day10.data'))
        .toString()
        .split('\r\n')
;

export type Point = {
    x: number;
    y: number;
};

export function findAllAsteroids(input: string[]): Point[] {
    const pts: Point[] = [];
    for (let y = 0; y < input.length; y++) {
        const line = input[y];
        for (let x = 0; x < line.length; x++) {
            if (line[x] === '#') {
                pts.push({ x, y });
            }
        }
    }
    return pts;
}

type Polar = Point & {
    r: number;
    d: number;
};

export function cartesianToPolar(origin: Point, { x, y }: Point): Polar {
    let d = Math.sqrt((origin.x - x) * (origin.x - x) + (origin.y - y) * (origin.y - y));
    let r = Math.atan2(origin.y - y, origin.x - x);
    if (r < 0) {
        r = 2 * Math.PI + r;
    }
    return { x, y, r, d }; // Out of laziness, include the original point so we don't need to convert back
}

export function calculateAsteroidsInSight(input: Point[], index: number): number {
    const origin = input[index];
    const polars = input.map(pt => cartesianToPolar(origin, pt));
    const asteroidsByRadians = [ ...polars ].reduce((obj, { r, d }) => {
        if (d === 0) return obj;
        if (obj[`${r}`]) {
            obj[`${r}`].push(d);
            obj[`${r}`].sort((a: number, b: number) => b - a);
        }
        else {
            obj[`${r}`] = [ d ];
        }
        return obj;
    }, {} as any);

    return Object.keys(asteroidsByRadians).length;
}

export function calculateBestAsteroid(pts: Point[]) {
    let ptMax = { x: 0, y: 0 };
    let nMax = 0;
    for (let i = 0; i < pts.length; i++) {
        const n = calculateAsteroidsInSight(pts, i);
        if (n > nMax) {
            nMax = n;
            ptMax = pts[i];
        }
    }
    return { pt: ptMax, n: nMax };
}

export function whichIsNthAsteroid(pts: Point[], station: Point, n: number): Point {
    const polars = pts.map(pt => cartesianToPolar(station, pt)).filter(p => !!p.d);
    const asteroidsByRadians = [ ...polars ].reduce((obj, pt) => {
        if (pt.d === 0) return obj;
        const index = `${pt.r}`; 
        if (obj[index]) {
            obj[index].push(pt);
            obj[index].sort((a: Polar, b: Polar) => a.d - b.d); // closer ones first
        }
        else {
            obj[index] = [ pt ];
        }
        return obj;
    }, {} as any);

    let blastsRemaining = Math.min(n, pts.length);
    const order = Object.keys(asteroidsByRadians).sort((a, b) => parseFloat(b) - parseFloat(a)); // biggest to smallest
    let i = order.findIndex(r => parseFloat(r) <= Math.PI / 2); // Start facing up and go clockwise
    while (blastsRemaining > 0) {
        const list = asteroidsByRadians[order[i]];
        if (list.length > 0) {
            const { x, y } = list.shift();
            if (--blastsRemaining === 0) {
                return { x, y };
            }
        }
        i = (i - 1 + order.length) % order.length;
    }
    throw new Error('not found');
}

export function day10_part1() {
    const pts = findAllAsteroids(myInput);
    const result = calculateBestAsteroid(pts);
    console.log(`Day 10 part 1 result: ${JSON.stringify(result, null, 2)}`);
}

export function day10_part2() {
    const pts = findAllAsteroids(myInput);
    const station: Point = {
        x: 22,
        y: 25
    };
    const { x, y } = whichIsNthAsteroid(pts, station, 200);
    const result = x * 100 + y;
    console.log(`Day 10 part 2 result: ${result}`);
}


day10_part1();
day10_part2();

