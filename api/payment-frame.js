module.exports = async function handler(req, res) {
  console.log("[Television] /api/payment-frame called - Method:", req.method)

  try {
    const START_IMAGE_URL = process.env.START_IMAGE_URL || "https://i.imgur.com/IsUWL7j.png"
    let PUBLIC_URL = process.env.PUBLIC_URL || "https://last-game-kappa.vercel.app"
    const GAME_URL = process.env.GAME_URL
    const BASE_PROVIDER_URL = process.env.BASE_PROVIDER_URL

    // Remove trailing slash to avoid double slashes
    PUBLIC_URL = PUBLIC_URL.replace(/\/+$/, '')

    console.log("[Television] Payment frame loaded")

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Television Payment Frame</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      pointer-events: auto;
      position: relative;
      z-index: 10;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .status {
      margin-top: 1rem;
      font-size: 0.9rem;
      min-height: 20px;
    }
    .error {
      color: #ffcccc;
    }
    .success {
      color: #ccffcc;
    }
    .loading {
      color: #ffffcc;
    }
    .info {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-top: 1rem;
    }
  </style>
  
  <!-- Farcaster Frame Meta Tags for Transaction -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${START_IMAGE_URL}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:button:1" content="Pay & Play" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${PUBLIC_URL}/api/transaction" />
  <meta property="fc:frame:post_url" content="${PUBLIC_URL}/api/verify" />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Television Payment Frame" />
  <meta property="og:image" content="${START_IMAGE_URL}" />
</head>
<body>
  <div class="container">
    <h1>📺 Television Game</h1>
    <p>Pay to take over the channel</p>
    <button id="payButton">Pay & Play</button>
    <div id="status" class="status"></div>
    <div class="info">Price decays to 0 over 1 hour</div>
  </div>

  <script type="module">
    console.log('[Television] Payment frame script starting')
    
    const payButton = document.getElementById('payButton')
    const statusDiv = document.getElementById('status')
    
    // Contract addresses
    const TELEVISION_ADDRESS = '0x9C751E6825EDAa55007160b99933846f6ECeEc9B'
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913'
    
    // ABI fragments
    const televisionAbi = [
      'function takeover(string memory uri, address channelOwner, uint256 epochId, uint256 deadline, uint256 maxPaymentAmount) external returns (uint256 paymentAmount)',
      'function getPrice() external view returns (uint256)',
      'function getSlot0() external view returns (tuple(uint8 locked, uint16 epochId, uint192 initPrice, uint40 startTime, address owner, string uri))'
    ]
    
    const usdcAbi = [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)'
    ]
    
    payButton.addEventListener('click', async () => {
      console.log('[Television] Button clicked!')
      statusDiv.textContent = 'Initializing payment...'
      statusDiv.className = 'status loading'
      
      try {
        payButton.disabled = true
        
        console.log('[Television] Importing dependencies')
        const { default: sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk')
        const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.2.esm.min.js')
        
        console.log('[Television] SDK imported, calling ready()')
        await sdk.actions.ready()
        
        console.log('[Television] Getting Ethereum provider')
        const provider = await sdk.wallet.getEthereumProvider()
        
        if (!provider) {
          throw new Error('Wallet provider not available')
        }
        
        // Wrap provider with ethers
        const ethersProvider = new ethers.providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner()
        
        console.log('[Television] Requesting accounts')
        statusDiv.textContent = 'Connecting wallet...'
        
        const userAddress = await signer.getAddress()
        console.log('[Television] User address:', userAddress)
        
        // Create contract instances
        const televisionContract = new ethers.Contract(TELEVISION_ADDRESS, televisionAbi, ethersProvider)
        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer)
        
        statusDiv.textContent = 'Checking game state...'
        
        // Get current price and slot0
        const currentPrice = await televisionContract.getPrice()
        const slot0 = await televisionContract.getSlot0()
        
        console.log('[Television] Current price:', currentPrice.toString())
        console.log('[Television] Current epochId:', slot0.epochId.toString())
        
        // Check USDC allowance
        statusDiv.textContent = 'Checking USDC allowance...'
        const allowance = await usdcContract.allowance(userAddress, TELEVISION_ADDRESS)
        
        console.log('[Television] Current allowance:', allowance.toString())
        console.log('[Television] Required amount:', currentPrice.toString())
        
        // Approve USDC if needed
        if (allowance.lt(currentPrice)) {
          statusDiv.textContent = 'Approving USDC... (1/2)'
          console.log('[Television] Approving USDC')
          
          const approveTx = await usdcContract.approve(
            TELEVISION_ADDRESS,
            ethers.constants.MaxUint256
          )
          
          statusDiv.textContent = 'Waiting for approval... (1/2)'
          await approveTx.wait()
          console.log('[Television] USDC approved')
        }
        
        // Call takeover
        statusDiv.textContent = 'Taking over channel... (2/2)'
        console.log('[Television] Calling takeover')
        
        const deadline = Math.floor(Date.now() / 1000) + 3600
        const televisionWithSigner = televisionContract.connect(signer)
        
        const takeoverTx = await televisionWithSigner.takeover(
          '', // empty uri
          userAddress, // channelOwner
          slot0.epochId, // current epochId
          deadline,
          ethers.constants.MaxUint256 // maxPaymentAmount
        )
        
        statusDiv.textContent = 'Confirming transaction...'
        const receipt = await takeoverTx.wait()
        
        console.log('[Television] Takeover successful!', receipt.transactionHash)
        statusDiv.textContent = 'Payment successful! Redirecting...'
        statusDiv.className = 'status success'
        
        // Redirect to game
        setTimeout(() => {
          window.location.href = '${GAME_URL}'
        }, 2000)
        
      } catch (error) {
        console.error('[Television] Payment error:', error)
        statusDiv.textContent = 'Error: ' + (error.message || 'Payment failed')
        statusDiv.className = 'status error'
        payButton.disabled = false
      }
    })
    
    console.log('[Television] Click handler attached')
    statusDiv.textContent = 'Ready to pay'
  </script>
</body>
</html>`

    console.log("[Television] Payment frame HTML generated")

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.status(200).send(html)

    console.log("[Television] Payment frame response sent")
  } catch (e) {
    console.error("[Television] Error in payment frame:", e.message)
    res.status(500).send(`Error: ${e.message}`)
  }
}
