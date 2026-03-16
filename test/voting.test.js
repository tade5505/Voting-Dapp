const assert = require('assert');
const ganache = require('ganache');
const { beforeEach } = require('mocha');
const { Web3 } = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let accounts;
let voting;

beforeEach(async() => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Deploy a new Voting contract with 3 options.
    voting = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [['Alice', 'Bob', 'Charlie']] })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Voting Contract', () => {
    it('deploys a contract', () => {
        assert.ok(voting.options.address);
    });

    it('initializes with the expected candidates', async () => {
        const candidateCount = await voting.methods.getCandidateCount().call();
        assert.equal(candidateCount, 3);

        const first = await voting.methods.candidates(0).call();
        assert.equal(first[0], 'Alice');
        assert.equal(first[1], '0');
    });

    it('allows one vote per address', async () => {
        await voting.methods.vote(1).send({ from: accounts[1], gas: '1000000' });

        const voted = await voting.methods.hasVoted(accounts[1]).call();
        assert.equal(voted, true);

        const candidate = await voting.methods.candidates(1).call();
        assert.equal(candidate[1], '1');

        let throwCaught = false;
        try {
            await voting.methods.vote(1).send({ from: accounts[1], gas: '1000000' });
        } catch (err) {
            throwCaught = true;
        }

        assert.equal(throwCaught, true);
    });
});
