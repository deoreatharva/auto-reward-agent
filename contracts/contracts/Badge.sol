// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Badge is ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;
    address public minterAgent;
    mapping(uint256 => string) public badgeCause;

    event BadgeMinted(address indexed to, uint256 tokenId, string cause);

    constructor(address initialOwner)
        ERC721("AutoReward Badge", "ARB")
        Ownable(initialOwner)
    {}

    function setMinterAgent(address _agent) external onlyOwner {
        minterAgent = _agent;
    }

    function mint(address to, string memory cause) external returns (uint256) {
        require(msg.sender == minterAgent, "Only agent can mint");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _mint(to, newTokenId);
        badgeCause[newTokenId] = cause;
        emit BadgeMinted(to, newTokenId, cause);
        return newTokenId;
    }
}