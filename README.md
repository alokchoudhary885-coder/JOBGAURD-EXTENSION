# 🛡️ JobGuard — Know the Risk Before You Apply (v2.0.0)

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![100% Offline Engine](https://img.shields.io/badge/Risk_Engine-100%25_Offline-10B981?style=for-the-badge&logo=shield&logoColor=white)](#-architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/AI_Layer-Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **A Proactive, Evidence-Based Chrome Extension & Deterministic Risk Engine for Job Seekers.**
> Instantly evaluates job postings on **LinkedIn**, **Internshala**, **Indeed**, and company career portals to detect suspicious signals, recruitment scams, and upfront payment traps before candidates apply.

---

## 📥 Instant 1-Click Download & Install (30 Seconds)

You can run **JobGuard** directly in your Chrome browser for free in under 30 seconds:

1. **[👉 Click Here to Download JobGuard v2.0.0 (ZIP)](https://github.com/alokchoudhary885-coder/JOBGAURD-EXTENSION/raw/main/JobGuard-v2.0.0-ChromeStore.zip)**
2. Unzip the downloaded `JobGuard-v2.0.0-ChromeStore.zip` file into a folder on your computer.
3. Open Google Chrome and go to `chrome://extensions`.
4. Turn ON **"Developer mode"** (toggle in top-right corner).
5. Click **"Load unpacked"** and select the unzipped folder.
6. 🎉 Pin **JobGuard 🛡️** to your toolbar!

---

## 🌟 Key Features

* ⚡ **100% Offline Deterministic Scoring Engine**:
  * Runs entirely inside your browser tab with **zero network latency** and **zero user tracking**.
  * Calculates an explainable mathematical risk score from **`0` to `100`** with transparent positive and negative credits.
* 🇮🇳 **Hindi & Hinglish Scam Coverage**:
  * First-class detection for Indian regional recruitment scams (*"ghar baithe kamayein"*, *"turant selection"*, *"training fees dena hoga"*, *"khata number"*).
* 🎯 **Smart Role-Aware Compensation Logic**:
  * Distinguishes high-paying skilled engineering fresher roles (e.g. ₹1.5L/month for Amazon/Juspay SDEs) from fake data-entry / typing lures.
* 🤖 **On-Demand Google Gemini AI Advice**:
  * Token-efficient on-demand safety coaching without firing automated LLM requests on every tab view.
* 🏢 **1-Click Entity Verification**:
  * Direct links to verify company MCA registration, LinkedIn corporate page, and AmbitionBox employee reviews.
* 🔒 **DPDP Act 2023 & Privacy Compliant**:
  * Explicit first-run ToS consent modal and permanent statutory informational disclaimers on every calculation.

---

## 📊 Risk Bands & Mathematical Weights

| Risk Band | Score Range | Color & Badge | Description |
|---|---|---|---|
| **LOW RISK** | `0 – 25` | 🟢 Verified | Standard hiring patterns, corporate domain, verified ATS portal. |
| **MEDIUM RISK** | `26 – 50` | 🟡 Caution | Unverified small business, public Gmail contact, informal chat scheduling. |
| **HIGH RISK** | `51 – 75` | 🟠 High Caution | Direct selection without interview, unrealistic pay for unskilled roles, artificial urgency. |
| **CRITICAL RISK** | `76 – 100` | 🔴 Scam Alert | Upfront registration/training fees, laptop security deposits, or UPI PIN / bank phishing. |

### Deterministic Scoring Breakdown

$$\text{Final Score} = \max(0, \min(100, \sum \text{Signal Impact Scores}))$$

* 🚩 **Upfront Fee / Security Deposit Extortion**: `+35 pts` (*Critical*)
* 🚩 **Premature UPI PIN / Bank Details Request**: `+30 pts` (*Critical*)
* ⚠️ **Public Email Recruiter (@gmail, @yahoo)**: `+15 pts` (*Warning*)
* ⚠️ **Off-Platform WhatsApp / Telegram Redirect**: `+15 pts` (*Warning*)
* ⚠️ **Unverified Corporate Presence**: `+15 pts` (*Warning*)
* ⚠️ **Unrealistic Pay for Unskilled / Typing Role**: `+15 pts` (*Warning*)
* ⚠️ **Direct Selection / No Interview Promise**: `+10 pts` (*Warning*)
* ⚠️ **Undisclosed Salary with Urgent Pressure**: `+10 pts` (*Warning*)
* ⚠️ **Urgency / Scarcity Language Density**: `+8 pts` (*Warning*)
* ⚠️ **Spam Recruitment Template Language**: `+5 pts` (*Warning*)
* ✅ **Enterprise ATS Portal (Lever, Greenhouse, Workday)**: `−10 pts` (*Positive Credit*)
* ✅ **Verified Corporate Email Domain Match**: `−10 pts` (*Positive Credit*)

---

## 🔬 Benchmark & Real-World Validation

JobGuard was validated against an empirical dataset of **40 test fixtures** (22 synthetic regression cases + 18 real-world documented scam cases from the National Cybercrime Reporting Portal, Reddit `r/scams`, `r/developersIndia`, and FTC advisories):

```
================================================================================
🔬 JOBGUARD REAL-WORLD EMPIRICAL BENCHMARK
================================================================================
• Documented Scam Cases Flagged (HIGH/CRITICAL): 12 / 12 (100% Recall)
• Legitimate Listings Kept Safe (LOW/MEDIUM):      6 / 6 (100% True Negatives)
• False Positive Rate on Skilled Tech Freshers:    0%
• Mathematical Explainability Consistency:         100% (Sum of signals == Final Score)
================================================================================
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│               Google Chrome Browser Tab                │
│                                                        │
│  Content Script (Self-Contained IIFE)                  │
│  ├── Schema.org JSON-LD Extractor                      │
│  ├── SPA Navigation Interceptor (pushState / popstate) │
│  └── In-Page Floating Risk Badge                       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           JobGuard Extension Popup (React UI)          │
│                                                        │
│  100% Offline Deterministic Rule Engine (v2.0.0)       │
│  ├── 12-Signal Weight Aggregator                       │
│  ├── Hindi & Hinglish Linguistic Rules                 │
│  └── Score Clamping & Confidence Level Classifier      │
└──────────────────────────┬─────────────────────────────┘
                           │ (On-Demand User Click Only)
                           ▼
┌────────────────────────────────────────────────────────┐
│           JobGuard Backend API (Node.js/Express)       │
│                                                        │
│  ├── POST /api/v1/score/advice (Google Gemini Proxy)   │
│  └── PostgreSQL Database (Postings & Reports Schema)   │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Local Development & Building from Source

### Prerequisites
* Node.js (v18+)
* npm

### 1. Clone the Repository
```bash
git clone https://github.com/alokchoudhary885-coder/JOBGAURD-EXTENSION.git
cd JOBGAURD-EXTENSION
```

### 2. Build the Extension
```bash
cd extension
npm install
npm run build
```
The standalone IIFE bundle is generated in `extension/dist/`.

### 3. Run Validation Test Suite
```bash
cd ../backend
npm install
# Run Synthetic Regression Fixtures
npx ts-node src/validate-engine.ts

# Run Real-World Provenance Benchmark
npx ts-node src/validate-real-world.ts

# Verify Score == Sum of Signals
npx ts-node src/verify-score-sum.ts
```

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for more information.  
Created with ❤️ to protect job seekers and students from digital employment fraud.
