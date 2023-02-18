import fs from 'fs';
import path from 'path';

export type Map = {
    [index: string]: string;
};

export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}
const myInput =
    fs.readFileSync(path.resolve(__dirname, './day23.data'))
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
        //if (inputs.length === 0) throw new Error('Not enough inputs!');
        if (inputs.length === 0) inputs.push(-1);
        save_input(stream, ip, relBase, modes, inputs.shift()!);
        ip += 2;

        return {
            stream,
            ip,
            relBase,
        };
    
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


export function foo(program: number[]): number {
    const computers = [ ...new Array(50) ].map((_, i) => new Stream(program).stream);
    const queues: number[][] = [ ...new Array(50) ].map((_, i) => ([ i ]));
    const ips = [ ...new Array(50) ].map(_ => 0);
    const relBases = [ ...new Array(50) ].map(_ => 0);
    const outputs: number[][] = [ ...new Array(50) ].map(_ => ([]));

    while (true) {
        for (let i = 0; i < computers.length; i++) {
            const { output, ip, relBase } = processStream(computers[i], queues[i], ips[i], relBases[i]);
            if (output) {
                outputs[i].push(output);
            }

            if (outputs[i].length === 3) {
                const dest = outputs[i].shift()!;
                const x = outputs[i].shift()!;
                const y = outputs[i].shift()!;
                if (dest === 255) {
                    return y;
                }
                else {
                    queues[dest].push(x, y);
                }
            }

            ips[i] = ip;
            relBases[i] = relBase;
        }
    }
}

export function foo2(program: number[]): number {
    const computers = [ ...new Array(50) ].map((_, i) => new Stream(program).stream);
    const queues: number[][] = [ ...new Array(50) ].map((_, i) => ([ i ]));
    const ips = [ ...new Array(50) ].map(_ => 0);
    const relBases = [ ...new Array(50) ].map(_ => 0);
    const outputs: number[][] = [ ...new Array(50) ].map(_ => ([]));
    let nat = { x: -1, y: -1 };
    const seenY: { [n: number]: boolean } = {};
    let lastInputAgo = 0;
    let lastOutputAgo = 0;
    let i = 0;
    while (true) {
        i = (i + 1) % computers.length;

        const allInputsEmptyBefore = !queues.some(q => q.length > 0);

        const inputSizeBefore = queues[i].length;
        const { output, ip, relBase } = processStream(computers[i], queues[i], ips[i], relBases[i]);
        if (queues[i].length < inputSizeBefore) {
            lastInputAgo = 0;
        }
        else {
            lastInputAgo++;
        }
        if (output) {
            outputs[i].push(output);
            lastOutputAgo = 0;
        }
        else {
            lastOutputAgo++;
        }

        if (outputs[i].length === 3) {
            const dest = outputs[i].shift()!;
            const x = outputs[i].shift()!;
            const y = outputs[i].shift()!;
            if (dest === 255) {
                nat = { x, y };
            }
            else {
                queues[dest].push(x, y);
            }
        }

        ips[i] = ip;
        relBases[i] = relBase;
        
        /*
        if (!anyInputsBefore &&
            !outputs.some(q => q.length >0)     &&
            !anyOutput
            */
           if (allInputsEmptyBefore && lastInputAgo >= 1000 && lastOutputAgo >= 1000
        ) {
            queues[0].push(nat.x, nat.y);
            if (seenY[nat.y] && nat.y !== -1) {
                return nat.y;
            }
            seenY[nat.y] = true;
        }
    }
}

export function day23_part1() {
    const result = foo(myInput);
    console.log(`Day 23 part 1 result: ${result}`);
}

export function day23_part2() {
    const result = foo2(myInput);
    console.log(`Day 23 part 2 result: ${result}`);
}


//day23_part1();
day23_part2();
