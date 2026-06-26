// seed-fake-data.js
// Netlify function to insert ~100 fake users + ~150 fake claims for demo/seed purposes.
// All fake rows use the @seed.oluso.fake email domain and can be deleted with one query.
// Protected by x-seed-key header == process.env.SEED_SECRET
// Idempotent: checks for existing seed users before inserting.
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Static lookup data

const BUILDERS = [
  'David Weekley Homes',
  'Ivory Homes',
  'Woodside Homes',
  'Toll Brothers',
  'Lennar Homes',
  'KB Home',
  'DR Horton',
  'Pulte Homes',
]

const CITIES = [
  'Herriman', 'South Jordan', 'Draper', 'Eagle Mountain',
  'Saratoga Springs', 'American Fork', 'Lehi', 'Vineyard',
  'Bluffdale', 'Sandy',
]

const CATEGORIES = ['structural', 'water', 'electrical', 'hvac', 'plumbing', 'cosmetic', 'landscaping', 'other']
const SEVERITIES  = ['low', 'medium', 'high', 'critical']
const STATUSES    = ['open', 'in_progress', 'awaiting_builder', 'resolved', 'closed']
const WARRANTY_YEARS = [1, 2, 10]

const FIRST_NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda',
  'William','Barbara','David','Susan','Richard','Jessica','Joseph','Sarah',
  'Thomas','Karen','Charles','Lisa','Christopher','Nancy','Daniel','Betty',
  'Matthew','Sandra','Anthony','Ashley','Mark','Emily','Donald','Donna',
  'Steven','Carol','Paul','Amanda','Andrew','Melissa','Joshua','Deborah',
  'Kenneth','Stephanie','Kevin','Rebecca','Brian','Sharon','George','Laura',
  'Timothy','Cynthia','Ronald','Amy','Edward','Angela','Jason','Shirley',
  'Jeffrey','Anna','Ryan','Brenda','Jacob','Pamela','Gary','Heather',
  'Nicholas','Katherine','Eric','Christine','Jonathan','Debra','Stephen','Rachel',
  'Larry','Carolyn','Justin','Janet','Scott','Emma','Raymond','Maria',
  'Brandon','Kathleen','Gregory','Amber','Frank','Janice','Benjamin','Diana',
  'Samuel','Julie','Patrick','Danielle','Alexander','Madison','Jack','Olivia',
]

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
  'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker',
  'Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell',
  'Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker',
  'Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy',
]

const CLAIM_TITLES = [
  'Crack in foundation wall',
  'Water intrusion in basement',
  'HVAC not heating properly',
  'Leaking roof flashing',
  'Electrical outlets not working in master bedroom',
  'Garage door opener intermittent failure',
  'Grout cracking in master bath',
  'Kitchen cabinet doors misaligned',
  'Driveway cracking after first winter',
  'Window seal failed — condensation between panes',
  'Sewage smell in downstairs bathroom',
  'Water heater making banging noise',
  'Furnace shutting off unexpectedly',
  'Stucco cracking around window frames',
  'Sliding door off track',
  'Attic insulation gap — cold spot in ceiling',
  'Sprinkler system not activating zone 3',
  'Exterior paint peeling after 6 months',
  'Toilet running continuously',
  'Bathroom fan not exhausting properly',
  'Doorbell wiring issue',
  'Hot water slow to reach master bath',
  'Concrete porch settling unevenly',
  'Dishwasher drain backing up',
  'Gas fireplace igniter not working',
  'Flooring buckling near sliding door',
  'Siding panel cracked during temperature change',
  'Ceiling drywall tape separation',
  'Downspout disconnected from foundation drain',
  'AC not reaching temperature on upper floor',
  'Basement egress window leaking during rain',
  'Retaining wall showing movement',
  'Recessed light fixture flickering',
  'Cold air return duct disconnected in crawlspace',
  'Stair railing loose',
  'Deck board splitting at nail points',
  'Grading issue — water pooling against house',
  'Shower pan cracking',
  'Weatherstripping missing on back door',
  'Condensate line clogged — AC drain pan full',
  'Exterior soffit pulling away from fascia',
  'Garage floor epoxy peeling',
  'Smoke detector chirping constantly',
  'Main breaker tripping intermittently',
  'Carpet seam visible in living room',
  'Tile grout discoloring in kitchen',
  'Sump pump not activating',
  'Radon mitigation pipe disconnected',
  'Window casing gaps — visible light from outside',
  'Pressure-balance valve not working in guest bath',
]

const DEFECT_LOCATIONS = [
  'Master Bedroom', 'Living Room', 'Kitchen', 'Basement', 'Garage',
  'Master Bath', 'Guest Bath', 'Attic', 'Exterior', 'Backyard',
  'Crawlspace', 'Laundry Room', 'Dining Room', 'Office', 'Entryway',
]

// Helpers

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickWeighted(arr, weights) {
  const total = weights.reduce(function(a, b) { return a + b }, 0)
  let r = Math.random() * total
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i]
    if (r <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function addDays(isoDate, days) {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function seedEmail(i) {
  return 'user' + String(i).padStart(3, '0') + '@seed.oluso.fake'
}

// Data generation

function generateUsers(count) {
  const users = []
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Way', 'Elm Ct', 'Birch Blvd', 'Aspen Cir']
  for (let i = 1; i <= count; i++) {
    const firstName = pick(FIRST_NAMES)
    const lastName  = pick(LAST_NAMES)
    const city      = pick(CITIES)
    users.push({
      email:        seedEmail(i),
      name:         firstName + ' ' + lastName,
      role:         'user',
      address:      randomInt(1000, 9999) + ' ' + pick(streets) + ', ' + city + ', UT ' + randomInt(84000, 84999),
      builder_name: null,
    })
  }
  return users
}

function generateClaims(userIds, builderMap, targetCount) {
  const claims = []
  let idx = 0
  while (claims.length < targetCount) {
    const userId      = userIds[idx % userIds.length]
    idx++
    const builderName = pick(BUILDERS)
    const builderId   = builderMap[builderName] || null
    const category    = pick(CATEGORIES)
    const severity    = pickWeighted(SEVERITIES, [20, 40, 25, 15])
    const status      = pickWeighted(STATUSES,   [25, 20, 15, 25, 15])
    const warrantyYear = pick(WARRANTY_YEARS)
    const createdDaysAgo = randomInt(7, 540)
    const createdAt   = daysAgo(createdDaysAgo)
    const daysToFirstResponse = randomInt(2, 14)
    const isResolved  = status === 'resolved' || status === 'closed'
    const resolvedAt  = isResolved ? addDays(createdAt, randomInt(14, 90)) : null
    const title       = CLAIM_TITLES[randomInt(0, CLAIM_TITLES.length - 1)]

    claims.push({
      user_id:                userId,
      builder_id:             builderId,
      builder_name:           builderName,
      title:                  title,
      description:            'Seed data: ' + title + ' at a home built by ' + builderName + ' in ' + pick(CITIES) + ', UT.',
      category:               category,
      severity:               severity,
      status:                 status,
      public_story:           true,
      warranty_year:          warrantyYear,
      defect_location:        pick(DEFECT_LOCATIONS),
      defect_sub_category:    category,
      estimated_repair_cost:  randomInt(150, 8500),
      days_to_first_response: daysToFirstResponse,
      resolved_at:            resolvedAt,
      builder_response_count: isResolved ? randomInt(1, 5) : randomInt(0, 2),
      reopen_count:           0,
      created_at:             createdAt,
    })
  }
  return claims
}

// Handler

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const seedKey = event.headers && (event.headers['x-seed-key'] || event.headers['X-Seed-Key'])
  if (!process.env.SEED_SECRET || seedKey !== process.env.SEED_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  try {
    // Idempotency check
    const { count: existingCount, error: countErr } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .like('email', '%@seed.oluso.fake')

    if (countErr) throw countErr

    if (existingCount && existingCount > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          users_inserted:  0,
          claims_inserted: 0,
          skipped:         existingCount,
          message:         'Seed data already exists (' + existingCount + ' users). Delete existing seed rows first to re-seed.',
        }),
      }
    }

    // Look up builder IDs
    const { data: builderRows, error: builderErr } = await supabase
      .from('builders')
      .select('id, name')

    if (builderErr) throw builderErr

    const builderMap = {}
    if (builderRows) {
      builderRows.forEach(function(b) { builderMap[b.name] = b.id })
    }

    // Insert 100 users
    const users = generateUsers(100)
    const { data: insertedUsers, error: usersErr } = await supabase
      .from('users')
      .insert(users)
      .select('id')

    if (usersErr) throw usersErr

    const userIds = (insertedUsers || []).map(function(u) { return u.id })

    if (userIds.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No users were inserted — check RLS / service key.' }),
      }
    }

    // Insert ~150 claims in batches of 50
    const claims = generateClaims(userIds, builderMap, 150)
    let claimsInserted = 0
    const BATCH = 50
    for (let i = 0; i < claims.length; i += BATCH) {
      const batch = claims.slice(i, i + BATCH)
      const { data: batchResult, error: batchErr } = await supabase
        .from('claims')
        .insert(batch)
        .select('id')
      if (batchErr) {
        console.error('claims batch error at offset ' + i + ':', batchErr.message)
      } else {
        claimsInserted += (batchResult || []).length
      }
    }

    // Refresh builder_scores materialized view
    const { error: refreshErr } = await supabase.rpc('refresh_builder_scores')
    if (refreshErr) {
      console.error('refresh_builder_scores error (non-fatal):', refreshErr.message)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        users_inserted:  userIds.length,
        claims_inserted: claimsInserted,
        skipped:         0,
        refresh_status:  refreshErr ? ('FAILED: ' + refreshErr.message) : 'OK',
      }),
    }

  } catch (err) {
    console.error('seed-fake-data error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    }
  }
}
