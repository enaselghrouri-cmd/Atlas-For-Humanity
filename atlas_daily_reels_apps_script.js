/**
 * ATLAS FOR HUMANITY — Weekly Reel Generator (v3 — weekly, timeout-safe)
 * Google Apps Script — runs every FRIDAY at 8:00 AM UK time
 *
 * Generates 3 production-ready bilingual reel scripts per week:
 *   Script 1 — Daily Social Situation
 *   Script 2 — Work / Professional Situation
 *   Script 3 — Posh / Upper-Class Social & Professional
 *
 * Each script runs as a separate function to avoid the 6-minute timeout.
 * Scripts are saved to Google Drive and emailed to Enas every Friday morning.
 *
 * SETUP (one-time):
 * 1. Paste this into script.google.com
 * 2. Project Settings > Script Properties → add ANTHROPIC_API_KEY
 * 3. Run createDriveFolder once (approve permissions)
 * 4. Run setupWeeklyTriggers once — creates 4 Friday triggers:
 *      7:00 AM → Script 1 (Social)
 *      7:15 AM → Script 2 (Professional)
 *      7:30 AM → Script 3 (Posh)
 *      7:45 AM → Email with all 3 links
 *
 * TO TEST NOW: Run runAllNow — generates all 3 + sends email in ~10 min.
 * TO CHANGE SCHEDULE: Edit setupWeeklyTriggers and re-run it.
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  notificationEmail: 'enas.elghrouri@gmail.com',
  driveFolderName:   'Atlas Weekly Reels',
  anthropicModel:    'claude-sonnet-4-6',
  anthropicApiUrl:   'https://api.anthropic.com/v1/messages',
  maxTokens:         8000,
};

// ── Brand voice master brief ──────────────────────────────────────────────────
const BRAND_BRIEF = `
You are a bilingual content strategist for Atlas for Humanity, a UK-registered Community Interest Company supporting the SWANA (South West Asia and North Africa) diaspora in the UK.

BRAND VOICE: Warm, witty, culturally intelligent, never patronising. You speak to SWANA diaspora professionals navigating British life. The frame is always: "this is fascinating, let me decode it for you" — never "you don't understand."

LANGUAGE: Egyptian Arabic dialect (عامية مصرية) as primary. English phrases embedded where they are the subject being decoded or where a British expression is best shown in its original form. Write the way a Cairo-educated bilingual professional speaks — not like a dictionary translation.

BRAND COLOURS: Gold, cream, charcoal, deep navy.

KEY REFERENCE SOURCES to draw from (cite where relevant):
- Kate Fox, "Watching the English" (Hodder, 2014)
- Debrett's Guide to Business Etiquette (debretts.com)
- Nancy Mitford, "Noblesse Oblige" (1956) — U vs Non-U vocabulary
- Arnold & Randall, "Work Psychology: Understanding Human Behaviour in the Workplace" (Pearson, 7th ed.)
- The Guardian, BBC Worklife — British workplace culture coverage
- Instagram references: @britishculturearchive, @verybritishproblemsofficial, @englishmanmike, @greatbritish.memes
- YouTube: Simple History, Eat Sleep Dream English

AUDIENCE: SWANA diaspora professionals in the UK — Egyptian, Arab, Levantine, North African. They are educated, ambitious, often working in London. They are not beginners — they need nuance, not basics.
`;

// ── Script structure prompt ───────────────────────────────────────────────────
function buildScriptPrompt(scriptNumber, scriptType, topicContext) {
  return `${BRAND_BRIEF}

TODAY'S DATE: ${new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}

You are writing SCRIPT ${scriptNumber} of 3 for this week's Atlas for Humanity reel package.

SCRIPT TYPE: ${scriptType}

${topicContext}

Write a COMPLETE, PRODUCTION-READY reel script with ALL of the following sections. Be SPECIFIC, DEEP, and DETAILED — include real names, real dates, real events, and real cultural bridges. Do not be generic.

---

## STEP 1: RESEARCH SUMMARY
- Trending UK context (why this topic this week)
- Real-life story anchor (specific person, event, or study with source)
- Egyptian / SWANA cultural bridge (the parallel or contrast — make this feel like a discovery)
- Book / academic reference (cite from the key sources listed above where relevant)
- Photograph / visual resource suggestion

## STEP 2: CONTENT ARCHITECTURE
- Topic chosen (specific, not generic)
- Core cultural insight (what changes for the audience after watching)
- 3–5 specific examples, phrases, or scenarios the reel will decode
- Why this serves the SWANA professional in the UK this week

## STEP 3: THE SCRIPT
Write every word of the script in Egyptian Arabic dialect (عامية مصرية).
English words/phrases shown in [brackets] are spoken in English.
Include timing stamps for each section.

Structure:
[HOOK — 0:00 to 0:06] — stops the scroll, SWANA recognition moment
[CONTEXT SETUP — 0:06 to 0:22] — the British norm, socially and historically grounded
[THE REAL STORY — 0:22 to 1:05] — specific person/event/study, told with warmth and energy. Include the Egyptian/SWANA cultural bridge as a discovery moment.
[THE TAKEAWAY — 1:05 to 1:20] — 1 memorable rule + 1–2 practical phrases the audience can use immediately
[CALL TO ACTION — 1:20 to 1:32] — warm, specific, invites comments. Tease next episode.

## STEP 4: CAPTION
- 2 Arabic lines (hook for Arabic readers, works without seeing the reel)
- 1 English line (discoverability)
- Hashtags (Arabic diaspora + English discoverability + Atlas brand + topic-specific)

## STEP 5: PRODUCTION NOTES
- Setting, outfit, framing
- Text overlays with exact timestamps and text
- B-roll or prop suggestions
- Photo/visual resource URL

## STEP 6: REFERENCES
List all sources with full URLs.

---
Write the full output now. Be specific, be deep, be warm. No generic placeholders.`;
}

// ── Topic selection (rotates by week number for variety) ──────────────────────
function getThisWeekTopics() {
  // Use ISO week number so topics rotate week-by-week, not day-by-day
  const now      = new Date();
  const weekNum  = Math.ceil((((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1) / 7);

  const socialTopics = [
    'Decode a specific British social situation or unspoken rule that SWANA diaspora encounter in everyday UK life — shops, streets, neighbours, social gatherings, public transport. Choose one that is currently trending or seasonally relevant this week.',
    'Focus on a specific British phrase, gesture, or social reflex that has caused confusion or embarrassment for Arab/Egyptian people in the UK. Include a WWII, Victorian, or post-war historical origin if relevant.',
    'Explore a British seasonal or calendar event (a bank holiday, a summer tradition, a winter custom) and decode what SWANA professionals need to know to navigate it socially.',
    'Decode a specific British social class signal — vocabulary, clothing, food choice, or behaviour — that SWANA diaspora encounter but may not recognise as a class marker.',
  ];

  const professionalTopics = [
    'Decode a specific piece of British corporate language or workplace behaviour that causes confusion for SWANA professionals. Use the Work Psychology (Arnold & Randall) and Debrett\'s Business Etiquette frameworks. Include the career consequence of getting this wrong.',
    'Explore a specific British workplace ritual — the appraisal, the office party, the town hall meeting, the away day, the email chain — and decode the hidden rules and class dynamics within it.',
    'Focus on British professional communication: how British people disagree, give feedback, challenge authority, or express dissatisfaction at work — and what SWANA professionals need to do instead of their instinctive direct approach.',
    'Decode a specific British networking or social-professional situation: the after-work drinks, the conference small talk, the introduction email, the LinkedIn connection request — and what SWANA professionals get wrong and how to fix it.',
  ];

  const poshTopics = [
    'Decode a specific upper-class British social situation: a formal dinner, a charity gala, a country weekend, a hunt breakfast, a garden party. Use Debrett\'s etiquette rules and Nancy Mitford\'s U vs Non-U framework. Include dress codes, forms of address, and conversational norms.',
    'Explore the British aristocratic vocabulary (U vs Non-U) — specific words that instantly signal class. Include the history, the current relevance, and practical guidance for SWANA professionals who encounter this in elite London professional settings.',
    'Decode a specific upper-class British institution or event — Ascot, Wimbledon, a Livery Company dinner, a Royal garden party invitation, a private members club (RAC, Reform, Athenaeum) — and what SWANA professionals need to know if they receive an invitation.',
    'Explore British upper-class food and dining culture — the rules of a formal dinner table, wine etiquette, cheese course protocol, what "pudding" means, tipping norms in fine dining — decoded for SWANA professionals navigating elite London settings.',
  ];

  return {
    social:       socialTopics[weekNum % socialTopics.length],
    professional: professionalTopics[weekNum % professionalTopics.length],
    posh:         poshTopics[weekNum % poshTopics.length],
  };
}

// ── Call Claude API ───────────────────────────────────────────────────────────
function callClaude(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in Script Properties.');

  const payload = {
    model:      CONFIG.anthropicModel,
    max_tokens: CONFIG.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  };

  const options = {
    method:      'post',
    contentType: 'application/json',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload:          JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(CONFIG.anthropicApiUrl, options);
  const json     = JSON.parse(response.getContentText());

  if (json.error) throw new Error(`Claude API error: ${json.error.message}`);
  return json.content[0].text;
}

// ── Save to Google Drive as a Google Doc ──────────────────────────────────────
function saveToGoogleDoc(folderId, title, content) {
  const doc  = DocumentApp.create(title);
  const body = doc.getBody();
  body.clear();

  const titlePara = body.appendParagraph('ATLAS FOR HUMANITY');
  titlePara.setHeading(DocumentApp.ParagraphHeading.TITLE);
  titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const subtitlePara = body.appendParagraph(title);
  subtitlePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  subtitlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendHorizontalRule();

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const h = body.appendParagraph(line.replace('## ', ''));
      h.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    } else if (line.startsWith('# ')) {
      const h = body.appendParagraph(line.replace('# ', ''));
      h.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    } else if (line === '---') {
      body.appendHorizontalRule();
    } else {
      body.appendParagraph(line);
    }
  }

  doc.saveAndClose();

  const file   = DriveApp.getFileById(doc.getId());
  const folder = DriveApp.getFolderById(folderId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return { url: doc.getUrl(), title: title };
}

// ── Get or create Drive folder ────────────────────────────────────────────────
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.driveFolderName);
  if (folders.hasNext()) return folders.next().getId();
  return DriveApp.createFolder(CONFIG.driveFolderName).getId();
}

// ── Store/retrieve script results between runs ────────────────────────────────
function storeResult(key, data) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(data));
}

function getResult(key) {
  const val = PropertiesService.getScriptProperties().getProperty(key);
  return val ? JSON.parse(val) : null;
}

function getWeekKey(scriptNum) {
  const now     = new Date();
  const weekNum = Math.ceil((((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
  return `result_${now.getFullYear()}_w${weekNum}_${scriptNum}`;
}

// ── Get Monday date of this week (for folder/email label) ─────────────────────
function getWeekLabel() {
  const now    = new Date();
  const friday = new Date(now);
  // Find this Friday
  const day  = now.getDay(); // 0=Sun, 5=Fri
  const diff = (5 - day + 7) % 7;
  friday.setDate(now.getDate() + diff);
  return friday.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ══════════════════════════════════════════════════════════════════════════════
// 3 SEPARATE SCRIPT FUNCTIONS — each within the 6-minute limit
// ══════════════════════════════════════════════════════════════════════════════

function generateScript1_Social() {
  const topics   = getThisWeekTopics();
  const folderId = getOrCreateFolder();
  const dateSlug = new Date().toISOString().split('T')[0];

  Logger.log('Generating Script 1 (Social)...');
  try {
    const prompt  = buildScriptPrompt(1, 'DAILY SOCIAL SITUATION', topics.social);
    const content = callClaude(prompt);
    const title   = `Atlas Reel Week of ${getWeekLabel()} — 1. Social Situation`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getWeekKey(1), saved);
    Logger.log('✓ Script 1 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 1 failed: ' + e.message);
    storeResult(getWeekKey(1), { title: 'Script 1 — FAILED: ' + e.message, url: '#' });
  }
}

function generateScript2_Professional() {
  const topics   = getThisWeekTopics();
  const folderId = getOrCreateFolder();

  Logger.log('Generating Script 2 (Professional)...');
  try {
    const prompt  = buildScriptPrompt(2, 'WORK / PROFESSIONAL SITUATION', topics.professional);
    const content = callClaude(prompt);
    const title   = `Atlas Reel Week of ${getWeekLabel()} — 2. Professional Situation`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getWeekKey(2), saved);
    Logger.log('✓ Script 2 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 2 failed: ' + e.message);
    storeResult(getWeekKey(2), { title: 'Script 2 — FAILED: ' + e.message, url: '#' });
  }
}

function generateScript3_Posh() {
  const topics   = getThisWeekTopics();
  const folderId = getOrCreateFolder();

  Logger.log('Generating Script 3 (Posh/Upper Class)...');
  try {
    const prompt  = buildScriptPrompt(3, 'POSH / UPPER-CLASS SOCIAL & PROFESSIONAL', topics.posh);
    const content = callClaude(prompt);
    const title   = `Atlas Reel Week of ${getWeekLabel()} — 3. Posh & Upper Class`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getWeekKey(3), saved);
    Logger.log('✓ Script 3 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 3 failed: ' + e.message);
    storeResult(getWeekKey(3), { title: 'Script 3 — FAILED: ' + e.message, url: '#' });
  }
}

// ── Weekly email notification ─────────────────────────────────────────────────
function sendWeeklyEmail() {
  const weekLabel = getWeekLabel();
  const script1   = getResult(getWeekKey(1)) || { title: 'Script 1 — not generated yet', url: '#' };
  const script2   = getResult(getWeekKey(2)) || { title: 'Script 2 — not generated yet', url: '#' };
  const script3   = getResult(getWeekKey(3)) || { title: 'Script 3 — not generated yet', url: '#' };

  const subject = `🎬 Atlas Weekly Reels Ready — w/e ${weekLabel}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2A4A; padding: 20px; text-align: center;">
        <h1 style="color: #C9A02C; margin: 0; font-size: 24px;">ATLAS FOR HUMANITY</h1>
        <p style="color: #F5F0E8; margin: 8px 0 0;">Weekly Reel Scripts — ${weekLabel}</p>
      </div>

      <div style="padding: 24px; background: #ffffff;">
        <p style="color: #363636; font-size: 16px;">
          صباح الخير يا إيناس ☀️<br>
          Your three reel scripts for this week are ready.
        </p>

        <hr style="border: 1px solid #C9A02C; margin: 20px 0;">

        <h2 style="color: #1B2A4A; font-size: 18px;">📱 SCRIPT 1 — DAILY SOCIAL</h2>
        <p style="color: #555;">${script1.title}</p>
        <a href="${script1.url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 24px;">Open Script 1 →</a>

        <h2 style="color: #1B2A4A; font-size: 18px;">💼 SCRIPT 2 — PROFESSIONAL</h2>
        <p style="color: #555;">${script2.title}</p>
        <a href="${script2.url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 24px;">Open Script 2 →</a>

        <h2 style="color: #1B2A4A; font-size: 18px;">🎩 SCRIPT 3 — POSH / UPPER CLASS</h2>
        <p style="color: #555;">${script3.title}</p>
        <a href="${script3.url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 24px;">Open Script 3 →</a>

        <hr style="border: 1px solid #C9A02C; margin: 20px 0;">

        <p style="color: #999; font-size: 12px;">
          All scripts are saved in your Google Drive under "Atlas Weekly Reels".<br>
          Generated automatically every Friday at 8:00 AM UK time.
        </p>
      </div>

      <div style="background: #1B2A4A; padding: 14px; text-align: center;">
        <p style="color: #C9A02C; margin: 0; font-size: 12px;">Atlas for Humanity — Community Interest Company</p>
      </div>
    </div>
  `;

  GmailApp.sendEmail(CONFIG.notificationEmail, subject, '', { htmlBody });
  Logger.log('✓ Weekly email sent to ' + CONFIG.notificationEmail);
}

// ══════════════════════════════════════════════════════════════════════════════
// RUN ALL NOW — for testing or manual generation
// Chains all 3 scripts + email using short time-based triggers
// ══════════════════════════════════════════════════════════════════════════════

function runAllNow() {
  // Script 1 runs immediately
  generateScript1_Social();

  // Script 2 in 3 minutes
  ScriptApp.newTrigger('generateScript2_Professional')
    .timeBased().after(3 * 60 * 1000).create();

  // Script 3 in 6 minutes
  ScriptApp.newTrigger('generateScript3_Posh')
    .timeBased().after(6 * 60 * 1000).create();

  // Email in 10 minutes
  ScriptApp.newTrigger('sendWeeklyEmail')
    .timeBased().after(10 * 60 * 1000).create();

  Logger.log('✓ Script 1 done. Scripts 2 & 3 scheduled. Email arrives in ~10 min.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SETUP — creates 4 weekly Friday triggers (run this once)
// ══════════════════════════════════════════════════════════════════════════════

function setupWeeklyTriggers() {
  // Remove any existing Atlas triggers first
  const existing = ScriptApp.getProjectTriggers();
  for (const t of existing) {
    const fname = t.getHandlerFunction();
    if (['generateScript1_Social', 'generateScript2_Professional',
         'generateScript3_Posh', 'sendWeeklyEmail',
         'sendDailyEmail', 'generateDailyReels'].includes(fname)) {
      ScriptApp.deleteTrigger(t);
      Logger.log('Removed old trigger: ' + fname);
    }
  }

  // Script 1 — Friday 7:00 AM
  ScriptApp.newTrigger('generateScript1_Social')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(7).nearMinute(0)
    .create();

  // Script 2 — Friday 7:15 AM
  ScriptApp.newTrigger('generateScript2_Professional')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(7).nearMinute(15)
    .create();

  // Script 3 — Friday 7:30 AM
  ScriptApp.newTrigger('generateScript3_Posh')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(7).nearMinute(30)
    .create();

  // Email — Friday 7:45 AM
  ScriptApp.newTrigger('sendWeeklyEmail')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(7).nearMinute(45)
    .create();

  Logger.log('✅ 4 weekly triggers created — every FRIDAY:');
  Logger.log('   ~7:00 AM → Script 1 (Social)');
  Logger.log('   ~7:15 AM → Script 2 (Professional)');
  Logger.log('   ~7:30 AM → Script 3 (Posh/Upper Class)');
  Logger.log('   ~7:45 AM → Email to ' + CONFIG.notificationEmail);
  Logger.log('Note: Google may fire triggers up to ±15 min from the set time.');
}

// ── One-time setup: create the Drive folder ───────────────────────────────────
function createDriveFolder() {
  const folderId = getOrCreateFolder();
  Logger.log('✓ Drive folder ready: ' + CONFIG.driveFolderName);
  Logger.log('  https://drive.google.com/drive/folders/' + folderId);
}

// ── Test API connection only ──────────────────────────────────────────────────
function testRun() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    Logger.log('ERROR: ANTHROPIC_API_KEY not set.');
    return;
  }
  const testPrompt = `${BRAND_BRIEF}
Write a very short (200-word) test script in Egyptian Arabic about one British social custom.`;
  try {
    const result = callClaude(testPrompt);
    Logger.log('✅ API working. Sample:');
    Logger.log(result.substring(0, 400));
  } catch (e) {
    Logger.log('❌ API test failed: ' + e.message);
  }
}
