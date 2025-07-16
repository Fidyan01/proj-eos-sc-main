import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const headerAddress = "0x9760F7E7db0Fc28ff5a96cA80Ce8Efa0f83F9064";
  const timestampAddress = "0x11e86Cbd04Ab0D81f79c06eED40C8dF0Bb205ca0";

  await deploy("TimestampTrackingForEOS", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      proxyContract: "OptimizedTransparentProxy",
      owner: deployer,
      // execute: {
      //   init: {
      //     methodName: "initialize",
      //     args: [
      //       headerAddress,
      //       timestampAddress
      //     ],
      //   },
      // },
    },
  });
};

func.tags = ["tracking"];
export default func;
