import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day15.data'))
        .toString()
        .split(',')
        .filter(s => !!s)
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n))
;

// Helper function to turn a graphical representation of a map into data
// e.g. for loading a small test case
function parseMap(lines: string[]) {
    const map: Map = {};
    let xOxygen = 0;
    let yOxygen = 0;

    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            if (lines[y][x] !== ' ') {
                const index = makeIndex(x, y);
                map[index] = lines[y][x];
                if (lines[y][x] === 'O') {
                    xOxygen = x;
                    yOxygen = y;
                }
            }
        }
    }

    return {
        map,
        x: xOxygen,
        y: yOxygen,
    };
}

type Program = {
    [index: number]: number;
};

export class Stream {
    public stream: {
        [index: number]: number;
    };

    constructor(input: string | number[]) {
        if (typeof input === 'string') {
            input = input.split(',').map(s => parseInt(s, 10));
        }

        this.stream = input.reduce((obj, n, i) => {
            obj[i] = n;
            return obj;
        }, {} as any);
    }
}

function getFrom(input: Program, offset: number, relBase: number, mode: number): number {
    const value = input[offset];
    if (mode === 0) {
        if (value < 0) {
            throw new Error(`Invalid address: ${value}`);
        }
        return input[value];
    }
    else if (mode === 1) {
        return value;
    }
    else if (mode === 2) {
        if (value + relBase < 0) {
            throw new Error(`Invalid read address: ${value + relBase}`);
        }
        return input[value + relBase] || 0;
    }
    throw new Error(`invalid read mode: ${mode}`);
}

function writeTo(input: Program, offset: number, relBase: number, mode: number, value: number) {
    const to = input[offset]
    if (mode === 0) {
        if (to < 0) {
            throw new Error(`Invalid write address: ${to}`);
        }
        input[to] = value;
    }
    else if (mode === 2) {
        if (to + relBase < 0) {
            throw new Error(`Invalid write address: ${to + relBase}`);
        }
        input[to + relBase] = value;
    }
    else {
        throw new Error(`invalid write mode: ${mode}`);
    }
}

export const add = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const from1 = getFrom(input, ip + 1, relBase, modes[0]);
    const from2 = getFrom(input, ip + 2, relBase, modes[1]);
    writeTo(input, ip + 3, relBase, modes[2], from1 + from2);
};

export const multiply = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const from1 = getFrom(input, ip + 1, relBase, modes[0]);
    const from2 = getFrom(input, ip + 2, relBase, modes[1]);
    writeTo(input, ip + 3, relBase, modes[2], from1 * from2);
};

export const save_input = (input: Program, ip: number, relBase: number, modes: number[], value: number) => {
    writeTo(input, ip + 1, relBase, modes[0], value);
};

export const load_output = (input: Program, ip: number, relBase: number, modes: number[]) => {
    return getFrom(input, ip + 1, relBase, modes[0]);
};

export const jumpIfTrue = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const value = getFrom(input, ip + 1, relBase, modes[0]);
    if (value !== 0) {
        return getFrom(input, ip + 2, relBase, modes[1]);
    }
    return ip + 3;
};

export const jumpIfFalse = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const value = getFrom(input, ip + 1, relBase, modes[0]);
    if (value === 0) {
        return getFrom(input, ip + 2, relBase, modes[1]);
    }
    return ip + 3;
};

export const lessThan = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const first = getFrom(input, ip + 1, relBase, modes[0]);
    const second = getFrom(input, ip + 2, relBase, modes[1]);
    writeTo(input, ip + 3, relBase, modes[2], first < second ? 1 : 0);
};

export const equals = (input: Program, ip: number, relBase: number, modes: number[]) => {
    const first = getFrom(input, ip + 1, relBase, modes[0]);
    const second = getFrom(input, ip + 2, relBase, modes[1]);
    writeTo(input, ip + 3, relBase, modes[2], first === second ? 1 : 0);
};

export const adjustRelBase = (input: Program, ip: number, relBase: number, modes: number[]): number => {
    const value = getFrom(input, ip + 1, relBase, modes[0]);
    return value + relBase;
}

function parseLeadValue(value: number) {
    const opcode = value % 100;
    const modes = [ 0, 0, 0 ];
    let m = Math.floor(value / 100);
    for (let i = 0; i < 3; i++) {
        modes[i] = m % 10;
        m = Math.floor(m / 10);
    }
    return {
        opcode,
        modes,
    };
}

export const processStream = (stream: Program, inputs: number[], ip: number = 0, relBase: number = 0, fnOutput?: (o: number) => void) => {
    while (true) {
        let { opcode, modes } = parseLeadValue(stream[ip]);
        switch (opcode) {
            case 1:
                add(stream, ip, relBase, modes);
                ip += 4;
                break;
            case 2:
                multiply(stream, ip, relBase, modes);
                ip += 4;
                break;
            case 3:
                if (inputs.length === 0) throw new Error('Not enough inputs!');
                save_input(stream, ip, relBase, modes, inputs.shift()!);
                ip += 2;
                break;
            case 4:
                const output = load_output(stream, ip, relBase, modes);
                if (typeof fnOutput === 'function') {
                    fnOutput(output);
                }
                ip += 2;
                return {
                    stream,
                    output,
                    ip,
                    relBase,
                    halted: false,
                };
            case 5:
                ip = jumpIfTrue(stream, ip, relBase, modes);
                break;
            case 6:
                ip = jumpIfFalse(stream, ip, relBase, modes);
                break;
            case 7:
                lessThan(stream, ip, relBase, modes);
                ip += 4;
                break;
            case 8:
                equals(stream, ip, relBase, modes);
                ip += 4;
                break;
            case 9:
                relBase = adjustRelBase(stream, ip, relBase, modes);
                ip += 2;
                break;
            case 99:
                return {
                    stream,
                    ip,
                    relBase,
                    halted: true,
                };
            default:
                console.log(`Unexpected opcode: ${opcode}`);
                throw new Error('Unexpected opcode');
        }
    }
};



type Direction = 1 | 2 | 3 | 4;
const North: Direction = 1;
const South: Direction = 2;
const West: Direction = 3;
const East: Direction = 4;

export type Map = {
    [index: string]: string;
};
type Path = Direction[];

export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}

export function fillPathDestination(stream: Program, path: Path, origin: { x: number; y: number } = { x: 0, y: 0 }) {
    let pathIndex = 0;
    let x = origin.x;
    let y = origin.y;

    function updatePosition(direction: number): void {
        const row =
            direction === North
                ? y - 1
                : direction === South
                    ? y + 1
                    : y;

        const col =
            direction === West
                ? x - 1
                : direction === East
                    ? x + 1
                    : x;

        y = row;
        x = col;
    }

    let lastIp = 0;
    let lastRelBase = 0;
    let foundOxygen = false;
    let foundSpace = false;
    let hitWall = false;
    while (pathIndex < path.length) {
        const direction = path[pathIndex++];

        const { halted, ip, relBase, output } = processStream(stream, [ direction ], lastIp, lastRelBase);
        if (halted) {
            break;
        }
        switch (output) {
            case 0: // wall
                updatePosition(direction);
                foundSpace = false;
                hitWall = true;
                break;
            case 1: //moved one step
                updatePosition(direction);
                foundSpace = true;
                break;
            case 2: // moved one step and reached O2
                updatePosition(direction);
                foundSpace = false;
                foundOxygen = true;
                break;
            default:
                throw new Error('unexpected output');
        }
        lastIp = ip;
        lastRelBase = relBase;
    }    
    return {
        x,
        y,
        lastIp,
        lastRelBase,
        foundOxygen,
        foundSpace,
        hitWall,
    };
}

export function floodFillSearch(program: number[], map: Map, draw: boolean) {
    const stream = new Stream(program).stream;
    const ptQueue: { x: number, y: number, path: Path }[] = [];

    let index = makeIndex(0, 0);
    map[index] = '.';
    ptQueue.push({ x: 0, y: 0, path: [ North ] });
    ptQueue.push({ x: 0, y: 0, path: [ South ] });
    ptQueue.push({ x: 0, y: 0, path: [ West ] });
    ptQueue.push({ x: 0, y: 0, path: [ East ] });

    let xOxygen = 0;
    let yOxygen = 0;
    let distanceToOxygen = 0;

    let curIndex = 0;
    while (curIndex < ptQueue.length) {
        const { path } = ptQueue[curIndex++];

        // Process the current point

        const { foundOxygen, hitWall, x, y } = fillPathDestination({ ...stream }, path);
        index = makeIndex(x, y);
        if (foundOxygen) {
            map[index] = 'O'
        }
        else if (hitWall) {
            map[index] = '#'
        }
        else {
            map[index] = '.';
        }

        if (draw) {
            console.clear();
            drawPanels(map);
        }

        if (foundOxygen) {
            xOxygen = x;
            yOxygen = y;
            distanceToOxygen = path.length;
        }
        if (hitWall) continue;

        // Queue further directions out from the current point

        index = makeIndex(x, y - 1);
        if (!map[index]) {
            ptQueue.push({ x, y: y - 1, path: [ ...path, North ] });
        }
        
        index = makeIndex(x, y + 1);
        if (!map[index]) {
            ptQueue.push({ x, y: y + 1, path: [ ...path, South ] });
        }
        
        index = makeIndex(x - 1, y);
        if (!map[index]) {
            ptQueue.push({ x: x - 1, y, path: [ ...path, West ] });
        }
        
        index = makeIndex(x + 1, y);
        if (!map[index]) {
            ptQueue.push({ x: x + 1, y, path: [ ...path, East ] });
        }
    }
    return {
        x: xOxygen,
        y: yOxygen,
        distanceToOxygen,
    };
}

export function floodFillOxygen(map: Map, origin: { x: number, y: number }, draw: boolean) {
    const ptQueue: { x: number, y: number }[][] = [];

    let index = makeIndex(origin.x, origin.y);
    if (map[index] !== 'O') {
        throw new Error('oops... origin does not have oxygen');
    }
    ptQueue.push([ origin ]);

    let distanceFromOxygen = 0;
    while (ptQueue.length > 0) {
        const pts = ptQueue.shift();
        if (!pts || !pts.length) {
            return distanceFromOxygen;
        }
        distanceFromOxygen++;
        const nextPaths: { x: number, y: number }[] = [];

        // Process each point in this distance from the oxygen
        for (let { x, y } of pts) {
            index = makeIndex(x, y);
            map[index] = 'O';

            // Queue further directions out from the current point

            index = makeIndex(x, y - 1);
            if (map[index] === '.') {
                nextPaths.push({ x, y: y - 1 });
            }
            
            index = makeIndex(x, y + 1);
            if (map[index] === '.') {
                nextPaths.push({ x, y: y + 1 });
            }
            
            index = makeIndex(x - 1, y);
            if (map[index] === '.') {
                nextPaths.push({ x: x - 1, y });
            }
            
            index = makeIndex(x + 1, y);
            if (map[index] === '.') {
                nextPaths.push({ x: x + 1, y });
            }
        }

        // Queue the next distance of paths
        ptQueue.push(nextPaths);

        if (draw) {
            console.clear();
            drawPanels(map);
        }
    }
}

export function drawPanels(panels: { [pos: string]: string }) {
    const points =
        Object.keys(panels)
//            .filter(pos => panels[pos] === 1)
            .map(s => /^(-?\d+)x(-?\d+)$/.exec(s)!)
            .map(([ , x, y ]) => ({
                x: parseInt(x, 10),
                y: parseInt(y, 10)
            }));

    const minY =
        points.reduce((min, pt) => Math.min(min, pt.y), Number.MAX_SAFE_INTEGER);

    const minX =
        points.reduce((min, pt) => Math.min(min, pt.x), Number.MAX_SAFE_INTEGER);

    points.forEach(pt => {
        pt.y -= minY;
        pt.x -= minX;
    });

    const maxY =
        points.reduce((max, pt) => Math.max(max, pt.y), 0);

    for (let y = 0; y <= maxY; y++) {
        const line = points.filter(pt => pt.y === y).map(({ x }) => x).sort((a, b) => a - b);
        if (line.length === 0) {
            console.log();
            continue;
        }
        let cx = 0;
        let s = '';
        while (line.length > 0) {
            for (let x = cx; x < line[0]; x++) {
                s += ' ';
            }
            s += panels[`${line[0] + minX}x${y + minY}`];
            cx = line[0] + 1;
            line.shift();
        }
        console.log(s);
    }
}

export function day15_part1() {
    const map: Map = {};
    const { distanceToOxygen } = floodFillSearch(myInput, map, false)!;
    const result = distanceToOxygen;
    drawPanels(map);
    console.log(`Day 15 part 1 result: ${result}`);
}

export function day15_part2() {
/*
    const testInput = [
        ' ##   ',
        '#..## ',
        '#.#..#',
        '#.O.# ',
        ' ###  ',
        ];
    const { map, x, y } = parseMap(testInput);
*/
    const map: Map = {};
    const { x, y } = floodFillSearch(myInput, map, false)!;

    const result = floodFillOxygen(map, { x, y }, true);
    console.clear();
    drawPanels(map);
    console.log(`Day 15 part 2 result: ${result}`);
}


//day15_part1();
//day15_part2();
