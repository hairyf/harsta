// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract ERC20WithUUPS is ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() { _disableInitializers(); }
  function _authorizeUpgrade(address) internal override onlyOwner {}

  function initialize(address _owner, string memory _name, string memory _symbol) public initializer {
    __ERC20_init(_name, _symbol);
    __Ownable_init(msg.sender);
    _mint(_owner, 40000000 * 10 ** 18);
  }


  function mint(address account,  uint256 amount) public onlyOwner {
    _mint(account, amount);
  }
}
