// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20WithOwnable is ERC20, Ownable {
  constructor(address _owner, string memory _name, string memory _symbol) ERC20(_name, _symbol) Ownable(msg.sender) {
    _mint(_owner, 40000000 * 10 ** 18);
  }

  function mint(address account,  uint256 amount) public onlyOwner {
    _mint(account, amount);
  }
}
