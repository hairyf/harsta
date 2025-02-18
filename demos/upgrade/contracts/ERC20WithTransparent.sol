// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ERC20WithTransparent is ERC20Upgradeable, OwnableUpgradeable {
  constructor() { _disableInitializers(); }

  function initialize(address _owner, string memory _name, string memory _symbol) public initializer {
    __ERC20_init(_name, _symbol);
    __Ownable_init(msg.sender);
    _mint(_owner, 40000000 * 10 ** 18);
  }


  function mint(address account,  uint256 amount) public onlyOwner {
    _mint(account, amount);
  }
}
