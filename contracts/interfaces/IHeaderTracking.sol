//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

interface IHeaderTracking {
    struct TxnHeaderP1 {
        uint32 eosId;
        uint256 startOfTransaction;
        uint256 endOfTransaction;
        string imoNumber;
        string arrivalID;
        string vesselName;
        string jetty;
        string terminalName;
        string traderName;
        string agent;
        string status;
        uint32 berthingPilotageID;
        uint32 vesselSize;
    }

    struct TxnHeaderP2 {
        string pilotageLocationFrom1;
        string pilotageLocationTo1;
        string arrivalStatus;
        uint32 unberthingPilotageID;
        string pilotageLocationFrom2;
        string pilotageLocationTo2;
    }

    struct TxnHeader {
        TxnHeaderP1 p1;
        TxnHeaderP2 p2;
    }

    function getListTxnHeaderHashById(uint32 eosId) external view returns (bytes32[] memory);
    function getListTxnHeader(uint32 eosId) external view returns (TxnHeader[] memory);
    function batchStoreHeader(bytes32[] memory data, TxnHeader[] memory infoArray) external;
    function batchVerifyHeader(bytes32[] memory data) external view returns (bool[] memory);
    function getTxnHeaderInformation(bytes32 data) external returns (TxnHeader memory);
}
