# Atlas for Humanity — Daily Reel Automation
## Runs every day at 8:00 AM UK time. Completely separate from GitHub.

---

## HOW IT WORKS

1. Every morning at 8:00 AM (UK time), Google Apps Script wakes up automatically.
2. It calls the Claude AI API with the full Atlas brand brief.
3. Claude researches trending UK topics and writes all 3 scripts.
4. The scripts are saved as Google Docs in your Drive (folder: "Atlas Daily Reels").
5. You receive a Gmail at enas.elghrouri@gmail.com with links to all 3 scripts.

---

## ONE-TIME SETUP (takes 10 minutes)

### Step 1 — Open Google Apps Script
Go to: https://script.google.com
Click "New project"
Name it: "Atlas Daily Reels"

### Step 2 — Paste the code
Delete all existing code in the editor.
Paste the entire code from the section below.

### Step 3 — Add your Anthropic API key
In the Apps Script editor:
- Click the lock icon on the left (🔒 "Project Settings")
- Scroll to "Script Properties"
- Click "Add script property"
- Property name: ANTHROPIC_API_KEY
- Value: your API key from https://console.anthropic.com

### Step 4 — Create the Google Drive folder
Run this ONCE by clicking Run > createDriveFolder
Approve the permissions it requests (Drive + Gmail + URL Fetch)

### Step 5 — Set the daily trigger
- Click the clock icon on the left (⏰ "Triggers")
- Click "+ Add Trigger" (bottom right)
- Choose function: generateDailyReels
- Event source: Time-driven
- Type: Day timer
- Time: 7am to 8am (Google will run it at 8:00 AM BST automatically)
- Click Save

That's it. It will run every day at 8 AM and email you the 3 scripts.

---
