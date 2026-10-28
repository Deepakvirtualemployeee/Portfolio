# Deepak’s full stack portfolio

If AI requests fail, the backend logs a sanitized diagnostic. An `expired_secret_key` response means the key must be replaced in `.env` with a new API key; editing model settings cannot repair an expired key. Never paste credentials into chat or commit them. `npm run dev` and `npm start` use Node's system certificate store to support trusted Windows network certificates while keeping TLS verification enabled. Development watches `.env`, `server/` and `shared/` so configuration changes restart the backend. Restart the complete dev command once after updating npm scripts. Do not run a second backend on the same port. After replacing a key, model access and account quota still need to succeed for both embeddings and responses.

React + Vite + Material UI frontend, Express backend, OpenAI semantic retrieval assistant, and a contact inquiry API. Requires Node.js 22.12+ (tested with Node 24).

## Run locally

## Deploy on Render Free

This repository includes `render.yaml` for one free Node web service serving both the React site and `/api` endpoints. No database or paid disk is needed. The Blueprint has not been deployed from this workspace.

1. Create a Brevo Free account. Add and verify an authorized sender address and complete any required transactional-email activation. Create an API key; this is different from a Gmail app password. Brevo's published Free allowance is currently 300 emails per day. Sender/account approval and delivery policies still apply.
2. Push this project to your GitHub repository. Never commit `.env`, `node_modules`, browser profiles or historical inquiry data; `.gitignore` excludes these.
3. In Render choose **New > Blueprint**, connect the repository and select this `render.yaml`. Confirm the service compute plan is **Free**.
4. Supply the prompted secrets/settings: `BREVO_API_KEY`, `CONTACT_FROM` (the exact Brevo-verified sender), and `OPENAI_API_KEY`. The Blueprint already sets `EMAIL_PROVIDER=brevo`, `CONTACT_TO=deepakhs003@gmail.com`, Node 24.22.0 and the configured model names. OpenAI API usage is billed separately from hosting.
5. Deploy. Open the assigned `https://...onrender.com` address. Visit `/api/health`, ask a project question in the assistant, and submit a real contact inquiry to verify delivery. A provider's accepted message does not guarantee inbox placement; check spam too.

For a manual **New > Web Service** setup instead, select **Node**, build command `npm ci --include=dev && npm run build`, start command `npm start`, health check `/api/health`, and instance type **Free**. Add the same environment variables listed in `render.yaml`.

Do not upload local `PORT=3001` to Render; it supplies `PORT`. SEO uses `SITE_URL` if provided, otherwise Render's `RENDER_EXTERNAL_URL` during the build. Set `SITE_URL` and rebuild when adding a custom domain. The app trusts one reverse-proxy hop only when Render's `RENDER=true` marker is present.

Render Free blocks outbound SMTP ports, so do not use `EMAIL_PROVIDER=smtp` there. Render may sleep after 15 minutes idle and has monthly usage limits. The in-memory retrieval index is rebuilt after a restart or wake-up. Local SMTP configuration in `.env` is unchanged.

References: [Render Free](https://render.com/docs/free), [Blueprint specification](https://render.com/docs/blueprint-spec), [Brevo Free limits](https://help.brevo.com/hc/en-us/articles/208580669), [Brevo email API](https://developers.brevo.com/reference/send-transac-email).

## Local commands

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to port 3001. For production: set the real `SITE_URL` in `.env`, run `npm run build`, then `npm start` and visit http://localhost:3001. Deploy the Node process behind an HTTPS reverse proxy; The app is implemented locally in the folder requested; it has not been published.

## Configuration

- `OPENAI_API_KEY`: server-side only; never prefix secrets with `VITE_`. `OPENAI_MODEL` and `OPENAI_EMBEDDING_MODEL` are configurable. Without a key the assistant explicitly uses profile search instead of generated answers.
- The AI embeds the curated profile documents once per process, retrieves the four nearest matches with cosine similarity, and calls the Responses API with that context. It returns source names, limits input/output, disables response storage and applies request limits. No paid API calls were needed during development. Chat is question-based; it does not retain previous turns.
- `SMTP_HOST`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_FROM`, `CONTACT_TO`: email-only inquiry delivery. Gmail defaults to smtp.gmail.com on TLS port 465. Use a Gmail app password. The sender defaults to EMAIL_USER and CONTACT_TO is the developer inbox. SMTP_USER/SMTP_PASS remain supported as aliases. No inquiries are written to disk. Success means the SMTP server accepted the recipient; a failure returns an error and keeps the visitor?s form available to retry.
- `SITE_URL`: actual public origin, required before a production build for canonical metadata and sitemap. Never publish localhost SEO values.

## Content and date assumptions

Edit `shared/profile.js` to update the portfolio and its retrieval knowledge together. Display name **Deepak** is inferred from the workspace username; confirm the full professional name. No email, phone, headshot, social links, certification or client testimonial was invented.

Career starts April 2021. Experience is described as **5+ years including internship**, not ten years. IntelSoft internship remains Apr 2021–Jul 2023. IntelSoft engineer role is provisionally normalized to Aug 2023–Aug 2024 so TeckValley begins Sep 2024 without an employer overlap. Confirm this against employment records. Concurrent project dates remain as supplied because client assignments can overlap. Jackson Healthcare’s Sep 2024 project end overlaps the employer transition; the case study identifies this uncertainty. Early real-estate and e-commerce projects are grouped rather than treated as separate jobs.

Client project screenshots are custom conceptual UI illustrations, not representations of access to actual client software. Outcomes come from the supplied experience; the 10 s → 80 ms result is explicitly described as a reported Postman test, not a universal benchmark. AI services describe capabilities and this portfolio’s RAG implementation, not invented prior OpenAI client work. AWS/Linux/Windows skills are included from the user’s request.

## APIs and validation

- `GET /api/health`: status and AI configuration flag
- `GET /api/profile`: curated public data
- `POST /api/contact`: name, email, service, budget, message, consent=true, optional empty website honeypot
- `POST /api/chat`: message, 2–1,500 characters

Run `npm test` and `npm run build`. API rate limiting uses process memory; for multiple production instances use a shared limiter. Configure Express `trust proxy` for the precise trusted reverse-proxy topology before deploying behind a proxy; do not enable it indiscriminately.

SEO includes meaningful static HTML before React loads, title/description, Open Graph, canonical URL, Person JSON-LD, robots and sitemap. Add a real social preview image, verified full name, domain and professional profile links before launch. Assets use local CSS/SVG; no external font requests. Motion respects reduced-motion preferences.

OpenAI implementation references: [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), [Embeddings API](https://developers.openai.com/api/reference/resources/embeddings/methods/create).

## Theme and assistant setup

Light mode is the default. The navbar sun/moon button switches themes and remembers the selection in browser localStorage. Clear the `portfolio-theme` localStorage entry to restore the default. The assistant handles greetings locally. OpenAI reads `.env`, not `.env.example`; restart the Node server after changing `.env`. Never put real credentials in `.env.example` or client-side code. Rotate any key previously shared in that file. The configured model must be available to your OpenAI account. Live API connectivity could not be verified in the development environment.

Contact form submissions are sent directly to the configured developer inbox with the visitor address as Reply-To. Existing historical JSON files are not used or modified by the email-only API.
