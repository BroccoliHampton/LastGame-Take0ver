module.exports = async function handler(req, res) {
  console.log("[Television] /api/approved called - Method:", req.method)

  try {
    const START_IMAGE_URL = process.env.START_IMAGE_URL || "https://i.imgur.com/IsUWL7j.png"
    let PUBLIC_URL = process.env.PUBLIC_URL || "https://last-game-kappa.vercel.app"

    // Remove trailing slash to avoid double slashes
    PUBLIC_URL = PUBLIC_URL.replace(/\/+$/, '')

    console.log("[Television] Approved frame loaded")

    // Frame after approval - now ready for takeover
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ready to Play</title>
  
  <!-- Farcaster Frame Meta Tags for Takeover Transaction -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${START_IMAGE_URL}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:button:1" content="Take Over Channel" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${PUBLIC_URL}/api/transaction" />
  <meta property="fc:frame:post_url" content="${PUBLIC_URL}/api/verify" />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Ready to Play" />
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
    .success {
      color: #ccffcc;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ USDC Approved!</h1>
    <p class="success">You're all set</p>
    <p>Click "Take Over Channel" to complete the takeover</p>
  </div>
</body>
</html>`

    console.log("[Television] Approved frame HTML generated")

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.status(200).send(html)

    console.log("[Television] Approved frame response sent")
  } catch (e) {
    console.error("[Television] Error in approved frame:", e.message)
    res.status(500).send(`Error: ${e.message}`)
  }
}
