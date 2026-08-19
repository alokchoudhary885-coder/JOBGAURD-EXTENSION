import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Flag,
  ListFilter,
  Play,
  History,
  RotateCcw,
  Sparkles,
  Mail,
  Globe,
  DollarSign,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Info,
  Building2,
  Search
} from 'lucide-react';
import { AnalysisResult, JobMetadata, RiskLevel } from '../types';
import { analyzeJobLocally } from '../shared/ruleEngine';

// Standalone function executed directly in the active browser tab via chrome.scripting
function extractJobDirectlyFromPage(): JobMetadata {
  const url = window.location.href;
  const host = window.location.hostname.toLowerCase();

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

  let title = '';
  let company = '';
  let salary = '';
  let location = '';
  let description = '';
  let recruiterEmail = '';

  if (host.includes('linkedin.com')) {
    const detailPane = document.querySelector('.jobs-search__job-details, .jobs-details__main-content, .job-view-layout, .jobs-details, .job-view-layout-wrapper') || document;

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

    // Document Title Fallback (e.g. "Backend Developer - Cynbit Technologies | LinkedIn")
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
    location = locationEl?.textContent?.trim() || '';

    const salaryEl = detailPane.querySelector('.job-details-preferences-and-skills, .job-details-jobs-unified-top-card__job-insight--highlight, .compensation__salary');
    salary = salaryEl?.textContent?.trim() || '';

    const descEl = detailPane.querySelector('.show-more-less-html__markup, .description__text, #job-details, .jobs-description__content, .jobs-description-content__text');
    description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

    return {
      title: (!isBad(title) && title.length > 2) ? title : 'Software Developer',
      company: (!isBad(company) && company.length > 1) ? company : 'Company',
      salary: salary || undefined,
      location: location || undefined,
      description: description || '',
      jobUrl: url,
      platform: 'linkedin',
      extractedAt: Date.now()
    };
  }

  if (host.includes('internshala.com')) {
    const modalOrContainer = document.querySelector('.detail_view, .modal-content, .individual_internship, #details_container') || document.body;

    const titleEl = modalOrContainer.querySelector('.heading_4_5.profile, .job-title-href, .profile_on_detail_page, .heading_4_5, h1');
    if (titleEl && !isBad(titleEl.textContent || '')) title = titleEl.textContent?.trim() || '';

    const companyEl = modalOrContainer.querySelector('.heading_6.company_name a, .heading_6.company_name, .link_display_like_text, .company_name a, .company_name, .company-name');
    if (companyEl && !isBad(companyEl.textContent || '')) company = companyEl.textContent?.trim() || '';

    if ((!title || !company) && document.title.includes('Internshala')) {
      const parts = document.title.split(/at|in|\||-/);
      if (parts.length >= 2) {
        if (!title) title = parts[0].trim();
        if (!company) company = parts[1].trim();
      }
    }

    salary = modalOrContainer.querySelector('.stipend, .salary, .desktop-text, .salary_heading + .item_body')?.textContent?.trim() || '';
    location = modalOrContainer.querySelector('.location_link, #location_names, .locations')?.textContent?.trim() || '';

    const descEl = modalOrContainer.querySelector('.text-container, .internship_details, .job_details, .about_job');
    description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

    return {
      title: title || 'Internshala Role',
      company: company || 'Employer',
      salary: salary || undefined,
      location: location || undefined,
      description: description || '',
      jobUrl: url,
      platform: 'internshala',
      extractedAt: Date.now()
    };
  }

  if (host.includes('indeed.com')) {
    title = document.querySelector('h1.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"], h1')?.textContent?.trim() || '';
    company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader, a[href*="/cmp/"], .companyOverviewLink')?.textContent?.trim() || '';
    location = document.querySelector('[data-testid="inlineHeader-companyLocation"], .jobsearch-JobInfoHeader-companyLocation')?.textContent?.trim() || '';
    salary = document.querySelector('#salaryInfoAndJobType, [data-testid="jobsearch-JobInfoHeader-salary"]')?.textContent?.trim() || '';
    const descEl = document.querySelector('#jobDescriptionText');
    description = descEl ? (descEl as HTMLElement).innerText?.trim() : document.body.innerText.slice(0, 3000);

    return {
      title: (!isBad(title) && title.length > 2) ? title : 'Indeed Opening',
      company: (!isBad(company) && company.length > 1) ? company : 'Company',
      salary: salary || undefined,
      location: location || undefined,
      description: description || '',
      jobUrl: url,
      platform: 'indeed',
      extractedAt: Date.now()
    };
  }

  // Fallback
  title = document.querySelector('h1, h2')?.textContent?.trim() || document.title.split('-')[0].split('|')[0].trim();
  const ogCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  company = ogCompany || window.location.hostname.replace('www.', '');
  description = document.querySelector('main, article, #content')?.textContent?.trim() || document.body.innerText.slice(0, 3000);

  const emailMatch = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) recruiterEmail = emailMatch[0];

  return {
    title: (!isBad(title) && title.length > 2) ? title : 'Job Opportunity',
    company: (!isBad(company) && company.length > 1) ? company : 'Company',
    salary: undefined,
    location: undefined,
    description: description || '',
    recruiterEmail: recruiterEmail || undefined,
    jobUrl: url,
    platform: 'other',
    extractedAt: Date.now()
  };
}

// Pre-defined sample fixtures
const SAMPLE_JOBS: { name: string; tag: string; job: JobMetadata }[] = [
  {
    name: 'Verified Enterprise Opening',
    tag: 'Low Risk',
    job: {
      title: 'Senior Software Engineer (Frontend)',
      company: 'Stripe Inc.',
      location: 'Bengaluru, India (Hybrid)',
      salary: '₹35,00,000 - ₹50,00,000 PA',
      experience: '4+ Years',
      recruiterEmail: 'careers@stripe.com',
      companyWebsite: 'https://stripe.com/jobs',
      jobUrl: 'https://jobs.lever.co/stripe/frontend-senior-eng',
      platform: 'career_portal',
      extractedAt: Date.now(),
      description: 'We are seeking an experienced Frontend Engineer with deep expertise in React, TypeScript, and distributed systems. You will lead UI architecture for global payments infrastructure. Candidates undergo technical screenings and code review rounds.',
    }
  },
  {
    name: 'Unverified Startup / WhatsApp',
    tag: 'Medium Risk',
    job: {
      title: 'Full Stack React & Node Intern',
      company: 'Apex Digital Media Solutions',
      location: 'Remote',
      salary: '₹15,000 / month',
      experience: 'Fresher',
      recruiterEmail: 'hr.apexsolutions@gmail.com',
      companyWebsite: '',
      jobUrl: 'https://linkedin.com/jobs/view/983719482',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Urgent requirement for Full Stack interns. Candidates must know React.js, Tailwind, and Node.js. Contact our HR manager directly on WhatsApp at wa.me/919876543210 for immediate slot booking.',
    }
  },
  {
    name: 'Critical Scam / Fee Extortion',
    tag: 'Critical Risk',
    job: {
      title: 'Online Data Entry Specialist (Direct Selection)',
      company: 'Global Quick Career Hub',
      location: 'Work from Home',
      salary: '₹85,00,000 / month (Guaranteed)',
      experience: 'No Experience Required',
      recruiterEmail: 'quickhire2026@tempmail.com',
      companyWebsite: '',
      jobUrl: 'https://internshala.com/job/detail/fake-data-entry-99',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn ₹85,000 per month from home! No interview needed. Immediate joining today. Selected candidates must pay a refundable security deposit of ₹1,500 for training kit and verification. Join telegram t.me/fastjobsofficial now.',
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'checklist' | 'verify' | 'simulator' | 'report' | 'history'>('overview');
  const [activeJob, setActiveJob] = useState<JobMetadata>(SAMPLE_JOBS[0].job);
  const [analysis, setAnalysis] = useState<AnalysisResult>(analyzeJobLocally(SAMPLE_JOBS[0].job));
  const [isScanning, setIsScanning] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);
  const [customJdText, setCustomJdText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('Asked for upfront registration or training fee');

  // Direct Live Script Execution on Active Tab
  const scanActiveTabDirectly = useCallback(async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs?.query || !chrome.scripting?.executeScript) return;

    setIsScanning(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && tab.url && !tab.url.startsWith('chrome://')) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractJobDirectlyFromPage,
        });

        if (results && results[0]?.result) {
          const extracted = results[0].result as JobMetadata;
          if (extracted.title && extracted.title.length > 2) {
            const calculated = analyzeJobLocally(extracted);
            setActiveJob(extracted);
            setAnalysis(calculated);

            chrome.storage.local.set({
              activeJob: extracted,
              activeAnalysis: calculated,
              lastAnalyzedAt: Date.now()
            });
          }
        }
      }
    } catch (err) {
      console.debug('[JobGuard] Direct scripting scan notice:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Auto-scan on popup open
  useEffect(() => {
    scanActiveTabDirectly();

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['analysisHistory'], (result) => {
        if (result.analysisHistory) setHistoryList(result.analysisHistory);
      });

      fetch('http://localhost:5000/api/v1/health')
        .then(res => setIsBackendOnline(res.ok))
        .catch(() => setIsBackendOnline(false));
    }
  }, [scanActiveTabDirectly]);

  const triggerAnalyze = (jobToAnalyze: JobMetadata) => {
    setIsScanning(true);
    setActiveJob(jobToAnalyze);

    setTimeout(() => {
      const result = analyzeJobLocally(jobToAnalyze);
      setAnalysis(result);
      setIsScanning(false);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ activeJob: jobToAnalyze, activeAnalysis: result });
      }
    }, 250);
  };

  const handleCustomAnalyze = () => {
    if (!customJdText.trim()) return;
    const manualJob: JobMetadata = {
      title: 'Custom Analyzed Job',
      company: 'User Provided Text',
      description: customJdText,
      jobUrl: 'manual-input',
      platform: 'other',
      extractedAt: Date.now()
    };
    triggerAnalyze(manualJob);
    setActiveTab('overview');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setActiveTab('overview');
    }, 2000);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', stroke: '#EF4444', icon: ShieldAlert };
      case 'HIGH': return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', stroke: '#F97316', icon: AlertTriangle };
      case 'MEDIUM': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', stroke: '#F59E0B', icon: ShieldAlert };
      default: return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', stroke: '#10B981', icon: ShieldCheck };
    }
  };

  const riskTheme = getRiskColor(analysis.riskLevel);
  const RiskIconComponent = riskTheme.icon;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.riskScore / 100) * circumference;

  // Search URLs for Company Verification
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(activeJob.company + ' careers official website')}`;
  const linkedInCompanyUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(activeJob.company)}`;
  const ambitionBoxUrl = `https://www.ambitionbox.com/search?q=${encodeURIComponent(activeJob.company)}`;
  const zaubaCorpUrl = `https://www.google.com/search?q=${encodeURIComponent(activeJob.company + ' ZaubaCorp MCA registration')}`;

  return (
    <div className="w-[400px] min-h-[570px] bg-slate-950 text-slate-100 flex flex-col font-sans border border-slate-800">
      {/* Header */}
      <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              JobGuard
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Know the risk before you apply</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={scanActiveTabDirectly}
            disabled={isScanning}
            className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition shadow-sm"
            title="Scan active webpage in real-time"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Job'}
          </button>
          <div
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
              isBackendOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isBackendOnline ? 'Cloud AI' : 'Active'}
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="flex items-center px-2 py-1.5 bg-slate-900/50 border-b border-slate-800 text-xs text-slate-400 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
            activeTab === 'overview' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
            activeTab === 'verify' ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Company Check
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 relative ${
            activeTab === 'evidence' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          Evidence
          {analysis.signals.length > 0 && (
            <span className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-slate-700 text-slate-200 font-bold ml-0.5">
              {analysis.signals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
            activeTab === 'checklist' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Safety
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2 py-1 rounded-md transition font-medium flex items-center gap-1 ${
            activeTab === 'simulator' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Demos
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2 py-1 rounded-md transition font-medium flex items-center gap-1 ${
            activeTab === 'history' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 flex-1 overflow-y-auto space-y-3.5">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Live Detected Job Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between shadow-sm">
              <div className="space-y-1 max-w-[270px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    {activeJob.platform.toUpperCase()}
                  </span>
                  {activeJob.location && (
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      📍 {activeJob.location}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-extrabold text-white leading-tight line-clamp-1">
                  {activeJob.title}
                </h2>
                <p className="text-xs font-semibold text-emerald-300 line-clamp-1 flex items-center gap-1">
                  🏢 {activeJob.company} {activeJob.salary && <span className="text-slate-400 font-normal">({activeJob.salary})</span>}
                </p>
              </div>
              <button
                onClick={scanActiveTabDirectly}
                disabled={isScanning}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Re-scan current job"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

            {/* Risk Gauge */}
            <div className={`p-4 rounded-xl border ${riskTheme.border} ${riskTheme.bg} flex items-center gap-4`}>
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    stroke={riskTheme.stroke}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-white tracking-tight">
                    {analysis.riskScore}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium -mt-1">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <RiskIconComponent className={`w-4 h-4 ${riskTheme.text}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${riskTheme.text}`}>
                    {analysis.riskLevel} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  {analysis.summary}
                </p>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 pt-0.5"
                >
                  View {analysis.signals.length} detected signals <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Health Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Posting Health Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> Recruiter Email
                    </span>
                    {analysis.healthCheck.recruiterEmail.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {analysis.healthCheck.recruiterEmail.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {analysis.healthCheck.recruiterEmail.status === 'neutral' && <span className="text-[10px] text-slate-500">N/A</span>}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {analysis.healthCheck.recruiterEmail.label}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" /> Channels
                    </span>
                    {analysis.healthCheck.communication.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {analysis.healthCheck.communication.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {analysis.healthCheck.communication.label}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" /> Portal / ATS
                    </span>
                    {analysis.healthCheck.officialListing.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {analysis.healthCheck.officialListing.status === 'neutral' && <span className="text-[10px] text-slate-400">Web</span>}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {analysis.healthCheck.officialListing.label}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" /> Pay Realism
                    </span>
                    {analysis.healthCheck.salaryRealism.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {analysis.healthCheck.salaryRealism.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {analysis.healthCheck.salaryRealism.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('verify')}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                Check {activeJob.company.slice(0, 16)}
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition flex items-center justify-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY VERIFICATION */}
        {activeTab === 'verify' && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Employer Intelligence & Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Cross-verify <strong>{activeJob.company}</strong> across trusted databases:
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Target Company</span>
                <h4 className="text-base font-extrabold text-white">{activeJob.company}</h4>
                <p className="text-[11px] text-slate-300">Opening: {activeJob.title}</p>
                {activeJob.location && <p className="text-[11px] text-slate-400">Location: {activeJob.location}</p>}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition group border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Find Official Website & Careers Page
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                </a>

                <a
                  href={linkedInCompanyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition group border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    Verify LinkedIn Company Page & Employees
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
                </a>

                <a
                  href={ambitionBoxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition group border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-violet-400" />
                    Read AmbitionBox / Employee Reviews
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                </a>

                <a
                  href={zaubaCorpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition group border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Check MCA / Legal Entity Registration
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <strong className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verification Checklist:
              </strong>
              <p className="text-[11px] leading-relaxed text-slate-300">
                1. Does the company have a verified LinkedIn profile with active employees?
                <br />
                2. Does this exact role exist on their official careers page?
              </p>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800"
            >
              ← Back to Overview
            </button>
          </div>
        )}

        {/* TAB 3: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Risk Signal Matrix ({analysis.signals.length})
                </h3>
                <p className="text-[11px] text-slate-400">Factors influencing the score</p>
              </div>
              <span className="text-xs font-extrabold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Score: {analysis.riskScore}/100
              </span>
            </div>

            {analysis.signals.length === 0 ? (
              <div className="p-6 text-center space-y-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-white">No Suspicious Signals Detected</p>
                <p className="text-[11px] text-slate-400">
                  This posting adheres to normal corporate hiring standards.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analysis.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`p-3 rounded-xl border space-y-1.5 transition ${
                      signal.category === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : signal.category === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {signal.category === 'critical' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        {signal.category === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                        {signal.category === 'positive' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {signal.title}
                        </h4>
                      </div>
                      <span
                        className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          signal.impactScore > 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {signal.impactScore > 0 ? `+${signal.impactScore}` : signal.impactScore} Pts
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {signal.description}
                    </p>

                    {signal.evidence && (
                      <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-slate-400 truncate">
                        <span className="text-slate-500 font-semibold font-sans">Evidence: </span>
                        "{signal.evidence}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveTab('overview')}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800"
            >
              ← Back to Overview
            </button>
          </div>
        )}

        {/* TAB 4: SAFETY */}
        {activeTab === 'checklist' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Candidate Safety Guardrails
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask yourself these critical questions before proceeding:
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Did they request money for training or a laptop?
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  <strong className="text-red-400">Never pay.</strong> Legitimate companies cover all onboarding and hardware costs 100%.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Was an offer letter issued without any live interview?
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  Instant job offers without technical screening or video interviews are almost always scams.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Are they conducting the process via Telegram or WhatsApp?
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  Always verify official recruiter credentials via company corporate domain email.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">4</span>
                  Does the job exist on their official careers page?
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  Go directly to <code className="text-emerald-400">company.com/careers</code> and verify the exact requisition.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEMOS */}
        {activeTab === 'simulator' && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Interactive Test Demos
              </h3>
              <p className="text-[11px] text-slate-400">
                Test JobGuard across different real-world risk scenarios:
              </p>
            </div>

            <div className="space-y-2">
              {SAMPLE_JOBS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerAnalyze(sample.job);
                    setActiveTab('overview');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      sample.tag === 'Low Risk' ? 'bg-emerald-500/20 text-emerald-400' :
                      sample.tag === 'Medium Risk' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {sample.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {sample.job.company} • {sample.job.title}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Analyze Any Custom Job Description
              </h4>
              <textarea
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                placeholder="Paste any job description, WhatsApp message, or email here to calculate risk score..."
                className="w-full h-20 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none font-sans"
              />
              <button
                onClick={handleCustomAnalyze}
                disabled={!customJdText.trim()}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Analyze Custom Text
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: REPORT FORM */}
        {activeTab === 'report' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Report Suspicious Posting
              </h3>
              <p className="text-[11px] text-slate-400">
                Help protect other candidates across the JobGuard community.
              </p>
            </div>

            {reportSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">Report Logged Successfully</h4>
                <p className="text-[11px] text-slate-300">
                  Thank you for contributing to job seeker safety.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Primary Concern</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Asked for upfront registration or training fee">Asked for upfront registration or training fee</option>
                    <option value="Impersonating a real company or fake recruiter">Impersonating a real company or fake recruiter</option>
                    <option value="Redirecting to suspicious Telegram or WhatsApp group">Redirecting to suspicious Telegram or WhatsApp group</option>
                    <option value="Job opening does not exist on official careers page">Job opening does not exist on official careers page</option>
                    <option value="Phishing for Aadhaar / PAN / Bank details">Phishing for sensitive ID / Bank details</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Additional Notes (Optional)</label>
                  <textarea
                    placeholder="E.g., Recruiter sent a WhatsApp message asking for ₹1,000 document fee..."
                    className="w-full h-16 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 7: SCAN HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Recent Analyses ({historyList.length})
              </h3>
              <span className="text-[10px] text-slate-500">Auto-saved</span>
            </div>

            {historyList.length === 0 ? (
              <div className="p-6 text-center space-y-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No History Yet</p>
                <p className="text-[11px] text-slate-500">
                  Jobs you analyze on LinkedIn, Internshala, or Indeed will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveJob(item.job);
                      setAnalysis(item);
                      setActiveTab('overview');
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[260px]">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.job.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.job.company} • {new Date(item.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                      item.riskLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.riskScore}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
        <span>JobGuard Security Engine</span>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Protection
        </span>
      </footer>
    </div>
  );
}
