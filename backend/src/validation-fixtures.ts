import { JobMetadata, RiskLevel } from './types';

export interface ValidationFixture {
  id: string;
  name: string;
  expectedBand: RiskLevel;
  job: JobMetadata;
}

export const VALIDATION_FIXTURES: ValidationFixture[] = [
  // --- 1. LEGITIMATE POSTINGS (LOW RISK: 0 - 25) ---
  {
    id: 'legit_stripe_staff_eng',
    name: 'Stripe Staff Frontend Engineer (Lever ATS + Corporate Domain)',
    expectedBand: 'LOW',
    job: {
      title: 'Staff Frontend Engineer - Payments',
      company: 'Stripe Inc.',
      recruiterEmail: 'recruiting@stripe.com',
      companyWebsite: 'https://stripe.com/jobs',
      jobUrl: 'https://jobs.lever.co/stripe/staff-frontend-eng',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Stripe is seeking a Staff Frontend Engineer to lead architecture across global checkout infrastructure. Candidates must have 6+ years of experience with React, TypeScript, and high-reliability web systems. Comprehensive healthcare, parental leave, and competitive equity.'
    }
  },
  {
    id: 'legit_google_sr_product_mgr',
    name: 'Google Senior Product Manager (Greenhouse ATS + Schema.org)',
    expectedBand: 'LOW',
    job: {
      title: 'Senior Product Manager - Cloud Security',
      company: 'Google LLC',
      recruiterEmail: 'careers@google.com',
      companyWebsite: 'https://careers.google.com',
      jobUrl: 'https://boards.greenhouse.io/google/product-manager',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Google Cloud is looking for an experienced Product Manager to drive next-generation threat detection products. Minimum 5 years of product leadership in enterprise cloud environments. Technical interview rounds and background verification required.'
    }
  },
  {
    id: 'legit_microsoft_swe_fresher',
    name: 'Microsoft Software Engineer (University Graduate)',
    expectedBand: 'LOW',
    job: {
      title: 'Software Engineer - University Graduate',
      company: 'Microsoft Corporation',
      recruiterEmail: 'university-hiring@microsoft.com',
      companyWebsite: 'https://careers.microsoft.com',
      jobUrl: 'https://jobs.lever.co/microsoft/swe-grad-2026',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Join Microsoft as a university graduate software engineer. Work on Azure distributed storage systems. Requires BS/MS in Computer Science, solid understanding of data structures, algorithms, and C++/C#.'
    }
  },
  {
    id: 'legit_swiggy_backend_lead',
    name: 'Swiggy Lead Backend Developer (Corporate Domain)',
    expectedBand: 'LOW',
    job: {
      title: 'Lead Backend Developer',
      company: 'Swiggy',
      recruiterEmail: 'talent.acquisition@swiggy.in',
      companyWebsite: 'https://careers.swiggy.com',
      jobUrl: 'https://linkedin.com/jobs/view/99283741',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Swiggy is hiring a Lead Backend Developer to scale real-time delivery logistics engines. Expertise in Go, Kafka, Distributed Caching, and Microservices required. Competitive compensation and flexible hybrid working policy.'
    }
  },
  {
    id: 'legit_zomato_ops_manager',
    name: 'Zomato Operations Associate (Corporate Domain)',
    expectedBand: 'LOW',
    job: {
      title: 'Operations Associate - Quick Commerce',
      company: 'Zomato Limited',
      recruiterEmail: 'careers@zomato.com',
      companyWebsite: 'https://zomato.com/careers',
      jobUrl: 'https://internshala.com/job/detail/zomato-ops-88',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Seeking operations associates to manage inventory supply chain and regional fulfillment hubs. Standard interview rounds include business case study and operational problem solving.'
    }
  },
  {
    id: 'legit_zomato_hinglish_role',
    name: 'Zomato Frontend Developer (Hinglish JD + Corporate Email)',
    expectedBand: 'LOW',
    job: {
      title: 'Frontend Developer (React/TypeScript)',
      company: 'Zomato Limited',
      recruiterEmail: 'tech-hiring@zomato.com',
      companyWebsite: 'https://zomato.com/careers',
      jobUrl: 'https://careers.zomato.com/jobs/fe-eng',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Zomato ke engineering team mein Frontend Developer ki opening hai. Candidates ke paas 3+ years experience hona chahiye React.js aur TypeScript mein. Structured technical screening rounds aur coding interview conduct honge.'
    }
  },

  // --- 2. UNVERIFIED / INFORMAL POSTINGS (MEDIUM RISK: 26 - 50) ---
  {
    id: 'startup_gmail_recruiter',
    name: 'Boutique Marketing Agency with Gmail Contact',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Social Media Marketing Associate',
      company: 'PixelNova Creative Studio',
      recruiterEmail: 'pixelnova.hiring@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/445129',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'PixelNova is a boutique branding studio looking for a social media coordinator. Responsible for Instagram scheduling, Canva designs, and content calendar management. Please submit portfolio to pixelnova.hiring@gmail.com.'
    }
  },
  {
    id: 'startup_whatsapp_scheduling',
    name: 'Design Studio Directing to WhatsApp for Interview Scheduling',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Junior Graphic Designer',
      company: 'Artisan Web Crafts',
      jobUrl: 'https://internshala.com/job/detail/artisan-designer-11',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Looking for a junior graphic designer proficient in Figma and Adobe Illustrator. Work on branding mockups. Candidates must contact our recruitment coordinator directly on WhatsApp at wa.me/919811223344 for interview scheduling.'
    }
  },
  {
    id: 'startup_gmail_and_whatsapp_combo',
    name: 'Freelance Agency with Public Webmail and WhatsApp Support',
    expectedBand: 'MEDIUM',
    job: {
      title: 'React.js Frontend Intern',
      company: 'NextGen Digital Hub',
      recruiterEmail: 'nextgenhub.careers@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/8812903',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'We are looking for React.js interns to build landing pages and dashboard widgets. Send resume to nextgenhub.careers@gmail.com and drop a message on WhatsApp wa.me/919988776655 to confirm slot.'
    }
  },
  {
    id: 'urgency_undisclosed_salary',
    name: 'Unverified Agency with Urgent Hiring Pressure and Undisclosed Pay',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Customer Support Representative',
      company: 'Prime Global Solutions',
      recruiterEmail: 'primeglobal.hr@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=7721890',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Urgent hiring for customer support agents. Immediate joining required. Handle inbound chat and ticket resolution. Send email to primeglobal.hr@gmail.com today.'
    }
  },

  // --- 3. SUSPICIOUS / HIGH RISK POSTINGS (HIGH RISK: 51 - 75) ---
  {
    id: 'high_risk_instant_offer_telegram',
    name: 'Direct Selection & Telegram Channel Without Interview',
    expectedBand: 'HIGH',
    job: {
      title: 'Online Back Office Assistant',
      company: 'Swift Dynamic Services',
      recruiterEmail: 'swift.careers2026@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/swift-dynamic-88',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Direct selection for back office assistant! Offer letter today without any interview needed. Work on daily document uploads. Join telegram channel t.me/swiftdynamichire to get started immediately.'
    }
  },
  {
    id: 'high_risk_unrealistic_fresher_pay',
    name: 'Entry-Level Typing Work Offering ₹90,000/month',
    expectedBand: 'HIGH',
    job: {
      title: 'Data Entry & Typing Specialist (Fresher)',
      company: 'Global Vision Enterprise',
      recruiterEmail: 'globalvision.recruiting@gmail.com',
      salary: '₹90,000 / month',
      jobUrl: 'https://indeed.com/viewjob?jk=6618290',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Freshers can apply for home based typing job. Earn ₹90,000 per month guaranteed. No experience needed. Contact coordinator on WhatsApp at wa.me/919877001122 for immediate slot confirmation.'
    }
  },
  {
    id: 'high_risk_spam_urgency_mass_hire',
    name: 'Mass Hiring with Spam Language and Aggressive Urgency',
    expectedBand: 'HIGH',
    job: {
      title: 'Online Form Filling Associate',
      company: 'SuperFast Enterprise Solutions',
      recruiterEmail: 'superfast.jobs@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/superfast-jobs',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Urgent requirement! Limited seats filling fast. 100% gurantee daily payment system for online form filling work. Direct joining without interview needed. Contact on WhatsApp wa.me/919888771122 immediately.'
    }
  },
  {
    id: 'high_risk_telegram_crypto_promoter',
    name: 'Telegram Social Media Promoter with Instant Joining',
    expectedBand: 'HIGH',
    job: {
      title: 'Social Media Promoter (No Experience)',
      company: 'Alpha Digital Networks',
      recruiterEmail: 'alphanetwork.hr@yahoo.com',
      salary: '₹80,000 / month',
      jobUrl: 'https://linkedin.com/jobs/view/7719280',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'No experience required! Earn 80000 per month working from home. Direct selection today with instant offer. Must join our official Telegram group t.me/alphajobnetwork to receive daily social media tasks.'
    }
  },
  {
    id: 'high_risk_hindi_ghar_baithe_typing',
    name: 'Hindi/Hinglish "Ghar Baithe Kamayein" High Salary Trap',
    expectedBand: 'HIGH',
    job: {
      title: 'Ghar Baithe Typing Job',
      company: 'Online Seva Kendra Group',
      recruiterEmail: 'ghar.baithe.jobs@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/ghar-baithe-99',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Ghar baithe kamayein 60000 per month! Bina interview job direct selection bina kisi qualification ke. WhatsApp par message karein wa.me/919876543210 aaj hi.'
    }
  },
  {
    id: 'high_risk_hindi_turant_selection',
    name: 'Hindi/Hinglish "Turant Selection & Limited Seats" Pressure Lure',
    expectedBand: 'HIGH',
    job: {
      title: 'Back Office Executive (Urgent Vacancy)',
      company: 'Rapid Placement Hub',
      recruiterEmail: 'rapid.placement2026@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=552199',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Urgent vacancy hai! Limited seats bache hain jaldi apply karein. Seedha selection bina interview ke. Turant offer letter milega. Send resume to rapid.placement2026@gmail.com.'
    }
  },

  // --- 4. CRITICAL FRAUD / SCAM POSTINGS (CRITICAL RISK: 76 - 100) ---
  {
    id: 'critical_scam_training_fee',
    name: 'Registration / Training Fee Extortion Trap',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Online Data Processing Executive',
      company: 'QuickHire Career Hub',
      recruiterEmail: 'quickhire.jobs2026@tempmail.com',
      jobUrl: 'https://internshala.com/job/detail/quickhire-99',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn ₹85,000 per month working from home! No interview needed. Selected candidates must pay a refundable registration fee of INR 1500 for training kit and verification ID. Contact HR manager on WhatsApp wa.me/919911223344 to pay.'
    }
  },
  {
    id: 'critical_scam_laptop_security_deposit',
    name: 'Work From Home Laptop Security Deposit Extortion',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Remote Data Entry Clerk',
      company: 'Apex Cloud Solutions',
      recruiterEmail: 'apexcloud.hiring@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=9928102',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Direct joining today! Company provides free high-end laptop and 5G internet router. Candidates must deposit refundable security deposit of Rs 2500 for equipment courier insurance. Join t.me/apexcloudjobs now.'
    }
  },
  {
    id: 'critical_scam_bank_upi_pin_request',
    name: 'Premature UPI PIN and Banking Details Phishing',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Verification Officer (Direct Joining)',
      company: 'National Verification Services',
      recruiterEmail: 'national.verif@yahoo.com',
      jobUrl: 'https://internshala.com/job/detail/national-verif',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Immediate appointment letter issued! Candidate must verify bank account and provide UPI PIN verification code to activate direct payroll account. Must also pay processing fee of INR 999 via WhatsApp wa.me/919811223399.'
    }
  },
  {
    id: 'critical_scam_id_card_charge_scam',
    name: 'Fake Internship Charging Mandatory Uniform & ID Card Fee',
    expectedBand: 'CRITICAL',
    job: {
      title: 'HR Operations Intern (Direct Selection)',
      company: 'Global Future Career Hub',
      recruiterEmail: 'globalfuture.careers@gmail.com',
      salary: '₹75,00,000 / month',
      jobUrl: 'https://linkedin.com/jobs/view/66182931',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Freshers can apply for guaranteed HR internship. Earn 75000 per month with no interview required. Selected candidates must pay documentation fee and ID card charge of ₹1200 on WhatsApp wa.me/919876543210 before joining.'
    }
  },
  {
    id: 'critical_scam_hindi_training_fees_paisa',
    name: 'Hindi/Hinglish "Training Fees & Registration Ka Paisa" Scam',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Data Entry Operator (Work From Home)',
      company: 'Bharat Digital Career Portal',
      recruiterEmail: 'bharat.digital.jobs@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/bharat-digital-77',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Ghar baithe typing ka kaam karke 50000 per month kamayein! Bina interview direct selection. Selected candidates ko training fees dena hoga Rs 1500 refundable security jama karein. WhatsApp par message karein wa.me/919988112233.'
    }
  },
  {
    id: 'critical_scam_hindi_khata_bank_phishing',
    name: 'Hindi/Hinglish "Khata Number & Bank Detail" Phishing Trap',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Online Verification Agent',
      company: 'Direct Seva Trust',
      recruiterEmail: 'direct.seva.hr@yahoo.com',
      jobUrl: 'https://internshala.com/job/detail/direct-seva-101',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Aaj hi joining karein! Candidate apna khata number aur bank detail verify karein aur processing fee deposit karein INR 999 wa.me/919811223377 par tab offer letter turant milega.'
    }
  }
];
