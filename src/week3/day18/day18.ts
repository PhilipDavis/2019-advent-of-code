import fs from 'fs';
import path from 'path';
import { uniq, difference } from 'lodash';

export type Point = {
    x: number;
    y: number;
};

export function makeIndex(col: number, row: number) {
    return `${col}x${row}`;
}

const myInput =
    fs.readFileSync(path.resolve(__dirname, './day18.data'))
        .toString()
        .split(/[\r\n]/)
        .filter(s => !!s)
        //.map(s => /^(.*)$/.exec(s)!)
        //.map(([ ]) => ({
        //})
;

export function parseMap(input: string[]) {
//    const output = 
}

export function locateSymbol(input: string[], s: string): { x: number; y: number } | null {
    for (let y = 0; y < input.length; y++) {
        const index = input[y].indexOf(s);
        if (index >= 0) return { x: index, y };
    }
    return null;
}

export type Map = {
    [index: string]: string;
};

type Direction = 1 | 2 | 3 | 4;
const North: Direction = 1;
const South: Direction = 2;
const West: Direction = 3;
const East: Direction = 4;

type Path = Direction[];

export function toMap(input: string[]): Map {
    const map: Map = {};
    for (let y = 0; y < input.length; y++) {
        for (let x = 0; x < input[y].length; x++) {
            const index = makeIndex(x, y);
            map[index] = input[y][x];
        }
    }
    return map;
}

// cache keeps track of unobstructed paths
// e.g. if a -> b is not blocked by any doors then remember the result so we don't have to recompute it later
export function shortestPath(cachedResults: any, map: Map, from: Point, target: string, keys: string = ''): { steps: number, keys: string, x: number, y: number, noPath?: boolean, alternates?: string } {
    const originalKeys = keys;
    const cacheKey = `${from.x}x${from.y}>${target}`;
    const cacheItem = cachedResults[cacheKey];
    if (cacheItem) {
        return {
            ...cacheItem,
            keys: addKeys(keys, cacheItem.keys),
        };
    }

    // Build up a set of doors we encounter.
    // If we have no path to the target then it might be a good idea to try unlocking
    // these doors next (as opposed to randomly trying keys)
    let alternates = '';

    const visited: { [index: string]: boolean } = {};
    const ptQueue: { x: number, y: number, path: Path, keys: string, doors: string }[] = [];

    ptQueue.push({ x: from.x, y: from.y, path: [], keys, doors: '' });

    function enqueueIfNew(x: number, y: number, path: Path, keys: string, doors: string) {
        const index = makeIndex(x, y);
        if (map[index] !== '#' && !visited[index]) {
            ptQueue.push({ x, y, path, keys, doors });
        }
    }

    function addKeys(keys: string, toAdd: string) {
        return uniq([ ...keys.split(''), ...toAdd.split('') ]).sort((a, b) => a.localeCompare(b)).join('');
    }

    function subtractKeys(keys: string, toRemove: string) {
        return difference(keys.split(''), toRemove.split('')).join('');
    }

    function addDoor(doors: string, toAdd: string, sort: boolean) {
        const unsorted = uniq([ ...doors.split(''), toAdd ]); 
        return (sort ? unsorted.sort((a, b) => a.localeCompare(b)) : unsorted).join('');
    }

    function isDoor(input: string): boolean {
        return /[A-Z]/.test(input);
    }

    function isKey(input: string): boolean {
        return /[a-z]/.test(input);
    }

    function hasKeyForDoor(keys: string, input: string): boolean {
        return keys.indexOf(input.toLowerCase()) >= 0;
    }

    function visit(x: number, y: number, path: Path, keys: string, doors: string): { found: boolean, keys?: string, door?: string } {
        const index = makeIndex(x, y);
        if (visited[index]) {
            return { found: false };
        }
        visited[index] = true;

        const tile = map[index];

        if (tile === '#') {
            return { found: false };
        }
        if (isDoor(tile)) {
            if (!hasKeyForDoor(keys, tile)) {
                return { found: false, door: tile };
            }
            doors = addDoor(doors, tile, true);
        }

        if (isKey(tile) && !hasKeyForDoor(keys, tile)) {
            keys = addKeys(keys, tile);
        }

        if (tile === target) {
            return { found: true, keys };
        }

        enqueueIfNew(x, y - 1, [ ...path, North ], keys, doors);
        enqueueIfNew(x, y + 1, [ ...path, South ], keys, doors);
        enqueueIfNew(x - 1, y, [ ...path, West ], keys, doors);
        enqueueIfNew(x + 1, y, [ ...path, East ], keys, doors);
        return { found: false };
    }

    let curIndex = 0;
    while (curIndex < ptQueue.length) {
        const { x, y, path, keys, doors } = ptQueue[curIndex++];

        // Process the current point
        const result = visit(x, y, path, keys, doors); 
        if (result.found) {
            const result2 = {
                steps: path.length,
                keys: result.keys!,
                x,
                y,
            };
            // For now, only cache the search if there were no doors in the path
            // Later on will probably need to be able to lookup based on what keys have been collected
            if (doors.length === 0) {
                cachedResults[cacheKey] = {
                    ...result2,
                    keys: subtractKeys(result.keys!, originalKeys), // Only cache the keys we found on the path
                };
            }
            return result2;
        }
        else if (result.door) {
            alternates = addDoor(alternates, result.door, false);
        }
    }
    
    const result = {
        steps: Number.MAX_SAFE_INTEGER,
        x: 0,
        y: 0,
        keys,
        noPath: true,
        alternates,
    };
    return result;
}

type Node = {
    done: boolean;
    x: number;
    y: number;
    steps: number;
    parentSteps: number;
    minChildSteps: number;
    collected: string;
    children: (Node | null)[];
};

export function deepDiveOnce(cache: any, map: Map, node: Node, cutoff: number, keyCount: number): number {
    if (node.done) {
        // If this node is already done then just return the answer
        // Can also just discard the children array to save some resources
        node.children = [];
        return node.minChildSteps === Number.MAX_SAFE_INTEGER
            ? Number.MAX_SAFE_INTEGER
            : node.minChildSteps + node.steps;
    }
    if (node.collected.length === keyCount) {
        // This node just completed the task. Mark it done and set the path length.
        node.done = true;
        node.minChildSteps = 0;
        return node.steps;
    }

    // Bail out if the node is already longer than the shortest path
    if (node.parentSteps + node.steps > cutoff) {
        node.done = true;
        node.minChildSteps = Number.MAX_SAFE_INTEGER;
        return Number.MAX_SAFE_INTEGER;
    }

    let remainingKeys =
        node.children
            .map((n, i) => !n || !n.done ? String.fromCharCode('a'.charCodeAt(0) + i) : null)
            .filter(c => c && node.collected.indexOf(c) === -1) as string[];

    if (remainingKeys.length === 0) {
        node.done = true;
        return node.steps + node.minChildSteps;
    }

    // Choose a node at random and follow it
    const n = Math.floor(Math.random() * remainingKeys.length);
    const target = remainingKeys[n]!;

    const { steps, keys, x, y, noPath, alternates } = shortestPath(cache, map, node, target, node.collected);
    const childNode = {
        done:
            noPath === true ||
            keys.length > node.collected.length + 1, // We collected too many keys, so this child node isn't part of the winning solution
        steps,
        parentSteps: node.parentSteps + node.steps,
        minChildSteps: Number.MAX_SAFE_INTEGER,
        collected: keys,
        x,
        y,
        children: [ ...new Array(keyCount) ].map(_ => null),
    };
    node.children[target.charCodeAt(0) - 'a'.charCodeAt(0)] = childNode;

    const totalSteps = deepDiveOnce(cache, map, childNode, cutoff, keyCount);
    if (totalSteps < node.minChildSteps) {
        node.minChildSteps = totalSteps;
    }

    return node.minChildSteps === Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : node.minChildSteps + node.steps;
}

export function shallowDive(cache: any, map: Map, node: Node, depth: number, cutoff: number, keyCount: number): number {
    // Once we hit the end of the depth for the shallow dive (breadth first)
    // perform one random deep dive.
    if (depth === 0) {
        return deepDiveOnce(cache, map, node, cutoff, keyCount);
        //return Number.MAX_SAFE_INTEGER;
    }
    if (node.done) {
        // If this node is already done then just return the answer
        // Can also just discard the children array to save some resources
        node.children = [];
        return node.minChildSteps === Number.MAX_SAFE_INTEGER
            ? Number.MAX_SAFE_INTEGER
            : node.minChildSteps + node.steps;
    }
    if (node.collected.length === keyCount) {
        // This node just completed the task. Mark it done and set the path length.
        node.done = true;
        node.minChildSteps = 0;
        return node.steps;
    }

    // Bail out if the node is already longer than the shortest path
    if (node.parentSteps + node.steps > cutoff) {
        node.done = true;
        node.minChildSteps = Number.MAX_SAFE_INTEGER;
        return Number.MAX_SAFE_INTEGER;
    }

    let remainingKeys =
        node.children
            .map((n, i) => !n || !n.done ? String.fromCharCode('a'.charCodeAt(0) + i) : null)
            .filter(c => c && node.collected.indexOf(c) === -1) as string[];

    if (remainingKeys.length === 0) {
        node.done = true;
        return node.steps + node.minChildSteps;
    }

    while (remainingKeys.length > 0) {
        const target = remainingKeys.pop()!;
        const childIndex = target.charCodeAt(0) - 'a'.charCodeAt(0);
        let childNode = node.children[childIndex];
        if (childNode === null) {
            const { steps, keys, x, y, noPath, alternates } = shortestPath(cache, map, node, target, node.collected);
            childNode = {
                done:
                    noPath === true ||
                    keys.length > node.collected.length + 1, // We collected too many keys, so this child node isn't part of the winning solution
                steps,
                parentSteps: node.parentSteps + node.steps,
                minChildSteps: Number.MAX_SAFE_INTEGER,
                collected: keys,
                x,
                y,
                children: [ ...new Array(keyCount) ].map(_ => null),
            };
            node.children[childIndex] = childNode;

            // Process alternates first (i.e. these are doors we encountered... so try to get their keys first)
            if (noPath && alternates) {
                // Append because we read from the back of the list first
                const altKeys = alternates.toLowerCase().split('');
                remainingKeys = [ ...difference(remainingKeys, altKeys), ...altKeys ];
            }
        }
        const totalSteps = shallowDive(cache, map, childNode, depth - 1, cutoff, keyCount);
        if (totalSteps < node.minChildSteps) {
            node.minChildSteps = totalSteps;
        }
    }

    return node.minChildSteps === Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : node.minChildSteps + node.steps;
}

export function iterativeDeepening(input: string[], keyCount: number): number {
    const cache: any = {};
    const map = toMap(input);
    const entrance = locateSymbol(input, '@')!;
    const rootNode = {
        done: false,
        steps: 0,
        parentSteps: 0,
        minChildSteps: Number.MAX_SAFE_INTEGER,
        collected: '',
        ...entrance,
        children: [ ...new Array(keyCount) ].map(_ => null),
    };

    let shortestPathSoFar = Number.MAX_SAFE_INTEGER;
    for (let depth = 1; depth <= 26 && !rootNode.done; depth++) {
        console.log(`Processing depth ${depth}`);

        const totalSteps = shallowDive(cache, map, rootNode, depth, shortestPathSoFar, keyCount);
        if (totalSteps < shortestPathSoFar) {
            console.log(`Found a new shortest path: ${totalSteps}`);
            shortestPathSoFar = totalSteps;
        }

        console.log('Now doing some random deep dives...');
        for (let i = 0; i < 1000 * depth; i++) {
            const totalSteps2 = deepDiveOnce(cache, map, rootNode, shortestPathSoFar, keyCount);
            if (totalSteps2 < shortestPathSoFar) {
                console.log(`Found a new shortest path: ${totalSteps2}`);
                shortestPathSoFar = totalSteps2;
            }
        }
    }
    return shortestPathSoFar;
}

export function findMinimumStepsWithDeepDives(input: string[], keyCount: number): number {
    const cache: any = {};
    const map = toMap(input);
    const entrance = locateSymbol(input, '@')!;
    let rootNodes: Node[] = [];

    for (let i = 0; i < keyCount; i++) {
        const target = String.fromCharCode('a'.charCodeAt(0) + i);

        const { steps, keys, x, y, noPath } = shortestPath(cache, map, entrance, target);
        const rootNode = {
            done:
                noPath === true ||  // This node is done if there is no path to the target
                keys.length > 1,    // If we found multiple keys then the current target wasn't the first key in the path
            steps,
            parentSteps: 0,
            minChildSteps: Number.MAX_SAFE_INTEGER,
            collected: keys,
            x,
            y,
            children: [ ...new Array(keyCount) ].map(_ => null),
        };
        if (!rootNode.done) {
            rootNodes.push(rootNode);
        }
    }

    let iteration = 0;
    let shortestPathSoFar = Number.MAX_SAFE_INTEGER;
    while (rootNodes.length > 0) {
        const node = rootNodes[iteration % rootNodes.length];

        if (++iteration % 100 === 0) {
            console.log(`Iteration ${iteration}`);
        }

        const totalSteps = deepDiveOnce(cache, map, node, shortestPathSoFar, keyCount);
        if (totalSteps < shortestPathSoFar) {
            console.log(`Found a new shortest path: ${totalSteps}`);
            shortestPathSoFar = totalSteps;
        }
        if (node.done) {
            rootNodes = rootNodes.filter(n => n !== node);
        }
    }

    return shortestPathSoFar;
/*
    let shortestPathLength = Number.MAX_SAFE_INTEGER;
    let iteration = 0;
    while (nodeQueue.length > 0) {
        iteration++;

        // Every 1000 iterations, sort the remaining queue by current total steps in each node
        if (iteration % 1000 === 0) {
            const oldFirst10AvgSteps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0) / 10;
            const oldFirst10AvgKeys = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.collected.length, 0) / 10;
            nodeQueue.sort((a, b) => a.totalSteps - b.totalSteps);
            const newFirst10AvgSteps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0) / 10;
            const newFirst10AvgKeys = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.collected.length, 0) / 10;
            const longest10Steps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0) / 10;
            console.log(`iteration ${iteration}: queue size = ${nodeQueue.length}, old vs. new avg steps in first 10 = ${oldFirst10AvgSteps} vs ${newFirst10AvgSteps}, avg keys ${oldFirst10AvgKeys} vs ${newFirst10AvgKeys}, last 10 steps = ${longest10Steps}`);
        }
        // Every 500 iterations, sort the remaining queue by current total number of keys
        if (iteration % 1000 === 500) {
            const oldFirst10TotalSteps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0);
            const oldFirst10AvgKeys = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.collected.length, 0) / 10;
            nodeQueue.sort((a, b) => a.collected.length - b.collected.length);
            const newFirst10TotalSteps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0);
            const newFirst10AvgKeys = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.collected.length, 0) / 10;
            const longest10Steps = nodeQueue.filter((a, i) => i < 10).reduce((sum, node) => sum + node.totalSteps, 0) / 10;
            console.log(`iteration ${iteration}: queue size = ${nodeQueue.length}, old vs. new avg steps in first 10 = ${oldFirst10TotalSteps} vs ${newFirst10TotalSteps}, avg keys ${oldFirst10AvgKeys} vs ${newFirst10AvgKeys}, last 10 steps = ${longest10Steps}`);
        }

        const [ node ] = nodeQueue.splice(0, 1);

        // Discard the node if it's already longer than the shorted path
        if (node.totalSteps >= shortestPathLength) {
            continue;
        }

        // No more processing to do for this node if it's already collected all the keys
        if (node.collected.length === keyCount) {
            // Remove any queued nodes that have more steps than this one
            const { totalSteps } = node;
            nodeQueue = nodeQueue.filter(node => node.totalSteps > totalSteps);
            continue;
        }

        // Try the next keys from this node
        for (let i = 0; i < keyCount; i++) {
            const target = String.fromCharCode('a'.charCodeAt(0) + i);

            // Skip this key if it's already been collected
            if (node.collected.indexOf(target) >= 0) {
                continue;
            }

            try {
                const { steps, keys, x, y } = shortestPath(map, node, target, node.collected);
                const totalSteps = node.totalSteps + steps;
                const childNode = {
                    steps,
                    totalSteps,
                    collected: keys,
                    x,
                    y,
                    children: [],
                };
                node.children.push(childNode);
                nodeQueue.push(childNode);

                if (keys.length === keyCount) {
                    if (totalSteps < shortestPathLength) {
                        shortestPathLength = Math.min(shortestPathLength, totalSteps);
                    }
                }
            }
            catch (err) {} // No path to the current target
        }
    }

    return shortestPathLength;
*/
}

export function day18_part1() {
    const result = iterativeDeepening(myInput, 26);
    console.log(`Day 18 part 1 result: ${result}`);
}

export function day18_part2() {
    const result = 0;
    console.log(`Day 18 part 2 result: ${result}`);
}


//day18_part1();
//day18_part2();

/*
const entrance = locateSymbol(myInput, '@')!;
console.log(
    shortestPath(myInput, entrance, 'b')
);
*/


const testInput1 = [
    '########################',
    '#@..............ac.GI.b#',
    '###d#e#f################',
    '###A#B#C################',
    '###g#h#i################',
    '########################',
];
const testInput2 = [
    '#################',
    '#i.G..c...e..H.p#',
    '########.########',
    '#j.A..b...f..D.o#',
    '########@########',
    '#k.E..a...g..B.n#',
    '########.########',
    '#l.F..d...h..C.m#',
    '#################',
];
//const entrance = locateSymbol(testInput1, '@')!;
//const result = shortestPath(testInput, entrance, 'a', '');
//const result = iterativeDeepening(testInput1, 9);
const entrance = locateSymbol(testInput2, '@')!;
const result = iterativeDeepening(testInput2, 16);
console.log(result);
