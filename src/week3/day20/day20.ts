import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day20.data'))
        .toString()
        // KILL: remove if input is not a LIST OF NUMBERS!
        .split(',')
        .map(s => parseInt(s, 10))
;

export function foo(input: number[]): number {
    return 0;
}

export function day20_part1() {
    const result = foo(myInput);
    console.log(`Day 20 part 1 result: ${result}`);
}

export function day20_part2() {
    const result = 0;
    console.log(`Day 20 part 2 result: ${result}`);
}


day20_part1();
day20_part2();
