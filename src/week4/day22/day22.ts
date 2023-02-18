import fs from 'fs';
import path from 'path';

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day22.data'))
        .toString()
        .split('\n')
;

export function dealIncrement(input: number[], inc: number): number[] {
    const output = [ ...input ];
    for (let i = 0, j = 0; i < input.length; i++, j += inc) {
        output[j % input.length] = input[i];
    }
    return output;
}

export function cutDeck(input: number[], where: number): number[] {
    if (where > 0) {
        const cut = input.splice(0, where);
        return [ ...input, ...cut ];
    }
    else {
        const cut = input.splice(input.length + where);
        return [ ...cut, ...input ];
    }
}

export function cardFunction(fName: string, input: number[]): number[] {
    if (/deal into new stack/.test(fName)) {
        return [ ...input ].reverse();
    }
    let match = /deal with increment (\d+)/i.exec(fName);
    if (match) {
        return dealIncrement(input, parseInt(match[1], 10));
    }
    match = /cut (-?\d+)/.exec(fName);
    if (match) {
        return cutDeck(input, parseInt(match[1], 10));
    }
    else {
        console.log( 'unknown ' + fName);
        return [0];
    }
}


export function foo(input: string[], nCards: number, nShuffles: number, findCard: number): number {
    let deck = [ ...new Array(nCards) ].map((_, i) => i);
    for (let i = 0; i < nShuffles; i++) {
        for (let c of input) {
            deck = cardFunction(c, deck); 
        }
    }
    return deck.findIndex(c => c === findCard);
}

export function foo2(input: string[], nCards: number, nShuffles: number, findCardInPosition: number): number {
    return 0;
}

export function day22_part1() {
    const nCards = 10007;
    const nShuffles = 1;
    const findCard = 2019;
    const result = foo(myInput, nCards, nShuffles, findCard);
    console.log(`Day 22 part 1 result: ${result}`);
}

export function day22_part2() {
    const nCards = 119315717514047;
    const nShuffles = 101741582076661;
    const result = foo2(myInput, nCards, nShuffles, 2020);
    console.log(`Day 22 part 2 result: ${result}`);
}


day22_part1();
//day22_part2();
