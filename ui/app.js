const connectButton = document.getElementById('connectButton');
const accountEl = document.getElementById('account');
const statusEl = document.getElementById('status');
const candidatesEl = document.getElementById('candidates');

let web3;
let contract;
let userAccount;
let hasVoted = false;
let votedIndex = null;
let isRefreshing = false;
let accountSwitchTimeout = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#f77' : 'var(--text)';
}

async function loadContract() {
  const res = await fetch('contract.json');
  const data = await res.json();

  if (!data.address || !data.abi || data.address.length === 0) {
    setStatus('Deploy the contract first: npm run deploy', true);
    return null;
  }

  return new web3.eth.Contract(data.abi, data.address);
}

async function refreshUI() {
  if (!contract || isRefreshing) return;

  isRefreshing = true;

  try {
    const count = await contract.methods.getCandidateCount().call();
    candidatesEl.innerHTML = '';

    for (let i = 0; i < count; i += 1) {
      const candidate = await contract.methods.candidates(i).call();
      const name = candidate[0] || candidate.name;
      const votes = candidate[1] || candidate.voteCount;
      const isYourVote = hasVoted && votedIndex !== null && Number(votedIndex) === i;

      const item = document.createElement('div');
      item.className = `candidate ${isYourVote ? 'voted' : ''}`;
      item.setAttribute('role', 'listitem');

      // Candidate Info
      const info = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = name;

      const voteCount = document.createElement('p');
      voteCount.innerHTML = `Votes: <span class="candidate-votes">${votes}</span>`;

      info.appendChild(title);
      info.appendChild(voteCount);

      if (isYourVote) {
        const indicator = document.createElement('p');
        indicator.className = 'candidate-indicator';
        indicator.textContent = '✓ Your vote';
        info.appendChild(indicator);
      }

      // Vote Button
      const button = document.createElement('button');
      button.className = 'voteButton';
      button.textContent = hasVoted ? 'Already voted' : 'Vote';
      button.disabled = hasVoted;
      button.setAttribute('aria-label', `Vote for ${name}`);

      button.addEventListener('click', async () => {
        try {
          setStatus('Submitting vote…');
          await contract.methods.vote(i).send({ from: userAccount });
          setStatus('✓ Vote recorded!');
          await refreshAccountState(userAccount);
        } catch (err) {
          setStatus('Could not vote: ' + (err.message || err), true);
        }
      });

      item.appendChild(info);
      item.appendChild(button);
      candidatesEl.appendChild(item);
    }
  } finally {
    isRefreshing = false;
  }
}
async function refreshAccountState(account) {
  if (!contract || !account) return;

  userAccount = account;
  accountEl.textContent = userAccount;

  const voted = await contract.methods.hasVoted(userAccount).call();

  hasVoted = voted;
  votedIndex = hasVoted ? await contract.methods.voteIndex(userAccount).call() : null;

  await refreshUI();
  setStatus(hasVoted ? 'Ready to view results' : 'Ready to vote');
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus('MetaMask required — install it to proceed', true);
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);

    contract = await loadContract();
    if (!contract) return;

    await refreshAccountState(accounts[0]);

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accountSwitchTimeout) clearTimeout(accountSwitchTimeout);

      if (accounts.length === 0) {
        setStatus('Wallet disconnected', true);
        return;
      }

      accountSwitchTimeout = setTimeout(async () => {
        await refreshAccountState(accounts[0]);
      }, 100);
    });

    window.ethereum.on('chainChanged', () => window.location.reload());
  } catch (err) {
    setStatus('Connection failed — ' + (err.message || err), true);
  }
}

connectButton.addEventListener('click', connectWallet);

// Auto-connect if user already authorized
window.addEventListener('load', async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet();
  }
});
