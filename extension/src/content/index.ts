import { JobMetadata, AnalysisResult } from '../types';
import { analyzeJobLocally } from '../shared/ruleEngine';

console.log('[JobGuard] Content script active on:', window.location.href);

// Detect platform
function detectPlatform(): JobMetadata['platform'] {
  const host = window.location.hostname.toLowerCase();
  if (host.includes('linkedin.com')) return 'linkedin';
  if (host.includes('internshala.com')) return 'internshala';
  if (host.includes('indeed.com')) return 'indeed';
  if (host.includes('careers') || host.includes('jobs') || host.includes('greenhouse.io') || host.includes('lever.co') || host.includes('workday')) {
    return 'career_portal';
  }
  return 'other';
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// 1. Schema.org JSON-LD Extraction
function extractFromJsonLd(): Partial<JobMetadata> | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      try {
        const json = JSON.parse(script.textContent || '');
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (item['@type'] === 'JobPosting' || item['@type']?.includes?.('JobPosting')) {
            const hiringOrg = typeof item.hiringOrganization === 'string'
              ? item.hiringOrganization
              : item.hiringOrganization?.name || '';

            return {
              title: item.title || item.name || '',
              company: hiringOrg,
              description: item.description ? stripHtml(item.description) : '',
              location: typeof item.jobLocation === 'string' ? item.jobLocation : item.jobLocation?.address?.addressLocality || '',
              salary: item.baseSalary?.value?.value ? `${item.baseSalary?.currency || '$'} ${item.baseSalary?.value?.value}` : undefined,
              companyWebsite: item.hiringOrganization?.sameAs || undefined,
            };
          }
        }
      } catch {
        // continue
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function queryFirstText(selectors: string[]): string {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of Array.from(elements)) {
      const text = el.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }
  return '';
}

function queryCombinedText(selectors: string[]): string {
  const chunks: string[] = [];
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of Array.from(elements)) {
      const text = el.textContent?.trim();
      if (text && text.length > 20) {
        chunks.push(text);
      }
    }
  }
  return chunks.join('\n\n');
}

// Extract DOM data
function extractFromDOM(platform: JobMetadata['platform']): JobMetadata {
  let title = '';
  let company = '';
  let location = '';
  let salary = '';
  let description = '';
  let recruiterEmail = '';

  if (platform === 'internshala') {
    title = queryFirstText([
      '.heading_4_5.profile',
      '.job-title-href',
      '.profile_on_detail_page',
      '.heading_4_5',
      '.heading_5.profile',
      'h1',
      '.job-internship-name'
    ]);

    company = queryFirstText([
      '.heading_6.company_name a',
      '.heading_6.company_name',
      '.link_display_like_text',
      '.company_name a',
      '.company_name',
      '.company-name',
      '.heading_6'
    ]);

    location = queryFirstText([
      '#location_names',
      '.location_link',
      '.locations a',
      '.locations span',
      '.other_detail_item .item_body'
    ]);

    salary = queryFirstText([
      '.stipend',
      '.salary',
      '.desktop-text',
      '.salary_heading + .item_body',
      '.other_detail_item .item_body'
    ]);

    description = queryCombinedText([
      '.text-container',
      '.internship_details',
      '.job_details',
      '.about_company_text_container',
      '.detail_view',
      '#details_container',
      '.job_description_container'
    ]);

    if (!description || description.length < 50) {
      const mainContainer = document.querySelector('.detail_view, .internship_details, #content, main');
      if (mainContainer) description = (mainContainer as HTMLElement).innerText;
    }
  } else if (platform === 'linkedin') {
    title = queryFirstText([
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.t-24.job-details-jobs-unified-top-card__job-title',
      '.top-card-layout__title',
      'h1.topcard__title',
      'h1'
    ]);

    company = queryFirstText([
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      '.job-details-jobs-unified-top-card__primary-description a'
    ]);

    location = queryFirstText([
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.topcard__flavor--bullet'
    ]);

    salary = queryFirstText([
      '.job-details-jobs-unified-top-card__job-insight--highlight',
      '.job-details-preferences-and-skills'
    ]);

    description = queryCombinedText([
      '#job-details',
      '.jobs-description__content',
      '.jobs-description-content__text',
      '.show-more-less-html__markup'
    ]);
  } else if (platform === 'indeed') {
    title = queryFirstText([
      'h1.jobsearch-JobInfoHeader-title',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1'
    ]);

    company = queryFirstText([
      '[data-company-name="true"]',
      '.jobsearch-InlineCompanyRating-companyHeader',
      '.companyOverviewLink'
    ]);

    location = queryFirstText([
      '[data-testid="inlineHeader-companyLocation"]',
      '.jobsearch-JobInfoHeader-companyLocation'
    ]);

    salary = queryFirstText([
      '#salaryInfoAndJobType',
      '[data-testid="jobsearch-JobInfoHeader-salary"]'
    ]);

    description = queryCombinedText([
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText'
    ]);
  } else {
    // Generic webpage fallback
    title = document.querySelector('h1')?.innerText?.trim() || document.title;
    const ogCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    company = ogCompany || document.domain;
    description = document.querySelector('main, article, #content, .content')?.textContent?.trim() || document.body.innerText.slice(0, 3000);
  }

  // Scan description for email
  const emailMatch = (description || document.body.innerText).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) recruiterEmail = emailMatch[0];

  return {
    title: title || document.title.split('-')[0].split('|')[0].trim() || 'Job Opportunity',
    company: company || 'Company',
    location: location || undefined,
    salary: salary || undefined,
    description: description || document.body.innerText.slice(0, 3000),
    recruiterEmail: recruiterEmail || undefined,
    jobUrl: window.location.href,
    platform,
    extractedAt: Date.now()
  };
}

export function extractJobDetails(): JobMetadata {
  const platform = detectPlatform();
  const jsonLdData = extractFromJsonLd();
  const domData = extractFromDOM(platform);

  return {
    title: (jsonLdData?.title && jsonLdData.title.length > 2) ? jsonLdData.title : domData.title,
    company: (jsonLdData?.company && jsonLdData.company.length > 1) ? jsonLdData.company : domData.company,
    location: jsonLdData?.location || domData.location,
    salary: jsonLdData?.salary || domData.salary,
    description: (jsonLdData?.description && jsonLdData.description.length > 100) ? jsonLdData.description : domData.description,
    recruiterEmail: domData.recruiterEmail,
    companyWebsite: jsonLdData?.companyWebsite,
    jobUrl: window.location.href,
    platform,
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

  const { riskScore, riskLevel } = result;

  let badgeBg = '#10B981';
  let badgeText = 'Low Risk';
  let badgeEmoji = '🟢';

  if (riskLevel === 'CRITICAL') {
    badgeBg = '#EF4444';
    badgeText = 'Critical Risk';
    badgeEmoji = '🔴';
  } else if (riskLevel === 'HIGH') {
    badgeBg = '#F97316';
    badgeText = 'High Risk';
    badgeEmoji = '🟠';
  } else if (riskLevel === 'MEDIUM') {
    badgeBg = '#F59E0B';
    badgeText = 'Medium Risk';
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
      <span style="color: #94A3B8; font-size: 12px;">(${badgeText})</span>
    </div>
    <div style="margin-left: 4px; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 2px 8px; font-size: 11px; color: #E2E8F0;">
      Click to open 🛡️
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

// Perform scan
let lastExtractedUrl = '';

function runAnalysis(): AnalysisResult {
  const currentUrl = window.location.href;
  lastExtractedUrl = currentUrl;

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

// Observe DOM & SPA URL mutations
const observer = new MutationObserver(() => {
  if (window.location.href !== lastExtractedUrl) {
    setTimeout(runAnalysis, 600);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
setTimeout(runAnalysis, 800);
