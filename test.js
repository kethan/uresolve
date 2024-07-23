import assert from "assert";
import { resolve } from "./src/index.js";
function test(message, callback) {
  try {
    callback();
    console.log(`✅ PASS: ${message}`);
  } catch (error) {
    console.error(`❌ FAIL: ${message}`);
    console.error(error);
  }
}

resolve({
  name: (value) => value.toUpperCase(),
  age: (value) => value * 2,
  address: async (value, _, ctx) => ({
    street: value.street.toUpperCase(),
    // number: undefined,
    city: value.city.toUpperCase(),
    state: value.state.toUpperCase(),
    country: ctx.getCountry(),
  }),
  phone: ((value) => "+91 " + value.toString()),
  extra: _ => 90,
  email: () => undefined,
})
  .resolve(
    [
      {
        name: "John Doe",
        age: 20,
        address: {
          street: "Main Street",
          number: 123,
          city: "New York",
          state: "New York",
          country: "United States",
        },
        phone: "0123456789",
        email: "a@a.com",
      },
      {
        name: "Jane Doe",
        age: 30,
        address: {
          street: "Main Street",
          number: 123,
          city: "New York",
          state: "New York",
          country: "United States",
        },
        phone: "123456789",
        email: "b@b.com",
      },
    ],
    {
      getCountry: () => "India",
    }
  )
  .then(console.log)
  .catch(console.error);


const resolvers = {
  name: async () => "John",
  age: () => Promise.resolve(25),
  address: async () =>
    Promise.resolve({
      street: "123 Main St",
      city: "Example City",
      state: "CA",
      zip: "12345",
    }),
};

// Test resolve function
const resolver = resolve(resolvers);

// Test case 1
test("should resolve an object with resolvers", async () => {
  const result1 = await resolver.resolve(
    { name: "Guest", age: 30, address: null },
    {}
  );
  assert.deepStrictEqual(result1, {
    name: "John",
    age: 25,
    address: {
      street: "123 Main St",
      city: "Example City",
      state: "CA",
      zip: "12345",
    },
  });
});

// Test case 2
test('should resolve an array of objects with resolvers', async () => {
  const result2 = await resolver.resolve([
    { name: 'Guest', age: 30, address: null },
    { name: 'User', age: 40, address: null },
  ], {});
  assert.deepStrictEqual(result2, [
    {
      name: 'John',
      age: 25,
      address: {
        street: '123 Main St',
        city: 'Example City',
        state: 'CA',
        zip: '12345',
      },
    },
    {
      name: 'John',
      age: 25,
      address: {
        street: '123 Main St',
        city: 'Example City',
        state: 'CA',
        zip: '12345',
      },
    },
  ]);
});

// Test case 3
test('should apply the converter if provided', async () => {
  const converter = (item) => Promise.resolve({
    ...item,
    convertedName: item.name.toUpperCase(),
    convertedAge: item.age * 2,
  });
  const resolverWithConverter = resolve(resolvers, { converter });
  const result3 = await resolverWithConverter.resolve({ name: 'Guest', age: 30, address: null }, {});

  assert.deepStrictEqual(result3, {
    name: 'John',
    age: 25,
    address: {
      street: '123 Main St',
      city: 'Example City',
      state: 'CA',
      zip: '12345'
    },
    convertedName: 'GUEST',
    convertedAge: 60,
  });
});


const context = {
  isContext: true
}

test('simple resolver', async () => {
  const userResolver = resolve({
    password: async () => undefined,

    name: async (_value, user, ctx) => {
      assert.deepStrictEqual(ctx, context)
      return `${user.firstName} ${user.lastName}`
    }
  })

  const u = await userResolver.resolve(
    {
      firstName: 'Dave',
      lastName: 'L.'
    },
    context
  )

  assert.deepStrictEqual(u, {
    firstName: 'Dave',
    lastName: 'L.',
    name: 'Dave L.'
  })
})

test('simple resolver with virtual', async () => {
  const userResolver = resolve({
    password: async () => undefined,
    name: (async (_, user, ctx) => {
      return `${user.firstName} ${user.lastName}`
    })
  })

  const u = await userResolver.resolve(
    {
      firstName: 'Dave',
      lastName: 'L.'
    },
    context
  )

  assert.deepStrictEqual(u, {
    firstName: 'Dave',
    lastName: 'L.',
    name: 'Dave L.'
  })
})

test('simple resolver with converter', async () => {
  const userConverterResolver = resolve(
    { name: async (_name, user) => `${user.firstName} ${user.lastName}` },
    {
      converter: async (data) => ({
        firstName: 'Default',
        lastName: 'Name',
        ...data
      }),
    })

  const u = await userConverterResolver.resolve({}, context)

  assert.deepStrictEqual(u, {
    firstName: 'Default',
    lastName: 'Name',
    name: 'Default Name'
  })
})

test('resolving with errors', async () => {
  const dummyResolver = resolve({
    name: async (value) => {
      if (value === 'Dave') {
        throw new Error(`No ${value}s allowed`)
      }
      return value
    },
    age: async (value) => {
      if (value && value < 18) {
        throw new Error('Invalid age')
      }

      return value
    }
  }
  )
  assert.rejects(
    () =>
      dummyResolver.resolve(
        {
          name: 'Dave',
          age: 16
        },
        {}
      ),
    {
      message: 'error',
      data: {
        name: { message: 'No Daves allowed' },
        age: {
          message: 'Invalid age',
        }
      }
    }
  )
})

test('empty resolver returns original data', async () => {
  const resolver = resolve({})
  const data = { message: 'Hello' }
  const resolved = await resolver.resolve(data, {})
  assert.strictEqual(data, resolved)
});