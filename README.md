# RedVote — On-Chain Voting DApp

A simple on-chain voting dApp that lets users vote for candidates using a wallet (MetaMask) on a local Ganache blockchain.

## ✅ Features

- One wallet = one vote (enforced on-chain)
- Votes are stored on-chain and reflected in the UI instantly
- UI updates automatically when the connected wallet/account changes
- Runs fully locally to make it easy for reviewers to run

---

## 🛠️ Setup (Windows)

1. **Install dependencies**

   ```powershell
   cd voting
   npm install
   ```

2. **Start Ganache** (local blockchain)

   ```powershell
   npx ganache --deterministic --chainId 1337
   ```

3. **Deploy the contract**

   ```powershell
   npm run deploy
   ```

   This writes the deployed contract address + ABI to `voting/ui/contract.json`.

4. **Start the UI**

   ```powershell
   npm run start
   ```

   Then open:
   - http://localhost:8080

5. **Connect MetaMask**

   - Point MetaMask to: `http://127.0.0.1:7545`
   - Connect your account
   - The UI will automatically update when you switch accounts

---

## 🧠 How the UI works

- The UI reads `ui/contract.json` to find the deployed contract address + ABI.
- When you connect a wallet, it checks the contract to see if you have already voted.
- If you switch accounts, the UI automatically updates to show voting status for that wallet.

---

## 👨‍💻 Development notes

- The smart contract lives in `contracts/Voting.sol`.
- The UI is in `ui/`.
- The deployment script is `deploy.js`.
- Candidates are set at deployment time (Alice, Bob, Charlie by default).

---

Enjoy! 🎉
