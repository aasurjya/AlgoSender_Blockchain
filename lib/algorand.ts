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
    from: senderAccount.addr,
    to: recipientAddress,
    amount: algosdk.algosToMicroalgos(amount),
    note: note ? new Uint8Array(Buffer.from(note)) : undefined,
    suggestedParams
  });

  const signedTxn = txn.signTxn(senderAccount.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  // AlgoSDK response typing issue - the response contains txId
  const txId = (response as any).txId;

  return {
    txId,
    from: senderAccount.addr,
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
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();

    if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
      return {
        txId,
        status: 'confirmed',
        confirmedRound: pendingInfo.confirmedRound,
      };
    }

    if (pendingInfo.poolError && pendingInfo.poolError.length > 0) {
      return {
        txId,
        status: 'failed',
        poolError: pendingInfo.poolError,
      };
    }

    return { txId, status: 'pending' };
  } catch (error: any) {
    try {
      const txnInfo = await indexerClient.lookupTransactionByID(txId).do();
      if (txnInfo.transaction) {
        return {
          txId,
          status: 'confirmed',
          confirmedRound: txnInfo.transaction.confirmedRound,
        };
      }
    } catch (indexerError) {
      // ignore
    }

    return {
      txId,
      status: 'failed',
      poolError: error.message || 'Transaction not found',
    };
  }
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
