import fs from 'fs';
import path from 'path';

export type Qty = {
    label: string;
    qty: number;
};

export type Tx = {
    inputs: Qty[];
    output: Qty;
};

export type TxQty = {
    tx: Tx;
    qty: number;
};

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day14.data'))
        .toString()
        .split(/[\r\n]/);

export function parseInput(input: string[]) {
    return input
        .map(s => /^(.*?) => (\d+) (.+)$/.exec(s)!)
        .filter(m => !!m)
        .map(([ , inputs, qty, label ]) => ({
            inputs: inputs.split(', ').map(s => /(\d+) (\S+)/.exec(s)!).map(([ , qty, label ]) => ({ 
                label,
                qty: parseInt(qty, 10),
            })),
            output: {
                label,
                qty: parseInt(qty, 10),
            },
        }));
}

export function getOreRequiredForItem1(txs: Tx[], stock: { [label: string]: number }, label: string, qty: number) {
    // If the item is ORE, return it
    if (label === 'ORE') {
        return qty;
    }

    // If we have the item in stock, return it with no further requirements
    if (stock[label] >= qty) {
        stock[label] = stock[label] - qty;
        return 0;
    }
    // Otherwise, reduce the output required by the stock available
    if (stock[label] > 0) {
        qty -= stock[label];
        stock[label] = 0;
    }

    // Otherwise manufacture the item
    const tx = txs.find(tx => tx.output.label === label)!;
    let oreRequired = 0;
    let backOrder = qty;
    while (backOrder > 0) {
        backOrder -= tx.output.qty;
        for (let itx of tx.inputs) {
            oreRequired += getOreRequiredForItem(txs, stock, itx.label, itx.qty);
        }
    }

    // Add any surplus to stock
    if (backOrder < 0) {
        stock[label] = (stock[label] || 0) - backOrder;
    }

    return oreRequired;
}

export function getOreRequiredForItem(txs: Tx[], stock: { [label: string]: number }, label: string, qty: number) {
    // If the item is ORE, return it
    if (label === 'ORE') {
        return qty;
    }

    // If we have the item in stock, return it with no further requirements
    if (stock[label] >= qty) {
        stock[label] = stock[label] - qty;
        return 0;
    }
    // Otherwise, reduce the output required by the stock available
    if (stock[label] > 0) {
        qty -= stock[label];
        stock[label] = 0;
    }

    // Otherwise manufacture the item
    const tx = txs.find(tx => tx.output.label === label)!;
    let oreRequired = 0;
    let backOrder = qty;

    let timesMade = Math.ceil(qty / tx.output.qty);
    backOrder -= timesMade * tx.output.qty;
    for (let itx of tx.inputs) {
        oreRequired += getOreRequiredForItem(txs, stock, itx.label, itx.qty * timesMade);
    }

    // Add any surplus to stock
    if (backOrder < 0) {
        stock[label] = (stock[label] || 0) - backOrder;
    }

    return oreRequired;
}

export function howMuchFuelCanWeMake(txs: Tx[], oreQty: number): number {
    return oreQty - getOreRequiredForItem(txs, {}, 'FUEL', 2876992)
}

export function day14_part1() {
    const txs = parseInput(myInput);
    const result = getOreRequiredForItem1(txs, {}, 'FUEL', 1);
    console.log(`Day 14 part 1 result: ${result}`);
}

export function day14_part2() {
    const result = 0;
    console.log(`Day 14 part 2 result: ${result}`);
}


//day14_part1();
day14_part2();

const testInput3 = [
    '10 ORE => 10 A',
    '1 ORE => 1 B',
    '7 A, 1 B => 1 C',
    '7 A, 1 C => 1 D',
    '7 A, 1 D => 1 E',
    '7 A, 1 E => 1 FUEL',
];
const testInput2 = [
    '9 ORE => 2 A',
    '8 ORE => 3 B',
    '7 ORE => 5 C',
    '3 A, 4 B => 1 AB',
    '5 B, 7 C => 1 BC',
    '4 C, 1 A => 1 CA',
    '2 AB, 3 BC, 4 CA => 1 FUEL',
];
const testInput = [
    '157 ORE => 5 NZVS',
    '165 ORE => 6 DCFZ',
    '44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL',
    '12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ',
    '179 ORE => 7 PSHF',
    '177 ORE => 5 HKGWZ',
    '7 DCFZ, 7 PSHF => 2 XJWVT',
    '165 ORE => 2 GPVTF',
    '3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT',
];
const txs = parseInput(myInput);
//const txs = parseInput(testInput);
const stock = {};
console.log(
    howMuchFuelCanWeMake(txs, 1000000000000)
//getOreRequiredForItem(txs, stock, 'FUEL', 1)
);
console.log(stock);
