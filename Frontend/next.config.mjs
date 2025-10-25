    /** @type {import('next').NextConfig} */
    const nextConfig = {
      
      async rewrites() {
        return [
          // --- Python API Proxy Rules ---
          // These rules must be IN THIS ORDER.
          // Most specific routes first.

          // 1. Quiz Submit (Most specific)
          {
            source: '/api/questionnaire/submit',
            destination: 'http://localhost:5000/api/questionnaire/submit',
          },
          // 2. Quiz Fetch (Dynamic)
          {
            source: '/api/questionnaire/:path*',
            destination: 'http://localhost:5000/api/questionnaire/:path*',
          },
          // 3. Monitor Page
          {
            source: '/api/monitor',
            destination: 'http://localhost:5000/api/monitor',
          },
          // 4. Dashboard Analytics
          {
            source: '/api/analytics',
            destination: 'http://localhost:5000/api/analytics',
          },
          // 5. Dashboard Joke
          {
            source: '/api/joke',
            destination: 'http://localhost:5000/api/joke',
          },
          // 6. Dashboard Fact
          {
            source: '/api/fact',
            destination: 'http://localhost:5000/api/fact',
          },
          
          // Any other route starting with /api/ (like /api/auth/...)
          // will NOT be matched and will be handled by Next.js.
        ];
      },
      
    };

    export default nextConfig;
    
