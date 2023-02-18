import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day17.data'))
        .toString()
        .split(',')
        .filter(s => !!s)
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n))
;

/* KILL
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
*/

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



export function countIntersections(input: number[]): number {
    const program = new Stream(input).stream;
    
    let lastIp = 0;
    let lastRelBase = 0;
    let lines: string[] = [];
    let currentLine: string = '';
    let totalAlignment = 0;

    while (true) {
        const { halted, ip, relBase, output } = processStream(program, [], lastIp, lastRelBase);
        if (halted) {
            break;
        }
        if (output === 10) {
            lines.push(currentLine);
            currentLine = '';
        }
        else {
            const c = String.fromCharCode(output!);
            currentLine += c;
            if (c === '#') {
                if (lines.length >= 3) {
                    if (
                        lines[lines.length - 1][currentLine.length - 2] === "#" &&
                        lines[lines.length - 1][currentLine.length - 1] === "#" &&
                        lines[lines.length - 1][currentLine.length - 0] === "#" &&
                        lines[lines.length - 2][currentLine.length - 1] === "#"
                    ) {
                        // found an intersection
                        const alignment = (lines.length - 1) * (currentLine.length - 1);
                        totalAlignment += alignment;
                    }
                }
            }
        }
        lastIp = ip;
        lastRelBase = relBase;
    }

    console.clear();
    for (let l of lines) {
        console.log(l);
    }

    return totalAlignment;
}

export function makeInputCodes(mainFunction: string[], aFunc: (string | number)[], bFunc: (string | number)[], cFunc: (string | number)[], draw: boolean): number[] {
    const mainChars = mainFunction.join(',').split('');
    if (mainChars.length > 20) throw new Error('Main function too long');
    
    const aChars = aFunc.map(x => `${x}`).join(',').split('');
    if (aChars.length > 20) throw new Error('A function too long');

    const bChars = bFunc.map(x => `${x}`).join(',').split('');
    if (bChars.length > 20) throw new Error('B function too long');

    const cChars = cFunc.map(x => `${x}`).join(',').split('');
    if (cChars.length > 20) throw new Error('C function too long');

    const chars = [
        ...mainChars,
        '\n',
        ...aChars,
        '\n',
        ...bFunc.map(x => `${x}`).join(',').split(''),
        '\n',
        ...cFunc.map(x => `${x}`).join(',').split(''),
        '\n',
        draw ? 'y' : 'n',
        '\n',
    ];

    return chars.map(c => c.charCodeAt(0));
}

export function countSpaceDust(stream: number[]): number {
    const program = new Stream(stream).stream;
    program[0] = 2; // Wake up robot

    let lastIp = 0;
    let lastRelBase = 0;
    let lines: string[] = [];
    let currentLine: string = '';

    let totalSpaceDust = 0;

//    const input = makeInputCodes(['A','B','C'], ['L', 1], ['R', 2], [10, 'L'], true);
    const input = makeInputCodes(['A'], [1], ['R', 2], [10, 'L'], true);

    while (true) {
        const { halted, ip, relBase, output } = processStream(program, input, lastIp, lastRelBase);
        if (halted) {
            return output!;
        }
        if (output === 10) {
            lines.push(currentLine);
            currentLine = '';
        }
        else if (output! > 255) {
            totalSpaceDust = output!
            break;
        }

        if (input.length === 0 && output !== 10) {
            // all input was consumed
            totalSpaceDust = output!
            break;
        }
        else if (output !== 10) {
            const c = String.fromCharCode(output!);
            currentLine += c;
        }
        lastIp = ip;
        lastRelBase = relBase;
    }

    //console.clear();
    for (let l of lines) {
        console.log(l);
    }

    return totalSpaceDust;
}

export function day17_part1() {
    const result = countIntersections(myInput);
    console.log(`Day 17 part 1 result: ${result}`);
}

export function day17_part2() {
    const result = countSpaceDust(myInput);
    console.log(`Day 17 part 2 result: ${result}`);
}


//day17_part1();
day17_part2();
