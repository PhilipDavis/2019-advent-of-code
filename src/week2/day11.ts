import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day11.data'))
        .toString()
        .split(',')
        .filter(s => !!s)
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n))
;

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

export function robot(program: Program, startColor: number) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1; // up
    const panels: { [pos: string]: number } = {};
    if (startColor === 1) {
        panels[`${x}x${y}`] = startColor;
    }
    let lastIp = 0;
    let lastRelBase = 0;

    let outputIndex = 0;
    while (true) {
        // input is the colour of the current panel
        const inputs = [ panels[`${x}x${y}`] || 0 ];
        
        const { halted, ip, relBase, output } = processStream(program, inputs, lastIp, lastRelBase);
        if (halted) break;
        lastIp = ip;
        lastRelBase = relBase;

        if (outputIndex % 2 === 0) {
            panels[`${x}x${y}`] = output!;
        }
        else {
            if (output === 0) { // counterclockwise
                const temp = dx;
                dx = dy;
                dy = -temp;
            }
            else if (output === 1) { // clockwise
                const temp = dy;
                dy = dx;
                dx = -temp;
            }
            else {
                throw new Error('unexpected direction command');
            }
            x += dx;
            y += dy;
        }
        outputIndex++;
    }
    return {
        painted: Object.keys(panels).length,
        panels,
    };
}

export function drawPanels(panels: { [pos: string]: number }) {
    const points =
        Object.keys(panels)
            .filter(pos => panels[pos] === 1)
            .map(s => /^(-?\d+)x(-?\d+)$/.exec(s)!)
            .map(([ , x, y ]) => ({
                x: parseInt(x, 10),
                y: parseInt(y, 10)
            }));

    const minY =
        points.reduce((min, pt) => Math.min(min, pt.y), Number.MAX_SAFE_INTEGER);

    points.forEach(pt => pt.y -= minY);

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
            s += '#';
            cx = line[0] + 1;
            line.shift();
        }
        console.log(s);
    }
}


export function day11_part1() {
    const { painted } = robot(new Stream(myInput).stream, 0);
    const result = painted;
    console.log(`Day 11 part 1 result: ${result}`);
}

export function day11_part2() {
    const { panels } = robot(new Stream(myInput).stream, 1);
    console.log(`Day 11 part 2 result: `);
    drawPanels(panels);
}


day11_part1();
day11_part2();
