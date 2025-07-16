//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interfaces/IHeaderTracking.sol";
import "./interfaces/ITimestampTracking.sol";

// This is the wrapper smart contract to be called by EOS Blockchain APIs
// This smart contract will initialize Header and Timestamp smart contracts which the detailed logic of functions are implemented
contract TimestampTrackingForEOS is AccessControlUpgradeable {
    bytes32 public constant AUTHORIZER_ROLE = keccak256("AUTHORIZER_ROLE");
    address public headerTrackingAddress;
    address public timestampTrackingAddress;

    // initialize smart contract Header and Timestamp
    function initialize(
        address header,
        address timestamp
    ) external initializer {
        __AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AUTHORIZER_ROLE, msg.sender);
        headerTrackingAddress = header;
        timestampTrackingAddress = timestamp;
    }

    // check if the sender address is an authorized address
    modifier onlyAuthorized() {
        require(hasRole(AUTHORIZER_ROLE, msg.sender), "No authority");
        _;
    }

    function setHeaderContract(address header) public onlyAuthorized {
        headerTrackingAddress = header;
    }

    function setTimestampContract(address timestamp) public onlyAuthorized {
        timestampTrackingAddress = timestamp;
    }

    // The `addEventSubStageTimestamps` function is a public function that can only be called by an authorized address. It takes two parameters: `eosId`, an array of `uint32` values, and `data`, an array of `ITimestampTracking.EventSubStageTimestamps` structs.
    function addEventSubStageTimestamps(uint32[] memory eosId, ITimestampTracking.EventSubStageTimestamps[] memory data) external onlyAuthorized {
        ITimestampTracking(timestampTrackingAddress).addEventSubStageTimestamps(eosId, data);
    }
    // This function validate if the input data (EOS events timestamp data) is matching with the data stored on blockchain
    function batchVerifyTimestamps(ITimestampTracking.Timestamp[] memory data) view public returns (bool[] memory) {
        return ITimestampTracking(timestampTrackingAddress).batchVerifyTimestamps(data);
    }

    // this function queries and returns a list of events timestamps data for an EOS transaction
    function getListTimestampByEOSID(uint32 eosId) public view returns (ITimestampTracking.EventSubStageTimestamps[] memory) {
        return ITimestampTracking(timestampTrackingAddress).getListTimestampByEOSID(eosId);
    }

    function getListTxnHeaderHashById(uint32 eosId) external view returns (bytes32[] memory) {
        return IHeaderTracking(headerTrackingAddress).getListTxnHeaderHashById(eosId);
    }
    // this fucntion gets transaction data (at header level) for an EOS transaction
    function getListTxnHeader(uint32 eosId) external view returns (IHeaderTracking.TxnHeader[] memory) {
        return IHeaderTracking(headerTrackingAddress).getListTxnHeader(eosId);
    }
    // this function stores the EOS transaction data (header level) into blockchain
    function batchStoreHeader(bytes32[] memory data, IHeaderTracking.TxnHeader[] memory infoArray) external onlyAuthorized {
        IHeaderTracking(headerTrackingAddress).batchStoreHeader(data, infoArray);
    }
    // this function validate if the input EOS transaction data (at header level) matches with the data stored on blockchain
    function batchVerifyHeader(bytes32[] memory data) external view returns (bool[] memory) {
        return IHeaderTracking(headerTrackingAddress).batchVerifyHeader(data);
    }

    function txnHeaderInformation(bytes32 data) external returns (IHeaderTracking.TxnHeader memory) {
        return IHeaderTracking(headerTrackingAddress).getTxnHeaderInformation(data);
    }

}
