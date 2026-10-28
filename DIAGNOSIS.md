# WorkBridge: Full-Site Diagnosis

This report covers every API endpoint, page, button and backend connection in the app. I found the problems by reading the code. I did not run the app against a database, so the end-to-end flows still need the manual checklist at the end.

How I checked the fixes:
- I built the client with `npx vite build`.
- I syntax-checked every server file with `node --check`.
- I ran a scan for identifiers that are used but never declared, on both client and server.
- The server tests that don't need a database (`tests/api.test.js`, 8 tests) pass.
- The database-backed tests (`auth.test.js`, `marketplace.test.js`) were **not run**, because no MongoDB was available.

Status legend: ✅ works as written · 🔧 was broken, fixed in this pass · ➕ was missing, added in this pass · ⚠️ known gap, not fixed

---

## 1. API endpoints

Every route is mounted under both `/api/...` and `/api/v1/...`. The client uses `/api`.

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `/api/health` | ✅ | |
| GET | `/api/v1/categories`, `/api/v1/categories/:slug` | ✅ | Only exists under `/api/v1`. The client reads categories from local constants instead. |
| POST | `/api/auth/signup`, `/api/auth/register` | ✅ | |
| POST | `/api/auth/login` | ✅ | |
| POST | `/api/auth/logout` | ✅ | |
| GET | `/api/auth/me` | 🔧 | A stale cookie no longer hides a valid Bearer token (fixed earlier). A 401 for a visitor who isn't logged in is expected. |
| POST | `/api/auth/google` | 🔧 | **Security:** mock Google tokens (`mock-google-token-<email>`) used to be accepted whenever `NODE_ENV` wasn't `production`, so anyone could log in as any email during development. They are now accepted only when `NODE_ENV=test`. |
| — | CSRF origin check (signup, login, google) | 🔧 | It used a prefix match, so `http://localhost:5173.evil.com` passed. It now reduces the Origin or Referer header to its origin and requires an exact match. |
| GET | `/api/jobs` | 🔧 | (1) The budget filter was silently dropped whenever there was a search term. Both filters now combine. (2) Search text is regex-escaped; input like `(` used to cause a 500. (3) Query values must be plain strings, which blocks `?status[$ne]=` operator injection. (4) `limit` is capped at 50. |
| GET | `/api/jobs/:id` | ✅ | |
| GET | `/api/jobs/client/my-jobs` | ✅ | |
| POST | `/api/jobs` | ✅ | |
| PUT | `/api/jobs/:id` | 🔧 | Owners could set any status, for example re-opening an in-progress job, which allowed a second hire. Now an owner can only toggle `open` ↔ `cancelled` (Close / Re-open), and only before a contract exists. Changing the category keeps `categoryName` in sync. `budgetMax` must be at least `budgetMin`. |
| GET | `/api/freelancers` | 🔧 | Regex-escaped, string-only query values, `limit` capped. Search now also matches freelancer names. **Privacy:** email addresses are no longer returned. |
| GET | `/api/freelancers/:id` | 🔧 | Email is no longer returned. |
| GET | `/api/freelancers/me/profile` | ✅ | |
| PUT | `/api/freelancers/profile` | 🔧 | **Data loss:** the validator defaulted fields the request left out, so any save without `portfolio` erased the portfolio and reset experience, availability and location. Fields left out of the request now stay unchanged. |
| POST | `/api/proposals` | ✅ | |
| GET | `/api/proposals/my-proposals` | ✅ | |
| GET | `/api/proposals/job/:jobId` | 🔧 | It asked for `rating` and `totalJobsCompleted` from User, but those fields live on FreelancerProfile, so they were always missing. Each proposal now includes a `freelancerProfile` object with title, rating, reviewsCount and totalJobsCompleted. |
| PATCH | `/api/proposals/:id/accept` | 🔧 | A second proposal on the same job could be accepted, creating two contracts, and so could rejected or withdrawn ones. Now only a `pending` proposal on an `open` job can be accepted. |
| PATCH | `/api/proposals/:id/reject` | 🔧 | Now only works on `pending` proposals, and handles a missing job without crashing (500). |
| PATCH | `/api/proposals/:id/withdraw` | 🔧 | Now only works on `pending` proposals. Repeated withdrawals used to push the job's proposal count negative; the decrement is now guarded. |
| GET | `/api/projects/my-projects` | ✅ | |
| GET | `/api/projects/:id` | 🔧 | No longer crashes (500) if a participant's account was deleted. |
| POST | `/api/projects/:id/milestones/:mid/deliver` | 🔧 | Now rejected on completed, cancelled or disputed projects. |
| POST | `/api/projects/:id/milestones/:mid/approve` | 🔧 | It used to release funds for milestones that were never delivered. Now only `submitted` milestones can be approved. When a contract completes, the freelancer's `totalJobsCompleted` goes up. |
| POST | `/api/projects/:id/fund-escrow` | 🔧 | Negative or non-numeric amounts are rejected, as are completed or cancelled projects. The message no longer hard-codes `$`. Not called by the UI. |

---

## 2. Pages, buttons and links

| Area | Status | Details |
|---|---|---|
| Home page CTAs ("Hire Talent", "Apply as Freelancer", "Post a Job", "Find Remote Work", "Get Started", "Join as a Freelancer") | 🔧 | They linked to `/auth/register?role=…`, and the redirect dropped `?role=`, so everyone landed on signup as a Client. The redirect now keeps the query string. The buttons are also role-aware: logged-in clients go to the post-job form, and freelancers go to their workspace or the jobs list. |
| Home "featured freelancers" | 🔧 | Requested an invalid sort (`rating`); now uses `rating_desc`. |
| Category page | 🔧 | The Jobs-tab button said "Post a Job" but sent users to freelancer signup (labels were swapped), and empty-state actions did full page reloads. Fixed; "Retry" now refetches instead of reloading the page. |
| Jobs list | 🔧 | Every keystroke in search sent an API request; search is now debounced. Filters re-sync when the URL changes (header link, Back/Forward). "Post a Job" is hidden for freelancers and role-aware for others. Load errors are now shown instead of an empty list. |
| Freelancers list | 🔧 | Same debounce, URL-sync and error handling. Added the missing Availability filter. Rate filter is shown in ₹. |
| Job detail | 🔧 | (1) Crashed to a blank page (hook declared after an early return); fixed earlier. (2) "Submit a Proposal" was shown to everyone; now only logged-in freelancers on open jobs see it, and guests get "Log In to Apply". (3) The "Proposal Submitted!" success view showed while the request was still in flight. (4) The cover-letter minimum (20 characters) and minimum bid are now checked before sending. (5) After submitting, the button disables and the proposal count updates. |
| Freelancer detail | 🔧 | Crashed on real profiles (`.map` of undefined); fixed earlier. "Hire" and "Message" were fake: a timer showed "Invitation sent… notified immediately" without calling any API. They are replaced with a real path: clients are sent to post a job, and guests to signup. Also fixed a button nested inside another button, removed the made-up "100% on-time" figure, and added empty states for portfolio and work history. |
| Login: "Forgot password?" | 🔧 | Claimed "Reset instructions sent!" although no reset endpoint exists. It now says reset emails aren't available yet and to contact support. |
| Footer: Privacy Policy / Terms / Escrow Standards / Payment Protection | 🔧 | Were plain text with no link. They now link to the new `/legal` page sections. |
| Dashboard sidebar "Sign Out" | 🔧 | Left the user on the protected page ("Sign In Required"); it now goes to `/`. Sign Out was also added to the mobile tab bar. |
| Session expiry | 🔧 | A 401 cleared storage but the UI still looked logged in. API 401s now log out the UI. |
| Sample data | 🔧 | Jobs and freelancer lists silently switched to fake data on any error, including 400s. They now fall back only when the server is unreachable, and show a "sample listings" notice when they do. |
| Error screen | ➕ | Earlier: a page crash now shows the error message instead of a blank page (`ErrorBoundary`). |

### Client dashboard
| Action | Status |
|---|---|
| Post a job | 🔧 Short descriptions used to be silently replaced with generated text, the minimum budget defaulted to 1000, and skills were always "General Freelancing". The form now has min/max budget (₹), skills and experience level, with validation messages. |
| Edit job / Close job / Re-open job | ➕ |
| View proposals for one job | ➕ ("View Proposals" filters to that job) |
| Accept proposal | 🔧 The Accept button showed even on rejected or withdrawn bids; it is now only shown on pending bids of open jobs. The confirmation explains that the other bids will be declined. |
| Decline proposal | ➕ |
| Contracts tab: view milestones and deliverables, **Approve & Release Payment** | ➕ Was a placeholder, so projects stayed in "milestone review" forever. |
| KPIs | 🔧 Escrow read a field that doesn't exist (`escrowBalance`). The counts included closed jobs and rejected bids. |
| Settings tab | ➕ Read-only account details |

### Freelancer dashboard
| Action | Status |
|---|---|
| Withdraw proposal | ➕ |
| Submit milestone work | 🔧 "Submit Work" reappeared after a reload for milestones already under review. It now works per milestone, checks notes against the 10-character minimum, and the link is optional (matching the server). |
| Earnings tab (released vs pending in escrow) | ➕ Was a placeholder. "Total Earnings ₹12,450" and "Rating 4.96" were hard-coded; both are now computed. |
| Portfolio tab (add/remove projects) | ➕ |
| Settings tab: profile editor (title, rate in ₹, discipline, experience, availability, skills, location, bio) | ➕ Profiles could never be edited before. |

---

## 3. Currency: USD → INR

- **How it works:** the API still stores every amount in **USD**. The UI converts to **₹** at display time using a fixed rate, `VITE_USD_TO_INR` (default **83**, set in `client/.env`). It uses Indian digit grouping, e.g. ₹4,15,000.
- **Amounts users type in ₹** (job budgets, bids, hourly rate) are converted back to USD before they are sent.
- **Helpers** are in `client/src/utils/formatters.js`: `formatCurrency`, `formatBudget`, `toINR`, `toUSD`.
- **Converted:** job cards and detail, freelancer cards and detail, both dashboards, the rate filter, and the sample data (its pre-formatted `$` strings are now plain numbers). The `$` icons are now `₹` icons.
- **Server messages** that mentioned `$5` or `$1000` now say "5 (USD)" and so on. The UI checks the same limits and shows them in ₹.

---

## 4. Known gaps (not fixed in this pass)

- **Payments:** no payment provider is connected. "Escrow" is a number stored on the project; no money moves.
- **Password reset:** there is no backend endpoint for it.
- **Messaging:** clients can't message or directly invite freelancers. Hiring works only by posting a job and accepting a bid.
- **Atomicity:** accepting a proposal does several separate writes without a transaction. A crash partway through could leave inconsistent data.
- **Re-bidding:** a unique index means a freelancer who withdraws can never bid on that job again.
- **Hourly jobs:** for hourly jobs, the contract total equals the hourly bid. There is no time tracking.
- **Tests use the real database:** the DB-backed tests run against the `MONGODB_URI` in `server/.env`, and they leave freelancer profiles behind. Recommendation: add `mongodb-memory-server`.
- **Leftover sample data:** the 10 mock jobs and freelancers include a "Work History" section that real profiles don't have.

---

## 5. Manual test checklist (needs MongoDB)

1. Put `MONGODB_URI` in `server/.env`, then run `npm run seed --workspace=server` and `npm run dev`.
2. Run `npm test --workspace=server`. It should pass, including the new guard tests in `marketplace.test.js`.
3. Log in as the demo client (`client.demo@example.com` / `demopassword`):
   - post a job with a ₹ budget;
   - edit it;
   - close it, then re-open it.
4. Log in as the demo freelancer (`freelancer.demo@example.com` / `demopassword`):
   - open the job and submit a ₹ bid;
   - check that the dashboard shows the bid;
   - withdraw a second test bid.
5. As the client: decline one bid and accept the other, then check the Contracts tab.
6. As the freelancer: Submit Work on the milestone.
7. As the client: Approve & Release Payment, then check that the freelancer's Earnings tab shows it.
8. As the freelancer: edit the profile in Settings, add a portfolio project, and check the public profile.
9. Check that every amount on the site shows ₹ and that no `$` remains.
