import '@testing-library/jest-dom';

// Mock IndexedDB for tests
global.indexedDB = require('fake-indexeddb');
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
global.IDBCursor = require('fake-indexeddb/lib/FDBCursor');
