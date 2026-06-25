// Item 8: lib/blog.ts — Full blog post content for SEO-rich article pages

export interface BlogPost {
  slug: string
    title: string
      excerpt: string
        date: string
          category: string
            readMinutes: number
              content: string // HTML-safe markdown-like content
              }

              export const blogPosts: BlogPost[] = [
                {
                    slug: 'understanding-builder-warranty',
                        title: 'Understanding Your New Home Builder Warranty',
                            excerpt: 'Most new home warranties have strict timelines. Here is what you need to know about what is covered and for how long — before your clock runs out.',
                                date: 'May 28, 2026',
                                    category: 'Warranty Guide',
                                        readMinutes: 6,
                                            content: `
                                            ## What Is a Builder Warranty?

                                            When you buy a new construction home, your builder provides a warranty that covers defects in workmanship, materials, and systems. Unlike a manufacturer's warranty on an appliance, a builder warranty is a legal commitment tied to your specific home — and it has hard deadlines.

                                            Understanding the structure of your warranty is the single most important thing you can do to protect your investment.

                                            ## The Three Standard Warranty Periods

                                            Most major homebuilders in the United States follow a tiered warranty structure:

                                            **Year 1 — Workmanship and Materials**
                                            The first year covers defects in workmanship and materials. This includes cosmetic issues like paint, drywall cracks, flooring gaps, and improperly hung doors. This is the most comprehensive period — and the one most homeowners fail to fully utilize before it expires.

                                            **Year 2 — Mechanical Systems**
                                            The second year typically covers your home's major mechanical systems: plumbing, electrical, heating, and air conditioning. A system failure during this period is the builder's responsibility to repair.

                                            **Year 10 — Structural Defects**
                                            The ten-year structural warranty covers major defects in load-bearing components: foundation, framing, roof structure. These are the most serious and expensive defects, and while they're rare, documentation from earlier years is critical if you ever need to make a structural claim.

                                            ## What Is NOT Covered

                                            Builder warranties typically exclude:

                                            - Normal wear and tear
                                            - Damage caused by the homeowner or their contractors
                                            - Landscaping and vegetation
                                            - Appliances (these have separate manufacturer warranties)
                                            - Items you specifically requested outside the standard build
                                            - Cosmetic damage after the first year

                                            ## The Critical 11-Month Inspection

                                            One of the most valuable things you can do as a new homeowner is schedule a professional home inspection at the 11-month mark — while you're still within the first-year warranty period. This gives you time to document and submit any remaining defects before the most comprehensive coverage expires.

                                            Many homeowners skip this step and deeply regret it.

                                            ## How Builders Try to Run Out Your Clock

                                            Warranty delays are a documented pattern. A builder might:

                                            - Take weeks to acknowledge your claim
                                            - Schedule a repair appointment and fail to show up
                                            - Partially address an issue without fully resolving it
                                            - Dispute whether something qualifies as a "defect"

                                            Every day of delay is a day closer to your warranty expiring. This is why timestamped documentation matters so much.

                                            ## Start Documenting Now

                                            The moment you close on your home, begin documenting. Take photos of every room, every system, every exterior surface. Date everything. Keep a written log.

                                            If you find a defect, submit it in writing immediately — not by phone call. A written record with a timestamp is your most powerful tool.

                                            Oluso exists to make this easy. Every claim you file gets a timestamp, a unique email thread with your builder, and a permanent record that can't be disputed.

                                            **Your warranty clock is running. Start your documentation today.**
                                                `.trim()
                                                  },
                                                    {
                                                        slug: 'documenting-construction-defects',
                                                            title: 'How to Document Construction Defects Effectively',
                                                                excerpt: 'Photos, timestamps, and written records are your most powerful tools. Learn the right way to document every defect before contacting your builder.',
                                                                    date: 'May 15, 2026',
                                                                        category: 'Documentation',
                                                                            readMinutes: 5,
                                                                                content: `
                                                                                ## Why Documentation Is Everything

                                                                                In a warranty dispute with a builder, the homeowner who documents wins. The builder who delays wins against the homeowner who doesn't document.

                                                                                This is not cynical — it's practical. Without a written, timestamped record, you have no proof of when a defect was discovered, when it was reported, or how the builder responded. With a complete record, you have leverage at every stage: negotiation, mediation, arbitration, or litigation.

                                                                                ## The Five Elements of Effective Documentation

                                                                                **1. Photographs with metadata**
                                                                                Every photo you take should have its timestamp intact. Do not edit or screenshot photos — use the originals. Photograph the defect from multiple angles, including a wide shot showing the context and a close-up showing the specific issue. Include a ruler or common object for scale when relevant.

                                                                                **2. Written description**
                                                                                Write a clear description of the defect: what it is, where it is located (room, wall, floor, exterior), when you first noticed it, and whether it has changed or worsened.

                                                                                **3. Date of discovery**
                                                                                Record the exact date you discovered the defect. This matters for warranty eligibility. "I noticed the crack in the foundation wall on March 15, 2026" is far more useful than "sometime this spring."

                                                                                **4. Impact assessment**
                                                                                Note whether the defect is causing secondary damage. A small roof leak may be cosmetic — or it may be causing mold growth inside the wall cavity. Document any consequences you can observe.

                                                                                **5. Submission proof**
                                                                                Document not just the defect itself, but your report of it. An email to your builder's warranty department, sent from a datestamped email, creates an indisputable record of when you reported it.

                                                                                ## Common Defects to Watch For by Category

                                                                                **Structural:** Foundation cracks (especially horizontal), sagging floors, sticking doors that weren't sticking before, gaps between wall and ceiling.

                                                                                **Water:** Staining on ceilings or walls, musty odors, efflorescence on concrete, water pooling near the foundation after rain.

                                                                                **HVAC:** Rooms that won't reach temperature, excessive utility bills, unusual noises from the system, condensation around vents.

                                                                                **Electrical:** Outlets that don't work, breakers that trip repeatedly, GFCI outlets that won't reset, flickering lights.

                                                                                **Plumbing:** Low pressure, slow drains, water discoloration, gurgling sounds, water spots under sinks.

                                                                                **Cosmetic (Year 1 only):** Nail pops, drywall cracks at corners, paint peeling or bubbling, grout cracking, flooring gaps.

                                                                                ## Using Oluso for Documentation

                                                                                Oluso structures your documentation automatically. When you file a claim, you specify the category, severity, and location. You can attach photos directly. The claim gets a timestamp and a unique email address that routes all builder communications into your record.

                                                                                When you send the builder an email from that claim thread, their reply is automatically logged — including the timestamp. This is how you prove response time in a dispute.

                                                                                **Document everything. Start today.**
                                                                                    `.trim()
                                                                                      },
                                                                                        {
                                                                                            slug: 'builder-response-times',
                                                                                                title: 'What Builder Response Times Tell You About Accountability',
                                                                                                    excerpt: 'The data on how long builders take to respond to warranty claims reveals patterns that homeowners should know about before they buy.',
                                                                                                        date: 'April 30, 2026',
                                                                                                            category: 'Data & Insights',
                                                                                                                readMinutes: 4,
                                                                                                                    content: `
                                                                                                                    ## Response Time as a Signal
                                                                                                                    
                                                                                                                    How quickly a builder responds to a warranty claim tells you something important about their operations and their culture.
                                                                                                                    
                                                                                                                    A builder who responds within 3 days is operationally prepared for warranty work and has processes in place. A builder who takes 30 days — or never responds at all — is either overwhelmed, understaffed, or counting on homeowners to give up.
                                                                                                                    
                                                                                                                    Neither situation is acceptable. But knowing which type of builder you're dealing with early helps you calibrate your approach.
                                                                                                                    
                                                                                                                    ## What the Data Shows
                                                                                                                    
                                                                                                                    Based on warranty claims filed through Oluso, response times vary dramatically across builders. Some patterns we observe:
                                                                                                                    
                                                                                                                    - Large national builders tend to have formal warranty departments and faster initial response times, but slower actual repair scheduling
                                                                                                                    - Smaller regional builders often have faster repair scheduling but less formal acknowledgment processes
                                                                                                                    - Response times worsen significantly in peak construction seasons (spring and early summer)
                                                                                                                    - Claims marked as "critical" receive faster initial responses than "low" or "medium" severity claims
                                                                                                                    
                                                                                                                    ## The Delay Pattern
                                                                                                                    
                                                                                                                    A documented delay pattern works like this:
                                                                                                                    
                                                                                                                    1. Homeowner submits claim
                                                                                                                    2. Builder acknowledges within 3–5 days (response time metric looks good)
                                                                                                                    3. Builder schedules inspection for 3 weeks out
                                                                                                                    4. Builder cancels and reschedules
                                                                                                                    5. Repair is scheduled for another 3–4 weeks
                                                                                                                    6. Repair is completed partially, a follow-up is needed
                                                                                                                    7. Months have passed; the homeowner is now closer to warranty expiration
                                                                                                                    
                                                                                                                    The initial response time was technically fast. The resolution time was not. Both metrics matter.
                                                                                                                    
                                                                                                                    ## What To Track
                                                                                                                    
                                                                                                                    When evaluating a builder — before or after purchase — ask for:
                                                                                                                    
                                                                                                                    - Average days to first response
                                                                                                                    - Average days to resolution (not just acknowledgment)
                                                                                                                    - What percentage of claims are resolved within warranty period
                                                                                                                    - How often claims are disputed vs. accepted
                                                                                                                    
                                                                                                                    This is the data Oluso is building. As more homeowners document their experiences, we can show you the full picture for any builder operating in your area.
                                                                                                                    
                                                                                                                    ## Using This Data
                                                                                                                    
                                                                                                                    For prospective buyers: search the builder's name in Oluso's community data before signing. Patterns of slow response or unresolved critical claims are a meaningful signal about what you're buying into.
                                                                                                                    
                                                                                                                    For current homeowners: track every response and every delay. If you can show a pattern of non-response, you have much stronger grounds for escalation — whether to the builder's executive team, your state contractor licensing board, or an attorney.
                                                                                                                    
                                                                                                                    **Response time data is accountability data. Track everything.**
                                                                                                                        `.trim()
                                                                                                                          },
                                                                                                                            {
                                                                                                                                slug: 'when-to-escalate',
                                                                                                                                    title: 'When and How to Escalate a Warranty Claim',
                                                                                                                                        excerpt: 'When your builder stops responding or drags their feet, there are specific steps you can take to escalate — without burning bridges.',
                                                                                                                                            date: 'April 14, 2026',
                                                                                                                                                category: 'Strategy',
                                                                                                                                                    readMinutes: 7,
                                                                                                                                                        content: `
                                                                                                                                                        ## Escalation Is a Last Resort — But a Real One
                                                                                                                                                        
                                                                                                                                                        Most warranty disputes can be resolved with persistence and proper documentation. Escalation is for when the builder has demonstrated a pattern of non-response, bad-faith delay, or outright refusal to honor legitimate warranty claims.
                                                                                                                                                        
                                                                                                                                                        The goal of escalation is not to burn bridges — it's to apply structured pressure that creates consequences for inaction.
                                                                                                                                                        
                                                                                                                                                        ## Step 1: Internal Escalation
                                                                                                                                                        
                                                                                                                                                        Before going external, escalate within the builder's organization.
                                                                                                                                                        
                                                                                                                                                        Most large builders have a dedicated warranty department separate from the sales team. If your warranty coordinator isn't responding, find out who manages the warranty department and send a written communication directly.
                                                                                                                                                        
                                                                                                                                                        Your letter or email should include:
                                                                                                                                                        - A clear timeline of the defect discovery
                                                                                                                                                        - Every communication you've had (dates, who you spoke with, what was said)
                                                                                                                                                        - The specific outcome you are requesting and by when
                                                                                                                                                        - A statement that you will escalate further if not resolved
                                                                                                                                                        
                                                                                                                                                        Keep this professional. You may need a positive relationship with this company for years.
                                                                                                                                                        
                                                                                                                                                        ## Step 2: The BBB and State Contractor Licensing Board
                                                                                                                                                        
                                                                                                                                                        Filing a complaint with the Better Business Bureau creates a public record. While the BBB has no enforcement power, many builders have contractual obligations to respond to BBB inquiries promptly.
                                                                                                                                                        
                                                                                                                                                        Your state contractor licensing board has actual enforcement power. Builders must maintain their license to operate. A complaint to the board — especially one supported by documented evidence of non-response — creates real regulatory risk for the builder.
                                                                                                                                                        
                                                                                                                                                        File a complaint at your state's contractor licensing website. Include your documentation, the timeline, and copies of all correspondence.
                                                                                                                                                        
                                                                                                                                                        ## Step 3: Demand Letter from an Attorney
                                                                                                                                                        
                                                                                                                                                        A letter on attorney letterhead changes the dynamic significantly. It signals that you are serious and that legal action is a real possibility.
                                                                                                                                                        
                                                                                                                                                        Many construction defect attorneys offer free consultations. Even if you don't plan to litigate, having an attorney draft a demand letter is often worth the cost.
                                                                                                                                                        
                                                                                                                                                        The letter should specify:
                                                                                                                                                        - The defect and its documentation
                                                                                                                                                        - The warranty obligation and how the builder has failed to meet it
                                                                                                                                                        - A specific deadline for resolution
                                                                                                                                                        - The legal remedy you will pursue if not resolved (small claims, civil suit, etc.)
                                                                                                                                                        
                                                                                                                                                        ## Step 4: Arbitration
                                                                                                                                                        
                                                                                                                                                        Most new home purchase contracts contain a mandatory arbitration clause. This means you cannot take the builder to court — disputes must go through a private arbitration process.
                                                                                                                                                        
                                                                                                                                                        Read your contract carefully. If arbitration is required, find out which arbitration organization is specified (typically AAA or JAMS) and review their process.
                                                                                                                                                        
                                                                                                                                                        Arbitration is faster and less expensive than litigation, but it still requires documentation and preparation. Your Oluso claim records, event timeline, and attached photos become your evidence file.
                                                                                                                                                        
                                                                                                                                                        ## Step 5: Small Claims or Civil Litigation
                                                                                                                                                        
                                                                                                                                                        If your contract does not require arbitration — or if you have claims that fall outside the arbitration clause — small claims court is an option for lower-dollar disputes.
                                                                                                                                                        
                                                                                                                                                        For larger disputes, a construction defect attorney can evaluate whether litigation makes financial sense. They typically work on contingency for significant structural defects.
                                                                                                                                                        
                                                                                                                                                        ## What Not To Do
                                                                                                                                                        
                                                                                                                                                        - Don't stop paying HOA fees or mortgage in protest — this creates new legal problems
                                                                                                                                                        - Don't publicly defame the builder with false statements — stay factual
                                                                                                                                                        - Don't make verbal agreements without following up in writing
                                                                                                                                                        - Don't assume the statute of limitations is long — construction defect statutes of limitations vary by state and can be surprisingly short
                                                                                                                                                        
                                                                                                                                                        ## The Role of Documentation in Escalation
                                                                                                                                                        
                                                                                                                                                        At every stage of escalation, the homeowner with the most complete documentation wins. Every delay the builder caused, every unreturned phone call, every partial repair that didn't fix the problem — these are all part of your case.
                                                                                                                                                        
                                                                                                                                                        Oluso's event timeline gives you a chronological record of every action: when the claim was filed, when messages were sent, when the builder replied, when status changed. This is your evidence file.
                                                                                                                                                        
                                                                                                                                                        **Document first. Escalate with confidence.**
                                                                                                                                                            `.trim()
                                                                                                                                                              }
                                                                                                                                                              
                                                                                                                          ,
                                                                                                                          {
                                                                                                                                slug: 'preparing-for-your-30-day-walkthrough',
                                                                                                                                title: 'How to Prepare for Your 30-Day New Home Walkthrough',
                                                                                                                                excerpt: 'The 30-day walkthrough is your first formal chance to document defects with your builder present. Here is how to make the most of it.',
                                                                                                                                date: 'May 31, 2026',
                                                                                                                                category: 'Warranty Guide',
                                                                                                                                readMinutes: 5,
                                                                                                                                content: `
## What Is the 30-Day Walkthrough?

Most builders schedule a formal walkthrough with the homeowner within the first 30 days of closing. This is your opportunity to walk through the home together, identify visible defects, and create a written punch list that the builder is obligated to address.

It is also, for many homeowners, the last time they have the builder's full attention for warranty issues.

## What to Bring

Come prepared. Bring a notepad, your phone for photos, a flashlight, and a printed copy of any defects you have already noticed since closing. Do not rely on memory.

Walk every room systematically, starting from the top of the house and working down.

**Exterior:** Walk the entire perimeter. Check caulking around windows and doors, grading and drainage away from the foundation, driveway and sidewalk cracks, siding alignment, and roof condition from ground level.

**Garage:** Check the garage door operation, floor cracks, drywall finish, and electrical outlets.

**Kitchen:** Run the faucet at full pressure and check under the sink. Test every outlet, especially GFCIs. Check cabinet alignment, drawer function, and countertop seams.

**Bathrooms:** Test hot water pressure and temperature. Check under vanities for leaks. Inspect tile grout and caulking. Test exhaust fans.

**Bedrooms and living areas:** Look for drywall nail pops, corner bead cracks, paint inconsistencies, and flooring gaps. Test every light switch and outlet.

**HVAC:** Change the filter if it is dirty (document this), and verify the system reaches the set temperature in each zone.

## Document Everything in Writing

Do not accept verbal assurances. Everything the builder agrees to fix must be in writing. Most builders will have a walkthrough form — review it before you sign, and add any items they may have missed.

If the builder resists noting something, take a photo and write it in your own notes. You have documentation regardless.

## The Punch List Is Not the End

Items on your walkthrough punch list should be completed within 30 to 60 days. If they are not, follow up in writing and create a new deadline. Each communication becomes part of your warranty record.

Your 30-day walkthrough is the beginning of your documentation practice, not a one-time event.

**Walk thoroughly. Document everything. Follow up in writing.**
`.trim()
                                                                                                                          },
                                                                                                                          {
                                                                                                                                slug: 'understanding-utah-new-home-warranty-act',
                                                                                                                                title: 'The Utah New Home Warranty Act: What Every Buyer Needs to Know',
                                                                                                                                excerpt: 'Utah state law provides specific warranty protections for new home buyers. Most homeowners do not know what the law requires or how to use it.',
                                                                                                                                date: 'June 4, 2026',
                                                                                                                                category: 'Warranty Guide',
                                                                                                                                readMinutes: 6,
                                                                                                                                content: `
## What Is the Utah New Home Warranty Act?

The Utah New Home Warranty Act (Utah Code 58-70a) establishes minimum warranty standards for newly constructed homes in the state. It defines what must be covered, for how long, and what builders are legally required to do when a homeowner reports a defect.

Understanding this law is not just useful — it is essential. Builders know the law inside and out. Homeowners who do not know it are at a significant disadvantage.

## What the Law Requires

**One-Year Coverage:**
The first year covers defects in workmanship and materials. This includes improper installation of any component of the home.

**Two-Year Coverage:**
For two years, the builder must warrant against defects in plumbing, electrical, heating, cooling, and ventilation systems.

**Six-Year Coverage:**
For six years, the builder must warrant against major structural defects — issues that affect load-bearing components and threaten the structural integrity of the home.

This is longer than the federal standard many buyers assume applies. The six-year structural warranty is a meaningful protection for Utah homeowners.

## How to Make a Claim Under the Act

The Utah New Home Warranty Act requires that warranty claims be made in writing. Verbal reports do not satisfy the legal requirement.

Your written notice must describe the alleged defect in reasonable detail and be delivered to the builder in a manner that provides proof of delivery — certified mail, email with read receipt, or a warranty portal that timestamps submissions.

## What Happens If the Builder Does Not Respond?

Under the Act, builders have a reasonable time to inspect and repair warranty defects. If a builder fails to respond or refuses to honor legitimate warranty claims, a homeowner may pursue remedies including repair costs and diminution in value.

Before pursuing legal remedies, you must have a documented record of the defect and your attempts to notify the builder.

## What the Act Does Not Cover

The Utah New Home Warranty Act does not cover defects caused by the homeowner, normal wear and tear, damage from events outside the builder's control, or items covered by a separate manufacturer warranty.

## Why Documentation Is Your Legal Instrument

The difference between a successful warranty claim and a failed one often comes down to whether the homeowner can prove they reported the defect within the warranty period and gave the builder a reasonable opportunity to remedy it.

Oluso's timestamped claim system is designed specifically to create the documentation record the Utah New Home Warranty Act requires.

**Know your rights. Document your claims. The law is on your side.**
`.trim()
                                                                                                                          },
                                                                                                                          {
                                                                                                                                slug: 'common-mistakes-new-homeowners-make-with-warranty-claims',
                                                                                                                                title: 'The 7 Most Common Warranty Claim Mistakes New Homeowners Make',
                                                                                                                                excerpt: 'Most homeowners leave warranty coverage on the table. These are the mistakes that cost them their claims — and how to avoid every one.',
                                                                                                                                date: 'June 11, 2026',
                                                                                                                                category: 'Strategy',
                                                                                                                                readMinutes: 5,
                                                                                                                                content: `
## Most Warranty Issues Go Unreported

Most defects in new construction homes are never formally reported. Homeowners notice problems, assume they are normal, or simply do not know they can make a claim.

The ones who do report are often too late, or make procedural mistakes that undercut their claims.

Here are the seven most common mistakes — and what to do instead.

## Mistake 1: Reporting Verbally Instead of in Writing

A phone call to your builder's customer service line does not create a warranty claim. Only written, timestamped notice satisfies the legal requirement of most warranty contracts and state warranty laws.

**Fix:** Submit every claim in writing. Email, certified mail, or a warranty tracking platform like Oluso all create the timestamped record you need.

## Mistake 2: Waiting to See If It Gets Worse

Many homeowners notice a crack, a stain, or a door that sticks and decide to monitor it before reporting. Months pass, the warranty period ends, and the defect is no longer covered.

**Fix:** Report as soon as you notice a defect. You can note that it is minor or still developing. The date of first notice is what matters for warranty eligibility.

## Mistake 3: Assuming the Builder's Portal Protects You

Some builders have their own warranty management portals. These are controlled by the builder — submissions can be deleted, statuses changed, and timelines disputed.

**Fix:** Keep your own independent record of every claim, even if you also use the builder's system.

## Mistake 4: Not Following Up After Submission

Submitting a claim and waiting is not a strategy. A claim that goes unacknowledged for three weeks has effectively been ignored.

**Fix:** If you do not receive written acknowledgment within 5 business days, send a follow-up. Track every follow-up with its date and outcome.

## Mistake 5: Accepting Partial Repairs

A builder who fixes the visible symptom without addressing the root cause has not honored your warranty claim. Water staining patched over without finding the leak source will return.

**Fix:** Before closing a claim, confirm that the underlying cause has been resolved, not just the surface manifestation.

## Mistake 6: Missing the 11-Month Inspection Window

The most comprehensive warranty coverage — workmanship and materials — expires at one year. An 11-month professional inspection finds issues you can still report under full first-year coverage.

**Fix:** Schedule a third-party home inspection at month 11. It typically costs $300 to $500 and is the highest-ROI action most new homeowners can take.

## Mistake 7: Going Adversarial Too Early

Builders have legal teams, arbitration clauses, and patience. Homeowners who become adversarial before exhausting collaborative options often end up worse off.

**Fix:** Be firm but professional in all written communications. Escalation is a tool for after good-faith attempts have failed — not a first response.

**Document everything. Follow up consistently. Escalate strategically.**
`.trim()
                                                                                                                          },
                                                                                                                          {
                                                                                                                                slug: 'hvac-warranty-claims-new-construction',
                                                                                                                                title: 'HVAC Warranty Claims in New Construction: What Is Covered and When',
                                                                                                                                excerpt: 'HVAC issues are among the most expensive defects in new homes. Understanding what your warranty covers and for how long can save you thousands.',
                                                                                                                                date: 'June 18, 2026',
                                                                                                                                category: 'Documentation',
                                                                                                                                readMinutes: 6,
                                                                                                                                content: `
## Why HVAC Claims Are Different

HVAC issues occupy a special place in new home warranty law. Unlike cosmetic defects, which are typically covered only in the first year, HVAC system defects fall under the two-year mechanical systems warranty in most states — including Utah.

This means a furnace that was improperly installed, ductwork that was incorrectly sized, or an AC unit that was never properly commissioned are builder warranty issues for up to two years after closing.

## Builder Warranty vs. Manufacturer Warranty

This distinction trips up many homeowners.

**Builder warranty** covers defects in how the HVAC system was installed or commissioned — ductwork wired incorrectly, a system that cannot maintain temperature in a well-insulated home. These are installation defects the builder must address.

**Manufacturer warranty** covers defects in the equipment itself — a compressor that fails, a heat exchanger with a factory defect. Equipment warranties are typically 5 to 10 years for major components and are handled through the manufacturer, not the builder.

## Common HVAC Defects in New Construction

**Undersized or oversized systems:** A system not matched to the home's heat load will run inefficiently, wear out faster, and fail to maintain comfortable temperatures.

**Duct leakage:** Poorly sealed ductwork loses conditioned air inside wall cavities and attics. This is extremely common in new construction and is both a comfort problem and an energy cost problem.

**Improper refrigerant charge:** An AC system not properly charged at installation will underperform from day one. A technician can verify refrigerant charge — low charge is a commissioning defect.

**Drainage issues:** Condensate drains that are improperly pitched or incorrectly connected can cause water damage inside walls or ceilings.

## How to Document an HVAC Claim

Start with observable symptoms: rooms that cannot reach temperature, utility bills higher than neighbors in similar homes, unusual sounds, or visible condensation.

Then get a third-party HVAC technician to inspect the system and provide a written assessment. Their report documenting the defect and its cause is far more compelling than personal observations alone.

File your claim in writing with the date of first observation, the symptoms, and the technician's report attached.

## Timing Your Claim

Do not wait for your HVAC system to completely fail. If something seems wrong — utility bills higher than expected, rooms with consistent temperature complaints, unusual sounds — have it inspected before the two-year mechanical warranty expires.

The cost of a diagnostic visit is trivial compared to an HVAC repair the builder should have covered.

**Know your HVAC coverage. Get it inspected. Document before the clock runs out.**
`.trim()
                                                                                                                          },
                                                                                                                          {
                                                                                                                                slug: 'using-community-data-to-evaluate-builders',
                                                                                                                                title: 'How to Use Community Warranty Data to Evaluate a Builder Before You Buy',
                                                                                                                                excerpt: 'The warranty claims filed by existing homeowners in a subdivision tell you more about a builder than any sales brochure. Here is how to read them.',
                                                                                                                                date: 'June 25, 2026',
                                                                                                                                category: 'Data & Insights',
                                                                                                                                readMinutes: 5,
                                                                                                                                content: `
## The Information Gap Before Closing

When you are evaluating a new construction home, the builder controls almost all of the information you receive. The model home is immaculate. The sales team is polished. The brochures show awards and testimonials.

What you do not see is how the builder has handled warranty claims for the homeowners who moved in before you.

That information exists — in the lived experience of existing homeowners in that subdivision. Until recently, there was no structured way to access it. That is what community warranty data changes.

## What Community Data Shows

When homeowners in a subdivision share their warranty experiences, patterns emerge quickly.

**Defect frequency by category:** Are foundation issues common in this subdivision? Do HVAC complaints cluster around a specific model? Is there a pattern of water intrusion in homes of a certain elevation?

**Builder response behavior:** How quickly does this builder acknowledge claims? What percentage of claims get resolved within 30 days? How many claims required escalation?

**Resolution quality:** Are repairs durable, or do the same defects recur? Do builders address root causes or just surface symptoms?

**Claim timing patterns:** Are most claims clustered in months 10 to 12, suggesting homeowners are rushing to file before first-year coverage expires? That pattern indicates the builder has been slow to respond to earlier submissions.

## How to Use This Data as a Buyer

If you are considering a home in a subdivision with Oluso data, search the builder name and subdivision before signing. Look for high defect volume in structural or water categories, long average response times, unresolved critical claims, and patterns of escalation across multiple homeowners.

## How to Use This Data as a Current Homeowner

If you already own in the subdivision, community data helps in two ways. First, you can see whether defects you are experiencing are common to the area — which strengthens your case that the issue is a construction defect, not a maintenance issue. Second, you can learn from neighbors who have navigated similar claims.

## Contributing to the Community

Every claim you file and every experience you share makes the community data richer for the homeowners who come after you. A buyer who searches your subdivision two years from now may benefit from knowing how the builder handled the issue you documented today.

Warranty transparency holds builders accountable and helps buyers make better decisions.

**Research before you buy. Document as you live there. Share what you learn.**
`.trim()
                                                                                                                          }
]
                                                                                                                                                              
                                                                                                                                                              export function getPostBySlug(slug: string): BlogPost | undefined {
                                                                                                                                                                return blogPosts.find(p => p.slug === slug)
                                                                                                                                                                }
                                                                                                                                                                
                                                                                                                                                                export function getAllSlugs(): string[] {
                                                                                                                                                                  return blogPosts.map(p => p.slug)
                                                                                                                                                                  }
