// fetch-industry-news.js
// Netlify scheduled function -- runs daily to pull industry RSS feeds and
// upsert new items into the industry_news table for display on /news.
// Schedule is defined in netlify.toml: [functions."fetch-industry-news"] schedule = "0 6 * * *"
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_KEY
)

const FEEDS = [
{ name: 'Eye On Housing (NAHB)', url: 'https://eyeonhousing.org/feed/' },
{ name: 'HousingWire', url: 'https://www.housingwire.com/feed/' },
{ name: 'Law360 Construction', url: 'https://www.law360.com/construction/rss' },
{ name: 'FTC Press Releases', url: 'https://www.ftc.gov/feeds/press-release.xml' },
]

const ITEMS_PER_FEED = 10

function extractTag(xml, tag) {
const re = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>')
const m = xml.match(re)
return m ? m[1] : ''
}

function cleanText(str) {
return String(str)
.replace('<![CDATA[', '')
.replace(']]>', '')
.replace(/<[^>]*>/g, '')
.replace(/&amp;/g, '&')
.replace(/&lt;/g, '<')
.replace(/&gt;/g, '>')
.replace(/&#8217;/g, String.fromCharCode(8217))
.replace(/&#8220;/g, String.fromCharCode(8220))
.replace(/&#8221;/g, String.fromCharCode(8221))
.trim()
}

function parseRss(xml, sourceName) {
const itemMatches = xml.match(/<item[\s\S]*?<\/item>/g) || []
return itemMatches.slice(0, ITEMS_PER_FEED).map(function(itemXml) {
const rawTitle = extractTag(itemXml, 'title')
const rawLink = extractTag(itemXml, 'link')
const rawDate = extractTag(itemXml, 'pubDate')
const rawDesc = extractTag(itemXml, 'description')
const publishedAt = rawDate ? new Date(rawDate) : null
return {
source: sourceName,
title: cleanText(rawTitle).slice(0, 300),
url: cleanText(rawLink),
published_at: publishedAt && !isNaN(publishedAt) ? publishedAt.toISOString() : null,
summary: cleanText(rawDesc).slice(0, 400),
}
}).filter(function(item) { return item.title && item.url })
}

exports.handler = async function(event) {
const isScheduled = event.type === 'scheduled'
const isManualPost = event.httpMethod === 'POST'
const isGet = event.httpMethod === 'GET'

if (!isScheduled && !isManualPost && !isGet) {
return { statusCode: 405, body: 'Method Not Allowed' }
}

if (!isScheduled) {
const authHeader = event.headers && event.headers.authorization
const expectedToken = process.env.CRON_SECRET
if (expectedToken && authHeader !== 'Bearer ' + expectedToken) {
return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
}
}

const allItems = []
const results = []

for (const feed of FEEDS) {
try {
const res = await fetch(feed.url, {
headers: { 'User-Agent': 'OlusoNewsBot/1.0 (+https://oluso.co)' },
})
if (!res.ok) throw new Error('HTTP ' + res.status)
const xml = await res.text()
const items = parseRss(xml, feed.name)
allItems.push.apply(allItems, items)
results.push({ source: feed.name, ok: true, count: items.length })
} catch (err) {
console.error('fetch-industry-news: ' + feed.name + ' failed: ' + err.message)
results.push({ source: feed.name, ok: false, error: String(err.message || err) })
}
}

let upserted = 0
if (allItems.length > 0) {
const { data, error } = await supabase
.from('industry_news')
.upsert(allItems, { onConflict: 'url', ignoreDuplicates: true })
.select('id')

if (error) {
console.error('fetch-industry-news: upsert error', error)
return {
statusCode: 500,
body: JSON.stringify({ error: error.message, results: results }),
}
}
upserted = data ? data.length : 0
}

return {
statusCode: 200,
body: JSON.stringify({
success: true,
fetched: allItems.length,
upserted: upserted,
results: results,
triggered_at: new Date().toISOString(),
}),
}
}
