# UG-GHRS Prototype

**Underground Geotechnical Hazard Reporting System**  
**Prototype version 2.1**  
A working, browser-based demonstrator for underground hazard reporting, tracking, escalation, location intelligence and corrective-action verification.

## What is included

- Worker-facing hazard report form
- Management hazard register with search and filters
- Report assignment and status workflow
- Corrective-action notes and verification before closure
- Critical-report escalation flag
- Illustrative underground location map
- Repeated-location intelligence and rule-based attention prompts
- Five judge-facing differentiators screen: underground hazard intelligence/mapping, verified closed-loop workflow, trend and recurrence insights, context-rich reporting, and Wi-Fi-aware/offline-resilient delivery assurance
- Connectivity test bench: simulate a Wi-Fi interruption, queue a report locally, restore the demo link and retry synchronisation
- Last server-receipt display so the demo distinguishes a report saved on the device from one acknowledged by the server
- Duplicate-safe retry demonstration using a unique client submission ID and server-side duplicate check
- Smart capture of report reference, timestamp, shift and optional worker/payroll ID
- Server receipt timestamp and duplicate protection for queued/offline submissions
- Escalation record including who escalated and when
- Activity log
- Connectivity indicator and local queue for reports submitted while offline
- Progressive Web App shell caching
- Node.js server using only built-in modules
- JSON file persistence in `data/reports.json`

## Requirements

- Node.js 18 or newer
- A modern browser
- No npm packages are required

## Run locally

1. Extract the ZIP folder.
2. Open a terminal inside the extracted `UG-GHRS-Prototype` folder.
3. Run:

   ```bash
   npm start
   ```

   Or:

   ```bash
   node server.js
   ```

4. Open `http://localhost:5000` in Chrome, Edge or Firefox.

The first launch creates `data/reports.json` and loads clearly labelled fictional demonstration reports.

## Demo walkthrough

1. Open **Overview** and review the summary cards.
2. Choose **New hazard report** and submit a sample observation.
3. Open **Hazard reports** and select the report.
4. Switch between demo personas using the small arrow beside the profile:
   - Underground Miner
   - Shift Supervisor
   - HSE Manager
   - Geotechnical Engineer
5. As a supervisor/HSE persona, assign the report, change its status and add a corrective-action note.
6. Move a report to **Resolved - awaiting verification**, then use **Verify and close report**.
7. Open **Hazard map** and select a plotted location.
8. Open **Risk insights** to see repeated locations and attention prompts.
9. Open **Innovation edge** and use **Simulate Wi-Fi interruption**. Submit a report: it should be held in the local queue rather than falsely shown as server-received.
10. Select **Restore link & sync queue**. The pending report should be submitted and the last server-receipt time should update. You can also use the browser DevTools offline mode to test a real device-network interruption.

## Important prototype boundaries

This is a **demonstration prototype**, not a production mine safety system and not approved for operational use.

- Demo roles are persona switches, not real authentication or authorisation.
- Do not enter real worker names, sensitive mine data or operationally confidential information.
- The sample mine layout and reports are fictional and not to scale.
- The map is illustrative, not a surveyed mine plan or live location system.
- Severity labels and response targets are demo workflow examples, not statutory risk assessments or mine-approved response times.
- The insights are simple rules over submitted demo reports. They do not predict rock failure or replace competent geotechnical assessment.
- Offline submission queue is browser-local and should be validated carefully before any real deployment. The demo adds a unique client submission ID, retry-safe server handling and a server-received timestamp, but this is not a guarantee against every browser/device failure scenario.
- Shift is suggested automatically from the device clock (06:00–17:59 = day shift; otherwise night shift) and can be changed in the form. This is a demo default, not a mine-approved shift roster. Worker/payroll ID is optional demo metadata.
- The five differentiators are proposed product capabilities to validate with each mine. The connectivity test bench is a controlled simulation; it does not connect to, inspect, or control a mine Wi-Fi network. The prototype does not claim that Mopani's existing system lacks them. A mine-specific comparison requires discovery interviews and a workflow review.
- No SMS, radio, push-notification, sensor, dispatch or mine-system integration is connected.
- Do not use this prototype to issue clearance, evacuation, re-entry or work-authorisation decisions.

## Suggested next steps before a real pilot

1. Interview mine workers, HSE personnel, geotechnical engineers and IT/network teams.
2. Map the current mine reporting workflow and identify a measurable gap.
3. Agree the hazard taxonomy, severity matrix, response targets and escalation chain with the mine.
4. Conduct a security and privacy threat assessment.
5. Add proper identity management, role-based permissions, encryption, backups and audit controls.
6. Validate offline sync, duplicate prevention and delivery acknowledgements under actual network conditions.
7. Integrate only with mine-approved maps, location references and systems.
8. Obtain written mine approval and safety/IT sign-off before any underground trial.

## Project structure

```text
UG-GHRS-Prototype/
├── data/
│   └── reports.json          # Created on first server start
├── public/
│   ├── app.js                # UI logic and API integration
│   ├── index.html            # Application screens
│   ├── manifest.webmanifest # PWA metadata
│   ├── service-worker.js     # App-shell caching
│   └── styles.css            # Responsive interface
├── package.json
├── server.js                 # Node built-in HTTP server and API
└── README.md
```

## API endpoints

- `GET /api/health`
- `GET /api/reports`
- `POST /api/reports`
- `PATCH /api/reports/:id`
- `GET /api/audit`

The API is intentionally lightweight for demonstration. It is not hardened for public internet deployment.
