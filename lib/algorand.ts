import algosdk from 'algosdk';

// Algorand client configuration
const algodServer = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const algodToken = process.env.ALGOD_TOKEN || '';
const algodPort = process.env.ALGOD_PORT || '';

// Initialize Algorand clients
export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
export const indexerClient = new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', '');

/**
 * Send an Algorand transaction
 */
export async function sendTransaction(params: {
  mnemonic: string;
  recipientAddress: string;
  amount: number;
  note?: string;
}) {
  const { mnemonic, recipientAddress, amount, note } = params;

  if (!algosdk.isValidAddress(recipientAddress)) {
    throw new Error('Invalid recipient address');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const senderAccount = algosdk.mnemonicToSecretKey(mnemonic);
  const suggestedParams = await algodClient.getTransactionParams().do();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: senderAccount.addr,
    receiver: recipientAddress,
    amount: algosdk.algosToMicroalgos(amount),
    note: note ? new Uint8Array(Buffer.from(note)) : undefined,
    suggestedParams
  });

  const signedTxn = txn.signTxn(senderAccount.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  
  // AlgoSDK v3 returns txid (lowercase) or txId - handle both
  const txId = (response as any).txid || (response as any).txId || txn.txID();

  return {
    txId,
    from: senderAccount.addr.toString(),
    to: recipientAddress,
    amount,
    note,
  };
}

/**
 * Check the status of a transaction
 */
export async function checkTransactionStatus(txId: string) {
  try {
    // First try the indexer (most reliable for confirmed transactions)
    const txnInfo = await indexerClient.lookupTransactionByID(txId).do();
    if (txnInfo.transaction) {
      console.log(`Indexer status check: confirmed for tx ${txId}`);
      return {
        txId,
        status: 'confirmed',
        confirmedRound: txnInfo.transaction.confirmedRound,
      };
    }
  } catch (indexerError) {
    console.log(`Indexer status check error: ${indexerError}`);
    // If indexer doesn't find it, try algod for pending status
    try {
      const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
      
      // Check if transaction is confirmed
      if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
        console.log(`Algod status check: confirmed for tx ${txId}`);
        return {
          txId,
          status: 'confirmed',
          confirmedRound: pendingInfo.confirmedRound,
        };
      }

      // Check for pool error
      if (pendingInfo.poolError && pendingInfo.poolError.length > 0) {
        console.log(`Algod status check: failed for tx ${txId}`);
        return {
          txId,
          status: 'failed',
          poolError: pendingInfo.poolError,
        };
      }

      // Transaction is still pending
      console.log(`Algod status check: pending for tx ${txId}`);
      return { txId, status: 'pending' };
    } catch (algodError: any) {
      console.log(`Algod status check error: ${algodError}`);
      // If both fail, transaction likely failed or doesn't exist
      return {
        txId,
        status: 'failed',
        poolError: algodError.message || 'Transaction not found',
      };
    }
  }

  // Shouldn't reach here, but default to pending
  console.log(`Default status check: pending for tx ${txId}`);
  return { txId, status: 'pending' };
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    // Convert from microAlgos to Algos
    return Number(accountInfo.amount) / 1000000;
  } catch (error: any) {
    if (error.status === 404) {
      return 0;
    }
    throw error;
  }
}
