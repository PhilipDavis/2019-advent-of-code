import fs from 'fs';
import path from 'path';

export const parseNumberList = (input: string) =>
    input
        .split(',')
        .map(s => parseInt(s, 10))
;
