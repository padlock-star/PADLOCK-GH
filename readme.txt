PADLOCK GH — Static site
=================================

This is a ready-to-upload static site for GitHub Pages or any host.

Quick Start (GitHub Pages)
-------------------------
1) Create a new repository on GitHub called `padlock-gh` (or any name).
2) Upload the files in this folder (index.html, style.css, script.js, assets/).
3) Go to Settings → Pages → Build from branch → main → / (root) → Save.
4) Your site will be live at https://<your-username>.github.io/<repo-name>/

Update Contacts
---------------
Open index.html and edit these lines near the bottom:
  const PHONE = "0555610075";
  const SMS_NUMBER = "0555610075";

Payment Integration
-------------------
Replace the buy() function to redirect to Paystack/Flutterwave payment page, or
keep the default WhatsApp flow which pre-fills a message.

Colors
------
MTN (yellow border), AirtelTigo (blue), Telecel (red) accents already applied.
