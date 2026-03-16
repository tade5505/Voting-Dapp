const connectButton = document.getElementById('connectButton');
const accountEl = document.getElementById('account');
const statusEl = document.getElementById('status');
const candidatesEl = document.getElementById('candidates');

let web3;
let contract;
let userAccount;
let hasVoted = false;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#f77' : 'var(--text)';
}

async function loadContract() {
  const res = await fetch('contract.json');
  const data = await res.json();

  if (!data.address || !data.abi || data.address.length === 0) {
    setStatus('⚠️ Contract address is missing. Run `npm run deploy` and refresh.', true);
    return null;
  }

  return new web3.eth.Contract(data.abi, data.address);
}

async function refreshUI() {
  if (!contract) return;

  const count = await contract.methods.getCandidateCount().call();
  candidatesEl.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const candidate = await contract.methods.candidates(i).call();
    const name = candidate[0] || candidate.name;
    const votes = candidate[1] || candidate.voteCount;

    const item = document.createElement('div');
    item.className = 'candidate';

    const info = document.createElement('div');
    info.innerHTML = `<h3>${name}</h3><p>Votes: <strong>${votes}</strong></p>`;

    const button = document.createElement('button');
    button.className = 'voteButton';
    button.textContent = hasVoted ? 'Already voted' : 'Vote';
    button.disabled = hasVoted;
    button.addEventListener('click', async () => {
      try {
        setStatus('Submitting vote…');
        await contract.methods.vote(i).send({ from: userAccount });
        setStatus('✅ Vote recorded! Refreshing…');
        hasVoted = true;
        await refreshUI();
      } catch (err) {
        setStatus('⚠️ Vote failed: ' + (err.message || err), true);
      }
    });

    item.appendChild(info);
    item.appendChild(button);
    candidatesEl.appendChild(item);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus('⚠️ MetaMask (or another Web3 wallet) is required to use this app.', true);
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);

    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];

    accountEl.textContent = `Connected: ${userAccount}`;
    setStatus('✅ Connected. Loading contract...');

    contract = await loadContract();

    if (contract) {
      const voted = await contract.methods.hasVoted(userAccount).call();
      hasVoted = voted;
      await refreshUI();
      setStatus(hasVoted ? 'You have already voted.' : 'You can vote now.');
    }
  } catch (err) {
    setStatus('⚠️ Connection rejected or failed. ' + (err.message || err), true);
  }
}

connectButton.addEventListener('click', connectWallet);

// Auto-connect if user already authorized
window.addEventListener('load', async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet();
  }
});
