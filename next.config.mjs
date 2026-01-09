/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Применяем CORS ко всем API Actions
                source: "/api/actions/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Content-Encoding, x-accept-sdk-version, x-accept-blockchain-ids, x-action-version, x-blockchain-ids" },
                    { key: "Access-Control-Expose-Headers", value: "x-action-version, x-blockchain-ids" },
                ],
            },
        ];
    },
};

export default nextConfig;
