const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy unified VeriCredit
  const VeriCredit = await hre.ethers.getContractFactory("VeriCredit");
  const veriCredit = await VeriCredit.deploy();
  await veriCredit.deployed();
  console.log("VeriCredit Token deployed to:", veriCredit.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
