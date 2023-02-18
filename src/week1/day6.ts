import fs from 'fs';
import path from 'path';

const input =
    fs.readFileSync(path.resolve(__dirname, './day6.data'))
        .toString()
        .split('\r\n')
;

type Node = {
    name: string;
    parent?: Node;
};

type NodeMap = {
    [name: string]: Node;
};

type Orbit = {
    from: string;
    to: string;
};

function parseOrbit(orbit: string): Orbit {
    const [ , from, to ] = /^(.*?)\)(.*)$/.exec(orbit)!;
    return {
        from,
        to
    };
}

export function countOrbitsForNode(node: Node): number {
    let orbits = 0;
    while (node.parent) {
        orbits++;
        node = node.parent;
    }
    return orbits;
}

export function getNode(nodesByName: NodeMap, name: string, parent?: Node): Node {
    const n = nodesByName[name];
    if (n) {
        if (parent) {
            if (n.parent && n.parent !== parent) throw new Error('Uh oh... node already has a parent');
            n.parent = parent;
        }
        return n;
    }
    const node = {
        name,
        parent
    };
    nodesByName[name] = node;
    return node;
}

export function getPathToRoot(nodesByName: NodeMap, name: string): Node[] {
    let node = getNode(nodesByName, name);
    const path = [ node ];
    while (node.parent) {
        node = node.parent;
        path.push(node);
    }
    return path.reverse();
}

export function calculateOrbits(input: string[]) {
    const nodesByName: NodeMap = {};
    input.forEach(orbitString => {
        const orbit = parseOrbit(orbitString);
        const fromNode = getNode(nodesByName, orbit.from);
        const toNode = getNode(nodesByName, orbit.to, fromNode);
    });
    return nodesByName;
}

function day6_part1() {
    const nodesByName = calculateOrbits(input);
    const result = Object.values(nodesByName).reduce((total, node) => total + countOrbitsForNode(node), 0);
    console.log(`Day 6 part 1 result is ${result}`);
}

export function calculateOrbitJumps(nodesByName: NodeMap, nameFrom: string, nameTo: string) {
    const destPathToRoot = getPathToRoot(nodesByName, nameTo);
    const srcPathToRoot = getPathToRoot(nodesByName, nameFrom);
    
    // Find the last shared node
    let lastSharedIndex = 0;
    while (true) {
        if (destPathToRoot[lastSharedIndex + 1].name !== srcPathToRoot[lastSharedIndex + 1].name) {
            break;
        }
        lastSharedIndex++;
    }
    const sharedCount = lastSharedIndex + 1;

    // Also subtract 1 from source and dest because the question says to exclude the target and
    // source because we're only jumping between the parents of the two nodes
    return (destPathToRoot.length - 1 - sharedCount) + (srcPathToRoot.length - 1 - sharedCount);
}

function day6_part2() {
    const nodesByName = calculateOrbits(input);
    const result = calculateOrbitJumps(nodesByName, 'YOU', 'SAN');
    console.log(`Day 6 part 2 result is ${result}`);
}


day6_part1();
day6_part2();
