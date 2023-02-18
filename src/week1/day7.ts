import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day7.data'))
        .toString()
        .split(',')
        .map(s => parseInt(s, 10))
;

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

export const processStream = (stream: number[], inputs: number[], ip: number = 0, fnOutput?: (o: number) => void) => {
    let inputIndex = 0;
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
                if (inputs.length === 0) throw new Error('Not enough inputs!');
                save_input(stream, ip, modes, inputs.shift()!);
                ip += 2;
                break;
            case 4:
                const output = load_output(stream, ip, modes);
                if (typeof fnOutput === 'function') {
                    fnOutput(output);
                }
                ip += 2;
                return {
                    stream,
                    output,
                    ip,
                    halted: false,
                };
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
                return {
                    stream,
                    ip,
                    halted: true,
                };
            default:
                console.log(`Unexpected opcode: ${opcode}`);
                throw new Error('Unexpected opcode');
        }
    }
};

export function generatePhasePermutations(): number[][] {
    const phases = [];
    for (let a = 0; a < 5; a++) {
        for (let b = 0; b < 5; b++) {
            for (let c = 0; c < 5; c++) {
                for (let d = 0; d < 5; d++) {
                    for (let e = 0; e < 5; e++) {
                        if (a === b || a === c || a === d || a === e ||
                            b === c || b === d || b === e ||
                            c === d || c === e ||
                            d === e)
                            continue;
                        phases.push([ a, b, c, d, e ]);
                    }
                }
            }
        }
    }
    return phases;
}

export function generateFeedbackPhasePermutations(): number[][] {
    const phases = [];
    for (let a = 0; a < 5; a++) {
        for (let b = 0; b < 5; b++) {
            for (let c = 0; c < 5; c++) {
                for (let d = 0; d < 5; d++) {
                    for (let e = 0; e < 5; e++) {
                        if (a === b || a === c || a === d || a === e ||
                            b === c || b === d || b === e ||
                            c === d || c === e ||
                            d === e)
                            continue;
                        phases.push([ a + 5, b + 5, c + 5, d + 5, e + 5 ]);
                    }
                }
            }
        }
    }
    return phases;
}

export function calculateMaxPhaseSettings(input: number[]) {
    const phases = generatePhasePermutations();

    let maxValue = 0;
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        let previousOutput = 0;
        for (let j = 0; j < 5; j++) {
            processStream([ ...input ], [ phase[j], previousOutput ], 0, output => {
                previousOutput = output;
            });
        }
        if (previousOutput > maxValue) {
            maxValue = previousOutput;
        }
    }

    return maxValue;
}

export function calculateMaxPhaseSettingsWithFeedback(input: number[]) {
    const phases = generateFeedbackPhasePermutations();

    let maxValue = 0;
    for (let i = 0; i < phases.length; i++) {
        const amplifiers = [
            [ ...input ],
            [ ...input ],
            [ ...input ],
            [ ...input ],
            [ ...input ],
        ];
        const instructionPointers = [ 0, 0, 0, 0, 0 ];
        const phase = phases[i];
        const nextInputs = [
            [ phase[0], 0 ],
            [ phase[1] ],
            [ phase[2] ],
            [ phase[3] ],
            [ phase[4] ],
        ];
        let j = 0;
        while (true) {
            const { ip, output, halted } = processStream(amplifiers[j % 5], nextInputs[j % 5], instructionPointers[j % 5]);
            instructionPointers[j % 5] = ip;
            if (halted && j % 5 === 4) {
                if (nextInputs[0][0] > maxValue) {
                    maxValue = nextInputs[0][0];
                }
                break;
            }
            else {
                nextInputs[(j + 1) % 5].push(output!);
            }
            j++;
        }
    }

    return maxValue;
}

function day7_part1() {
    const result = calculateMaxPhaseSettings(myInput);
    console.log(`Day 7 part 1 result: ${result}`);
}

function day7_part2() {
    const result = calculateMaxPhaseSettingsWithFeedback(myInput);
    console.log(`Day 7 part 2 result: ${result}`);
}


day7_part1();
day7_part2();
