# GigSafe Job Board

A job board aggregator for delivery driver and logistics positions, featuring 1,186+ jobs from 10 companies.

## Features

- 🔍 **Advanced Search** - Search by keyword across title, description, company, benefits
- 📍 **Location Filters** - Filter by state and city
- 🚗 **Vehicle Filters** - Filter by required vehicle type (Van, Box Truck, Car, etc.)
- 📜 **Certification Search** - Find jobs requiring specific certifications
- 📧 **Job Alerts** - Subscribe with your preferences and upload certifications
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jimmy-Thompson/GigSafeJobBoard.git
cd GigSafeJobBoard
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

This will:
- Start the API server on port 3000
- Start the web server on port 8000
- Open your browser to http://localhost:8000/landing.html

### Individual Commands

Start just the API server:
```bash
npm run api
```

Start just the frontend:
```bash
npm run dev
```

### Faster LLM Extraction
- Set multiple API keys via `ANTHROPIC_API_KEYS=key1,key2,...` to shard traffic automatically (falls back to `ANTHROPIC_API_KEY`).
- `npm run scrape <company> --llm-max-concurrency=3 --llm-rpm=60` tunes per-key throughput; omit to use defaults (2 concurrent / 40 RPM).
- Add `--llm-force` to reprocess existing `job_*.txt` files, or `--llm-serial` to fall back to the legacy single-threaded flow for debugging.
- `npx tsx scripts/batch_llm.ts <output_dir> <company>` now leverages the same scheduler for ad-hoc reruns.
- Job texts are hashed automatically—unchanged postings reuse cached JSON instead of calling the LLM again (disable with `--llm-force` when needed).

### Run Every Pipeline With One Command
- `npm run scrape:all` (or `npx tsx scripts/run_all.ts --all`) walks every company sequentially, reusing the faster LLM backend under the hood.
- Target a subset with `npx tsx scripts/run_all.ts --companies=amazon-dsp,dropoff` or skip noisy sources via `--exclude=airspace,gopuff`.
- Use `--max-parallel=2` to let a couple of companies run at once, and pass any LLM tuning flags (`--llm-max-concurrency`, `--llm-rpm`, `--llm-force`, etc.)—they cascade down to each per-company run.
- Append `--dry-run` to see the planned order without launching Playwright, `--list` to print the manifest with pipeline types, and `--resume` to pick up the last interrupted run without reprocessing finished companies.
 - The orchestrator prefers the unified prompt by default. To force unified prompt on a single company run, add `--llm-unified-prompt`.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript with modern design
- **Backend:** Express.js API server
- **Database:** SQLite (better-sqlite3)
- **Analytics:** PostHog (user behavior tracking)

## API Endpoints

### `GET /api/jobs`
Fetch jobs with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Jobs per page (default: 20)
- `keyword` (string) - Search term for title/description/company
- `state` (string) - Filter by state (e.g., "CA", "TX")
- `city` (string) - Filter by city
- `vehicle` (string) - Filter by vehicle requirement
- `certifications` (string) - Comma-separated certification list

**Example:**
```bash
curl "http://localhost:3000/api/jobs?state=CA&keyword=driver&page=1&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalJobs": 482,
    "totalPages": 25,
    "hasMore": true
  }
}
```

### `POST /api/subscribe`
Subscribe to job alerts with optional certification uploads.

**Body (multipart/form-data):**
- `email` (required)
- `firstName`, `lastName`, `city`, `state`
- `sourceTag` - Source of subscription
- `certifications[]` - File uploads (images, PDFs)

## Database Schema

### Jobs Table
- `id` - Primary key
- `job_url` - Application URL
- `title` - Job title
- `company` - Hiring company
- `city`, `state`, `address` - Location
- `description` - Full job description
- `general_requirements` - Job requirements
- `pay` - Compensation details
- `benefits` - Benefits offered
- `vehicle_requirements` - Required vehicle types
- `insurance_requirement` - Insurance needs
- `schedule_details` - Work schedule
- `source_company` - Original source (amazon-dsp, medspeed, etc.)
- `scraped_at` - Timestamp

### Subscribers Table
- `id` - Primary key
- `email` - Email address (unique)
- `first_name`, `last_name`
- `city`, `state`
- `source_tag` - Subscription source
- `created_at` - Timestamp

### Subscriber Certifications Table
- `id` - Primary key
- `subscriber_id` - Foreign key to subscribers
- `certification_type` - Type of certification
- `file_name`, `file_path`, `file_size`, `mime_type`
- `uploaded_at` - Timestamp

## Data Sources

Jobs aggregated from:
- Amazon DSP (482 jobs)
- Airspace (283 jobs)
- GoPuff (181 jobs)
- Dropoff (78 jobs)
- MedSpeed (74 jobs)
- RedWagon (33 jobs)
- MDS-RX (25 jobs)
- SDS-RX (24 jobs)
- BlueJay Logistics (5 jobs)
- US-Pack (1 job)

**Total:** 1,186 unique jobs across 10 companies

## Project Structure

```
GigSafeJobBoard/
├── App/
│   ├── landing.html           # Main frontend interface
│   └── cities_by_state.json   # Location filter data
├── shared/
│   └── db.js                  # SQLite database connection
├── outputs/
│   └── master_database/
│       └── master_jobs.db     # Job database
├── uploads/                   # User certification uploads
├── api-server.js              # Express API server
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## License

MIT License - feel free to use for your own projects!

## Contact

For questions or issues, please open a GitHub issue.
