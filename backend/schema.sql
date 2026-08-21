-- JobGuard Postgres Database Schema v2
-- Architecture: Companies, Scam Reports, Cross-Posting Duplicate Detection Index

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    domain_age_days INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    posting_hash VARCHAR(64) NOT NULL,
    risk_band VARCHAR(20) NOT NULL,
    reasons TEXT[] NOT NULL,
    custom_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS postings_seen (
    id SERIAL PRIMARY KEY,
    posting_hash VARCHAR(64) NOT NULL,
    description_hash VARCHAR(64) NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    seen_count INTEGER DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_postings_hash ON postings_seen(posting_hash);
CREATE INDEX IF NOT EXISTS idx_desc_hash ON postings_seen(description_hash);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_reports_posting_hash ON reports(posting_hash);
