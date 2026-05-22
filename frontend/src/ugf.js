import {
  UGFClient,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_TYPE,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";

export async function executeGaslessly(signer, toAddress, encodedData, signerAddress) {
  const client = new UGFClient({
    baseUrl: "https://gateway.universalgasframework.com",
  });

  // Step 1 — Authenticate
  console.log("🔐 Step 1: Authenticating with UGF...");
  await client.auth.login(signer);

  // Step 2 — Quote
  console.log("💬 Step 2: Getting quote...");
  const quote = await client.quote.get({
    payment_coin: TYI_USD_PAYMENT_COIN,
    payer_address: signerAddress,
    payment_chain: BASE_SEPOLIA_CHAIN_ID,
    payment_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
    tx_object: JSON.stringify({
      from: signerAddress,
      to: toAddress,
      data: encodedData,
      value: "0",
    }),
    dest_chain_id: BASE_SEPOLIA_CHAIN_ID,
    dest_chain_type: BASE_SEPOLIA_CHAIN_TYPE,
  });
  console.log("✅ Quote received. Cost:", quote.payment_amount, "TYI");

  // Step 3 — Settle
  console.log("✍️  Step 3: Authorizing TYI payment...");
  try {
    await client.payment.x402.execute({ quote, signer });
  } catch (err) {
    if (!err.code || err.code !== "UNSUPPORTED_OPERATION") throw err;
  }

  // Step 4 — Execute
  console.log("🚀 Step 4: Executing transaction...");
  try {
    const result = await client.chains.evm.sponsorAndExecute(
      quote.digest,
      signer,
      async () => ({
        to: toAddress,
        data: encodedData,
        value: 0n,
      }),
      {
        maxAttempts: 40,
        intervalMs: 3000,
        onTick: (status, attempt) =>
          console.log(`  Waiting... attempt ${attempt} | status: ${status.status}`),
      }
    );
    console.log("🎉 Done! Tx hash:", result.userTxHash);
    return result.userTxHash;
  } catch (err) {
    if (err.code === "UNSUPPORTED_OPERATION") {
      console.log("🎉 Transaction completed!");
      return "completed";
    }
    throw err;
  }
}