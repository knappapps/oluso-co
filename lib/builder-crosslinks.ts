// Maps homebuilders-data.ts slugs (national Top 50 profiles) to the
// matching Utah builders-table slug (accountability scorecards), for
// the handful of national builders that are also active in Utah.
// Keeping this as an explicit map avoids guessing from name/slug text,
// since the two data sets use different slug conventions
// (e.g. "lennar-corp" vs "lennar-homes", "pultegroup" vs "pulte-homes").
export const NATIONAL_TO_UTAH_BUILDER_SLUG: Record<string, string> = {
    'dr-horton': 'dr-horton',
    'lennar-corp': 'lennar-homes',
    'pultegroup': 'pulte-homes',
    'kb-home': 'kb-home',
    'toll-brothers': 'toll-brothers',
    'david-weekley-homes': 'david-weekley-homes',
}

export const UTAH_TO_NATIONAL_BUILDER_SLUG: Record<string, string> = Object.fromEntries(
    Object.entries(NATIONAL_TO_UTAH_BUILDER_SLUG).map(([national, utah]) => [utah, national])
  )
