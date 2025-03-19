/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  gitUrl: 'git@github.com:chenmijiang/rc-localforage.git',
  branches: [
    'main',
    {
      name: 'test',
      prerelease: 'alpha'
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json']
      }
    ]
  ],
  ci: false
};
