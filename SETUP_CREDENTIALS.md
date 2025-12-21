# Setup Credentials (Free Google Gemini)

To make your bot smart for **Free**, we are using Google's Gemini API.

## 1. Get Google Gemini API Key

1.  Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Sign in with your Google Account.
3.  Click "Create API Key".
4.  Copy the key (it starts with `AIza...`).

## 2. Update Your Project

1.  Open the file called `.env` in this folder.
2.  Replace `dummy` with your actual key:
    ```
    GEMINI_API_KEY=AIzaSy...YourKeyHere...
    PORT=3000
    ```
3.  Restart the server.

## 3. WhatsApp Credentials (Unchanged)

If you are deploying to production, follow the WhatsApp steps in `PRODUCTION_GUIDE.md`.
