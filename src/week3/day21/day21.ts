import fs from 'fs';
import path from 'path';

export type Map = {
    [index: string]: string;
};

export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}
const myInput =
    fs.readFileSync(path.resolve(__dirname, './day21.data'))
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


export function walkRobot(input: number[]): number {
    const program = new Stream(input).stream;
    let T = false;
    let J = false;
    let lastIp = 0;
    let lastRelBase = 0;

    // if D and C then 
    const inputs = [
        'NOT T J',
        'AND A J', 
        'AND B J',
        'AND C J',
        'AND D J',
        'NOT J T',

        'NOT A J', // Jump if A is a hole
        'OR D J', // jump if D is solid
        'AND T J',  // Unless they're all solid
        'WALK',
    ].map(s => ([ ...s.split(''), '\n' ])).reduce((array, cs) => ([ ...array, ...cs ]), []).map(c => c.charCodeAt(0));

    let prompt = '';
    while (true) {
        const { output, halted, ip, relBase } = processStream(program, inputs, lastIp, lastRelBase);
        if (halted) {
            prompt += String.fromCharCode(output!);
            return output!;
        }
        lastIp = ip;
        lastRelBase = relBase;
        if (output === 10) {
            console.log(prompt);
            prompt = '';
        }
        else if (output! < 255) {
            prompt += String.fromCharCode(output!);
        }
        else console.log(output);
    }
    return 0;
}

export function runRobot(input: number[]): number {
    const program = new Stream(input).stream;
    let T = false;
    let J = false;
    let lastIp = 0;
    let lastRelBase = 0;

    const inputs = [

        /*
        // C is a hole and D is solid
        'NOT C T',
        'AND D T',
        'OR T J',
*/

        // Always jump if CEF is a hole
        'OR C T',
        'OR E T',
        'OR F T',
        'NOT T J',

        // Always jump if BE is a hole
        'NOT B T',
        'AND E T',
        'OR T J',

        // B is a hole and D is solid
        'NOT B T',
        'AND D T',
        'OR T J',
/*
        // NOT jump if E and H are holes
        'NOT J T',
        'OR E T',
        'OR H T',
        'NOT T J',
*/        
        // DON'T jump if ABCD are all solid (no point)





        
        // NOT jump if D is a hole
        'AND D J',

        // jump if A is a hole
        'NOT A T',
        'OR T J',

        'RUN',
    ].map(s => ([ ...s.split(''), '\n' ])).reduce((array, cs) => ([ ...array, ...cs ]), []).map(c => c.charCodeAt(0));

    let prompt = '';
    while (true) {
        const { output, halted, ip, relBase } = processStream(program, inputs, lastIp, lastRelBase);
        if (halted) {
            break;
        }
        lastIp = ip;
        lastRelBase = relBase;
        if (output === 10) {
            console.log(prompt);
            prompt = '';
        }
        else if (output! < 255) {
            prompt += String.fromCharCode(output!);
        }
        else {
            return output!;
        }
    }
    return -1;
}

export function day21_part1() {
    const result = walkRobot(myInput);
    console.log(`Day 21 part 1 result: ${result}`);
}

export function day21_part2() {
    const result = runRobot(myInput);
    console.log(`Day 21 part 2 result: ${result}`);
}


//day21_part1();
day21_part2();
