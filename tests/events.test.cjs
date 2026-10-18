const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, overrides = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', source)((name) => overrides[name] ?? require(name), compiled, compiled.exports);
  return compiled.exports;
}
const shared = load('lib/events/shared.ts');
const auth = load('lib/auth/server.ts', { 'next/headers': {} });
const api = load('lib/events/server.ts', { '@/lib/auth/server': auth, './shared': shared });
const originalFetch = global.fetch;
const originalBase = process.env.AUTH_API_BASE_URL;
afterEach(() => { global.fetch = originalFetch; if (originalBase === undefined) delete process.env.AUTH_API_BASE_URL; else process.env.AUTH_API_BASE_URL = originalBase; });
const event = {
  id: 41, title: 'AI Workshop', slug: 'ai-workshop', chapter: 'CS', description: 'Learn AI',
  cover_image: '/images/ai.jpg', start_date: '2026-12-01T20:00:00.000000Z', end_date: '2026-12-01T22:00:00.000000Z',
  mode: 'PHYSICAL', venue: 'Auditorium', contact_email: null, contact_phone: null, status: 'PUBLISHED',
  is_registration_open: true, is_oc_open: false, max_participants: 100,
};
const page = (data = [event]) => ({ data, current_page: 2, last_page: 3, per_page: 12, total: 25, from: data.length ? 13 : null, to: data.length ? 13 : null });
test('public listing uses environment URL and documented filters without credentials or body', async () => {
  process.env.AUTH_API_BASE_URL = 'https://backend.example.test/v2/api/';
  global.fetch = async (url, options) => {
    const actual = new URL(url);
    assert.equal(actual.origin + actual.pathname, 'https://backend.example.test/v2/api/public/events');
    assert.deepEqual(Object.fromEntries(actual.searchParams), { timeframe: 'past', page: '2', per_page: '12', chapter: 'CS', search: 'AI & web' });
    assert.equal(options.method, 'GET'); assert.deepEqual(options.headers, { Accept: 'application/json' });
    assert.equal(options.body, undefined); assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error');
    return Response.json(page());
  };
  const filters = shared.eventFilters({ chapter: 'cs', search: ' AI & web ', timeframe: 'past', page: '2' });
  const result = await api.loadPublicEvents(filters);
  assert.equal(result.total, 25); assert.equal(result.data[0].id, 41);
  const next = new URLSearchParams(shared.eventQuery({ ...filters, page: 3 }));
  assert.equal(next.get('search'), 'AI & web'); assert.equal(next.get('chapter'), 'CS'); assert.equal(next.get('page'), '3');
});
test('filter validation rejects malformed queries before network calls', async () => {
  const invalid = [{ chapter: 'OTHER' }, { timeframe: 'draft' }, { page: '0' }, { page: '1.5' }, { page: '9007199254740992' }, { per_page: '1000' }, { search: 'a'.repeat(256) }, { chapter: ['CS', 'WIE'] }];
  for (const value of invalid) assert.throws(() => shared.eventFilters(value));
  assert.deepEqual(shared.eventFilters({}), { chapter: '', timeframe: 'upcoming', search: '', page: 1, per_page: 12 });
  global.fetch = () => { assert.fail('invalid input must not request backend'); };
  await assert.rejects(api.loadPublicEvents({ ...shared.eventFilters({}), page: -1 }));
});
test('event detail accepts slug and numeric identifiers, preserves 404 and rejects path injection', async () => {
  process.env.AUTH_API_BASE_URL = 'https://backend.example.test/api';
  const paths = [];
  global.fetch = async (url) => { paths.push(new URL(url).pathname); return Response.json(event); };
  assert.equal((await api.loadPublicEvent('ai-workshop')).slug, 'ai-workshop');
  await api.loadPublicEvent('41');
  assert.deepEqual(paths, ['/api/public/events/ai-workshop', '/api/public/events/41']);
  for (const slug of ['../auth/me', '..', '.', 'x?draft=1', 'x#test', '', 'x\\y']) await assert.rejects(api.loadPublicEvent(slug), (error) => error.status === 404);
  global.fetch = async () => Response.json({ message: 'model internals' }, { status: 404 });
  await assert.rejects(api.loadPublicEvent('missing'), (error) => error.status === 404 && !error.message.includes('internals'));
});
test('malformed or unpublished event data is rejected', () => {
  for (const changes of [{ status: 'DRAFT' }, { id: 0 }, { mode: 'VIRTUAL' }, { chapter: 'OTHER' }, { start_date: 'invalid' }, { start_date: '2026-12-01T20:00:00' }, { end_date: '2020-01-01T00:00:00Z' }, { is_registration_open: 'true' }, { max_participants: -1 }, { slug: '../test' }]) assert.throws(() => shared.parsePublicEvent({ ...event, ...changes }));
  assert.equal(shared.parsePublicEvent({ ...event, description: null, cover_image: null }).id, 41);
  assert.throws(() => shared.parseEventPage({ ...page(), data: 'invalid' }, 2));
  assert.throws(() => shared.parseEventPage(page(), 1));
  assert.throws(() => shared.parseEventPage({ ...page(), total: -1 }, 2));
  assert.deepEqual(shared.parseEventPage(page([]), 2).data, []);
});
test('date presentation uses Sri Lanka time across midnight and covers resolve safely', () => {
  const card = shared.eventCard(event, '/cover.jpg');
  assert.equal(card.day, '02'); assert.equal(card.month, 'Dec 2026'); assert.match(shared.eventDate(event.start_date), /01:30/);
  const base = 'https://backend.example.test/api';
  assert.equal(shared.eventCover('/images/ai.jpg', base), 'https://backend.example.test/images/ai.jpg');
  assert.equal(shared.eventCover('images/ai.jpg', base), 'https://backend.example.test/images/ai.jpg');
  assert.equal(shared.eventCover('https://cdn.example.test/ai.jpg', base), 'https://cdn.example.test/ai.jpg');
  for (const image of [null, '', 'javascript:alert(1)', 'data:image/svg+xml,test', '//untrusted.example/image', 'https://user:pass@example.test/a']) assert.equal(shared.eventCover(image, base), '/photos/robotics-arm.jpg');
});
test('missing or unsafe base configuration never falls back to a hardcoded host', async () => {
  global.fetch = () => { assert.fail('invalid config must not request backend'); };
  for (const value of ['', 'file:///api', 'https://user:pass@example.test/api', 'https://example.test/api?secret=x']) {
    process.env.AUTH_API_BASE_URL = value;
    await assert.rejects(api.loadPublicEvent('ai'), (error) => error.status === 502);
  }
  delete process.env.AUTH_API_BASE_URL;
  await assert.rejects(api.loadPublicEvent('ai'), (error) => error.status === 502);
});
test('service failures and invalid JSON give safe errors, not backend details', async () => {
  process.env.AUTH_API_BASE_URL = 'https://backend.example.test/api';
  global.fetch = async () => { throw new Error('internal address'); };
  await assert.rejects(api.loadPublicEvent('ai'), (error) => error.status === 502 && !error.message.includes('internal'));
  global.fetch = async () => new Response('not json');
  await assert.rejects(api.loadPublicEvent('ai'), (error) => error.status === 502);
  global.fetch = async () => Response.json({ message: 'database credentials' }, { status: 500 });
  await assert.rejects(api.loadPublicEvent('ai'), (error) => error.status === 500 && !error.message.includes('database'));
});

test('listing renders live cards, preserves filter links, and escapes backend text', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const ui = load('components/sections/landing/event-cards.tsx', {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './heading': { SectionHeading: ({ title }) => React.createElement('h2', null, title) },
    '@/components/sections/event-card': { EventCard: ({ event }) => React.createElement('a', { href: '/events/' + event.slug }, event.title) },
    '@/lib/events/shared': shared,
    '@/lib/events/server': { loadPublicEvents: async () => page([{ ...event, title: '<script>alert(1)</script>' }]), publicEventCover: () => '/cover.jpg' },
  });
  const html = renderToStaticMarkup(await ui.LandingEventCards({ searchParams: { page: '2', chapter: 'CS', search: 'AI' } }));
  assert.ok(html.includes('/events/ai-workshop'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html, /page=3[^"]*chapter=CS[^"]*search=AI/);
  assert.ok(html.includes('of 25 events'));
});
test('invalid list filters render a reset action and never call backend', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const ui = load('components/sections/landing/event-cards.tsx', {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './heading': {}, '@/components/sections/event-card': {}, '@/lib/events/shared': shared,
    '@/lib/events/server': { loadPublicEvents: () => assert.fail('should not fetch invalid filters') },
  });
  const html = renderToStaticMarkup(await ui.LandingEventCards({ searchParams: { page: '-1' } }));
  assert.ok(html.includes('role="alert"')); assert.ok(html.includes('Reset filters'));
});

test('create cover picker exposes Choose image before any preview and edit exposes Replace image', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const cover = load('lib/events/cover.ts');
  const picker = load('components/admin/event-cover-picker.tsx', {
    '@/components/sections/event-image': { EventImage: (props) => React.createElement('img', props) },
    '@/lib/events/cover': cover,
  });
  const props = { existingUrl: null, value: { file: null, remove: false }, onChange: () => {}, disabled: false, onValidating: () => {} };
  const create = renderToStaticMarkup(React.createElement(picker.EventCoverPicker, props));
  assert.ok(create.includes('Choose image')); assert.ok(create.includes('type="file"'));
  assert.ok(create.includes('accept="image/jpeg,image/png,image/webp"'));
  assert.ok(create.includes('No image selected')); assert.ok(!create.includes('<img'));
  const edit = renderToStaticMarkup(React.createElement(picker.EventCoverPicker, { ...props, existingUrl: 'https://cdn.example.test/cover.png' }));
  assert.ok(edit.includes('Replace image')); assert.ok(edit.indexOf('Replace image') < edit.indexOf('<img'));
});

function landingEvents(server) {
  const React = require('react');
  return load('components/sections/landing/events.tsx', {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './heading': { SectionHeading: ({ title, lede }) => React.createElement('header', null, React.createElement('h2', null, title), React.createElement('p', null, lede)) },
    './styles': load('components/sections/landing/styles.ts'),
    '@/components/sections/event-image': { EventImage: (props) => React.createElement('img', props) },
    '@/lib/events/shared': shared,
    '@/lib/events/server': server,
  });
}
test('homepage requests upcoming published events and displays returned cover thumbnails within existing rows', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  process.env.AUTH_API_BASE_URL = 'https://backend.example.test/api';
  const url = 'https://cdn.example.test/storage/events/covers/41/cover.webp';
  global.fetch = async (input, options) => {
    const request = new URL(input);
    assert.equal(request.pathname, '/api/public/events');
    assert.equal(request.searchParams.get('timeframe'), 'upcoming');
    assert.equal(request.searchParams.get('per_page'), '3');
    assert.equal(request.searchParams.get('page'), '1');
    assert.deepEqual(options.headers, { Accept: 'application/json' });
    return Response.json({ ...page([{ ...event, title: '<Test event>', cover_image: 'events/covers/41/cover.webp', cover_image_url: url }]), current_page: 1, total: 4, per_page: 3 });
  };
  const html = renderToStaticMarkup(await landingEvents(api).LandingEvents());
  assert.ok(html.includes('id="events"')); assert.ok(html.includes('Upcoming events'));
  assert.ok(html.includes('href="/events/ai-workshop"')); assert.ok(html.includes('&lt;Test event&gt;'));
  assert.ok(html.includes('src="' + url + '"')); assert.ok(html.includes('width="96"')); assert.ok(html.includes('height="64"'));
  assert.ok(html.includes('hidden h-16 w-24')); assert.ok(html.includes('md:block'));
  assert.ok(html.includes('See all events')); assert.ok(html.includes('href="/events?timeframe=all"'));
  assert.ok(html.includes('02')); assert.ok(html.includes('Dec 2026'));
});
test('homepage preserves event section for empty, loading and failed API states without demo rows', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const empty = landingEvents({ loadPublicEvents: async () => ({ data: [], total: 0 }), publicEventCover: () => '/fallback.jpg' });
  const emptyHtml = renderToStaticMarkup(await empty.LandingEvents());
  assert.ok(emptyHtml.includes('No upcoming events are published yet.')); assert.ok(!emptyHtml.includes('<img'));
  const failed = landingEvents({ loadPublicEvents: async () => { throw Error('private infrastructure details'); } });
  const failedHtml = renderToStaticMarkup(await failed.LandingEvents());
  assert.ok(failedHtml.includes('Upcoming events are temporarily unavailable.')); assert.ok(!failedHtml.includes('private infrastructure'));
  assert.ok(failedHtml.includes('href="/events"')); assert.ok(failedHtml.includes('id="events"'));
  const loadingHtml = renderToStaticMarkup(failed.LandingEventsLoading());
  assert.ok(loadingHtml.includes('role="status"')); assert.ok(loadingHtml.includes('Upcoming events'));
});
test('homepage missing cover uses the shared local placeholder', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  process.env.AUTH_API_BASE_URL = 'https://backend.example.test/api';
  const component = landingEvents({ loadPublicEvents: async () => ({ data: [{ ...event, cover_image: null, cover_image_url: null }], total: 1 }), publicEventCover: api.publicEventCover });
  const html = renderToStaticMarkup(await component.LandingEvents());
  assert.ok(html.includes('src="/photos/robotics-arm.jpg"'));
  assert.ok(html.includes('See all events')); assert.ok(html.includes('href="/events?timeframe=all"'));
});
