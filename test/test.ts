import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

let owner: any;
let user1: any;
let transactionSigner: any;
let receiver: any;
let Token: any;
let TokenAddress: any;
let Bridge: any;
let BridgeAddress: any;
describe("Create Initial Contracts of all types", function () {
  it("get accounts", async function () {
    [owner, user1, transactionSigner, receiver] = await ethers.getSigners();
    console.log("\tAccount address\t", await owner.getAddress());
  });
  it("should deploy LBTC Token Contract", async function () {
    const instanceToken = await ethers.getContractFactory("LuxBTC");
    Token = await instanceToken.deploy();
    TokenAddress = await Token.getAddress();
    console.log("\tToken Contract deployed at:", TokenAddress);
  });
  it("should deploy Bridge Contract", async function () {
    const instanceBridge = await ethers.getContractFactory("Bridge");
    Bridge = await instanceBridge.deploy();
    BridgeAddress = await Bridge.getAddress();
    console.log("\tBridge Contract deployed at:", BridgeAddress);
  });
  it("should set Bridge Address as Admin of Token Contract", async function () {
    await Token.grantAdmin(BridgeAddress);
  });
  it("add setMPCOracle of bridge ", async function () {
    await Bridge.setMPCOracle("0xd4a215472332e8b6e26b0a5dc253db78119904ca");
    await Bridge.setPayoutAddress(receiver, BigInt(1e17));
    // await Bridge.setMPCOracle(TokenAddress);
  });
});

describe("Mint Token to LBTC contract", async function () {
  it("mint", async function () {
    await Token.mint(user1, ethers.parseEther("100"));
    expect(await Token.balanceOf(user1)).to.equal(ethers.parseEther("100"));
  });
});

describe("Bridge Test", async function () {
  it("first burn and then burn", async function () {
    const tx = await Bridge.connect(user1).bridgeBurn(
      ethers.parseEther("55"),
      TokenAddress
    );
    expect(await Token.balanceOf(user1)).to.equal(ethers.parseEther("45"));
    const receipt = await tx.wait();
    const transactionHash = receipt.hash;
    console.log("\tBridge Burn Transaction Hash:", transactionHash);
    const chainId = await ethers.provider
      .getNetwork()
      .then((network) => network.chainId);
    console.log("\tchainId:", chainId);
    await Bridge.bridgeMintStealth(
      ethers.parseEther("55"),
      "0x3f957a9139ec0555510f5a01e3da851e75171a134e4f93c14227ee624c85595a",
      "0xA6553498E25d509040B2Df7330aFA99Cb9EEbff9",
      "0xf284066ef0a93f34f7fed811fadd7b64e2e89e79c7c4ed5d320aa555cd4f7c2c0244cc3c5ccbd48e09da594cd58fc5aa4eda6c56aa686804cdbf46a2f3ef0e3d1b",
      "0x42449554b0c7d85ebd488e14d7d48c6a78d3f9be",
      String(97),
      "false"
    );
  });
  it("check balance", async function(){
    const balance_target = await Token.balanceOf("0xA6553498E25d509040B2Df7330aFA99Cb9EEbff9");
    console.log("balance_target: ", balance_target);
    const balance_fee = await Token.balanceOf(receiver);
    console.log("balance_fee: ", balance_fee);
  })
});
