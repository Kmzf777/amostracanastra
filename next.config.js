/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/webhook/pagamento', destination: '/api/webhook/pagamento' },
    ]
  },
}

export default nextConfig