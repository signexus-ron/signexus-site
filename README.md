# signexus.tech

The public "coming soon" page for signexus.tech: one static `index.html` (inline CSS, SVG and JS, no
build step, no third-party scripts), served by GitHub Pages. The waitlist / contact form posts to a
Google Apps Script (`apps-script/Code.gs`) that logs each submission to a Google Sheet and emails
info@signexus.tech.

Separate from `signexus-app` on purpose: nothing here says what the product does.

## Preview locally

    python3 -m http.server 8000   # then open http://localhost:8000

## 1. Form backend (Google Apps Script, about 5 minutes)

1. Signed in to Google Workspace, create a Google Sheet, e.g. "signexus.tech waitlist".
2. In the Sheet: **Extensions > Apps Script**. Replace the editor contents with `apps-script/Code.gs`. Save.
3. **Deploy > New deployment > Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, approve the permissions (Sheets + send email as you).
4. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`) into `ENDPOINT` near the
   bottom of `index.html`, commit and push.

Until `ENDPOINT` is set, the form opens the visitor's mail app addressed to info@signexus.tech.

If "Anyone" is not offered in step 3, the Workspace admin console blocks public web apps:
Admin console > Apps > Google Workspace > Drive and Docs > Sharing settings, allow sharing outside the
organisation for the owner of the script.

To change the code later: edit in Apps Script, then **Deploy > Manage deployments > edit > Version: New
version**. The URL stays the same.

## 2. Hosting (GitHub Pages) and DNS (GoDaddy)

Pages is enabled on `main`, root folder. To serve it at signexus.tech:

1. GitHub > your profile **Settings > Pages > Add a domain**, add `signexus.tech` and put the TXT
   record it shows into GoDaddy. This verifies the domain so nobody else can claim it on Pages.
2. GoDaddy > **Domain > DNS** for signexus.tech:
   - Turn off any GoDaddy Website Builder site / domain forwarding on the domain.
   - Delete the existing `A @` records (currently 13.248.243.5 and 76.223.105.230, GoDaddy's parking).
   - Add four `A @` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Change `www` to `CNAME` -> `signexus-ron.github.io`.
   - **Do not touch** the MX records (Google), the SPF / `google-site-verification` TXT records, or any
     other subdomain such as `demo`.
3. Repo **Settings > Pages > Custom domain**: `signexus.tech`, save (this adds a `CNAME` file).
   When the certificate is issued (minutes to an hour), tick **Enforce HTTPS**.
