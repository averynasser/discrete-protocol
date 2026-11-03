import type { NextConfig } from 'next';

// GitHub Pages serves project sites below /<repository-name>.
// GITHUB_REPOSITORY is available in Actions; local/Vercel builds stay at /.
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const basePath = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}` : '';

const config: NextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
