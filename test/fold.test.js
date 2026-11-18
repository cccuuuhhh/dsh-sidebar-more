import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const clientSource = readFileSync(join(root, 'client.js'), 'utf8')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

/**
 * The plugin ships one stylesheet rule. These checks pin the two properties
 * that make it safe: it is scoped to the panel list by the More launcher, and
 * it hides only the children that do not hold that launcher.
 */
test('fold rule is scoped by the More launcher', () => {
  const rule = clientSource.match(/'nav:has\([^']*'/)
  assert.ok(rule, 'client.js must carry a nav:has(...) scoping rule')
  assert.match(rule[0], /button\[aria-haspopup="menu"\]/)
})

test('fold rule hides non-launcher children only', () => {
  assert.match(
    clientSource,
    /> :not\(:has\(button\[aria-haspopup="menu"\]\)\)/,
    'the hidden selector must exclude any child holding the More launcher',
  )
  assert.match(clientSource, /display:none!important/)
})

test('the rule does not key on hashed CSS-module class names', () => {
  const rule = clientSource.match(/'nav:has\([^']*'/)
  assert.ok(rule)
  // Hashed module classes look like `wtg9ga_panelRow`: a hash segment plus an
  // underscore. The rule must not depend on them.
  assert.doesNotMatch(rule[0], /[a-z0-9]{5,}_[a-zA-Z]/)
})

test('manifest declares an installable bundle', () => {
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.ok(
    manifest.files.includes('cordis.patch.yml'),
    'the patch must ship in the published files',
  )
  assert.ok(manifest.files.includes('locale/*.json'))
  assert.ok(manifest.files.includes('icon.svg'))
})

test('manifest is publishable and scopes peers to 0.2.x prereleases', () => {
  assert.notEqual(manifest.private, true, 'a publishable package is not private')
  assert.equal(manifest.repository.url, 'git+https://github.com/cccuuuhhh/dsh-sidebar-more.git')
  for (const range of Object.values(manifest.peerDependencies)) {
    if (range.includes('<0.3.0-0')) {
      assert.match(
        range,
        /\|\|/,
        `peer range ${range} needs an explicit prerelease branch, or it silently excludes every prerelease build`,
      )
    }
  }
})

test('client registers the panel menu slot', () => {
  assert.match(clientSource, /sidebar\.panellist\.actions/)
  assert.match(clientSource, /id:\s*"sidebar-more-panels"/)
})
