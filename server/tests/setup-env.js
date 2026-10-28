// Loaded via `node --import` before the test files so ENV (read at import time) sees NODE_ENV=test.
// This enables test-only behaviour such as mock Google ID tokens.
process.env.NODE_ENV = 'test';
