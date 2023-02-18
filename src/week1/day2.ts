export const add = (input: number[], ip: number): number[] => {
    const from1 = input[ip + 1];
    const from2 = input[ip + 2];
    const to = input[ip + 3];
    input[to] = input[from1] + input[from2];
    return input;
};

export const multiply = (input: number[], ip: number) => {
    const from1 = input[ip + 1];
    const from2 = input[ip + 2];
    const to = input[ip + 3];
    input[to] = input[from1] * input[from2];
    return input;
};

export const processStream = (stream: number[]) => {
    let ip = 0;
    while (true) {
        let opcode = stream[ip];
        switch (opcode) {
            case 1:
                add(stream, ip);
                break;
            case 2:
                multiply(stream, ip);
                break;
            case 99:
                return stream;
        }
        ip += 4;
    }
};

const input = [
    1,0,0,3,1,1,2,3,1,3,4,3,1,5,0,3,2,10,1,19,1,5,19,23,1,23,5,27,1,27,13,31,1,31,5,35,1,9,35,39,2,13,39,43,1,43,10,47,1,47,13,51,2,10,51,55,1,55,5,59,1,59,5,63,1,63,13,67,1,13,67,71,1,71,10,75,1,6,75,79,1,6,79,83,2,10,83,87,1,87,5,91,1,5,91,95,2,95,10,99,1,9,99,103,1,103,13,107,2,10,107,111,2,13,111,115,1,6,115,119,1,119,10,123,2,9,123,127,2,127,9,131,1,131,10,135,1,135,2,139,1,10,139,0,99,2,0,14,0
];

export const part1 = () => {
    input[1] = 12;
    input[2] = 2;

    const output = processStream([ ...input ]);
    return output[0];
};

export const part2 = () => {
    for (let noun = 0; noun <= 99; noun++) {
        for (let verb = 0; verb <= 99; verb++) {
            input[1] = noun;
            input[2] = verb;
            const output = processStream([ ...input ]);
            if (output[0] === 19690720) {
                return 100 * noun + verb;
            }
        }
    }
};
