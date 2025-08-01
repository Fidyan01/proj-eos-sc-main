import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import { config as dotenvConfig } from "dotenv";
import { readdirSync } from "fs";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { join, resolve } from "path";
import "solidity-coverage";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// init typechain for the first time
try {
  readdirSync(join(__dirname, "typechain"));
  require("./tasks");
} catch {
  //
}

const chainIds = {
  arbitrum: 42161,
  avalanche: 43114,
  bsc: 56,
  hardhat: 31337,
  mainnet: 1,
  optimism: 10,
  "polygon-mainnet": 137,
  mumbai: 80001,
  ropsten: 3,
  kovan: 42,
  rinkeby: 4,
  goerli: 5,
  bsctestnet: 97,
  "arbitrum-sepolia": 421614,
};

// Ensure that we have all the environment variables we need.
const deployerPrivateKey: string | undefined = process.env.DEPLOYER_PRIVATE_KEY;
if (!deployerPrivateKey) {
  throw new Error("Please set your DEPLOYER_PRIVATE_KEY in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "avalanche":
      jsonRpcUrl = "https://api.avax.network/ext/bc/C/rpc";
      break;
    case "bsc":
      jsonRpcUrl = "https://bsc-dataseed1.binance.org";
      break;
    case "bsctestnet":
      jsonRpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
      break;
    case "arbitrum-sepolia":
      jsonRpcUrl = "https://arbitrum-sepolia.infura.io/v3/" + infuraApiKey;
      break;
    case "mumbai":
      jsonRpcUrl = "https://polygon-mumbai.blockpi.network/v1/rpc/public";
      break;
    default:
      jsonRpcUrl = "https://" + chain + ".infura.io/v3/" + infuraApiKey;
  }

  return {
    accounts: [`0x${deployerPrivateKey}`],
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    arbitrum: getChainConfig("arbitrum"),
    avalanche: getChainConfig("avalanche"),
    bsc: getChainConfig("bsc"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism"),
    "polygon-mainnet": getChainConfig("polygon-mainnet"),
    mumbai: getChainConfig("mumbai"),
    mumbai1: getChainConfig("mumbai"),
    rinkeby: getChainConfig("rinkeby"),
    goerli: getChainConfig("goerli"),
    kovan: getChainConfig("kovan"),
    ropsten: getChainConfig("ropsten"),
    bsctestnet: getChainConfig("bsctestnet"),
    "arbitrum-sepolia": getChainConfig("arbitrum-sepolia"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./deployments/migrations",
    deployments: "./deployments/artifacts",
  },
  solidity: {
    version: "0.8.13",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        // bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 0,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  namedAccounts: {
    deployer: 0,
  },
};

export default config;
