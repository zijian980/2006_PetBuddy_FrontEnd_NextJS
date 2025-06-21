/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/signout',
          permanent: true,
        },
      ];
    },
    images: {
      domains: ['img.evbuc.com'],
    },
  };
  
  export default nextConfig;