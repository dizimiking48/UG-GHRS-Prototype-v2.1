# UG-GHRS | Underground Hazard Reporting & Management

**Version 3.0.0 · Separated worker and management interfaces**

UG-GHRS is a browser-based pilot prototype that separates the worker reporting journey from the supervisor/HSE management workspace. It supports structured hazard submission, server acknowledgement, local offline queueing, a central hazard register, assignment, investigation notes, escalation, verification, location grouping and rule-based recurrence prompts.

> **Operational safety notice:** This is a pilot/prototype foundation, not a mine-approved production safety system. Do not rely on it for emergency alerts, evacuation, re-entry, work clearance or statutory reporting. A mine must approve the workflow, hosting, devices, network, data handling, security controls and response procedures before live operational use.

## Two separate interfaces

- **Worker reporting portal:** `http://localhost:5000/report` (direct file: `public/reporter.html`). A focused mobile-first form with no management dashboard. Workers capture the hazard, observed severity, shaft, level, working area, shift and optional identity/contact details.
- **Management workspace:** `http://localhost:5000/manage` (direct file: `public/index.html`). Supervisors/HSE teams review the register, assign owners, update investigation status, record corrective actions, escalate and verify closure, and review location/risk patterns.

The management workspace links to the separate worker portal. The reporting portal links back to management.

## Run locally

1. Install Node.js 18 or newer.
2. Extract the ZIP and open the `UG-GHRS-Prototype` directory in VS Code.
3. Run `npm start`.
4. Open `http://localhost:5000/report` for the worker interface or `http://localhost:5000/manage` for management.

No third-party npm packages are required. The server stores reports in `data/reports.json` and creates that file on first run. Back up this file regularly during a local demonstration.

## Worker reporting flow

1. Worker opens `/report` on a mine-approved device.
2. Worker records the hazard and exact mine location reference.
3. The browser submits the report to `POST /api/reports`.
4. The portal displays a report reference only after server acknowledgement.
5. If the device is offline, the report is queued in that browser's local storage and retried when connectivity returns. The UI explicitly says that a locally queued report has **not** yet reached management.
6. The server uses a client submission ID to make retries idempotent and avoid creating duplicate reports from the same queued submission.

Important offline limitation: local browser storage can be cleared, device power can fail, and a worker may close the browser. Until the server acknowledges receipt, the report is not in the management register. For real underground use, validate device durability, browser behaviour, network coverage, offline queue recovery and acknowledgement procedures in a controlled mine-approved trial.

## Management workflow

- View and search the hazard register.
- Filter by severity and status.
- Open a report to review the submitted details and history.
- Assign a responsible person/team and update the workflow status.
- Record investigation/corrective-action notes.
- Escalate a report for management attention.
- Move reports to `Resolved - awaiting verification` and record verification before closure.
- Review illustrative location groupings and recurrence prompts.

The current prototype's role/persona switch is a **demonstration convenience, not authentication or access control**. The API is not protected by user accounts. Do not expose this server to the public internet or enter confidential operational or personal data.

## Before any live mine deployment

A mine IT/security and operational team must complete and approve at least the following:

1. Replace the demo persona switch with individual accounts, strong authentication, role-based permissions and account lifecycle controls.
2. Deploy behind HTTPS on a mine-approved server/network; restrict access using the mine's identity provider, VPN or network controls as required.
3. Replace JSON-file storage with a managed database, encrypted backups, tested restoration and retention rules.
4. Add server-side validation, rate limiting, CSRF protections where applicable, secure session handling, tamper-evident audit logs and security monitoring.
5. Define the mine's hazard taxonomy, risk matrix, escalation contacts, response SLAs, verification roles and mandatory fields with HSE and operations.
6. Use approved mine location identifiers and surveyed plans. The included plan is illustrative and not to scale.
7. Validate offline delivery, device-loss recovery, duplicate handling, acknowledgements and network failover under actual underground conditions.
8. Conduct privacy, cybersecurity, safety-case and legal reviews. Obtain written site approval before a controlled pilot.
9. Integrate with radio/SMS/dispatch/CMMS or existing hazard systems only through approved interfaces. No such integration is connected in this version.
10. Train workers and supervisors and retain the mine's existing emergency reporting and withdrawal procedures.

## API

- `GET /api/health`
- `GET /api/reports`
- `POST /api/reports`
- `PATCH /api/reports/:id`
- `GET /api/audit`

The API remains an unauthenticated local pilot API. It is not hardened for production.

## Project structure

```text
UG-GHRS-Prototype/
├── data/
│   └── reports.json
├── public/
│   ├── index.html          # Management workspace
│   ├── app.js              # Management UI logic
│   ├── reporter.html       # Separate worker reporting portal
│   ├── reporter.js         # Worker submission/offline queue logic
│   ├── styles.css
│   ├── service-worker.js
│   └── manifest.webmanifest
├── package.json
└── server.js
```
