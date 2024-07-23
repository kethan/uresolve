const resolve = (resolvers, options = {}) => ({
  resolve: async (obj, context) => {
    if (Object.keys(resolvers).length === 0) return obj;

    const handleResolution = async (field, value, resolverObj, errors) => {
      try {
        const resolvedValue = await resolvers[field](value, resolverObj, context);
        return resolvedValue !== undefined ? { [field]: resolvedValue } : {};
      } catch (error) {
        errors[field] = { message: error.message };
        return {};
      }
    };

    const processResolver = async (resolverObj) => {
      const errors = {};
      let resolvedFields = {};
      resolverObj = await (options.converter ? options.converter(resolverObj, context) : resolverObj);
      const fieldsToResolve = new Set([...Object.keys(resolverObj), ...Object.keys(resolvers)]);

      await Promise.all(
        Array.from(fieldsToResolve).map(async (field) => {
          const value = resolverObj[field] !== undefined ? resolverObj[field] : null;
          const resolvedEntry = resolvers[field]
            ? await handleResolution(field, value, resolverObj, errors)
            : { [field]: value };
          resolvedFields = { ...resolvedFields, ...resolvedEntry };
        })
      );

      if (Object.keys(errors).length) {
        const err = new Error('error');
        err.data = errors;
        throw err;
      }

      return resolvedFields;
    };

    return Array.isArray(obj) ? Promise.all(obj.map(processResolver)) : processResolver(obj);
  }
});

const virtual = (resolver) => (_, obj, context) => resolver(obj, context);

export { resolve, virtual }