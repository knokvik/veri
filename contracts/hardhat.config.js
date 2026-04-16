require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: "../.env" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    polygon_amoy: {
      url: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
