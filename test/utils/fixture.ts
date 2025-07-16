import { deployContract, Fixture } from "ethereum-waffle";

import * as TimestampTrackingForEOSJSON from "../../artifacts/contracts/TimestampTrackingForEOS.sol/TimestampTrackingForEOS.json";
import { TimestampTrackingForEOS } from "../../typechain";

interface IFixture {
  timeTracking: TimestampTrackingForEOS
}

export const fixture: Fixture<IFixture | any> = async ([wallet]) => {
  // const
  const timeTracking = (await deployContract(wallet as any, TimestampTrackingForEOSJSON)) as unknown as TimestampTrackingForEOS;
  await timeTracking.initialize();
  return {
    timeTracking,
  };
};
