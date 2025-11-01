// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {TestNFT} from "../src/TestNFT.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {NFTStaking} from "../src/NFTStaking.sol";
import {NFTLoan} from "../src/NFTLoan.sol";

contract DeployScript is Script {
    function run() external {
        // Read configuration from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address rewardToken = vm.envOr("REWARD_TOKEN_ADDRESS", address(0));
        
        console.log("Deploying contracts to Sepolia...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy Test NFT contract
        console.log("\n1. Deploying TestNFT...");
        TestNFT nft = new TestNFT("Test NFT", "TNFT");
        console.log("TestNFT deployed at:", address(nft));

        // Step 2: Deploy NFT Marketplace
        console.log("\n2. Deploying NFTMarketplace...");
        NFTMarketplace marketplace = new NFTMarketplace(address(nft));
        console.log("NFTMarketplace deployed at:", address(marketplace));

        // Step 3: Deploy NFT Staking
        console.log("\n3. Deploying NFTStaking...");
        NFTStaking staking = new NFTStaking(address(nft), rewardToken);
        console.log("NFTStaking deployed at:", address(staking));

        // Step 4: Deploy NFT Loan
        console.log("\n4. Deploying NFTLoan...");
        NFTLoan loan = new NFTLoan(address(nft));
        console.log("NFTLoan deployed at:", address(loan));

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("TestNFT:", address(nft));
        console.log("Marketplace:", address(marketplace));
        console.log("Staking:", address(staking));
        console.log("Loan:", address(loan));
        console.log("\nCopy the addresses to frontend/.env:");
        console.log("VITE_NFT_CONTRACT_ADDRESS=", address(nft));
        console.log("VITE_NFT_MARKETPLACE_ADDRESS=", address(marketplace));
        console.log("VITE_NFT_STAKING_ADDRESS=", address(staking));
        console.log("VITE_NFT_LOAN_ADDRESS=", address(loan));
    }
}


