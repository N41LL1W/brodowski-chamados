const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http',  hostname: '**' },
        ],
    },
};

module.exports = withPWA(nextConfig);