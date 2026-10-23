# Buddy.AI OpenAI backend

This backend connects the Buddy.AI static GitHub Pages frontend to the OpenAI Responses API. The OpenAI key stays on the server and must never be placed in the HTML file.

## Deploy on a Node.js host
1. Upload this folder to a private GitHub repository or deploy it directly to a Node.js hosting provider.
2. Set build/install command to `npm install` and start command to `npm start`. Node.js 20 or newer is required.
3. Add environment variables in the host dashboard:
   - `OPENAI_API_KEY`: your secret OpenAI API key (do not share it or commit it).
   - `OPENAI_MODEL`: `gpt-6-astra` by default; change only to a model available to your API project.
   - `ALLOWED_ORIGINS`: `https://satviksrivastava38-dotcom.github.io` (include your exact site origin, no path).
4. After deployment, test `https://YOUR-BACKEND-URL/health`; it should return JSON with `ok: true`.
5. Open `BuddyAI_OpenAI_Ready.html`, find `window.BUDDY_AI_API_URL`, and replace `https://YOUR-BACKEND-URL` with the backend HTTPS origin. Then publish this HTML as `index.html` in the Buddy.AI GitHub Pages repository.

## Notes
- OpenAI API usage may be billed separately from a ChatGPT subscription. Review your API billing and limits before use.
- The endpoint has basic rate limiting and CORS allowlisting; CORS is not authentication. For a public production app, add user authentication verification and per-user quotas before wider release.
- Do not put the API key in frontend HTML, JavaScript, GitHub Pages, or a public repository.
