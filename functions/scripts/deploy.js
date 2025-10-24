#!/usr/bin/env node
const path = require('node:path');
const { execSync } = require('node:child_process');

// Load .env configuration if present so ENV is available to this script.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const envValue = (process.env.ENV || '').trim().toLowerCase();
const projectAliasByEnv = {
  production: 'production',
  staging: 'staging',
};

if (!projectAliasByEnv[envValue]) {
  console.error(
    'Unknown ENV value. Please set ENV=staging or ENV=production before running npm run deploy.'
  );
  process.exit(1);
}

const firebaseProjectAlias = projectAliasByEnv[envValue];

try {
  execSync(`firebase deploy --only functions --project ${firebaseProjectAlias}`, {
    stdio: 'inherit',
    windowsHide: true,
  });
} catch (error) {
  if (error.status != null) {
    process.exit(error.status);
  }

  console.error('Failed to execute firebase deploy:', error);
  process.exit(1);
}
