# Resolve Function

## Overview

The `resolve` function is a utility designed to process and resolve fields of an object or an array of objects. It allows you to define custom resolvers for specific fields and provides an option to convert objects before resolving them. This function is useful for transforming data structures in a flexible and modular way.

## Installation

To use the `resolve` function in your project, simply import it from your module:

```javascript
import { resolve } from 'uresolve';
```

## Usage

### Basic Usage

To use the `resolve` function, you need to define a set of resolvers for the fields you want to process. Each resolver is an asynchronous function that receives the field's value, the entire object being resolved, and the context. The `resolve` function returns a resolver object with a `resolve` method.

```javascript
const resolvers = {
  name: async (value) => value.toUpperCase(),
  age: async (value) => value + 1
};

const resolver = resolve(resolvers);

const data = { name: 'Alice', age: 30 };

resolver.resolve(data, {}).then((resolved) => {
  console.log(resolved); // Output: { name: 'ALICE', age: 31 }
});
```

### Using the Converter Option

You can provide a `converter` function in the options to transform objects before resolving them. The `converter` function receives the object and the context as arguments.

```javascript
const converter = (data) => ({ ...data, converted: true });

const resolvers = {
  name: async (value) => value.toUpperCase()
};

const resolver = resolve(resolvers, { converter });

const data = { name: 'Alice' };

resolver.resolve(data, {}).then((resolved) => {
  console.log(resolved); // Output: { name: 'ALICE', converted: true }
});
```

### Handling Nested Resolvers

The `resolve` function can handle nested objects by defining nested resolvers.

```javascript
const resolvers = {
  name: async (value) => value.toUpperCase(),
  address: resolve({
    city: async (value) => value.toUpperCase()
  }).resolve
};

const data = { name: 'Bob', address: { city: 'san francisco' } };

resolver.resolve(data, {}).then((resolved) => {
  console.log(resolved); // Output: { name: 'BOB', address: { city: 'SAN FRANCISCO' } }
});
```

### Array Conversion

The `resolve` function can process arrays of objects.

```javascript
const converter = (data) => {
  if (Array.isArray(data.items)) {
    data.items = data.items.map((item) => ({ ...item, converted: true }));
  }
  return data;
};

const resolvers = {
  items: async (value) => value
};

const resolver = resolve(resolvers, { converter });

const data = {
  items: [
    { name: 'item1', price: 10 },
    { name: 'item2', price: 20 }
  ]
};

resolver.resolve(data, {}).then((resolved) => {
  console.log(resolved); 
  // Output: { items: [{ name: 'item1', price: 10, converted: true }, { name: 'item2', price: 20, converted: true }] }
});
```

### Error Handling in Converter

If the `converter` function throws an error, it will be caught and handled appropriately.

```javascript
const converter = (data) => {
  if (data.name === 'Dave') {
    throw new Error('Conversion error');
  }
  return data;
};

const resolvers = {
  name: async (value) => value.toUpperCase()
};

const resolver = resolve(resolvers, { converter });

resolver.resolve({ name: 'Dave' }, {}).catch((err) => {
  console.error(err.message); // Output: Conversion error
});
```

## API

### `resolve(resolvers, options)`

#### Parameters
- `resolvers` (Object): An object where each key is a field name and each value is an asynchronous resolver function.
- `options` (Object): Optional settings.
  - `converter` (Function): A function to convert objects before resolving. Receives the object and context as arguments.

#### Returns
An object with a `resolve` method.

### `resolve.resolve(obj, context)`

#### Parameters
- `obj` (Object|Array): The object or array of objects to resolve.
- `context` (Object): An optional context object passed to resolver functions.

#### Returns
A Promise that resolves to the transformed object or array of objects.

## Example

```javascript
const converter = (data) => ({ ...data, converted: true });

const resolvers = {
  name: async (value) => value.toUpperCase(),
  age: async (value) => value + 1
};

const resolver = resolve(resolvers, { converter });

const data = { name: 'Alice', age: 30 };

resolver.resolve(data, {}).then((resolved) => {
  console.log(resolved); // Output: { name: 'ALICE', age: 31, converted: true }
});
```

## License

This project is licensed under the MIT License.
