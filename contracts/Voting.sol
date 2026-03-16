pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
// Voting.sol
// A simple voting contract where each wallet address can vote once.
// The contract stores candidates and their vote counts.

contract Voting {
    address public owner;

    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;
    mapping(address => uint) public voteIndex;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Initialize with a fixed set of candidates.
    // Owner can add new candidates later.
    constructor(string[] memory candidateNames) public {
        owner = msg.sender;

        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    function addCandidate(string memory name) public onlyOwner {
        candidates.push(Candidate({
            name: name,
            voteCount: 0
        }));
    }

    function vote(uint candidateIndex) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateIndex < candidates.length, "Candidate does not exist");

        hasVoted[msg.sender] = true;
        voteIndex[msg.sender] = candidateIndex;
        candidates[candidateIndex].voteCount += 1;
    }

    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }
}
