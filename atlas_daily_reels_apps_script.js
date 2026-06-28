/**
 * ATLAS FOR HUMANITY — Daily Reel Generator (v2 — timeout-safe)
 * Google Apps Script — runs daily at 8:00 AM UK time
 *
 * Generates 3 production-ready bilingual reel scripts:
 *   Script 1 — Daily Social Situation
 *   Script 2 — Work / Professional Situation
 *   Script 3 — Posh / Upper-Class Social & Professional
 *
 * Each script runs as a separate function to avoid the 6-minute timeout.
 *
 * SETUP:
 * 1. Paste this into script.google.com
 * 2. Add ANTHROPIC_API_KEY in Project Settings > Script Properties
 * 3. Run createDriveFolder once (approve permissions)
 * 4. Run setupDailyTriggers once — this creates 4 triggers automatically:
 *      7:00 AM → Script 1 (Social)
 *      7:03 AM → Script 2 (Professional)
 *      7:06 AM → Script 3 (Posh)
 *      7:10 AM → Send email with all 3 links
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  notificationEmail: 'enas.elghrouri@gmail.com',
  driveFolderName:   'Atlas Daily Reels',
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

// ── Script structure template ─────────────────────────────────────────────────
function buildScriptPrompt(scriptNumber, scriptType, topicContext) {
  return `${BRAND_BRIEF}

TODAY'S DATE: ${new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}

You are writing SCRIPT ${scriptNumber} of 3 for today's Atlas for Humanity daily reel package.

SCRIPT TYPE: ${scriptType}

${topicContext}

Write a COMPLETE, PRODUCTION-READY reel script with ALL of the following sections. Be SPECIFIC, DEEP, and DETAILED — include real names, real dates, real events, and real cultural bridges. Do not be generic.

---

## STEP 1: RESEARCH SUMMARY
- Trending UK context (why this topic today)
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

// ── Topic selection (rotates by day of week) ──────────────────────────────────
function getTodayTopics() {
  const socialTopics = [
    'Decode a specific British social situation or unspoken rule that SWANA diaspora encounter in everyday UK life — shops, streets, neighbours, social gatherings, public transport. Choose one that is currently trending or seasonally relevant.',
    'Focus on a specific British phrase, gesture, or social reflex that has caused confusion or embarrassment for Arab/Egyptian people in the UK. Include a WWII, Victorian, or post-war historical origin if relevant.',
    'Explore a British seasonal or calendar event (a bank holiday, a summer tradition, a winter custom) and decode what SWANA professionals need to know to navigate it socially.',
  ];

  const professionalTopics = [
    'Decode a specific piece of British corporate language or workplace behaviour that causes confusion for SWANA professionals. Use the Work Psychology (Arnold & Randall) and Debrett\'s Business Etiquette frameworks. Include the career consequence of getting this wrong.',
    'Explore a specific British workplace ritual — the appraisal, the office party, the town hall meeting, the away day, the email chain — and decode the hidden rules and class dynamics within it.',
    'Focus on British professional communication: how British people disagree, give feedback, challenge authority, or express dissatisfaction at work — and what SWANA professionals need to do instead of their instinctive direct approach.',
  ];

  const poshTopics = [
    'Decode a specific upper-class British social situation: a formal dinner, a charity gala, a country weekend, a hunt breakfast, a garden party. Use Debrett\'s etiquette rules and Nancy Mitford\'s U vs Non-U framework. Include dress codes, forms of address, and conversational norms.',
    'Explore the British aristocratic vocabulary (U vs Non-U) — specific words that instantly signal class. Include the history, the current relevance, and practical guidance for SWANA professionals who encounter this in elite London professional settings.',
    'Decode a specific upper-class British institution or event — Ascot, Wimbledon, a Livery Company dinner, a Royal garden party invitation, a club (RAC, Reform, Athenaeum) — and what SWANA professionals need to know if they receive an invitation.',
  ];

  const day = new Date().getDay();
  return {
    social:       socialTopics[day % socialTopics.length],
    professional: professionalTopics[day % professionalTopics.length],
    posh:         poshTopics[day % poshTopics.length],
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

// ── Helper: store/retrieve script results between runs ────────────────────────
function storeResult(key, data) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(data));
}

function getResult(key) {
  const val = PropertiesService.getScriptProperties().getProperty(key);
  return val ? JSON.parse(val) : null;
}

function getTodayKey(scriptNum) {
  const dateSlug = new Date().toISOString().split('T')[0];
  return `result_${dateSlug}_${scriptNum}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3 SEPARATE FUNCTIONS — one per script (each runs within 6-min limit)
// ══════════════════════════════════════════════════════════════════════════════

function generateScript1_Social() {
  const topics   = getTodayTopics();
  const folderId = getOrCreateFolder();
  const dateSlug = new Date().toISOString().split('T')[0];

  Logger.log('Generating Script 1 (Social)...');
  try {
    const prompt  = buildScriptPrompt(1, 'DAILY SOCIAL SITUATION', topics.social);
    const content = callClaude(prompt);
    const title   = `Atlas Reel ${dateSlug} — 1. Daily Social Situation`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getTodayKey(1), saved);
    Logger.log('✓ Script 1 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 1 failed: ' + e.message);
    storeResult(getTodayKey(1), { title: 'Script 1 — FAILED: ' + e.message, url: '#' });
  }
}

function generateScript2_Professional() {
  const topics   = getTodayTopics();
  const folderId = getOrCreateFolder();
  const dateSlug = new Date().toISOString().split('T')[0];

  Logger.log('Generating Script 2 (Professional)...');
  try {
    const prompt  = buildScriptPrompt(2, 'WORK / PROFESSIONAL SITUATION', topics.professional);
    const content = callClaude(prompt);
    const title   = `Atlas Reel ${dateSlug} — 2. Professional Situation`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getTodayKey(2), saved);
    Logger.log('✓ Script 2 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 2 failed: ' + e.message);
    storeResult(getTodayKey(2), { title: 'Script 2 — FAILED: ' + e.message, url: '#' });
  }
}

function generateScript3_Posh() {
  const topics   = getTodayTopics();
  const folderId = getOrCreateFolder();
  const dateSlug = new Date().toISOString().split('T')[0];

  Logger.log('Generating Script 3 (Posh/Upper Class)...');
  try {
    const prompt  = buildScriptPrompt(3, 'POSH / UPPER-CLASS SOCIAL & PROFESSIONAL', topics.posh);
    const content = callClaude(prompt);
    const title   = `Atlas Reel ${dateSlug} — 3. Posh & Upper Class`;
    const saved   = saveToGoogleDoc(folderId, title, content);
    storeResult(getTodayKey(3), saved);
    Logger.log('✓ Script 3 saved: ' + saved.url);
  } catch (e) {
    Logger.log('✗ Script 3 failed: ' + e.message);
    storeResult(getTodayKey(3), { title: 'Script 3 — FAILED: ' + e.message, url: '#' });
  }
}

// ── Email notification (runs after all 3 scripts are done) ────────────────────
function sendDailyEmail() {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const script1 = getResult(getTodayKey(1)) || { title: 'Script 1 — not generated yet', url: '#' };
  const script2 = getResult(getTodayKey(2)) || { title: 'Script 2 — not generated yet', url: '#' };
  const script3 = getResult(getTodayKey(3)) || { title: 'Script 3 — not generated yet', url: '#' };
  const scripts = [script1, script2, script3];

  const subject = `🎬 Atlas Daily Reels Ready — ${dateStr}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2A4A; padding: 20px; text-align: center;">
        <h1 style="color: #C9A02C; margin: 0; font-size: 24px;">ATLAS FOR HUMANITY</h1>
        <p style="color: #F5F0E8; margin: 8px 0 0;">Daily Reel Scripts — ${dateStr}</p>
      </div>

      <div style="padding: 24px; background: #ffffff;">
        <p style="color: #363636; font-size: 16px;">
          صباح الخير يا إيناس ☀️<br>
          Your three reel scripts for today are ready.
        </p>

        <hr style="border: 1px solid #C9A02C; margin: 20px 0;">

        <h2 style="color: #1B2A4A; font-size: 18px;">📱 SCRIPT 1 — DAILY SOCIAL</h2>
        <p><strong>${scripts[0].title}</strong></p>
        <a href="${scripts[0].url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 20px;">Open Script 1 →</a>

        <h2 style="color: #1B2A4A; font-size: 18px;">💼 SCRIPT 2 — PROFESSIONAL</h2>
        <p><strong>${scripts[1].title}</strong></p>
        <a href="${scripts[1].url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 20px;">Open Script 2 →</a>

        <h2 style="color: #1B2A4A; font-size: 18px;">🎩 SCRIPT 3 — POSH/UPPER CLASS</h2>
        <p><strong>${scripts[2].title}</strong></p>
        <a href="${scripts[2].url}" style="background: #C9A02C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 20px;">Open Script 3 →</a>

        <hr style="border: 1px solid #C9A02C; margin: 20px 0;">

        <p style="color: #777; font-size: 13px;">
          All scripts are saved in your Google Drive under "Atlas Daily Reels".<br>
          Generated automatically at 8:00 AM UK time.
        </p>
      </div>

      <div style="background: #1B2A4A; padding: 14px; text-align: center;">
        <p style="color: #C9A02C; margin: 0; font-size: 12px;">Atlas for Humanity — Community Interest Company</p>
      </div>
    </div>
  `;

  GmailApp.sendEmail(CONFIG.notificationEmail, subject, '', { htmlBody });
  Logger.log('✓ Email sent to ' + CONFIG.notificationEmail);
}

// ══════════════════════════════════════════════════════════════════════════════
// RUN ALL NOW — chains the 3 scripts + email using time-based triggers
// ══════════════════════════════════════════════════════════════════════════════

function runAllNow() {
  // Run Script 1 immediately
  generateScript1_Social();

  // Schedule Script 2 in 3 minutes
  ScriptApp.newTrigger('generateScript2_Professional')
    .timeBased()
    .after(3 * 60 * 1000)
    .create();

  // Schedule Script 3 in 6 minutes
  ScriptApp.newTrigger('generateScript3_Posh')
    .timeBased()
    .after(6 * 60 * 1000)
    .create();

  // Schedule email in 10 minutes
  ScriptApp.newTrigger('sendDailyEmail')
    .timeBased()
    .after(10 * 60 * 1000)
    .create();

  Logger.log('✓ Script 1 done. Scripts 2 & 3 scheduled. Email in ~10 min.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SETUP — creates daily triggers (run once)
// ══════════════════════════════════════════════════════════════════════════════

function setupDailyTriggers() {
  // Remove any existing Atlas triggers first
  const existing = ScriptApp.getProjectTriggers();
  for (const t of existing) {
    const fname = t.getHandlerFunction();
    if (['generateScript1_Social', 'generateScript2_Professional',
         'generateScript3_Posh', 'sendDailyEmail'].includes(fname)) {
      ScriptApp.deleteTrigger(t);
    }
  }

  // Script 1 at 7:00 AM
  ScriptApp.newTrigger('generateScript1_Social')
    .timeBased()
    .atHour(7).nearMinute(0)
    .everyDays(1)
    .create();

  // Script 2 at 7:03 AM (use 7:00 + nearMinute offset — closest we can get)
  ScriptApp.newTrigger('generateScript2_Professional')
    .timeBased()
    .atHour(7).nearMinute(15)
    .everyDays(1)
    .create();

  // Script 3 at 7:30 AM
  ScriptApp.newTrigger('generateScript3_Posh')
    .timeBased()
    .atHour(7).nearMinute(30)
    .everyDays(1)
    .create();

  // Email at 7:45 AM
  ScriptApp.newTrigger('sendDailyEmail')
    .timeBased()
    .atHour(7).nearMinute(45)
    .everyDays(1)
    .create();

  Logger.log('✅ 4 daily triggers created:');
  Logger.log('   7:00 AM — Script 1 (Social)');
  Logger.log('   7:15 AM — Script 2 (Professional)');
  Logger.log('   7:30 AM — Script 3 (Posh/Upper Class)');
  Logger.log('   7:45 AM — Email notification');
  Logger.log('   (Times are approximate — Google may run ±15 min)');
}

// ── One-time setup: create the Drive folder ───────────────────────────────────
function createDriveFolder() {
  const folderId = getOrCreateFolder();
  Logger.log('✓ Drive folder ready. ID: ' + folderId);
  Logger.log('  Find it at: https://drive.google.com/drive/folders/' + folderId);
}

// ── Test API connection ───────────────────────────────────────────────────────
function testRun() {
  Logger.log('Running test...');
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    Logger.log('ERROR: ANTHROPIC_API_KEY not set. Go to Project Settings > Script Properties and add it.');
    return;
  }

  const testPrompt = `${BRAND_BRIEF}

Write a very short (200-word) test script in Egyptian Arabic about one British social custom.
Just confirm the API is working.`;

  try {
    const result = callClaude(testPrompt);
    Logger.log('✅ API connection successful. Sample output:');
    Logger.log(result.substring(0, 500));
  } catch (e) {
    Logger.log('❌ API test failed: ' + e.message);
  }
}
