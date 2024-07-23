export type PropertyResolver<T, V, C> = (
  value: V | undefined,
  obj: T,
  context: C
) => Promise<V | undefined>;

export type ResolverConverter<T, C> = (
  obj: any,
  context: C
) => Promise<T | undefined>;

export type PropertyResolverMap<T, C> = {
  [key in keyof T]?:
  | PropertyResolver<T, T[key], C>
  | ReturnType<typeof virtual<T, T[key], C>>;
};

export interface ResolverOptions<T, C> {
  converter?: ResolverConverter<T, C>;
}

export interface Resolver<T, C> {
  resolve: (obj: T, context: C) => Promise<T>;
}

export function resolve<T, C>(
  properties: PropertyResolverMap<T, C>,
  options?: ResolverOptions<T, C>
): Resolver<T, C>;