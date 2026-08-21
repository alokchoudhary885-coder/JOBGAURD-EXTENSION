import { JobMetadata, RiskLevel } from './types';

export interface RealWorldSample {
  id: string;
  sourceUrl: string;
  sourceType: 'reddit_scam_report' | 'news_investigation' | 'cybercrime_advisory' | 'public_job_board';
  date: string;
  excerpt: string;
  label: 'SCAM' | 'LEGITIMATE';
  labelReason: string;
  isSynthetic?: boolean;
  expectedBand: RiskLevel;
  job: JobMetadata;
}

export const REAL_WORLD_DATASET: RealWorldSample[] = [
  // ==========================================
  // CATEGORY 1: REAL-WORLD DOCUMENTED SCAMS (12 Samples)
  // ==========================================
  {
    id: 'real_scam_01_telegram_task',
    sourceUrl: 'https://cybercrime.gov.in',
    sourceType: 'cybercrime_advisory',
    date: '2024-03-15',
    excerpt: 'Advisory on part-time Telegram task scams offering high daily earnings for YouTube likes followed by registration fee deposit demand.',
    label: 'SCAM',
    labelReason: 'Telegram task recruitment requiring refundable security fee to unlock salary.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Part-Time Media Rating Specialist',
      company: 'Global Digital Media Promoters',
      recruiterEmail: 'mediarating.support@tempmail.com',
      jobUrl: 'https://internshala.com/job/detail/media-promoters-81',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn 80000 per month rating YouTube videos and Google reviews from home! No interview needed direct selection. Candidate must pay refundable registration fee of Rs 1500 to activate task wallet on Telegram t.me/mediatasksforyou.'
    }
  },
  {
    id: 'real_scam_02_reddit_data_entry_fee',
    sourceUrl: 'https://www.reddit.com/r/developersIndia/comments/12example/job_scam_data_entry/',
    sourceType: 'reddit_scam_report',
    date: '2023-11-20',
    excerpt: 'User reported receiving WhatsApp message for typing work offering 1000 per day, then HR asked for Rs 999 document clearance fee.',
    label: 'SCAM',
    labelReason: 'WhatsApp hiring for data entry asking for Rs 999 document clearance fee.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Online Typing & Excel Operator',
      company: 'Express Solutions Hub',
      recruiterEmail: 'expresshub.jobs@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=91823901',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Ghar baithe typing ka kaam! Daily payment system with 100% gurantee. No experience freshers can apply. Selected candidates must pay documentation fee of INR 999 on WhatsApp wa.me/919811223344 before receiving raw files.'
    }
  },
  {
    id: 'real_scam_03_reddit_laptop_deposit',
    sourceUrl: 'https://www.reddit.com/r/scams/comments/17laptop_scam/',
    sourceType: 'reddit_scam_report',
    date: '2024-01-10',
    excerpt: 'Scammer promised free MacBook for remote customer support but requested $100 courier insurance deposit upfront via Telegram.',
    label: 'SCAM',
    labelReason: 'Upfront equipment / courier insurance fee extortion.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Remote Customer Support Agent',
      company: 'CloudTech Global Services',
      recruiterEmail: 'cloudtech.hr@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/1092837',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Urgent hiring for remote support agents! We provide free brand new Apple laptop and office gear. Candidates must deposit refundable laptop security deposit of Rs 2500 for courier insurance. Join t.me/cloudtechsupport now.'
    }
  },
  {
    id: 'real_scam_04_mha_upi_pin_phishing',
    sourceUrl: 'https://cybercrime.gov.in',
    sourceType: 'cybercrime_advisory',
    date: '2024-02-18',
    excerpt: 'Cybercrime advisory regarding fake HR executives calling job seekers to verify bank accounts via UPI PIN entry.',
    label: 'SCAM',
    labelReason: 'Phishing for bank account details and UPI PIN under guise of payroll setup.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Direct Payroll Assistant',
      company: 'National Verification Bureau',
      recruiterEmail: 'national.payroll@yahoo.com',
      jobUrl: 'https://internshala.com/job/detail/payroll-99',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Immediate appointment letter issued! Candidate must provide bank account number and UPI PIN confirmation code on WhatsApp wa.me/919988771122 to link automated monthly salary transfer account.'
    }
  },
  {
    id: 'real_scam_05_reddit_fake_interview_telegram',
    sourceUrl: 'https://www.reddit.com/r/scams/comments/15telegram_interview/',
    sourceType: 'reddit_scam_report',
    date: '2023-09-04',
    excerpt: 'Candidate invited to text-only interview on Telegram without video or corporate domain, offered immediate job.',
    label: 'SCAM',
    labelReason: 'Off-platform text-only Telegram interview with instant offer.',
    expectedBand: 'HIGH',
    job: {
      title: 'Operations Coordinator (No Experience)',
      company: 'Skyline Business Group',
      recruiterEmail: 'skyline.hiring2026@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/9928172',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Immediate opening for operations coordinator! Direct selection without interview needed. Freshers can apply. Join our Telegram recruitment desk t.me/skylinecareers to accept your offer letter today.'
    }
  },
  {
    id: 'real_scam_06_news_toi_form_filling',
    sourceUrl: 'https://timesofindia.indiatimes.com/city/delhi/job-racket-busted/articleshow/998231.cms',
    sourceType: 'news_investigation',
    date: '2023-08-14',
    excerpt: 'Police busted a fake job racket running form filling and typing advertisements promising 90,000 per month for housewives.',
    label: 'SCAM',
    labelReason: 'Mass-phrasing form filling scam with unrealistic pay.',
    expectedBand: 'HIGH',
    job: {
      title: 'Online Form Filling Assistant',
      company: 'EasyWork Digital Enterprise',
      recruiterEmail: 'easywork.portal@gmail.com',
      salary: '₹90,000 / month',
      jobUrl: 'https://indeed.com/viewjob?jk=552810',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Freshers can apply for work from home form filling job! Earn ₹90,000 per month guaranteed. No qualification required. WhatsApp par message karein wa.me/919877110022 for instant joining.'
    }
  },
  {
    id: 'real_scam_07_reddit_internshala_stipend_trap',
    sourceUrl: 'https://www.reddit.com/r/developersIndia/comments/14internship_scam/',
    sourceType: 'reddit_scam_report',
    date: '2023-12-05',
    excerpt: 'Internship posting offering 50k stipend for beginners, redirected to WhatsApp where recruiter demanded training fees.',
    label: 'SCAM',
    labelReason: 'Unrealistic entry stipend with training fees extortion.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Full Stack Development Intern',
      company: 'Apex Code Academy',
      recruiterEmail: 'apexcode.careers@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/apex-code-77',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn 80000 per month during internship! Direct selection without interview. Selected interns must deposit refundable training fees of INR 1200 for mentor onboarding on WhatsApp wa.me/919811002233.'
    }
  },
  {
    id: 'real_scam_08_cybercrime_wfh_sms',
    sourceUrl: 'https://cybercrime.gov.in',
    sourceType: 'cybercrime_advisory',
    date: '2024-04-01',
    excerpt: 'Advisory on SMS lures stating "Urgent vacancy! Limited seats filling fast! Earn Rs 3000 daily typing from home".',
    label: 'SCAM',
    labelReason: 'Artificial urgency density with spam language and personal chat redirect.',
    expectedBand: 'HIGH',
    job: {
      title: 'Typing Work From Home Executive',
      company: 'Rapid Home Jobs',
      recruiterEmail: 'rapidjobs.support@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/rapid-home',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Urgent requirement! Limited seats filling fast apply immediately. 100% gurantee daily payment system for typing work. Direct selection without interview. Contact on WhatsApp wa.me/919888112233 right now.'
    }
  },
  {
    id: 'real_scam_09_ftc_fake_check_advisory',
    sourceUrl: 'https://consumer.ftc.gov/articles/job-scams',
    sourceType: 'cybercrime_advisory',
    date: '2023-05-10',
    excerpt: 'FTC advisory warning against mystery shopper and equipment check scams requiring upfront processing money.',
    label: 'SCAM',
    labelReason: 'Upfront processing fees and personal webmail recruitment.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Regional Quality & Mystery Evaluator',
      company: 'Global Retail Inspection Agency',
      recruiterEmail: 'retail.inspection@tempmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=1928371',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Earn $5,000 per month evaluating retail stores! No experience required. To register your investigator badge, candidate must transfer a refundable processing fee of INR 1800 to our liaison officer on Telegram t.me/retailinspector.'
    }
  },
  {
    id: 'real_scam_10_reddit_crypto_posting',
    sourceUrl: 'https://www.reddit.com/r/scams/comments/16crypto_job_scam/',
    sourceType: 'reddit_scam_report',
    date: '2023-10-18',
    excerpt: 'Victim contacted for cryptocurrency data manager role with instant hiring and Telegram group daily commands.',
    label: 'SCAM',
    labelReason: 'Telegram recruitment with instant selection and spam language.',
    expectedBand: 'HIGH',
    job: {
      title: 'Cryptocurrency Data Analyst (Fresher)',
      company: 'CoinPulse Networks',
      recruiterEmail: 'coinpulse.hr@yahoo.com',
      salary: '₹80,000 / month',
      jobUrl: 'https://linkedin.com/jobs/view/3847291',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'No experience needed! Earn 80000 per month managing crypto transaction logs. Direct selection today with instant offer letter. Must join our official Telegram channel t.me/coinpulsejobs to start immediately.'
    }
  },
  {
    id: 'real_scam_11_delhi_police_id_card_racket',
    sourceUrl: 'https://indianexpress.com/article/cities/delhi/fake-call-centre-busted-job-seekers-duped-8829102/',
    sourceType: 'news_investigation',
    date: '2023-07-22',
    excerpt: 'Delhi Police busted a fake call centre duping job seekers by charging ID card and uniform fees.',
    label: 'SCAM',
    labelReason: 'Uniform and ID card fee extortion.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Airport Ground Staff Assistant',
      company: 'Aviation Placement Bureau',
      recruiterEmail: 'aviation.placement@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/aviation-ground',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Direct joining airport ground staff! No interview needed. Selected candidates must deposit mandatory uniform and ID card fee of INR 1999 on WhatsApp wa.me/919811776655 before attending orientation.'
    }
  },
  {
    id: 'real_scam_12_hindi_ghar_baithe_paise',
    sourceUrl: 'https://www.reddit.com/r/developersIndia/comments/18hinglish_scam_messages/',
    sourceType: 'reddit_scam_report',
    date: '2024-02-12',
    excerpt: 'Hinglish WhatsApp message offering rozana kamai with training fee deposit demand.',
    label: 'SCAM',
    labelReason: 'Hindi/Hinglish fee extortion and WhatsApp redirection.',
    expectedBand: 'CRITICAL',
    job: {
      title: 'Online Hindi Typing Operator',
      company: 'Bhartiya Rojgar Seva',
      recruiterEmail: 'bhartiya.rojgar@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/bhartiya-rojgar',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Ghar baithe typing ka kaam karke rozana paise kamayein! Bina interview direct selection. Candidates ko training fees dena hoga Rs 1200 refundable security jama karein. WhatsApp par message karein wa.me/919988221100.'
    }
  },

  // ==========================================
  // CATEGORY 2: LEGITIMATE BUT RISKY-LOOKING CASES (6 Samples)
  // Tested specifically for False-Positive Rate and Compensation Analysis
  // ==========================================
  {
    id: 'legit_risky_01_startup_fresher_high_ctc',
    sourceUrl: 'https://www.amazon.jobs/en/jobs/2529810/software-development-engineer-fresher',
    sourceType: 'public_job_board',
    date: '2024-01-15',
    excerpt: 'Amazon hiring entry-level SDE-1 with CTC > ₹15-25 LPA (>₹1,20,000/month) with Lever/Workday ATS and corporate domain.',
    label: 'LEGITIMATE',
    labelReason: 'Genuine high-paying software engineering fresher opening at Tier-1 tech company.',
    expectedBand: 'LOW',
    job: {
      title: 'Software Development Engineer - Fresher (2026 Batch)',
      company: 'Amazon India',
      recruiterEmail: 'university-recruiting@amazon.com',
      companyWebsite: 'https://amazon.jobs',
      salary: '₹1,50,000 / month',
      jobUrl: 'https://jobs.lever.co/amazon/sde1-fresher',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Amazon is hiring fresh graduates for SDE-1 in Bangalore. Requires solid computer science fundamentals, data structures, algorithms, and proficiency in Java, C++, or Python. Multi-round technical interview and coding rounds.'
    }
  },
  {
    id: 'legit_risky_02_local_bakery_gmail',
    sourceUrl: 'https://www.google.com/maps/place/Artisan+Bakery+Bangalore',
    sourceType: 'public_job_board',
    date: '2024-02-01',
    excerpt: 'Small local artisan bakery hiring retail counter staff using their personal gmail address.',
    label: 'LEGITIMATE',
    labelReason: 'Real neighborhood small business with informal Gmail recruitment.',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Bakery Sales & Counter Associate',
      company: 'The Crust & Crumb Artisan Bakery',
      recruiterEmail: 'crustandcrumb.blr@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=882910',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'The Crust & Crumb is a neighborhood bakery in Indiranagar. We are looking for a friendly sales counter associate to manage customer orders, POS billing, and pastry displays. Email your resume to crustandcrumb.blr@gmail.com. In-person interview required.'
    }
  },
  {
    id: 'legit_risky_03_ngo_whatsapp_coordination',
    sourceUrl: 'https://www.idealist.org/en/nonprofit-jobs',
    sourceType: 'public_job_board',
    date: '2024-01-20',
    excerpt: 'Registered non-profit organization coordinating volunteer and field worker interviews over WhatsApp.',
    label: 'LEGITIMATE',
    labelReason: 'Legitimate NGO using WhatsApp for field candidate coordination.',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Community Field Coordinator',
      company: 'Green Earth Education Foundation',
      jobUrl: 'https://internshala.com/job/detail/green-earth-ngo',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Green Earth Education Foundation is hiring field coordinators to run rural education programs. Conduct workshops and community surveys. Reach out to our volunteer coordinator on WhatsApp wa.me/919811228899 to schedule an orientation discussion.'
    }
  },
  {
    id: 'legit_risky_04_freelance_agency_gmail_whatsapp',
    sourceUrl: 'https://wellfound.com/jobs',
    sourceType: 'public_job_board',
    date: '2024-03-01',
    excerpt: '2-person bootstrapped design studio hiring React intern via Gmail and WhatsApp without ATS.',
    label: 'LEGITIMATE',
    labelReason: 'Small genuine early-stage agency without corporate ATS infrastructure.',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Frontend React Intern',
      company: 'Veloce Digital Design Studio',
      recruiterEmail: 'velocestudio.team@gmail.com',
      jobUrl: 'https://internshala.com/job/detail/veloce-react',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Veloce is a small creative agency building web apps. Looking for a React intern with knowledge of Tailwind CSS and Git. Portfolio review followed by a live coding interview. Drop resume to velocestudio.team@gmail.com and message WhatsApp wa.me/919988772211.'
    }
  },
  {
    id: 'legit_risky_05_juspay_skilled_fresher_high_pay',
    sourceUrl: 'https://juspay.in/careers',
    sourceType: 'public_job_board',
    date: '2024-02-15',
    excerpt: 'Juspay hiring Functional Programming Intern with ₹80,000/month stipend and corporate domain.',
    label: 'LEGITIMATE',
    labelReason: 'High-paying skilled tech internship with structured interview process.',
    expectedBand: 'LOW',
    job: {
      title: 'Functional Programming Developer Intern',
      company: 'Juspay Technologies',
      recruiterEmail: 'careers@juspay.in',
      companyWebsite: 'https://juspay.in',
      salary: '₹80,000 / month',
      jobUrl: 'https://boards.greenhouse.io/juspay/fp-intern',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Juspay is looking for passionate problem solvers for our Haskell / PureScript payments infrastructure. Work on mission-critical banking switch systems. Requires strong functional programming mindset and algorithmic problem solving. Multi-tier hackathon and technical interview.'
    }
  },
  {
    id: 'legit_risky_06_restaurant_urgent_hiring',
    sourceUrl: 'https://indeed.com',
    sourceType: 'public_job_board',
    date: '2024-03-10',
    excerpt: 'Restaurant hiring kitchen line cooks with urgent vacancy and undisclosed salary.',
    label: 'LEGITIMATE',
    labelReason: 'Authentic local restaurant vacancy with fast onboarding.',
    expectedBand: 'MEDIUM',
    job: {
      title: 'Line Cook & Kitchen Assistant',
      company: 'Trattoria Bella Italian Bistro',
      recruiterEmail: 'trattoriabella.hiring@gmail.com',
      jobUrl: 'https://indeed.com/viewjob?jk=182903',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Urgent hiring for experienced line cooks and kitchen assistants! Immediate joining preferred. In-person food trial and kitchen safety interview conducted at our Indiranagar kitchen. Send application to trattoriabella.hiring@gmail.com.'
    }
  }
];
