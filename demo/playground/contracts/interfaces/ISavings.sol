// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISavings {
  function deposit(address receiver, address token, uint256 amount) external payable;
}
