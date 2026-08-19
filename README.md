# 🛡️ JobGuard — Know the Risk Before You Apply

> **A Proactive, Evidence-Based Chrome Extension & Risk Engine for Employment Protection.**
> Instantly analyzes job postings on **LinkedIn**, **Internshala**, **Indeed**, and company career portals to detect suspicious signals, recruitment scams, and upfront payment traps before candidates apply.

---

## 🌟 Key Features

* **Real-time Explainable Risk Score (0–100)**:
  * 🟢 **Low Risk (0–25)**: Standard hiring patterns, verified corporate domain, official ATS.
  * 🟡 **Medium Risk (26–50)**: Minor anomalies (public Gmail recruiter, recent domain).
  * 🟠 **High Risk (51–75)**: Elevated risks (unverified off-platform chat redirects).
  * 🔴 **Critical Risk (76–100)**: Critical scam signals (registration fee, crypto, upfront deposit).
* **Hybrid Data Extraction**:
  * Primary: Schema.org `JobPosting` JSON-LD metadata inspection.
  * Secondary: Dynamic DOM heuristics for LinkedIn, Internshala, and Indeed.
* **In-Page Floating Risk Badge**:
  * Unobtrusive interactive pill injected near the "Apply" / "Easy Apply" button.
* **Posting Health Matrix**:
  * Instant status checks for Recruiter Email, Communication Channels, Portal ATS, and Pay Realism.
* **Interactive Built-in Test Simulator**:
  * Preloaded with real-world test cases (Verified Stripe listing, WhatsApp startup intern, Data entry deposit scam) so you can test all risk levels anytime.
* **Candidate Safety Guardrails**:
  * Pre-application checklist to educate job seekers against common employment traps.
* **Community Reporting**:
  * 1-Click anonymous reporting mechanism to flag suspicious recruiters.

---

## 🏗️ Architecture

```
                                Chrome Browser
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   JobGuard Extension      │
                        │   (React + TS + Tailwind) │
                        └─────────────┬─────────────┘
                                      │
                         Job Metadata Payload (JSON)
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   JobGuard Backend API    │
                        │   (Node.js + Express)     │
                        └─────────────┬─────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                 Deterministic   Google Gemini    Community
                  Rule Engine      AI Layer      Reports DB
                        │             │             │
                        └─────────────┼─────────────┘
                                      ▼
                              Aggregated Evidence
                                 & Risk Score
```

---

## 🚀 How to Install & Run in Chrome

### Step 1: Build the Extension
```bash
cd extension
npm install
npm run build
```
This generates the production bundle in `extension/dist`.

### Step 2: Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the folder: `c:\JOBGAURD EXTENSION\extension\dist`.
5. Pin **JobGuard** 🛡️ to your Chrome toolbar!

---

## ⚡ Starting the Backend (Optional for Cloud AI & Gemini)

JobGuard has a **dual-engine design**:
1. **Local Mode**: Works 100% offline inside the browser extension using built-in rule engine.
2. **Cloud AI Mode**: Connects to the Express backend for Gemini AI reasoning and live WHOIS checks.

To start the backend:
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🧪 Testing the Extension

1. **Test via Live Job Sites**:
   * Open any job posting on [LinkedIn Jobs](https://www.linkedin.com/jobs), [Internshala](https://internshala.com), or [Indeed](https://www.indeed.com).
   * Click the **JobGuard** icon in the toolbar or click the floating pill on the bottom-right of the page.
2. **Test via Built-in Simulator**:
   * Open the JobGuard popup.
   * Click the **Demos** tab.
   * Click on any sample scenario (e.g. *Verified Enterprise Opening*, *Unverified Startup*, *Critical Scam*) or paste any custom text to see instant scoring.

---

## 🔒 Security & Privacy

* **Zero PII Collection**: JobGuard does not collect or store user personal data, resume contents, or browsing history.
* **No Client-Side Secrets**: Gemini API keys and sensitive tokens are kept strictly on the backend server.
* **Content Security Policy (CSP) Compliant**: Adheres to strict Manifest V3 sandboxing rules.
