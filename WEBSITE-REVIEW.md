# Website walkthrough and recommendations

Reviewed November 8, 2026. Recommendations 2, 4 and 5 are now implemented. Recommendation 7 is implemented for basketball only, as requested; the notebook remains unchanged. Recommendations 1, 3, 6 and 8 remain proposals. The original review notes below describe the reasons for each recommendation.

## 1. Project screenshots and short demos — highest impact

The six project cards have custom HTML illustrations, but visitors cannot yet see the actual applications. Add real screenshots or short muted demos for GlanceAR, SignVision and Researchly first. Keep the existing descriptions, links, status disclosures and illustrations; let visitors open the real media alongside them. Real app evidence would do more for the portfolio than another decorative effect.

## 2. Shareable sections and direct navigation — implemented

Sections currently open as fullscreen panels without updating the URL. Add addresses such as `#projects` and `#experience`, restore the correct panel after refresh, and support browser Back/Forward. A compact section switcher inside the panel header would let visitors move from Experience to Projects without returning home. Preserve the active project filter and scroll position when returning.

## 3. A faster way through Experience — high priority

The timeline contains strong specifics, including 7M+ records per run, 20+ downstream teams, and research accuracy changes. On a phone, a reader must pass several long paragraphs to reach the next role. Add a compact employer/date index and short outcome summary for each role, with an optional expanded technical account. Keep every existing paragraph available; this is a proposed navigation and reading improvement, not a request to cut information.

## 4. Project case studies — implemented

Each project now has a technical case study covering architecture, tech stack, key features and challenges, and a general product-engineering takeaway. Personal-contribution sections and source footers are omitted as requested.

## 5. Connect the toolkit to evidence — implemented

Skills currently appear as five groups of tool chips. Let a tool or category point to the work that demonstrates it: PyTorch to the ACM research roles; cloud/data to Capital One; agents/context/guardrails to IBM and relevant projects. This would give the toolkit a purpose beyond listing keywords, without inventing skill scores or years of expertise.

## 6. A stronger food gallery — medium priority

The gallery contains 15 real photographs, currently using generic alt text such as “Food photo 01.” Add accurate descriptions and an optional keyboard-accessible lightbox with previous/next controls. The original food JPEGs total roughly 14 MB; generate responsive WebP/AVIF variants and retain the originals. This would reduce mobile transfer size while keeping every photo.

## 7. More useful book and basketball surprises — basketball implemented

Reading currently produces a short toast; basketball animates the ball and shows a message. They are fun but much smaller experiences than the aim game, food gallery and Valorant profile. A small reading shelf using books you supply, or a short basketball interaction with a basket, would give the objects a stronger payoff. Do not invent favorite books or personal anecdotes.

## 8. Finish the public-facing details — medium priority

Add an initials favicon and a share image that reflects the revised design; set a canonical URL once the public domain is confirmed. Review the dense mobile project introduction so the first project appears sooner, and increase the smallest metadata text where practical. Consolidate the accumulated CSS overrides into a clearer base/component/responsive structure before the next large redesign. These are recommendations, not changes included in this pass.

## Suggested order

Start with real project media, shareable section navigation, and the Experience reading path. Then add case-study depth and skill-to-work links. The gallery and richer personal surprises can follow.


## Implementation details

- Sections use static-host-compatible hashes (`#projects`, `#experience`, etc.), with browser history, refresh restoration, a section switcher, and preserved project filters/scroll position. Role links such as `#experience/capital-one` land below the sticky header.
- Six projects have separate case-study routes, such as `#projects/signvision`. The case studies show architecture, tech stack, key features and challenges, and general product-engineering takeaways; source links and personal-contribution sections are omitted from the UI. GitHub and resume evidence are documented in `CASE-STUDY-SOURCES.md`; user-confirmed GlanceAR and SignVision ownership/challenges are incorporated without inventing additional benchmarks.
- Supported skill chips and category evidence links open the relevant role or case study. Tools without specific supporting evidence retain their original plain chips.
- Basketball creates one temporary hoop, arcs through the rim/net, then removes the temporary scene and restores the original clickable ball. Repeated clicks are guarded and reduced motion uses a short stationary made-basket state. The notebook's message is unchanged.


Latest polish: the portfolio now has six project cards and six case studies. The extra scope notes under Vantage and Sentiment Radar have been removed. Skills emphasize the actual category headings. Contact replaces the suggested-message list with an open invitation and an interactive note composer, while keeping direct email, copy email, LinkedIn and GitHub available.
