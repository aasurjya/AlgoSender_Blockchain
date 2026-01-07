/**
 * Application configuration
 * This centralizes all environment variables and configuration settings
 */

// MongoDB Configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algosender';

// Algorand Configuration
export const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
export const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
export const ALGOD_PORT = process.env.ALGOD_PORT || '';

// Application Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// API Configuration
export const API_BASE_URL = IS_PRODUCTION ? '/api' : 'http://localhost:3000/api';

/**
 * Instructions for setting up environment variables on Vercel:
 * 
 * Required Variables:
 * - MONGODB_URI: Your MongoDB connection string
 *   Format: mongodb+srv://username:password@cluster.mongodb.net/dbname
 * 
 * Optional Variables:
 * - ALGOD_SERVER: Algorand node server (defaults to TestNet)
 * - ALGOD_TOKEN: Algorand API token
 * - ALGOD_PORT: Algorand API port
 */
