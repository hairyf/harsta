// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Storage is Initializable {
  mapping(string => mapping(string => string)) private data;

  event StorageUpdated (
    address indexed sender,
    string indexed storeIndexed,
    string indexed keyIndexed,
    string store,
    string key,
    string value
  );

  function initialize() public initializer {}

  function setStorage(string memory store, string[][] memory pairs) public {
    for (uint256 i = 0; i < pairs.length; i++)
      setItem(store, pairs[i][0], pairs[i][1]);
  }

  function getStorage(
    string memory store, string[] memory keys
  ) public view returns (string[] memory, string[] memory) {
    uint256 length = size(store, keys);

    string[] memory _keys = new string[](length);
    string[] memory values = new string[](length);

    for (uint256 i = 0; i < keys.length; i++) {
      if (bytes(data[store][keys[i]]).length == 0)
        continue;
      values[i] = data[store][keys[i]];
      _keys[i] = keys[i];
    }
    
    return (_keys, values);
  }

  function setItem(
    string memory store,
    string memory key,
    string memory value
  ) public {
    data[store][key] = value;
    emit StorageUpdated(
      msg.sender,
      store,
      key,
      store,
      key,
      value
    );
  }

  function getItem(
    string memory store,
    string memory key
  ) public view returns (string memory) {
    if (bytes(data[store][key]).length == 0)
     return '';
    return data[store][key];
  }

  function size(string memory store, string[] memory keys) public view returns (uint256) {
    uint256 value = 0;
    for (uint256 i = 0; i < keys.length; i++) {
      if (bytes(data[store][keys[i]]).length == 0)
        continue;
      value++;
    }
    return value;
  }

  function has(string memory store, string memory key) public view returns (bool) {
    return bytes(data[store][key]).length != 0;
  }
}
