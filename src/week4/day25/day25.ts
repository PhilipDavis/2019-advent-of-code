import fs from 'fs';
import path from 'path';


export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}
const myInput =
    fs.readFileSync(path.resolve(__dirname, './day25.data'))
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
        if (inputs.length === 0) {
            //throw new Error('Not enough inputs!');
            return {
                halted: false,
                ip,
                relBase,
            };
        }
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

type Direction = 'east' | 'west' | 'north' | 'south';
type MapCell = {
    label: string;
    description: string;
    canGo: { [direction: string]: boolean };
    hasGone: { [direction: string]: boolean };
    items: string[];
    output: string[];
};
type Map = {
    [index: string]: MapCell;
};

export function exploreMap(program: number[]): Map {
    const queue: Direction[][] = [];
    const map: Map = {};
    queue.push([]);
    while (queue.length > 0) {
        const path = queue.shift()!;
        const output = explorePath(program, map, [ ...path ], true);
        for (let direction of output.toExplore) {
            queue.push([ ...path, direction ]);
        }
    }
    return map;
}

export function tryCommands(program: number[], commands: string[]): Map {
    const map: Map = {};
    const inventory = commands.map(cmd => /take (.*)$/.exec(cmd)).filter(m => !!m).map(m => m![1]);
    const computer = new Stream(program).stream;
    const { ip, relBase } = explorePath(computer, map, commands, false);

    for (let i = 0; i < Math.pow(2, inventory.length); i++) {
        console.log(`attempt ${i}`);
        const computerClone = { ...computer };
        const dropCommands: string[] = [];
        let j = i;
        let k = 0;
        while (j > 0) {
            if (j % 2) {
                dropCommands.push(`drop ${inventory[k]}`);
                j--;
            }
            j /= 2;
            k++;
        }
        dropCommands.push('inv');
        dropCommands.push('north'); // attempt to cross the security checkpoint
        const { inRoom } = explorePath(computerClone, map, dropCommands, true, ip, relBase);
        if (inRoom !== 'Security Checkpoint') {
            break;
        }
    }

    return map;
}

export function explorePath(computer: Program, map: Map, commands: string[], showOutput: boolean, lastIp: number = 0, lastRelBase: number = 0): { ip: number, relBase: number, toExplore: Direction[], inRoom: string }{
    let programOutput = '';
    const inputs: number[] = [];

    function enqueueCommand(command: string): void {
        if (showOutput) {
            console.log(command);
        }
        inputs.push(...command.split('').map(c => c.charCodeAt(0)));
        inputs.push(10);
    }

    let isReadingDirections = false;
    let isReadingItems = false;
    let isReadingDescription = false;
    let index = '';

    while (true) {
        const { halted, output, ip, relBase } = processStream(computer, inputs, lastIp, lastRelBase);
        if (halted) {
            break;
        }
        lastIp = ip;
        lastRelBase = relBase;

        if (!map[index]) {
            map[index] = { label: '', canGo: {}, hasGone: {}, items: [], description: '', output: [] };
        }

        if (output) {
            if (output === 10) {
                if (showOutput) {
                    console.log(programOutput);
                }
                if (programOutput) {
                    map[index].output.push(programOutput);
                }

                if (programOutput === 'Command?') {
                    if (commands.length === 0) {
                        break;
                    }
                    const command = commands.shift()!;
                    if (command === 'east' || command === 'west' || command === 'north' || command === 'south') {
                        map[index].hasGone[command] = true;
                        index = '';
                    }
                    enqueueCommand(command);
                }
                else if (/^== (.*?) ==$/.test(programOutput)) {
                    index = /^== (.*?) ==$/.exec(programOutput)![1];
                    if (!map[index]) {
                        map[index] = map[''];
                        map[index].label = index;
                    }
                    delete map[''];
                    isReadingDescription = true;
                }
                else if (isReadingDescription) {
                    if (map[index].description && map[index].description !== programOutput) {
                        console.log(`Room description changed: ${programOutput}`);
                    }
                    map[index].description = programOutput;
                    isReadingDescription = false;
                }
                else if (programOutput === 'Doors here lead:') {
                    isReadingDirections = true;
                    map[index].canGo = {};
                }
                else if (isReadingDirections) {
                    const match = /- (.*)$/.exec(programOutput);
                    if (match) {
                        const [ , direction ] = match;
                        map[index].canGo[direction] = true;
                    }
                    else {
                        isReadingDirections = false;
                    }
                }
                else if (programOutput === 'Items here:') {
                    isReadingItems = true;
                    map[index].items = [];
                }
                else if (isReadingItems) {
                    const match = /- (.*)$/.exec(programOutput);
                    if (match) {
                        const [ , item ] = match;
                        map[index].items.push(item);
                    }
                    else {
                        isReadingItems = false;
                    }
                }
                programOutput = '';
            }
            else if (output < 127) {
                programOutput += String.fromCharCode(output);
            }
        }
        else {
            enqueueCommand(commands.shift()!);
        }
    }

    return {
        ip: lastIp,
        relBase: lastRelBase,
        toExplore:
            (Object.keys(map[index].canGo) as Direction[])
                .filter(direction => !map[index].hasGone[direction]),
        inRoom: index,
    };
}


export function day25_part1() {
    // The base path picks up all objects and arrives at the security checkpoint
    const basePath = [
        'east',
        'east',
        'south',
        'take monolith',
        'north',
        'east',
        'take shell',
        'west',
        'west',
        'north',
        'west',
        'take bowl of rice',
        'east',
        'north',
        'take planetoid',
        'west',
        'take ornament',
        'south',
        'south',
        'take fuel cell',
        'north',
        'north',
        'east',
        'east',
        'take cake',
        'south',
        'west',
        'north',
        'take astrolabe',
        'west',
    ];
    
    const map2 = tryCommands(myInput, basePath);
//    const result = foo(myInput);
    const result = 0;
    console.log(`Day 25 part 1 result: ${result}`);
}

export function day25_part2() {
    const result = 0;
    console.log(`Day 25 part 2 result: ${result}`);
}


day25_part1();
day25_part2();


//const map = exploreMap(myInput);
//console.log('');
