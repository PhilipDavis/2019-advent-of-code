const min = 265275
const max = 781584

function isValid(n: number): boolean {
    const s = n.toString();
    const f = s.split('').map(i => parseInt(i, 10));
    for (let i = 1; i < f.length; i++) {
        if (f[i - 1] > f[i]) {
            return false;
        }
    }
    const count = Object.keys(f.reduce((o, i) => {
        if (typeof o[i.toString()] === 'undefined') {
            o[i.toString()] = 1;
        }
        else {
            o[i.toString()] = o[i.toString()] + 1;
        }
        return o;
    }, {} as any)).length;
    if (count > 5) return false;
    return true;
}

function isValid2(n: number): boolean {
    const s = n.toString();
    const f = s.split('').map(i => parseInt(i, 10));
    for (let i = 1; i < f.length; i++) {
        if (f[i - 1] > f[i]) {
            return false;
        }
    }
    const dupes = f.reduce((o, i) => {
        if (typeof o[i.toString()] === 'undefined') {
            o[i.toString()] = 1;
        }
        else {
            o[i.toString()] = o[i.toString()] + 1;
        }
        return o;
    }, {} as any);

    const count = Object.keys(dupes).length;
    if (count > 5) return false;

    const hasPair = Object.keys(dupes).filter(key => dupes[key] === 2).length > 0;
//    const hasLarger = Object.keys(dupes).filter(key => dupes[key] > 2);

    return hasPair;
}


export function day4_part1() {
    let count = 0;
    for (let i = min; i <= max; i++) {
        if (isValid(i)) {
            count++;
        }
    }
    console.log(`Part 1 result: ${count}`);
}

export function day4_part2() {
    let count = 0;
    for (let i = min; i <= max; i++) {
        if (isValid2(i)) {
            count++;
        }
    }
    console.log(`Part 2 result: ${count}`);
}
