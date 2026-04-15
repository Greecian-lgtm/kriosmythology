/**
 * scroll-tracker.js
 * Krios Mythology — Scroll Depth Analytics
 * Fires at 25%, 50%, 75%, 100% scroll depth per page
 * Logs to Google Sheet via Apps Script webhook
 *
 * INSTALL: Add ONE line to every page before </body>:
 * <script src="/assets/js/scroll-tracker.js"></script>
 *
 * SETUP: Replace SHEET_WEBHOOK_URL below with your Apps Script URL
 * See setup instructions at bottom of this file
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────────────
  var SHEET_WEBHOOK_URL = 'YOUR_APPS_SCRIPT_URL_HERE'; // replace after setup
  var MILESTONES = [25, 50, 75, 100];
  var SESSION_KEY = 'krios_scroll_' + window.location.pathname;

  // ── STATE ────────────────────────────────────────────────────────────────
  var fired = {};
  var startTime = Date.now();
  var pageSlug = window.location.pathname
    .replace(/\/$/, '')
    .replace(/.*\//, '') || 'homepage';

  // Restore already-fired milestones for this session
  // (prevents duplicate logs on back/forward navigation)
  try {
    var saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    fired = saved;
  } catch (e) {}

  // ── HELPERS ─────────────────────────────────────────────────────────────
  function getScrollPct() {
    var el = document.documentElement;
    var scrollTop = el.scrollTop || document.body.scrollTop;
    var scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight <= 0) return 100;
    return Math.round((scrollTop / scrollHeight) * 100);
  }

  function getTimeOnPage() {
    return Math.round((Date.now() - startTime) / 1000);
  }

  function getPageType() {
    var path = window.location.pathname;
    if (path.indexOf('/answers/') > -1) return 'AEO';
    if (path.indexOf('/blog/') > -1) return 'BLOG';
    if (path.indexOf('/tools/') > -1) return 'TOOL';
    if (path.indexOf('/guide') > -1) return 'LEAD_MAGNET';
    if (path === '/' || path === '/index.html') return 'HOME';
    return 'OTHER';
  }

  function getReferrer() {
    var ref = document.referrer;
    if (!ref) return 'direct';
    if (ref.indexOf('google') > -1) return 'google';
    if (ref.indexOf('youtube') > -1) return 'youtube';
    if (ref.indexOf('tiktok') > -1) return 'tiktok';
    if (ref.indexOf('instagram') > -1) return 'instagram';
    if (ref.indexOf('twitter') > -1 || ref.indexOf('x.com') > -1) return 'x';
    if (ref.indexOf('kriosmythology') > -1) return 'internal';
    return 'other';
  }

  function sendToSheet(milestone) {
    if (!SHEET_WEBHOOK_URL || SHEET_WEBHOOK_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Dev mode — log to console instead
      console.log('[KriosTracker] ' + milestone + '% scroll on ' + pageSlug +
        ' | time: ' + getTimeOnPage() + 's | ref: ' + getReferrer());
      return;
    }

    var payload = {
      timestamp:  new Date().toISOString(),
      page:       pageSlug,
      page_type:  getPageType(),
      milestone:  milestone,
      time_s:     getTimeOnPage(),
      referrer:   getReferrer(),
      url:        window.location.href,
      ua_mobile:  /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };

    // Use sendBeacon for reliability (works even when tab closes)
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
      navigator.sendBeacon(SHEET_WEBHOOK_URL, blob);
    } else {
      // Fallback for older browsers
      var img = new Image();
      img.src = SHEET_WEBHOOK_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
    }
  }

  function checkMilestones() {
    var pct = getScrollPct();
    MILESTONES.forEach(function (m) {
      if (pct >= m && !fired[m]) {
        fired[m] = true;
        sendToSheet(m);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(fired));
        } catch (e) {}
      }
    });
  }

  // ── THROTTLED SCROLL LISTENER ────────────────────────────────────────────
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        checkMilestones();
        ticking = false;
      });
      ticking = true;
    }
  }, {passive: true});

  // Also check on page load (user might not scroll if content fits viewport)
  window.addEventListener('load', function () {
    setTimeout(checkMilestones, 500);
  });

})();


/**
 * ═══════════════════════════════════════════════════════════════
 * SETUP INSTRUCTIONS — One-time, takes about 10 minutes
 * ═══════════════════════════════════════════════════════════════
 *
 * STEP 1 — Create a Google Sheet
 * - Go to sheets.google.com → New spreadsheet
 * - Name it: "Krios Scroll Analytics"
 * - Row 1 headers (paste exactly):
 *   timestamp | page | page_type | milestone | time_s | referrer | url | ua_mobile
 *
 * STEP 2 — Create Apps Script webhook
 * - In the Sheet: Extensions → Apps Script
 * - Delete all code, paste this:
 *
 * ------- PASTE INTO APPS SCRIPT --------
 *
 * function doPost(e) {
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     var data = JSON.parse(e.postData.contents);
 *     sheet.appendRow([
 *       data.timestamp,
 *       data.page,
 *       data.page_type,
 *       data.milestone,
 *       data.time_s,
 *       data.referrer,
 *       data.url,
 *       data.ua_mobile
 *     ]);
 *     return ContentService
 *       .createTextOutput(JSON.stringify({status: 'ok'}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch(err) {
 *     return ContentService
 *       .createTextOutput(JSON.stringify({status: 'error', msg: err.message}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 *
 * function doGet(e) {
 *   // Handle fallback GET requests from old browsers
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     var data = JSON.parse(decodeURIComponent(e.parameter.data));
 *     sheet.appendRow([
 *       data.timestamp,
 *       data.page,
 *       data.page_type,
 *       data.milestone,
 *       data.time_s,
 *       data.referrer,
 *       data.url,
 *       data.ua_mobile
 *     ]);
 *   } catch(err) {}
 *   return ContentService.createTextOutput('ok');
 * }
 *
 * ------- END APPS SCRIPT --------
 *
 * STEP 3 — Deploy as Web App
 * - Click Deploy → New deployment
 * - Type: Web App
 * - Execute as: Me
 * - Who has access: Anyone
 * - Click Deploy → Copy the Web App URL
 *
 * STEP 4 — Paste URL into this file
 * - Replace 'YOUR_APPS_SCRIPT_URL_HERE' at the top with your URL
 *
 * STEP 5 — Add to kriosmythology.com pages
 * - Save this file as: ~/kriosmythology/assets/js/scroll-tracker.js
 * - Add to every page before </body>:
 *   <script src="/assets/js/scroll-tracker.js"></script>
 *
 * For AEO pages specifically, add to larry_aeo_deploy.sh so it's
 * injected automatically into every generated page:
 *
 *   sed -i 's|</body>|<script src="/assets/js/scroll-tracker.js"></script>\n</body>|' $AEO_OUTPUT_FILE
 *
 * ═══════════════════════════════════════════════════════════════
 * READING THE DATA — What to look for
 * ═══════════════════════════════════════════════════════════════
 *
 * The key question: are people reading the full AEO answer?
 *
 * HEALTHY AEO PAGE:
 *   25% → lots of hits (people start reading)
 *   50% → decent drop (normal)
 *   75% → meaningful number (engaged readers)
 *   100% → smaller but real (people who read everything)
 *
 * WARNING SIGNS:
 *   25% >> 50% (big drop after first paragraph = hook isn't working)
 *   25% ≈ 50% >> 75% (people read intro + answer but skip conclusion)
 *   100% = 0 (nobody finishing = page too long or content drops off)
 *
 * time_s column tells you:
 *   < 10s at 25% = probably a bounce (scrolled fast, didn't read)
 *   30-90s at 100% = genuine reader
 *   > 3min at 50% = deep reader, high value visitor
 *
 * referrer column tells you:
 *   google = organic search is working
 *   youtube = video → website funnel is working
 *   direct = brand awareness building
 *
 * ═══════════════════════════════════════════════════════════════
 */
