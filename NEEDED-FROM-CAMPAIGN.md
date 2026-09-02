# What we need — status as of 2026-08-10

## ✅ Resolved
- **Bio** — received, in `src/content/bio.ts` verbatim
- **Fonts** — Libre Caslon Display + Figtree, from the design system
- **Growth statistics** — independently re-verified; the artifact's were wrong
  and are replaced with primary-sourced Census figures. The design mockup still
  carries the old ones; the build fails if any of them reach the output
- **Filing** — confirmed
- **Platform** — Nancy's six commitments, in her own words (supplied 2026-09-02)
- **Email** — `votenancyorum@gmail.com`, live in the footer
- **Facebook** — linked in the footer
- **Phone** — decided: none published, which is normal for a local race. Send
  one if you want it and it goes in the footer beside the email
- **Committee name** — "Committee to Elect Nancy Orum", from the campaign's own
  file. See §2, which is now a verification rather than a blocker

## 🔧 Allison (≈5 min each, not blocking the build)
1. **GitHub repo** — name it and say whose account. Recommend Nancy's, so the
   campaign owns its own site. Determines the Vite `base` path.
2. **Web3Forms access key** — web3forms.com, enter a destination email, copy the
   key. Free, no account. Until then the Get Involved page says the form is not
   connected yet rather than pretending to accept submissions.
3. **The design project's `assets/` folder** — copy it into `public/img/`. The
   twelve files and their purposes are listed in `public/img/README.md`. Two of
   them are 7200px print masters and want downscaling before launch.
4. **Search Console, Bing, Always Use HTTPS, the www redirect, the stray Pages
   project** — added 2026-09-02. The site was in no search engine's index. The
   steps, in order, are in HANDOFF.md under "Search engines".

## 📋 Nancy — see the numbered list below
Nothing here blocks development. All of it blocks launch.

---

# What we need from Nancy

Plain-language list. Nothing here is technical — it's all information only the
campaign has. Send it back however is easiest: email, text, a voice memo.

Ordered by deadline, then by how long it takes to get.

---

## ⏰ This week — has a hard deadline

### 1. Statement of Financial Interest — due Monday, August 10
Not website work, but it's six days out. Every non-incumbent municipal candidate
files a Statement of Financial Interest for calendar year 2025 with the **city
clerk**. Ark. Code § 21-8-701(c)(1)(A). If it's already filed, ignore this.

### 2. The exact campaign committee name — now a verification, not a blocker
The footer currently reads *"Paid for by the Committee to Elect Nancy Orum"*,
taken from the campaign's own design file.

It still wants one check. Capitalization and wording have to match the filing
exactly, and nobody has yet compared this string against the filing itself.

**Where to check:** the filing paperwork, or call the **Benton County Clerk at
(479) 271-1013**.

If it differs, it changes in one place: `COMMITTEE_NAME` in
`src/content/election.ts`.

---

## 📝 The long pole — start now, it needs Nancy's own voice

### 3. The "Why I am running" section
This is the only part of the site with no content at all. Four short pieces:

1. **Who you are here.** How long in Bella Vista, how long in Ward 2, family,
   what brought you here. Two or three sentences.
2. **Your background.** Work history — lead with anything involving budgets,
   contracts, planning, or serving on a board.
3. **Why you decided to run.** The specific issue or moment. Keep it concrete.
   This is the paragraph people actually remember.
4. **One sentence in your own words** for the pull quote. This gets set in large
   italic type next to your photo, so it should sound like you talking, not like
   a press release.

Rough and honest beats polished and generic. We can tighten the wording — we
cannot invent the substance, and we won't try.

---

## ☎️ Contact details — done, except one

### 4. A phone number — ✅ decided: none
The artifact showed **(479) 555-1234**, which is the range reserved for fiction.
It is gone, and no phone number is published. That is a perfectly normal choice
for a local campaign. If you'd rather have one — a Google Voice number forwards
to your cell for free and keeps your personal number off a public website — send
it and it goes in the footer.

### 5. Email address — ✅ `votenancyorum@gmail.com`
Live in the footer, linked as a `mailto:`.

### 6. The Facebook page link — ✅ linked

### 7. Where should form submissions go?
Still open, and it's the one that matters. When a neighbor fills in "I'll take a
yard sign," which inbox should that hit? Whatever address you give when you
create the Web3Forms key (Allison's item 2) is where every submission lands.
Can be the same as #5.

---

## 🖼️ Images

### 8. A logo with a transparent background
**Mostly answered on 2026-08-27.** Nancy sent the new circular logo, and we
cropped it to the circle and cut the surround out, so it now has real
transparency and sits on any background. It is on the donate page and the last
platform card, and the site's whole colour palette was rebuilt from it on
2026-08-29.

**Fully answered on 2026-09-02.** The header lockup arrived as two knockouts with
real alpha — white type for the pages that open on a photograph, navy for the
pale ones — and the header picks by page. That retired the last of the old logo
from the site. Nothing outstanding here.

### 9. Photographs
All six platform cards now carry one. What is left is permissions, not pictures
— see §9a, which is the most important open item on this list.

Still worth sending if they exist:

1. **Little Sugar Creek** — she names the project on her first commitment, and
   the waterfall currently on that card is Tanyard Creek, a different one.
2. **A road or intersection** in Bella Vista, to replace the borrowed
   "Welcome to Arkansas" shot on card 03.
3. **The creek photograph from the back of her walk card**, at full resolution,
   from whoever designed the card. Nancy asked for it on the site; the only copy
   we have is the printed card, with her name set across the picture, which
   leaves 515 usable pixels where the page needs about 1200. The card was laid
   out from the original, so that file exists.
4. **A new headshot**, or confirmation the one we have is still the one. It is
   currently on no page of the site.

### ⚠ 9a. Five photographs need permission before launch

This is the one thing on the site that could cost the campaign money or
goodwill, and four of the five are one email each.

| Card | Arrived as | What it looks like |
|---|---|---|
| 02 Protect neighborhoods | `Bella-Vista-Paddle-Boarding-2018-06-KSJ_5943ps.jpg` | A photographer's own file naming — professional work, most likely the POA's or a tourism body's. |
| 03 Address traffic | `Arkansas_Sign_t1684.JPG` | `_t1684` is the suffix a news CMS puts on a resized web copy. EXIF stripped. |
| 05 Give residents a voice | `783986378_1221117…_n.jpg` | A Facebook CDN name — most likely saved from the campaign's own page, so probably fine. |
| 06 Make tourism work | `629f6422f64caf17d0821b0f_footer 03.jpg` | A Webflow asset id and a slot name: a marketing photo from somebody's website. |

For each, either **say where it came from and that the campaign may use it**, or
**send a replacement the campaign owns**.

### ⚠⚠ Card 04 is different, and it is the one to deal with first

The photograph on "Verify infrastructure" is a **Bella Vista Police Department
badge**, close enough to read, with the shoulder flash and radio in shot.

This is not a copyright question. **A public agency's insignia on a candidate's
platform page reads as that agency endorsing her.** Police departments generally
cannot endorse candidates, and many prohibit their insignia in political material
outright. This is the kind of thing that produces a call from the chief, and the
campaign would be in the wrong.

Get written permission from BVPD or the city before launch, or swap it for a
road, a lift station, or an appliance with no insignia in shot. The same goes for
Fire and EMS imagery if any is sent: **their consent is theirs to give, not the
campaign's to assume.**

**One more, on card 06.** The leading rider's jersey carries a legible bike-shop
name. Same implied-endorsement problem in miniature, and one a business is
entitled to decide for itself. The picture is cropped so the branding falls
outside the visible band, but the full file still contains it, and anyone
re-cropping it needs to know why the crop sits where it does.

---|---|---|
| 03 Address traffic | `Arkansas_Sign_t1684.JPG` | `_t1684` is the suffix a news CMS puts on a resized web copy. EXIF stripped. |
| 05 Give residents a voice | `783986378_1221117…_n.jpg` | A Facebook CDN name — most likely saved from the campaign's own page, so probably fine. |
| 06 Make tourism work | `629f6422f64caf17d0821b0f_footer 03.jpg` | A Webflow asset id and a slot name: a marketing photo taken off somebody's website. |
| 04 Verify infrastructure | `bella-vista-central-tunnels-…-hero-1024x683.jpg` | A WordPress slug with a size suffix — a resized copy from a trails or tourism site. |

For each, either **say where it came from and that the campaign may use it**, or
**send a replacement the campaign owns**. A candidate publishing a newspaper's or
a business's photograph is the kind of mistake that arrives as a letter.

**One extra thing on card 06, which is not about copyright.** The leading rider's
jersey carries a legible bike-shop name. A named local business on a candidate's
platform page reads as that business endorsing her — a claim nobody has made, and
one the business is entitled to decide for itself. The picture is cropped so the
branding falls outside the visible band, but the full file still contains it, and
anyone re-cropping it needs to know why the crop sits where it does.

---

## 🔢 Statistics — resolved, and please don't put the old ones back

The artifact cited three growth numbers. Three of the four claims did not hold
up, so the site publishes different ones:

| The artifact said | The site says | Why |
|---|---|---|
| 82% growth, 2000–2020 | More than double, 16,582 → 34,518 | The one that held up, extended to the current estimate |
| 33,274 residents, up from 30,102 in 2020 | 34,518, up from 30,104 | 30,102 appears in no Census product; 33,274 has been superseded |
| 636 permits, ~15× the 2013 pace | 637 permits, up from 28 in 2012 | The city reported no 2013 permit data at all — there was no 15× to measure |

Each figure now links to the Census page a reader can check for themselves.

**The design mockup still shows the old numbers.** That is expected and handled:
the build refuses to produce output if any of them reappear. If you ever see a
build fail with "FORBIDDEN STRINGS", this is why.

If you got the original numbers from somewhere specific — a city report, a news
article, a staff conversation — it's still worth telling us, in case there's a
city source we should be citing alongside the Census.

---

## 🌐 Domain

### 10. Buy the domain — the campaign should own it, not the developer
Suggested: `nancyorum.com` (matches the email in the artifact).

Buy it at **Cloudflare Registrar** — sold at cost with no markup, and free WHOIS
privacy, which keeps your home address out of public domain records. That last
part genuinely matters for a candidate.

**Create the Cloudflare account in the campaign's name**, then add us as a member.
That way the campaign keeps control of its own domain and website regardless of
what happens with any developer.

⚠️ **After purchase, watch for an ICANN verification email and click the link.**
If it's ignored, ICANN suspends the domain and the website goes offline. It's the
single most common way this setup breaks.

---

## 🔍 Search — added 2026-09-02

### 11. Tell the internet the site exists

Searching "nancy orum" on Google today brings up your LinkedIn, your X account,
a personal Facebook profile and an Amazon page — and not the campaign site. It
is not that the site ranks badly. Google has never seen it: the only page on
the internet that links to it is the Facebook page's website field, and
Facebook wraps that in a redirect that search engines give little weight. We
are fixing the technical side this week (a sitemap, a robots file,
machine-readable "this site is Nancy Orum's" data, and registering the site
with Google and Bing directly). The rest is links, and only you can create
them. Each takes about two minutes:

1. **Ballotpedia.** You already have a candidate page —
   <https://ballotpedia.org/Nancy_Orum_(Bella_Vista_City_Council_Ward_2_Position_2,_Arkansas,_candidate_2026)>
   — and it says you have not completed their *Candidate Connection* survey.
   Complete it and put `https://votefornancyorum.com` in the website field.
   This is the single most valuable link you can get, and it is free. The
   survey is the only route to it — the page's "Submit contact information"
   form only gets Ballotpedia to email you the survey, and the "endorsement"
   form is for endorsers. Start at <https://ballotpedia.org/Survey>; it takes
   about half an hour, saves partway, and verifies your identity by phone.
2. **The @votefornancyorum Instagram** — Edit profile → Links. The bio has no
   link today.
3. **Your LinkedIn** — Contact info → Website. Your LinkedIn is currently the
   first result for your name, so this one matters most after Ballotpedia.
4. **Your X account** (@71fancynancy) — Edit profile → Website. Nothing there
   mentions the campaign yet.
5. **Your real-estate site** (nancyorumrealestate.com) — a "Nancy for City
   Council" link anywhere on your agent page. It is one of the pages Google
   already shows for your name.
6. **The Facebook page** already has the site in its website field — good.
   Pin a post with the plain URL in it as well; the pinned post is what most
   visitors read, and it is a second link on the page.
7. **Local press.** The Weekly Vista's 2026-08-12 "candidates set" story names
   you with no link. When the Democrat-Gazette or the Weekly Vista runs
   candidate profiles, give them the URL — they print it.

And one question. The site can tell Google "these profiles are all the same
Nancy Orum", which helps it connect your name to the site. We will not guess
which accounts are yours. If these are yours, say so and they go in:

- LinkedIn: linkedin.com/in/nancy-orum-67515a7
- X: x.com/71fancynancy
- Instagram: instagram.com/votefornancyorum
- nancyorumrealestate.com

Expect the site to appear in Google within days of our registering it, and to
move to the top for your name a few weeks after the links above exist.

---

## Not needed yet

- Endorsements — send them as they come in, we'll add a section
- Events — same
- Donation link (ActBlue or similar) — only if the campaign plans to raise money
  online. Tell us and we'll wire it in.
