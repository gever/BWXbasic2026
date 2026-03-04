// The function in question
const writeAndAdvanceIndices = (arr, indices, val) => {
    if (!Array.isArray(arr)) throw "NOT AN ARRAY";
    let curr = arr;
    let depth = 0;

    while (Array.isArray(curr)) {
        curr = curr[0];
        depth++;
    }
    while (indices.length < depth) indices.push(0);

    curr = arr;
    for (let i = 0; i < indices.length - 1; i++) {
        if (curr[indices[i]] === undefined) curr[indices[i]] = [];
        curr = curr[indices[i]];
    }
    curr[indices[indices.length - 1]] = val;

    for (let i = indices.length - 1; i >= 0; i--) {
        indices[i]++;
        let level = arr;
        for (let j = 0; j < i; j++) level = level[indices[j]];
        if (!Array.isArray(level) || indices[i] < level.length) return;
        indices[i] = 0; // Wrap around and let the next inner dimension increment
    }
};

// Test
const allocArray = (...dims) => {
    const build = (dIdx) => {
        if (dIdx >= dims.length) return undefined;
        return Array.from({ length: dims[dIdx] }, () => build(dIdx + 1));
    };
    return dims.length ? build(0) : [];
};

console.log("Testing writeAndAdvanceIndices");

let mat = allocArray(2, 2);
let iter = [1, 0];
writeAndAdvanceIndices(mat, iter, 11);
console.log("Result 1: iter is", iter, "val is", mat[1][0]);

writeAndAdvanceIndices(mat, iter, 12);
console.log("Result 2: iter is", iter, "val is", mat[1][1]);
