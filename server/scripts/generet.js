const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const pkey = secp.secp256k1.utils.randomPrivateKey();
const publickey = secp.secp256k1.getPublicKey(pkey);


console.log(toHex(pkey));
console.log("public:"+toHex(publickey));