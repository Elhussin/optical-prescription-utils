// // jest.config.js

// /** @type {import('ts-jest').JestConfigWithTsJest} */
// export default {
//   // استخدام ts-jest كمعالج لملفات .ts
//   preset: 'ts-jest', 
  
//   // تحديد بيئة العمل كـ nodejs
//   testEnvironment: 'node', 
  
//   // أنماط الملفات التي يجب اختبارها
//   testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'], 
  
//   // معالجة وحدات ES (ضروري لوجود "type": "module")
//   moduleFileExtensions: ['js', 'ts'],
  
//   // تحديد مسار ملفات الاختبار
//   roots: ['<rootDir>/src', '<rootDir>/test'],
// };

// jest.config.js (باستخدام SWC)

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