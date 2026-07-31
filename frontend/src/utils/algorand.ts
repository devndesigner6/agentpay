import algosdk from 'algosdk'


export async function createUSDCTransaction(
  senderAddress: string,
  receiverAddress: string,
  amountInUSDC: number,
  usdcAssetId: number,
  network: string = 'mainnet'
) {
  const isTestnet = network.toLowerCase().includes('testnet') || network.includes('wGHE2WDvStZudn2RePZ6m4h+i07pHHMH5P5Vn7878VQ=')
  const algodUrl = isTestnet
    ? 'https://testnet-api.algonode.cloud'
    : 'https://mainnet-api.algonode.cloud'

  const algodClient = new algosdk.Algodv2('', algodUrl, '')
  const suggestedParams = await algodClient.getTransactionParams().do()

  // USDC has 6 decimals on Algorand
  const amountInMicroUSDC = Math.round(amountInUSDC * 1_000_000)

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: receiverAddress,
    assetIndex: usdcAssetId,
    amount: amountInMicroUSDC,
    suggestedParams,
  })

  return txn
}
