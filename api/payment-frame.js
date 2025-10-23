module.exports = async function handler(req, res) {
  console.log("[Television] /api/payment-frame called - Method:", req.method)

  try {
    const START_IMAGE_URL = process.env.START_IMAGE_URL || "https://i.imgur.com/IsUWL7j.png"
    let PUBLIC_URL = process.env.PUBLIC_URL || "https://last-game-kappa.vercel.app"
    const GAME_URL = process.env.GAME_URL

    // Remove trailing slash to avoid double slashes
    PUBLIC_URL = PUBLIC_URL.replace(/\/+$/, '')

    console.log("[Television] Payment frame loaded")

    // Simple frame with transaction button - NO JavaScript
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Television Payment Frame</title>
  
  <!-- Farcaster Frame Meta Tags for Transaction -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${START_IMAGE_URL}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:button:1" content="Take Over Channel" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${PUBLIC_URL}/api/transaction" />
  <meta property="fc:frame:post_url" content="${PUBLIC_URL}/api/verify" />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Television Payment Frame" />
  <meta property="og:image" content="${START_IMAGE_URL}" />
  
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
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    .info {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📺 Television Game</h1>
    <p>Ready to take over the channel?</p>
    <p style="font-size: 0.95rem;">Click the button below to pay and play</p>
    <div class="info">
      Price decays to 0 over 1 hour<br>
      90% goes to previous player, 10% to treasury
    </div>
  </div>
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
