const fs = require('fs');
const path = require('path');
const { Web3 } = require('web3');
const { interface, bytecode } = require('./compile');

async function deploy() {
    // Connect to a local Ganache instance (default: http://127.0.0.1:8545)
    const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account', accounts[0]);

    const voting = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [['Alice', 'Bob', 'Charlie']] })
        .send({ from: accounts[0], gas: '1000000' });

    console.log('Contract deployed to', voting.options.address);

    const uiDir = path.resolve(__dirname, 'ui');
    fs.mkdirSync(uiDir, { recursive: true });

    const contractData = {
        address: voting.options.address,
        abi: JSON.parse(interface),
    };

    fs.writeFileSync(path.resolve(uiDir, 'contract.json'), JSON.stringify(contractData, null, 2));
    console.log('Saved contract info to ui/contract.json');
}

deploy().catch(err => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
