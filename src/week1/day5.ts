function getFrom(input: number[], offset: number, mode: number): number {
    const value = input[offset];
    if (mode === 0) {
        return input[value];
    }
    else if (mode === 1) {
        return value;
    }
    throw new Error('invalid mode');
}

export const add = (input: number[], ip: number, modes: number[]): number[] => {
    const from1 = getFrom(input, ip + 1, modes[0]);
    const from2 = getFrom(input, ip + 2, modes[1]);
    const to = input[ip + 3];
    input[to] = from1 + from2;
    return input;
};

export const multiply = (input: number[], ip: number, modes: number[]) => {
    const from1 = getFrom(input, ip + 1, modes[0]);
    const from2 = getFrom(input, ip + 2, modes[1]);
    const to = input[ip + 3];
    input[to] = from1 * from2;
    return input;
};

export const save_input = (stream: number[], ip: number, modes: number[], value: number) => {
    const to = stream[ip + 1];
    stream[to] = value;
};

export const load_output = (input: number[], ip: number, modes: number[]) => {
    return getFrom(input, ip + 1, modes[0]);
};

export const jumpIfTrue = (input: number[], ip: number, modes: number[]) => {
    const value = getFrom(input, ip + 1, modes[0]);
    if (value !== 0) {
        return getFrom(input, ip + 2, modes[1]);
    }
    return ip + 3;
};

export const jumpIfFalse = (input: number[], ip: number, modes: number[]) => {
    const value = getFrom(input, ip + 1, modes[0]);
    if (value === 0) {
        return getFrom(input, ip + 2, modes[1]);
    }
    return ip + 3;
};

export const lessThan = (input: number[], ip: number, modes: number[]) => {
    const first = getFrom(input, ip + 1, modes[0]);
    const second = getFrom(input, ip + 2, modes[1]);
    const to = input[ip + 3];
    input[to] = first < second ? 1 : 0;
};

export const equals = (input: number[], ip: number, modes: number[]) => {
    const first = getFrom(input, ip + 1, modes[0]);
    const second = getFrom(input, ip + 2, modes[1]);
    const to = input[ip + 3];
    input[to] = first === second ? 1 : 0;
};

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

export const processStream = (stream: number[], ID: number, fnOutput: (o: number) => void) => {
    let ip = 0;
    while (true) {
        let { opcode, modes } = parseLeadValue(stream[ip]);
        switch (opcode) {
            case 1:
                add(stream, ip, modes);
                ip += 4;
                break;
            case 2:
                multiply(stream, ip, modes);
                ip += 4;
                break;
            case 3:
                save_input(stream, ip, modes, ID);
                ip += 2;
                break;
            case 4:
                const output = load_output(stream, ip, modes);
                fnOutput(output);
                ip += 2;
                break;
            case 5:
                ip = jumpIfTrue(stream, ip, modes);
                break;
            case 6:
                ip = jumpIfFalse(stream, ip, modes);
                break;
            case 7:
                lessThan(stream, ip, modes);
                ip += 4;
                break;
            case 8:
                equals(stream, ip, modes);
                ip += 4;
                break;
            case 99:
                return stream;
            default:
                console.log(`Unexpected opcode: ${opcode}`);
                return;
        }
    }
};

const testInput = [
    3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99
];

const input = [
    3,225,1,225,6,6,1100,1,238,225,104,0,1101,37,61,225,101,34,121,224,1001,224,-49,224,4,224,102,8,223,223,1001,224,6,224,1,224,223,223,1101,67,29,225,1,14,65,224,101,-124,224,224,4,224,1002,223,8,223,101,5,224,224,1,224,223,223,1102,63,20,225,1102,27,15,225,1102,18,79,224,101,-1422,224,224,4,224,102,8,223,223,1001,224,1,224,1,223,224,223,1102,20,44,225,1001,69,5,224,101,-32,224,224,4,224,1002,223,8,223,101,1,224,224,1,223,224,223,1102,15,10,225,1101,6,70,225,102,86,40,224,101,-2494,224,224,4,224,1002,223,8,223,101,6,224,224,1,223,224,223,1102,25,15,225,1101,40,67,224,1001,224,-107,224,4,224,102,8,223,223,101,1,224,224,1,223,224,223,2,126,95,224,101,-1400,224,224,4,224,1002,223,8,223,1001,224,3,224,1,223,224,223,1002,151,84,224,101,-2100,224,224,4,224,102,8,223,223,101,6,224,224,1,224,223,223,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,108,677,677,224,1002,223,2,223,1006,224,329,101,1,223,223,1107,677,226,224,102,2,223,223,1006,224,344,101,1,223,223,8,677,677,224,1002,223,2,223,1006,224,359,101,1,223,223,1008,677,677,224,1002,223,2,223,1006,224,374,101,1,223,223,7,226,677,224,1002,223,2,223,1006,224,389,1001,223,1,223,1007,677,677,224,1002,223,2,223,1006,224,404,1001,223,1,223,7,677,677,224,1002,223,2,223,1006,224,419,1001,223,1,223,1008,677,226,224,1002,223,2,223,1005,224,434,1001,223,1,223,1107,226,677,224,102,2,223,223,1005,224,449,1001,223,1,223,1008,226,226,224,1002,223,2,223,1006,224,464,1001,223,1,223,1108,677,677,224,102,2,223,223,1006,224,479,101,1,223,223,1108,226,677,224,1002,223,2,223,1006,224,494,1001,223,1,223,107,226,226,224,1002,223,2,223,1006,224,509,1001,223,1,223,8,226,677,224,102,2,223,223,1006,224,524,1001,223,1,223,1007,226,226,224,1002,223,2,223,1006,224,539,1001,223,1,223,107,677,677,224,1002,223,2,223,1006,224,554,1001,223,1,223,1107,226,226,224,102,2,223,223,1005,224,569,101,1,223,223,1108,677,226,224,1002,223,2,223,1006,224,584,1001,223,1,223,1007,677,226,224,1002,223,2,223,1005,224,599,101,1,223,223,107,226,677,224,102,2,223,223,1005,224,614,1001,223,1,223,108,226,226,224,1002,223,2,223,1005,224,629,101,1,223,223,7,677,226,224,102,2,223,223,1005,224,644,101,1,223,223,8,677,226,224,102,2,223,223,1006,224,659,1001,223,1,223,108,677,226,224,102,2,223,223,1005,224,674,1001,223,1,223,4,223,99,226
];

export const day5_part1 = () => {
    const output = processStream([ ...input ], 1, output => {
        console.log(`Output: ${output}`);
    });
};

export const day5_part2 = () => {
    processStream([ ...testInput ], 2, output => {
        console.log(`Test output: ${output}`);
    });

    processStream([ ...input ], 5, output => {
        console.log(`Output: ${output}`);
    });
};

day5_part2();