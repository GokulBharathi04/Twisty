# Twisty Wrap Enterprises — PRD

## Original problem statement
"Build a landing page: make use of the instructions from 1st txt file for building website. The catalog should be according to the details below and it should be available as a pdf downloadable file. And the webpage should be in neumorphism style. The hero layout should have appropriate 3d animation with ui/ux smooth motion.
Detail for catalog:- Image 1 is the format in which the catalog has to be made. Image 2 is the logo. Need to create a catalog. Make use of image 1 as a reference model for the catalog, in which the pages should be flat. Logo should be used in the cover page and the name of the company Twisty Wrap Enterprises must be highlighted with the style being glass morphism. All other pages must have company logo at the right up corner. For reference images please use appropriate images from the internet."
(Plus the uploaded website brief txt and the product description txt.)

User choices: full multi-page site; enquiries saved to DB + Resend email; PDF + flip-through preview; real-time 3D pallet hero; contact placeholders.

## Architecture
- Frontend: React (CRA/craco), Tailwind neumorphism tokens, framer-motion, lenis, @react-three/fiber + drei (hero).
- Product data: `frontend/src/data/catalog.json` (single source for site and PDF).
- PDF: `backend/catalog/build_catalog.py` (reportlab + PIL glass cover + PyMuPDF previews) → `frontend/public/catalogue/` (PDF + page-XX.jpg) and `src/data/cataloguePages.json`. Re-run after editing catalog.json.
- Backend: FastAPI `POST /api/enquiries` (multipart, optional attachment ≤5MB → Emergent object storage), MongoDB `enquiries`, Resend notification to `ENQUIRY_NOTIFY_EMAIL` (background task, email_status stored).

## Implemented (2026-10-07)
- Pages: Home (3D hero, marquee, intro, bento categories, featured, why, packaging families, sustainable, industries, flip-book, enquiry CTA), About, Products (search, category + flag filters, compare up to 3), Product detail (/products/:slug, JSON-LD), Sustainability, Applications, Catalogue, Contact/Enquire.
- Enquiry modal with auto-filled product, confirmation message and reference.
- 16-page flat red/grey A4 PDF catalogue: glass-morphism cover with logo, logo top-right on all other pages.

## Backlog
- P0: Replace `ENQUIRY_NOTIFY_EMAIL` (currently delivered@resend.dev test inbox) with the company's real inbox; fill contact placeholders.
- P1: Password-protected admin page to view enquiries and download attachments.
- P2: Real product photos from the company; per-product image galleries.
