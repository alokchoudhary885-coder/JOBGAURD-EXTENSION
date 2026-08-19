import { AnalysisResult } from '../types';

console.log('[JobGuard] Service Worker initialized.');

// Listen for messages from Content Script or Popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'JOB_ANALYZED') {
    const analysis: AnalysisResult = message.analysis;
    updateBadge(analysis);

    // Save history
    saveToHistory(analysis);

    sendResponse({ status: 'ok' });
    return true;
  }

  if (message.type === 'GET_BACKEND_STATUS') {
    checkBackendHealth().then((isHealthy) => {
      sendResponse({ isHealthy });
    });
    return true;
  }

  if (message.type === 'ANALYZE_WITH_BACKEND') {
    (async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: message.job }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.analysis) {
            updateBadge(data.analysis);
            saveToHistory(data.analysis);
            await chrome.storage.local.set({ activeAnalysis: data.analysis });
            sendResponse({ success: true, analysis: data.analysis });
            return;
          }
        }
      } catch (err) {
        console.debug('[JobGuard] Backend offline, using local analysis', err);
      }
      sendResponse({ success: false });
    })();
    return true;
  }

  return true;
});

// Update Extension Action Icon Badge
function updateBadge(analysis: AnalysisResult) {
  const { riskScore, riskLevel } = analysis;
  const badgeText = `${riskScore}`;

  let badgeColor = '#10B981'; // Green
  if (riskLevel === 'CRITICAL') badgeColor = '#EF4444';
  else if (riskLevel === 'HIGH') badgeColor = '#F97316';
  else if (riskLevel === 'MEDIUM') badgeColor = '#F59E0B';

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

// Persist analysis in history (capped at 50)
async function saveToHistory(analysis: AnalysisResult) {
  try {
    const data = await chrome.storage.local.get(['analysisHistory']);
    const history: AnalysisResult[] = data.analysisHistory || [];

    // Avoid duplicate continuous entries for same URL
    const filtered = history.filter(h => h.job.jobUrl !== analysis.job.jobUrl);
    filtered.unshift(analysis);

    if (filtered.length > 50) {
      filtered.length = 50;
    }

    await chrome.storage.local.set({ analysisHistory: filtered });
  } catch (err) {
    console.error('[JobGuard] Error saving history', err);
  }
}

// Health check for backend
async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:5000/api/v1/health', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// Clear badge on tab change if not a supported job page
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || (!tab.url.includes('linkedin') && !tab.url.includes('internshala') && !tab.url.includes('indeed'))) {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch {
    // Ignore tab get errors
  }
});
