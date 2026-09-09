// Editorial examples only. No observed ads, source quotes or performance data.
// These are not canonical Orcool evidence or customer hypothesis records.
const EXPLORER_EXAMPLES = {
  fintech: {
    label: 'Fintech',
    tension: 'A prospective user may hesitate because the total cost of a transfer is unclear.',
    hypothesis: 'If cost uncertainty blocks a first transfer, showing the verified total before confirmation may increase completed first transfers versus a speed-led message.',
    proof: 'Verify the actual fee and exchange-rate display. Collect dated, permission-safe customer language about cost uncertainty; do not assume that friction exists.',
    action: 'completed first transfer',
    opening: 'See the total before you send.',
    constraint: 'Use only if the product really displays the complete cost. No invented fee, speed or savings claim.'
  },
  mobility: {
    label: 'Mobility',
    tension: 'A prospective rider may hesitate when the pickup process is unclear.',
    hypothesis: 'If pickup uncertainty blocks a first booking, demonstrating the real pickup steps may increase completed first rides versus a generic convenience message.',
    proof: 'Verify the actual booking and pickup flow. Collect dated rider feedback about pickup friction and check service eligibility in the selected market.',
    action: 'completed first ride',
    opening: 'Know the pickup steps before you book.',
    constraint: 'Show the real flow. Do not imply guaranteed arrival times, coverage or safety outcomes.'
  },
  health: {
    label: 'Health',
    tension: 'A prospective user may hesitate when the time and effort required for a routine are unclear.',
    hypothesis: 'If an unclear starting commitment blocks activation, showing one real beginner routine may increase first-routine completion versus a broad lifestyle message.',
    proof: 'Verify the routine and its eligibility requirements. Collect dated onboarding feedback; separate usability friction from clinical claims.',
    action: 'completed first routine',
    opening: 'See what starting looks like.',
    constraint: 'No diagnosis, treatment, guaranteed health outcome or invented testimonial. Review applicable claims before any test.'
  },
  ecom: {
    label: 'E-com',
    tension: 'A prospective shopper may hesitate because product size or use is hard to judge.',
    hypothesis: 'If uncertainty about the product blocks purchase, a verified in-use demonstration may increase completed purchases versus a beauty-only product shot.',
    proof: 'Check product dimensions, features and availability. Collect dated shopper questions and distinguish product uncertainty from delivery or price friction.',
    action: 'completed purchase',
    opening: 'See it in use before you choose.',
    constraint: 'Show the actual product. Do not invent delivery, returns, stock or performance claims.'
  },
  dating: {
    label: 'Dating',
    tension: 'A prospective adult user may hesitate because they do not know how to start a conversation.',
    hypothesis: 'If first-message uncertainty blocks activation, demonstrating a real conversation-starting feature may increase first-message attempts versus a generic matching promise.',
    proof: 'Verify the feature, adult eligibility and privacy constraints. Collect dated, consent-safe onboarding feedback without exposing private conversations.',
    action: 'first-message attempt',
    opening: 'A way to start the conversation.',
    constraint: 'No promised match, relationship outcome, fabricated member or copied private message.'
  },
  saas: {
    label: 'SaaS',
    tension: 'A prospective team may hesitate because setup effort is hard to estimate.',
    hypothesis: 'If uncertain setup effort blocks activation, showing one complete supported workflow may increase first-workflow completion versus a feature list.',
    proof: 'Verify the workflow, prerequisites and current integration support. Collect dated onboarding feedback; do not infer setup time from a shortened demo.',
    action: 'completed first workflow',
    opening: 'Follow one real workflow from start to finish.',
    constraint: 'Disclose prerequisites. No invented time saved, integration or automatic result.'
  },
  ai_first: {
    label: 'AI First Service',
    tension: 'A prospective user may hesitate because it is unclear what they can review or correct.',
    hypothesis: 'If uncertainty about control blocks activation, demonstrating a real review-and-correct step may increase completion of a reviewed task versus an output-only demo.',
    proof: 'Verify the current review, correction and data-handling flow. Collect dated user feedback about control; keep model output separate from verified facts.',
    action: 'completed reviewed task',
    opening: 'See what you can check and change.',
    constraint: 'Only show controls that exist. No guaranteed accuracy, autonomous outcome or fabricated screen.'
  },
  subscription: {
    label: 'Subscription App',
    tension: 'A prospective subscriber may hesitate because the ongoing commitment is unclear.',
    hypothesis: 'If uncertainty about the commitment blocks a qualified start, explaining the actual access and cancellation terms may increase qualified starts versus a benefits-only message.',
    proof: 'Verify billing, access and cancellation terms in the live product. Collect dated user questions and define a qualified start before testing.',
    action: 'qualified start with retention review',
    opening: 'Know the commitment before you start.',
    constraint: 'Use the actual terms. Do not invent a free trial, price, cancellation path or retention result.'
  }
};

const EXPLORER_MARKETS = {
  nigeria: 'Nigeria', indonesia: 'Indonesia', colombia: 'Colombia', egypt: 'Egypt',
  brazil: 'Brazil', southafrica: 'South Africa', mexico: 'Mexico', vietnam: 'Vietnam',
  kenya: 'Kenya', philippines: 'Philippines'
};

function getHookData(category, market) {
  const example = EXPLORER_EXAMPLES[category];
  const marketName = EXPLORER_MARKETS[market];
  if (!example || !marketName) return null;
  return {
    kind: 'illustrative_hypothesis', evidence_status: 'unsupported', source_urls: [],
    label: marketName + ' · ' + example.label,
    scope: 'Selected research scope: ' + marketName + '. This is an unvalidated category example, not a finding about this market. No source observations or campaign outcomes are attached.',
    hooks: [
      { title: 'Assumption to challenge', text: example.tension, why: example.hypothesis },
      { title: 'Evidence still needed', text: example.proof, why: 'For ' + marketName + ', check the intended audience, language, product availability and claims with a qualified local reviewer. Keep source URLs and observation dates.' },
      { title: 'Decision gate to agree', text: 'Compare ' + example.action + ' against an agreed control in ' + marketName + '.', why: 'Before spend, agree the KPI definition, threshold, comparison, budget, measurement window, durability requirement and decision owner. The advertiser approves and launches media, then returns comparable outcomes.' }
    ],
    counter: { text: example.opening, note: 'Illustrative opening, not a quotation from an ad. ' + example.constraint + ' A hook is one execution of the hypothesis, not a measured winner.' }
  };
}
