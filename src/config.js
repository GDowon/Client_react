

// src/config.js

// API base URL for connecting to the backend server
// Change this URL when deploying to a production environment.
export const API_BASE_URL = 'http://localhost:8000'; 
export const BASE_URL = 'https://mungo.n-e.kr/';

// Key names for storing authentication tokens in localStorage
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

// Default timeout for API requests (in milliseconds)
export const API_TIMEOUT_MS = 10000;

// Application version
export const APP_VERSION = '1.0.0';