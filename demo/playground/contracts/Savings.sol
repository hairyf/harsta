// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract Savings is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable  {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() { _disableInitializers(); }
  function _authorizeUpgrade(address) internal override {}

  error TokenTransferFailed();

  event Deposited(
    address indexed sender,
    address indexed receiver,
    address token,
    uint256 amount
  );

  event Withdrawn(
    address indexed receiver,
    address token,
    uint256 amount
  );

  mapping(address => mapping(address => uint256)) Treasury; 

  function initialize(address _owner) public initializer {
    __Ownable_init(_owner);
    __UUPSUpgradeable_init();
  }

  function balanceOf(address owner, address token) public view returns(uint256) {
    return Treasury[owner][token];
  }

  function deposit(address receiver, address token, uint256 amount) external payable {
    Treasury[receiver][token] += amount;
    erc20transfer(msg.sender, address(this), token, amount);
    emit Deposited(msg.sender, receiver, token, amount);
  }

  function withdraw(address token) external payable {
    erc20transfer(address(this), msg.sender, token, Treasury[msg.sender][token]);
    emit Withdrawn(msg.sender, token, Treasury[msg.sender][token]);
  }

  function erc20transfer(address from, address to, address token, uint256 amount) private {
    bytes memory data;
    if (from == address(this)) {
      bytes4 method = bytes4(keccak256("transfer(address,uint256)"));
      data = abi.encodeWithSelector(method, to, amount);
    } else {
      bytes4 method = bytes4(keccak256("transferFrom(address,address,uint256)"));
      data = abi.encodeWithSelector(method, from, to, amount);
    }
    (bool sent,) = token.call(data);
    if (!sent)
     revert TokenTransferFailed();
  }
}