const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'Voting.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const output = solc.compile(source, 1);

console.log('Full compile output:', output);

module.exports = output.contracts[Object.keys(output.contracts)[0]];