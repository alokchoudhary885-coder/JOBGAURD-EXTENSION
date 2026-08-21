import { JobMetadata, AnalysisResult } from '../types';
import { analyzeJobLocally } from '../shared/ruleEngine';

console.log('[JobGuard] Content script active on:', window.location.href);

const BLACKLIST = [
  'notification', 'notifications', '1 notification', 'messaging', 'my network',
  'home', 'jobs', 'search', 'describe the job you want', 'feed', 'internshala',
  'linkedin', 'indeed', 'sign in', 'login', 'apply now', 'easy apply', 'linkedin job', 'company on linkedin'
];

function isBad(t: string): boolean {
  if (!t) return true;
  const c = t.toLowerCase().trim();
  return BLACKLIST.some(b => c === b || c.startsWith(b));
}

// 1. Schema.org JSON-LD Parser (Primary Source)
function extractJsonLdJob(): JobMetadata | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      if (!script.textContent) continue;
      const json = JSON.parse(script.textContent);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        const type = item['@type'];
        if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) {
          const hiringOrg = typeof item.hiringOrganization === 'string'
            ? item.hiringOrganization
            : item.hiringOrganization?.name || '';

          const companyUrl = item.hiringOrganization?.sameAs || item.hiringOrganization?.url || undefined;
          const loc = typeof item.jobLocation === 'string'
            ? item.jobLocation
            : item.jobLocation?.address?.addressLocality || item.jobLocation?.address?.streetAddress || '';

          const salaryVal = item.baseSalary?.value?.value || item.baseSalary?.value;
          const salaryStr = salaryVal ? `${item.baseSalary?.currency || '₹'} ${salaryVal}` : undefined;

          if (item.title && hiringOrg) {
            return {
              title: item.title,
              company: hiringOrg,
              location: loc || undefined,
              salary: salaryStr,
              companyWebsite: companyUrl,
              description: item.description || '',
              jobUrl: window.location.href,
              platform: 'career_portal',
              extractedAt: Date.now(),
              isJsonLd: true
            };
          }
        }
      }
    }
  } catch {
    // Continue to DOM extractors
  }
  return null;
}

// 2. LinkedIn DOM Extractor
function extractLinkedInJob(): JobMetadata {
  const detailPane = document.querySelector('.jobs-search__job-details, .jobs-details__main-content, .job-view-layout, .jobs-details, .job-view-layout-wrapper') || document;

  let title = '';
  const titleSelectors = [
    'h1.top-card-layout__title',
    'h1.topcard__title',
    '.job-details-jobs-unified-top-card__job-title h1',
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.t-24.job-details-jobs-unified-top-card__job-title',
    '.jobs-search__job-details h1',
    '.jobs-search__job-details h2.t-24',
    'h1.t-24',
    '.top-card-layout__title',
    'h1'
  ];

  for (const sel of titleSelectors) {
    const el = detailPane.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 2 && !isBad(text)) {
      title = text;
      break;
    }
  }

  let company = '';
  const companySelectors = [
    'a[href*="/company/"]',
    '.topcard__org-name-link',
    '.top-card-layout__first-subline a',
    '.top-card-layout__first-subline',
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__subtitle-primary-grouping a',
    '.jobs-search__job-details .app-aware-link'
  ];

  for (const sel of companySelectors) {
    const el = detailPane.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 1 && !isBad(text)) {
      company = text;
      break;
    }
  }

  // Document Title Fallback
  if ((!title || !company || isBad(title) || isBad(company)) && document.title.includes('LinkedIn')) {
    const cleanDocTitle = document.title.replace(/\([0-9]+\)/g, '').trim();
    const parts = cleanDocTitle.split(/[-|–•]/);
    if (parts.length >= 2) {
      if (!title || isBad(title)) title = parts[0].trim();
      if (!company || isBad(company)) {
        const potentialComp = parts[1].replace(/at /i, '').replace(/hiring/i, '').trim();
        if (potentialComp && !isBad(potentialComp)) company = potentialComp;
      }
    }
  }

  const locationEl = detailPane.querySelector('.topcard__flavor--bullet, .top-card-layout__second-subline, .job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .topcard__flavor');
  const location = locationEl?.textContent?.trim() || '';

  const salaryEl = detailPane.querySelector('.job-details-preferences-and-skills, .job-details-jobs-unified-top-card__job-insight--highlight, .compensation__salary');
  const salary = salaryEl?.textContent?.trim() || '';

  const descEl = detailPane.querySelector('.show-more-less-html__markup, .description__text, #job-details, .jobs-description__content, .jobs-description-content__text');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

  return {
    title: (!isBad(title) && title.length > 2) ? title : 'Software Role',
    company: (!isBad(company) && company.length > 1) ? company : 'Company on LinkedIn',
    location: location || undefined,
    salary: salary || undefined,
    description: description || '',
    jobUrl: window.location.href,
    platform: 'linkedin',
    extractedAt: Date.now()
  };
}

// 3. Internshala DOM Extractor
function extractInternshalaJob(): JobMetadata {
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
    if (text && text.length > 2 && !isBad(text)) {
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
    if (text && text.length > 1 && !isBad(text)) {
      company = text;
      break;
    }
  }

  if ((!title || !company) && document.title.includes('Internshala')) {
    const parts = document.title.split(/at|in|\||-/);
    if (parts.length >= 2) {
      if (!title) title = parts[0].trim();
      if (!company) company = parts[1].trim();
    }
  }

  const salary = modalOrContainer.querySelector('.stipend, .salary, .desktop-text, .salary_heading + .item_body')?.textContent?.trim() || '';
  const location = modalOrContainer.querySelector('.location_link, #location_names, .locations')?.textContent?.trim() || '';
  const descEl = modalOrContainer.querySelector('.text-container, .internship_details, .job_details, .about_job');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

  return {
    title: title || 'Internshala Role',
    company: company || 'Employer on Internshala',
    location: location || undefined,
    salary: salary || undefined,
    description: description || '',
    jobUrl: window.location.href,
    platform: 'internshala',
    extractedAt: Date.now()
  };
}

// 4. Indeed DOM Extractor
function extractIndeedJob(): JobMetadata {
  const title = document.querySelector('h1.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"], h1')?.textContent?.trim() || '';
  const company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader, a[href*="/cmp/"], .companyOverviewLink')?.textContent?.trim() || '';
  const location = document.querySelector('[data-testid="inlineHeader-companyLocation"], .jobsearch-JobInfoHeader-companyLocation')?.textContent?.trim() || '';
  const salary = document.querySelector('#salaryInfoAndJobType, [data-testid="jobsearch-JobInfoHeader-salary"]')?.textContent?.trim() || '';
  const descEl = document.querySelector('#jobDescriptionText');
  const description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

  return {
    title: (!isBad(title) && title.length > 2) ? title : 'Indeed Opening',
    company: (!isBad(company) && company.length > 1) ? company : 'Company on Indeed',
    location: location || undefined,
    salary: salary || undefined,
    description: description || '',
    jobUrl: window.location.href,
    platform: 'indeed',
    extractedAt: Date.now()
  };
}

export function extractJobDetails(): JobMetadata {
  // Check JSON-LD schema first
  const jsonLdJob = extractJsonLdJob();
  if (jsonLdJob) return jsonLdJob;

  const host = window.location.hostname.toLowerCase();
  if (host.includes('linkedin.com')) return extractLinkedInJob();
  if (host.includes('internshala.com')) return extractInternshalaJob();
  if (host.includes('indeed.com')) return extractIndeedJob();

  // Generic fallback
  const title = document.querySelector('h1')?.innerText?.trim() || document.title.split('-')[0].split('|')[0].trim();
  const ogCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const company = ogCompany || window.location.hostname.replace('www.', '');
  const description = document.querySelector('main, article, #content')?.textContent?.trim() || document.body.innerText.slice(0, 3000);

  return {
    title: (!isBad(title) && title.length > 2) ? title : 'Job Opportunity',
    company: (!isBad(company) && company.length > 1) ? company : 'Company',
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

  const { riskScore, riskLevel, job, confidence } = result;

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
      <span style="color: #CBD5E1; font-size: 12px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${job.company}
      </span>
      ${confidence === 'LOW' ? '<span style="font-size:10px; color:#94A3B8; background:rgba(255,255,255,0.1); border-radius:4px; padding:1px 4px;">Low Data</span>' : ''}
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

// SPA Navigation Listener (history.pushState / popstate)
let lastUrl = window.location.href;
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(runAnalysis, 400);
  }
}

window.addEventListener('popstate', checkUrlChange);

const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  checkUrlChange();
};

const originalReplaceState = history.replaceState;
history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  checkUrlChange();
};

// Live click listener for job selection in list view
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (
    target.closest('.jobs-search-results-list__list-item') ||
    target.closest('.job-card-container') ||
    target.closest('.individual_internship') ||
    target.closest('.job-card-list__title') ||
    target.closest('a[href*="/jobs/view/"]')
  ) {
    setTimeout(runAnalysis, 300);
  }
});

// Mutation Observer on DOM
const observer = new MutationObserver(() => {
  checkUrlChange();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
setTimeout(runAnalysis, 500);
