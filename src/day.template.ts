import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day .data'))
        .toString()
        // KILL: remove if input is not a LIST OF NUMBERS!
        .split(',')
        .map(s => parseInt(s, 10))
;

export function foo(input: number[]): number {
    return 0;
}

export function day _part1() {
    const result = foo(myInput);
    console.log(`Day N part 1 result: ${result}`);
}

export function day _part2() {
    const result = 0;
    console.log(`Day N part 2 result: ${result}`);
}


day _part1();
day _part2();
