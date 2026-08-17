import assert from 'node:assert/strict'
import test from 'node:test'

import {
  YOUTUBE_ATOM_URL,
  YOUTUBE_CHANNEL_ID,
  hasMeaningfulChanges,
  parseYoutubeAtom,
} from '../scripts/sync-youtube-atom.mjs'

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Aceserver</title>
  <yt:channelId>UCRd3wlD5zemJ7Q9C1SZoEDw</yt:channelId>
  <entry>
    <title><![CDATA[Newest &amp; best]]></title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=newest" />
    <author><name>Aceserver</name></author>
    <published>2026-08-17T00:00:00+00:00</published>
    <yt:videoId>newest</yt:videoId>
    <media:group>
      <media:description>Newest description</media:description>
      <media:thumbnail url="https://i.ytimg.com/vi/newest/hqdefault.jpg" />
    </media:group>
  </entry>
  <entry>
    <title>Older video</title>
    <link href="https://www.youtube.com/watch?v=older" rel="alternate" />
    <published>2026-08-16T00:00:00+00:00</published>
    <yt:videoId>older</yt:videoId>
  </entry>
</feed>`

test('parses and orders the official YouTube Atom feed', () => {
  const snapshot = parseYoutubeAtom(atom, {
    now: () => '2026-08-17T01:02:03.000Z',
  })

  assert.equal(snapshot.source, 'youtube-atom')
  assert.equal(snapshot.feedUrl, YOUTUBE_ATOM_URL)
  assert.equal(snapshot.syncedAt, '2026-08-17T01:02:03.000Z')
  assert.deepEqual(
    snapshot.videos.map((video) => video.videoId),
    ['newest', 'older'],
  )
  assert.equal(snapshot.videos[0].title, 'Newest & best')
  assert.equal(snapshot.videos[0].description, 'Newest description')
  assert.equal(
    snapshot.videos[1].thumbnailUrl,
    'https://i.ytimg.com/vi/older/hqdefault.jpg',
  )
})

test('rejects a feed from another channel', () => {
  assert.throws(
    () =>
      parseYoutubeAtom(atom.replace('UCRd3wlD5zemJ7Q9C1SZoEDw', 'different')),
    /different channel/,
  )
})

test('accepts the Atom root channel ID without the UC prefix', () => {
  const snapshot = parseYoutubeAtom(
    atom.replace('UCRd3wlD5zemJ7Q9C1SZoEDw', 'Rd3wlD5zemJ7Q9C1SZoEDw'),
  )

  assert.equal(snapshot.channelId, YOUTUBE_CHANNEL_ID)
})

test('ignores sync timestamps when deciding whether to create a snapshot commit', () => {
  const current = parseYoutubeAtom(atom, {
    now: () => '2026-08-17T01:02:03.000Z',
  })
  const sameContent = parseYoutubeAtom(atom, {
    now: () => '2026-08-17T07:02:03.000Z',
  })
  const changedContent = structuredClone(sameContent)
  changedContent.videos[0].title = 'Updated title'

  assert.equal(hasMeaningfulChanges(current, sameContent), false)
  assert.equal(hasMeaningfulChanges(current, changedContent), true)
})
