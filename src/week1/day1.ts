const moduleMasses = [
    71764,
    58877,
    107994,
    72251,
    74966,
    87584,
    118260,
    144961,
    86889,
    136710,
    52493,
    131045,
    101496,
    124341,
    71936,
    88967,
    106520,
    125454,
    113463,
    81854,
    99918,
    105217,
    120383,
    61105,
    103842,
    125151,
    139191,
    143365,
    102168,
    69845,
    57343,
    93401,
    140910,
    121997,
    107964,
    53358,
    57397,
    141456,
    94052,
    127395,
    99180,
    143838,
    130749,
    126809,
    70165,
    92007,
    83343,
    55163,
    95270,
    101323,
    99877,
    105721,
    129657,
    61213,
    130120,
    108549,
    90539,
    111382,
    61665,
    95121,
    53216,
    103144,
    134367,
    101251,
    105118,
    73220,
    56270,
    50846,
    77314,
    59134,
    98495,
    113654,
    89711,
    68676,
    98991,
    109068,
    129630,
    58999,
    132095,
    98685,
    91762,
    88589,
    73846,
    124940,
    106944,
    133882,
    104073,
    78475,
    76545,
    144728,
    72449,
    118320,
    65363,
    83523,
    124634,
    96222,
    128252,
    112848,
    139027,
    108208,
];

export const calculateFuelRequired = (mass: number): number => {
    return Math.floor(mass / 3) - 2;
};

export const calculateTotalFuelRequired = (mass: number): number => {
    let totalFuel = 0;
    let fuel = calculateFuelRequired(mass);
    while (fuel > 0) {
        totalFuel += fuel;
        fuel = calculateFuelRequired(fuel);
    }
    return totalFuel;
};

export const part1 = () => {
    const answer = moduleMasses.reduce((sum, mass) => sum + calculateFuelRequired(mass), 0);
    return answer;
};

export const part2 = () => {
    const answer = moduleMasses.reduce((sum, mass) => sum + calculateTotalFuelRequired(mass), 0);
    return answer;
};