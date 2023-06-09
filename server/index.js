const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { toBuffer } = require("ethereum-cryptography/utils");
const { sign, recoverPublicKey } = require("ethereum-cryptography/secp256k1");
const { Buffer } = require("buffer");

app.use(cors());
app.use(express.json());

const balances = {
  "039c8baa0cbd462688380dd6b1d1678b1978695c250d6788d95376f3e3892adc76": 100,
  "025d7c5e2a11c34582d5e62ef487e0322bbbd0d0685dfdf3ed7ff38a7088dc5f55": 50,
  "039a09bdc38527b9b00ad46776281cb68589b634937220a25c0d09867b1c58d7f5": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  //const sender =  req.body.sender;
  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const messageHash = toBuffer(`send ${amount} to ${recipient}`);
  const publicKey = recoverPublicKey(messageHash, signature);
  if (!publicKey || !publicKey.equals(toBuffer(sender, "hex"))) {
    res.status(400).send({ message: "Invalid signature!" });
    return;
  }


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

// PS E:\ecdsa-node\server> node scripts/generet.js
// 4192f85919504d7b6e7f56a8b179087f49246efd22d54cd885146729d64d5945
// public:039c8baa0cbd462688380dd6b1d1678b1978695c250d6788d95376f3e3892adc76
// PS E:\ecdsa-node\server> node scripts/generet.js
// c6c388a2a69aab6d601b7d5ddd3f8d01b203203b2402bd7e4814f3b9ecb27457
// public:4192f85919504d7b6e7f56a8b179087f49246efd22d54cd885146729d64d5945
// PS E:\ecdsa-node\server> node scripts/generet.js
// c7b1e79891b3529afbda657e147d50f24efacb9d53631754c056031554c7e3be
// public:039a09bdc38527b9b00ad46776281cb68589b634937220a25c0d09867b1c58d7f5