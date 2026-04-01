/**
 * Client
 **/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Session
 *
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>;
/**
 * Model OTPs
 *
 */
export type OTPs = $Result.DefaultSelection<Prisma.$OTPsPayload>;
/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model WorkerInfo
 *
 */
export type WorkerInfo = $Result.DefaultSelection<Prisma.$WorkerInfoPayload>;
/**
 * Model SpecializationsForWorkers
 *
 */
export type SpecializationsForWorkers =
  $Result.DefaultSelection<Prisma.$SpecializationsForWorkersPayload>;
/**
 * Model Specialization
 *
 */
export type Specialization = $Result.DefaultSelection<Prisma.$SpecializationPayload>;
/**
 * Model Goverment
 *
 */
export type Goverment = $Result.DefaultSelection<Prisma.$GovermentPayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const AccountStatus: {
    INCOMPLETE: 'INCOMPLETE';
    ACTIVE: 'ACTIVE';
    SUSPENDED: 'SUSPENDED';
    BANNED: 'BANNED';
  };

  export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

  export const Role: {
    WORKER: 'WORKER';
    CLIENT: 'CLIENT';
    ADMIN: 'ADMIN';
  };

  export type Role = (typeof Role)[keyof typeof Role];
}

export type AccountStatus = $Enums.AccountStatus;

export const AccountStatus: typeof $Enums.AccountStatus;

export type Role = $Enums.Role;

export const Role: typeof $Enums.Role;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Sessions
 * const sessions = await prisma.session.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Sessions
   * const sessions = await prisma.session.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Sessions
   * const sessions = await prisma.session.findMany()
   * ```
   */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.oTPs`: Exposes CRUD operations for the **OTPs** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more OTPs
   * const oTPs = await prisma.oTPs.findMany()
   * ```
   */
  get oTPs(): Prisma.OTPsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workerInfo`: Exposes CRUD operations for the **WorkerInfo** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more WorkerInfos
   * const workerInfos = await prisma.workerInfo.findMany()
   * ```
   */
  get workerInfo(): Prisma.WorkerInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.specializationsForWorkers`: Exposes CRUD operations for the **SpecializationsForWorkers** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more SpecializationsForWorkers
   * const specializationsForWorkers = await prisma.specializationsForWorkers.findMany()
   * ```
   */
  get specializationsForWorkers(): Prisma.SpecializationsForWorkersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.specialization`: Exposes CRUD operations for the **Specialization** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Specializations
   * const specializations = await prisma.specialization.findMany()
   * ```
   */
  get specialization(): Prisma.SpecializationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.goverment`: Exposes CRUD operations for the **Goverment** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Goverments
   * const goverments = await prisma.goverment.findMany()
   * ```
   */
  get goverment(): Prisma.GovermentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 7.4.0
   * Query Engine version: ab56fe763f921d033a6c195e7ddeb3e255bdbb57
   */
  export type PrismaVersion = {
    client: string;
    engine: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Session: 'Session';
    OTPs: 'OTPs';
    User: 'User';
    WorkerInfo: 'WorkerInfo';
    SpecializationsForWorkers: 'SpecializationsForWorkers';
    Specialization: 'Specialization';
    Goverment: 'Goverment';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps:
        | 'session'
        | 'oTPs'
        | 'user'
        | 'workerInfo'
        | 'specializationsForWorkers'
        | 'specialization'
        | 'goverment';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>;
        fields: Prisma.SessionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[];
          };
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[];
          };
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[];
          };
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>;
          };
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSession>;
          };
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SessionGroupByOutputType>[];
          };
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>;
            result: $Utils.Optional<SessionCountAggregateOutputType> | number;
          };
        };
      };
      OTPs: {
        payload: Prisma.$OTPsPayload<ExtArgs>;
        fields: Prisma.OTPsFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.OTPsFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.OTPsFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          findFirst: {
            args: Prisma.OTPsFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.OTPsFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          findMany: {
            args: Prisma.OTPsFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>[];
          };
          create: {
            args: Prisma.OTPsCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          createMany: {
            args: Prisma.OTPsCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.OTPsCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>[];
          };
          delete: {
            args: Prisma.OTPsDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          update: {
            args: Prisma.OTPsUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          deleteMany: {
            args: Prisma.OTPsDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.OTPsUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.OTPsUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>[];
          };
          upsert: {
            args: Prisma.OTPsUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OTPsPayload>;
          };
          aggregate: {
            args: Prisma.OTPsAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateOTPs>;
          };
          groupBy: {
            args: Prisma.OTPsGroupByArgs<ExtArgs>;
            result: $Utils.Optional<OTPsGroupByOutputType>[];
          };
          count: {
            args: Prisma.OTPsCountArgs<ExtArgs>;
            result: $Utils.Optional<OTPsCountAggregateOutputType> | number;
          };
        };
      };
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      WorkerInfo: {
        payload: Prisma.$WorkerInfoPayload<ExtArgs>;
        fields: Prisma.WorkerInfoFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WorkerInfoFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WorkerInfoFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          findFirst: {
            args: Prisma.WorkerInfoFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WorkerInfoFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          findMany: {
            args: Prisma.WorkerInfoFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>[];
          };
          create: {
            args: Prisma.WorkerInfoCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          createMany: {
            args: Prisma.WorkerInfoCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WorkerInfoCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>[];
          };
          delete: {
            args: Prisma.WorkerInfoDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          update: {
            args: Prisma.WorkerInfoUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          deleteMany: {
            args: Prisma.WorkerInfoDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WorkerInfoUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.WorkerInfoUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>[];
          };
          upsert: {
            args: Prisma.WorkerInfoUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkerInfoPayload>;
          };
          aggregate: {
            args: Prisma.WorkerInfoAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWorkerInfo>;
          };
          groupBy: {
            args: Prisma.WorkerInfoGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WorkerInfoGroupByOutputType>[];
          };
          count: {
            args: Prisma.WorkerInfoCountArgs<ExtArgs>;
            result: $Utils.Optional<WorkerInfoCountAggregateOutputType> | number;
          };
        };
      };
      SpecializationsForWorkers: {
        payload: Prisma.$SpecializationsForWorkersPayload<ExtArgs>;
        fields: Prisma.SpecializationsForWorkersFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SpecializationsForWorkersFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SpecializationsForWorkersFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          findFirst: {
            args: Prisma.SpecializationsForWorkersFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SpecializationsForWorkersFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          findMany: {
            args: Prisma.SpecializationsForWorkersFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>[];
          };
          create: {
            args: Prisma.SpecializationsForWorkersCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          createMany: {
            args: Prisma.SpecializationsForWorkersCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SpecializationsForWorkersCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>[];
          };
          delete: {
            args: Prisma.SpecializationsForWorkersDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          update: {
            args: Prisma.SpecializationsForWorkersUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          deleteMany: {
            args: Prisma.SpecializationsForWorkersDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SpecializationsForWorkersUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SpecializationsForWorkersUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>[];
          };
          upsert: {
            args: Prisma.SpecializationsForWorkersUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationsForWorkersPayload>;
          };
          aggregate: {
            args: Prisma.SpecializationsForWorkersAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSpecializationsForWorkers>;
          };
          groupBy: {
            args: Prisma.SpecializationsForWorkersGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SpecializationsForWorkersGroupByOutputType>[];
          };
          count: {
            args: Prisma.SpecializationsForWorkersCountArgs<ExtArgs>;
            result: $Utils.Optional<SpecializationsForWorkersCountAggregateOutputType> | number;
          };
        };
      };
      Specialization: {
        payload: Prisma.$SpecializationPayload<ExtArgs>;
        fields: Prisma.SpecializationFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SpecializationFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SpecializationFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          findFirst: {
            args: Prisma.SpecializationFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SpecializationFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          findMany: {
            args: Prisma.SpecializationFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>[];
          };
          create: {
            args: Prisma.SpecializationCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          createMany: {
            args: Prisma.SpecializationCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SpecializationCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>[];
          };
          delete: {
            args: Prisma.SpecializationDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          update: {
            args: Prisma.SpecializationUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          deleteMany: {
            args: Prisma.SpecializationDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SpecializationUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SpecializationUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>[];
          };
          upsert: {
            args: Prisma.SpecializationUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SpecializationPayload>;
          };
          aggregate: {
            args: Prisma.SpecializationAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSpecialization>;
          };
          groupBy: {
            args: Prisma.SpecializationGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SpecializationGroupByOutputType>[];
          };
          count: {
            args: Prisma.SpecializationCountArgs<ExtArgs>;
            result: $Utils.Optional<SpecializationCountAggregateOutputType> | number;
          };
        };
      };
      Goverment: {
        payload: Prisma.$GovermentPayload<ExtArgs>;
        fields: Prisma.GovermentFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.GovermentFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.GovermentFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          findFirst: {
            args: Prisma.GovermentFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.GovermentFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          findMany: {
            args: Prisma.GovermentFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>[];
          };
          create: {
            args: Prisma.GovermentCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          createMany: {
            args: Prisma.GovermentCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.GovermentCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>[];
          };
          delete: {
            args: Prisma.GovermentDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          update: {
            args: Prisma.GovermentUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          deleteMany: {
            args: Prisma.GovermentDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.GovermentUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.GovermentUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>[];
          };
          upsert: {
            args: Prisma.GovermentUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$GovermentPayload>;
          };
          aggregate: {
            args: Prisma.GovermentAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateGoverment>;
          };
          groupBy: {
            args: Prisma.GovermentGroupByArgs<ExtArgs>;
            result: $Utils.Optional<GovermentGroupByOutputType>[];
          };
          count: {
            args: Prisma.GovermentCountArgs<ExtArgs>;
            result: $Utils.Optional<GovermentCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory;
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
  }
  export type GlobalOmitConfig = {
    session?: SessionOmit;
    oTPs?: OTPsOmit;
    user?: UserOmit;
    workerInfo?: WorkerInfoOmit;
    specializationsForWorkers?: SpecializationsForWorkersOmit;
    specialization?: SpecializationOmit;
    goverment?: GovermentOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sessions: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SessionWhereInput;
  };

  /**
   * Count Type WorkerInfoCountOutputType
   */

  export type WorkerInfoCountOutputType = {
    secondarySpecializations: number;
    goverments: number;
  };

  export type WorkerInfoCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    secondarySpecializations?: boolean | WorkerInfoCountOutputTypeCountSecondarySpecializationsArgs;
    goverments?: boolean | WorkerInfoCountOutputTypeCountGovermentsArgs;
  };

  // Custom InputTypes
  /**
   * WorkerInfoCountOutputType without action
   */
  export type WorkerInfoCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfoCountOutputType
     */
    select?: WorkerInfoCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * WorkerInfoCountOutputType without action
   */
  export type WorkerInfoCountOutputTypeCountSecondarySpecializationsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SpecializationsForWorkersWhereInput;
  };

  /**
   * WorkerInfoCountOutputType without action
   */
  export type WorkerInfoCountOutputTypeCountGovermentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: GovermentWhereInput;
  };

  /**
   * Count Type SpecializationCountOutputType
   */

  export type SpecializationCountOutputType = {
    secondaryWorkers: number;
    primaryWorkers: number;
  };

  export type SpecializationCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    secondaryWorkers?: boolean | SpecializationCountOutputTypeCountSecondaryWorkersArgs;
    primaryWorkers?: boolean | SpecializationCountOutputTypeCountPrimaryWorkersArgs;
  };

  // Custom InputTypes
  /**
   * SpecializationCountOutputType without action
   */
  export type SpecializationCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationCountOutputType
     */
    select?: SpecializationCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * SpecializationCountOutputType without action
   */
  export type SpecializationCountOutputTypeCountSecondaryWorkersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SpecializationsForWorkersWhereInput;
  };

  /**
   * SpecializationCountOutputType without action
   */
  export type SpecializationCountOutputTypeCountPrimaryWorkersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WorkerInfoWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null;
    _avg: SessionAvgAggregateOutputType | null;
    _sum: SessionSumAggregateOutputType | null;
    _min: SessionMinAggregateOutputType | null;
    _max: SessionMaxAggregateOutputType | null;
  };

  export type SessionAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
  };

  export type SessionSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
  };

  export type SessionMinAggregateOutputType = {
    id: number | null;
    userId: number | null;
    token: string | null;
    isRevoked: boolean | null;
    deviceFingerprint: string | null;
    lastUsedAt: Date | null;
    createdAt: Date | null;
    expiresAt: Date | null;
  };

  export type SessionMaxAggregateOutputType = {
    id: number | null;
    userId: number | null;
    token: string | null;
    isRevoked: boolean | null;
    deviceFingerprint: string | null;
    lastUsedAt: Date | null;
    createdAt: Date | null;
    expiresAt: Date | null;
  };

  export type SessionCountAggregateOutputType = {
    id: number;
    userId: number;
    token: number;
    isRevoked: number;
    deviceFingerprint: number;
    lastUsedAt: number;
    createdAt: number;
    expiresAt: number;
    _all: number;
  };

  export type SessionAvgAggregateInputType = {
    id?: true;
    userId?: true;
  };

  export type SessionSumAggregateInputType = {
    id?: true;
    userId?: true;
  };

  export type SessionMinAggregateInputType = {
    id?: true;
    userId?: true;
    token?: true;
    isRevoked?: true;
    deviceFingerprint?: true;
    lastUsedAt?: true;
    createdAt?: true;
    expiresAt?: true;
  };

  export type SessionMaxAggregateInputType = {
    id?: true;
    userId?: true;
    token?: true;
    isRevoked?: true;
    deviceFingerprint?: true;
    lastUsedAt?: true;
    createdAt?: true;
    expiresAt?: true;
  };

  export type SessionCountAggregateInputType = {
    id?: true;
    userId?: true;
    token?: true;
    isRevoked?: true;
    deviceFingerprint?: true;
    lastUsedAt?: true;
    createdAt?: true;
    expiresAt?: true;
    _all?: true;
  };

  export type SessionAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Sessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Sessions
     **/
    _count?: true | SessionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: SessionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: SessionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SessionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SessionMaxAggregateInputType;
  };

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
    [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>;
  };

  export type SessionGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SessionWhereInput;
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[];
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum;
    having?: SessionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SessionCountAggregateInputType | true;
    _avg?: SessionAvgAggregateInputType;
    _sum?: SessionSumAggregateInputType;
    _min?: SessionMinAggregateInputType;
    _max?: SessionMaxAggregateInputType;
  };

  export type SessionGroupByOutputType = {
    id: number;
    userId: number;
    token: string;
    isRevoked: boolean;
    deviceFingerprint: string;
    lastUsedAt: Date;
    createdAt: Date;
    expiresAt: Date;
    _count: SessionCountAggregateOutputType | null;
    _avg: SessionAvgAggregateOutputType | null;
    _sum: SessionSumAggregateOutputType | null;
    _min: SessionMinAggregateOutputType | null;
    _max: SessionMaxAggregateOutputType | null;
  };

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> & {
        [P in keyof T & keyof SessionGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
          : GetScalarType<T[P], SessionGroupByOutputType[P]>;
      }
    >
  >;

  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        token?: boolean;
        isRevoked?: boolean;
        deviceFingerprint?: boolean;
        lastUsedAt?: boolean;
        createdAt?: boolean;
        expiresAt?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['session']
    >;

  export type SessionSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      token?: boolean;
      isRevoked?: boolean;
      deviceFingerprint?: boolean;
      lastUsedAt?: boolean;
      createdAt?: boolean;
      expiresAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['session']
  >;

  export type SessionSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      token?: boolean;
      isRevoked?: boolean;
      deviceFingerprint?: boolean;
      lastUsedAt?: boolean;
      createdAt?: boolean;
      expiresAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['session']
  >;

  export type SessionSelectScalar = {
    id?: boolean;
    userId?: boolean;
    token?: boolean;
    isRevoked?: boolean;
    deviceFingerprint?: boolean;
    lastUsedAt?: boolean;
    createdAt?: boolean;
    expiresAt?: boolean;
  };

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | 'id'
      | 'userId'
      | 'token'
      | 'isRevoked'
      | 'deviceFingerprint'
      | 'lastUsedAt'
      | 'createdAt'
      | 'expiresAt',
      ExtArgs['result']['session']
    >;
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type SessionIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type SessionIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      name: 'Session';
      objects: {
        user: Prisma.$UserPayload<ExtArgs>;
      };
      scalars: $Extensions.GetPayloadResult<
        {
          id: number;
          userId: number;
          token: string;
          isRevoked: boolean;
          deviceFingerprint: string;
          lastUsedAt: Date;
          createdAt: Date;
          expiresAt: Date;
        },
        ExtArgs['result']['session']
      >;
      composites: {};
    };

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> =
    $Result.GetResult<Prisma.$SessionPayload, S>;

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    SessionFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: SessionCountAggregateInputType | true;
  };

  export interface SessionDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session']; meta: { name: 'Session' } };
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(
      args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(
      args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     *
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SessionFindManyArgs>(
      args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     *
     */
    create<T extends SessionCreateArgs>(
      args: SelectSubset<T, SessionCreateArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SessionCreateManyArgs>(
      args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SessionPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     *
     */
    delete<T extends SessionDeleteArgs>(
      args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SessionUpdateArgs>(
      args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SessionDeleteManyArgs>(
      args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SessionUpdateManyArgs>(
      args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SessionPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(
      args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>
    ): Prisma__SessionClient<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
     **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SessionAggregateArgs>(
      args: Subset<T, SessionAggregateArgs>
    ): Prisma.PrismaPromise<GetSessionAggregateType<T>>;

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Session model
     */
    readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      | $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<'Session', 'Int'>;
    readonly userId: FieldRef<'Session', 'Int'>;
    readonly token: FieldRef<'Session', 'String'>;
    readonly isRevoked: FieldRef<'Session', 'Boolean'>;
    readonly deviceFingerprint: FieldRef<'Session', 'String'>;
    readonly lastUsedAt: FieldRef<'Session', 'DateTime'>;
    readonly createdAt: FieldRef<'Session', 'DateTime'>;
    readonly expiresAt: FieldRef<'Session', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput;
  };

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput;
  };

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Sessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
  };

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Sessions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
  };

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Sessions.
     */
    skip?: number;
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
  };

  /**
   * Session create
   */
  export type SessionCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>;
  };

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Session update
   */
  export type SessionUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>;
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput;
  };

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>;
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput;
    /**
     * Limit how many Sessions to update.
     */
    limit?: number;
  };

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>;
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput;
    /**
     * Limit how many Sessions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput;
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>;
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>;
  };

  /**
   * Session delete
   */
  export type SessionDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput;
  };

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput;
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number;
  };

  /**
   * Session without action
   */
  export type SessionDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
  };

  /**
   * Model OTPs
   */

  export type AggregateOTPs = {
    _count: OTPsCountAggregateOutputType | null;
    _avg: OTPsAvgAggregateOutputType | null;
    _sum: OTPsSumAggregateOutputType | null;
    _min: OTPsMinAggregateOutputType | null;
    _max: OTPsMaxAggregateOutputType | null;
  };

  export type OTPsAvgAggregateOutputType = {
    attempts: number | null;
  };

  export type OTPsSumAggregateOutputType = {
    attempts: number | null;
  };

  export type OTPsMinAggregateOutputType = {
    attempts: number | null;
    phoneNumber: string | null;
    hashedOTP: string | null;
    updatedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date | null;
    InProcess: boolean | null;
  };

  export type OTPsMaxAggregateOutputType = {
    attempts: number | null;
    phoneNumber: string | null;
    hashedOTP: string | null;
    updatedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date | null;
    InProcess: boolean | null;
  };

  export type OTPsCountAggregateOutputType = {
    attempts: number;
    phoneNumber: number;
    hashedOTP: number;
    updatedAt: number;
    expiresAt: number;
    createdAt: number;
    InProcess: number;
    _all: number;
  };

  export type OTPsAvgAggregateInputType = {
    attempts?: true;
  };

  export type OTPsSumAggregateInputType = {
    attempts?: true;
  };

  export type OTPsMinAggregateInputType = {
    attempts?: true;
    phoneNumber?: true;
    hashedOTP?: true;
    updatedAt?: true;
    expiresAt?: true;
    createdAt?: true;
    InProcess?: true;
  };

  export type OTPsMaxAggregateInputType = {
    attempts?: true;
    phoneNumber?: true;
    hashedOTP?: true;
    updatedAt?: true;
    expiresAt?: true;
    createdAt?: true;
    InProcess?: true;
  };

  export type OTPsCountAggregateInputType = {
    attempts?: true;
    phoneNumber?: true;
    hashedOTP?: true;
    updatedAt?: true;
    expiresAt?: true;
    createdAt?: true;
    InProcess?: true;
    _all?: true;
  };

  export type OTPsAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which OTPs to aggregate.
     */
    where?: OTPsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of OTPs to fetch.
     */
    orderBy?: OTPsOrderByWithRelationInput | OTPsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: OTPsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` OTPs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` OTPs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned OTPs
     **/
    _count?: true | OTPsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: OTPsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: OTPsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: OTPsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: OTPsMaxAggregateInputType;
  };

  export type GetOTPsAggregateType<T extends OTPsAggregateArgs> = {
    [P in keyof T & keyof AggregateOTPs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOTPs[P]>
      : GetScalarType<T[P], AggregateOTPs[P]>;
  };

  export type OTPsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: OTPsWhereInput;
      orderBy?: OTPsOrderByWithAggregationInput | OTPsOrderByWithAggregationInput[];
      by: OTPsScalarFieldEnum[] | OTPsScalarFieldEnum;
      having?: OTPsScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: OTPsCountAggregateInputType | true;
      _avg?: OTPsAvgAggregateInputType;
      _sum?: OTPsSumAggregateInputType;
      _min?: OTPsMinAggregateInputType;
      _max?: OTPsMaxAggregateInputType;
    };

  export type OTPsGroupByOutputType = {
    attempts: number;
    phoneNumber: string;
    hashedOTP: string;
    updatedAt: Date;
    expiresAt: Date;
    createdAt: Date;
    InProcess: boolean;
    _count: OTPsCountAggregateOutputType | null;
    _avg: OTPsAvgAggregateOutputType | null;
    _sum: OTPsSumAggregateOutputType | null;
    _min: OTPsMinAggregateOutputType | null;
    _max: OTPsMaxAggregateOutputType | null;
  };

  type GetOTPsGroupByPayload<T extends OTPsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OTPsGroupByOutputType, T['by']> & {
        [P in keyof T & keyof OTPsGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], OTPsGroupByOutputType[P]>
          : GetScalarType<T[P], OTPsGroupByOutputType[P]>;
      }
    >
  >;

  export type OTPsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        attempts?: boolean;
        phoneNumber?: boolean;
        hashedOTP?: boolean;
        updatedAt?: boolean;
        expiresAt?: boolean;
        createdAt?: boolean;
        InProcess?: boolean;
      },
      ExtArgs['result']['oTPs']
    >;

  export type OTPsSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      attempts?: boolean;
      phoneNumber?: boolean;
      hashedOTP?: boolean;
      updatedAt?: boolean;
      expiresAt?: boolean;
      createdAt?: boolean;
      InProcess?: boolean;
    },
    ExtArgs['result']['oTPs']
  >;

  export type OTPsSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      attempts?: boolean;
      phoneNumber?: boolean;
      hashedOTP?: boolean;
      updatedAt?: boolean;
      expiresAt?: boolean;
      createdAt?: boolean;
      InProcess?: boolean;
    },
    ExtArgs['result']['oTPs']
  >;

  export type OTPsSelectScalar = {
    attempts?: boolean;
    phoneNumber?: boolean;
    hashedOTP?: boolean;
    updatedAt?: boolean;
    expiresAt?: boolean;
    createdAt?: boolean;
    InProcess?: boolean;
  };

  export type OTPsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | 'attempts'
      | 'phoneNumber'
      | 'hashedOTP'
      | 'updatedAt'
      | 'expiresAt'
      | 'createdAt'
      | 'InProcess',
      ExtArgs['result']['oTPs']
    >;

  export type $OTPsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'OTPs';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        attempts: number;
        phoneNumber: string;
        hashedOTP: string;
        updatedAt: Date;
        expiresAt: Date;
        createdAt: Date;
        InProcess: boolean;
      },
      ExtArgs['result']['oTPs']
    >;
    composites: {};
  };

  type OTPsGetPayload<S extends boolean | null | undefined | OTPsDefaultArgs> = $Result.GetResult<
    Prisma.$OTPsPayload,
    S
  >;

  type OTPsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    OTPsFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: OTPsCountAggregateInputType | true;
  };

  export interface OTPsDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OTPs']; meta: { name: 'OTPs' } };
    /**
     * Find zero or one OTPs that matches the filter.
     * @param {OTPsFindUniqueArgs} args - Arguments to find a OTPs
     * @example
     * // Get one OTPs
     * const oTPs = await prisma.oTPs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OTPsFindUniqueArgs>(
      args: SelectSubset<T, OTPsFindUniqueArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one OTPs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OTPsFindUniqueOrThrowArgs} args - Arguments to find a OTPs
     * @example
     * // Get one OTPs
     * const oTPs = await prisma.oTPs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OTPsFindUniqueOrThrowArgs>(
      args: SelectSubset<T, OTPsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first OTPs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsFindFirstArgs} args - Arguments to find a OTPs
     * @example
     * // Get one OTPs
     * const oTPs = await prisma.oTPs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OTPsFindFirstArgs>(
      args?: SelectSubset<T, OTPsFindFirstArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first OTPs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsFindFirstOrThrowArgs} args - Arguments to find a OTPs
     * @example
     * // Get one OTPs
     * const oTPs = await prisma.oTPs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OTPsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, OTPsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more OTPs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OTPs
     * const oTPs = await prisma.oTPs.findMany()
     *
     * // Get first 10 OTPs
     * const oTPs = await prisma.oTPs.findMany({ take: 10 })
     *
     * // Only select the `attempts`
     * const oTPsWithAttemptsOnly = await prisma.oTPs.findMany({ select: { attempts: true } })
     *
     */
    findMany<T extends OTPsFindManyArgs>(
      args?: SelectSubset<T, OTPsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a OTPs.
     * @param {OTPsCreateArgs} args - Arguments to create a OTPs.
     * @example
     * // Create one OTPs
     * const OTPs = await prisma.oTPs.create({
     *   data: {
     *     // ... data to create a OTPs
     *   }
     * })
     *
     */
    create<T extends OTPsCreateArgs>(
      args: SelectSubset<T, OTPsCreateArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many OTPs.
     * @param {OTPsCreateManyArgs} args - Arguments to create many OTPs.
     * @example
     * // Create many OTPs
     * const oTPs = await prisma.oTPs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends OTPsCreateManyArgs>(
      args?: SelectSubset<T, OTPsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many OTPs and returns the data saved in the database.
     * @param {OTPsCreateManyAndReturnArgs} args - Arguments to create many OTPs.
     * @example
     * // Create many OTPs
     * const oTPs = await prisma.oTPs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many OTPs and only return the `attempts`
     * const oTPsWithAttemptsOnly = await prisma.oTPs.createManyAndReturn({
     *   select: { attempts: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends OTPsCreateManyAndReturnArgs>(
      args?: SelectSubset<T, OTPsCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Delete a OTPs.
     * @param {OTPsDeleteArgs} args - Arguments to delete one OTPs.
     * @example
     * // Delete one OTPs
     * const OTPs = await prisma.oTPs.delete({
     *   where: {
     *     // ... filter to delete one OTPs
     *   }
     * })
     *
     */
    delete<T extends OTPsDeleteArgs>(
      args: SelectSubset<T, OTPsDeleteArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one OTPs.
     * @param {OTPsUpdateArgs} args - Arguments to update one OTPs.
     * @example
     * // Update one OTPs
     * const oTPs = await prisma.oTPs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends OTPsUpdateArgs>(
      args: SelectSubset<T, OTPsUpdateArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more OTPs.
     * @param {OTPsDeleteManyArgs} args - Arguments to filter OTPs to delete.
     * @example
     * // Delete a few OTPs
     * const { count } = await prisma.oTPs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends OTPsDeleteManyArgs>(
      args?: SelectSubset<T, OTPsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more OTPs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OTPs
     * const oTPs = await prisma.oTPs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends OTPsUpdateManyArgs>(
      args: SelectSubset<T, OTPsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more OTPs and returns the data updated in the database.
     * @param {OTPsUpdateManyAndReturnArgs} args - Arguments to update many OTPs.
     * @example
     * // Update many OTPs
     * const oTPs = await prisma.oTPs.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more OTPs and only return the `attempts`
     * const oTPsWithAttemptsOnly = await prisma.oTPs.updateManyAndReturn({
     *   select: { attempts: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends OTPsUpdateManyAndReturnArgs>(
      args: SelectSubset<T, OTPsUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Create or update one OTPs.
     * @param {OTPsUpsertArgs} args - Arguments to update or create a OTPs.
     * @example
     * // Update or create a OTPs
     * const oTPs = await prisma.oTPs.upsert({
     *   create: {
     *     // ... data to create a OTPs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OTPs we want to update
     *   }
     * })
     */
    upsert<T extends OTPsUpsertArgs>(
      args: SelectSubset<T, OTPsUpsertArgs<ExtArgs>>
    ): Prisma__OTPsClient<
      $Result.GetResult<Prisma.$OTPsPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of OTPs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsCountArgs} args - Arguments to filter OTPs to count.
     * @example
     * // Count the number of OTPs
     * const count = await prisma.oTPs.count({
     *   where: {
     *     // ... the filter for the OTPs we want to count
     *   }
     * })
     **/
    count<T extends OTPsCountArgs>(
      args?: Subset<T, OTPsCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OTPsCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a OTPs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends OTPsAggregateArgs>(
      args: Subset<T, OTPsAggregateArgs>
    ): Prisma.PrismaPromise<GetOTPsAggregateType<T>>;

    /**
     * Group by OTPs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OTPsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends OTPsGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OTPsGroupByArgs['orderBy'] }
        : { orderBy?: OTPsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, OTPsGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetOTPsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the OTPs model
     */
    readonly fields: OTPsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OTPs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OTPsClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the OTPs model
   */
  interface OTPsFieldRefs {
    readonly attempts: FieldRef<'OTPs', 'Int'>;
    readonly phoneNumber: FieldRef<'OTPs', 'String'>;
    readonly hashedOTP: FieldRef<'OTPs', 'String'>;
    readonly updatedAt: FieldRef<'OTPs', 'DateTime'>;
    readonly expiresAt: FieldRef<'OTPs', 'DateTime'>;
    readonly createdAt: FieldRef<'OTPs', 'DateTime'>;
    readonly InProcess: FieldRef<'OTPs', 'Boolean'>;
  }

  // Custom InputTypes
  /**
   * OTPs findUnique
   */
  export type OTPsFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * Filter, which OTPs to fetch.
     */
    where: OTPsWhereUniqueInput;
  };

  /**
   * OTPs findUniqueOrThrow
   */
  export type OTPsFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * Filter, which OTPs to fetch.
     */
    where: OTPsWhereUniqueInput;
  };

  /**
   * OTPs findFirst
   */
  export type OTPsFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * Filter, which OTPs to fetch.
     */
    where?: OTPsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of OTPs to fetch.
     */
    orderBy?: OTPsOrderByWithRelationInput | OTPsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for OTPs.
     */
    cursor?: OTPsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` OTPs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` OTPs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of OTPs.
     */
    distinct?: OTPsScalarFieldEnum | OTPsScalarFieldEnum[];
  };

  /**
   * OTPs findFirstOrThrow
   */
  export type OTPsFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * Filter, which OTPs to fetch.
     */
    where?: OTPsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of OTPs to fetch.
     */
    orderBy?: OTPsOrderByWithRelationInput | OTPsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for OTPs.
     */
    cursor?: OTPsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` OTPs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` OTPs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of OTPs.
     */
    distinct?: OTPsScalarFieldEnum | OTPsScalarFieldEnum[];
  };

  /**
   * OTPs findMany
   */
  export type OTPsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the OTPs
       */
      select?: OTPsSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the OTPs
       */
      omit?: OTPsOmit<ExtArgs> | null;
      /**
       * Filter, which OTPs to fetch.
       */
      where?: OTPsWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of OTPs to fetch.
       */
      orderBy?: OTPsOrderByWithRelationInput | OTPsOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing OTPs.
       */
      cursor?: OTPsWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` OTPs from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` OTPs.
       */
      skip?: number;
      distinct?: OTPsScalarFieldEnum | OTPsScalarFieldEnum[];
    };

  /**
   * OTPs create
   */
  export type OTPsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * The data needed to create a OTPs.
     */
    data: XOR<OTPsCreateInput, OTPsUncheckedCreateInput>;
  };

  /**
   * OTPs createMany
   */
  export type OTPsCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many OTPs.
     */
    data: OTPsCreateManyInput | OTPsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * OTPs createManyAndReturn
   */
  export type OTPsCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * The data used to create many OTPs.
     */
    data: OTPsCreateManyInput | OTPsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * OTPs update
   */
  export type OTPsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * The data needed to update a OTPs.
     */
    data: XOR<OTPsUpdateInput, OTPsUncheckedUpdateInput>;
    /**
     * Choose, which OTPs to update.
     */
    where: OTPsWhereUniqueInput;
  };

  /**
   * OTPs updateMany
   */
  export type OTPsUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update OTPs.
     */
    data: XOR<OTPsUpdateManyMutationInput, OTPsUncheckedUpdateManyInput>;
    /**
     * Filter which OTPs to update
     */
    where?: OTPsWhereInput;
    /**
     * Limit how many OTPs to update.
     */
    limit?: number;
  };

  /**
   * OTPs updateManyAndReturn
   */
  export type OTPsUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * The data used to update OTPs.
     */
    data: XOR<OTPsUpdateManyMutationInput, OTPsUncheckedUpdateManyInput>;
    /**
     * Filter which OTPs to update
     */
    where?: OTPsWhereInput;
    /**
     * Limit how many OTPs to update.
     */
    limit?: number;
  };

  /**
   * OTPs upsert
   */
  export type OTPsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * The filter to search for the OTPs to update in case it exists.
     */
    where: OTPsWhereUniqueInput;
    /**
     * In case the OTPs found by the `where` argument doesn't exist, create a new OTPs with this data.
     */
    create: XOR<OTPsCreateInput, OTPsUncheckedCreateInput>;
    /**
     * In case the OTPs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OTPsUpdateInput, OTPsUncheckedUpdateInput>;
  };

  /**
   * OTPs delete
   */
  export type OTPsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OTPs
     */
    select?: OTPsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OTPs
     */
    omit?: OTPsOmit<ExtArgs> | null;
    /**
     * Filter which OTPs to delete.
     */
    where: OTPsWhereUniqueInput;
  };

  /**
   * OTPs deleteMany
   */
  export type OTPsDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which OTPs to delete
     */
    where?: OTPsWhereInput;
    /**
     * Limit how many OTPs to delete.
     */
    limit?: number;
  };

  /**
   * OTPs without action
   */
  export type OTPsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the OTPs
       */
      select?: OTPsSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the OTPs
       */
      omit?: OTPsOmit<ExtArgs> | null;
    };

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserAvgAggregateOutputType = {
    id: number | null;
  };

  export type UserSumAggregateOutputType = {
    id: number | null;
  };

  export type UserMinAggregateOutputType = {
    id: number | null;
    phoneNumber: string | null;
    fristName: string | null;
    lastName: string | null;
    government: string | null;
    city: string | null;
    bio: string | null;
    status: $Enums.AccountStatus | null;
    role: $Enums.Role | null;
  };

  export type UserMaxAggregateOutputType = {
    id: number | null;
    phoneNumber: string | null;
    fristName: string | null;
    lastName: string | null;
    government: string | null;
    city: string | null;
    bio: string | null;
    status: $Enums.AccountStatus | null;
    role: $Enums.Role | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    phoneNumber: number;
    fristName: number;
    lastName: number;
    government: number;
    city: number;
    bio: number;
    status: number;
    role: number;
    _all: number;
  };

  export type UserAvgAggregateInputType = {
    id?: true;
  };

  export type UserSumAggregateInputType = {
    id?: true;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    fristName?: true;
    lastName?: true;
    government?: true;
    city?: true;
    bio?: true;
    status?: true;
    role?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    fristName?: true;
    lastName?: true;
    government?: true;
    city?: true;
    bio?: true;
    status?: true;
    role?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    fristName?: true;
    lastName?: true;
    government?: true;
    city?: true;
    bio?: true;
    status?: true;
    role?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: UserAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: UserSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: UserWhereInput;
      orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
      by: UserScalarFieldEnum[] | UserScalarFieldEnum;
      having?: UserScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: UserCountAggregateInputType | true;
      _avg?: UserAvgAggregateInputType;
      _sum?: UserSumAggregateInputType;
      _min?: UserMinAggregateInputType;
      _max?: UserMaxAggregateInputType;
    };

  export type UserGroupByOutputType = {
    id: number;
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio: string | null;
    status: $Enums.AccountStatus;
    role: $Enums.Role;
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        phoneNumber?: boolean;
        fristName?: boolean;
        lastName?: boolean;
        government?: boolean;
        city?: boolean;
        bio?: boolean;
        status?: boolean;
        role?: boolean;
        sessions?: boolean | User$sessionsArgs<ExtArgs>;
        workerInfo?: boolean | User$workerInfoArgs<ExtArgs>;
        _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['user']
    >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      phoneNumber?: boolean;
      fristName?: boolean;
      lastName?: boolean;
      government?: boolean;
      city?: boolean;
      bio?: boolean;
      status?: boolean;
      role?: boolean;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      phoneNumber?: boolean;
      fristName?: boolean;
      lastName?: boolean;
      government?: boolean;
      city?: boolean;
      bio?: boolean;
      status?: boolean;
      role?: boolean;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectScalar = {
    id?: boolean;
    phoneNumber?: boolean;
    fristName?: boolean;
    lastName?: boolean;
    government?: boolean;
    city?: boolean;
    bio?: boolean;
    status?: boolean;
    role?: boolean;
  };

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | 'id'
      | 'phoneNumber'
      | 'fristName'
      | 'lastName'
      | 'government'
      | 'city'
      | 'bio'
      | 'status'
      | 'role',
      ExtArgs['result']['user']
    >;
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | User$sessionsArgs<ExtArgs>;
    workerInfo?: boolean | User$workerInfoArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type UserIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'User';
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[];
      workerInfo: Prisma.$WorkerInfoPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        phoneNumber: string;
        fristName: string;
        lastName: string;
        government: string;
        city: string;
        bio: string | null;
        status: $Enums.AccountStatus;
        role: $Enums.Role;
      },
      ExtArgs['result']['user']
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<
    Prisma.$UserPayload,
    S
  >;

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User']; meta: { name: 'User' } };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$sessionsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null
    >;
    workerInfo<T extends User$workerInfoArgs<ExtArgs> = {}>(
      args?: Subset<T, User$workerInfoArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<'User', 'Int'>;
    readonly phoneNumber: FieldRef<'User', 'String'>;
    readonly fristName: FieldRef<'User', 'String'>;
    readonly lastName: FieldRef<'User', 'String'>;
    readonly government: FieldRef<'User', 'String'>;
    readonly city: FieldRef<'User', 'String'>;
    readonly bio: FieldRef<'User', 'String'>;
    readonly status: FieldRef<'User', 'AccountStatus'>;
    readonly role: FieldRef<'User', 'Role'>;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the User
       */
      omit?: UserOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      /**
       * Filter, which Users to fetch.
       */
      where?: UserWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of Users to fetch.
       */
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing Users.
       */
      cursor?: UserWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` Users from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` Users.
       */
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to delete.
     */
    limit?: number;
  };

  /**
   * User.sessions
   */
  export type User$sessionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null;
    where?: SessionWhereInput;
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
    cursor?: SessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
  };

  /**
   * User.workerInfo
   */
  export type User$workerInfoArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    where?: WorkerInfoWhereInput;
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the User
       */
      omit?: UserOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
    };

  /**
   * Model WorkerInfo
   */

  export type AggregateWorkerInfo = {
    _count: WorkerInfoCountAggregateOutputType | null;
    _avg: WorkerInfoAvgAggregateOutputType | null;
    _sum: WorkerInfoSumAggregateOutputType | null;
    _min: WorkerInfoMinAggregateOutputType | null;
    _max: WorkerInfoMaxAggregateOutputType | null;
  };

  export type WorkerInfoAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
    experienceYears: number | null;
    primarySpecializationId: number | null;
  };

  export type WorkerInfoSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
    experienceYears: number | null;
    primarySpecializationId: number | null;
  };

  export type WorkerInfoMinAggregateOutputType = {
    id: number | null;
    userId: number | null;
    experienceYears: number | null;
    isInTeam: boolean | null;
    acceptsUrgentJobs: boolean | null;
    primarySpecializationId: number | null;
  };

  export type WorkerInfoMaxAggregateOutputType = {
    id: number | null;
    userId: number | null;
    experienceYears: number | null;
    isInTeam: boolean | null;
    acceptsUrgentJobs: boolean | null;
    primarySpecializationId: number | null;
  };

  export type WorkerInfoCountAggregateOutputType = {
    id: number;
    userId: number;
    experienceYears: number;
    isInTeam: number;
    acceptsUrgentJobs: number;
    primarySpecializationId: number;
    _all: number;
  };

  export type WorkerInfoAvgAggregateInputType = {
    id?: true;
    userId?: true;
    experienceYears?: true;
    primarySpecializationId?: true;
  };

  export type WorkerInfoSumAggregateInputType = {
    id?: true;
    userId?: true;
    experienceYears?: true;
    primarySpecializationId?: true;
  };

  export type WorkerInfoMinAggregateInputType = {
    id?: true;
    userId?: true;
    experienceYears?: true;
    isInTeam?: true;
    acceptsUrgentJobs?: true;
    primarySpecializationId?: true;
  };

  export type WorkerInfoMaxAggregateInputType = {
    id?: true;
    userId?: true;
    experienceYears?: true;
    isInTeam?: true;
    acceptsUrgentJobs?: true;
    primarySpecializationId?: true;
  };

  export type WorkerInfoCountAggregateInputType = {
    id?: true;
    userId?: true;
    experienceYears?: true;
    isInTeam?: true;
    acceptsUrgentJobs?: true;
    primarySpecializationId?: true;
    _all?: true;
  };

  export type WorkerInfoAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which WorkerInfo to aggregate.
     */
    where?: WorkerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WorkerInfos to fetch.
     */
    orderBy?: WorkerInfoOrderByWithRelationInput | WorkerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WorkerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WorkerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WorkerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WorkerInfos
     **/
    _count?: true | WorkerInfoCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: WorkerInfoAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: WorkerInfoSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WorkerInfoMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WorkerInfoMaxAggregateInputType;
  };

  export type GetWorkerInfoAggregateType<T extends WorkerInfoAggregateArgs> = {
    [P in keyof T & keyof AggregateWorkerInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkerInfo[P]>
      : GetScalarType<T[P], AggregateWorkerInfo[P]>;
  };

  export type WorkerInfoGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WorkerInfoWhereInput;
    orderBy?: WorkerInfoOrderByWithAggregationInput | WorkerInfoOrderByWithAggregationInput[];
    by: WorkerInfoScalarFieldEnum[] | WorkerInfoScalarFieldEnum;
    having?: WorkerInfoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkerInfoCountAggregateInputType | true;
    _avg?: WorkerInfoAvgAggregateInputType;
    _sum?: WorkerInfoSumAggregateInputType;
    _min?: WorkerInfoMinAggregateInputType;
    _max?: WorkerInfoMaxAggregateInputType;
  };

  export type WorkerInfoGroupByOutputType = {
    id: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
    _count: WorkerInfoCountAggregateOutputType | null;
    _avg: WorkerInfoAvgAggregateOutputType | null;
    _sum: WorkerInfoSumAggregateOutputType | null;
    _min: WorkerInfoMinAggregateOutputType | null;
    _max: WorkerInfoMaxAggregateOutputType | null;
  };

  type GetWorkerInfoGroupByPayload<T extends WorkerInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkerInfoGroupByOutputType, T['by']> & {
        [P in keyof T & keyof WorkerInfoGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], WorkerInfoGroupByOutputType[P]>
          : GetScalarType<T[P], WorkerInfoGroupByOutputType[P]>;
      }
    >
  >;

  export type WorkerInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        experienceYears?: boolean;
        isInTeam?: boolean;
        acceptsUrgentJobs?: boolean;
        primarySpecializationId?: boolean;
        secondarySpecializations?: boolean | WorkerInfo$secondarySpecializationsArgs<ExtArgs>;
        primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
        user?: boolean | UserDefaultArgs<ExtArgs>;
        goverments?: boolean | WorkerInfo$govermentsArgs<ExtArgs>;
        _count?: boolean | WorkerInfoCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['workerInfo']
    >;

  export type WorkerInfoSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      experienceYears?: boolean;
      isInTeam?: boolean;
      acceptsUrgentJobs?: boolean;
      primarySpecializationId?: boolean;
      primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['workerInfo']
  >;

  export type WorkerInfoSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      experienceYears?: boolean;
      isInTeam?: boolean;
      acceptsUrgentJobs?: boolean;
      primarySpecializationId?: boolean;
      primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['workerInfo']
  >;

  export type WorkerInfoSelectScalar = {
    id?: boolean;
    userId?: boolean;
    experienceYears?: boolean;
    isInTeam?: boolean;
    acceptsUrgentJobs?: boolean;
    primarySpecializationId?: boolean;
  };

  export type WorkerInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | 'id'
      | 'userId'
      | 'experienceYears'
      | 'isInTeam'
      | 'acceptsUrgentJobs'
      | 'primarySpecializationId',
      ExtArgs['result']['workerInfo']
    >;
  export type WorkerInfoInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    secondarySpecializations?: boolean | WorkerInfo$secondarySpecializationsArgs<ExtArgs>;
    primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    user?: boolean | UserDefaultArgs<ExtArgs>;
    goverments?: boolean | WorkerInfo$govermentsArgs<ExtArgs>;
    _count?: boolean | WorkerInfoCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type WorkerInfoIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type WorkerInfoIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    primarySpecialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $WorkerInfoPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'WorkerInfo';
    objects: {
      secondarySpecializations: Prisma.$SpecializationsForWorkersPayload<ExtArgs>[];
      primarySpecialization: Prisma.$SpecializationPayload<ExtArgs>;
      user: Prisma.$UserPayload<ExtArgs>;
      goverments: Prisma.$GovermentPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        userId: number;
        experienceYears: number;
        isInTeam: boolean;
        acceptsUrgentJobs: boolean;
        primarySpecializationId: number;
      },
      ExtArgs['result']['workerInfo']
    >;
    composites: {};
  };

  type WorkerInfoGetPayload<S extends boolean | null | undefined | WorkerInfoDefaultArgs> =
    $Result.GetResult<Prisma.$WorkerInfoPayload, S>;

  type WorkerInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkerInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkerInfoCountAggregateInputType | true;
    };

  export interface WorkerInfoDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['WorkerInfo'];
      meta: { name: 'WorkerInfo' };
    };
    /**
     * Find zero or one WorkerInfo that matches the filter.
     * @param {WorkerInfoFindUniqueArgs} args - Arguments to find a WorkerInfo
     * @example
     * // Get one WorkerInfo
     * const workerInfo = await prisma.workerInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkerInfoFindUniqueArgs>(
      args: SelectSubset<T, WorkerInfoFindUniqueArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one WorkerInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkerInfoFindUniqueOrThrowArgs} args - Arguments to find a WorkerInfo
     * @example
     * // Get one WorkerInfo
     * const workerInfo = await prisma.workerInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkerInfoFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WorkerInfoFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first WorkerInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoFindFirstArgs} args - Arguments to find a WorkerInfo
     * @example
     * // Get one WorkerInfo
     * const workerInfo = await prisma.workerInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkerInfoFindFirstArgs>(
      args?: SelectSubset<T, WorkerInfoFindFirstArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first WorkerInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoFindFirstOrThrowArgs} args - Arguments to find a WorkerInfo
     * @example
     * // Get one WorkerInfo
     * const workerInfo = await prisma.workerInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkerInfoFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WorkerInfoFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more WorkerInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkerInfos
     * const workerInfos = await prisma.workerInfo.findMany()
     *
     * // Get first 10 WorkerInfos
     * const workerInfos = await prisma.workerInfo.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const workerInfoWithIdOnly = await prisma.workerInfo.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WorkerInfoFindManyArgs>(
      args?: SelectSubset<T, WorkerInfoFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a WorkerInfo.
     * @param {WorkerInfoCreateArgs} args - Arguments to create a WorkerInfo.
     * @example
     * // Create one WorkerInfo
     * const WorkerInfo = await prisma.workerInfo.create({
     *   data: {
     *     // ... data to create a WorkerInfo
     *   }
     * })
     *
     */
    create<T extends WorkerInfoCreateArgs>(
      args: SelectSubset<T, WorkerInfoCreateArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many WorkerInfos.
     * @param {WorkerInfoCreateManyArgs} args - Arguments to create many WorkerInfos.
     * @example
     * // Create many WorkerInfos
     * const workerInfo = await prisma.workerInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WorkerInfoCreateManyArgs>(
      args?: SelectSubset<T, WorkerInfoCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many WorkerInfos and returns the data saved in the database.
     * @param {WorkerInfoCreateManyAndReturnArgs} args - Arguments to create many WorkerInfos.
     * @example
     * // Create many WorkerInfos
     * const workerInfo = await prisma.workerInfo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WorkerInfos and only return the `id`
     * const workerInfoWithIdOnly = await prisma.workerInfo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WorkerInfoCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WorkerInfoCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a WorkerInfo.
     * @param {WorkerInfoDeleteArgs} args - Arguments to delete one WorkerInfo.
     * @example
     * // Delete one WorkerInfo
     * const WorkerInfo = await prisma.workerInfo.delete({
     *   where: {
     *     // ... filter to delete one WorkerInfo
     *   }
     * })
     *
     */
    delete<T extends WorkerInfoDeleteArgs>(
      args: SelectSubset<T, WorkerInfoDeleteArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one WorkerInfo.
     * @param {WorkerInfoUpdateArgs} args - Arguments to update one WorkerInfo.
     * @example
     * // Update one WorkerInfo
     * const workerInfo = await prisma.workerInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WorkerInfoUpdateArgs>(
      args: SelectSubset<T, WorkerInfoUpdateArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more WorkerInfos.
     * @param {WorkerInfoDeleteManyArgs} args - Arguments to filter WorkerInfos to delete.
     * @example
     * // Delete a few WorkerInfos
     * const { count } = await prisma.workerInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WorkerInfoDeleteManyArgs>(
      args?: SelectSubset<T, WorkerInfoDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more WorkerInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkerInfos
     * const workerInfo = await prisma.workerInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WorkerInfoUpdateManyArgs>(
      args: SelectSubset<T, WorkerInfoUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more WorkerInfos and returns the data updated in the database.
     * @param {WorkerInfoUpdateManyAndReturnArgs} args - Arguments to update many WorkerInfos.
     * @example
     * // Update many WorkerInfos
     * const workerInfo = await prisma.workerInfo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more WorkerInfos and only return the `id`
     * const workerInfoWithIdOnly = await prisma.workerInfo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends WorkerInfoUpdateManyAndReturnArgs>(
      args: SelectSubset<T, WorkerInfoUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one WorkerInfo.
     * @param {WorkerInfoUpsertArgs} args - Arguments to update or create a WorkerInfo.
     * @example
     * // Update or create a WorkerInfo
     * const workerInfo = await prisma.workerInfo.upsert({
     *   create: {
     *     // ... data to create a WorkerInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkerInfo we want to update
     *   }
     * })
     */
    upsert<T extends WorkerInfoUpsertArgs>(
      args: SelectSubset<T, WorkerInfoUpsertArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of WorkerInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoCountArgs} args - Arguments to filter WorkerInfos to count.
     * @example
     * // Count the number of WorkerInfos
     * const count = await prisma.workerInfo.count({
     *   where: {
     *     // ... the filter for the WorkerInfos we want to count
     *   }
     * })
     **/
    count<T extends WorkerInfoCountArgs>(
      args?: Subset<T, WorkerInfoCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkerInfoCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a WorkerInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WorkerInfoAggregateArgs>(
      args: Subset<T, WorkerInfoAggregateArgs>
    ): Prisma.PrismaPromise<GetWorkerInfoAggregateType<T>>;

    /**
     * Group by WorkerInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkerInfoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WorkerInfoGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkerInfoGroupByArgs['orderBy'] }
        : { orderBy?: WorkerInfoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, WorkerInfoGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetWorkerInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the WorkerInfo model
     */
    readonly fields: WorkerInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkerInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkerInfoClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    secondarySpecializations<T extends WorkerInfo$secondarySpecializationsArgs<ExtArgs> = {}>(
      args?: Subset<T, WorkerInfo$secondarySpecializationsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    primarySpecialization<T extends SpecializationDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, SpecializationDefaultArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      | $Result.GetResult<
          Prisma.$SpecializationPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      | $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    goverments<T extends WorkerInfo$govermentsArgs<ExtArgs> = {}>(
      args?: Subset<T, WorkerInfo$govermentsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the WorkerInfo model
   */
  interface WorkerInfoFieldRefs {
    readonly id: FieldRef<'WorkerInfo', 'Int'>;
    readonly userId: FieldRef<'WorkerInfo', 'Int'>;
    readonly experienceYears: FieldRef<'WorkerInfo', 'Int'>;
    readonly isInTeam: FieldRef<'WorkerInfo', 'Boolean'>;
    readonly acceptsUrgentJobs: FieldRef<'WorkerInfo', 'Boolean'>;
    readonly primarySpecializationId: FieldRef<'WorkerInfo', 'Int'>;
  }

  // Custom InputTypes
  /**
   * WorkerInfo findUnique
   */
  export type WorkerInfoFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which WorkerInfo to fetch.
     */
    where: WorkerInfoWhereUniqueInput;
  };

  /**
   * WorkerInfo findUniqueOrThrow
   */
  export type WorkerInfoFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which WorkerInfo to fetch.
     */
    where: WorkerInfoWhereUniqueInput;
  };

  /**
   * WorkerInfo findFirst
   */
  export type WorkerInfoFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which WorkerInfo to fetch.
     */
    where?: WorkerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WorkerInfos to fetch.
     */
    orderBy?: WorkerInfoOrderByWithRelationInput | WorkerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WorkerInfos.
     */
    cursor?: WorkerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WorkerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WorkerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WorkerInfos.
     */
    distinct?: WorkerInfoScalarFieldEnum | WorkerInfoScalarFieldEnum[];
  };

  /**
   * WorkerInfo findFirstOrThrow
   */
  export type WorkerInfoFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which WorkerInfo to fetch.
     */
    where?: WorkerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WorkerInfos to fetch.
     */
    orderBy?: WorkerInfoOrderByWithRelationInput | WorkerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WorkerInfos.
     */
    cursor?: WorkerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WorkerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WorkerInfos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WorkerInfos.
     */
    distinct?: WorkerInfoScalarFieldEnum | WorkerInfoScalarFieldEnum[];
  };

  /**
   * WorkerInfo findMany
   */
  export type WorkerInfoFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter, which WorkerInfos to fetch.
     */
    where?: WorkerInfoWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WorkerInfos to fetch.
     */
    orderBy?: WorkerInfoOrderByWithRelationInput | WorkerInfoOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WorkerInfos.
     */
    cursor?: WorkerInfoWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WorkerInfos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WorkerInfos.
     */
    skip?: number;
    distinct?: WorkerInfoScalarFieldEnum | WorkerInfoScalarFieldEnum[];
  };

  /**
   * WorkerInfo create
   */
  export type WorkerInfoCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * The data needed to create a WorkerInfo.
     */
    data: XOR<WorkerInfoCreateInput, WorkerInfoUncheckedCreateInput>;
  };

  /**
   * WorkerInfo createMany
   */
  export type WorkerInfoCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many WorkerInfos.
     */
    data: WorkerInfoCreateManyInput | WorkerInfoCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * WorkerInfo createManyAndReturn
   */
  export type WorkerInfoCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * The data used to create many WorkerInfos.
     */
    data: WorkerInfoCreateManyInput | WorkerInfoCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * WorkerInfo update
   */
  export type WorkerInfoUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * The data needed to update a WorkerInfo.
     */
    data: XOR<WorkerInfoUpdateInput, WorkerInfoUncheckedUpdateInput>;
    /**
     * Choose, which WorkerInfo to update.
     */
    where: WorkerInfoWhereUniqueInput;
  };

  /**
   * WorkerInfo updateMany
   */
  export type WorkerInfoUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update WorkerInfos.
     */
    data: XOR<WorkerInfoUpdateManyMutationInput, WorkerInfoUncheckedUpdateManyInput>;
    /**
     * Filter which WorkerInfos to update
     */
    where?: WorkerInfoWhereInput;
    /**
     * Limit how many WorkerInfos to update.
     */
    limit?: number;
  };

  /**
   * WorkerInfo updateManyAndReturn
   */
  export type WorkerInfoUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * The data used to update WorkerInfos.
     */
    data: XOR<WorkerInfoUpdateManyMutationInput, WorkerInfoUncheckedUpdateManyInput>;
    /**
     * Filter which WorkerInfos to update
     */
    where?: WorkerInfoWhereInput;
    /**
     * Limit how many WorkerInfos to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * WorkerInfo upsert
   */
  export type WorkerInfoUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * The filter to search for the WorkerInfo to update in case it exists.
     */
    where: WorkerInfoWhereUniqueInput;
    /**
     * In case the WorkerInfo found by the `where` argument doesn't exist, create a new WorkerInfo with this data.
     */
    create: XOR<WorkerInfoCreateInput, WorkerInfoUncheckedCreateInput>;
    /**
     * In case the WorkerInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkerInfoUpdateInput, WorkerInfoUncheckedUpdateInput>;
  };

  /**
   * WorkerInfo delete
   */
  export type WorkerInfoDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    /**
     * Filter which WorkerInfo to delete.
     */
    where: WorkerInfoWhereUniqueInput;
  };

  /**
   * WorkerInfo deleteMany
   */
  export type WorkerInfoDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which WorkerInfos to delete
     */
    where?: WorkerInfoWhereInput;
    /**
     * Limit how many WorkerInfos to delete.
     */
    limit?: number;
  };

  /**
   * WorkerInfo.secondarySpecializations
   */
  export type WorkerInfo$secondarySpecializationsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    where?: SpecializationsForWorkersWhereInput;
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | SpecializationsForWorkersScalarFieldEnum
      | SpecializationsForWorkersScalarFieldEnum[];
  };

  /**
   * WorkerInfo.goverments
   */
  export type WorkerInfo$govermentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    where?: GovermentWhereInput;
    orderBy?: GovermentOrderByWithRelationInput | GovermentOrderByWithRelationInput[];
    cursor?: GovermentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: GovermentScalarFieldEnum | GovermentScalarFieldEnum[];
  };

  /**
   * WorkerInfo without action
   */
  export type WorkerInfoDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
  };

  /**
   * Model SpecializationsForWorkers
   */

  export type AggregateSpecializationsForWorkers = {
    _count: SpecializationsForWorkersCountAggregateOutputType | null;
    _avg: SpecializationsForWorkersAvgAggregateOutputType | null;
    _sum: SpecializationsForWorkersSumAggregateOutputType | null;
    _min: SpecializationsForWorkersMinAggregateOutputType | null;
    _max: SpecializationsForWorkersMaxAggregateOutputType | null;
  };

  export type SpecializationsForWorkersAvgAggregateOutputType = {
    workerInfoId: number | null;
    specializationId: number | null;
  };

  export type SpecializationsForWorkersSumAggregateOutputType = {
    workerInfoId: number | null;
    specializationId: number | null;
  };

  export type SpecializationsForWorkersMinAggregateOutputType = {
    workerInfoId: number | null;
    specializationId: number | null;
  };

  export type SpecializationsForWorkersMaxAggregateOutputType = {
    workerInfoId: number | null;
    specializationId: number | null;
  };

  export type SpecializationsForWorkersCountAggregateOutputType = {
    workerInfoId: number;
    specializationId: number;
    _all: number;
  };

  export type SpecializationsForWorkersAvgAggregateInputType = {
    workerInfoId?: true;
    specializationId?: true;
  };

  export type SpecializationsForWorkersSumAggregateInputType = {
    workerInfoId?: true;
    specializationId?: true;
  };

  export type SpecializationsForWorkersMinAggregateInputType = {
    workerInfoId?: true;
    specializationId?: true;
  };

  export type SpecializationsForWorkersMaxAggregateInputType = {
    workerInfoId?: true;
    specializationId?: true;
  };

  export type SpecializationsForWorkersCountAggregateInputType = {
    workerInfoId?: true;
    specializationId?: true;
    _all?: true;
  };

  export type SpecializationsForWorkersAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SpecializationsForWorkers to aggregate.
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SpecializationsForWorkers to fetch.
     */
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SpecializationsForWorkers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SpecializationsForWorkers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned SpecializationsForWorkers
     **/
    _count?: true | SpecializationsForWorkersCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: SpecializationsForWorkersAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: SpecializationsForWorkersSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SpecializationsForWorkersMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SpecializationsForWorkersMaxAggregateInputType;
  };

  export type GetSpecializationsForWorkersAggregateType<
    T extends SpecializationsForWorkersAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateSpecializationsForWorkers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSpecializationsForWorkers[P]>
      : GetScalarType<T[P], AggregateSpecializationsForWorkers[P]>;
  };

  export type SpecializationsForWorkersGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SpecializationsForWorkersWhereInput;
    orderBy?:
      | SpecializationsForWorkersOrderByWithAggregationInput
      | SpecializationsForWorkersOrderByWithAggregationInput[];
    by: SpecializationsForWorkersScalarFieldEnum[] | SpecializationsForWorkersScalarFieldEnum;
    having?: SpecializationsForWorkersScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SpecializationsForWorkersCountAggregateInputType | true;
    _avg?: SpecializationsForWorkersAvgAggregateInputType;
    _sum?: SpecializationsForWorkersSumAggregateInputType;
    _min?: SpecializationsForWorkersMinAggregateInputType;
    _max?: SpecializationsForWorkersMaxAggregateInputType;
  };

  export type SpecializationsForWorkersGroupByOutputType = {
    workerInfoId: number;
    specializationId: number;
    _count: SpecializationsForWorkersCountAggregateOutputType | null;
    _avg: SpecializationsForWorkersAvgAggregateOutputType | null;
    _sum: SpecializationsForWorkersSumAggregateOutputType | null;
    _min: SpecializationsForWorkersMinAggregateOutputType | null;
    _max: SpecializationsForWorkersMaxAggregateOutputType | null;
  };

  type GetSpecializationsForWorkersGroupByPayload<T extends SpecializationsForWorkersGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<SpecializationsForWorkersGroupByOutputType, T['by']> & {
          [P in keyof T & keyof SpecializationsForWorkersGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SpecializationsForWorkersGroupByOutputType[P]>
            : GetScalarType<T[P], SpecializationsForWorkersGroupByOutputType[P]>;
        }
      >
    >;

  export type SpecializationsForWorkersSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      workerInfoId?: boolean;
      specializationId?: boolean;
      workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
      specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['specializationsForWorkers']
  >;

  export type SpecializationsForWorkersSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      workerInfoId?: boolean;
      specializationId?: boolean;
      workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
      specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['specializationsForWorkers']
  >;

  export type SpecializationsForWorkersSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      workerInfoId?: boolean;
      specializationId?: boolean;
      workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
      specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['specializationsForWorkers']
  >;

  export type SpecializationsForWorkersSelectScalar = {
    workerInfoId?: boolean;
    specializationId?: boolean;
  };

  export type SpecializationsForWorkersOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'workerInfoId' | 'specializationId',
    ExtArgs['result']['specializationsForWorkers']
  >;
  export type SpecializationsForWorkersInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
    specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
  };
  export type SpecializationsForWorkersIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
    specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
  };
  export type SpecializationsForWorkersIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workerInfo?: boolean | WorkerInfoDefaultArgs<ExtArgs>;
    specialization?: boolean | SpecializationDefaultArgs<ExtArgs>;
  };

  export type $SpecializationsForWorkersPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'SpecializationsForWorkers';
    objects: {
      workerInfo: Prisma.$WorkerInfoPayload<ExtArgs>;
      specialization: Prisma.$SpecializationPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        workerInfoId: number;
        specializationId: number;
      },
      ExtArgs['result']['specializationsForWorkers']
    >;
    composites: {};
  };

  type SpecializationsForWorkersGetPayload<
    S extends boolean | null | undefined | SpecializationsForWorkersDefaultArgs,
  > = $Result.GetResult<Prisma.$SpecializationsForWorkersPayload, S>;

  type SpecializationsForWorkersCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<SpecializationsForWorkersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SpecializationsForWorkersCountAggregateInputType | true;
  };

  export interface SpecializationsForWorkersDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['SpecializationsForWorkers'];
      meta: { name: 'SpecializationsForWorkers' };
    };
    /**
     * Find zero or one SpecializationsForWorkers that matches the filter.
     * @param {SpecializationsForWorkersFindUniqueArgs} args - Arguments to find a SpecializationsForWorkers
     * @example
     * // Get one SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SpecializationsForWorkersFindUniqueArgs>(
      args: SelectSubset<T, SpecializationsForWorkersFindUniqueArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one SpecializationsForWorkers that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SpecializationsForWorkersFindUniqueOrThrowArgs} args - Arguments to find a SpecializationsForWorkers
     * @example
     * // Get one SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SpecializationsForWorkersFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SpecializationsForWorkersFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SpecializationsForWorkers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersFindFirstArgs} args - Arguments to find a SpecializationsForWorkers
     * @example
     * // Get one SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SpecializationsForWorkersFindFirstArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersFindFirstArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SpecializationsForWorkers that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersFindFirstOrThrowArgs} args - Arguments to find a SpecializationsForWorkers
     * @example
     * // Get one SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SpecializationsForWorkersFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more SpecializationsForWorkers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findMany()
     *
     * // Get first 10 SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.findMany({ take: 10 })
     *
     * // Only select the `workerInfoId`
     * const specializationsForWorkersWithWorkerInfoIdOnly = await prisma.specializationsForWorkers.findMany({ select: { workerInfoId: true } })
     *
     */
    findMany<T extends SpecializationsForWorkersFindManyArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a SpecializationsForWorkers.
     * @param {SpecializationsForWorkersCreateArgs} args - Arguments to create a SpecializationsForWorkers.
     * @example
     * // Create one SpecializationsForWorkers
     * const SpecializationsForWorkers = await prisma.specializationsForWorkers.create({
     *   data: {
     *     // ... data to create a SpecializationsForWorkers
     *   }
     * })
     *
     */
    create<T extends SpecializationsForWorkersCreateArgs>(
      args: SelectSubset<T, SpecializationsForWorkersCreateArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many SpecializationsForWorkers.
     * @param {SpecializationsForWorkersCreateManyArgs} args - Arguments to create many SpecializationsForWorkers.
     * @example
     * // Create many SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SpecializationsForWorkersCreateManyArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many SpecializationsForWorkers and returns the data saved in the database.
     * @param {SpecializationsForWorkersCreateManyAndReturnArgs} args - Arguments to create many SpecializationsForWorkers.
     * @example
     * // Create many SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many SpecializationsForWorkers and only return the `workerInfoId`
     * const specializationsForWorkersWithWorkerInfoIdOnly = await prisma.specializationsForWorkers.createManyAndReturn({
     *   select: { workerInfoId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SpecializationsForWorkersCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a SpecializationsForWorkers.
     * @param {SpecializationsForWorkersDeleteArgs} args - Arguments to delete one SpecializationsForWorkers.
     * @example
     * // Delete one SpecializationsForWorkers
     * const SpecializationsForWorkers = await prisma.specializationsForWorkers.delete({
     *   where: {
     *     // ... filter to delete one SpecializationsForWorkers
     *   }
     * })
     *
     */
    delete<T extends SpecializationsForWorkersDeleteArgs>(
      args: SelectSubset<T, SpecializationsForWorkersDeleteArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one SpecializationsForWorkers.
     * @param {SpecializationsForWorkersUpdateArgs} args - Arguments to update one SpecializationsForWorkers.
     * @example
     * // Update one SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SpecializationsForWorkersUpdateArgs>(
      args: SelectSubset<T, SpecializationsForWorkersUpdateArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more SpecializationsForWorkers.
     * @param {SpecializationsForWorkersDeleteManyArgs} args - Arguments to filter SpecializationsForWorkers to delete.
     * @example
     * // Delete a few SpecializationsForWorkers
     * const { count } = await prisma.specializationsForWorkers.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SpecializationsForWorkersDeleteManyArgs>(
      args?: SelectSubset<T, SpecializationsForWorkersDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SpecializationsForWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SpecializationsForWorkersUpdateManyArgs>(
      args: SelectSubset<T, SpecializationsForWorkersUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SpecializationsForWorkers and returns the data updated in the database.
     * @param {SpecializationsForWorkersUpdateManyAndReturnArgs} args - Arguments to update many SpecializationsForWorkers.
     * @example
     * // Update many SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more SpecializationsForWorkers and only return the `workerInfoId`
     * const specializationsForWorkersWithWorkerInfoIdOnly = await prisma.specializationsForWorkers.updateManyAndReturn({
     *   select: { workerInfoId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SpecializationsForWorkersUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SpecializationsForWorkersUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one SpecializationsForWorkers.
     * @param {SpecializationsForWorkersUpsertArgs} args - Arguments to update or create a SpecializationsForWorkers.
     * @example
     * // Update or create a SpecializationsForWorkers
     * const specializationsForWorkers = await prisma.specializationsForWorkers.upsert({
     *   create: {
     *     // ... data to create a SpecializationsForWorkers
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SpecializationsForWorkers we want to update
     *   }
     * })
     */
    upsert<T extends SpecializationsForWorkersUpsertArgs>(
      args: SelectSubset<T, SpecializationsForWorkersUpsertArgs<ExtArgs>>
    ): Prisma__SpecializationsForWorkersClient<
      $Result.GetResult<
        Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of SpecializationsForWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersCountArgs} args - Arguments to filter SpecializationsForWorkers to count.
     * @example
     * // Count the number of SpecializationsForWorkers
     * const count = await prisma.specializationsForWorkers.count({
     *   where: {
     *     // ... the filter for the SpecializationsForWorkers we want to count
     *   }
     * })
     **/
    count<T extends SpecializationsForWorkersCountArgs>(
      args?: Subset<T, SpecializationsForWorkersCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SpecializationsForWorkersCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a SpecializationsForWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SpecializationsForWorkersAggregateArgs>(
      args: Subset<T, SpecializationsForWorkersAggregateArgs>
    ): Prisma.PrismaPromise<GetSpecializationsForWorkersAggregateType<T>>;

    /**
     * Group by SpecializationsForWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationsForWorkersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SpecializationsForWorkersGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SpecializationsForWorkersGroupByArgs['orderBy'] }
        : { orderBy?: SpecializationsForWorkersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SpecializationsForWorkersGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetSpecializationsForWorkersGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the SpecializationsForWorkers model
     */
    readonly fields: SpecializationsForWorkersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SpecializationsForWorkers.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SpecializationsForWorkersClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    workerInfo<T extends WorkerInfoDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, WorkerInfoDefaultArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      | $Result.GetResult<
          Prisma.$WorkerInfoPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    specialization<T extends SpecializationDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, SpecializationDefaultArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      | $Result.GetResult<
          Prisma.$SpecializationPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the SpecializationsForWorkers model
   */
  interface SpecializationsForWorkersFieldRefs {
    readonly workerInfoId: FieldRef<'SpecializationsForWorkers', 'Int'>;
    readonly specializationId: FieldRef<'SpecializationsForWorkers', 'Int'>;
  }

  // Custom InputTypes
  /**
   * SpecializationsForWorkers findUnique
   */
  export type SpecializationsForWorkersFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter, which SpecializationsForWorkers to fetch.
     */
    where: SpecializationsForWorkersWhereUniqueInput;
  };

  /**
   * SpecializationsForWorkers findUniqueOrThrow
   */
  export type SpecializationsForWorkersFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter, which SpecializationsForWorkers to fetch.
     */
    where: SpecializationsForWorkersWhereUniqueInput;
  };

  /**
   * SpecializationsForWorkers findFirst
   */
  export type SpecializationsForWorkersFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter, which SpecializationsForWorkers to fetch.
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SpecializationsForWorkers to fetch.
     */
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SpecializationsForWorkers.
     */
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SpecializationsForWorkers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SpecializationsForWorkers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SpecializationsForWorkers.
     */
    distinct?:
      | SpecializationsForWorkersScalarFieldEnum
      | SpecializationsForWorkersScalarFieldEnum[];
  };

  /**
   * SpecializationsForWorkers findFirstOrThrow
   */
  export type SpecializationsForWorkersFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter, which SpecializationsForWorkers to fetch.
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SpecializationsForWorkers to fetch.
     */
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SpecializationsForWorkers.
     */
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SpecializationsForWorkers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SpecializationsForWorkers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SpecializationsForWorkers.
     */
    distinct?:
      | SpecializationsForWorkersScalarFieldEnum
      | SpecializationsForWorkersScalarFieldEnum[];
  };

  /**
   * SpecializationsForWorkers findMany
   */
  export type SpecializationsForWorkersFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter, which SpecializationsForWorkers to fetch.
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SpecializationsForWorkers to fetch.
     */
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing SpecializationsForWorkers.
     */
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SpecializationsForWorkers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SpecializationsForWorkers.
     */
    skip?: number;
    distinct?:
      | SpecializationsForWorkersScalarFieldEnum
      | SpecializationsForWorkersScalarFieldEnum[];
  };

  /**
   * SpecializationsForWorkers create
   */
  export type SpecializationsForWorkersCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * The data needed to create a SpecializationsForWorkers.
     */
    data: XOR<SpecializationsForWorkersCreateInput, SpecializationsForWorkersUncheckedCreateInput>;
  };

  /**
   * SpecializationsForWorkers createMany
   */
  export type SpecializationsForWorkersCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many SpecializationsForWorkers.
     */
    data: SpecializationsForWorkersCreateManyInput | SpecializationsForWorkersCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * SpecializationsForWorkers createManyAndReturn
   */
  export type SpecializationsForWorkersCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * The data used to create many SpecializationsForWorkers.
     */
    data: SpecializationsForWorkersCreateManyInput | SpecializationsForWorkersCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * SpecializationsForWorkers update
   */
  export type SpecializationsForWorkersUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * The data needed to update a SpecializationsForWorkers.
     */
    data: XOR<SpecializationsForWorkersUpdateInput, SpecializationsForWorkersUncheckedUpdateInput>;
    /**
     * Choose, which SpecializationsForWorkers to update.
     */
    where: SpecializationsForWorkersWhereUniqueInput;
  };

  /**
   * SpecializationsForWorkers updateMany
   */
  export type SpecializationsForWorkersUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update SpecializationsForWorkers.
     */
    data: XOR<
      SpecializationsForWorkersUpdateManyMutationInput,
      SpecializationsForWorkersUncheckedUpdateManyInput
    >;
    /**
     * Filter which SpecializationsForWorkers to update
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * Limit how many SpecializationsForWorkers to update.
     */
    limit?: number;
  };

  /**
   * SpecializationsForWorkers updateManyAndReturn
   */
  export type SpecializationsForWorkersUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * The data used to update SpecializationsForWorkers.
     */
    data: XOR<
      SpecializationsForWorkersUpdateManyMutationInput,
      SpecializationsForWorkersUncheckedUpdateManyInput
    >;
    /**
     * Filter which SpecializationsForWorkers to update
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * Limit how many SpecializationsForWorkers to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * SpecializationsForWorkers upsert
   */
  export type SpecializationsForWorkersUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * The filter to search for the SpecializationsForWorkers to update in case it exists.
     */
    where: SpecializationsForWorkersWhereUniqueInput;
    /**
     * In case the SpecializationsForWorkers found by the `where` argument doesn't exist, create a new SpecializationsForWorkers with this data.
     */
    create: XOR<
      SpecializationsForWorkersCreateInput,
      SpecializationsForWorkersUncheckedCreateInput
    >;
    /**
     * In case the SpecializationsForWorkers was found with the provided `where` argument, update it with this data.
     */
    update: XOR<
      SpecializationsForWorkersUpdateInput,
      SpecializationsForWorkersUncheckedUpdateInput
    >;
  };

  /**
   * SpecializationsForWorkers delete
   */
  export type SpecializationsForWorkersDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    /**
     * Filter which SpecializationsForWorkers to delete.
     */
    where: SpecializationsForWorkersWhereUniqueInput;
  };

  /**
   * SpecializationsForWorkers deleteMany
   */
  export type SpecializationsForWorkersDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SpecializationsForWorkers to delete
     */
    where?: SpecializationsForWorkersWhereInput;
    /**
     * Limit how many SpecializationsForWorkers to delete.
     */
    limit?: number;
  };

  /**
   * SpecializationsForWorkers without action
   */
  export type SpecializationsForWorkersDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
  };

  /**
   * Model Specialization
   */

  export type AggregateSpecialization = {
    _count: SpecializationCountAggregateOutputType | null;
    _avg: SpecializationAvgAggregateOutputType | null;
    _sum: SpecializationSumAggregateOutputType | null;
    _min: SpecializationMinAggregateOutputType | null;
    _max: SpecializationMaxAggregateOutputType | null;
  };

  export type SpecializationAvgAggregateOutputType = {
    id: number | null;
  };

  export type SpecializationSumAggregateOutputType = {
    id: number | null;
  };

  export type SpecializationMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    field: string | null;
  };

  export type SpecializationMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    field: string | null;
  };

  export type SpecializationCountAggregateOutputType = {
    id: number;
    name: number;
    field: number;
    _all: number;
  };

  export type SpecializationAvgAggregateInputType = {
    id?: true;
  };

  export type SpecializationSumAggregateInputType = {
    id?: true;
  };

  export type SpecializationMinAggregateInputType = {
    id?: true;
    name?: true;
    field?: true;
  };

  export type SpecializationMaxAggregateInputType = {
    id?: true;
    name?: true;
    field?: true;
  };

  export type SpecializationCountAggregateInputType = {
    id?: true;
    name?: true;
    field?: true;
    _all?: true;
  };

  export type SpecializationAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Specialization to aggregate.
     */
    where?: SpecializationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Specializations to fetch.
     */
    orderBy?: SpecializationOrderByWithRelationInput | SpecializationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SpecializationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Specializations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Specializations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Specializations
     **/
    _count?: true | SpecializationCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: SpecializationAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: SpecializationSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SpecializationMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SpecializationMaxAggregateInputType;
  };

  export type GetSpecializationAggregateType<T extends SpecializationAggregateArgs> = {
    [P in keyof T & keyof AggregateSpecialization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSpecialization[P]>
      : GetScalarType<T[P], AggregateSpecialization[P]>;
  };

  export type SpecializationGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SpecializationWhereInput;
    orderBy?:
      | SpecializationOrderByWithAggregationInput
      | SpecializationOrderByWithAggregationInput[];
    by: SpecializationScalarFieldEnum[] | SpecializationScalarFieldEnum;
    having?: SpecializationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SpecializationCountAggregateInputType | true;
    _avg?: SpecializationAvgAggregateInputType;
    _sum?: SpecializationSumAggregateInputType;
    _min?: SpecializationMinAggregateInputType;
    _max?: SpecializationMaxAggregateInputType;
  };

  export type SpecializationGroupByOutputType = {
    id: number;
    name: string;
    field: string;
    _count: SpecializationCountAggregateOutputType | null;
    _avg: SpecializationAvgAggregateOutputType | null;
    _sum: SpecializationSumAggregateOutputType | null;
    _min: SpecializationMinAggregateOutputType | null;
    _max: SpecializationMaxAggregateOutputType | null;
  };

  type GetSpecializationGroupByPayload<T extends SpecializationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SpecializationGroupByOutputType, T['by']> & {
        [P in keyof T & keyof SpecializationGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], SpecializationGroupByOutputType[P]>
          : GetScalarType<T[P], SpecializationGroupByOutputType[P]>;
      }
    >
  >;

  export type SpecializationSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      field?: boolean;
      secondaryWorkers?: boolean | Specialization$secondaryWorkersArgs<ExtArgs>;
      primaryWorkers?: boolean | Specialization$primaryWorkersArgs<ExtArgs>;
      _count?: boolean | SpecializationCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['specialization']
  >;

  export type SpecializationSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      field?: boolean;
    },
    ExtArgs['result']['specialization']
  >;

  export type SpecializationSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      field?: boolean;
    },
    ExtArgs['result']['specialization']
  >;

  export type SpecializationSelectScalar = {
    id?: boolean;
    name?: boolean;
    field?: boolean;
  };

  export type SpecializationOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<'id' | 'name' | 'field', ExtArgs['result']['specialization']>;
  export type SpecializationInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    secondaryWorkers?: boolean | Specialization$secondaryWorkersArgs<ExtArgs>;
    primaryWorkers?: boolean | Specialization$primaryWorkersArgs<ExtArgs>;
    _count?: boolean | SpecializationCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type SpecializationIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type SpecializationIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $SpecializationPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Specialization';
    objects: {
      secondaryWorkers: Prisma.$SpecializationsForWorkersPayload<ExtArgs>[];
      primaryWorkers: Prisma.$WorkerInfoPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        name: string;
        field: string;
      },
      ExtArgs['result']['specialization']
    >;
    composites: {};
  };

  type SpecializationGetPayload<S extends boolean | null | undefined | SpecializationDefaultArgs> =
    $Result.GetResult<Prisma.$SpecializationPayload, S>;

  type SpecializationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SpecializationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SpecializationCountAggregateInputType | true;
    };

  export interface SpecializationDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Specialization'];
      meta: { name: 'Specialization' };
    };
    /**
     * Find zero or one Specialization that matches the filter.
     * @param {SpecializationFindUniqueArgs} args - Arguments to find a Specialization
     * @example
     * // Get one Specialization
     * const specialization = await prisma.specialization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SpecializationFindUniqueArgs>(
      args: SelectSubset<T, SpecializationFindUniqueArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Specialization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SpecializationFindUniqueOrThrowArgs} args - Arguments to find a Specialization
     * @example
     * // Get one Specialization
     * const specialization = await prisma.specialization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SpecializationFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SpecializationFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Specialization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationFindFirstArgs} args - Arguments to find a Specialization
     * @example
     * // Get one Specialization
     * const specialization = await prisma.specialization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SpecializationFindFirstArgs>(
      args?: SelectSubset<T, SpecializationFindFirstArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Specialization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationFindFirstOrThrowArgs} args - Arguments to find a Specialization
     * @example
     * // Get one Specialization
     * const specialization = await prisma.specialization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SpecializationFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SpecializationFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Specializations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Specializations
     * const specializations = await prisma.specialization.findMany()
     *
     * // Get first 10 Specializations
     * const specializations = await prisma.specialization.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const specializationWithIdOnly = await prisma.specialization.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SpecializationFindManyArgs>(
      args?: SelectSubset<T, SpecializationFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$SpecializationPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a Specialization.
     * @param {SpecializationCreateArgs} args - Arguments to create a Specialization.
     * @example
     * // Create one Specialization
     * const Specialization = await prisma.specialization.create({
     *   data: {
     *     // ... data to create a Specialization
     *   }
     * })
     *
     */
    create<T extends SpecializationCreateArgs>(
      args: SelectSubset<T, SpecializationCreateArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<Prisma.$SpecializationPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Specializations.
     * @param {SpecializationCreateManyArgs} args - Arguments to create many Specializations.
     * @example
     * // Create many Specializations
     * const specialization = await prisma.specialization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SpecializationCreateManyArgs>(
      args?: SelectSubset<T, SpecializationCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Specializations and returns the data saved in the database.
     * @param {SpecializationCreateManyAndReturnArgs} args - Arguments to create many Specializations.
     * @example
     * // Create many Specializations
     * const specialization = await prisma.specialization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Specializations and only return the `id`
     * const specializationWithIdOnly = await prisma.specialization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SpecializationCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SpecializationCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Specialization.
     * @param {SpecializationDeleteArgs} args - Arguments to delete one Specialization.
     * @example
     * // Delete one Specialization
     * const Specialization = await prisma.specialization.delete({
     *   where: {
     *     // ... filter to delete one Specialization
     *   }
     * })
     *
     */
    delete<T extends SpecializationDeleteArgs>(
      args: SelectSubset<T, SpecializationDeleteArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<Prisma.$SpecializationPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Specialization.
     * @param {SpecializationUpdateArgs} args - Arguments to update one Specialization.
     * @example
     * // Update one Specialization
     * const specialization = await prisma.specialization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SpecializationUpdateArgs>(
      args: SelectSubset<T, SpecializationUpdateArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<Prisma.$SpecializationPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Specializations.
     * @param {SpecializationDeleteManyArgs} args - Arguments to filter Specializations to delete.
     * @example
     * // Delete a few Specializations
     * const { count } = await prisma.specialization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SpecializationDeleteManyArgs>(
      args?: SelectSubset<T, SpecializationDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Specializations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Specializations
     * const specialization = await prisma.specialization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SpecializationUpdateManyArgs>(
      args: SelectSubset<T, SpecializationUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Specializations and returns the data updated in the database.
     * @param {SpecializationUpdateManyAndReturnArgs} args - Arguments to update many Specializations.
     * @example
     * // Update many Specializations
     * const specialization = await prisma.specialization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Specializations and only return the `id`
     * const specializationWithIdOnly = await prisma.specialization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SpecializationUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SpecializationUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SpecializationPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Specialization.
     * @param {SpecializationUpsertArgs} args - Arguments to update or create a Specialization.
     * @example
     * // Update or create a Specialization
     * const specialization = await prisma.specialization.upsert({
     *   create: {
     *     // ... data to create a Specialization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Specialization we want to update
     *   }
     * })
     */
    upsert<T extends SpecializationUpsertArgs>(
      args: SelectSubset<T, SpecializationUpsertArgs<ExtArgs>>
    ): Prisma__SpecializationClient<
      $Result.GetResult<Prisma.$SpecializationPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Specializations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationCountArgs} args - Arguments to filter Specializations to count.
     * @example
     * // Count the number of Specializations
     * const count = await prisma.specialization.count({
     *   where: {
     *     // ... the filter for the Specializations we want to count
     *   }
     * })
     **/
    count<T extends SpecializationCountArgs>(
      args?: Subset<T, SpecializationCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SpecializationCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Specialization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SpecializationAggregateArgs>(
      args: Subset<T, SpecializationAggregateArgs>
    ): Prisma.PrismaPromise<GetSpecializationAggregateType<T>>;

    /**
     * Group by Specialization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SpecializationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SpecializationGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SpecializationGroupByArgs['orderBy'] }
        : { orderBy?: SpecializationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SpecializationGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetSpecializationGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Specialization model
     */
    readonly fields: SpecializationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Specialization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SpecializationClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    secondaryWorkers<T extends Specialization$secondaryWorkersArgs<ExtArgs> = {}>(
      args?: Subset<T, Specialization$secondaryWorkersArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$SpecializationsForWorkersPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    primaryWorkers<T extends Specialization$primaryWorkersArgs<ExtArgs> = {}>(
      args?: Subset<T, Specialization$primaryWorkersArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WorkerInfoPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Specialization model
   */
  interface SpecializationFieldRefs {
    readonly id: FieldRef<'Specialization', 'Int'>;
    readonly name: FieldRef<'Specialization', 'String'>;
    readonly field: FieldRef<'Specialization', 'String'>;
  }

  // Custom InputTypes
  /**
   * Specialization findUnique
   */
  export type SpecializationFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter, which Specialization to fetch.
     */
    where: SpecializationWhereUniqueInput;
  };

  /**
   * Specialization findUniqueOrThrow
   */
  export type SpecializationFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter, which Specialization to fetch.
     */
    where: SpecializationWhereUniqueInput;
  };

  /**
   * Specialization findFirst
   */
  export type SpecializationFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter, which Specialization to fetch.
     */
    where?: SpecializationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Specializations to fetch.
     */
    orderBy?: SpecializationOrderByWithRelationInput | SpecializationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Specializations.
     */
    cursor?: SpecializationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Specializations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Specializations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Specializations.
     */
    distinct?: SpecializationScalarFieldEnum | SpecializationScalarFieldEnum[];
  };

  /**
   * Specialization findFirstOrThrow
   */
  export type SpecializationFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter, which Specialization to fetch.
     */
    where?: SpecializationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Specializations to fetch.
     */
    orderBy?: SpecializationOrderByWithRelationInput | SpecializationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Specializations.
     */
    cursor?: SpecializationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Specializations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Specializations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Specializations.
     */
    distinct?: SpecializationScalarFieldEnum | SpecializationScalarFieldEnum[];
  };

  /**
   * Specialization findMany
   */
  export type SpecializationFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter, which Specializations to fetch.
     */
    where?: SpecializationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Specializations to fetch.
     */
    orderBy?: SpecializationOrderByWithRelationInput | SpecializationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Specializations.
     */
    cursor?: SpecializationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Specializations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Specializations.
     */
    skip?: number;
    distinct?: SpecializationScalarFieldEnum | SpecializationScalarFieldEnum[];
  };

  /**
   * Specialization create
   */
  export type SpecializationCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * The data needed to create a Specialization.
     */
    data: XOR<SpecializationCreateInput, SpecializationUncheckedCreateInput>;
  };

  /**
   * Specialization createMany
   */
  export type SpecializationCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Specializations.
     */
    data: SpecializationCreateManyInput | SpecializationCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Specialization createManyAndReturn
   */
  export type SpecializationCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * The data used to create many Specializations.
     */
    data: SpecializationCreateManyInput | SpecializationCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Specialization update
   */
  export type SpecializationUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * The data needed to update a Specialization.
     */
    data: XOR<SpecializationUpdateInput, SpecializationUncheckedUpdateInput>;
    /**
     * Choose, which Specialization to update.
     */
    where: SpecializationWhereUniqueInput;
  };

  /**
   * Specialization updateMany
   */
  export type SpecializationUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Specializations.
     */
    data: XOR<SpecializationUpdateManyMutationInput, SpecializationUncheckedUpdateManyInput>;
    /**
     * Filter which Specializations to update
     */
    where?: SpecializationWhereInput;
    /**
     * Limit how many Specializations to update.
     */
    limit?: number;
  };

  /**
   * Specialization updateManyAndReturn
   */
  export type SpecializationUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * The data used to update Specializations.
     */
    data: XOR<SpecializationUpdateManyMutationInput, SpecializationUncheckedUpdateManyInput>;
    /**
     * Filter which Specializations to update
     */
    where?: SpecializationWhereInput;
    /**
     * Limit how many Specializations to update.
     */
    limit?: number;
  };

  /**
   * Specialization upsert
   */
  export type SpecializationUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * The filter to search for the Specialization to update in case it exists.
     */
    where: SpecializationWhereUniqueInput;
    /**
     * In case the Specialization found by the `where` argument doesn't exist, create a new Specialization with this data.
     */
    create: XOR<SpecializationCreateInput, SpecializationUncheckedCreateInput>;
    /**
     * In case the Specialization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SpecializationUpdateInput, SpecializationUncheckedUpdateInput>;
  };

  /**
   * Specialization delete
   */
  export type SpecializationDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
    /**
     * Filter which Specialization to delete.
     */
    where: SpecializationWhereUniqueInput;
  };

  /**
   * Specialization deleteMany
   */
  export type SpecializationDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Specializations to delete
     */
    where?: SpecializationWhereInput;
    /**
     * Limit how many Specializations to delete.
     */
    limit?: number;
  };

  /**
   * Specialization.secondaryWorkers
   */
  export type Specialization$secondaryWorkersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SpecializationsForWorkers
     */
    select?: SpecializationsForWorkersSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SpecializationsForWorkers
     */
    omit?: SpecializationsForWorkersOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationsForWorkersInclude<ExtArgs> | null;
    where?: SpecializationsForWorkersWhereInput;
    orderBy?:
      | SpecializationsForWorkersOrderByWithRelationInput
      | SpecializationsForWorkersOrderByWithRelationInput[];
    cursor?: SpecializationsForWorkersWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | SpecializationsForWorkersScalarFieldEnum
      | SpecializationsForWorkersScalarFieldEnum[];
  };

  /**
   * Specialization.primaryWorkers
   */
  export type Specialization$primaryWorkersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    where?: WorkerInfoWhereInput;
    orderBy?: WorkerInfoOrderByWithRelationInput | WorkerInfoOrderByWithRelationInput[];
    cursor?: WorkerInfoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: WorkerInfoScalarFieldEnum | WorkerInfoScalarFieldEnum[];
  };

  /**
   * Specialization without action
   */
  export type SpecializationDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Specialization
     */
    select?: SpecializationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Specialization
     */
    omit?: SpecializationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SpecializationInclude<ExtArgs> | null;
  };

  /**
   * Model Goverment
   */

  export type AggregateGoverment = {
    _count: GovermentCountAggregateOutputType | null;
    _avg: GovermentAvgAggregateOutputType | null;
    _sum: GovermentSumAggregateOutputType | null;
    _min: GovermentMinAggregateOutputType | null;
    _max: GovermentMaxAggregateOutputType | null;
  };

  export type GovermentAvgAggregateOutputType = {
    id: number | null;
    workerInfoId: number | null;
  };

  export type GovermentSumAggregateOutputType = {
    id: number | null;
    workerInfoId: number | null;
  };

  export type GovermentMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    workerInfoId: number | null;
  };

  export type GovermentMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    workerInfoId: number | null;
  };

  export type GovermentCountAggregateOutputType = {
    id: number;
    name: number;
    workerInfoId: number;
    _all: number;
  };

  export type GovermentAvgAggregateInputType = {
    id?: true;
    workerInfoId?: true;
  };

  export type GovermentSumAggregateInputType = {
    id?: true;
    workerInfoId?: true;
  };

  export type GovermentMinAggregateInputType = {
    id?: true;
    name?: true;
    workerInfoId?: true;
  };

  export type GovermentMaxAggregateInputType = {
    id?: true;
    name?: true;
    workerInfoId?: true;
  };

  export type GovermentCountAggregateInputType = {
    id?: true;
    name?: true;
    workerInfoId?: true;
    _all?: true;
  };

  export type GovermentAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Goverment to aggregate.
     */
    where?: GovermentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Goverments to fetch.
     */
    orderBy?: GovermentOrderByWithRelationInput | GovermentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: GovermentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Goverments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Goverments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Goverments
     **/
    _count?: true | GovermentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: GovermentAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: GovermentSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: GovermentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: GovermentMaxAggregateInputType;
  };

  export type GetGovermentAggregateType<T extends GovermentAggregateArgs> = {
    [P in keyof T & keyof AggregateGoverment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGoverment[P]>
      : GetScalarType<T[P], AggregateGoverment[P]>;
  };

  export type GovermentGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: GovermentWhereInput;
    orderBy?: GovermentOrderByWithAggregationInput | GovermentOrderByWithAggregationInput[];
    by: GovermentScalarFieldEnum[] | GovermentScalarFieldEnum;
    having?: GovermentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GovermentCountAggregateInputType | true;
    _avg?: GovermentAvgAggregateInputType;
    _sum?: GovermentSumAggregateInputType;
    _min?: GovermentMinAggregateInputType;
    _max?: GovermentMaxAggregateInputType;
  };

  export type GovermentGroupByOutputType = {
    id: number;
    name: string;
    workerInfoId: number | null;
    _count: GovermentCountAggregateOutputType | null;
    _avg: GovermentAvgAggregateOutputType | null;
    _sum: GovermentSumAggregateOutputType | null;
    _min: GovermentMinAggregateOutputType | null;
    _max: GovermentMaxAggregateOutputType | null;
  };

  type GetGovermentGroupByPayload<T extends GovermentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GovermentGroupByOutputType, T['by']> & {
        [P in keyof T & keyof GovermentGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], GovermentGroupByOutputType[P]>
          : GetScalarType<T[P], GovermentGroupByOutputType[P]>;
      }
    >
  >;

  export type GovermentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        name?: boolean;
        workerInfoId?: boolean;
        workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
      },
      ExtArgs['result']['goverment']
    >;

  export type GovermentSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      workerInfoId?: boolean;
      workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
    },
    ExtArgs['result']['goverment']
  >;

  export type GovermentSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      workerInfoId?: boolean;
      workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
    },
    ExtArgs['result']['goverment']
  >;

  export type GovermentSelectScalar = {
    id?: boolean;
    name?: boolean;
    workerInfoId?: boolean;
  };

  export type GovermentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<'id' | 'name' | 'workerInfoId', ExtArgs['result']['goverment']>;
  export type GovermentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
    };
  export type GovermentIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
  };
  export type GovermentIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workerInfo?: boolean | Goverment$workerInfoArgs<ExtArgs>;
  };

  export type $GovermentPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Goverment';
    objects: {
      workerInfo: Prisma.$WorkerInfoPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        name: string;
        workerInfoId: number | null;
      },
      ExtArgs['result']['goverment']
    >;
    composites: {};
  };

  type GovermentGetPayload<S extends boolean | null | undefined | GovermentDefaultArgs> =
    $Result.GetResult<Prisma.$GovermentPayload, S>;

  type GovermentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GovermentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GovermentCountAggregateInputType | true;
    };

  export interface GovermentDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Goverment'];
      meta: { name: 'Goverment' };
    };
    /**
     * Find zero or one Goverment that matches the filter.
     * @param {GovermentFindUniqueArgs} args - Arguments to find a Goverment
     * @example
     * // Get one Goverment
     * const goverment = await prisma.goverment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GovermentFindUniqueArgs>(
      args: SelectSubset<T, GovermentFindUniqueArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Goverment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GovermentFindUniqueOrThrowArgs} args - Arguments to find a Goverment
     * @example
     * // Get one Goverment
     * const goverment = await prisma.goverment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GovermentFindUniqueOrThrowArgs>(
      args: SelectSubset<T, GovermentFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Goverment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentFindFirstArgs} args - Arguments to find a Goverment
     * @example
     * // Get one Goverment
     * const goverment = await prisma.goverment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GovermentFindFirstArgs>(
      args?: SelectSubset<T, GovermentFindFirstArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Goverment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentFindFirstOrThrowArgs} args - Arguments to find a Goverment
     * @example
     * // Get one Goverment
     * const goverment = await prisma.goverment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GovermentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, GovermentFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Goverments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Goverments
     * const goverments = await prisma.goverment.findMany()
     *
     * // Get first 10 Goverments
     * const goverments = await prisma.goverment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const govermentWithIdOnly = await prisma.goverment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GovermentFindManyArgs>(
      args?: SelectSubset<T, GovermentFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a Goverment.
     * @param {GovermentCreateArgs} args - Arguments to create a Goverment.
     * @example
     * // Create one Goverment
     * const Goverment = await prisma.goverment.create({
     *   data: {
     *     // ... data to create a Goverment
     *   }
     * })
     *
     */
    create<T extends GovermentCreateArgs>(
      args: SelectSubset<T, GovermentCreateArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Goverments.
     * @param {GovermentCreateManyArgs} args - Arguments to create many Goverments.
     * @example
     * // Create many Goverments
     * const goverment = await prisma.goverment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GovermentCreateManyArgs>(
      args?: SelectSubset<T, GovermentCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Goverments and returns the data saved in the database.
     * @param {GovermentCreateManyAndReturnArgs} args - Arguments to create many Goverments.
     * @example
     * // Create many Goverments
     * const goverment = await prisma.goverment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Goverments and only return the `id`
     * const govermentWithIdOnly = await prisma.goverment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GovermentCreateManyAndReturnArgs>(
      args?: SelectSubset<T, GovermentCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Goverment.
     * @param {GovermentDeleteArgs} args - Arguments to delete one Goverment.
     * @example
     * // Delete one Goverment
     * const Goverment = await prisma.goverment.delete({
     *   where: {
     *     // ... filter to delete one Goverment
     *   }
     * })
     *
     */
    delete<T extends GovermentDeleteArgs>(
      args: SelectSubset<T, GovermentDeleteArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Goverment.
     * @param {GovermentUpdateArgs} args - Arguments to update one Goverment.
     * @example
     * // Update one Goverment
     * const goverment = await prisma.goverment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GovermentUpdateArgs>(
      args: SelectSubset<T, GovermentUpdateArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Goverments.
     * @param {GovermentDeleteManyArgs} args - Arguments to filter Goverments to delete.
     * @example
     * // Delete a few Goverments
     * const { count } = await prisma.goverment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GovermentDeleteManyArgs>(
      args?: SelectSubset<T, GovermentDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Goverments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Goverments
     * const goverment = await prisma.goverment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GovermentUpdateManyArgs>(
      args: SelectSubset<T, GovermentUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Goverments and returns the data updated in the database.
     * @param {GovermentUpdateManyAndReturnArgs} args - Arguments to update many Goverments.
     * @example
     * // Update many Goverments
     * const goverment = await prisma.goverment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Goverments and only return the `id`
     * const govermentWithIdOnly = await prisma.goverment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends GovermentUpdateManyAndReturnArgs>(
      args: SelectSubset<T, GovermentUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$GovermentPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Goverment.
     * @param {GovermentUpsertArgs} args - Arguments to update or create a Goverment.
     * @example
     * // Update or create a Goverment
     * const goverment = await prisma.goverment.upsert({
     *   create: {
     *     // ... data to create a Goverment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Goverment we want to update
     *   }
     * })
     */
    upsert<T extends GovermentUpsertArgs>(
      args: SelectSubset<T, GovermentUpsertArgs<ExtArgs>>
    ): Prisma__GovermentClient<
      $Result.GetResult<Prisma.$GovermentPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Goverments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentCountArgs} args - Arguments to filter Goverments to count.
     * @example
     * // Count the number of Goverments
     * const count = await prisma.goverment.count({
     *   where: {
     *     // ... the filter for the Goverments we want to count
     *   }
     * })
     **/
    count<T extends GovermentCountArgs>(
      args?: Subset<T, GovermentCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GovermentCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Goverment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends GovermentAggregateArgs>(
      args: Subset<T, GovermentAggregateArgs>
    ): Prisma.PrismaPromise<GetGovermentAggregateType<T>>;

    /**
     * Group by Goverment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GovermentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends GovermentGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GovermentGroupByArgs['orderBy'] }
        : { orderBy?: GovermentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, GovermentGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetGovermentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Goverment model
     */
    readonly fields: GovermentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Goverment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GovermentClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    workerInfo<T extends Goverment$workerInfoArgs<ExtArgs> = {}>(
      args?: Subset<T, Goverment$workerInfoArgs<ExtArgs>>
    ): Prisma__WorkerInfoClient<
      $Result.GetResult<
        Prisma.$WorkerInfoPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Goverment model
   */
  interface GovermentFieldRefs {
    readonly id: FieldRef<'Goverment', 'Int'>;
    readonly name: FieldRef<'Goverment', 'String'>;
    readonly workerInfoId: FieldRef<'Goverment', 'Int'>;
  }

  // Custom InputTypes
  /**
   * Goverment findUnique
   */
  export type GovermentFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter, which Goverment to fetch.
     */
    where: GovermentWhereUniqueInput;
  };

  /**
   * Goverment findUniqueOrThrow
   */
  export type GovermentFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter, which Goverment to fetch.
     */
    where: GovermentWhereUniqueInput;
  };

  /**
   * Goverment findFirst
   */
  export type GovermentFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter, which Goverment to fetch.
     */
    where?: GovermentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Goverments to fetch.
     */
    orderBy?: GovermentOrderByWithRelationInput | GovermentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Goverments.
     */
    cursor?: GovermentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Goverments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Goverments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Goverments.
     */
    distinct?: GovermentScalarFieldEnum | GovermentScalarFieldEnum[];
  };

  /**
   * Goverment findFirstOrThrow
   */
  export type GovermentFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter, which Goverment to fetch.
     */
    where?: GovermentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Goverments to fetch.
     */
    orderBy?: GovermentOrderByWithRelationInput | GovermentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Goverments.
     */
    cursor?: GovermentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Goverments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Goverments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Goverments.
     */
    distinct?: GovermentScalarFieldEnum | GovermentScalarFieldEnum[];
  };

  /**
   * Goverment findMany
   */
  export type GovermentFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter, which Goverments to fetch.
     */
    where?: GovermentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Goverments to fetch.
     */
    orderBy?: GovermentOrderByWithRelationInput | GovermentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Goverments.
     */
    cursor?: GovermentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Goverments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Goverments.
     */
    skip?: number;
    distinct?: GovermentScalarFieldEnum | GovermentScalarFieldEnum[];
  };

  /**
   * Goverment create
   */
  export type GovermentCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Goverment.
     */
    data: XOR<GovermentCreateInput, GovermentUncheckedCreateInput>;
  };

  /**
   * Goverment createMany
   */
  export type GovermentCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Goverments.
     */
    data: GovermentCreateManyInput | GovermentCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Goverment createManyAndReturn
   */
  export type GovermentCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * The data used to create many Goverments.
     */
    data: GovermentCreateManyInput | GovermentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Goverment update
   */
  export type GovermentUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Goverment.
     */
    data: XOR<GovermentUpdateInput, GovermentUncheckedUpdateInput>;
    /**
     * Choose, which Goverment to update.
     */
    where: GovermentWhereUniqueInput;
  };

  /**
   * Goverment updateMany
   */
  export type GovermentUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Goverments.
     */
    data: XOR<GovermentUpdateManyMutationInput, GovermentUncheckedUpdateManyInput>;
    /**
     * Filter which Goverments to update
     */
    where?: GovermentWhereInput;
    /**
     * Limit how many Goverments to update.
     */
    limit?: number;
  };

  /**
   * Goverment updateManyAndReturn
   */
  export type GovermentUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * The data used to update Goverments.
     */
    data: XOR<GovermentUpdateManyMutationInput, GovermentUncheckedUpdateManyInput>;
    /**
     * Filter which Goverments to update
     */
    where?: GovermentWhereInput;
    /**
     * Limit how many Goverments to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Goverment upsert
   */
  export type GovermentUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Goverment to update in case it exists.
     */
    where: GovermentWhereUniqueInput;
    /**
     * In case the Goverment found by the `where` argument doesn't exist, create a new Goverment with this data.
     */
    create: XOR<GovermentCreateInput, GovermentUncheckedCreateInput>;
    /**
     * In case the Goverment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GovermentUpdateInput, GovermentUncheckedUpdateInput>;
  };

  /**
   * Goverment delete
   */
  export type GovermentDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
    /**
     * Filter which Goverment to delete.
     */
    where: GovermentWhereUniqueInput;
  };

  /**
   * Goverment deleteMany
   */
  export type GovermentDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Goverments to delete
     */
    where?: GovermentWhereInput;
    /**
     * Limit how many Goverments to delete.
     */
    limit?: number;
  };

  /**
   * Goverment.workerInfo
   */
  export type Goverment$workerInfoArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkerInfo
     */
    select?: WorkerInfoSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WorkerInfo
     */
    omit?: WorkerInfoOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkerInfoInclude<ExtArgs> | null;
    where?: WorkerInfoWhereInput;
  };

  /**
   * Goverment without action
   */
  export type GovermentDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Goverment
     */
    select?: GovermentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Goverment
     */
    omit?: GovermentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GovermentInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const SessionScalarFieldEnum: {
    id: 'id';
    userId: 'userId';
    token: 'token';
    isRevoked: 'isRevoked';
    deviceFingerprint: 'deviceFingerprint';
    lastUsedAt: 'lastUsedAt';
    createdAt: 'createdAt';
    expiresAt: 'expiresAt';
  };

  export type SessionScalarFieldEnum =
    (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum];

  export const OTPsScalarFieldEnum: {
    attempts: 'attempts';
    phoneNumber: 'phoneNumber';
    hashedOTP: 'hashedOTP';
    updatedAt: 'updatedAt';
    expiresAt: 'expiresAt';
    createdAt: 'createdAt';
    InProcess: 'InProcess';
  };

  export type OTPsScalarFieldEnum = (typeof OTPsScalarFieldEnum)[keyof typeof OTPsScalarFieldEnum];

  export const UserScalarFieldEnum: {
    id: 'id';
    phoneNumber: 'phoneNumber';
    fristName: 'fristName';
    lastName: 'lastName';
    government: 'government';
    city: 'city';
    bio: 'bio';
    status: 'status';
    role: 'role';
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const WorkerInfoScalarFieldEnum: {
    id: 'id';
    userId: 'userId';
    experienceYears: 'experienceYears';
    isInTeam: 'isInTeam';
    acceptsUrgentJobs: 'acceptsUrgentJobs';
    primarySpecializationId: 'primarySpecializationId';
  };

  export type WorkerInfoScalarFieldEnum =
    (typeof WorkerInfoScalarFieldEnum)[keyof typeof WorkerInfoScalarFieldEnum];

  export const SpecializationsForWorkersScalarFieldEnum: {
    workerInfoId: 'workerInfoId';
    specializationId: 'specializationId';
  };

  export type SpecializationsForWorkersScalarFieldEnum =
    (typeof SpecializationsForWorkersScalarFieldEnum)[keyof typeof SpecializationsForWorkersScalarFieldEnum];

  export const SpecializationScalarFieldEnum: {
    id: 'id';
    name: 'name';
    field: 'field';
  };

  export type SpecializationScalarFieldEnum =
    (typeof SpecializationScalarFieldEnum)[keyof typeof SpecializationScalarFieldEnum];

  export const GovermentScalarFieldEnum: {
    id: 'id';
    name: 'name';
    workerInfoId: 'workerInfoId';
  };

  export type GovermentScalarFieldEnum =
    (typeof GovermentScalarFieldEnum)[keyof typeof GovermentScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'AccountStatus'
   */
  export type EnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'AccountStatus'
  >;

  /**
   * Reference to a field of type 'AccountStatus[]'
   */
  export type ListEnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'AccountStatus[]'
  >;

  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>;

  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;

  /**
   * Deep Input Types
   */

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[];
    OR?: SessionWhereInput[];
    NOT?: SessionWhereInput | SessionWhereInput[];
    id?: IntFilter<'Session'> | number;
    userId?: IntFilter<'Session'> | number;
    token?: StringFilter<'Session'> | string;
    isRevoked?: BoolFilter<'Session'> | boolean;
    deviceFingerprint?: StringFilter<'Session'> | string;
    lastUsedAt?: DateTimeFilter<'Session'> | Date | string;
    createdAt?: DateTimeFilter<'Session'> | Date | string;
    expiresAt?: DateTimeFilter<'Session'> | Date | string;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
  };

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    token?: SortOrder;
    isRevoked?: SortOrder;
    deviceFingerprint?: SortOrder;
    lastUsedAt?: SortOrder;
    createdAt?: SortOrder;
    expiresAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type SessionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      token?: string;
      deviceFingerprint?: string;
      AND?: SessionWhereInput | SessionWhereInput[];
      OR?: SessionWhereInput[];
      NOT?: SessionWhereInput | SessionWhereInput[];
      userId?: IntFilter<'Session'> | number;
      isRevoked?: BoolFilter<'Session'> | boolean;
      lastUsedAt?: DateTimeFilter<'Session'> | Date | string;
      createdAt?: DateTimeFilter<'Session'> | Date | string;
      expiresAt?: DateTimeFilter<'Session'> | Date | string;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    },
    'id' | 'token' | 'deviceFingerprint'
  >;

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    token?: SortOrder;
    isRevoked?: SortOrder;
    deviceFingerprint?: SortOrder;
    lastUsedAt?: SortOrder;
    createdAt?: SortOrder;
    expiresAt?: SortOrder;
    _count?: SessionCountOrderByAggregateInput;
    _avg?: SessionAvgOrderByAggregateInput;
    _max?: SessionMaxOrderByAggregateInput;
    _min?: SessionMinOrderByAggregateInput;
    _sum?: SessionSumOrderByAggregateInput;
  };

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[];
    OR?: SessionScalarWhereWithAggregatesInput[];
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Session'> | number;
    userId?: IntWithAggregatesFilter<'Session'> | number;
    token?: StringWithAggregatesFilter<'Session'> | string;
    isRevoked?: BoolWithAggregatesFilter<'Session'> | boolean;
    deviceFingerprint?: StringWithAggregatesFilter<'Session'> | string;
    lastUsedAt?: DateTimeWithAggregatesFilter<'Session'> | Date | string;
    createdAt?: DateTimeWithAggregatesFilter<'Session'> | Date | string;
    expiresAt?: DateTimeWithAggregatesFilter<'Session'> | Date | string;
  };

  export type OTPsWhereInput = {
    AND?: OTPsWhereInput | OTPsWhereInput[];
    OR?: OTPsWhereInput[];
    NOT?: OTPsWhereInput | OTPsWhereInput[];
    attempts?: IntFilter<'OTPs'> | number;
    phoneNumber?: StringFilter<'OTPs'> | string;
    hashedOTP?: StringFilter<'OTPs'> | string;
    updatedAt?: DateTimeFilter<'OTPs'> | Date | string;
    expiresAt?: DateTimeFilter<'OTPs'> | Date | string;
    createdAt?: DateTimeFilter<'OTPs'> | Date | string;
    InProcess?: BoolFilter<'OTPs'> | boolean;
  };

  export type OTPsOrderByWithRelationInput = {
    attempts?: SortOrder;
    phoneNumber?: SortOrder;
    hashedOTP?: SortOrder;
    updatedAt?: SortOrder;
    expiresAt?: SortOrder;
    createdAt?: SortOrder;
    InProcess?: SortOrder;
  };

  export type OTPsWhereUniqueInput = Prisma.AtLeast<
    {
      phoneNumber?: string;
      AND?: OTPsWhereInput | OTPsWhereInput[];
      OR?: OTPsWhereInput[];
      NOT?: OTPsWhereInput | OTPsWhereInput[];
      attempts?: IntFilter<'OTPs'> | number;
      hashedOTP?: StringFilter<'OTPs'> | string;
      updatedAt?: DateTimeFilter<'OTPs'> | Date | string;
      expiresAt?: DateTimeFilter<'OTPs'> | Date | string;
      createdAt?: DateTimeFilter<'OTPs'> | Date | string;
      InProcess?: BoolFilter<'OTPs'> | boolean;
    },
    'phoneNumber'
  >;

  export type OTPsOrderByWithAggregationInput = {
    attempts?: SortOrder;
    phoneNumber?: SortOrder;
    hashedOTP?: SortOrder;
    updatedAt?: SortOrder;
    expiresAt?: SortOrder;
    createdAt?: SortOrder;
    InProcess?: SortOrder;
    _count?: OTPsCountOrderByAggregateInput;
    _avg?: OTPsAvgOrderByAggregateInput;
    _max?: OTPsMaxOrderByAggregateInput;
    _min?: OTPsMinOrderByAggregateInput;
    _sum?: OTPsSumOrderByAggregateInput;
  };

  export type OTPsScalarWhereWithAggregatesInput = {
    AND?: OTPsScalarWhereWithAggregatesInput | OTPsScalarWhereWithAggregatesInput[];
    OR?: OTPsScalarWhereWithAggregatesInput[];
    NOT?: OTPsScalarWhereWithAggregatesInput | OTPsScalarWhereWithAggregatesInput[];
    attempts?: IntWithAggregatesFilter<'OTPs'> | number;
    phoneNumber?: StringWithAggregatesFilter<'OTPs'> | string;
    hashedOTP?: StringWithAggregatesFilter<'OTPs'> | string;
    updatedAt?: DateTimeWithAggregatesFilter<'OTPs'> | Date | string;
    expiresAt?: DateTimeWithAggregatesFilter<'OTPs'> | Date | string;
    createdAt?: DateTimeWithAggregatesFilter<'OTPs'> | Date | string;
    InProcess?: BoolWithAggregatesFilter<'OTPs'> | boolean;
  };

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: IntFilter<'User'> | number;
    phoneNumber?: StringFilter<'User'> | string;
    fristName?: StringFilter<'User'> | string;
    lastName?: StringFilter<'User'> | string;
    government?: StringFilter<'User'> | string;
    city?: StringFilter<'User'> | string;
    bio?: StringNullableFilter<'User'> | string | null;
    status?: EnumAccountStatusFilter<'User'> | $Enums.AccountStatus;
    role?: EnumRoleFilter<'User'> | $Enums.Role;
    sessions?: SessionListRelationFilter;
    workerInfo?: XOR<WorkerInfoNullableScalarRelationFilter, WorkerInfoWhereInput> | null;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    fristName?: SortOrder;
    lastName?: SortOrder;
    government?: SortOrder;
    city?: SortOrder;
    bio?: SortOrderInput | SortOrder;
    status?: SortOrder;
    role?: SortOrder;
    sessions?: SessionOrderByRelationAggregateInput;
    workerInfo?: WorkerInfoOrderByWithRelationInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      phoneNumber?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      fristName?: StringFilter<'User'> | string;
      lastName?: StringFilter<'User'> | string;
      government?: StringFilter<'User'> | string;
      city?: StringFilter<'User'> | string;
      bio?: StringNullableFilter<'User'> | string | null;
      status?: EnumAccountStatusFilter<'User'> | $Enums.AccountStatus;
      role?: EnumRoleFilter<'User'> | $Enums.Role;
      sessions?: SessionListRelationFilter;
      workerInfo?: XOR<WorkerInfoNullableScalarRelationFilter, WorkerInfoWhereInput> | null;
    },
    'id' | 'phoneNumber'
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    fristName?: SortOrder;
    lastName?: SortOrder;
    government?: SortOrder;
    city?: SortOrder;
    bio?: SortOrderInput | SortOrder;
    status?: SortOrder;
    role?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _avg?: UserAvgOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
    _sum?: UserSumOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'User'> | number;
    phoneNumber?: StringWithAggregatesFilter<'User'> | string;
    fristName?: StringWithAggregatesFilter<'User'> | string;
    lastName?: StringWithAggregatesFilter<'User'> | string;
    government?: StringWithAggregatesFilter<'User'> | string;
    city?: StringWithAggregatesFilter<'User'> | string;
    bio?: StringNullableWithAggregatesFilter<'User'> | string | null;
    status?: EnumAccountStatusWithAggregatesFilter<'User'> | $Enums.AccountStatus;
    role?: EnumRoleWithAggregatesFilter<'User'> | $Enums.Role;
  };

  export type WorkerInfoWhereInput = {
    AND?: WorkerInfoWhereInput | WorkerInfoWhereInput[];
    OR?: WorkerInfoWhereInput[];
    NOT?: WorkerInfoWhereInput | WorkerInfoWhereInput[];
    id?: IntFilter<'WorkerInfo'> | number;
    userId?: IntFilter<'WorkerInfo'> | number;
    experienceYears?: IntFilter<'WorkerInfo'> | number;
    isInTeam?: BoolFilter<'WorkerInfo'> | boolean;
    acceptsUrgentJobs?: BoolFilter<'WorkerInfo'> | boolean;
    primarySpecializationId?: IntFilter<'WorkerInfo'> | number;
    secondarySpecializations?: SpecializationsForWorkersListRelationFilter;
    primarySpecialization?: XOR<SpecializationScalarRelationFilter, SpecializationWhereInput>;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    goverments?: GovermentListRelationFilter;
  };

  export type WorkerInfoOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    isInTeam?: SortOrder;
    acceptsUrgentJobs?: SortOrder;
    primarySpecializationId?: SortOrder;
    secondarySpecializations?: SpecializationsForWorkersOrderByRelationAggregateInput;
    primarySpecialization?: SpecializationOrderByWithRelationInput;
    user?: UserOrderByWithRelationInput;
    goverments?: GovermentOrderByRelationAggregateInput;
  };

  export type WorkerInfoWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      userId?: number;
      AND?: WorkerInfoWhereInput | WorkerInfoWhereInput[];
      OR?: WorkerInfoWhereInput[];
      NOT?: WorkerInfoWhereInput | WorkerInfoWhereInput[];
      experienceYears?: IntFilter<'WorkerInfo'> | number;
      isInTeam?: BoolFilter<'WorkerInfo'> | boolean;
      acceptsUrgentJobs?: BoolFilter<'WorkerInfo'> | boolean;
      primarySpecializationId?: IntFilter<'WorkerInfo'> | number;
      secondarySpecializations?: SpecializationsForWorkersListRelationFilter;
      primarySpecialization?: XOR<SpecializationScalarRelationFilter, SpecializationWhereInput>;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
      goverments?: GovermentListRelationFilter;
    },
    'id' | 'userId'
  >;

  export type WorkerInfoOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    isInTeam?: SortOrder;
    acceptsUrgentJobs?: SortOrder;
    primarySpecializationId?: SortOrder;
    _count?: WorkerInfoCountOrderByAggregateInput;
    _avg?: WorkerInfoAvgOrderByAggregateInput;
    _max?: WorkerInfoMaxOrderByAggregateInput;
    _min?: WorkerInfoMinOrderByAggregateInput;
    _sum?: WorkerInfoSumOrderByAggregateInput;
  };

  export type WorkerInfoScalarWhereWithAggregatesInput = {
    AND?: WorkerInfoScalarWhereWithAggregatesInput | WorkerInfoScalarWhereWithAggregatesInput[];
    OR?: WorkerInfoScalarWhereWithAggregatesInput[];
    NOT?: WorkerInfoScalarWhereWithAggregatesInput | WorkerInfoScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'WorkerInfo'> | number;
    userId?: IntWithAggregatesFilter<'WorkerInfo'> | number;
    experienceYears?: IntWithAggregatesFilter<'WorkerInfo'> | number;
    isInTeam?: BoolWithAggregatesFilter<'WorkerInfo'> | boolean;
    acceptsUrgentJobs?: BoolWithAggregatesFilter<'WorkerInfo'> | boolean;
    primarySpecializationId?: IntWithAggregatesFilter<'WorkerInfo'> | number;
  };

  export type SpecializationsForWorkersWhereInput = {
    AND?: SpecializationsForWorkersWhereInput | SpecializationsForWorkersWhereInput[];
    OR?: SpecializationsForWorkersWhereInput[];
    NOT?: SpecializationsForWorkersWhereInput | SpecializationsForWorkersWhereInput[];
    workerInfoId?: IntFilter<'SpecializationsForWorkers'> | number;
    specializationId?: IntFilter<'SpecializationsForWorkers'> | number;
    workerInfo?: XOR<WorkerInfoScalarRelationFilter, WorkerInfoWhereInput>;
    specialization?: XOR<SpecializationScalarRelationFilter, SpecializationWhereInput>;
  };

  export type SpecializationsForWorkersOrderByWithRelationInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
    workerInfo?: WorkerInfoOrderByWithRelationInput;
    specialization?: SpecializationOrderByWithRelationInput;
  };

  export type SpecializationsForWorkersWhereUniqueInput = Prisma.AtLeast<
    {
      workerInfoId_specializationId?: SpecializationsForWorkersWorkerInfoIdSpecializationIdCompoundUniqueInput;
      AND?: SpecializationsForWorkersWhereInput | SpecializationsForWorkersWhereInput[];
      OR?: SpecializationsForWorkersWhereInput[];
      NOT?: SpecializationsForWorkersWhereInput | SpecializationsForWorkersWhereInput[];
      workerInfoId?: IntFilter<'SpecializationsForWorkers'> | number;
      specializationId?: IntFilter<'SpecializationsForWorkers'> | number;
      workerInfo?: XOR<WorkerInfoScalarRelationFilter, WorkerInfoWhereInput>;
      specialization?: XOR<SpecializationScalarRelationFilter, SpecializationWhereInput>;
    },
    'workerInfoId_specializationId'
  >;

  export type SpecializationsForWorkersOrderByWithAggregationInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
    _count?: SpecializationsForWorkersCountOrderByAggregateInput;
    _avg?: SpecializationsForWorkersAvgOrderByAggregateInput;
    _max?: SpecializationsForWorkersMaxOrderByAggregateInput;
    _min?: SpecializationsForWorkersMinOrderByAggregateInput;
    _sum?: SpecializationsForWorkersSumOrderByAggregateInput;
  };

  export type SpecializationsForWorkersScalarWhereWithAggregatesInput = {
    AND?:
      | SpecializationsForWorkersScalarWhereWithAggregatesInput
      | SpecializationsForWorkersScalarWhereWithAggregatesInput[];
    OR?: SpecializationsForWorkersScalarWhereWithAggregatesInput[];
    NOT?:
      | SpecializationsForWorkersScalarWhereWithAggregatesInput
      | SpecializationsForWorkersScalarWhereWithAggregatesInput[];
    workerInfoId?: IntWithAggregatesFilter<'SpecializationsForWorkers'> | number;
    specializationId?: IntWithAggregatesFilter<'SpecializationsForWorkers'> | number;
  };

  export type SpecializationWhereInput = {
    AND?: SpecializationWhereInput | SpecializationWhereInput[];
    OR?: SpecializationWhereInput[];
    NOT?: SpecializationWhereInput | SpecializationWhereInput[];
    id?: IntFilter<'Specialization'> | number;
    name?: StringFilter<'Specialization'> | string;
    field?: StringFilter<'Specialization'> | string;
    secondaryWorkers?: SpecializationsForWorkersListRelationFilter;
    primaryWorkers?: WorkerInfoListRelationFilter;
  };

  export type SpecializationOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    field?: SortOrder;
    secondaryWorkers?: SpecializationsForWorkersOrderByRelationAggregateInput;
    primaryWorkers?: WorkerInfoOrderByRelationAggregateInput;
  };

  export type SpecializationWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: SpecializationWhereInput | SpecializationWhereInput[];
      OR?: SpecializationWhereInput[];
      NOT?: SpecializationWhereInput | SpecializationWhereInput[];
      name?: StringFilter<'Specialization'> | string;
      field?: StringFilter<'Specialization'> | string;
      secondaryWorkers?: SpecializationsForWorkersListRelationFilter;
      primaryWorkers?: WorkerInfoListRelationFilter;
    },
    'id'
  >;

  export type SpecializationOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    field?: SortOrder;
    _count?: SpecializationCountOrderByAggregateInput;
    _avg?: SpecializationAvgOrderByAggregateInput;
    _max?: SpecializationMaxOrderByAggregateInput;
    _min?: SpecializationMinOrderByAggregateInput;
    _sum?: SpecializationSumOrderByAggregateInput;
  };

  export type SpecializationScalarWhereWithAggregatesInput = {
    AND?:
      | SpecializationScalarWhereWithAggregatesInput
      | SpecializationScalarWhereWithAggregatesInput[];
    OR?: SpecializationScalarWhereWithAggregatesInput[];
    NOT?:
      | SpecializationScalarWhereWithAggregatesInput
      | SpecializationScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Specialization'> | number;
    name?: StringWithAggregatesFilter<'Specialization'> | string;
    field?: StringWithAggregatesFilter<'Specialization'> | string;
  };

  export type GovermentWhereInput = {
    AND?: GovermentWhereInput | GovermentWhereInput[];
    OR?: GovermentWhereInput[];
    NOT?: GovermentWhereInput | GovermentWhereInput[];
    id?: IntFilter<'Goverment'> | number;
    name?: StringFilter<'Goverment'> | string;
    workerInfoId?: IntNullableFilter<'Goverment'> | number | null;
    workerInfo?: XOR<WorkerInfoNullableScalarRelationFilter, WorkerInfoWhereInput> | null;
  };

  export type GovermentOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    workerInfoId?: SortOrderInput | SortOrder;
    workerInfo?: WorkerInfoOrderByWithRelationInput;
  };

  export type GovermentWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: GovermentWhereInput | GovermentWhereInput[];
      OR?: GovermentWhereInput[];
      NOT?: GovermentWhereInput | GovermentWhereInput[];
      name?: StringFilter<'Goverment'> | string;
      workerInfoId?: IntNullableFilter<'Goverment'> | number | null;
      workerInfo?: XOR<WorkerInfoNullableScalarRelationFilter, WorkerInfoWhereInput> | null;
    },
    'id'
  >;

  export type GovermentOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    workerInfoId?: SortOrderInput | SortOrder;
    _count?: GovermentCountOrderByAggregateInput;
    _avg?: GovermentAvgOrderByAggregateInput;
    _max?: GovermentMaxOrderByAggregateInput;
    _min?: GovermentMinOrderByAggregateInput;
    _sum?: GovermentSumOrderByAggregateInput;
  };

  export type GovermentScalarWhereWithAggregatesInput = {
    AND?: GovermentScalarWhereWithAggregatesInput | GovermentScalarWhereWithAggregatesInput[];
    OR?: GovermentScalarWhereWithAggregatesInput[];
    NOT?: GovermentScalarWhereWithAggregatesInput | GovermentScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Goverment'> | number;
    name?: StringWithAggregatesFilter<'Goverment'> | string;
    workerInfoId?: IntNullableWithAggregatesFilter<'Goverment'> | number | null;
  };

  export type SessionCreateInput = {
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
    user: UserCreateNestedOneWithoutSessionsInput;
  };

  export type SessionUncheckedCreateInput = {
    id?: number;
    userId: number;
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
  };

  export type SessionUpdateInput = {
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput;
  };

  export type SessionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SessionCreateManyInput = {
    id?: number;
    userId: number;
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
  };

  export type SessionUpdateManyMutationInput = {
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SessionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OTPsCreateInput = {
    attempts?: number;
    phoneNumber: string;
    hashedOTP: string;
    updatedAt: Date | string;
    expiresAt: Date | string;
    createdAt?: Date | string;
    InProcess: boolean;
  };

  export type OTPsUncheckedCreateInput = {
    attempts?: number;
    phoneNumber: string;
    hashedOTP: string;
    updatedAt: Date | string;
    expiresAt: Date | string;
    createdAt?: Date | string;
    InProcess: boolean;
  };

  export type OTPsUpdateInput = {
    attempts?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    hashedOTP?: StringFieldUpdateOperationsInput | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    InProcess?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type OTPsUncheckedUpdateInput = {
    attempts?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    hashedOTP?: StringFieldUpdateOperationsInput | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    InProcess?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type OTPsCreateManyInput = {
    attempts?: number;
    phoneNumber: string;
    hashedOTP: string;
    updatedAt: Date | string;
    expiresAt: Date | string;
    createdAt?: Date | string;
    InProcess: boolean;
  };

  export type OTPsUpdateManyMutationInput = {
    attempts?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    hashedOTP?: StringFieldUpdateOperationsInput | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    InProcess?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type OTPsUncheckedUpdateManyInput = {
    attempts?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    hashedOTP?: StringFieldUpdateOperationsInput | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    InProcess?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type UserCreateInput = {
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    sessions?: SessionCreateNestedManyWithoutUserInput;
    workerInfo?: WorkerInfoCreateNestedOneWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: number;
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput;
    workerInfo?: WorkerInfoUncheckedCreateNestedOneWithoutUserInput;
  };

  export type UserUpdateInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    sessions?: SessionUpdateManyWithoutUserNestedInput;
    workerInfo?: WorkerInfoUpdateOneWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput;
    workerInfo?: WorkerInfoUncheckedUpdateOneWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: number;
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
  };

  export type UserUpdateManyMutationInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
  };

  export type WorkerInfoCreateInput = {
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    secondarySpecializations?: SpecializationsForWorkersCreateNestedManyWithoutWorkerInfoInput;
    primarySpecialization: SpecializationCreateNestedOneWithoutPrimaryWorkersInput;
    user: UserCreateNestedOneWithoutWorkerInfoInput;
    goverments?: GovermentCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoUncheckedCreateInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutWorkerInfoInput;
    goverments?: GovermentUncheckedCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoUpdateInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    secondarySpecializations?: SpecializationsForWorkersUpdateManyWithoutWorkerInfoNestedInput;
    primarySpecialization?: SpecializationUpdateOneRequiredWithoutPrimaryWorkersNestedInput;
    user?: UserUpdateOneRequiredWithoutWorkerInfoNestedInput;
    goverments?: GovermentUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecializationId?: IntFieldUpdateOperationsInput | number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoNestedInput;
    goverments?: GovermentUncheckedUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoCreateManyInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
  };

  export type WorkerInfoUpdateManyMutationInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type WorkerInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecializationId?: IntFieldUpdateOperationsInput | number;
  };

  export type SpecializationsForWorkersCreateInput = {
    workerInfo: WorkerInfoCreateNestedOneWithoutSecondarySpecializationsInput;
    specialization: SpecializationCreateNestedOneWithoutSecondaryWorkersInput;
  };

  export type SpecializationsForWorkersUncheckedCreateInput = {
    workerInfoId: number;
    specializationId: number;
  };

  export type SpecializationsForWorkersUpdateInput = {
    workerInfo?: WorkerInfoUpdateOneRequiredWithoutSecondarySpecializationsNestedInput;
    specialization?: SpecializationUpdateOneRequiredWithoutSecondaryWorkersNestedInput;
  };

  export type SpecializationsForWorkersUncheckedUpdateInput = {
    workerInfoId?: IntFieldUpdateOperationsInput | number;
    specializationId?: IntFieldUpdateOperationsInput | number;
  };

  export type SpecializationsForWorkersCreateManyInput = {
    workerInfoId: number;
    specializationId: number;
  };

  export type SpecializationsForWorkersUpdateManyMutationInput = {};

  export type SpecializationsForWorkersUncheckedUpdateManyInput = {
    workerInfoId?: IntFieldUpdateOperationsInput | number;
    specializationId?: IntFieldUpdateOperationsInput | number;
  };

  export type SpecializationCreateInput = {
    name: string;
    field: string;
    secondaryWorkers?: SpecializationsForWorkersCreateNestedManyWithoutSpecializationInput;
    primaryWorkers?: WorkerInfoCreateNestedManyWithoutPrimarySpecializationInput;
  };

  export type SpecializationUncheckedCreateInput = {
    id?: number;
    name: string;
    field: string;
    secondaryWorkers?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutSpecializationInput;
    primaryWorkers?: WorkerInfoUncheckedCreateNestedManyWithoutPrimarySpecializationInput;
  };

  export type SpecializationUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    secondaryWorkers?: SpecializationsForWorkersUpdateManyWithoutSpecializationNestedInput;
    primaryWorkers?: WorkerInfoUpdateManyWithoutPrimarySpecializationNestedInput;
  };

  export type SpecializationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    secondaryWorkers?: SpecializationsForWorkersUncheckedUpdateManyWithoutSpecializationNestedInput;
    primaryWorkers?: WorkerInfoUncheckedUpdateManyWithoutPrimarySpecializationNestedInput;
  };

  export type SpecializationCreateManyInput = {
    id?: number;
    name: string;
    field: string;
  };

  export type SpecializationUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
  };

  export type SpecializationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
  };

  export type GovermentCreateInput = {
    name: string;
    workerInfo?: WorkerInfoCreateNestedOneWithoutGovermentsInput;
  };

  export type GovermentUncheckedCreateInput = {
    id?: number;
    name: string;
    workerInfoId?: number | null;
  };

  export type GovermentUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string;
    workerInfo?: WorkerInfoUpdateOneWithoutGovermentsNestedInput;
  };

  export type GovermentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    workerInfoId?: NullableIntFieldUpdateOperationsInput | number | null;
  };

  export type GovermentCreateManyInput = {
    id?: number;
    name: string;
    workerInfoId?: number | null;
  };

  export type GovermentUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type GovermentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    workerInfoId?: NullableIntFieldUpdateOperationsInput | number | null;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type UserScalarRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    token?: SortOrder;
    isRevoked?: SortOrder;
    deviceFingerprint?: SortOrder;
    lastUsedAt?: SortOrder;
    createdAt?: SortOrder;
    expiresAt?: SortOrder;
  };

  export type SessionAvgOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
  };

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    token?: SortOrder;
    isRevoked?: SortOrder;
    deviceFingerprint?: SortOrder;
    lastUsedAt?: SortOrder;
    createdAt?: SortOrder;
    expiresAt?: SortOrder;
  };

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    token?: SortOrder;
    isRevoked?: SortOrder;
    deviceFingerprint?: SortOrder;
    lastUsedAt?: SortOrder;
    createdAt?: SortOrder;
    expiresAt?: SortOrder;
  };

  export type SessionSumOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type OTPsCountOrderByAggregateInput = {
    attempts?: SortOrder;
    phoneNumber?: SortOrder;
    hashedOTP?: SortOrder;
    updatedAt?: SortOrder;
    expiresAt?: SortOrder;
    createdAt?: SortOrder;
    InProcess?: SortOrder;
  };

  export type OTPsAvgOrderByAggregateInput = {
    attempts?: SortOrder;
  };

  export type OTPsMaxOrderByAggregateInput = {
    attempts?: SortOrder;
    phoneNumber?: SortOrder;
    hashedOTP?: SortOrder;
    updatedAt?: SortOrder;
    expiresAt?: SortOrder;
    createdAt?: SortOrder;
    InProcess?: SortOrder;
  };

  export type OTPsMinOrderByAggregateInput = {
    attempts?: SortOrder;
    phoneNumber?: SortOrder;
    hashedOTP?: SortOrder;
    updatedAt?: SortOrder;
    expiresAt?: SortOrder;
    createdAt?: SortOrder;
    InProcess?: SortOrder;
  };

  export type OTPsSumOrderByAggregateInput = {
    attempts?: SortOrder;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type EnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus;
  };

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role;
  };

  export type SessionListRelationFilter = {
    every?: SessionWhereInput;
    some?: SessionWhereInput;
    none?: SessionWhereInput;
  };

  export type WorkerInfoNullableScalarRelationFilter = {
    is?: WorkerInfoWhereInput | null;
    isNot?: WorkerInfoWhereInput | null;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    fristName?: SortOrder;
    lastName?: SortOrder;
    government?: SortOrder;
    city?: SortOrder;
    bio?: SortOrder;
    status?: SortOrder;
    role?: SortOrder;
  };

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    fristName?: SortOrder;
    lastName?: SortOrder;
    government?: SortOrder;
    city?: SortOrder;
    bio?: SortOrder;
    status?: SortOrder;
    role?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    fristName?: SortOrder;
    lastName?: SortOrder;
    government?: SortOrder;
    city?: SortOrder;
    bio?: SortOrder;
    status?: SortOrder;
    role?: SortOrder;
  };

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type EnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>;
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>;
  };

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRoleFilter<$PrismaModel>;
    _max?: NestedEnumRoleFilter<$PrismaModel>;
  };

  export type SpecializationsForWorkersListRelationFilter = {
    every?: SpecializationsForWorkersWhereInput;
    some?: SpecializationsForWorkersWhereInput;
    none?: SpecializationsForWorkersWhereInput;
  };

  export type SpecializationScalarRelationFilter = {
    is?: SpecializationWhereInput;
    isNot?: SpecializationWhereInput;
  };

  export type GovermentListRelationFilter = {
    every?: GovermentWhereInput;
    some?: GovermentWhereInput;
    none?: GovermentWhereInput;
  };

  export type SpecializationsForWorkersOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type GovermentOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type WorkerInfoCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    isInTeam?: SortOrder;
    acceptsUrgentJobs?: SortOrder;
    primarySpecializationId?: SortOrder;
  };

  export type WorkerInfoAvgOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    primarySpecializationId?: SortOrder;
  };

  export type WorkerInfoMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    isInTeam?: SortOrder;
    acceptsUrgentJobs?: SortOrder;
    primarySpecializationId?: SortOrder;
  };

  export type WorkerInfoMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    isInTeam?: SortOrder;
    acceptsUrgentJobs?: SortOrder;
    primarySpecializationId?: SortOrder;
  };

  export type WorkerInfoSumOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    experienceYears?: SortOrder;
    primarySpecializationId?: SortOrder;
  };

  export type WorkerInfoScalarRelationFilter = {
    is?: WorkerInfoWhereInput;
    isNot?: WorkerInfoWhereInput;
  };

  export type SpecializationsForWorkersWorkerInfoIdSpecializationIdCompoundUniqueInput = {
    workerInfoId: number;
    specializationId: number;
  };

  export type SpecializationsForWorkersCountOrderByAggregateInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
  };

  export type SpecializationsForWorkersAvgOrderByAggregateInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
  };

  export type SpecializationsForWorkersMaxOrderByAggregateInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
  };

  export type SpecializationsForWorkersMinOrderByAggregateInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
  };

  export type SpecializationsForWorkersSumOrderByAggregateInput = {
    workerInfoId?: SortOrder;
    specializationId?: SortOrder;
  };

  export type WorkerInfoListRelationFilter = {
    every?: WorkerInfoWhereInput;
    some?: WorkerInfoWhereInput;
    none?: WorkerInfoWhereInput;
  };

  export type WorkerInfoOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type SpecializationCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    field?: SortOrder;
  };

  export type SpecializationAvgOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type SpecializationMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    field?: SortOrder;
  };

  export type SpecializationMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    field?: SortOrder;
  };

  export type SpecializationSumOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type GovermentCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    workerInfoId?: SortOrder;
  };

  export type GovermentAvgOrderByAggregateInput = {
    id?: SortOrder;
    workerInfoId?: SortOrder;
  };

  export type GovermentMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    workerInfoId?: SortOrder;
  };

  export type GovermentMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    workerInfoId?: SortOrder;
  };

  export type GovermentSumOrderByAggregateInput = {
    id?: SortOrder;
    workerInfoId?: SortOrder;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput;
    connect?: UserWhereUniqueInput;
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput;
    upsert?: UserUpsertWithoutSessionsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>,
      UserUncheckedUpdateWithoutSessionsInput
    >;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type SessionCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
      | SessionCreateWithoutUserInput[]
      | SessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | SessionCreateOrConnectWithoutUserInput
      | SessionCreateOrConnectWithoutUserInput[];
    createMany?: SessionCreateManyUserInputEnvelope;
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  };

  export type WorkerInfoCreateNestedOneWithoutUserInput = {
    create?: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutUserInput;
    connect?: WorkerInfoWhereUniqueInput;
  };

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
      | SessionCreateWithoutUserInput[]
      | SessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | SessionCreateOrConnectWithoutUserInput
      | SessionCreateOrConnectWithoutUserInput[];
    createMany?: SessionCreateManyUserInputEnvelope;
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  };

  export type WorkerInfoUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutUserInput;
    connect?: WorkerInfoWhereUniqueInput;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type EnumAccountStatusFieldUpdateOperationsInput = {
    set?: $Enums.AccountStatus;
  };

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role;
  };

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
      | SessionCreateWithoutUserInput[]
      | SessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | SessionCreateOrConnectWithoutUserInput
      | SessionCreateOrConnectWithoutUserInput[];
    upsert?:
      | SessionUpsertWithWhereUniqueWithoutUserInput
      | SessionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: SessionCreateManyUserInputEnvelope;
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    update?:
      | SessionUpdateWithWhereUniqueWithoutUserInput
      | SessionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | SessionUpdateManyWithWhereWithoutUserInput
      | SessionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[];
  };

  export type WorkerInfoUpdateOneWithoutUserNestedInput = {
    create?: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutUserInput;
    upsert?: WorkerInfoUpsertWithoutUserInput;
    disconnect?: WorkerInfoWhereInput | boolean;
    delete?: WorkerInfoWhereInput | boolean;
    connect?: WorkerInfoWhereUniqueInput;
    update?: XOR<
      XOR<WorkerInfoUpdateToOneWithWhereWithoutUserInput, WorkerInfoUpdateWithoutUserInput>,
      WorkerInfoUncheckedUpdateWithoutUserInput
    >;
  };

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
      | SessionCreateWithoutUserInput[]
      | SessionUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | SessionCreateOrConnectWithoutUserInput
      | SessionCreateOrConnectWithoutUserInput[];
    upsert?:
      | SessionUpsertWithWhereUniqueWithoutUserInput
      | SessionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: SessionCreateManyUserInputEnvelope;
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
    update?:
      | SessionUpdateWithWhereUniqueWithoutUserInput
      | SessionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | SessionUpdateManyWithWhereWithoutUserInput
      | SessionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[];
  };

  export type WorkerInfoUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutUserInput;
    upsert?: WorkerInfoUpsertWithoutUserInput;
    disconnect?: WorkerInfoWhereInput | boolean;
    delete?: WorkerInfoWhereInput | boolean;
    connect?: WorkerInfoWhereUniqueInput;
    update?: XOR<
      XOR<WorkerInfoUpdateToOneWithWhereWithoutUserInput, WorkerInfoUpdateWithoutUserInput>,
      WorkerInfoUncheckedUpdateWithoutUserInput
    >;
  };

  export type SpecializationsForWorkersCreateNestedManyWithoutWorkerInfoInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutWorkerInfoInput,
          SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
        >
      | SpecializationsForWorkersCreateWithoutWorkerInfoInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput[];
    createMany?: SpecializationsForWorkersCreateManyWorkerInfoInputEnvelope;
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
  };

  export type SpecializationCreateNestedOneWithoutPrimaryWorkersInput = {
    create?: XOR<
      SpecializationCreateWithoutPrimaryWorkersInput,
      SpecializationUncheckedCreateWithoutPrimaryWorkersInput
    >;
    connectOrCreate?: SpecializationCreateOrConnectWithoutPrimaryWorkersInput;
    connect?: SpecializationWhereUniqueInput;
  };

  export type UserCreateNestedOneWithoutWorkerInfoInput = {
    create?: XOR<UserCreateWithoutWorkerInfoInput, UserUncheckedCreateWithoutWorkerInfoInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWorkerInfoInput;
    connect?: UserWhereUniqueInput;
  };

  export type GovermentCreateNestedManyWithoutWorkerInfoInput = {
    create?:
      | XOR<GovermentCreateWithoutWorkerInfoInput, GovermentUncheckedCreateWithoutWorkerInfoInput>
      | GovermentCreateWithoutWorkerInfoInput[]
      | GovermentUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | GovermentCreateOrConnectWithoutWorkerInfoInput
      | GovermentCreateOrConnectWithoutWorkerInfoInput[];
    createMany?: GovermentCreateManyWorkerInfoInputEnvelope;
    connect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
  };

  export type SpecializationsForWorkersUncheckedCreateNestedManyWithoutWorkerInfoInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutWorkerInfoInput,
          SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
        >
      | SpecializationsForWorkersCreateWithoutWorkerInfoInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput[];
    createMany?: SpecializationsForWorkersCreateManyWorkerInfoInputEnvelope;
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
  };

  export type GovermentUncheckedCreateNestedManyWithoutWorkerInfoInput = {
    create?:
      | XOR<GovermentCreateWithoutWorkerInfoInput, GovermentUncheckedCreateWithoutWorkerInfoInput>
      | GovermentCreateWithoutWorkerInfoInput[]
      | GovermentUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | GovermentCreateOrConnectWithoutWorkerInfoInput
      | GovermentCreateOrConnectWithoutWorkerInfoInput[];
    createMany?: GovermentCreateManyWorkerInfoInputEnvelope;
    connect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
  };

  export type SpecializationsForWorkersUpdateManyWithoutWorkerInfoNestedInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutWorkerInfoInput,
          SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
        >
      | SpecializationsForWorkersCreateWithoutWorkerInfoInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput[];
    upsert?:
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutWorkerInfoInput
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutWorkerInfoInput[];
    createMany?: SpecializationsForWorkersCreateManyWorkerInfoInputEnvelope;
    set?: SpecializationsForWorkersWhereUniqueInput | SpecializationsForWorkersWhereUniqueInput[];
    disconnect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    delete?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    update?:
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutWorkerInfoInput
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutWorkerInfoInput[];
    updateMany?:
      | SpecializationsForWorkersUpdateManyWithWhereWithoutWorkerInfoInput
      | SpecializationsForWorkersUpdateManyWithWhereWithoutWorkerInfoInput[];
    deleteMany?:
      | SpecializationsForWorkersScalarWhereInput
      | SpecializationsForWorkersScalarWhereInput[];
  };

  export type SpecializationUpdateOneRequiredWithoutPrimaryWorkersNestedInput = {
    create?: XOR<
      SpecializationCreateWithoutPrimaryWorkersInput,
      SpecializationUncheckedCreateWithoutPrimaryWorkersInput
    >;
    connectOrCreate?: SpecializationCreateOrConnectWithoutPrimaryWorkersInput;
    upsert?: SpecializationUpsertWithoutPrimaryWorkersInput;
    connect?: SpecializationWhereUniqueInput;
    update?: XOR<
      XOR<
        SpecializationUpdateToOneWithWhereWithoutPrimaryWorkersInput,
        SpecializationUpdateWithoutPrimaryWorkersInput
      >,
      SpecializationUncheckedUpdateWithoutPrimaryWorkersInput
    >;
  };

  export type UserUpdateOneRequiredWithoutWorkerInfoNestedInput = {
    create?: XOR<UserCreateWithoutWorkerInfoInput, UserUncheckedCreateWithoutWorkerInfoInput>;
    connectOrCreate?: UserCreateOrConnectWithoutWorkerInfoInput;
    upsert?: UserUpsertWithoutWorkerInfoInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutWorkerInfoInput, UserUpdateWithoutWorkerInfoInput>,
      UserUncheckedUpdateWithoutWorkerInfoInput
    >;
  };

  export type GovermentUpdateManyWithoutWorkerInfoNestedInput = {
    create?:
      | XOR<GovermentCreateWithoutWorkerInfoInput, GovermentUncheckedCreateWithoutWorkerInfoInput>
      | GovermentCreateWithoutWorkerInfoInput[]
      | GovermentUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | GovermentCreateOrConnectWithoutWorkerInfoInput
      | GovermentCreateOrConnectWithoutWorkerInfoInput[];
    upsert?:
      | GovermentUpsertWithWhereUniqueWithoutWorkerInfoInput
      | GovermentUpsertWithWhereUniqueWithoutWorkerInfoInput[];
    createMany?: GovermentCreateManyWorkerInfoInputEnvelope;
    set?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    disconnect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    delete?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    connect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    update?:
      | GovermentUpdateWithWhereUniqueWithoutWorkerInfoInput
      | GovermentUpdateWithWhereUniqueWithoutWorkerInfoInput[];
    updateMany?:
      | GovermentUpdateManyWithWhereWithoutWorkerInfoInput
      | GovermentUpdateManyWithWhereWithoutWorkerInfoInput[];
    deleteMany?: GovermentScalarWhereInput | GovermentScalarWhereInput[];
  };

  export type SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoNestedInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutWorkerInfoInput,
          SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
        >
      | SpecializationsForWorkersCreateWithoutWorkerInfoInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput
      | SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput[];
    upsert?:
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutWorkerInfoInput
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutWorkerInfoInput[];
    createMany?: SpecializationsForWorkersCreateManyWorkerInfoInputEnvelope;
    set?: SpecializationsForWorkersWhereUniqueInput | SpecializationsForWorkersWhereUniqueInput[];
    disconnect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    delete?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    update?:
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutWorkerInfoInput
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutWorkerInfoInput[];
    updateMany?:
      | SpecializationsForWorkersUpdateManyWithWhereWithoutWorkerInfoInput
      | SpecializationsForWorkersUpdateManyWithWhereWithoutWorkerInfoInput[];
    deleteMany?:
      | SpecializationsForWorkersScalarWhereInput
      | SpecializationsForWorkersScalarWhereInput[];
  };

  export type GovermentUncheckedUpdateManyWithoutWorkerInfoNestedInput = {
    create?:
      | XOR<GovermentCreateWithoutWorkerInfoInput, GovermentUncheckedCreateWithoutWorkerInfoInput>
      | GovermentCreateWithoutWorkerInfoInput[]
      | GovermentUncheckedCreateWithoutWorkerInfoInput[];
    connectOrCreate?:
      | GovermentCreateOrConnectWithoutWorkerInfoInput
      | GovermentCreateOrConnectWithoutWorkerInfoInput[];
    upsert?:
      | GovermentUpsertWithWhereUniqueWithoutWorkerInfoInput
      | GovermentUpsertWithWhereUniqueWithoutWorkerInfoInput[];
    createMany?: GovermentCreateManyWorkerInfoInputEnvelope;
    set?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    disconnect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    delete?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    connect?: GovermentWhereUniqueInput | GovermentWhereUniqueInput[];
    update?:
      | GovermentUpdateWithWhereUniqueWithoutWorkerInfoInput
      | GovermentUpdateWithWhereUniqueWithoutWorkerInfoInput[];
    updateMany?:
      | GovermentUpdateManyWithWhereWithoutWorkerInfoInput
      | GovermentUpdateManyWithWhereWithoutWorkerInfoInput[];
    deleteMany?: GovermentScalarWhereInput | GovermentScalarWhereInput[];
  };

  export type WorkerInfoCreateNestedOneWithoutSecondarySpecializationsInput = {
    create?: XOR<
      WorkerInfoCreateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedCreateWithoutSecondarySpecializationsInput
    >;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutSecondarySpecializationsInput;
    connect?: WorkerInfoWhereUniqueInput;
  };

  export type SpecializationCreateNestedOneWithoutSecondaryWorkersInput = {
    create?: XOR<
      SpecializationCreateWithoutSecondaryWorkersInput,
      SpecializationUncheckedCreateWithoutSecondaryWorkersInput
    >;
    connectOrCreate?: SpecializationCreateOrConnectWithoutSecondaryWorkersInput;
    connect?: SpecializationWhereUniqueInput;
  };

  export type WorkerInfoUpdateOneRequiredWithoutSecondarySpecializationsNestedInput = {
    create?: XOR<
      WorkerInfoCreateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedCreateWithoutSecondarySpecializationsInput
    >;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutSecondarySpecializationsInput;
    upsert?: WorkerInfoUpsertWithoutSecondarySpecializationsInput;
    connect?: WorkerInfoWhereUniqueInput;
    update?: XOR<
      XOR<
        WorkerInfoUpdateToOneWithWhereWithoutSecondarySpecializationsInput,
        WorkerInfoUpdateWithoutSecondarySpecializationsInput
      >,
      WorkerInfoUncheckedUpdateWithoutSecondarySpecializationsInput
    >;
  };

  export type SpecializationUpdateOneRequiredWithoutSecondaryWorkersNestedInput = {
    create?: XOR<
      SpecializationCreateWithoutSecondaryWorkersInput,
      SpecializationUncheckedCreateWithoutSecondaryWorkersInput
    >;
    connectOrCreate?: SpecializationCreateOrConnectWithoutSecondaryWorkersInput;
    upsert?: SpecializationUpsertWithoutSecondaryWorkersInput;
    connect?: SpecializationWhereUniqueInput;
    update?: XOR<
      XOR<
        SpecializationUpdateToOneWithWhereWithoutSecondaryWorkersInput,
        SpecializationUpdateWithoutSecondaryWorkersInput
      >,
      SpecializationUncheckedUpdateWithoutSecondaryWorkersInput
    >;
  };

  export type SpecializationsForWorkersCreateNestedManyWithoutSpecializationInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutSpecializationInput,
          SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
        >
      | SpecializationsForWorkersCreateWithoutSpecializationInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput[];
    createMany?: SpecializationsForWorkersCreateManySpecializationInputEnvelope;
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
  };

  export type WorkerInfoCreateNestedManyWithoutPrimarySpecializationInput = {
    create?:
      | XOR<
          WorkerInfoCreateWithoutPrimarySpecializationInput,
          WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
        >
      | WorkerInfoCreateWithoutPrimarySpecializationInput[]
      | WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput[];
    connectOrCreate?:
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput[];
    createMany?: WorkerInfoCreateManyPrimarySpecializationInputEnvelope;
    connect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
  };

  export type SpecializationsForWorkersUncheckedCreateNestedManyWithoutSpecializationInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutSpecializationInput,
          SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
        >
      | SpecializationsForWorkersCreateWithoutSpecializationInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput[];
    createMany?: SpecializationsForWorkersCreateManySpecializationInputEnvelope;
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
  };

  export type WorkerInfoUncheckedCreateNestedManyWithoutPrimarySpecializationInput = {
    create?:
      | XOR<
          WorkerInfoCreateWithoutPrimarySpecializationInput,
          WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
        >
      | WorkerInfoCreateWithoutPrimarySpecializationInput[]
      | WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput[];
    connectOrCreate?:
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput[];
    createMany?: WorkerInfoCreateManyPrimarySpecializationInputEnvelope;
    connect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
  };

  export type SpecializationsForWorkersUpdateManyWithoutSpecializationNestedInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutSpecializationInput,
          SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
        >
      | SpecializationsForWorkersCreateWithoutSpecializationInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput[];
    upsert?:
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutSpecializationInput
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutSpecializationInput[];
    createMany?: SpecializationsForWorkersCreateManySpecializationInputEnvelope;
    set?: SpecializationsForWorkersWhereUniqueInput | SpecializationsForWorkersWhereUniqueInput[];
    disconnect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    delete?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    update?:
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutSpecializationInput
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutSpecializationInput[];
    updateMany?:
      | SpecializationsForWorkersUpdateManyWithWhereWithoutSpecializationInput
      | SpecializationsForWorkersUpdateManyWithWhereWithoutSpecializationInput[];
    deleteMany?:
      | SpecializationsForWorkersScalarWhereInput
      | SpecializationsForWorkersScalarWhereInput[];
  };

  export type WorkerInfoUpdateManyWithoutPrimarySpecializationNestedInput = {
    create?:
      | XOR<
          WorkerInfoCreateWithoutPrimarySpecializationInput,
          WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
        >
      | WorkerInfoCreateWithoutPrimarySpecializationInput[]
      | WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput[];
    connectOrCreate?:
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput[];
    upsert?:
      | WorkerInfoUpsertWithWhereUniqueWithoutPrimarySpecializationInput
      | WorkerInfoUpsertWithWhereUniqueWithoutPrimarySpecializationInput[];
    createMany?: WorkerInfoCreateManyPrimarySpecializationInputEnvelope;
    set?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    disconnect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    delete?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    connect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    update?:
      | WorkerInfoUpdateWithWhereUniqueWithoutPrimarySpecializationInput
      | WorkerInfoUpdateWithWhereUniqueWithoutPrimarySpecializationInput[];
    updateMany?:
      | WorkerInfoUpdateManyWithWhereWithoutPrimarySpecializationInput
      | WorkerInfoUpdateManyWithWhereWithoutPrimarySpecializationInput[];
    deleteMany?: WorkerInfoScalarWhereInput | WorkerInfoScalarWhereInput[];
  };

  export type SpecializationsForWorkersUncheckedUpdateManyWithoutSpecializationNestedInput = {
    create?:
      | XOR<
          SpecializationsForWorkersCreateWithoutSpecializationInput,
          SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
        >
      | SpecializationsForWorkersCreateWithoutSpecializationInput[]
      | SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput[];
    connectOrCreate?:
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput
      | SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput[];
    upsert?:
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutSpecializationInput
      | SpecializationsForWorkersUpsertWithWhereUniqueWithoutSpecializationInput[];
    createMany?: SpecializationsForWorkersCreateManySpecializationInputEnvelope;
    set?: SpecializationsForWorkersWhereUniqueInput | SpecializationsForWorkersWhereUniqueInput[];
    disconnect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    delete?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    connect?:
      | SpecializationsForWorkersWhereUniqueInput
      | SpecializationsForWorkersWhereUniqueInput[];
    update?:
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutSpecializationInput
      | SpecializationsForWorkersUpdateWithWhereUniqueWithoutSpecializationInput[];
    updateMany?:
      | SpecializationsForWorkersUpdateManyWithWhereWithoutSpecializationInput
      | SpecializationsForWorkersUpdateManyWithWhereWithoutSpecializationInput[];
    deleteMany?:
      | SpecializationsForWorkersScalarWhereInput
      | SpecializationsForWorkersScalarWhereInput[];
  };

  export type WorkerInfoUncheckedUpdateManyWithoutPrimarySpecializationNestedInput = {
    create?:
      | XOR<
          WorkerInfoCreateWithoutPrimarySpecializationInput,
          WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
        >
      | WorkerInfoCreateWithoutPrimarySpecializationInput[]
      | WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput[];
    connectOrCreate?:
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput
      | WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput[];
    upsert?:
      | WorkerInfoUpsertWithWhereUniqueWithoutPrimarySpecializationInput
      | WorkerInfoUpsertWithWhereUniqueWithoutPrimarySpecializationInput[];
    createMany?: WorkerInfoCreateManyPrimarySpecializationInputEnvelope;
    set?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    disconnect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    delete?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    connect?: WorkerInfoWhereUniqueInput | WorkerInfoWhereUniqueInput[];
    update?:
      | WorkerInfoUpdateWithWhereUniqueWithoutPrimarySpecializationInput
      | WorkerInfoUpdateWithWhereUniqueWithoutPrimarySpecializationInput[];
    updateMany?:
      | WorkerInfoUpdateManyWithWhereWithoutPrimarySpecializationInput
      | WorkerInfoUpdateManyWithWhereWithoutPrimarySpecializationInput[];
    deleteMany?: WorkerInfoScalarWhereInput | WorkerInfoScalarWhereInput[];
  };

  export type WorkerInfoCreateNestedOneWithoutGovermentsInput = {
    create?: XOR<
      WorkerInfoCreateWithoutGovermentsInput,
      WorkerInfoUncheckedCreateWithoutGovermentsInput
    >;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutGovermentsInput;
    connect?: WorkerInfoWhereUniqueInput;
  };

  export type WorkerInfoUpdateOneWithoutGovermentsNestedInput = {
    create?: XOR<
      WorkerInfoCreateWithoutGovermentsInput,
      WorkerInfoUncheckedCreateWithoutGovermentsInput
    >;
    connectOrCreate?: WorkerInfoCreateOrConnectWithoutGovermentsInput;
    upsert?: WorkerInfoUpsertWithoutGovermentsInput;
    disconnect?: WorkerInfoWhereInput | boolean;
    delete?: WorkerInfoWhereInput | boolean;
    connect?: WorkerInfoWhereUniqueInput;
    update?: XOR<
      XOR<
        WorkerInfoUpdateToOneWithWhereWithoutGovermentsInput,
        WorkerInfoUpdateWithoutGovermentsInput
      >,
      WorkerInfoUncheckedUpdateWithoutGovermentsInput
    >;
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedEnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus;
  };

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>;
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>;
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>;
  };

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>;
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRoleFilter<$PrismaModel>;
    _max?: NestedEnumRoleFilter<$PrismaModel>;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type UserCreateWithoutSessionsInput = {
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    workerInfo?: WorkerInfoCreateNestedOneWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: number;
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    workerInfo?: WorkerInfoUncheckedCreateNestedOneWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
  };

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>;
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>;
  };

  export type UserUpdateWithoutSessionsInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    workerInfo?: WorkerInfoUpdateOneWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    workerInfo?: WorkerInfoUncheckedUpdateOneWithoutUserNestedInput;
  };

  export type SessionCreateWithoutUserInput = {
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
  };

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: number;
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
  };

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput;
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>;
  };

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type WorkerInfoCreateWithoutUserInput = {
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    secondarySpecializations?: SpecializationsForWorkersCreateNestedManyWithoutWorkerInfoInput;
    primarySpecialization: SpecializationCreateNestedOneWithoutPrimaryWorkersInput;
    goverments?: GovermentCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoUncheckedCreateWithoutUserInput = {
    id?: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutWorkerInfoInput;
    goverments?: GovermentUncheckedCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoCreateOrConnectWithoutUserInput = {
    where: WorkerInfoWhereUniqueInput;
    create: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
  };

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput;
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>;
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>;
  };

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput;
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>;
  };

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput;
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>;
  };

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[];
    OR?: SessionScalarWhereInput[];
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[];
    id?: IntFilter<'Session'> | number;
    userId?: IntFilter<'Session'> | number;
    token?: StringFilter<'Session'> | string;
    isRevoked?: BoolFilter<'Session'> | boolean;
    deviceFingerprint?: StringFilter<'Session'> | string;
    lastUsedAt?: DateTimeFilter<'Session'> | Date | string;
    createdAt?: DateTimeFilter<'Session'> | Date | string;
    expiresAt?: DateTimeFilter<'Session'> | Date | string;
  };

  export type WorkerInfoUpsertWithoutUserInput = {
    update: XOR<WorkerInfoUpdateWithoutUserInput, WorkerInfoUncheckedUpdateWithoutUserInput>;
    create: XOR<WorkerInfoCreateWithoutUserInput, WorkerInfoUncheckedCreateWithoutUserInput>;
    where?: WorkerInfoWhereInput;
  };

  export type WorkerInfoUpdateToOneWithWhereWithoutUserInput = {
    where?: WorkerInfoWhereInput;
    data: XOR<WorkerInfoUpdateWithoutUserInput, WorkerInfoUncheckedUpdateWithoutUserInput>;
  };

  export type WorkerInfoUpdateWithoutUserInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    secondarySpecializations?: SpecializationsForWorkersUpdateManyWithoutWorkerInfoNestedInput;
    primarySpecialization?: SpecializationUpdateOneRequiredWithoutPrimaryWorkersNestedInput;
    goverments?: GovermentUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecializationId?: IntFieldUpdateOperationsInput | number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoNestedInput;
    goverments?: GovermentUncheckedUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type SpecializationsForWorkersCreateWithoutWorkerInfoInput = {
    specialization: SpecializationCreateNestedOneWithoutSecondaryWorkersInput;
  };

  export type SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput = {
    specializationId: number;
  };

  export type SpecializationsForWorkersCreateOrConnectWithoutWorkerInfoInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    create: XOR<
      SpecializationsForWorkersCreateWithoutWorkerInfoInput,
      SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
    >;
  };

  export type SpecializationsForWorkersCreateManyWorkerInfoInputEnvelope = {
    data:
      | SpecializationsForWorkersCreateManyWorkerInfoInput
      | SpecializationsForWorkersCreateManyWorkerInfoInput[];
    skipDuplicates?: boolean;
  };

  export type SpecializationCreateWithoutPrimaryWorkersInput = {
    name: string;
    field: string;
    secondaryWorkers?: SpecializationsForWorkersCreateNestedManyWithoutSpecializationInput;
  };

  export type SpecializationUncheckedCreateWithoutPrimaryWorkersInput = {
    id?: number;
    name: string;
    field: string;
    secondaryWorkers?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutSpecializationInput;
  };

  export type SpecializationCreateOrConnectWithoutPrimaryWorkersInput = {
    where: SpecializationWhereUniqueInput;
    create: XOR<
      SpecializationCreateWithoutPrimaryWorkersInput,
      SpecializationUncheckedCreateWithoutPrimaryWorkersInput
    >;
  };

  export type UserCreateWithoutWorkerInfoInput = {
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    sessions?: SessionCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutWorkerInfoInput = {
    id?: number;
    phoneNumber: string;
    fristName: string;
    lastName: string;
    government: string;
    city: string;
    bio?: string | null;
    status?: $Enums.AccountStatus;
    role?: $Enums.Role;
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutWorkerInfoInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutWorkerInfoInput, UserUncheckedCreateWithoutWorkerInfoInput>;
  };

  export type GovermentCreateWithoutWorkerInfoInput = {
    name: string;
  };

  export type GovermentUncheckedCreateWithoutWorkerInfoInput = {
    id?: number;
    name: string;
  };

  export type GovermentCreateOrConnectWithoutWorkerInfoInput = {
    where: GovermentWhereUniqueInput;
    create: XOR<
      GovermentCreateWithoutWorkerInfoInput,
      GovermentUncheckedCreateWithoutWorkerInfoInput
    >;
  };

  export type GovermentCreateManyWorkerInfoInputEnvelope = {
    data: GovermentCreateManyWorkerInfoInput | GovermentCreateManyWorkerInfoInput[];
    skipDuplicates?: boolean;
  };

  export type SpecializationsForWorkersUpsertWithWhereUniqueWithoutWorkerInfoInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    update: XOR<
      SpecializationsForWorkersUpdateWithoutWorkerInfoInput,
      SpecializationsForWorkersUncheckedUpdateWithoutWorkerInfoInput
    >;
    create: XOR<
      SpecializationsForWorkersCreateWithoutWorkerInfoInput,
      SpecializationsForWorkersUncheckedCreateWithoutWorkerInfoInput
    >;
  };

  export type SpecializationsForWorkersUpdateWithWhereUniqueWithoutWorkerInfoInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    data: XOR<
      SpecializationsForWorkersUpdateWithoutWorkerInfoInput,
      SpecializationsForWorkersUncheckedUpdateWithoutWorkerInfoInput
    >;
  };

  export type SpecializationsForWorkersUpdateManyWithWhereWithoutWorkerInfoInput = {
    where: SpecializationsForWorkersScalarWhereInput;
    data: XOR<
      SpecializationsForWorkersUpdateManyMutationInput,
      SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoInput
    >;
  };

  export type SpecializationsForWorkersScalarWhereInput = {
    AND?: SpecializationsForWorkersScalarWhereInput | SpecializationsForWorkersScalarWhereInput[];
    OR?: SpecializationsForWorkersScalarWhereInput[];
    NOT?: SpecializationsForWorkersScalarWhereInput | SpecializationsForWorkersScalarWhereInput[];
    workerInfoId?: IntFilter<'SpecializationsForWorkers'> | number;
    specializationId?: IntFilter<'SpecializationsForWorkers'> | number;
  };

  export type SpecializationUpsertWithoutPrimaryWorkersInput = {
    update: XOR<
      SpecializationUpdateWithoutPrimaryWorkersInput,
      SpecializationUncheckedUpdateWithoutPrimaryWorkersInput
    >;
    create: XOR<
      SpecializationCreateWithoutPrimaryWorkersInput,
      SpecializationUncheckedCreateWithoutPrimaryWorkersInput
    >;
    where?: SpecializationWhereInput;
  };

  export type SpecializationUpdateToOneWithWhereWithoutPrimaryWorkersInput = {
    where?: SpecializationWhereInput;
    data: XOR<
      SpecializationUpdateWithoutPrimaryWorkersInput,
      SpecializationUncheckedUpdateWithoutPrimaryWorkersInput
    >;
  };

  export type SpecializationUpdateWithoutPrimaryWorkersInput = {
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    secondaryWorkers?: SpecializationsForWorkersUpdateManyWithoutSpecializationNestedInput;
  };

  export type SpecializationUncheckedUpdateWithoutPrimaryWorkersInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    secondaryWorkers?: SpecializationsForWorkersUncheckedUpdateManyWithoutSpecializationNestedInput;
  };

  export type UserUpsertWithoutWorkerInfoInput = {
    update: XOR<UserUpdateWithoutWorkerInfoInput, UserUncheckedUpdateWithoutWorkerInfoInput>;
    create: XOR<UserCreateWithoutWorkerInfoInput, UserUncheckedCreateWithoutWorkerInfoInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutWorkerInfoInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutWorkerInfoInput, UserUncheckedUpdateWithoutWorkerInfoInput>;
  };

  export type UserUpdateWithoutWorkerInfoInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    sessions?: SessionUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutWorkerInfoInput = {
    id?: IntFieldUpdateOperationsInput | number;
    phoneNumber?: StringFieldUpdateOperationsInput | string;
    fristName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    government?: StringFieldUpdateOperationsInput | string;
    city?: StringFieldUpdateOperationsInput | string;
    bio?: NullableStringFieldUpdateOperationsInput | string | null;
    status?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus;
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type GovermentUpsertWithWhereUniqueWithoutWorkerInfoInput = {
    where: GovermentWhereUniqueInput;
    update: XOR<
      GovermentUpdateWithoutWorkerInfoInput,
      GovermentUncheckedUpdateWithoutWorkerInfoInput
    >;
    create: XOR<
      GovermentCreateWithoutWorkerInfoInput,
      GovermentUncheckedCreateWithoutWorkerInfoInput
    >;
  };

  export type GovermentUpdateWithWhereUniqueWithoutWorkerInfoInput = {
    where: GovermentWhereUniqueInput;
    data: XOR<
      GovermentUpdateWithoutWorkerInfoInput,
      GovermentUncheckedUpdateWithoutWorkerInfoInput
    >;
  };

  export type GovermentUpdateManyWithWhereWithoutWorkerInfoInput = {
    where: GovermentScalarWhereInput;
    data: XOR<GovermentUpdateManyMutationInput, GovermentUncheckedUpdateManyWithoutWorkerInfoInput>;
  };

  export type GovermentScalarWhereInput = {
    AND?: GovermentScalarWhereInput | GovermentScalarWhereInput[];
    OR?: GovermentScalarWhereInput[];
    NOT?: GovermentScalarWhereInput | GovermentScalarWhereInput[];
    id?: IntFilter<'Goverment'> | number;
    name?: StringFilter<'Goverment'> | string;
    workerInfoId?: IntNullableFilter<'Goverment'> | number | null;
  };

  export type WorkerInfoCreateWithoutSecondarySpecializationsInput = {
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecialization: SpecializationCreateNestedOneWithoutPrimaryWorkersInput;
    user: UserCreateNestedOneWithoutWorkerInfoInput;
    goverments?: GovermentCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoUncheckedCreateWithoutSecondarySpecializationsInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
    goverments?: GovermentUncheckedCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoCreateOrConnectWithoutSecondarySpecializationsInput = {
    where: WorkerInfoWhereUniqueInput;
    create: XOR<
      WorkerInfoCreateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedCreateWithoutSecondarySpecializationsInput
    >;
  };

  export type SpecializationCreateWithoutSecondaryWorkersInput = {
    name: string;
    field: string;
    primaryWorkers?: WorkerInfoCreateNestedManyWithoutPrimarySpecializationInput;
  };

  export type SpecializationUncheckedCreateWithoutSecondaryWorkersInput = {
    id?: number;
    name: string;
    field: string;
    primaryWorkers?: WorkerInfoUncheckedCreateNestedManyWithoutPrimarySpecializationInput;
  };

  export type SpecializationCreateOrConnectWithoutSecondaryWorkersInput = {
    where: SpecializationWhereUniqueInput;
    create: XOR<
      SpecializationCreateWithoutSecondaryWorkersInput,
      SpecializationUncheckedCreateWithoutSecondaryWorkersInput
    >;
  };

  export type WorkerInfoUpsertWithoutSecondarySpecializationsInput = {
    update: XOR<
      WorkerInfoUpdateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedUpdateWithoutSecondarySpecializationsInput
    >;
    create: XOR<
      WorkerInfoCreateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedCreateWithoutSecondarySpecializationsInput
    >;
    where?: WorkerInfoWhereInput;
  };

  export type WorkerInfoUpdateToOneWithWhereWithoutSecondarySpecializationsInput = {
    where?: WorkerInfoWhereInput;
    data: XOR<
      WorkerInfoUpdateWithoutSecondarySpecializationsInput,
      WorkerInfoUncheckedUpdateWithoutSecondarySpecializationsInput
    >;
  };

  export type WorkerInfoUpdateWithoutSecondarySpecializationsInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecialization?: SpecializationUpdateOneRequiredWithoutPrimaryWorkersNestedInput;
    user?: UserUpdateOneRequiredWithoutWorkerInfoNestedInput;
    goverments?: GovermentUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateWithoutSecondarySpecializationsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecializationId?: IntFieldUpdateOperationsInput | number;
    goverments?: GovermentUncheckedUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type SpecializationUpsertWithoutSecondaryWorkersInput = {
    update: XOR<
      SpecializationUpdateWithoutSecondaryWorkersInput,
      SpecializationUncheckedUpdateWithoutSecondaryWorkersInput
    >;
    create: XOR<
      SpecializationCreateWithoutSecondaryWorkersInput,
      SpecializationUncheckedCreateWithoutSecondaryWorkersInput
    >;
    where?: SpecializationWhereInput;
  };

  export type SpecializationUpdateToOneWithWhereWithoutSecondaryWorkersInput = {
    where?: SpecializationWhereInput;
    data: XOR<
      SpecializationUpdateWithoutSecondaryWorkersInput,
      SpecializationUncheckedUpdateWithoutSecondaryWorkersInput
    >;
  };

  export type SpecializationUpdateWithoutSecondaryWorkersInput = {
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    primaryWorkers?: WorkerInfoUpdateManyWithoutPrimarySpecializationNestedInput;
  };

  export type SpecializationUncheckedUpdateWithoutSecondaryWorkersInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
    field?: StringFieldUpdateOperationsInput | string;
    primaryWorkers?: WorkerInfoUncheckedUpdateManyWithoutPrimarySpecializationNestedInput;
  };

  export type SpecializationsForWorkersCreateWithoutSpecializationInput = {
    workerInfo: WorkerInfoCreateNestedOneWithoutSecondarySpecializationsInput;
  };

  export type SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput = {
    workerInfoId: number;
  };

  export type SpecializationsForWorkersCreateOrConnectWithoutSpecializationInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    create: XOR<
      SpecializationsForWorkersCreateWithoutSpecializationInput,
      SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
    >;
  };

  export type SpecializationsForWorkersCreateManySpecializationInputEnvelope = {
    data:
      | SpecializationsForWorkersCreateManySpecializationInput
      | SpecializationsForWorkersCreateManySpecializationInput[];
    skipDuplicates?: boolean;
  };

  export type WorkerInfoCreateWithoutPrimarySpecializationInput = {
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    secondarySpecializations?: SpecializationsForWorkersCreateNestedManyWithoutWorkerInfoInput;
    user: UserCreateNestedOneWithoutWorkerInfoInput;
    goverments?: GovermentCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    secondarySpecializations?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutWorkerInfoInput;
    goverments?: GovermentUncheckedCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoCreateOrConnectWithoutPrimarySpecializationInput = {
    where: WorkerInfoWhereUniqueInput;
    create: XOR<
      WorkerInfoCreateWithoutPrimarySpecializationInput,
      WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
    >;
  };

  export type WorkerInfoCreateManyPrimarySpecializationInputEnvelope = {
    data:
      | WorkerInfoCreateManyPrimarySpecializationInput
      | WorkerInfoCreateManyPrimarySpecializationInput[];
    skipDuplicates?: boolean;
  };

  export type SpecializationsForWorkersUpsertWithWhereUniqueWithoutSpecializationInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    update: XOR<
      SpecializationsForWorkersUpdateWithoutSpecializationInput,
      SpecializationsForWorkersUncheckedUpdateWithoutSpecializationInput
    >;
    create: XOR<
      SpecializationsForWorkersCreateWithoutSpecializationInput,
      SpecializationsForWorkersUncheckedCreateWithoutSpecializationInput
    >;
  };

  export type SpecializationsForWorkersUpdateWithWhereUniqueWithoutSpecializationInput = {
    where: SpecializationsForWorkersWhereUniqueInput;
    data: XOR<
      SpecializationsForWorkersUpdateWithoutSpecializationInput,
      SpecializationsForWorkersUncheckedUpdateWithoutSpecializationInput
    >;
  };

  export type SpecializationsForWorkersUpdateManyWithWhereWithoutSpecializationInput = {
    where: SpecializationsForWorkersScalarWhereInput;
    data: XOR<
      SpecializationsForWorkersUpdateManyMutationInput,
      SpecializationsForWorkersUncheckedUpdateManyWithoutSpecializationInput
    >;
  };

  export type WorkerInfoUpsertWithWhereUniqueWithoutPrimarySpecializationInput = {
    where: WorkerInfoWhereUniqueInput;
    update: XOR<
      WorkerInfoUpdateWithoutPrimarySpecializationInput,
      WorkerInfoUncheckedUpdateWithoutPrimarySpecializationInput
    >;
    create: XOR<
      WorkerInfoCreateWithoutPrimarySpecializationInput,
      WorkerInfoUncheckedCreateWithoutPrimarySpecializationInput
    >;
  };

  export type WorkerInfoUpdateWithWhereUniqueWithoutPrimarySpecializationInput = {
    where: WorkerInfoWhereUniqueInput;
    data: XOR<
      WorkerInfoUpdateWithoutPrimarySpecializationInput,
      WorkerInfoUncheckedUpdateWithoutPrimarySpecializationInput
    >;
  };

  export type WorkerInfoUpdateManyWithWhereWithoutPrimarySpecializationInput = {
    where: WorkerInfoScalarWhereInput;
    data: XOR<
      WorkerInfoUpdateManyMutationInput,
      WorkerInfoUncheckedUpdateManyWithoutPrimarySpecializationInput
    >;
  };

  export type WorkerInfoScalarWhereInput = {
    AND?: WorkerInfoScalarWhereInput | WorkerInfoScalarWhereInput[];
    OR?: WorkerInfoScalarWhereInput[];
    NOT?: WorkerInfoScalarWhereInput | WorkerInfoScalarWhereInput[];
    id?: IntFilter<'WorkerInfo'> | number;
    userId?: IntFilter<'WorkerInfo'> | number;
    experienceYears?: IntFilter<'WorkerInfo'> | number;
    isInTeam?: BoolFilter<'WorkerInfo'> | boolean;
    acceptsUrgentJobs?: BoolFilter<'WorkerInfo'> | boolean;
    primarySpecializationId?: IntFilter<'WorkerInfo'> | number;
  };

  export type WorkerInfoCreateWithoutGovermentsInput = {
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    secondarySpecializations?: SpecializationsForWorkersCreateNestedManyWithoutWorkerInfoInput;
    primarySpecialization: SpecializationCreateNestedOneWithoutPrimaryWorkersInput;
    user: UserCreateNestedOneWithoutWorkerInfoInput;
  };

  export type WorkerInfoUncheckedCreateWithoutGovermentsInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
    primarySpecializationId: number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedCreateNestedManyWithoutWorkerInfoInput;
  };

  export type WorkerInfoCreateOrConnectWithoutGovermentsInput = {
    where: WorkerInfoWhereUniqueInput;
    create: XOR<
      WorkerInfoCreateWithoutGovermentsInput,
      WorkerInfoUncheckedCreateWithoutGovermentsInput
    >;
  };

  export type WorkerInfoUpsertWithoutGovermentsInput = {
    update: XOR<
      WorkerInfoUpdateWithoutGovermentsInput,
      WorkerInfoUncheckedUpdateWithoutGovermentsInput
    >;
    create: XOR<
      WorkerInfoCreateWithoutGovermentsInput,
      WorkerInfoUncheckedCreateWithoutGovermentsInput
    >;
    where?: WorkerInfoWhereInput;
  };

  export type WorkerInfoUpdateToOneWithWhereWithoutGovermentsInput = {
    where?: WorkerInfoWhereInput;
    data: XOR<
      WorkerInfoUpdateWithoutGovermentsInput,
      WorkerInfoUncheckedUpdateWithoutGovermentsInput
    >;
  };

  export type WorkerInfoUpdateWithoutGovermentsInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    secondarySpecializations?: SpecializationsForWorkersUpdateManyWithoutWorkerInfoNestedInput;
    primarySpecialization?: SpecializationUpdateOneRequiredWithoutPrimaryWorkersNestedInput;
    user?: UserUpdateOneRequiredWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateWithoutGovermentsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    primarySpecializationId?: IntFieldUpdateOperationsInput | number;
    secondarySpecializations?: SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type SessionCreateManyUserInput = {
    id?: number;
    token: string;
    isRevoked?: boolean;
    deviceFingerprint: string;
    lastUsedAt?: Date | string;
    createdAt?: Date | string;
    expiresAt: Date | string;
  };

  export type SessionUpdateWithoutUserInput = {
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number;
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number;
    token?: StringFieldUpdateOperationsInput | string;
    isRevoked?: BoolFieldUpdateOperationsInput | boolean;
    deviceFingerprint?: StringFieldUpdateOperationsInput | string;
    lastUsedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SpecializationsForWorkersCreateManyWorkerInfoInput = {
    specializationId: number;
  };

  export type GovermentCreateManyWorkerInfoInput = {
    id?: number;
    name: string;
  };

  export type SpecializationsForWorkersUpdateWithoutWorkerInfoInput = {
    specialization?: SpecializationUpdateOneRequiredWithoutSecondaryWorkersNestedInput;
  };

  export type SpecializationsForWorkersUncheckedUpdateWithoutWorkerInfoInput = {
    specializationId?: IntFieldUpdateOperationsInput | number;
  };

  export type SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoInput = {
    specializationId?: IntFieldUpdateOperationsInput | number;
  };

  export type GovermentUpdateWithoutWorkerInfoInput = {
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type GovermentUncheckedUpdateWithoutWorkerInfoInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type GovermentUncheckedUpdateManyWithoutWorkerInfoInput = {
    id?: IntFieldUpdateOperationsInput | number;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type SpecializationsForWorkersCreateManySpecializationInput = {
    workerInfoId: number;
  };

  export type WorkerInfoCreateManyPrimarySpecializationInput = {
    id?: number;
    userId: number;
    experienceYears: number;
    isInTeam: boolean;
    acceptsUrgentJobs: boolean;
  };

  export type SpecializationsForWorkersUpdateWithoutSpecializationInput = {
    workerInfo?: WorkerInfoUpdateOneRequiredWithoutSecondarySpecializationsNestedInput;
  };

  export type SpecializationsForWorkersUncheckedUpdateWithoutSpecializationInput = {
    workerInfoId?: IntFieldUpdateOperationsInput | number;
  };

  export type SpecializationsForWorkersUncheckedUpdateManyWithoutSpecializationInput = {
    workerInfoId?: IntFieldUpdateOperationsInput | number;
  };

  export type WorkerInfoUpdateWithoutPrimarySpecializationInput = {
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    secondarySpecializations?: SpecializationsForWorkersUpdateManyWithoutWorkerInfoNestedInput;
    user?: UserUpdateOneRequiredWithoutWorkerInfoNestedInput;
    goverments?: GovermentUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateWithoutPrimarySpecializationInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
    secondarySpecializations?: SpecializationsForWorkersUncheckedUpdateManyWithoutWorkerInfoNestedInput;
    goverments?: GovermentUncheckedUpdateManyWithoutWorkerInfoNestedInput;
  };

  export type WorkerInfoUncheckedUpdateManyWithoutPrimarySpecializationInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: IntFieldUpdateOperationsInput | number;
    experienceYears?: IntFieldUpdateOperationsInput | number;
    isInTeam?: BoolFieldUpdateOperationsInput | boolean;
    acceptsUrgentJobs?: BoolFieldUpdateOperationsInput | boolean;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
