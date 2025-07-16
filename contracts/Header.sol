//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interfaces/IHeaderTracking.sol";

contract Header is IHeaderTracking {

    address public operatorAddress;
    mapping(bytes32 => TxnHeader) public txnHeaderInformation;
    mapping(uint32 => bytes32[]) public txnHeaderHashId;

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Only operator");
        _;
    }

    constructor() {
        operatorAddress = msg.sender;
    }

    // set operator
    // operator contract is proxy contract. We only accept the proxy contract can call addEventSubStageTimestamps function.

    function setOperator(address newOperator) public onlyOperator {
        operatorAddress = newOperator;
    }

    // get list header by hashid
    // The function `getListTxnHeaderHashById` is a getter function that returns an array of `bytes32` values. It takes an input parameter `eosId` of type `uint32`.
    function getListTxnHeaderHashById(uint32 eosId) external override view returns (bytes32[] memory) {
        return txnHeaderHashId[eosId];
    }

    // get list header by eosid
    // The `getListTxnHeader` function is a getter function that returns an array of `TxnHeader` values. It takes an input parameter `eosId` of type `uint32`.
    function getListTxnHeader(uint32 eosId) external override view returns (TxnHeader[] memory) {
        bytes32[] memory hashIds = txnHeaderHashId[eosId];
        uint256 len = hashIds.length;
        TxnHeader[] memory response = new TxnHeader[](len);

        for (uint256 i = 0; i < len; i++) {
            response[i] = txnHeaderInformation[hashIds[i]];
        }

        return response;
    }

    // batch store header
    //The `batchStoreHeader` function is used to store multiple headers in the `Header` contract. It takes two input parameters: `data` of type `bytes32[]` and `infoArray` of type `TxnHeader[]`.
    function batchStoreHeader(bytes32[] memory data, TxnHeader[] memory infoArray) external override onlyOperator {
        require(
            data.length > 0 && data.length == infoArray.length,
            "Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length"
        );

        for (uint256 i = 0; i < data.length; i++) {
            if (txnHeaderInformation[data[i]].p1.startOfTransaction == 0) {
                txnHeaderHashId[infoArray[i].p1.eosId].push(data[i]);
                txnHeaderInformation[data[i]] = infoArray[i];
            }
        }
    }

    // batch verify header
    // The `batchVerifyHeader` function is a view function that takes an array of `bytes32` values as input and returns an array of boolean values.
    function batchVerifyHeader(bytes32[] memory data) external override view returns (bool[] memory) {
        bool[] memory output = new bool[](data.length);

        for (uint256 i = 0; i < data.length; i++) {
            output[i] = txnHeaderInformation[data[i]].p1.startOfTransaction > 0;
        }
        return output;
    }

    // get header by hashID
    //The `getTxnHeaderInformation` function is a public function that takes a `bytes32` parameter `data` and returns a `TxnHeader` value.
    function getTxnHeaderInformation(bytes32 data) external override returns (TxnHeader memory) {
        return txnHeaderInformation[data];
    }
}
