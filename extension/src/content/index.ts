import { JobMetadata, AnalysisResult } from '../types';
import { analyzeJobLocally } from '../shared/ruleEngine';

console.log('[JobGuard] Content script active on:', window.location.href);

const BLACKLIST_TITLES = [
  'notification', 'notifications', '1 notification', 'messaging', 'my network',
  'home', 'jobs', 'search', 'describe the job you want', 'feed', 'internshala',
  'linkedin', 'indeed', 'sign in', 'login', 'apply now', 'easy apply'
];

function isBlacklisted(text: string): boolean {
  const clean = text.toLowerCase().trim();
  return BLACKLIST_TITLES.some(b => clean === b || clean.startsWith(b));
}

// 1. Precise LinkedIn Extractor
function extractLinkedInJob(): JobMetadata | null {
  const detailPane = document.querySelector('.jobs-search__job-details, .jobs-details__main-content, .job-view-layout, .jobs-details') || document;

  let title = '';
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title h1',
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.t-24.job-details-jobs-unified-top-card__job-title',
    '.jobs-search__job-details h1',
    '.jobs-search__job-details h2.t-24',
    'h1.t-24',
    '.top-card-layout__title'
  ];

  for (const sel of titleSelectors) {
    const el = detailPane.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 2 && !isBlacklisted(text)) {
      title = text;
      break;
    }
  }

  if (!title) {
    const activeListItem = document.querySelector('.jobs-search-results-list__list-item--active, .job-card-container--clickable');
    if (activeListItem) {
      const cardTitle = activeListItem.querySelector('.job-card-list__title, strong, a.job-card-container__link')?.textContent?.trim();
      if (cardTitle && !isBlacklisted(cardTitle)) title = cardTitle;
    }
  }

  let company = '';
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__subtitle-primary-grouping a',
    '.topcard__org-name-link',
    '.jobs-search__job-details .app-aware-link'
  ];

  for (const sel of companySelectors) {
    const el = detailPane.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 1 && !isBlacklisted(text)) {
      company = text;
      break;
    }
  }

  const location = detailPane.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .topcard__flavor--bullet')?.textContent?.trim();
  const salary = detailPane.querySelector('.job-details-preferences-and-skills, .job-details-jobs-unified-top-card__job-insight--highlight')?.textContent?.trim();

  const descEl = detailPane.querySelector('#job-details, .jobs-description__content, .jobs-description-content__text, .show-more-less-html__markup');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : '';

  if (!title && !company) return null;

  return {
    title: title || 'LinkedIn Job Posting',
    company: company || 'Company on LinkedIn',
    location: location || undefined,
    salary: salary || undefined,
    description: description || document.body.innerText.slice(0, 3000),
    jobUrl: window.location.href,
    platform: 'linkedin',
    extractedAt: Date.now()
  };
}

// 2. Precise Internshala Extractor
function extractInternshalaJob(): JobMetadata | null {
  const modalOrContainer = document.querySelector('.detail_view, .modal-content, .individual_internship, #details_container') || document.body;

  let title = '';
  const titleSelectors = [
    '.heading_4_5.profile',
    '.job-title-href',
    '.profile_on_detail_page',
    '.heading_4_5',
    'h1'
  ];

  for (const sel of titleSelectors) {
    const el = modalOrContainer.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 2 && !isBlacklisted(text)) {
      title = text;
      break;
    }
  }

  let company = '';
  const companySelectors = [
    '.heading_6.company_name a',
    '.heading_6.company_name',
    '.link_display_like_text',
    '.company_name a',
    '.company_name',
    '.company-name'
  ];

  for (const sel of companySelectors) {
    const el = modalOrContainer.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 1 && !isBlacklisted(text)) {
      company = text;
      break;
    }
  }

  const salary = modalOrContainer.querySelector('.stipend, .salary, .desktop-text, .salary_heading + .item_body')?.textContent?.trim();
  const location = modalOrContainer.querySelector('.location_link, #location_names, .locations')?.textContent?.trim();
  const descEl = modalOrContainer.querySelector('.text-container, .internship_details, .job_details, .about_job');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : '';

  if (!title && !company) return null;

  return {
    title: title || 'Internshala Job Posting',
    company: company || 'Company on Internshala',
    location: location || undefined,
    salary: salary || undefined,
    description: description || document.body.innerText.slice(0, 3000),
    jobUrl: window.location.href,
    platform: 'internshala',
    extractedAt: Date.now()
  };
}

// 3. Precise Indeed Extractor
function extractIndeedJob(): JobMetadata | null {
  const title = document.querySelector('h1.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim();
  const company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader, .companyOverviewLink')?.textContent?.trim();
  const location = document.querySelector('[data-testid="inlineHeader-companyLocation"], .jobsearch-JobInfoHeader-companyLocation')?.textContent?.trim();
  const salary = document.querySelector('#salaryInfoAndJobType, [data-testid="jobsearch-JobInfoHeader-salary"]')?.textContent?.trim();
  const descEl = document.querySelector('#jobDescriptionText');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : '';

  if (!title && !company) return null;

  return {
    title: title || 'Indeed Job',
    company: company || 'Company on Indeed',
    location: location || undefined,
    salary: salary || undefined,
    description: description || document.body.innerText.slice(0, 3000),
    jobUrl: window.location.href,
    platform: 'indeed',
    extractedAt: Date.now()
  };
}

export function extractJobDetails(): JobMetadata {
  const host = window.location.hostname.toLowerCase();

  if (host.includes('linkedin.com')) {
    const li = extractLinkedInJob();
    if (li) return li;
  }
  if (host.includes('internshala.com')) {
    const is = extractInternshalaJob();
    if (is) return is;
  }
  if (host.includes('indeed.com')) {
    const ind = extractIndeedJob();
    if (ind) return ind;
  }

  // Fallback
  const title = document.querySelector('h1')?.innerText?.trim() || document.title.split('-')[0].split('|')[0].trim();
  const ogCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const company = ogCompany || document.domain;
  const description = document.querySelector('main, article, #content')?.textContent?.trim() || document.body.innerText.slice(0, 3000);

  return {
    title: (!isBlacklisted(title) && title.length > 2) ? title : 'Job Opportunity',
    company: company || 'Company',
    description,
    jobUrl: window.location.href,
    platform: 'other',
    extractedAt: Date.now()
  };
}

// In-Page Floating Badge
let badgeContainer: HTMLElement | null = null;

function renderInPageBadge(result: AnalysisResult) {
  if (badgeContainer) {
    badgeContainer.remove();
    badgeContainer = null;
  }

  const { riskScore, riskLevel, job } = result;

  let badgeBg = '#10B981';
  let badgeEmoji = '🟢';

  if (riskLevel === 'CRITICAL') {
    badgeBg = '#EF4444';
    badgeEmoji = '🔴';
  } else if (riskLevel === 'HIGH') {
    badgeBg = '#F97316';
    badgeEmoji = '🟠';
  } else if (riskLevel === 'MEDIUM') {
    badgeBg = '#F59E0B';
    badgeEmoji = '🟡';
  }

  badgeContainer = document.createElement('div');
  badgeContainer.id = 'jobguard-floating-pill';
  badgeContainer.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0F172A;
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
    padding: 10px 18px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  `;

  badgeContainer.innerHTML = `
    <div style="display:flex; align-items:center; gap:6px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      <span style="font-weight: 700; letter-spacing: -0.2px;">JobGuard</span>
    </div>
    <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2);"></div>
    <div style="display:flex; align-items:center; gap:6px;">
      <span>${badgeEmoji}</span>
      <span style="font-weight: 600; color: ${badgeBg};">${riskScore}/100</span>
      <span style="color: #CBD5E1; font-size: 12px; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${job.company}
      </span>
    </div>
    <div style="margin-left: 4px; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 2px 8px; font-size: 11px; color: #E2E8F0;">
      Verify 🛡️
    </div>
  `;

  badgeContainer.onmouseenter = () => {
    if (badgeContainer) badgeContainer.style.transform = 'translateY(-3px) scale(1.02)';
  };
  badgeContainer.onmouseleave = () => {
    if (badgeContainer) badgeContainer.style.transform = 'translateY(0) scale(1)';
  };

  document.body.appendChild(badgeContainer);
}

function runAnalysis(): AnalysisResult {
  const job = extractJobDetails();
  const analysis = analyzeJobLocally(job);

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({
      activeJob: job,
      activeAnalysis: analysis,
      lastAnalyzedAt: Date.now()
    });

    chrome.runtime.sendMessage({
      type: 'JOB_ANALYZED',
      analysis
    }).catch(() => {});
  }

  renderInPageBadge(analysis);
  return analysis;
}

// Listen for direct scan request from popup
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'EXTRACT_NOW') {
      const freshAnalysis = runAnalysis();
      sendResponse({ success: true, job: freshAnalysis.job, analysis: freshAnalysis });
      return true;
    }
  });
}

// Live click listener for job selection in list view
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (
    target.closest('.jobs-search-results-list__list-item') ||
    target.closest('.job-card-container') ||
    target.closest('.individual_internship') ||
    target.closest('.job-card-list__title')
  ) {
    setTimeout(runAnalysis, 400);
  }
});

// Observe DOM & URL changes for SPAs
const observer = new MutationObserver(() => {
  setTimeout(runAnalysis, 800);
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
setTimeout(runAnalysis, 600);
