export default {
  // استخدام swc-jest كمعالج لملفات .ts
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
  },
  
  // ... بقية الإعدادات كما هي ...
  testEnvironment: 'node', 
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['js', 'ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
};