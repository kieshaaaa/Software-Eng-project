# Software-Eng-project
UCS503
TIET LostLink
# TIET LostLink

A secure, web-based lost-and-found platform for students at **Thapar Institute of Engineering and Technology (TIET)**.

LostLink centralizes lost and found item reports, suggests possible matches using a simple weighted algorithm, supports private ownership claims, and records secure item handovers.

> Course project for **UCS503P**  
> Instructor: **Nisha Thakur**  
> Date: **August 18, 2026**

## Problem Statement

Students currently report lost and found items through scattered WhatsApp groups, social-media posts, word of mouth, and security desks. These methods are difficult to search, messages disappear quickly, and publicly sharing every identifying detail can enable false claims.

LostLink provides one searchable platform for reporting, matching, claiming, and returning items while keeping sensitive ownership details private.

## Main Features

- Student registration and login using an institutional email address
- Separate lost-item and found-item reports
- Optional item image upload
- Search and filters by category, date, colour, brand, location, and status
- Explainable weighted match suggestions
- Public and private item-detail separation
- Ownership claim submission with supporting evidence
- Claim approval or rejection by the finder
- Temporary one-time code for physical handover
- Return confirmation and report status tracking
- In-application notifications
- Basic administrator dashboard for flags and disputes

## Supported Item Categories

The first version supports a deliberately limited set of categories so the project can be completed by two students within four weeks:

1. Backpacks and bags
2. Water bottles and tumblers
3. Wallets and purses
4. Earbuds and headphone cases
5. Keys and keychains
6. Books and notebooks

Cash, jewellery, government documents, plain charging cables, and visually indistinguishable mass-produced items are outside the initial automated matching scope.

## User Workflow

1. A student registers and logs in.
2. The student submits a lost or found report.
3. LostLink generates a unique report ID.
4. The system compares the report with active reports of the opposite type in the same category.
5. The user reviews a ranked list of possible matches.
6. The apparent owner submits a private ownership claim.
7. The finder reviews the claim and approves or rejects it.
8. An approved claim generates a temporary handover code.
9. Both students confirm the physical handover.
10. The related report is marked as `Returned`.

The match score only helps users find candidates. It does **not** prove legal ownership.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| Styling | Basic CSS or Tailwind CSS |
| Routing | React Router |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Image storage | Supabase Storage |
| API communication | Axios or Fetch API |
| Backend testing | Jest + Supertest |
| API testing | Postman |
| Version control | Git + GitHub |
| CI | GitHub Actions |
| Deployment | Vercel (frontend) + Render (backend) |

## System Architecture

```text
React frontend  ->  Express REST API  ->  Supabase
                                             |-- PostgreSQL
                                             |-- Authentication
                                             `-- Image storage
```

This three-tier structure avoids a separate machine-learning server and keeps the implementation practical within the course timeline.

## Possible-Match Algorithm

Before scoring, the system keeps only candidates that:

- Have the opposite report type (`Lost` versus `Found`)
- Belong to the same item category
- Have an active status

Each remaining candidate receives a score out of 100:

| Matching condition | Score |
| --- | ---: |
| Same item category | 30 |
| Same brand | 15 |
| Same or similar colour | 15 |
| Same or nearby campus location | 15 |
| Dates within three days | 15 |
| Description keyword similarity | 10 |

Initial score interpretation:

- **75–100:** High-likelihood candidate
- **50–74:** Possible candidate
- **Below 50:** Weak candidate

Description similarity uses basic text processing:

1. Convert both descriptions to lowercase.
2. Remove punctuation.
3. Split the descriptions into keywords.
4. Remove common words.
5. Calculate the percentage of meaningful keywords shared by both descriptions.

The weights and thresholds may be adjusted after controlled testing.

## Ownership Verification

LostLink uses several verification signals because students may not possess receipts or serial numbers.

- The finder records hidden characteristics that are not shown publicly.
- The claimant describes the item before seeing those characteristics.
- Claim answers are timestamped and locked after submission.
- Supporting evidence may include:
  - An older photograph
  - A hidden scratch or sticker
  - Contents of a bag or wallet
  - Device name
  - Device unlocking or pairing
  - A matching key
  - Approximate loss time and location
- Generic, disputed, or high-value items should use a supervised handover through an administrator or campus security desk.

The finder or an authorized responsible person makes the final decision—not the matching algorithm.

## Suggested Project Structure

```text
lostlink/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- App.jsx
|   |-- package.json
|   `-- vite.config.js
|
|-- server/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- app.js
|   |-- tests/
|   `-- package.json
|
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|
|-- .env.example
|-- .gitignore
`-- README.md
```

## Core Database Tables

| Table | Purpose |
| --- | --- |
| `users` | Student identity, role, verification, and account status |
| `item_reports` | Lost/found reports, item fields, descriptions, private details, and status |
| `matches` | Suggested report pairs and calculated match scores |
| `claims` | Claimant answers, supporting evidence, and approval status |
| `handovers` | Hashed one-time code, expiry, and return confirmation |
| `notifications` | In-application workflow updates |
| `flags` | Suspicious activity and inappropriate report records |

## Getting Started

### Prerequisites

Install or create the following before running the project:

- Node.js 20 or later
- npm
- Git
- A Supabase project

### 1. Clone the repository

```bash
git clone <repository-url>
cd lostlink
```

Replace `<repository-url>` with the URL of your GitHub repository.

### 2. Install dependencies

Install the frontend dependencies:

```bash
cd client
npm install
```

Install the backend dependencies:

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create a file named `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a file named `server/.env`:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key

HANDOVER_CODE_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

> Never commit `.env` files or expose the Supabase service-role key in frontend code.

### 4. Start the backend

```bash
cd server
npm run dev
```

The backend API will normally run at:

```text
http://localhost:5000
```

### 5. Start the frontend

Open another terminal and run:

```bash
cd client
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## Suggested API Routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/reports` | Create a lost or found report |
| `GET` | `/api/reports` | Search and filter active reports |
| `GET` | `/api/reports/:id` | View an authorized report response |
| `PATCH` | `/api/reports/:id` | Update the user's own report |
| `GET` | `/api/reports/:id/matches` | Get ranked possible matches |
| `POST` | `/api/reports/:id/claims` | Submit an ownership claim |
| `GET` | `/api/claims/:id` | View a claim if authorized |
| `PATCH` | `/api/claims/:id/status` | Approve or reject a claim |
| `POST` | `/api/claims/:id/handover` | Generate a handover code |
| `POST` | `/api/handovers/:id/confirm` | Confirm item return |
| `GET` | `/api/notifications` | List the current user's notifications |
| `POST` | `/api/flags` | Flag a report, claim, or user |

The actual route names may be adjusted during implementation.

## Report Statuses

A report may have the following statuses:

```text
Active -> Match Found -> Claim Under Review -> Handover Pending -> Returned
```

A claim may have the following statuses:

```text
Submitted -> Under Review -> Approved or Rejected
```

Only authorized users should be allowed to perform each status transition.

## Security and Privacy

The project should follow these security measures:

- Verify authentication on all protected routes.
- Check resource ownership and role permissions in the backend.
- Never return private finder details in public report responses.
- Store claim evidence in a private storage bucket.
- Restrict uploaded image types and file sizes.
- Generate safe and unique filenames for uploaded images.
- Store only hashed handover codes.
- Set an expiry time for every handover code.
- Rate-limit login, report, and claim endpoints.
- Validate and sanitize all request data.
- Record important claim and handover actions.
- Collect only the personal data required for the workflow.
- Never expose the Supabase service-role key to the frontend.

## Testing

The initial test suite should cover:

- Report creation and input validation
- Authorization for report updates
- Public and private detail separation
- Match-score calculation
- Claim submission
- Claim approval and rejection
- Valid claim-state transitions
- Handover-code expiration
- Return confirmation
- Rejection of unauthorized access
- Complete report-to-return workflow

Run backend tests with:

```bash
cd server
npm test
```

Build the frontend before merging:

```bash
cd client
npm run build
```

## Evaluation

The primary metric is **Top-5 Match Suggestion Success**.

A test is successful when the correct corresponding report appears among the five highest-ranked suggestions.

```text
Top-5 Success Rate =
(Number of tests with the correct report in the top five / Total tests) × 100
```

The initial target is at least **75%** on a controlled set of approximately 30–50 lost-and-found report pairs.

Secondary evaluation measures include:

- Search results displayed within approximately two seconds during the pilot
- Claim task completion rate
- Handover task completion rate
- Prevention of unauthorized access to private information
- User clarity rating on a five-point scale
- Passing critical backend and workflow tests


## Scope Limitations

The initial version will not include:

- A separate machine-learning service
- Image-recognition or image-similarity models
- A native mobile application
- Live location tracking
- Payment processing
- WebKiosk integration
- Private TIET database integration
- Automatic ownership decisions

These limits keep the reporting, matching, claiming, and handover workflow achievable within four weeks.

## Future Enhancements

The following features may be considered after completing the core project:

- Pretrained image-similarity matching
- Semantic description matching
- Email notifications
- QR-based handover
- Additional item categories
- Security-desk or hostel integration
- Analytics dashboard
- Native mobile application
- Multi-institution support

## Contributors

- **Student 1: Kiesha Kapoor
- **Student 2: Kasvi Bhatia
- **Student 3: Aarush Prabhakar
- **Student 4: Gurleen

## Academic Note

This project is an educational prototype. Any real campus deployment should obtain institutional approval and define formal moderation, privacy, data-retention, and dispute-resolution policies.
