const { ethers } = require("ethers")

const televisionAbi = [
  "function getPrice() external view returns (uint256)",
  "function getSlot0() external view returns (tuple(uint8 locked, uint16 epochId, uint192 initPrice, uint40 startTime, address owner, string uri))"
]

const TELEVISION_CONTRACT_ADDRESS = "0x9C751E6825EDAa55007160b99933846f6ECeEc9B"

module.exports = async function handler(req, res) {
  console.log("[Television] /api/game-state called")

  try {
    const BASE_PROVIDER_URL = process.env.BASE_PROVIDER_URL

    if (!BASE_PROVIDER_URL) {
      return res.status(500).json({ error: "Missing provider configuration" })
    }

    const provider = new ethers.providers.JsonRpcProvider(BASE_PROVIDER_URL)
    const contract = new ethers.Contract(TELEVISION_CONTRACT_ADDRESS, televisionAbi, provider)

    // Get current state
    const [price, slot0] = await Promise.all([
      contract.getPrice(),
      contract.getSlot0()
    ])

    const priceInUsdc = ethers.utils.formatUnits(price, 6)
    const timePassed = Math.floor(Date.now() / 1000) - slot0.startTime
    const timeRemaining = Math.max(0, 3600 - timePassed) // 1 hour = 3600 seconds

    const response = {
      currentPrice: priceInUsdc,
      currentPriceWei: price.toString(),
      epochId: slot0.epochId.toString(),
      initPrice: ethers.utils.formatUnits(slot0.initPrice, 6),
      currentOwner: slot0.owner,
      startTime: slot0.startTime,
      timePassed,
      timeRemaining,
      timeRemainingMinutes: Math.floor(timeRemaining / 60),
      isFree: price.eq(0)
    }

    console.log("[Television] Game state:", response)
    res.status(200).json(response)
  } catch (error) {
    console.error("[Television] Error fetching game state:", error)
    res.status(500).json({ error: error.message })
  }
}
