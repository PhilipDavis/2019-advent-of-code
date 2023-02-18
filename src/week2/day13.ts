import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day13.data'))
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

export function arcade(program: Program) {
    let x = 0;
    let tempx = 0;
    let y = 0;
    let tempy = 0;
    let id = 0;
    let score = 0;

    let joystick = 0;

    let blocks = 0;

    let lastIp = 0;
    let lastRelBase = 0;

    let outputIndex = 0;
    while (true) {
        // input is the colour of the current panel
        const inputs: number[] = [ joystick ];
        
        const { halted, ip, relBase, output } = processStream(program, inputs, lastIp, lastRelBase);
        if (halted) break;
        lastIp = ip;
        lastRelBase = relBase;

        if (outputIndex % 3 === 0) {
            tempx = output!;
        }
        else if (outputIndex %3 === 1) {
            tempy = output!;
        }
        else if (tempx === -1 && tempy === 0) {
            score = output!;
        }
        else {
            id = output!;
            if (id === 2) {
                blocks++;
            }
        }
        outputIndex++;
    }
    return blocks;
}


export function arcade2(program: Program) {
    let x = 0;
    let tempx = 0;
    let y = 0;
    let tempy = 0;
    let id = 0;
    let score = 0;

    const display: number[][] = [];

    let joystick = -1;

    while (true) {
        let outputIndex = 0;
        let blocks = 0;
        myInput[0] = 2; // two quarters

        let lastIp = 0;
        let lastRelBase = 0;
    
        while (true) {
            // input is the colour of the current panel
            const inputs: number[] = [ joystick ];
            
            const { halted, ip, relBase, output } = processStream(program, inputs, lastIp, lastRelBase);
            if (halted) break;
            lastIp = ip;
            lastRelBase = relBase;

            if (outputIndex % 3 === 0) {
                tempx = output!;
            }
            else if (outputIndex %3 === 1) {
                tempy = output!;
            }
            else if (tempx === -1 && tempy === 0) {
                score = output!;
            }
            else {
                x = tempx;
                y = tempy;
                id = output!;
                if (id === 2) {
                    blocks++;
                }

                if (!display[y]) {
                    display[y] = [];
                }
                display[y][x] = id;
            }
            outputIndex++;
        }
        //draw(display);

        console.log(`${blocks} blocks; ${score} score`);
        if (blocks < 1) return score;
    }
}

export function draw(input: number[][]) {
    console.clear();
    for (let y = 0; y < input.length; y++) {
        let line = '';
        for (let x = 0; x < input[y].length; x++) {
            switch (input[y][x]) {
                case 0: line += ' '; break;
                case 1: line += 'W'; break;
                case 2: line += '#'; break;
                case 3: line += '='; break;
                case 4: line += 'o'; break;
            }
        }
        console.log(line);
    }
    return 0;
}

export function day13_part1() {
    const result = arcade(myInput);
    console.log(`Day N part 1 result: ${result}`);
}

export function day13_part2() {
    myInput[0] = 2; // two quarters
    const result = arcade2(myInput);

    console.log(`Day N part 2 result: ${result}`);
}


//day13_part1();
day13_part2();
