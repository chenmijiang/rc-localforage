/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  gitUrl: 'git@github.com:chenmijiang/rc-localforage.git',
  branches: [
    'main',
    {
      name: 'dev',
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
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json']
      }
    ]
  ],
  ci: false
};
