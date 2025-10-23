const { ethers } = require("ethers")

// Television contract ABI (only the functions we need)
const televisionAbi = [
  "function takeover(string memory uri, address channelOwner, uint256 epochId, uint256 deadline, uint256 maxPaymentAmount) external returns (uint256 paymentAmount)",
  "function getPrice() external view returns (uint256)",
  "function getSlot0() external view returns (tuple(uint8 locked, uint16 epochId, uint192 initPrice, uint40 startTime, address owner, string uri))"
]

const TELEVISION_CONTRACT_ADDRESS = "0x9C751E6825EDAa55007160b99933846f6ECeEc9B"

module.exports = async function handler(req, res) {
  console.log("[Television] /api/transaction called")
  console.log("[Television] Request method:", req.method)

  if (req.method !== "POST") {
    console.log("[Television] ERROR: Method not allowed:", req.method)
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const BASE_PROVIDER_URL = process.env.BASE_PROVIDER_URL

    if (!BASE_PROVIDER_URL) {
      console.log("[Television] ERROR: Missing BASE_PROVIDER_URL")
      return res.status(500).json({ error: "Missing provider configuration" })
    }

    // Initialize provider to read contract state
    const provider = new ethers.providers.JsonRpcProvider(BASE_PROVIDER_URL)
    const televisionContract = new ethers.Contract(TELEVISION_CONTRACT_ADDRESS, televisionAbi, provider)

    // Get current price and slot0 data
    const currentPrice = await televisionContract.getPrice()
    const slot0 = await televisionContract.getSlot0()
    
    console.log("[Television] Current price:", currentPrice.toString())
    console.log("[Television] Current epochId:", slot0.epochId.toString())
    console.log("[Television] Current owner:", slot0.owner)

    // Get the user's address from the frame message
    let channelOwner = req.body?.untrustedData?.address || req.body?.address
    
    if (!channelOwner) {
      console.log("[Television] ERROR: Could not determine user address")
      return res.status(400).json({ error: "Could not determine user address" })
    }

    console.log("[Television] Channel owner (player):", channelOwner)

    // Prepare parameters for takeover
    const uri = "" // Empty string as requested
    const epochId = slot0.epochId
    const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const maxPaymentAmount = ethers.constants.MaxUint256 // Accept any price

    // Encode the takeover function call
    const televisionInterface = new ethers.utils.Interface(televisionAbi)
    const takeoverCalldata = televisionInterface.encodeFunctionData("takeover", [
      uri,
      channelOwner,
      epochId,
      deadline,
      maxPaymentAmount
    ])

    console.log("[Television] Generated takeover calldata")
    console.log("[Television] Parameters:", {
      uri,
      channelOwner,
      epochId: epochId.toString(),
      deadline,
      maxPaymentAmount: maxPaymentAmount.toString()
    })

    // Return transaction for the frame to execute
    const response = {
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: televisionAbi,
        to: TELEVISION_CONTRACT_ADDRESS,
        data: takeoverCalldata,
        value: "0",
      },
    }

    console.log("[Television] Sending transaction response")
    res.status(200).json(response)
  } catch (error) {
    console.error("[Television] Error in /api/transaction:", error)
    res.status(500).json({ error: `Server Error: ${error.message}` })
  }
}
