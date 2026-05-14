/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
    reactCompiler: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http',  hostname: '**' },
        ],
    },
};

module.exports = nextConfig;