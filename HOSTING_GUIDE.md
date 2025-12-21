# Hosting Guide: Deploying to Railway.app 🚂

Railway is fantastic for Node.js apps and very developer-friendly.

## 1. Prepare Your Code

1.  **Push to GitHub**: Ensure your code is in a repository on your GitHub account.
    - If needed:
      ```bash
      git init
      git add .
      git commit -m "Ready for Railway"
      # (Push to your repo)
      ```

## 2. Create Project on Railway

1.  Go to [Railway.app](https://railway.app) and Login with GitHub.
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your `ahara-bot` repository.
4.  Click **Deploy Now**.

## 3. Configure Variables (Critical) ⚠️

Railway will try to build, but it might fail or not work until you add your keys.

1.  Click on your new service card.
2.  Go to the **Variables** tab.
3.  Click **New Variable** and add these (copy from your local `.env`):

| Variable Name       | Value                         |
| :------------------ | :---------------------------- |
| `GEMINI_API_KEY`    | `AIza...` (Your Google Key)   |
| `WHATSAPP_TOKEN`    | `EAAbs1...` (Your Meta Token) |
| `WHATSAPP_PHONE_ID` | `973240072532357`             |
| `VERIFY_TOKEN`      | `ahara_secure_token_2025`     |
| `PORT`              | `3000`                        |

4.  Railway will automatically **Redeploy** when you save variables.

## 4. Get Your Public URL

1.  Go to the **Settings** tab.
2.  Scroll to **Networking** -> **Public Networking**.
3.  Click **Generate Domain**.
4.  You will get a URL like: `https://ahara-bot-production.up.railway.app`.

## 5. Connect to WhatsApp

1.  Copy that Railway URL.
2.  Go to **Meta Developer Portal** -> **WhatsApp** -> **Configuration**.
3.  Edit **Webhook**.
4.  **Callback URL**: `https://ahara-bot-production.up.railway.app/webhook` (Add `/webhook` at the end!).
5.  **Verify Token**: `ahara_secure_token_2025`
6.  Click **Verify & Save**.

**You are now LIVE on Railway! 🚀**
