const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'Voting.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// solc.compile returns an object with contract keys like ':Voting'
const compiled = solc.compile(source, 1);
module.exports = compiled.contracts[':Voting'];
