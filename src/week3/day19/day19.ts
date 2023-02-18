import fs from 'fs';
import path from 'path';

export type Map = {
    [index: string]: string;
};

export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}
const myInput =
    fs.readFileSync(path.resolve(__dirname, './day19.data'))
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


export function foo(input: number[]): number {
    const program = new Stream(input).stream;
    let pullCount = 0;
    console.clear();
    for (let y = 0; y <= 49; y++) {
        let line = '';
        for (let x = 0; x <= 49; x++) {
            const { halted, output } = processStream({ ...program }, [ x, y ], 0, 0);
            line += output ? '#' : '.';
            pullCount += output!;
        }
        console.log(line);
    }
    return pullCount;
}

export function buildBeamMap(input: number[]): number {
    const program = new Stream(input).stream;
    const map: Map = {};

    /*
    // find left of last row
    let x2 = 0;
    let y2 = 9999;
    for (let x = 0; x < 10000; x++) {
        const { output } = processStream({ ...program }, [ x, 9999 ], 0, 0);
        if (output === 1) {
            x2 = x;
            break;
        }
    }

    // find right of last row
    let x3 = 0;
    let y3 = 9999;
    for (let x = 9999; x > 0; x--) {
        const { output } = processStream({ ...program }, [ x, 9999 ], 0, 0);
        if (output === 1) {
            x3 = x;
            break;
        }
    }
    */
   let x2 = 3507;
   let y2 = 9999;
   let x3 = 4873;
   let y3 = 9999;

   let delta = x3 - x2;

    console.log(`x2 = ${x2}`);
    console.log(`x3 = ${x3}`);
    console.log(`width at bottom = ${delta}`);
    // Calculate the angle between (x2,y2) and (x3,y3)
    // Then guess where the square would fit and start searching from there

    let c = Math.sqrt((x2 * x2) + (y2 * y2));
    let b = delta;
    let a = Math.sqrt((x3 * x3) + (y3 * y3));
    let A = Math.acos((a * a - b * b - c * c) / (-2 * b * c));
    let B = Math.acos((b * b - a * a - c * c) / (-2 * a * c));
    let C = Math.PI - A  - B;
    console.log(`A is ${A}`);
    console.log(`B is ${B}`);
    console.log(`C is ${C}`);

    let bPrime = 100;
    let aPrime = bPrime * Math.sin(A) / Math.sin(B);
    let cPrime = bPrime * Math.sin(C) / Math.sin(B);
    console.log(`a' is ${aPrime}`);
    console.log(`b' is ${bPrime}`);
    console.log(`c' is ${cPrime}`);

    let startingY = Math.floor(cPrime * Math.sin(Math.PI - A));
    console.log(`Starting at y = ${startingY}`);

    let startingX = Math.floor(cPrime * Math.cos(Math.PI - A));
    console.log(`Starting at x = ${startingX}`);

    startingY = 950;
    startingX = 370;

    for (let y = startingY; y <= startingY + 800; y++) {
        for (let x = startingX; x <= startingX + 800; x++) {
            const { output } = processStream({ ...program }, [ x, y ], 0, 0);
            const index = makeIndex(x, y);
            if (output) {
                map[index] = '#'

                const index2 = makeIndex(x, y - 99);
                const index3 = makeIndex(x - 99, y);
                const index4 = makeIndex(x - 99, y - 99);
                if (map[index2] === '#' && map[index3] === '#' && map[index4] === '#') {
                    return (x - 99) * 10000 + (y - 99);
                }
            }
        }

        console.log(`line ${y}`);
    }
    return -1;
}

export function day19_part1() {
    const result = foo(myInput);
    console.log(`Day 19 part 1 result: ${result}`);
}

export function day19_part2() {
    const result = buildBeamMap(myInput);
    console.log(`Day 19 part 2 result: ${result}`);
}


//day19_part1();
day19_part2();
