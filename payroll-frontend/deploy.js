/* eslint-env node */
/* global process */
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import solc from "solc";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // 1. Configuration
    const providerUrl = "http://10.10.8.49:7545"; // Ganache RPC
    const privateKey = "0x477443fd2df492fe192151927b921193de5bc78761d4422e23cdc7b435dfb245"; // <--- USER MUST REPLACE THIS

    // 2. Read Contract Source
    const contractPath = path.resolve(__dirname, "../PayrollSystem.sol");
    const source = fs.readFileSync(contractPath, "utf8");

    // 3. Compile
    const input = {
        language: "Solidity",
        sources: {
            "PayrollSystem.sol": {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
            evmVersion: "paris",
        },
    };

    console.log("Compiling contract...");
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        // If there are errors (not just warnings), exit
        if (output.errors.some(e => e.severity === 'error')) {
            process.exit(1);
        }
    }

    const contractFile = output.contracts["PayrollSystem.sol"]["PayrollSystem"];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    // 4. Deploy
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log("Deploying contract...");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log(`Contract deployed to: ${contractAddress}`);

    // 5. Update Config Automatically
    const configPath = path.resolve(__dirname, "src/contractConfig.js");
    const configContent = `import abi from './abi.json';

// Replace with actual deployed contract address
export const CONTRACT_ADDRESS = "${contractAddress}"; 
export const CONTRACT_ABI = abi;
`;
    fs.writeFileSync(configPath, configContent);

    // Update ABI file too
    fs.writeFileSync(path.resolve(__dirname, "src/abi.json"), JSON.stringify(abi, null, 2));

    console.log("Frontend config updated!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
