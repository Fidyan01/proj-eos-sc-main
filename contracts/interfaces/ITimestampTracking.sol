//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

interface ITimestampTracking {
    struct Timestamp {
        uint64 timestamp;
        uint32 eosId;
        uint32 eventSubStage;
        uint32 field1;
        uint32 field2;
        uint32 field3;
        uint32 field4;
        string field5;
        string field6;
        string field7;
        string field8;
        string field9;
    }

    struct EventSubStageTimestamp {
        uint32 eventSubStage;
        uint64 timestamp;
        uint32 field1;
        uint32 field2;
        uint32 field3;
        uint32 field4;
        string field5;
        string field6;
        string field7;
        string field8;
        string field9;
    }

    struct EventSubStageTimestamps {
        EventSubStageTimestamp e1;
        EventSubStageTimestamp e2;
        EventSubStageTimestamp e3;
        EventSubStageTimestamp e4;
    }

    function addEventSubStageTimestamps(uint32[] memory eosId, EventSubStageTimestamps[] memory data) external;
    function batchVerifyTimestamps(Timestamp[] memory data) view external returns (bool[] memory);
    function getListTimestampByEOSID(uint32 eosId) external view returns (EventSubStageTimestamps[] memory);
}

