# Atheus design direction

## Studio marketing

The public marketing site presents Atheus as an independent digital studio. It uses an editorial layout rather than a SaaS card grid: generous space, large type, direct language, and working concept sites as the main visual proof.

The warm paper surface (`#f2f0e9`) and charcoal ink (`#22221f`) carry the studio pages. Persimmon (`#e2512d`) is used for large display accents; smaller interactive text uses a darker shade for contrast. The Work and pricing sections use charcoal to change pace without changing the visual identity. Content sits in `app/agency.css` and the shared marketing shell.

Geist Sans carries the large structural type, Instrument Serif gives selected words a human counterpoint, and Geist Mono is reserved for section indexes and project metadata. Borders are mostly straight, with almost no card elevation. Motion follows the page narrative: an Anime.js timeline builds the opening A from small, changing lines of Atheus text, brings in the wordmark, and pulls the dark screen away. The home headline then enters in sequence, the project gallery opens with a masked reveal and subtle scroll movement, work and service details appear as they enter view, and fine progress indicators give the long page a sense of place. This takes cues from Sui's cinematic pacing and scroll-led storytelling while retaining Atheus's own palette and typography. The motion layer is progressive enhancement and respects reduced-motion preferences.

The homepage and the Work, Websites, Products, Studio, Contact, Upgrade, and 404 routes share this system. The Work page clearly labels its examples as **concept sites**. Website prices are sourced from `lib/products.ts`.

## Product and league interfaces

Admin tools, public league pages, and individual demo sites keep their own visual systems. Their styles live outside `app/agency.css` and should follow their own audience and workflow.

The concept sites have different motion budgets. Hearth & Co builds a cup from warm café text and settles its photography slowly. Ridgeway Civils briefly assembles an excavator from site text, then opens into direct project imagery, restrained typography and static accreditation details so buyers can assess the work quickly. Northline Electrical keeps its text-built bolt, then uses a small callout pulse, a precise hero line and animated service changes to feel responsive. Reduced-motion preferences skip the openings and leave content readable.
