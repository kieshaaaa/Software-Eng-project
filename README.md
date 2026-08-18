# Software-Eng-project
UCS503
TIET LostLink

A secure, web-based lost-and-found platform for students at Thapar Institute of Engineering and Technology (TIET).

LostLink centralizes lost and found item reports, suggests possible matches using a simple weighted algorithm, supports private ownership claims, and records secure item handovers.

Course project for UCS503P
Instructor: Nisha Thakur
Date: August 18, 2026

Problem Statement

Students currently report lost and found items through scattered WhatsApp groups, social-media posts, word of mouth, and security desks. These methods are difficult to search, messages disappear quickly, and publicly sharing every identifying detail can enable false claims.

LostLink provides one searchable platform for reporting, matching, claiming, and returning items while keeping sensitive ownership details private.

Main Features

Student registration and login using an institutional email address

Separate lost-item and found-item reports

Optional item image upload

Search and filters by category, date, colour, brand, location, and status

Explainable weighted match suggestions

Public and private item-detail separation

Ownership claim submission with supporting evidence

Claim approval or rejection by the finder

Temporary one-time code for physical handover

Return confirmation and report status tracking

In-application notifications

Basic administrator dashboard for flags and disputes

Supported Item Categories

The first version supports a deliberately limited set of categories so the project can be completed by two students within four weeks:

Backpacks and bags

Water bottles and tumblers

Wallets and purses

Earbuds and headphone cases

Keys and keychains

Books and notebooks

Cash, jewellery, government documents, plain charging cables, and visually indistinguishable mass-produced items are outside the initial automated matching scope.

User Workflow

A student registers and logs in.

The student submits a lost or found report.

LostLink generates a unique report ID.

The system compares the report with active reports of the opposite type in the same category.

The user reviews a ranked list of possible matches.

The apparent owner submits a private ownership claim.

The finder reviews the claim and approves or rejects it.

An approved claim generates a temporary handover code.

Both students confirm the physical handover.

The related report is marked as Returned.

The match score only helps users find candidates. It does not prove legal ownership.

Technology Stack

Layer

Technology

Frontend

React + Vite

Styling

Basic CSS or Tailwind CSS

Routing

React Router

Backend

Node.js + Express.js

Database

Supabase PostgreSQL

Authentication

Supabase Auth

Image storage

Supabase Storage

API communication

Axios or Fetch API

Backend testing

Jest + Supertest

API testing

Postman

Version control

Git + GitHub

CI

GitHub Actions

Deployment

Vercel (frontend) + Render (backend)

System Architecture

React frontend  ->  Express REST API  ->  Supabase
                                             |-- PostgreSQL
                                             |-- Authentication
                                             `-- Image storage

This three-tier structure avoids a separate machine-learning server and keeps the implementation practical within the course timeline.

Possible-Match Algorithm

Before scoring, the system keeps only candidates that:

have the opposite report type (Lost versus Found);

belong to the same item category; and

have an active status.

Each remaining candidate receives a score out of 100:

Matching condition

Score

Same item category

30

Same brand

15

Same or similar colour

15

Same or nearby campus location

15

Dates within three days

15

Description keyword similarity

10

Initial score interpretation:

75–100: high-likelihood candidate

50–74: possible candidate

Below 50: weak candidate

Description similarity uses basic text processing: lowercase conversion, punctuation removal, stop-word removal, keyword extraction, and shared-keyword percentage. The weights and thresholds can be adjusted after testing.

Ownership Verification

LostLink uses several signals because students may not have receipts or serial numbers:

The finder records hidden characteristics that are not shown publicly.

The claimant describes the item before seeing those characteristics.

Claim answers are timestamped and locked after submission.

Supporting evidence may include an old photograph, a hidden scratch or sticker, bag or wallet contents, device name, device unlocking or pairing, a matching key, or approximate loss time and location.

Generic, disputed, or high-value items should use a supervised handover through an administrator or campus security desk.

The finder or an authorized responsible person makes the final decision—not the matching algorithm.

Suggested Project Structure

lostlink/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- App.jsx
|   |-- package.json
|   `-- vite.config.js
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
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- .env.example
|-- .gitignore
`-- README.md

Core Database Tables

Table

Purpose

users

Student identity, role, verification, and account status

item_reports

Lost/found reports, item fields, public description, private detail, and status

matches

Suggested report pairs and their scores

claims

Claimant answers, evidence, and approval status

handovers

Hashed one-time code, expiry, and confirmation details

notifications

In-application workflow updates

flags

Suspicious activity and inappropriate report records

Getting Started

Prerequisites

Node.js 20 or later

npm

Git

A Supabase project

1. Clone the repository

git clone <repository-url>
cd lostlink

2. Install dependencies

cd client
npm install

cd ../server
npm install

3. Configure environment variables

Create client/.env:

VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Create server/.env:

PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
HANDOVER_CODE_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

Never commit .env files or expose the Supabase service-role key in frontend code.

4. Start the application

Run the backend:

cd server
npm run dev

Run the frontend in a second terminal:

cd client
npm run dev

The frontend will normally be available at http://localhost:5173, and the backend API at http://localhost:5000.

Suggested API Routes

Method

Endpoint

Purpose

POST

/api/reports

Create a lost or found report

GET

/api/reports

Search and filter active reports

GET

/api/reports/:id

View an authorized report response

PATCH

/api/reports/:id

Update the user's own report

GET

/api/reports/:id/matches

Get ranked possible matches

POST

/api/reports/:id/claims

Submit an ownership claim

GET

/api/claims/:id

View a claim if authorized

PATCH

/api/claims/:id/status

Approve or reject a claim

POST

/api/claims/:id/handover

Generate a handover code

POST

/api/handovers/:id/confirm

Confirm item return

GET

/api/notifications

List the current user's notifications

POST

/api/flags

Flag a report, claim, or user

Actual route names may be adjusted during implementation.

Security and Privacy

Verify authentication on protected routes.

Check resource ownership and role permissions in the backend.

Never return private finder details in public report responses.

Store claim evidence in a private storage bucket.

Restrict image type and file size and generate safe filenames.

Store only hashed handover codes and enforce expiration.

Rate-limit login, report, and claim endpoints.

Validate and sanitize all request data.

Record important claim and handover actions.

Collect only the personal data required for the workflow.

Testing

The initial test suite should cover:

report creation and validation;

authorization for report updates;

public/private detail separation;

match-score calculation;

claim submission and status transitions;

handover-code expiry and confirmation;

rejection of unauthorized access; and

the complete report-to-return workflow.

Run backend tests with:

cd server
npm test

Build the frontend before merging:

cd client
npm run build

Evaluation

The primary metric is Top-5 Match Suggestion Success: the percentage of controlled test cases in which the correct corresponding report appears among the five highest-ranked suggestions.

The initial target is at least 75% on a controlled set of approximately 30–50 lost-and-found report pairs.

Secondary measures include:

search results displayed within approximately two seconds during the pilot;

claim and handover task completion rates;

prevention of unauthorized access to private details;

user clarity rating on a five-point scale; and

passing critical backend and workflow tests.

Four-Week Plan

Week

Backend focus

Frontend focus

1

Supabase setup, database design, authentication, Express setup

Wireframes, React setup, login, navigation, report forms

2

Report APIs, search, filters, weighted matching

Report feed, details, uploads, search and filter interface

3

Claims, authorization, handover codes, notifications, admin APIs

Claim review, handover, notifications, admin screens

4

Tests, security checks, bug fixes, deployment

Usability tests, documentation, final deployment

Both team members will contribute to requirements, UML diagrams, integration, pull-request reviews, end-to-end testing, documentation, and the final demonstration.

Scope Limitations

The initial version will not include:

a separate machine-learning service;

image recognition or image-similarity models;

a native mobile application;

live location tracking;

payment processing;

WebKiosk or private TIET database integration; or

automatic ownership decisions.

These limits keep the core reporting, matching, claiming, and handover workflow achievable within four weeks.

Future Enhancements

Pretrained image-similarity matching

Semantic description matching

Email notifications

QR-based handover

Additional item categories

Security-desk or hostel integration

Analytics dashboard

Multi-institution support

Contributors

Student 1: Name — Roll Number

Student 2: Name — Roll Number

Academic Note

This project is an educational prototype. Any real campus deployment should obtain institutional approval and define formal moderation, privacy, retention, and dispute-resolution policies.

License

This repository is intended for academic use. Add an open-source license only if the project team and institution approve public reuse.
