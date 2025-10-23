module.exports = async function handler(req, res) {
  console.log("[Television] /api/index called - Method:", req.method)

  try {
    const START_IMAGE_URL = process.env.START_IMAGE_URL || "https://i.imgur.com/IsUWL7j.png"
    let PUBLIC_URL = process.env.PUBLIC_URL || "https://last-game-kappa.vercel.app"

    // Ensure PUBLIC_URL has https:// protocol
    if (!PUBLIC_URL.startsWith('http://') && !PUBLIC_URL.startsWith('https://')) {
      PUBLIC_URL = `https://${PUBLIC_URL}`
    }
    
    // Remove trailing slash to avoid double slashes
    PUBLIC_URL = PUBLIC_URL.replace(/\/+$/, '')

    console.log("[Television] Using START_IMAGE_URL:", START_IMAGE_URL)
    console.log("[Television] Using PUBLIC_URL:", PUBLIC_URL)

    // Standard frame format (not mini app)
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Television Game</title>
  
  <!-- Farcaster Frame Meta Tags -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${START_IMAGE_URL}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:button:1" content="Approve USDC (Step 1)" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${PUBLIC_URL}/api/approve" />
  <meta property="fc:frame:post_url" content="${PUBLIC_URL}/api/approved" />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Television Game" />
  <meta property="og:description" content="Pay to take over the channel" />
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
    .steps {
      font-size: 0.9rem;
      margin-top: 1.5rem;
      text-align: left;
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
    }
    .info {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📺 Television Game</h1>
    <p>Pay to take over the channel</p>
    <div class="steps">
      <strong>How it works:</strong><br>
      1. Approve USDC spending (one-time)<br>
      2. Take over the channel
    </div>
    <div class="info">Price decays to 0 over 1 hour</div>
  </div>
</body>
</html>`
</head>
<body>
  <div class="container">
    <h1>📺 Television Game</h1>
    <p>Pay to take over the channel</p>
    <div class="steps">
      <strong>How it works:</strong><br>
      1. Approve USDC spending (one-time)<br>
      2. Take over the channel
    </div>
    <div class="info">Price decays to 0 over 1 hour</div>
  </div>
</body>
</html>`

    console.log("[Television] Generated HTML with standard frame format")

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.status(200).send(html)

    console.log("[Television] Response sent successfully")
  } catch (e) {
    console.error("[Television] Error:", e.message)
    res.status(500).send(`Error: ${e.message}`)
  }
}
