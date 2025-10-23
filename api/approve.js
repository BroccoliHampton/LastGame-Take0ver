const { ethers } = require("ethers")

const usdcAbi = ["function approve(address spender, uint256 amount) external returns (bool)"]

const TELEVISION_CONTRACT_ADDRESS = "0x9C751E6825EDAa55007160b99933846f6ECeEc9B"
const USDC_CONTRACT_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913"

module.exports = async function handler(req, res) {
  console.log("[Television] /api/approve called")
  console.log("[Television] Request method:", req.method)

  if (req.method !== "POST") {
    console.log("[Television] ERROR: Method not allowed:", req.method)
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Encode USDC approval for max uint256
    const usdcInterface = new ethers.utils.Interface(usdcAbi)
    const approveCalldata = usdcInterface.encodeFunctionData("approve", [
      TELEVISION_CONTRACT_ADDRESS,
      ethers.constants.MaxUint256
    ])

    console.log("[Television] Generated approve calldata")

    // Return transaction for the frame to execute
    const response = {
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: usdcAbi,
        to: USDC_CONTRACT_ADDRESS_BASE,
        data: approveCalldata,
        value: "0",
      },
    }

    console.log("[Television] Sending approve transaction response")
    res.status(200).json(response)
  } catch (error) {
    console.error("[Television] Error in /api/approve:", error)
    res.status(500).json({ error: `Server Error: ${error.message}` })
  }
}
