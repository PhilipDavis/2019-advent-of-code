import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day24.data'))
        .toString()
        .split('')
        .filter(s => s === '.' || s === '#')
        .map(c => c === '#' ? 1 as number : 0)
;

export function makeIndex(x: number, y: number): number {
    if (x < 0 || x > 4 || y < 0 || y > 4) return -1;
    return y * 5 + x;
}

export function advanceMap(map: number[]): number[] {
    function getCell(x: number, y: number): number {
        if (x < 0 || x > 4 || y < 0 || y > 4) return 0;
        return map[makeIndex(x, y)];
    }

    function countAdjacent(x: number, y: number): number {
        return getCell(x - 1, y) +
            getCell(x + 1, y) +
            getCell(x, y - 1) +
            getCell(x, y + 1);
    }

    const newMap = [ ...map ];

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const index = makeIndex(x, y);
            const adjacents = countAdjacent(x, y);
            if (map[index] && adjacents !== 1) {
                newMap[index] = 0;
            }
            else if (!map[index] && (adjacents === 1 || adjacents === 2)) {
                newMap[index] = 1;
            }
        }
    }

    return newMap;
}

type LifeMap = {
    up?: LifeMap;
    down?: LifeMap;
    plane: number[];
    depth: number;
};

export function cloneMap(map: LifeMap): LifeMap {
    const originalMap = map;
    const clone: LifeMap = {
        plane: [ ...map.plane ],
        depth: map.depth,
    };
    
    let newMap = clone;
    while (map.up) {
        map = map.up;
        newMap.up = {
            plane: [ ...map.plane ],
            depth: map.depth,
            down: newMap,
        };
        newMap = newMap.up!;
    }

    newMap = clone;
    map = originalMap;
    while (map.down) {
        map = map.down;
        newMap.down = {
            plane: [ ...map.plane ],
            depth: map.depth,
            up: newMap,
        };
        newMap = newMap.down!;
    }

    return clone;
}

function countBugsOnPlane(plane: number[]): number {
    return plane.reduce((total, n, i) => i === 12 ? total : total + n, 0);
}

export function advanceLifeMaps2(map: LifeMap): LifeMap {
    const clone = cloneMap(map)!;
    let newMap = clone;

    // start at the outermost (arbitrarily)
    while (map.up) {
        map = map.up!;
        newMap = newMap.up!;
    }

    // See if a new plane above needs to be created (i.e. spawns new life)
    makeNewPlane(map, 'up');
    makeNewPlane(newMap, 'up');
    advanceLifeMap2(map.up!, newMap.up!);
    if (countBugsOnPlane(newMap.up!.plane) === 0) {
        newMap.up = undefined; // don't need it yet
    }

    // Do the current plane
    advanceLifeMap2(map, newMap);

    // Work our way inwards
    while (map.down) {
        map = map.down!;
        newMap = newMap.down!;
        advanceLifeMap2(map, newMap);
    }

    // See if a new plane above needs to be created (i.e. spawns new life)
    makeNewPlane(map, 'down');
    makeNewPlane(newMap, 'down');
    advanceLifeMap2(map.down!, newMap.down!);
    if (countBugsOnPlane(newMap.down!.plane) === 0) {
        newMap.down = undefined; // don't need it yet
    }

    return clone;
}

function makeNewPlane(map: LifeMap, direction: 'up' | 'down') {
    map[direction] = {
        plane: [ ...new Array(25) ].map(_ => 0),
        depth: direction === 'up' ? map.depth + 1 : map.depth - 1,
        [direction === 'up' ? 'down' : 'up']: map,
        [direction]: undefined,
    };
}

export function advanceLifeMap2(map: LifeMap, newMap: LifeMap): void {
    function getCell(x: number, y: number, bias: 'left' | 'right' | 'above' | 'below'): number {
        if (x < 0) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(1, 2)];
        }
        if (y < 0) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(2, 1)];
        }
        if (x > 4) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(3, 2)];
        }
        if (y > 4) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(2, 3)];
        }
        if (x === 2 && y === 2) {
            if (!map.down) return 0;
            switch (bias) {
                case 'left': return map.down.plane[makeIndex(4, 0)] + map.down.plane[makeIndex(4, 1)] + map.down.plane[makeIndex(4, 2)] + map.down.plane[makeIndex(4, 3)] + map.down.plane[makeIndex(4, 4)];
                case 'right': return map.down.plane[makeIndex(0, 0)] + map.down.plane[makeIndex(0, 1)] + map.down.plane[makeIndex(0, 2)] + map.down.plane[makeIndex(0, 3)] + map.down.plane[makeIndex(0, 4)];
                case 'above': return map.down.plane[makeIndex(0, 4)] + map.down.plane[makeIndex(1, 4)] + map.down.plane[makeIndex(2, 4)] + map.down.plane[makeIndex(3, 4)] + map.down.plane[makeIndex(4, 4)];
                case 'below': return map.down.plane[makeIndex(0, 0)] + map.down.plane[makeIndex(1, 0)] + map.down.plane[makeIndex(2, 0)] + map.down.plane[makeIndex(3, 0)] + map.down.plane[makeIndex(4, 0)];
            }
        }
        return map.plane[makeIndex(x, y)];
    }

    function assignCell(x: number, y: number, value: number) {
        if (x === 2 && y === 2) {
            //if (!newMap.down) {
            //    makeNewPlane(newMap, 'down');
           // }
            //newMap.down!.plane = [ ...new Array(25) ].map(_ => value);
            return;
        }

        newMap.plane[makeIndex(x, y)] = value;

        // TODO: recursion at 2x2...
/*        
        if (x === 2 && y === 2) {
            if (!newMap.up) makeNewPlane(newMap, 'up');
            newMap.up.plane[makeIndex(1, 2)];
        }
        if (y < 0) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(2, 1)];
        }
        if (x > 4) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(3, 2)];
        }
        if (y > 4) {
            if (!map.up) return 0;
            return map.up.plane[makeIndex(2, 3)];
        }
        if (x === 2 && y === 2) {
            if (!map.down) return 0;
            switch (bias) {
                case 'left': return map.down.plane[makeIndex(4, 0)] + map.down.plane[makeIndex(4, 1)] + map.down.plane[makeIndex(4, 2)] + map.down.plane[makeIndex(4, 3)] + map.down.plane[makeIndex(4, 4)];
                case 'right': return map.down.plane[makeIndex(0, 0)] + map.down.plane[makeIndex(5, 1)] + map.down.plane[makeIndex(10, 2)] + map.down.plane[makeIndex(15, 3)] + map.down.plane[makeIndex(20, 4)];
                case 'above': return map.down.plane[makeIndex(0, 4)] + map.down.plane[makeIndex(1, 4)] + map.down.plane[makeIndex(2, 4)] + map.down.plane[makeIndex(3, 4)] + map.down.plane[makeIndex(4, 4)];
                case 'below': return map.down.plane[makeIndex(0, 0)] + map.down.plane[makeIndex(1, 0)] + map.down.plane[makeIndex(2, 0)] + map.down.plane[makeIndex(3, 0)] + map.down.plane[makeIndex(4, 0)];
            }
        }
        return map.plane[makeIndex(x, y)];
        */
    }

    function countAdjacent(x: number, y: number): number {
        return getCell(x - 1, y, 'left') +
            getCell(x + 1, y, 'right') +
            getCell(x, y - 1, 'above') +
            getCell(x, y + 1, 'below');
    }

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (x === 2 && y === 2) continue;
            const index = makeIndex(x, y);
            const adjacents = countAdjacent(x, y);
            if (map.plane[index] && adjacents !== 1) {
                assignCell(x, y, 0);
            }
            else if (!map.plane[index] && (adjacents === 1 || adjacents === 2)) {
                assignCell(x, y, 1);
            }
        }
    }
}

export function calculateBiodiversity(map: number[]): number {
    return map.reduce((score, n, i) => score + (n === 1 ? Math.pow(2, i) : 0), 0);
}

export function foo(map: number[]): number {
    const seen: { [map: string]: boolean } = { [map.join('')]: true };
    while (true) {
        map = advanceMap(map);
        const serialized = map.join('');
        if (seen[serialized]) {
            break;
        }
        seen[serialized] = true;
    }
    return calculateBiodiversity(map);
}

export function countBugs(map: LifeMap): number {
    while (map.up) map = map.up;

    let total = map.plane.reduce((bugs, n, i) => i === 12 ? bugs : bugs + n, 0);

    while (map.down) {
        map = map.down;
        total += map.plane.reduce((bugs, n, i) => i === 12 ? bugs : bugs + n, 0);
    }
    return total;
}

export function countPlanes(map: LifeMap): number {
    while (map.up) map = map.up;

    let planes = 1;
    while (map.down) {
        planes++;
        map = map.down;
    }
    return planes;
}

/*
export function drawLifeMap(map: LifeMap): void {
    while (map.up) map = map.up;

    while (map.down) {
        planes++;
        map = map.down;
    }
    return planes;
}
*/

export function countOfBugsAfterNSteps(input: number[], steps: number): number {
    let map: LifeMap = {
        depth: 0,
        plane: input,
    };
    for (let i = 0; i < steps; i++) {
        map = advanceLifeMaps2(map);
    }
    console.log(`Total planes: ${countPlanes(map)}`);
    return countBugs(map);
}

export function day24_part1() {
    const result = foo(myInput);
    console.log(`Day 24 part 1 result: ${result}`);
}

export function day24_part2() {
    const result = countOfBugsAfterNSteps(myInput, 200);
    console.log(`Day 24 part 2 result: ${result}`);
}


//day24_part1();
day24_part2();
/*
const testInput = [
    '....#',
    '#..#.',
    '#..##',
    '..#..',
    '#....',
]
.join('')
.split('')
.filter(s => s === '.' || s === '#')
.map(c => c === '#' ? 1 as number : 0)

const result = countOfBugsAfterNSteps(testInput, 10);
console.log(result);
*/