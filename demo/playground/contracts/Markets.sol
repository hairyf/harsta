// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./interfaces/ISavings.sol";

contract Markets is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() { _disableInitializers(); }
  function _authorizeUpgrade(address) internal override {}

  uint256 OrderedUID;

  struct Thing {
    uint256 quantity;
    address token; // is zero to be value number
    uint256 amount;
    uint256 rebate;
    uint256 discount;
    address seller;
    string name;
  }

  struct Order {
    address intermediary;
    address buyer;
    string thing;
  }

  event Banned(
    address indexed seller,
    int256 height,
    uint256 timestamp
  );

  event Registered(
    address indexed seller,
    int256 height,
    uint256 timestamp
  );

  event Deposited(
    address indexed sender,
    address indexed receiver,
    address token,
    uint256 amount,
    int256 blockHeight,
    uint256 timestamp
  );

  event Withdrawn(
    address indexed receiver,
    address token,
    uint256 amount,
    int256 blockHeight,
    uint256 timestamp
  );


  error TokenTransferFailed();
  error ThingOwnableUnauthorized();
  error ThingDelisted();

  // 0 - unregistered | 1 - registered | 2 - prevent
  mapping(address => uint256) Business;
  mapping(string => Thing) Things;
  mapping(string => Order[]) Orders;

  mapping(address => mapping(address => uint256)) Treasury; 

  function initialize(address _owner) public initializer {
    __Ownable_init(_owner);
    __UUPSUpgradeable_init();
  }

  function register(address seller) public onlyOwner {
    Business[seller] = 1;
    emit Registered(
      seller,
      int(block.number),
      block.timestamp
    );
  }

  function list(Thing memory thing) public {
    if (!(msg.sender == owner() || Business[msg.sender] == 1))
      revert ThingOwnableUnauthorized();
    Things[thing.name] = thing;
  }

  function delist(string memory thingId) public {
    if (!(msg.sender == owner() || Business[msg.sender] == 1))
      revert ThingOwnableUnauthorized();
    delete Things[thingId];
  }

  function setQuantity(string memory thingId, uint256 quantity) public {
    if (!(msg.sender == owner() || Business[msg.sender] == 1))
      revert ThingOwnableUnauthorized();
    Things[thingId].quantity = quantity;
  }

  function setRebate(string memory thingId, uint256 rebate) public {
    if (!(msg.sender == owner() || Business[msg.sender] == 1))
      revert ThingOwnableUnauthorized();
    Things[thingId].rebate = rebate;
  }

  function setDiscount(string memory thingId, uint256 discount) public {
    if (!(msg.sender == owner() || Business[msg.sender] == 1))
      revert ThingOwnableUnauthorized();
    Things[thingId].discount = discount;
  }

  function purchase(Order memory order) public {
    if (Things[order.thing].quantity == 0)
      revert ThingDelisted();

    uint256 price = Things[order.thing].amount;

    if (order.intermediary != address(0)) {
      deposit(order.intermediary, Things[order.thing].token, Things[order.thing].rebate);
      price = price - Things[order.thing].rebate;
      price = price - Things[order.thing].discount;
    }

    transfer(
      msg.sender,
      Things[order.thing].seller,
      Things[order.thing].token,
      price
    );
  
    Things[order.thing].quantity -= 1;
  }

  function detail(string memory thingId) public view returns(Thing memory) {
    return Things[thingId];
  }

  function orders(string memory thingId) public view returns(Order[] memory) {
    return Orders[thingId];
  }

  function balanceOf(address owner, address token) public view returns(uint256) {
    return Treasury[owner][token];
  }

  function deposit(address receiver, address token, uint256 amount) public {
    Treasury[receiver][token] += amount;
    transfer(msg.sender, address(this), token, amount);
    emit Deposited(msg.sender, receiver, token, amount, int(block.number), block.timestamp);
  }

  function withdraw(address token) public {
    transfer(address(this), msg.sender, token, Treasury[msg.sender][token]);
    emit Withdrawn(msg.sender, token, Treasury[msg.sender][token], int(block.number), block.timestamp);
  }

  function transfer(address from, address to, address token, uint256 amount) private {
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