module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/api/health'
      ],
      startServerCommand: 'npm run build && npm start',
      startServerReadyPattern: 'ready on',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
        skipAudits: [
          'uses-http2',
          'redirects-http'
        ]
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['off']
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};