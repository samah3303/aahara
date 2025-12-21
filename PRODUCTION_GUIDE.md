# Frozen Box Assistant - Production Guide

To turn this local prototype into a **real working application**, follow these 4 major steps:

## 1. Get Real API Keys

Currently, the app uses "dummy" keys and mock responses. You need real intelligence.

### LLM (Intelligence)

1.  Sign up for [OpenAI Platform](https://platform.openai.com/).
2.  Generate a new **API Key**.
3.  Open `.env` in this folder.
4.  Replace `LLM_API_KEY=dummy` with your real key:
    ```env
    LLM_API_KEY=sk-proj-12345...
    ```

## 2. Expose Your Server (Webhook)

WhatsApp needs to send messages to a **Public URL**, not `localhost`.

### Option A: For Development (Fastest)

Use **Ngrok** to create a tunnel to your laptop.

1.  Download and install [Ngrok](https://ngrok.com/).
2.  Run: `ngrok http 3000`
3.  Copy the forwarding URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).

### Option B: For Production (Permanent)

Deploy to a cloud provider like **Render**, **Railway**, or **Heroku**.

1.  Push this code to GitHub.
2.  Connect your repo to Render/Railway.
3.  They will give you a persistent domain (e.g., `https://frozen-box-app.onrender.com`).

## 3. Configure WhatsApp (Meta)

# 🚀 Deployment Requirements Checklist

To go live, you need these 4 things:

## 1. Valid Credentials (Immediate Fix Needed) ⚠️

- **Status**: Partial.
- **Problem**: Your `WHATSAPP_PHONE_ID` (`1555...`) seems to be the **Phone Number**, not the **ID**.
- **Fix**: Go to Meta Dashboard -> WhatsApp -> API Setup. Look for **"Phone Number ID"** (It's a long ID like `321456...`, not the phone number itself). Update `.env`.

## 2. A Server (Hosting) ☁️

You need a computer that runs 24/7.

- **Easy Option**: [Render.com](https://render.com) or [Railway.app](https://railway.app).
- **What needs to run**: `node server.js`
- **Environment Variables**: You must copy your `.env` contents (Gemini Key, WhatsApp Token) into the cloud provider's "Environment" settings.

## 3. A Public URL (SSL) 🔗

WhatsApp needs to send messages to `https://your-app.com/webhook`.

- If using **Render/Railway**: They give you this URL automatically (e.g. `https://ahara-bot.onrender.com`).
- If running **Locally** (for testing): Use `ngrok` (`ngrok http 3000`) to get a public URL.

## 4. Connect Webhook 🔌

Once you have the URL:

1.  Go to Meta Dashboard -> WhatsApp -> Configuration.
2.  Click **Edit** near Webhook.
3.  **Callback URL**: `https://your-app.com/webhook`
4.  **Verify Token**: `ahara_secure_token_2025` (This is defined in `routes/webhook.js`).

## 5. (Optional) Switch Database

For a serious app, switch from SQLite file to **PostgreSQL**.

- Install `pg` npm package.
- Update `config/database.js` to connect to a Postgres URL.
- This ensures data isn't lost if the server restarts on a cloud container.
