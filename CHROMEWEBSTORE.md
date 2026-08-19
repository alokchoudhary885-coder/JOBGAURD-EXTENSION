# Chrome Web Store Listing & Metadata: JobGuard

## Extension Overview
- **Name**: JobGuard — Job Risk & Scam Analyzer
- **Short Name**: JobGuard
- **Version**: 1.0.0
- **Summary**: Know the risk before you apply. Instantly analyze job postings on LinkedIn, Indeed, Internshala & career sites for scam indicators.
- **Category**: Productivity / Search Tools
- **Primary Language**: English

---

## Detailed Description

**JobGuard** is an evidence-backed browser companion that protects job seekers and students from employment scams, fake recruiters, and fraudulent fees.

### 🛡️ Why Use JobGuard?
With the rise of fake recruiters and phishing scams on job portals, candidates often waste time or lose money to recruitment fraud. JobGuard provides transparent, mathematical risk assessments in real-time.

### ⚡ Key Features:
1. **Explainable Risk Meter (0–100)**: Color-coded safety gauge with zero guesswork.
2. **Transparent Evidence**: See exactly why a score was assigned (+18 Pts for free Gmail recruiter, +50 Pts for upfront fee).
3. **In-Page Floating Badges**: Shows safety status right next to the "Apply" button on LinkedIn, Internshala, and Indeed.
4. **Health Check Matrix**: Instant verification of company domain, recruiter email, compensation realism, and communication channels.
5. **Interactive Safety Guide**: Candidate safety guardrails to prevent sharing sensitive financial information.

---

## Permissions Justification

| Permission | Justification |
| :--- | :--- |
| `storage` | Required to save user preferences, local analysis history, and cached risk scores securely on the device. |
| `activeTab` | Required to analyze the job posting currently viewed by the user upon clicking the extension icon. |
| `tabs` | Required to read current URL and update the icon badge with the real-time risk score. |
| `scripting` | Required to execute the content extraction script on supported job portal tabs. |

---

## Privacy & Data Handling Disclosures

* **Data Collection**: None. JobGuard does not collect, sell, or transmit personal user identifiable information (PII).
* **Browsing History**: Only public job posting text on active job tabs is parsed locally for risk indicators.
* **Encryption**: All communication with the optional backend API is encrypted over HTTPS.
