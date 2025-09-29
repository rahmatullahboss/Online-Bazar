const { StackClientApp } = require('@stackframe/stack');

// Create a simple test to see what methods are available
const app = new StackClientApp({
  projectId: 'test',
  publishableClientKey: 'test'
});

console.log('Available methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(name => !name.startsWith('_')));