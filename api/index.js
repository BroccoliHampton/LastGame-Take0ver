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

    const miniAppEmbed = {
      version: "1",
      imageUrl: START_IMAGE_URL,
      button: {
        title: "Pay & Play",
        action: {
          type: "launch_frame",
          name: "Television Game",
          url: `${PUBLIC_URL}/api/payment-frame`,
          splashImageUrl: START_IMAGE_URL,
          splashBackgroundColor: "#1a1a1a",
        },
      },
    }

    const serializedEmbed = JSON.stringify(miniAppEmbed)
    console.log("[Television] Mini App Embed:", serializedEmbed)

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Television Game</title>
  
  <!-- Farcaster Mini App Meta Tag -->
  <meta property="fc:miniapp" content='${serializedEmbed}' />
  <meta property="fc:frame" content='${serializedEmbed}' />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="Television Game" />
  <meta property="og:description" content="Pay to take over the channel" />
  <meta property="og:image" content="${START_IMAGE_URL}" />
</head>
<body>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #1a1a1a; color: white;">
    <h1>📺 Television Game</h1>
    <p>Pay to take over the channel</p>
    <p style="font-size: 0.9rem; opacity: 0.8;">Price decays to FREE over 1 hour</p>
  </div>
</body>
</html>`

    console.log("[Television] Generated HTML with Mini App Embed format")

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.status(200).send(html)

    console.log("[Television] Response sent successfully")
  } catch (e) {
    console.error("[Television] Error:", e.message)
    res.status(500).send(`Error: ${e.message}`)
  }
}
