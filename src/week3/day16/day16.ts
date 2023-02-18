import fs from 'fs';
import path from 'path';
import { uniq } from 'lodash';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day16.data'))
        .toString()
        .split('')
        .map(s => parseInt(s, 10))
;

type OffsetRange = {
    from: number;
    to: number;
};

type Digit = {
    adds: OffsetRange[];
    subs: OffsetRange[];
    phase: number;
    offset: number;
    value?: number;
};

type DigitMap = {
    [index: string]: number;
};

function getOffsets(input: number[], times: number, offset: number, isAdds: boolean): OffsetRange[] {
    let increment = (offset + 1) * 4;

    let delta =
        isAdds
            ? 0
            : 2 * (offset + 1);

    const offsetRanges: OffsetRange[] = [];
    for (let j = offset + delta; j < input.length * times; j += increment) {
        const endAt = Math.min(j + offset, (input.length * times) - 1);
        offsetRanges.push({
            from: j,
            to: endAt
        });
    }
    return offsetRanges;
}

export function fftTimes(input: number[], times: number, phases: number, offset: number = 0): string {
    const digitMap: { [index: string]: number } = {};

    const finalDigits: number[] = [];
    for (let i = 0; i < 8; i++) {
        console.log(`Working on digit ${offset + i}...`);
        finalDigits.push(fftDigit(input, digitMap, times, phases, offset + i));
    }

    return finalDigits.join('');
}

export function fftDigitRecursive(input: number[], digitMap: DigitMap, times: number, phases: number, offset: number = 0): number {
    const index = `${phases}_${offset}`;

    // When phases is zero, return the input
    if (phases === 0) {
        return input[offset % input.length];
    }

    // Return the digit if we've already calculated it
    let digit = digitMap[index];
    if (digit !== undefined) {
        return digit;
    }

    // Otherwise, calculate this digit (i.e. this offset for this phase)

    let adds = 0;
    let addsRange = getOffsets(input, times, offset, true);
    for (let range of addsRange) {
        for (let addOffset = range.from; addOffset <= range.to; addOffset++) {
            adds += fftDigit(input, digitMap, times, phases - 1, addOffset);
        }
    }

    let subs = 0;
    let subsRange = getOffsets(input, times, offset, false);
    for (let range of subsRange) {
        for (let subOffset = range.from; subOffset <= range.to; subOffset++) {
            subs += fftDigit(input, digitMap, times, phases - 1, subOffset);
        }
    }

    digit = Math.abs(adds - subs) % 10;
    digitMap[index] = digit;
    return digit;
}

export function fftDigit(input: number[], digitMap: DigitMap, times: number, phases: number, offset: number = 0): number {
    const index = `${phases}_${offset}`;

    // When phases is zero, return the input
    if (phases === 0) {
        return input[offset % input.length];
    }

    // Return the digit if we've already calculated it
    let digit = digitMap[index];
    if (digit !== undefined) {
        return digit;
    }

    // Otherwise, calculate this digit (i.e. this offset for this phase)

    let adds = 0;
    let addsRange = getOffsets(input, times, offset, true);
    for (let range of addsRange) {
        let firstDigitAdds = fftDigit(input, digitMap, times, phases - 1, range.from);
        adds = firstDigitAdds;

        // TODO: incomplete
//        let nextDigitAdds = fftDigit(input, digitMap, times, phases - 1, range.from + 1, firstDigitAdds);

        // each subsequent add removes the lead digit and adds two trailing digits
        let remainingAdds = firstDigitAdds;
        remainingAdds -= fftDigit(input, digitMap, times, phases - 1, range.from);
        remainingAdds += fftDigit(input, digitMap, times, phases - 1, range.to - 1);
        remainingAdds += fftDigit(input, digitMap, times, phases - 1, range.to);
        adds += remainingAdds;
        
        //for (let addOffset = range.from; addOffset <= range.to; addOffset++) {
        //    adds += fftDigit(input, digitMap, times, phases - 1, addOffset);
        //}
    }

    let subs = 0;
    let subsRange = getOffsets(input, times, offset, false);
    for (let range of subsRange) {
        for (let subOffset = range.from; subOffset <= range.to; subOffset++) {
            subs += fftDigit(input, digitMap, times, phases - 1, subOffset);
        }
    }

    digit = Math.abs(adds - subs) % 10;
    digitMap[index] = digit;
    return digit;
}

/* KILL
export function fftTimes(input: number[], digitMap: DigitMap, times: number, phases: number, finalOffset: number = 0): string {
    let phase = phases + 1;

    const digits: Digit[] = [];

    // offsets holds the indexes of the digits we need to calculate
    let offsetRanges: OffsetRange[] = [];
    offsetRanges.push({
        from: finalOffset,
        to: finalOffset + 7
    });

    function getOffsets(offset: number, isAdds: boolean): OffsetRange[] {
        if (phase === 0) return [];

        let increment = (offset + 1) * 4;

        let delta =
            isAdds
                ? 0
                : 2 * (offset + 1);

        const offsetRanges: OffsetRange[] = [];
        for (let j = offset + delta; j < input.length * times; j += increment) {
            const endAt = Math.min(j + offset, (input.length * times) - 1);
            offsetRanges.push({
                from: j,
                to: endAt
            });
        }
        return offsetRanges;
    }

    // Go backwards to figure out what is needed to solve the answer
    while (phase >= 0) {
        let newOffsets: number[] = [];

        for (let range of offsetRanges) {
            for (let offset = range.from; offset <= range.to; offset++) {
                const adds = getOffsets(offset, true);
                const subs = getOffsets(offset, false);
                const value =
                    phase === 0
                        ? input[offset % input.length]
                        : undefined;
                digits.push({
                    adds,
                    subs,
                    phase,
                    offset,
                    value,
                });
            }

            for (let range of adds) {
                for (let offset = range.from; offset <= range.to; offset++) {
                    newOffsets.push(offset);
                }
            }
            for (let range of subs) {
                for (let offset = range.from; offset <= range.to; offset++) {
                    newOffsets.push(offset);
                }
            }
        }

        offsets = uniq(newOffsets);
        console.log(`Completed phase ${phase}`);
        phase--;
    }

    // Go forwards from the beginning on the minimum path
    for (phase = 1; phase <= phases; phase++) {
        digits.filter(d => d.phase === phase).forEach(d => {
            let adds = 0;
            for (let range of d.adds) {
                adds += digits.filter(d => d.phase === phase - 1 && d.offset >= range.from && d.offset <= range.to).reduce((sum, d) => sum + d.value!, 0);
            }
            let subs = 0;
            for (let range of d.subs) {
                subs += digits.filter(d => d.phase === phase - 1 && d.offset >= range.from && d.offset <= range.to).reduce((sum, d) => sum + d.value!, 0);
            }
            d.value = Math.abs(adds - subs) % 10;
        });
    }

    return digits
        .filter(d => d.phase === phases)
        .sort((a, b) => a.offset - b.offset)
        .map(d => d.value!)
        .join('')
        .substr(0, 8);
}
*/

export function fft(input: number[], phases: number, offset: number = 0): string {
    for (let i = 0; i < phases; i++) {
        input = fft1_v2(input);
        if ((i + 1) % 100 === 0) {
            console.log(`${i + 1} of ${phases}`);
        }
    }
    return input.slice(offset, offset + 8).join('');
}

const pattern = [ 0, 1, 0, -1 ];

export function fft1_v1(input: number[]): number[] {
    const newList = [ ...input ];
    for (let i = 0; i < input.length; i++) {
        let digitI = 0;
        for (let j = i; j < input.length; j++) {
            const op = pattern[ (Math.floor((j + 1) / (i + 1)) % pattern.length) ];
            switch (op) {
                case -1:
                    digitI -= input[j];
                    break;
                case 1:
                    digitI += input[j];
                    break;
            }
        }
        newList[i] = Math.abs(digitI) % 10;
    }
    return newList;
}

export function fft1_v2(input: number[]): number[] {
    const newList = [ ...input ];
    for (let i = 0; i < input.length; i++) {
        let increment = (i + 1) * 4;

        let adds = 0;
        for (let j = i; j < input.length; j += increment) {
            const endAt = Math.min(j + i, input.length - 1);
            for (let k = j; k <= endAt; k++) {
                adds += input[k];
            }
        }

        let subs = 0;
        for (let j = i + 2 * (i + 1); j < input.length; j += increment) {
            const endAt = Math.min(j + i, input.length - 1);
            for (let k = j; k <= endAt; k++) {
                subs += input[k];
            }
        }

        newList[i] = Math.abs(adds - subs) % 10;
    }
    return newList;
}

export function fft_v3(_input: number[], times: number, phases: number, offset: number): number[] {
    // Build up the tail of the input array
    let input: number[] = [];
    for (let i = offset; i < _input.length * times; i++) {
        input.push(_input[i % _input.length]);
    }

    // Copy the input to an output array... elements will be replaced
    let output: number[] = [
        ...input
    ];

    for (let phase = 0; phase < phases; phase++) {
        //console.log(`Starting phase ${phase + 1}`);

        // Work backwards from the end of the array
        let nextDigit = 0;
        for (let i = input.length - 1; i >= 0; i--) {
            nextDigit += input[i];
            output[i] = nextDigit % 10;
        }

        input = output;
    }

    return output.slice(0, 8);
}

export function day16_part1() {
    const result = fft(myInput, 100, 0);
    console.log(`Day 16 part 1 result: ${result}`);
}

export function day16_part2() {
    const offset = parseInt(myInput.slice(0, 7).join(''), 10);
    const result = fftTimes(myInput, 10000, 100, offset);
    console.log(`Day 16 part 2 result: ${result}`);
}

const start = Date.now();

//console.log(fft('12345678'.split('').map(s => parseInt(s, 10)), 100));
//console.log(fft_v3(myInput, 1, 100, 0));
//console.log('result: ' + fftTimes('12345678'.split('').map(s => parseInt(s, 10)), 10, 4, 0));
//console.log('result: ' + fftTimes('03036732577212944063491565474664'.split('').map(s => parseInt(s, 10)), 10000, 100, 303673));
//console.log('result: ' + fftTimes(myInput, 10000, 100, 6499990));
//console.log('result: ' + fftTimes(myInput, 10000, 100, 5973857));
console.log('result: ' + fft_v3(myInput, 10000, 100, 5973857).join(''));

const finish = Date.now();
console.log(`Took ${(finish - start)}ms`);


//day16_part1();
//day16_part2();
/*
//const offset = parseInt(myInput.slice(0, 7).join(''), 10);
const start = Date.now();
const result = fftTimes(myInput, 1, 100);
const end = Date.now();
console.log(result);
console.log(`Result took ${(end - start) / 1000}s`);
*/
/*
const i = 3;
const pattern: number[] = [];
for (let z = 0; z < i; z++) pattern.push(0);
for (let z = 0; z <= i; z++) pattern.push(1);
for (let z = 0; z <= i; z++) pattern.push(0);
for (let z = 0; z <= i; z++) pattern.push(-1);
pattern.push(0); // because one zero is shifted left
console.log(pattern);

const p = [ 0, 1, 0, -1 ];
const observedPattern: number[] = [];
for (let j = 0; j < 12; j++) {
    observedPattern.push(p[   (Math.floor((j + 1) / (i + 1)) % p.length)  ]);
}

console.log(observedPattern);
*/