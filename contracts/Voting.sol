pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
// Voting.sol
// A simple voting contract where each wallet address can vote once.
// The contract stores candidates and their vote counts.

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;

    // Initialize with a fixed set of candidates.
    // In a real-world deployment, candidate names could be set by a contract owner.
    constructor(string[] memory candidateNames) public {
        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint candidateIndex) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateIndex < candidates.length, "Candidate does not exist");

        hasVoted[msg.sender] = true;
        candidates[candidateIndex].voteCount += 1;
    }

    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }
}
