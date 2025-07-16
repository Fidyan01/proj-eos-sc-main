import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import {BigNumber, Wallet} from "ethers";
import { TimestampTrackingForEOS } from "../typechain/TimestampTrackingForEOS";
import { fixture } from "./utils/fixture";
describe("Unit tests for TimestampTracking",
  () => {
    // keccak256("AUTHORIZER_ROLE")
    const AuthorizeRoleHash = "0x14dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
    const DefaultAdminHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
    let wallets: Wallet[];
    let deployer: Wallet;
    let bob: Wallet;
    let timeTracking: TimestampTrackingForEOS;
    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>;

    before(async () => {
      wallets = await (ethers as any).getSigners();
      deployer = wallets[0];
      bob = wallets[1];
    });
    describe("TimestampTracking", () => {
      beforeEach(async () => {
        loadFixture = waffle.createFixtureLoader(wallets as any);
        ({ timeTracking } = await loadFixture(fixture));
      });
      it("check user's permission", async () => {
        expect(await timeTracking.hasRole(AuthorizeRoleHash, deployer.address)).to.equal(true);
        expect(await timeTracking.hasRole(DefaultAdminHash, deployer.address)).to.equal(true);
        expect(await timeTracking.hasRole(AuthorizeRoleHash, bob.address)).to.equal(false);
        expect(await timeTracking.hasRole(DefaultAdminHash, bob.address)).to.equal(false);
      });

      it("check store a hash", async () => {
        const hashId = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const eosId = 1000;
        const unixTime = Date.now();
        const timestampData = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime
        }
        await timeTracking.storeTimestamps(hashId, timestampData);
        const unixTimeSaved = await timeTracking.getTimestamp(hashId);
        expect(unixTimeSaved).to.equal(unixTime);

        const timestampDataV2 = timestampData;
        timestampDataV2.timestamp = unixTime + 1;

        await expect(timeTracking.connect(bob).storeTimestamps(hashId, timestampData)).to.be.revertedWith("No authority");
        await expect(timeTracking.connect(bob).storeTimestamps(invalidHashId, timestampData)).to.be.revertedWith("No authority");
        await expect(timeTracking.storeTimestamps(hashId, timestampDataV2)).to.be.revertedWith("Already published data");
      });

      it("check verify a hash", async () => {
        const hashId = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const eosId = 1000;
        const unixTime = Date.now();
        const timestampData = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime
        }
        await timeTracking.storeTimestamps(hashId, timestampData);
        const unixTimeSaved = await timeTracking.getTimestamp(hashId);
        expect(unixTimeSaved).to.equal(unixTime);
        let isOk = await timeTracking.verifyTimestamp(hashId);
        expect(isOk).to.equal(true);
        isOk = await timeTracking.verifyTimestamp(invalidHashId);
        expect(isOk).to.equal(false);

        const listEOS = await timeTracking.getListEOS(eosId);
        expect(listEOS[0].timestamp).to.equal(timestampData.timestamp);
        expect(listEOS[0].eosId).to.equal(timestampData.eosId);
        expect(listEOS[0].eventSubStage).to.equal(timestampData.eventSubStage);
      });

      it("check store batch hash", async () => {
        const hashId1 = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId2 = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId3 = "0x44dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId4 = "0x54dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId5 = "0x64dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x04dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const listHash = [hashId1, hashId2, hashId3, hashId4, hashId5];
        const eosId = 1000;
        const unixTime = Date.now();
        const timestampData1 = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime
        }
        const timestampData2 = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime + 1,
        }
        const timestampData3 = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime + 2,
        }
        const timestampData4 = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime + 3,
        }
        const timestampData5 = {
          eventSubStage: unixTime,
          eosId: eosId,
          timestamp: unixTime + 4,
        }
        const listTimestamp = [timestampData1, timestampData2, timestampData3, timestampData4, timestampData5];
        await expect(timeTracking.connect(bob).batchStoreTimestamps(listHash, listTimestamp)).to.be.revertedWith("No authority");
        await expect(timeTracking.batchStoreTimestamps([], [])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreTimestamps([hashId1], [])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreTimestamps([hashId1], [timestampData1, timestampData2])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreTimestamps([], [timestampData1])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await timeTracking.batchStoreTimestamps(listHash, listTimestamp);
        let unixTimeSaved = await timeTracking.getTimestamp(hashId1);
        expect(unixTimeSaved).to.equal(unixTime);
        unixTimeSaved = await timeTracking.getTimestamp(hashId2);
        expect(unixTimeSaved).to.equal(unixTime + 1);
        unixTimeSaved = await timeTracking.getTimestamp(hashId3);
        expect(unixTimeSaved).to.equal(unixTime + 2);
        unixTimeSaved = await timeTracking.getTimestamp(hashId4);
        expect(unixTimeSaved).to.equal(unixTime + 3);
        unixTimeSaved = await timeTracking.getTimestamp(hashId5);
        expect(unixTimeSaved).to.equal(unixTime + 4);
        await expect(timeTracking.getTimestamp(invalidHashId)).to.be.revertedWith("No hash ID");
        let listEOS = await timeTracking.getListEOS(eosId);
        expect(listEOS.length).to.equal(5);

        await timeTracking.batchStoreTimestamps(listHash, listTimestamp);
        unixTimeSaved = await timeTracking.getTimestamp(hashId1);
        expect(unixTimeSaved).to.equal(unixTime);

        const hashId6 = "0x74dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        await timeTracking.batchStoreTimestamps([hashId6, hashId1], [timestampData1, timestampData2]);
        unixTimeSaved = await timeTracking.getTimestamp(hashId6);
        expect(unixTimeSaved).to.equal(unixTime);
        // do not increase the timestamp
        unixTimeSaved = await timeTracking.getTimestamp(hashId1);
        expect(unixTimeSaved).to.equal(unixTime);

        listEOS = await timeTracking.getListEOS(eosId);
        expect(listEOS.length).to.equal(6);
      });

      it("check store a header", async () => {
        const hashId = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const eosId = 1000;
        const startTime = Date.now();
        const endTime = startTime + 60 * 60 * 24 * 1000;
        const headerData = {
          eosId: eosId,
          startOfTransaction: startTime,
          endOfTransaction: endTime,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        await timeTracking.batchStoreHeader([hashId], [headerData]);
        const header = await timeTracking.txnHeaderInformation(hashId);
        expect(header.eosId).to.equal(headerData.eosId);
        expect(header.startOfTransaction).to.equal(headerData.startOfTransaction);
        expect(header.endOfTransaction).to.equal(headerData.endOfTransaction);
        expect(header.imoNumber).to.equal(headerData.imoNumber);
        expect(header.arrivalID).to.equal(headerData.arrivalID);
        expect(header.totalThroughput).to.equal(headerData.totalThroughput);
        expect(header.vesselID).to.equal(headerData.vesselID);
        expect(header.jetty).to.equal(headerData.jetty);
        expect(header.totalDuration).to.equal(headerData.totalDuration);

        const headerData2 = headerData;
        headerData2.startOfTransaction = startTime + 1;

        await expect(timeTracking.connect(bob).batchStoreHeader([hashId], [headerData2])).to.be.revertedWith("No authority");
        await expect(timeTracking.connect(bob).batchStoreHeader([invalidHashId], [headerData2])).to.be.revertedWith("No authority");
      });

      it("check verify a hash with header", async () => {
        const hashId = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const eosId = 1000;
        const startTime = Date.now();
        const endTime = startTime + 60 * 60 * 24 * 1000;
        const headerData = {
          eosId: eosId,
          startOfTransaction: startTime,
          endOfTransaction: endTime,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        await timeTracking.batchStoreHeader([hashId], [headerData]);
        const header = await timeTracking.txnHeaderInformation(hashId);
        expect(header.eosId).to.equal(headerData.eosId);
        expect(header.startOfTransaction).to.equal(headerData.startOfTransaction);
        expect(header.endOfTransaction).to.equal(headerData.endOfTransaction);
        expect(header.imoNumber).to.equal(headerData.imoNumber);
        expect(header.arrivalID).to.equal(headerData.arrivalID);
        expect(header.totalThroughput).to.equal(headerData.totalThroughput);
        expect(header.vesselID).to.equal(headerData.vesselID);
        expect(header.jetty).to.equal(headerData.jetty);
        expect(header.totalDuration).to.equal(headerData.totalDuration);
        let isOk = await timeTracking.batchVerifyHeader([hashId]);
        expect(isOk.length).to.equal(1);
        expect(isOk[0]).to.equal(true);        // expect(isOk).to.equal(true);
        isOk = await timeTracking.batchVerifyHeader([invalidHashId]);
        expect(isOk.length).to.equal(1);
        expect(isOk[0]).to.equal(false);

        const listHeaders = await timeTracking.getListTxnHeader(eosId);
        expect(listHeaders.length).to.equal(1);
        const item = listHeaders[0];
        expect(item.eosId).to.equal(headerData.eosId);
        expect(item.startOfTransaction).to.equal(headerData.startOfTransaction);
        expect(item.endOfTransaction).to.equal(headerData.endOfTransaction);
        expect(item.imoNumber).to.equal(headerData.imoNumber);
        expect(item.arrivalID).to.equal(headerData.arrivalID);
        expect(item.totalThroughput).to.equal(headerData.totalThroughput);
        expect(item.vesselID).to.equal(headerData.vesselID);
        expect(item.jetty).to.equal(headerData.jetty);
        expect(item.totalDuration).to.equal(headerData.totalDuration)
      });

      it("check store batch txn headers", async () => {
        const hashId1 = "0x24dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId2 = "0x34dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId3 = "0x44dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId4 = "0x54dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const hashId5 = "0x64dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const invalidHashId = "0x04dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        const listHash = [hashId1, hashId2, hashId3, hashId4, hashId5];
        const eosId = 1000;
        const startTime = Date.now();
        const endTime = startTime + 60 * 60 * 24 * 1000;
        const headerData1 = {
          eosId: eosId,
          startOfTransaction: startTime,
          endOfTransaction: endTime,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        const headerData2 = {
          eosId: eosId,
          startOfTransaction: startTime + 1,
          endOfTransaction: endTime + 1,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        const headerData3 = {
          eosId: eosId,
          startOfTransaction: startTime + 2,
          endOfTransaction: endTime + 2,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        const headerData4 = {
          eosId: eosId,
          startOfTransaction: startTime + 3,
          endOfTransaction: endTime + 3,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        const headerData5 = {
          eosId: eosId,
          startOfTransaction: startTime + 4,
          endOfTransaction: endTime + 4,
          imoNumber: eosId,
          arrivalID: eosId,
          totalThroughput: eosId,
          vesselID: eosId,
          jetty: eosId.toString(),
          totalDuration: eosId
        }
        const listTxnHeaders = [headerData1, headerData2, headerData3, headerData4, headerData5];
        await expect(timeTracking.connect(bob).batchStoreHeader(listHash, listTxnHeaders)).to.be.revertedWith("No authority");
        await expect(timeTracking.batchStoreHeader([], [])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreHeader([hashId1], [])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreHeader([hashId1], [headerData1, headerData2])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await expect(timeTracking.batchStoreHeader([], [headerData1])).to.be.revertedWith("Incorrect input!!!, data length should be more than 0 and 2 arrays will have to be equal in length");
        await timeTracking.batchStoreHeader(listHash, listTxnHeaders);

        let listTnxHeader = await timeTracking.getListTxnHeader(eosId);
        expect(listTnxHeader.length).to.equal(5);

        const hashId6 = "0x74dd327f3834be9d0f7cf44f6cf11c96ded83bd68d1a1b3926d35739e7bb88d0";
        await timeTracking.batchStoreHeader([hashId6, hashId1], [headerData1, headerData2]);
        listTnxHeader = await timeTracking.getListTxnHeader(eosId);
        expect(listTnxHeader.length).to.equal(6);
        // check random item
        const item = listTnxHeader[4];
        expect(item.eosId).to.equal(headerData5.eosId);
        expect(item.startOfTransaction).to.equal(headerData5.startOfTransaction);
        expect(item.endOfTransaction).to.equal(headerData5.endOfTransaction);
        expect(item.imoNumber).to.equal(headerData5.imoNumber);
        expect(item.arrivalID).to.equal(headerData5.arrivalID);
        expect(item.totalThroughput).to.equal(headerData5.totalThroughput);
        expect(item.vesselID).to.equal(headerData5.vesselID);
        expect(item.jetty).to.equal(headerData5.jetty);
        expect(item.totalDuration).to.equal(headerData5.totalDuration)

      });
    });
});
