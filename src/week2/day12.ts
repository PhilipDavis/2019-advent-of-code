import fs from 'fs';
import path from 'path';
import { uniq, flatten } from 'lodash';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day12.data'))
        .toString()
        .split(',')
        .map(s => parseInt(s, 10))
;

type Moon = {
    x: number;
    y: number;
    z: number;
    dx: number;
    dy: number;
    dz: number;
};

export function applyGravity(moons: readonly Moon[]): Moon[] {
    // Deep clone
    const newMoons = moons.map(moon => ({ ...moon }));

    for (let i = 0; i < moons.length - 1; i++) {
        for (let j = i + 1; j < moons.length; j++) {
            if (moons[i].x < moons[j].x) {
                newMoons[i].dx++;
                newMoons[j].dx--;
            }
            else if (moons[i].x > moons[j].x) {
                newMoons[i].dx--;
                newMoons[j].dx++;
            }

            if (moons[i].y < moons[j].y) {
                newMoons[i].dy++;
                newMoons[j].dy--;
            }
            else if (moons[i].y > moons[j].y) {
                newMoons[i].dy--;
                newMoons[j].dy++;
            }

            if (moons[i].z < moons[j].z) {
                newMoons[i].dz++;
                newMoons[j].dz--;
            }
            else if (moons[i].z > moons[j].z) {
                newMoons[i].dz--;
                newMoons[j].dz++;
            }
        }
    }
    return newMoons;
}

export function applyVelocity(moons: readonly Moon[]): Moon[] {
    return moons.map(({ x, y, z, dx, dy, dz }) => ({
        x: x + dx,
        y: y + dy,
        z: z + dz,
        dx,
        dy,
        dz,
    }));
}

export function calculateMoonEnergy({ x, y, z, dx, dy, dz }: Moon): number {
    const potential = Math.abs(x) + Math.abs(y) + Math.abs(z);
    const kinetic = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
    return potential * kinetic;
}

export function calculateTotalEnergy(moons: Moon[]): number {
    return moons.reduce((sum, moon) => sum + calculateMoonEnergy(moon), 0);  
}

export function simulate1000Steps(moons: Moon[]): number {
    for (let steps = 0; steps < 1000; steps++) {
        moons = applyGravity(moons);
        moons = applyVelocity(moons);
    }
    return calculateTotalEnergy(moons);
}

export function simulateNStepsToFindPatterns(moons: Moon[], iterations: number): number {
    const moonsAtStep: number[][] = [];

    for (let steps = 0; steps < iterations; steps++) {
        let x0 = moons[0].x
        let y0 = moons[0].y
        let z0 = moons[0].z
        let dx0 = moons[0].dx
        let dy0 = moons[0].dy
        let dz0 = moons[0].dz
    
        let x1 = moons[1].x
        let y1 = moons[1].y
        let z1 = moons[1].z
        let dx1 = moons[1].dx
        let dy1 = moons[1].dy
        let dz1 = moons[1].dz
    
        let x2 = moons[2].x
        let y2 = moons[2].y
        let z2 = moons[2].z
        let dx2 = moons[2].dx
        let dy2 = moons[2].dy
        let dz2 = moons[2].dz
    
        let x3 = moons[3].x
        let y3 = moons[3].y
        let z3 = moons[3].z
        let dx3 = moons[3].dx
        let dy3 = moons[3].dy
        let dz3 = moons[3].dz

        const bar: number[] = [
            x0, x1, x2, x3,
            y0, y1, y2, y3,
            z0, z1, z2, z3,
            dx0, dx1, dx2, dx3,
            dy0, dy1, dy2, dy3,
            dz0, dz1, dz2, dz3,
        ];
        
        moonsAtStep.push(bar);

        moons = applyGravity(moons);
        moons = applyVelocity(moons);
    }

    let patternLengths: number[] = [];

    // Now look for patterns in each of the 24 dimensions
    for (let i = 0; i < 24; i++) {
        console.log(`Looking for pattern length ${i+1} of 24`);

        let found = false;
        for (let len = 1; len < iterations; len++) {
            let pos = 0;
            let busted = false;
            while (pos < iterations && !found && !busted) {
                for (let q = pos; q < pos + len; q++) {
                    if (q + len >= iterations) {
                        found = true;
                        break;
                    }
                    if (moonsAtStep[q][i] !== moonsAtStep[q + len][i]) {
                        busted = true;
                        break;
                    }
                }
                pos += len;
            }
            if (found) {
                patternLengths.push(len);
                break;
            }
        }
    }

    // Take unique lengths and sort from smallest to largest
    patternLengths = uniq(patternLengths).sort((a, b) => a - b);

    // Remove any lengths that divide evenly into bigger lengths
    patternLengths = patternLengths.filter((l, i) =>
        !patternLengths.slice(i + 1).some(ll => ll % l === 0)
    );
    
    // Find the GCD of all remaining lengths
    let largestPossibleGcd = patternLengths[0];
    for (let i = 2; i < largestPossibleGcd; i++) {
        let isCommon = true;
        for (let p = 0; p < patternLengths.length; p++) {
            if (patternLengths[p] % i !== 0) {
                isCommon = false;
                break;
            }
        }
        if (isCommon) {
            // Reduce all lengths by the common factor
            patternLengths = patternLengths.map(l => l / i);
            largestPossibleGcd = patternLengths[0];
        }
    }

    console.log(`Factors are ${patternLengths.join(', ')}`);
    return patternLengths.reduce((x, factor) => x * factor, 1);
}

export function day12_part1() {
    let moons = [
        { x: -17, y:  9, z: -5, dx: 0, dy: 0, dz: 0 },
        { x:  -1, y:  7, z: 13, dx: 0, dy: 0, dz: 0 },
        { x: -19, y: 12, z:  5, dx: 0, dy: 0, dz: 0 },
        { x:  -6, y: -6, z: -4, dx: 0, dy: 0, dz: 0 },
    ];
    const result = simulate1000Steps(moons);
    console.log(`Day N part 1 result: ${result}`);
}

export function day12_part2() {
    let moons = [
        { x: -17, y:  9, z: -5, dx: 0, dy: 0, dz: 0 },
        { x:  -1, y:  7, z: 13, dx: 0, dy: 0, dz: 0 },
        { x: -19, y: 12, z:  5, dx: 0, dy: 0, dz: 0 },
        { x:  -6, y: -6, z: -4, dx: 0, dy: 0, dz: 0 },
    ];
    const result = simulateNStepsToFindPatterns(moons, 1000000);
    console.log(`Day N part 2 result: ${result}`);
}


day12_part1();
day12_part2();

/*
let testMoons = [
    { x: -1, y: 0, z: 2, dx: 0, dy: 0, dz: 0 },
    { x: 2, y: -10, z: -7, dx: 0, dy: 0, dz: 0 }, 
    { x: 4, y: -8, z: 8, dx: 0, dy: 0, dz: 0 },
    { x: 3, y: 5, z: -1, dx: 0, dy: 0, dz: 0 },
];
console.log(simulateNStepsToFindPatterns(testMoons, 3000));
*/