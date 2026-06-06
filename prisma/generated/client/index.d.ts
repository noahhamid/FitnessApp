
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserProfile
 * 
 */
export type UserProfile = $Result.DefaultSelection<Prisma.$UserProfilePayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Verification
 * 
 */
export type Verification = $Result.DefaultSelection<Prisma.$VerificationPayload>
/**
 * Model WorkoutSession
 * 
 */
export type WorkoutSession = $Result.DefaultSelection<Prisma.$WorkoutSessionPayload>
/**
 * Model WorkoutExercise
 * 
 */
export type WorkoutExercise = $Result.DefaultSelection<Prisma.$WorkoutExercisePayload>
/**
 * Model NutritionGoal
 * 
 */
export type NutritionGoal = $Result.DefaultSelection<Prisma.$NutritionGoalPayload>
/**
 * Model MealLog
 * 
 */
export type MealLog = $Result.DefaultSelection<Prisma.$MealLogPayload>
/**
 * Model WeightLog
 * 
 */
export type WeightLog = $Result.DefaultSelection<Prisma.$WeightLogPayload>
/**
 * Model WeightGoal
 * 
 */
export type WeightGoal = $Result.DefaultSelection<Prisma.$WeightGoalPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Meal: {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  Snack: 'Snack'
};

export type Meal = (typeof Meal)[keyof typeof Meal]

}

export type Meal = $Enums.Meal

export const Meal: typeof $Enums.Meal

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

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
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

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
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

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
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

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
   * `prisma.userProfile`: Exposes CRUD operations for the **UserProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProfiles
    * const userProfiles = await prisma.userProfile.findMany()
    * ```
    */
  get userProfile(): Prisma.UserProfileDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verification`: Exposes CRUD operations for the **Verification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verifications
    * const verifications = await prisma.verification.findMany()
    * ```
    */
  get verification(): Prisma.VerificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workoutSession`: Exposes CRUD operations for the **WorkoutSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutSessions
    * const workoutSessions = await prisma.workoutSession.findMany()
    * ```
    */
  get workoutSession(): Prisma.WorkoutSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workoutExercise`: Exposes CRUD operations for the **WorkoutExercise** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutExercises
    * const workoutExercises = await prisma.workoutExercise.findMany()
    * ```
    */
  get workoutExercise(): Prisma.WorkoutExerciseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nutritionGoal`: Exposes CRUD operations for the **NutritionGoal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NutritionGoals
    * const nutritionGoals = await prisma.nutritionGoal.findMany()
    * ```
    */
  get nutritionGoal(): Prisma.NutritionGoalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mealLog`: Exposes CRUD operations for the **MealLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MealLogs
    * const mealLogs = await prisma.mealLog.findMany()
    * ```
    */
  get mealLog(): Prisma.MealLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.weightLog`: Exposes CRUD operations for the **WeightLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeightLogs
    * const weightLogs = await prisma.weightLog.findMany()
    * ```
    */
  get weightLog(): Prisma.WeightLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.weightGoal`: Exposes CRUD operations for the **WeightGoal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeightGoals
    * const weightGoals = await prisma.weightGoal.findMany()
    * ```
    */
  get weightGoal(): Prisma.WeightGoalDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

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
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
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
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    UserProfile: 'UserProfile',
    Session: 'Session',
    Account: 'Account',
    Verification: 'Verification',
    WorkoutSession: 'WorkoutSession',
    WorkoutExercise: 'WorkoutExercise',
    NutritionGoal: 'NutritionGoal',
    MealLog: 'MealLog',
    WeightLog: 'WeightLog',
    WeightGoal: 'WeightGoal'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "userProfile" | "session" | "account" | "verification" | "workoutSession" | "workoutExercise" | "nutritionGoal" | "mealLog" | "weightLog" | "weightGoal"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserProfile: {
        payload: Prisma.$UserProfilePayload<ExtArgs>
        fields: Prisma.UserProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findFirst: {
            args: Prisma.UserProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findMany: {
            args: Prisma.UserProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          create: {
            args: Prisma.UserProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          createMany: {
            args: Prisma.UserProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          delete: {
            args: Prisma.UserProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          update: {
            args: Prisma.UserProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          upsert: {
            args: Prisma.UserProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          aggregate: {
            args: Prisma.UserProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProfile>
          }
          groupBy: {
            args: Prisma.UserProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserProfileCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Verification: {
        payload: Prisma.$VerificationPayload<ExtArgs>
        fields: Prisma.VerificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findFirst: {
            args: Prisma.VerificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findMany: {
            args: Prisma.VerificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          create: {
            args: Prisma.VerificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          createMany: {
            args: Prisma.VerificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          delete: {
            args: Prisma.VerificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          update: {
            args: Prisma.VerificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          deleteMany: {
            args: Prisma.VerificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          upsert: {
            args: Prisma.VerificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          aggregate: {
            args: Prisma.VerificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerification>
          }
          groupBy: {
            args: Prisma.VerificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationCountAggregateOutputType> | number
          }
        }
      }
      WorkoutSession: {
        payload: Prisma.$WorkoutSessionPayload<ExtArgs>
        fields: Prisma.WorkoutSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          findFirst: {
            args: Prisma.WorkoutSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          findMany: {
            args: Prisma.WorkoutSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[]
          }
          create: {
            args: Prisma.WorkoutSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          createMany: {
            args: Prisma.WorkoutSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[]
          }
          delete: {
            args: Prisma.WorkoutSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          update: {
            args: Prisma.WorkoutSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          deleteMany: {
            args: Prisma.WorkoutSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkoutSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[]
          }
          upsert: {
            args: Prisma.WorkoutSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          aggregate: {
            args: Prisma.WorkoutSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutSession>
          }
          groupBy: {
            args: Prisma.WorkoutSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutSessionCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutSessionCountAggregateOutputType> | number
          }
        }
      }
      WorkoutExercise: {
        payload: Prisma.$WorkoutExercisePayload<ExtArgs>
        fields: Prisma.WorkoutExerciseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutExerciseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          findFirst: {
            args: Prisma.WorkoutExerciseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutExerciseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          findMany: {
            args: Prisma.WorkoutExerciseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>[]
          }
          create: {
            args: Prisma.WorkoutExerciseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          createMany: {
            args: Prisma.WorkoutExerciseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutExerciseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>[]
          }
          delete: {
            args: Prisma.WorkoutExerciseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          update: {
            args: Prisma.WorkoutExerciseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          deleteMany: {
            args: Prisma.WorkoutExerciseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutExerciseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkoutExerciseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>[]
          }
          upsert: {
            args: Prisma.WorkoutExerciseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          aggregate: {
            args: Prisma.WorkoutExerciseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutExercise>
          }
          groupBy: {
            args: Prisma.WorkoutExerciseGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutExerciseGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutExerciseCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutExerciseCountAggregateOutputType> | number
          }
        }
      }
      NutritionGoal: {
        payload: Prisma.$NutritionGoalPayload<ExtArgs>
        fields: Prisma.NutritionGoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NutritionGoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NutritionGoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          findFirst: {
            args: Prisma.NutritionGoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NutritionGoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          findMany: {
            args: Prisma.NutritionGoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>[]
          }
          create: {
            args: Prisma.NutritionGoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          createMany: {
            args: Prisma.NutritionGoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NutritionGoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>[]
          }
          delete: {
            args: Prisma.NutritionGoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          update: {
            args: Prisma.NutritionGoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          deleteMany: {
            args: Prisma.NutritionGoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NutritionGoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NutritionGoalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>[]
          }
          upsert: {
            args: Prisma.NutritionGoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionGoalPayload>
          }
          aggregate: {
            args: Prisma.NutritionGoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNutritionGoal>
          }
          groupBy: {
            args: Prisma.NutritionGoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<NutritionGoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.NutritionGoalCountArgs<ExtArgs>
            result: $Utils.Optional<NutritionGoalCountAggregateOutputType> | number
          }
        }
      }
      MealLog: {
        payload: Prisma.$MealLogPayload<ExtArgs>
        fields: Prisma.MealLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MealLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MealLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          findFirst: {
            args: Prisma.MealLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MealLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          findMany: {
            args: Prisma.MealLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>[]
          }
          create: {
            args: Prisma.MealLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          createMany: {
            args: Prisma.MealLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MealLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>[]
          }
          delete: {
            args: Prisma.MealLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          update: {
            args: Prisma.MealLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          deleteMany: {
            args: Prisma.MealLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MealLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MealLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>[]
          }
          upsert: {
            args: Prisma.MealLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealLogPayload>
          }
          aggregate: {
            args: Prisma.MealLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMealLog>
          }
          groupBy: {
            args: Prisma.MealLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<MealLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.MealLogCountArgs<ExtArgs>
            result: $Utils.Optional<MealLogCountAggregateOutputType> | number
          }
        }
      }
      WeightLog: {
        payload: Prisma.$WeightLogPayload<ExtArgs>
        fields: Prisma.WeightLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeightLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeightLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          findFirst: {
            args: Prisma.WeightLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeightLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          findMany: {
            args: Prisma.WeightLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>[]
          }
          create: {
            args: Prisma.WeightLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          createMany: {
            args: Prisma.WeightLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeightLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>[]
          }
          delete: {
            args: Prisma.WeightLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          update: {
            args: Prisma.WeightLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          deleteMany: {
            args: Prisma.WeightLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeightLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeightLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>[]
          }
          upsert: {
            args: Prisma.WeightLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightLogPayload>
          }
          aggregate: {
            args: Prisma.WeightLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeightLog>
          }
          groupBy: {
            args: Prisma.WeightLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeightLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeightLogCountArgs<ExtArgs>
            result: $Utils.Optional<WeightLogCountAggregateOutputType> | number
          }
        }
      }
      WeightGoal: {
        payload: Prisma.$WeightGoalPayload<ExtArgs>
        fields: Prisma.WeightGoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeightGoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeightGoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          findFirst: {
            args: Prisma.WeightGoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeightGoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          findMany: {
            args: Prisma.WeightGoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>[]
          }
          create: {
            args: Prisma.WeightGoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          createMany: {
            args: Prisma.WeightGoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeightGoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>[]
          }
          delete: {
            args: Prisma.WeightGoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          update: {
            args: Prisma.WeightGoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          deleteMany: {
            args: Prisma.WeightGoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeightGoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeightGoalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>[]
          }
          upsert: {
            args: Prisma.WeightGoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightGoalPayload>
          }
          aggregate: {
            args: Prisma.WeightGoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeightGoal>
          }
          groupBy: {
            args: Prisma.WeightGoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeightGoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeightGoalCountArgs<ExtArgs>
            result: $Utils.Optional<WeightGoalCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
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
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
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
    omit?: Prisma.GlobalOmitConfig
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
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    userProfile?: UserProfileOmit
    session?: SessionOmit
    account?: AccountOmit
    verification?: VerificationOmit
    workoutSession?: WorkoutSessionOmit
    workoutExercise?: WorkoutExerciseOmit
    nutritionGoal?: NutritionGoalOmit
    mealLog?: MealLogOmit
    weightLog?: WeightLogOmit
    weightGoal?: WeightGoalOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
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
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sessions: number
    accounts: number
    workoutSessions: number
    mealLogs: number
    weightLogs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    accounts?: boolean | UserCountOutputTypeCountAccountsArgs
    workoutSessions?: boolean | UserCountOutputTypeCountWorkoutSessionsArgs
    mealLogs?: boolean | UserCountOutputTypeCountMealLogsArgs
    weightLogs?: boolean | UserCountOutputTypeCountWeightLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWorkoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutSessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMealLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MealLogWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWeightLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightLogWhereInput
  }


  /**
   * Count Type WorkoutSessionCountOutputType
   */

  export type WorkoutSessionCountOutputType = {
    exercises: number
  }

  export type WorkoutSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercises?: boolean | WorkoutSessionCountOutputTypeCountExercisesArgs
  }

  // Custom InputTypes
  /**
   * WorkoutSessionCountOutputType without action
   */
  export type WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSessionCountOutputType
     */
    select?: WorkoutSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WorkoutSessionCountOutputType without action
   */
  export type WorkoutSessionCountOutputTypeCountExercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutExerciseWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: boolean | null
    image: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: boolean | null
    image: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    accounts?: boolean | User$accountsArgs<ExtArgs>
    workoutSessions?: boolean | User$workoutSessionsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    nutritionGoal?: boolean | User$nutritionGoalArgs<ExtArgs>
    mealLogs?: boolean | User$mealLogsArgs<ExtArgs>
    weightLogs?: boolean | User$weightLogsArgs<ExtArgs>
    weightGoal?: boolean | User$weightGoalArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    accounts?: boolean | User$accountsArgs<ExtArgs>
    workoutSessions?: boolean | User$workoutSessionsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    nutritionGoal?: boolean | User$nutritionGoalArgs<ExtArgs>
    mealLogs?: boolean | User$mealLogsArgs<ExtArgs>
    weightLogs?: boolean | User$weightLogsArgs<ExtArgs>
    weightGoal?: boolean | User$weightGoalArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      accounts: Prisma.$AccountPayload<ExtArgs>[]
      workoutSessions: Prisma.$WorkoutSessionPayload<ExtArgs>[]
      profile: Prisma.$UserProfilePayload<ExtArgs> | null
      nutritionGoal: Prisma.$NutritionGoalPayload<ExtArgs> | null
      mealLogs: Prisma.$MealLogPayload<ExtArgs>[]
      weightLogs: Prisma.$WeightLogPayload<ExtArgs>[]
      weightGoal: Prisma.$WeightGoalPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      emailVerified: boolean
      image: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
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
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

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
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

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
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

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
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


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
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

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
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
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
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    workoutSessions<T extends User$workoutSessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$workoutSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    nutritionGoal<T extends User$nutritionGoalArgs<ExtArgs> = {}>(args?: Subset<T, User$nutritionGoalArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    mealLogs<T extends User$mealLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$mealLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    weightLogs<T extends User$weightLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$weightLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    weightGoal<T extends User$weightGoalArgs<ExtArgs> = {}>(args?: Subset<T, User$weightGoalArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly emailVerified: FieldRef<"User", 'Boolean'>
    readonly image: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.accounts
   */
  export type User$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * User.workoutSessions
   */
  export type User$workoutSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    where?: WorkoutSessionWhereInput
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    cursor?: WorkoutSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    where?: UserProfileWhereInput
  }

  /**
   * User.nutritionGoal
   */
  export type User$nutritionGoalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    where?: NutritionGoalWhereInput
  }

  /**
   * User.mealLogs
   */
  export type User$mealLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    where?: MealLogWhereInput
    orderBy?: MealLogOrderByWithRelationInput | MealLogOrderByWithRelationInput[]
    cursor?: MealLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MealLogScalarFieldEnum | MealLogScalarFieldEnum[]
  }

  /**
   * User.weightLogs
   */
  export type User$weightLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    where?: WeightLogWhereInput
    orderBy?: WeightLogOrderByWithRelationInput | WeightLogOrderByWithRelationInput[]
    cursor?: WeightLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WeightLogScalarFieldEnum | WeightLogScalarFieldEnum[]
  }

  /**
   * User.weightGoal
   */
  export type User$weightGoalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    where?: WeightGoalWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserProfile
   */

  export type AggregateUserProfile = {
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  export type UserProfileAvgAggregateOutputType = {
    weightKg: Decimal | null
    heightCm: number | null
    age: number | null
  }

  export type UserProfileSumAggregateOutputType = {
    weightKg: Decimal | null
    heightCm: number | null
    age: number | null
  }

  export type UserProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    goalId: string | null
    weightKg: Decimal | null
    heightCm: number | null
    age: number | null
    updatedAt: Date | null
  }

  export type UserProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    goalId: string | null
    weightKg: Decimal | null
    heightCm: number | null
    age: number | null
    updatedAt: Date | null
  }

  export type UserProfileCountAggregateOutputType = {
    id: number
    userId: number
    goalId: number
    weightKg: number
    heightCm: number
    age: number
    updatedAt: number
    _all: number
  }


  export type UserProfileAvgAggregateInputType = {
    weightKg?: true
    heightCm?: true
    age?: true
  }

  export type UserProfileSumAggregateInputType = {
    weightKg?: true
    heightCm?: true
    age?: true
  }

  export type UserProfileMinAggregateInputType = {
    id?: true
    userId?: true
    goalId?: true
    weightKg?: true
    heightCm?: true
    age?: true
    updatedAt?: true
  }

  export type UserProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    goalId?: true
    weightKg?: true
    heightCm?: true
    age?: true
    updatedAt?: true
  }

  export type UserProfileCountAggregateInputType = {
    id?: true
    userId?: true
    goalId?: true
    weightKg?: true
    heightCm?: true
    age?: true
    updatedAt?: true
    _all?: true
  }

  export type UserProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfile to aggregate.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProfiles
    **/
    _count?: true | UserProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProfileMaxAggregateInputType
  }

  export type GetUserProfileAggregateType<T extends UserProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProfile[P]>
      : GetScalarType<T[P], AggregateUserProfile[P]>
  }




  export type UserProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithAggregationInput | UserProfileOrderByWithAggregationInput[]
    by: UserProfileScalarFieldEnum[] | UserProfileScalarFieldEnum
    having?: UserProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProfileCountAggregateInputType | true
    _avg?: UserProfileAvgAggregateInputType
    _sum?: UserProfileSumAggregateInputType
    _min?: UserProfileMinAggregateInputType
    _max?: UserProfileMaxAggregateInputType
  }

  export type UserProfileGroupByOutputType = {
    id: string
    userId: string
    goalId: string | null
    weightKg: Decimal | null
    heightCm: number | null
    age: number | null
    updatedAt: Date
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  type GetUserProfileGroupByPayload<T extends UserProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    goalId?: boolean
    weightKg?: boolean
    heightCm?: boolean
    age?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    goalId?: boolean
    weightKg?: boolean
    heightCm?: boolean
    age?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    goalId?: boolean
    weightKg?: boolean
    heightCm?: boolean
    age?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    goalId?: boolean
    weightKg?: boolean
    heightCm?: boolean
    age?: boolean
    updatedAt?: boolean
  }

  export type UserProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "goalId" | "weightKg" | "heightCm" | "age" | "updatedAt", ExtArgs["result"]["userProfile"]>
  export type UserProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      goalId: string | null
      weightKg: Prisma.Decimal | null
      heightCm: number | null
      age: number | null
      updatedAt: Date
    }, ExtArgs["result"]["userProfile"]>
    composites: {}
  }

  type UserProfileGetPayload<S extends boolean | null | undefined | UserProfileDefaultArgs> = $Result.GetResult<Prisma.$UserProfilePayload, S>

  type UserProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserProfileCountAggregateInputType | true
    }

  export interface UserProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProfile'], meta: { name: 'UserProfile' } }
    /**
     * Find zero or one UserProfile that matches the filter.
     * @param {UserProfileFindUniqueArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProfileFindUniqueArgs>(args: SelectSubset<T, UserProfileFindUniqueArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserProfileFindUniqueOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProfileFindFirstArgs>(args?: SelectSubset<T, UserProfileFindFirstArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProfiles
     * const userProfiles = await prisma.userProfile.findMany()
     * 
     * // Get first 10 UserProfiles
     * const userProfiles = await prisma.userProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProfileFindManyArgs>(args?: SelectSubset<T, UserProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserProfile.
     * @param {UserProfileCreateArgs} args - Arguments to create a UserProfile.
     * @example
     * // Create one UserProfile
     * const UserProfile = await prisma.userProfile.create({
     *   data: {
     *     // ... data to create a UserProfile
     *   }
     * })
     * 
     */
    create<T extends UserProfileCreateArgs>(args: SelectSubset<T, UserProfileCreateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserProfiles.
     * @param {UserProfileCreateManyArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProfileCreateManyArgs>(args?: SelectSubset<T, UserProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProfiles and returns the data saved in the database.
     * @param {UserProfileCreateManyAndReturnArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserProfile.
     * @param {UserProfileDeleteArgs} args - Arguments to delete one UserProfile.
     * @example
     * // Delete one UserProfile
     * const UserProfile = await prisma.userProfile.delete({
     *   where: {
     *     // ... filter to delete one UserProfile
     *   }
     * })
     * 
     */
    delete<T extends UserProfileDeleteArgs>(args: SelectSubset<T, UserProfileDeleteArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserProfile.
     * @param {UserProfileUpdateArgs} args - Arguments to update one UserProfile.
     * @example
     * // Update one UserProfile
     * const userProfile = await prisma.userProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProfileUpdateArgs>(args: SelectSubset<T, UserProfileUpdateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserProfiles.
     * @param {UserProfileDeleteManyArgs} args - Arguments to filter UserProfiles to delete.
     * @example
     * // Delete a few UserProfiles
     * const { count } = await prisma.userProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProfileDeleteManyArgs>(args?: SelectSubset<T, UserProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProfileUpdateManyArgs>(args: SelectSubset<T, UserProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles and returns the data updated in the database.
     * @param {UserProfileUpdateManyAndReturnArgs} args - Arguments to update many UserProfiles.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, UserProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserProfile.
     * @param {UserProfileUpsertArgs} args - Arguments to update or create a UserProfile.
     * @example
     * // Update or create a UserProfile
     * const userProfile = await prisma.userProfile.upsert({
     *   create: {
     *     // ... data to create a UserProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserProfileUpsertArgs>(args: SelectSubset<T, UserProfileUpsertArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileCountArgs} args - Arguments to filter UserProfiles to count.
     * @example
     * // Count the number of UserProfiles
     * const count = await prisma.userProfile.count({
     *   where: {
     *     // ... the filter for the UserProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserProfileCountArgs>(
      args?: Subset<T, UserProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserProfileAggregateArgs>(args: Subset<T, UserProfileAggregateArgs>): Prisma.PrismaPromise<GetUserProfileAggregateType<T>>

    /**
     * Group by UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileGroupByArgs} args - Group by arguments.
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
      T extends UserProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserProfileGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProfile model
   */
  readonly fields: UserProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProfile model
   */
  interface UserProfileFieldRefs {
    readonly id: FieldRef<"UserProfile", 'String'>
    readonly userId: FieldRef<"UserProfile", 'String'>
    readonly goalId: FieldRef<"UserProfile", 'String'>
    readonly weightKg: FieldRef<"UserProfile", 'Decimal'>
    readonly heightCm: FieldRef<"UserProfile", 'Int'>
    readonly age: FieldRef<"UserProfile", 'Int'>
    readonly updatedAt: FieldRef<"UserProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserProfile findUnique
   */
  export type UserProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findUniqueOrThrow
   */
  export type UserProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findFirst
   */
  export type UserProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findFirstOrThrow
   */
  export type UserProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findMany
   */
  export type UserProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfiles to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile create
   */
  export type UserProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProfile.
     */
    data: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
  }

  /**
   * UserProfile createMany
   */
  export type UserProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile createManyAndReturn
   */
  export type UserProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile update
   */
  export type UserProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProfile.
     */
    data: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    /**
     * Choose, which UserProfile to update.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile updateMany
   */
  export type UserProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
  }

  /**
   * UserProfile updateManyAndReturn
   */
  export type UserProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile upsert
   */
  export type UserProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProfile to update in case it exists.
     */
    where: UserProfileWhereUniqueInput
    /**
     * In case the UserProfile found by the `where` argument doesn't exist, create a new UserProfile with this data.
     */
    create: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    /**
     * In case the UserProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
  }

  /**
   * UserProfile delete
   */
  export type UserProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter which UserProfile to delete.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile deleteMany
   */
  export type UserProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfiles to delete
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to delete.
     */
    limit?: number
  }

  /**
   * UserProfile without action
   */
  export type UserProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    expiresAt: Date | null
    token: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    expiresAt: Date | null
    token: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    expiresAt: number
    token: number
    ipAddress: number
    userAgent: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    expiresAt: Date
    token: string
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "expiresAt" | "token" | "ipAddress" | "userAgent" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      expiresAt: Date
      token: string
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
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
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

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
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

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
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

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
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

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
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

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
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

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
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


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
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

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
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

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
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
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
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly expiresAt: FieldRef<"Session", 'DateTime'>
    readonly token: FieldRef<"Session", 'String'>
    readonly ipAddress: FieldRef<"Session", 'String'>
    readonly userAgent: FieldRef<"Session", 'String'>
    readonly createdAt: FieldRef<"Session", 'DateTime'>
    readonly updatedAt: FieldRef<"Session", 'DateTime'>
    readonly userId: FieldRef<"Session", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    accountId: string | null
    providerId: string | null
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    accountId: string | null
    providerId: string | null
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    accountId: number
    providerId: number
    accessToken: number
    refreshToken: number
    idToken: number
    accessTokenExpiresAt: number
    refreshTokenExpiresAt: number
    scope: number
    password: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type AccountMinAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    accountId: string
    providerId: string
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "providerId" | "accessToken" | "refreshToken" | "idToken" | "accessTokenExpiresAt" | "refreshTokenExpiresAt" | "scope" | "password" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accountId: string
      providerId: string
      accessToken: string | null
      refreshToken: string | null
      idToken: string | null
      accessTokenExpiresAt: Date | null
      refreshTokenExpiresAt: Date | null
      scope: string | null
      password: string | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
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
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
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
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly accountId: FieldRef<"Account", 'String'>
    readonly providerId: FieldRef<"Account", 'String'>
    readonly accessToken: FieldRef<"Account", 'String'>
    readonly refreshToken: FieldRef<"Account", 'String'>
    readonly idToken: FieldRef<"Account", 'String'>
    readonly accessTokenExpiresAt: FieldRef<"Account", 'DateTime'>
    readonly refreshTokenExpiresAt: FieldRef<"Account", 'DateTime'>
    readonly scope: FieldRef<"Account", 'String'>
    readonly password: FieldRef<"Account", 'String'>
    readonly createdAt: FieldRef<"Account", 'DateTime'>
    readonly updatedAt: FieldRef<"Account", 'DateTime'>
    readonly userId: FieldRef<"Account", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Verification
   */

  export type AggregateVerification = {
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  export type VerificationMinAggregateOutputType = {
    id: string | null
    identifier: string | null
    value: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationMaxAggregateOutputType = {
    id: string | null
    identifier: string | null
    value: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationCountAggregateOutputType = {
    id: number
    identifier: number
    value: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VerificationMinAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationMaxAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationCountAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VerificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verification to aggregate.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Verifications
    **/
    _count?: true | VerificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationMaxAggregateInputType
  }

  export type GetVerificationAggregateType<T extends VerificationAggregateArgs> = {
        [P in keyof T & keyof AggregateVerification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerification[P]>
      : GetScalarType<T[P], AggregateVerification[P]>
  }




  export type VerificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationWhereInput
    orderBy?: VerificationOrderByWithAggregationInput | VerificationOrderByWithAggregationInput[]
    by: VerificationScalarFieldEnum[] | VerificationScalarFieldEnum
    having?: VerificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationCountAggregateInputType | true
    _min?: VerificationMinAggregateInputType
    _max?: VerificationMaxAggregateInputType
  }

  export type VerificationGroupByOutputType = {
    id: string
    identifier: string
    value: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  type GetVerificationGroupByPayload<T extends VerificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationGroupByOutputType[P]>
        }
      >
    >


  export type VerificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectScalar = {
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VerificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "identifier" | "value" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["verification"]>

  export type $VerificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Verification"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      identifier: string
      value: string
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["verification"]>
    composites: {}
  }

  type VerificationGetPayload<S extends boolean | null | undefined | VerificationDefaultArgs> = $Result.GetResult<Prisma.$VerificationPayload, S>

  type VerificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationCountAggregateInputType | true
    }

  export interface VerificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Verification'], meta: { name: 'Verification' } }
    /**
     * Find zero or one Verification that matches the filter.
     * @param {VerificationFindUniqueArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationFindUniqueArgs>(args: SelectSubset<T, VerificationFindUniqueArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Verification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationFindUniqueOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationFindFirstArgs>(args?: SelectSubset<T, VerificationFindFirstArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Verifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Verifications
     * const verifications = await prisma.verification.findMany()
     * 
     * // Get first 10 Verifications
     * const verifications = await prisma.verification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const verificationWithIdOnly = await prisma.verification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VerificationFindManyArgs>(args?: SelectSubset<T, VerificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Verification.
     * @param {VerificationCreateArgs} args - Arguments to create a Verification.
     * @example
     * // Create one Verification
     * const Verification = await prisma.verification.create({
     *   data: {
     *     // ... data to create a Verification
     *   }
     * })
     * 
     */
    create<T extends VerificationCreateArgs>(args: SelectSubset<T, VerificationCreateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Verifications.
     * @param {VerificationCreateManyArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationCreateManyArgs>(args?: SelectSubset<T, VerificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Verifications and returns the data saved in the database.
     * @param {VerificationCreateManyAndReturnArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Verification.
     * @param {VerificationDeleteArgs} args - Arguments to delete one Verification.
     * @example
     * // Delete one Verification
     * const Verification = await prisma.verification.delete({
     *   where: {
     *     // ... filter to delete one Verification
     *   }
     * })
     * 
     */
    delete<T extends VerificationDeleteArgs>(args: SelectSubset<T, VerificationDeleteArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Verification.
     * @param {VerificationUpdateArgs} args - Arguments to update one Verification.
     * @example
     * // Update one Verification
     * const verification = await prisma.verification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationUpdateArgs>(args: SelectSubset<T, VerificationUpdateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Verifications.
     * @param {VerificationDeleteManyArgs} args - Arguments to filter Verifications to delete.
     * @example
     * // Delete a few Verifications
     * const { count } = await prisma.verification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationDeleteManyArgs>(args?: SelectSubset<T, VerificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationUpdateManyArgs>(args: SelectSubset<T, VerificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications and returns the data updated in the database.
     * @param {VerificationUpdateManyAndReturnArgs} args - Arguments to update many Verifications.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Verification.
     * @param {VerificationUpsertArgs} args - Arguments to update or create a Verification.
     * @example
     * // Update or create a Verification
     * const verification = await prisma.verification.upsert({
     *   create: {
     *     // ... data to create a Verification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Verification we want to update
     *   }
     * })
     */
    upsert<T extends VerificationUpsertArgs>(args: SelectSubset<T, VerificationUpsertArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCountArgs} args - Arguments to filter Verifications to count.
     * @example
     * // Count the number of Verifications
     * const count = await prisma.verification.count({
     *   where: {
     *     // ... the filter for the Verifications we want to count
     *   }
     * })
    **/
    count<T extends VerificationCountArgs>(
      args?: Subset<T, VerificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationAggregateArgs>(args: Subset<T, VerificationAggregateArgs>): Prisma.PrismaPromise<GetVerificationAggregateType<T>>

    /**
     * Group by Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationGroupByArgs} args - Group by arguments.
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
      T extends VerificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationGroupByArgs['orderBy'] }
        : { orderBy?: VerificationGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Verification model
   */
  readonly fields: VerificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Verification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Verification model
   */
  interface VerificationFieldRefs {
    readonly id: FieldRef<"Verification", 'String'>
    readonly identifier: FieldRef<"Verification", 'String'>
    readonly value: FieldRef<"Verification", 'String'>
    readonly expiresAt: FieldRef<"Verification", 'DateTime'>
    readonly createdAt: FieldRef<"Verification", 'DateTime'>
    readonly updatedAt: FieldRef<"Verification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Verification findUnique
   */
  export type VerificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findUniqueOrThrow
   */
  export type VerificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findFirst
   */
  export type VerificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findFirstOrThrow
   */
  export type VerificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findMany
   */
  export type VerificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verifications to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification create
   */
  export type VerificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data needed to create a Verification.
     */
    data: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
  }

  /**
   * Verification createMany
   */
  export type VerificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verification createManyAndReturn
   */
  export type VerificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verification update
   */
  export type VerificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data needed to update a Verification.
     */
    data: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
    /**
     * Choose, which Verification to update.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification updateMany
   */
  export type VerificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
  }

  /**
   * Verification updateManyAndReturn
   */
  export type VerificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
  }

  /**
   * Verification upsert
   */
  export type VerificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The filter to search for the Verification to update in case it exists.
     */
    where: VerificationWhereUniqueInput
    /**
     * In case the Verification found by the `where` argument doesn't exist, create a new Verification with this data.
     */
    create: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
    /**
     * In case the Verification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
  }

  /**
   * Verification delete
   */
  export type VerificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter which Verification to delete.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification deleteMany
   */
  export type VerificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verifications to delete
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to delete.
     */
    limit?: number
  }

  /**
   * Verification without action
   */
  export type VerificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
  }


  /**
   * Model WorkoutSession
   */

  export type AggregateWorkoutSession = {
    _count: WorkoutSessionCountAggregateOutputType | null
    _min: WorkoutSessionMinAggregateOutputType | null
    _max: WorkoutSessionMaxAggregateOutputType | null
  }

  export type WorkoutSessionMinAggregateOutputType = {
    id: string | null
    startedAt: Date | null
    completedAt: Date | null
    notes: string | null
    userId: string | null
  }

  export type WorkoutSessionMaxAggregateOutputType = {
    id: string | null
    startedAt: Date | null
    completedAt: Date | null
    notes: string | null
    userId: string | null
  }

  export type WorkoutSessionCountAggregateOutputType = {
    id: number
    startedAt: number
    completedAt: number
    notes: number
    userId: number
    _all: number
  }


  export type WorkoutSessionMinAggregateInputType = {
    id?: true
    startedAt?: true
    completedAt?: true
    notes?: true
    userId?: true
  }

  export type WorkoutSessionMaxAggregateInputType = {
    id?: true
    startedAt?: true
    completedAt?: true
    notes?: true
    userId?: true
  }

  export type WorkoutSessionCountAggregateInputType = {
    id?: true
    startedAt?: true
    completedAt?: true
    notes?: true
    userId?: true
    _all?: true
  }

  export type WorkoutSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutSession to aggregate.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutSessions
    **/
    _count?: true | WorkoutSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutSessionMaxAggregateInputType
  }

  export type GetWorkoutSessionAggregateType<T extends WorkoutSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutSession[P]>
      : GetScalarType<T[P], AggregateWorkoutSession[P]>
  }




  export type WorkoutSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutSessionWhereInput
    orderBy?: WorkoutSessionOrderByWithAggregationInput | WorkoutSessionOrderByWithAggregationInput[]
    by: WorkoutSessionScalarFieldEnum[] | WorkoutSessionScalarFieldEnum
    having?: WorkoutSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutSessionCountAggregateInputType | true
    _min?: WorkoutSessionMinAggregateInputType
    _max?: WorkoutSessionMaxAggregateInputType
  }

  export type WorkoutSessionGroupByOutputType = {
    id: string
    startedAt: Date
    completedAt: Date | null
    notes: string | null
    userId: string
    _count: WorkoutSessionCountAggregateOutputType | null
    _min: WorkoutSessionMinAggregateOutputType | null
    _max: WorkoutSessionMaxAggregateOutputType | null
  }

  type GetWorkoutSessionGroupByPayload<T extends WorkoutSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutSessionGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutSessionGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    startedAt?: boolean
    completedAt?: boolean
    notes?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    exercises?: boolean | WorkoutSession$exercisesArgs<ExtArgs>
    _count?: boolean | WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutSession"]>

  export type WorkoutSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    startedAt?: boolean
    completedAt?: boolean
    notes?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutSession"]>

  export type WorkoutSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    startedAt?: boolean
    completedAt?: boolean
    notes?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutSession"]>

  export type WorkoutSessionSelectScalar = {
    id?: boolean
    startedAt?: boolean
    completedAt?: boolean
    notes?: boolean
    userId?: boolean
  }

  export type WorkoutSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "startedAt" | "completedAt" | "notes" | "userId", ExtArgs["result"]["workoutSession"]>
  export type WorkoutSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    exercises?: boolean | WorkoutSession$exercisesArgs<ExtArgs>
    _count?: boolean | WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WorkoutSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WorkoutSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WorkoutSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutSession"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      exercises: Prisma.$WorkoutExercisePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      startedAt: Date
      completedAt: Date | null
      notes: string | null
      userId: string
    }, ExtArgs["result"]["workoutSession"]>
    composites: {}
  }

  type WorkoutSessionGetPayload<S extends boolean | null | undefined | WorkoutSessionDefaultArgs> = $Result.GetResult<Prisma.$WorkoutSessionPayload, S>

  type WorkoutSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkoutSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkoutSessionCountAggregateInputType | true
    }

  export interface WorkoutSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutSession'], meta: { name: 'WorkoutSession' } }
    /**
     * Find zero or one WorkoutSession that matches the filter.
     * @param {WorkoutSessionFindUniqueArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutSessionFindUniqueArgs>(args: SelectSubset<T, WorkoutSessionFindUniqueArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkoutSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkoutSessionFindUniqueOrThrowArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkoutSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindFirstArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutSessionFindFirstArgs>(args?: SelectSubset<T, WorkoutSessionFindFirstArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkoutSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindFirstOrThrowArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkoutSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutSessions
     * const workoutSessions = await prisma.workoutSession.findMany()
     * 
     * // Get first 10 WorkoutSessions
     * const workoutSessions = await prisma.workoutSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutSessionWithIdOnly = await prisma.workoutSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutSessionFindManyArgs>(args?: SelectSubset<T, WorkoutSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkoutSession.
     * @param {WorkoutSessionCreateArgs} args - Arguments to create a WorkoutSession.
     * @example
     * // Create one WorkoutSession
     * const WorkoutSession = await prisma.workoutSession.create({
     *   data: {
     *     // ... data to create a WorkoutSession
     *   }
     * })
     * 
     */
    create<T extends WorkoutSessionCreateArgs>(args: SelectSubset<T, WorkoutSessionCreateArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkoutSessions.
     * @param {WorkoutSessionCreateManyArgs} args - Arguments to create many WorkoutSessions.
     * @example
     * // Create many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutSessionCreateManyArgs>(args?: SelectSubset<T, WorkoutSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutSessions and returns the data saved in the database.
     * @param {WorkoutSessionCreateManyAndReturnArgs} args - Arguments to create many WorkoutSessions.
     * @example
     * // Create many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutSessions and only return the `id`
     * const workoutSessionWithIdOnly = await prisma.workoutSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WorkoutSession.
     * @param {WorkoutSessionDeleteArgs} args - Arguments to delete one WorkoutSession.
     * @example
     * // Delete one WorkoutSession
     * const WorkoutSession = await prisma.workoutSession.delete({
     *   where: {
     *     // ... filter to delete one WorkoutSession
     *   }
     * })
     * 
     */
    delete<T extends WorkoutSessionDeleteArgs>(args: SelectSubset<T, WorkoutSessionDeleteArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkoutSession.
     * @param {WorkoutSessionUpdateArgs} args - Arguments to update one WorkoutSession.
     * @example
     * // Update one WorkoutSession
     * const workoutSession = await prisma.workoutSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutSessionUpdateArgs>(args: SelectSubset<T, WorkoutSessionUpdateArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkoutSessions.
     * @param {WorkoutSessionDeleteManyArgs} args - Arguments to filter WorkoutSessions to delete.
     * @example
     * // Delete a few WorkoutSessions
     * const { count } = await prisma.workoutSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutSessionDeleteManyArgs>(args?: SelectSubset<T, WorkoutSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutSessionUpdateManyArgs>(args: SelectSubset<T, WorkoutSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutSessions and returns the data updated in the database.
     * @param {WorkoutSessionUpdateManyAndReturnArgs} args - Arguments to update many WorkoutSessions.
     * @example
     * // Update many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WorkoutSessions and only return the `id`
     * const workoutSessionWithIdOnly = await prisma.workoutSession.updateManyAndReturn({
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
    updateManyAndReturn<T extends WorkoutSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkoutSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WorkoutSession.
     * @param {WorkoutSessionUpsertArgs} args - Arguments to update or create a WorkoutSession.
     * @example
     * // Update or create a WorkoutSession
     * const workoutSession = await prisma.workoutSession.upsert({
     *   create: {
     *     // ... data to create a WorkoutSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutSession we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutSessionUpsertArgs>(args: SelectSubset<T, WorkoutSessionUpsertArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionCountArgs} args - Arguments to filter WorkoutSessions to count.
     * @example
     * // Count the number of WorkoutSessions
     * const count = await prisma.workoutSession.count({
     *   where: {
     *     // ... the filter for the WorkoutSessions we want to count
     *   }
     * })
    **/
    count<T extends WorkoutSessionCountArgs>(
      args?: Subset<T, WorkoutSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutSessionAggregateArgs>(args: Subset<T, WorkoutSessionAggregateArgs>): Prisma.PrismaPromise<GetWorkoutSessionAggregateType<T>>

    /**
     * Group by WorkoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionGroupByArgs} args - Group by arguments.
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
      T extends WorkoutSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutSessionGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutSessionGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkoutSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutSession model
   */
  readonly fields: WorkoutSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    exercises<T extends WorkoutSession$exercisesArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSession$exercisesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WorkoutSession model
   */
  interface WorkoutSessionFieldRefs {
    readonly id: FieldRef<"WorkoutSession", 'String'>
    readonly startedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly completedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly notes: FieldRef<"WorkoutSession", 'String'>
    readonly userId: FieldRef<"WorkoutSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutSession findUnique
   */
  export type WorkoutSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession findUniqueOrThrow
   */
  export type WorkoutSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession findFirst
   */
  export type WorkoutSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutSessions.
     */
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession findFirstOrThrow
   */
  export type WorkoutSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutSessions.
     */
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession findMany
   */
  export type WorkoutSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSessions to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutSessions.
     */
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession create
   */
  export type WorkoutSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkoutSession.
     */
    data: XOR<WorkoutSessionCreateInput, WorkoutSessionUncheckedCreateInput>
  }

  /**
   * WorkoutSession createMany
   */
  export type WorkoutSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutSessions.
     */
    data: WorkoutSessionCreateManyInput | WorkoutSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutSession createManyAndReturn
   */
  export type WorkoutSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * The data used to create many WorkoutSessions.
     */
    data: WorkoutSessionCreateManyInput | WorkoutSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutSession update
   */
  export type WorkoutSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkoutSession.
     */
    data: XOR<WorkoutSessionUpdateInput, WorkoutSessionUncheckedUpdateInput>
    /**
     * Choose, which WorkoutSession to update.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession updateMany
   */
  export type WorkoutSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutSessions.
     */
    data: XOR<WorkoutSessionUpdateManyMutationInput, WorkoutSessionUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutSessions to update
     */
    where?: WorkoutSessionWhereInput
    /**
     * Limit how many WorkoutSessions to update.
     */
    limit?: number
  }

  /**
   * WorkoutSession updateManyAndReturn
   */
  export type WorkoutSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * The data used to update WorkoutSessions.
     */
    data: XOR<WorkoutSessionUpdateManyMutationInput, WorkoutSessionUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutSessions to update
     */
    where?: WorkoutSessionWhereInput
    /**
     * Limit how many WorkoutSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutSession upsert
   */
  export type WorkoutSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkoutSession to update in case it exists.
     */
    where: WorkoutSessionWhereUniqueInput
    /**
     * In case the WorkoutSession found by the `where` argument doesn't exist, create a new WorkoutSession with this data.
     */
    create: XOR<WorkoutSessionCreateInput, WorkoutSessionUncheckedCreateInput>
    /**
     * In case the WorkoutSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutSessionUpdateInput, WorkoutSessionUncheckedUpdateInput>
  }

  /**
   * WorkoutSession delete
   */
  export type WorkoutSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter which WorkoutSession to delete.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession deleteMany
   */
  export type WorkoutSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutSessions to delete
     */
    where?: WorkoutSessionWhereInput
    /**
     * Limit how many WorkoutSessions to delete.
     */
    limit?: number
  }

  /**
   * WorkoutSession.exercises
   */
  export type WorkoutSession$exercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    where?: WorkoutExerciseWhereInput
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    cursor?: WorkoutExerciseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutSession without action
   */
  export type WorkoutSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutSession
     */
    omit?: WorkoutSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
  }


  /**
   * Model WorkoutExercise
   */

  export type AggregateWorkoutExercise = {
    _count: WorkoutExerciseCountAggregateOutputType | null
    _min: WorkoutExerciseMinAggregateOutputType | null
    _max: WorkoutExerciseMaxAggregateOutputType | null
  }

  export type WorkoutExerciseMinAggregateOutputType = {
    id: string | null
    exerciseName: string | null
    sessionId: string | null
  }

  export type WorkoutExerciseMaxAggregateOutputType = {
    id: string | null
    exerciseName: string | null
    sessionId: string | null
  }

  export type WorkoutExerciseCountAggregateOutputType = {
    id: number
    exerciseName: number
    sets: number
    sessionId: number
    _all: number
  }


  export type WorkoutExerciseMinAggregateInputType = {
    id?: true
    exerciseName?: true
    sessionId?: true
  }

  export type WorkoutExerciseMaxAggregateInputType = {
    id?: true
    exerciseName?: true
    sessionId?: true
  }

  export type WorkoutExerciseCountAggregateInputType = {
    id?: true
    exerciseName?: true
    sets?: true
    sessionId?: true
    _all?: true
  }

  export type WorkoutExerciseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutExercise to aggregate.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutExercises
    **/
    _count?: true | WorkoutExerciseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutExerciseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutExerciseMaxAggregateInputType
  }

  export type GetWorkoutExerciseAggregateType<T extends WorkoutExerciseAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutExercise]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutExercise[P]>
      : GetScalarType<T[P], AggregateWorkoutExercise[P]>
  }




  export type WorkoutExerciseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutExerciseWhereInput
    orderBy?: WorkoutExerciseOrderByWithAggregationInput | WorkoutExerciseOrderByWithAggregationInput[]
    by: WorkoutExerciseScalarFieldEnum[] | WorkoutExerciseScalarFieldEnum
    having?: WorkoutExerciseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutExerciseCountAggregateInputType | true
    _min?: WorkoutExerciseMinAggregateInputType
    _max?: WorkoutExerciseMaxAggregateInputType
  }

  export type WorkoutExerciseGroupByOutputType = {
    id: string
    exerciseName: string
    sets: JsonValue
    sessionId: string
    _count: WorkoutExerciseCountAggregateOutputType | null
    _min: WorkoutExerciseMinAggregateOutputType | null
    _max: WorkoutExerciseMaxAggregateOutputType | null
  }

  type GetWorkoutExerciseGroupByPayload<T extends WorkoutExerciseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutExerciseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutExerciseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutExerciseGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutExerciseGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutExerciseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    exerciseName?: boolean
    sets?: boolean
    sessionId?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutExercise"]>

  export type WorkoutExerciseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    exerciseName?: boolean
    sets?: boolean
    sessionId?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutExercise"]>

  export type WorkoutExerciseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    exerciseName?: boolean
    sets?: boolean
    sessionId?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutExercise"]>

  export type WorkoutExerciseSelectScalar = {
    id?: boolean
    exerciseName?: boolean
    sets?: boolean
    sessionId?: boolean
  }

  export type WorkoutExerciseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "exerciseName" | "sets" | "sessionId", ExtArgs["result"]["workoutExercise"]>
  export type WorkoutExerciseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }
  export type WorkoutExerciseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }
  export type WorkoutExerciseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }

  export type $WorkoutExercisePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutExercise"
    objects: {
      session: Prisma.$WorkoutSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      exerciseName: string
      sets: Prisma.JsonValue
      sessionId: string
    }, ExtArgs["result"]["workoutExercise"]>
    composites: {}
  }

  type WorkoutExerciseGetPayload<S extends boolean | null | undefined | WorkoutExerciseDefaultArgs> = $Result.GetResult<Prisma.$WorkoutExercisePayload, S>

  type WorkoutExerciseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkoutExerciseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkoutExerciseCountAggregateInputType | true
    }

  export interface WorkoutExerciseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutExercise'], meta: { name: 'WorkoutExercise' } }
    /**
     * Find zero or one WorkoutExercise that matches the filter.
     * @param {WorkoutExerciseFindUniqueArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutExerciseFindUniqueArgs>(args: SelectSubset<T, WorkoutExerciseFindUniqueArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkoutExercise that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkoutExerciseFindUniqueOrThrowArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutExerciseFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkoutExercise that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindFirstArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutExerciseFindFirstArgs>(args?: SelectSubset<T, WorkoutExerciseFindFirstArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkoutExercise that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindFirstOrThrowArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutExerciseFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutExerciseFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkoutExercises that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutExercises
     * const workoutExercises = await prisma.workoutExercise.findMany()
     * 
     * // Get first 10 WorkoutExercises
     * const workoutExercises = await prisma.workoutExercise.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutExerciseWithIdOnly = await prisma.workoutExercise.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutExerciseFindManyArgs>(args?: SelectSubset<T, WorkoutExerciseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkoutExercise.
     * @param {WorkoutExerciseCreateArgs} args - Arguments to create a WorkoutExercise.
     * @example
     * // Create one WorkoutExercise
     * const WorkoutExercise = await prisma.workoutExercise.create({
     *   data: {
     *     // ... data to create a WorkoutExercise
     *   }
     * })
     * 
     */
    create<T extends WorkoutExerciseCreateArgs>(args: SelectSubset<T, WorkoutExerciseCreateArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkoutExercises.
     * @param {WorkoutExerciseCreateManyArgs} args - Arguments to create many WorkoutExercises.
     * @example
     * // Create many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutExerciseCreateManyArgs>(args?: SelectSubset<T, WorkoutExerciseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutExercises and returns the data saved in the database.
     * @param {WorkoutExerciseCreateManyAndReturnArgs} args - Arguments to create many WorkoutExercises.
     * @example
     * // Create many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutExercises and only return the `id`
     * const workoutExerciseWithIdOnly = await prisma.workoutExercise.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutExerciseCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutExerciseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WorkoutExercise.
     * @param {WorkoutExerciseDeleteArgs} args - Arguments to delete one WorkoutExercise.
     * @example
     * // Delete one WorkoutExercise
     * const WorkoutExercise = await prisma.workoutExercise.delete({
     *   where: {
     *     // ... filter to delete one WorkoutExercise
     *   }
     * })
     * 
     */
    delete<T extends WorkoutExerciseDeleteArgs>(args: SelectSubset<T, WorkoutExerciseDeleteArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkoutExercise.
     * @param {WorkoutExerciseUpdateArgs} args - Arguments to update one WorkoutExercise.
     * @example
     * // Update one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutExerciseUpdateArgs>(args: SelectSubset<T, WorkoutExerciseUpdateArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkoutExercises.
     * @param {WorkoutExerciseDeleteManyArgs} args - Arguments to filter WorkoutExercises to delete.
     * @example
     * // Delete a few WorkoutExercises
     * const { count } = await prisma.workoutExercise.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutExerciseDeleteManyArgs>(args?: SelectSubset<T, WorkoutExerciseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutExerciseUpdateManyArgs>(args: SelectSubset<T, WorkoutExerciseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutExercises and returns the data updated in the database.
     * @param {WorkoutExerciseUpdateManyAndReturnArgs} args - Arguments to update many WorkoutExercises.
     * @example
     * // Update many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WorkoutExercises and only return the `id`
     * const workoutExerciseWithIdOnly = await prisma.workoutExercise.updateManyAndReturn({
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
    updateManyAndReturn<T extends WorkoutExerciseUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkoutExerciseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WorkoutExercise.
     * @param {WorkoutExerciseUpsertArgs} args - Arguments to update or create a WorkoutExercise.
     * @example
     * // Update or create a WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.upsert({
     *   create: {
     *     // ... data to create a WorkoutExercise
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutExercise we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutExerciseUpsertArgs>(args: SelectSubset<T, WorkoutExerciseUpsertArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkoutExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseCountArgs} args - Arguments to filter WorkoutExercises to count.
     * @example
     * // Count the number of WorkoutExercises
     * const count = await prisma.workoutExercise.count({
     *   where: {
     *     // ... the filter for the WorkoutExercises we want to count
     *   }
     * })
    **/
    count<T extends WorkoutExerciseCountArgs>(
      args?: Subset<T, WorkoutExerciseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutExerciseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutExerciseAggregateArgs>(args: Subset<T, WorkoutExerciseAggregateArgs>): Prisma.PrismaPromise<GetWorkoutExerciseAggregateType<T>>

    /**
     * Group by WorkoutExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseGroupByArgs} args - Group by arguments.
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
      T extends WorkoutExerciseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutExerciseGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutExerciseGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkoutExerciseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutExerciseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutExercise model
   */
  readonly fields: WorkoutExerciseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutExercise.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutExerciseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends WorkoutSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSessionDefaultArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WorkoutExercise model
   */
  interface WorkoutExerciseFieldRefs {
    readonly id: FieldRef<"WorkoutExercise", 'String'>
    readonly exerciseName: FieldRef<"WorkoutExercise", 'String'>
    readonly sets: FieldRef<"WorkoutExercise", 'Json'>
    readonly sessionId: FieldRef<"WorkoutExercise", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutExercise findUnique
   */
  export type WorkoutExerciseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise findUniqueOrThrow
   */
  export type WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise findFirst
   */
  export type WorkoutExerciseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutExercises.
     */
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise findFirstOrThrow
   */
  export type WorkoutExerciseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutExercises.
     */
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise findMany
   */
  export type WorkoutExerciseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercises to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutExercises.
     */
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise create
   */
  export type WorkoutExerciseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkoutExercise.
     */
    data: XOR<WorkoutExerciseCreateInput, WorkoutExerciseUncheckedCreateInput>
  }

  /**
   * WorkoutExercise createMany
   */
  export type WorkoutExerciseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutExercises.
     */
    data: WorkoutExerciseCreateManyInput | WorkoutExerciseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutExercise createManyAndReturn
   */
  export type WorkoutExerciseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * The data used to create many WorkoutExercises.
     */
    data: WorkoutExerciseCreateManyInput | WorkoutExerciseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutExercise update
   */
  export type WorkoutExerciseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkoutExercise.
     */
    data: XOR<WorkoutExerciseUpdateInput, WorkoutExerciseUncheckedUpdateInput>
    /**
     * Choose, which WorkoutExercise to update.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise updateMany
   */
  export type WorkoutExerciseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutExercises.
     */
    data: XOR<WorkoutExerciseUpdateManyMutationInput, WorkoutExerciseUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutExercises to update
     */
    where?: WorkoutExerciseWhereInput
    /**
     * Limit how many WorkoutExercises to update.
     */
    limit?: number
  }

  /**
   * WorkoutExercise updateManyAndReturn
   */
  export type WorkoutExerciseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * The data used to update WorkoutExercises.
     */
    data: XOR<WorkoutExerciseUpdateManyMutationInput, WorkoutExerciseUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutExercises to update
     */
    where?: WorkoutExerciseWhereInput
    /**
     * Limit how many WorkoutExercises to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutExercise upsert
   */
  export type WorkoutExerciseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkoutExercise to update in case it exists.
     */
    where: WorkoutExerciseWhereUniqueInput
    /**
     * In case the WorkoutExercise found by the `where` argument doesn't exist, create a new WorkoutExercise with this data.
     */
    create: XOR<WorkoutExerciseCreateInput, WorkoutExerciseUncheckedCreateInput>
    /**
     * In case the WorkoutExercise was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutExerciseUpdateInput, WorkoutExerciseUncheckedUpdateInput>
  }

  /**
   * WorkoutExercise delete
   */
  export type WorkoutExerciseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter which WorkoutExercise to delete.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise deleteMany
   */
  export type WorkoutExerciseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutExercises to delete
     */
    where?: WorkoutExerciseWhereInput
    /**
     * Limit how many WorkoutExercises to delete.
     */
    limit?: number
  }

  /**
   * WorkoutExercise without action
   */
  export type WorkoutExerciseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkoutExercise
     */
    omit?: WorkoutExerciseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
  }


  /**
   * Model NutritionGoal
   */

  export type AggregateNutritionGoal = {
    _count: NutritionGoalCountAggregateOutputType | null
    _avg: NutritionGoalAvgAggregateOutputType | null
    _sum: NutritionGoalSumAggregateOutputType | null
    _min: NutritionGoalMinAggregateOutputType | null
    _max: NutritionGoalMaxAggregateOutputType | null
  }

  export type NutritionGoalAvgAggregateOutputType = {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }

  export type NutritionGoalSumAggregateOutputType = {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }

  export type NutritionGoalMinAggregateOutputType = {
    id: string | null
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    updatedAt: Date | null
    userId: string | null
  }

  export type NutritionGoalMaxAggregateOutputType = {
    id: string | null
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    updatedAt: Date | null
    userId: string | null
  }

  export type NutritionGoalCountAggregateOutputType = {
    id: number
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type NutritionGoalAvgAggregateInputType = {
    calories?: true
    protein?: true
    carbs?: true
    fat?: true
  }

  export type NutritionGoalSumAggregateInputType = {
    calories?: true
    protein?: true
    carbs?: true
    fat?: true
  }

  export type NutritionGoalMinAggregateInputType = {
    id?: true
    calories?: true
    protein?: true
    carbs?: true
    fat?: true
    updatedAt?: true
    userId?: true
  }

  export type NutritionGoalMaxAggregateInputType = {
    id?: true
    calories?: true
    protein?: true
    carbs?: true
    fat?: true
    updatedAt?: true
    userId?: true
  }

  export type NutritionGoalCountAggregateInputType = {
    id?: true
    calories?: true
    protein?: true
    carbs?: true
    fat?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type NutritionGoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NutritionGoal to aggregate.
     */
    where?: NutritionGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionGoals to fetch.
     */
    orderBy?: NutritionGoalOrderByWithRelationInput | NutritionGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NutritionGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NutritionGoals
    **/
    _count?: true | NutritionGoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NutritionGoalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NutritionGoalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NutritionGoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NutritionGoalMaxAggregateInputType
  }

  export type GetNutritionGoalAggregateType<T extends NutritionGoalAggregateArgs> = {
        [P in keyof T & keyof AggregateNutritionGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNutritionGoal[P]>
      : GetScalarType<T[P], AggregateNutritionGoal[P]>
  }




  export type NutritionGoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NutritionGoalWhereInput
    orderBy?: NutritionGoalOrderByWithAggregationInput | NutritionGoalOrderByWithAggregationInput[]
    by: NutritionGoalScalarFieldEnum[] | NutritionGoalScalarFieldEnum
    having?: NutritionGoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NutritionGoalCountAggregateInputType | true
    _avg?: NutritionGoalAvgAggregateInputType
    _sum?: NutritionGoalSumAggregateInputType
    _min?: NutritionGoalMinAggregateInputType
    _max?: NutritionGoalMaxAggregateInputType
  }

  export type NutritionGoalGroupByOutputType = {
    id: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt: Date
    userId: string
    _count: NutritionGoalCountAggregateOutputType | null
    _avg: NutritionGoalAvgAggregateOutputType | null
    _sum: NutritionGoalSumAggregateOutputType | null
    _min: NutritionGoalMinAggregateOutputType | null
    _max: NutritionGoalMaxAggregateOutputType | null
  }

  type GetNutritionGoalGroupByPayload<T extends NutritionGoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NutritionGoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NutritionGoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NutritionGoalGroupByOutputType[P]>
            : GetScalarType<T[P], NutritionGoalGroupByOutputType[P]>
        }
      >
    >


  export type NutritionGoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    calories?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nutritionGoal"]>

  export type NutritionGoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    calories?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nutritionGoal"]>

  export type NutritionGoalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    calories?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nutritionGoal"]>

  export type NutritionGoalSelectScalar = {
    id?: boolean
    calories?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type NutritionGoalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "calories" | "protein" | "carbs" | "fat" | "updatedAt" | "userId", ExtArgs["result"]["nutritionGoal"]>
  export type NutritionGoalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NutritionGoalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NutritionGoalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $NutritionGoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NutritionGoal"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      calories: number
      protein: number
      carbs: number
      fat: number
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["nutritionGoal"]>
    composites: {}
  }

  type NutritionGoalGetPayload<S extends boolean | null | undefined | NutritionGoalDefaultArgs> = $Result.GetResult<Prisma.$NutritionGoalPayload, S>

  type NutritionGoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NutritionGoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NutritionGoalCountAggregateInputType | true
    }

  export interface NutritionGoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NutritionGoal'], meta: { name: 'NutritionGoal' } }
    /**
     * Find zero or one NutritionGoal that matches the filter.
     * @param {NutritionGoalFindUniqueArgs} args - Arguments to find a NutritionGoal
     * @example
     * // Get one NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NutritionGoalFindUniqueArgs>(args: SelectSubset<T, NutritionGoalFindUniqueArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NutritionGoal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NutritionGoalFindUniqueOrThrowArgs} args - Arguments to find a NutritionGoal
     * @example
     * // Get one NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NutritionGoalFindUniqueOrThrowArgs>(args: SelectSubset<T, NutritionGoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NutritionGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalFindFirstArgs} args - Arguments to find a NutritionGoal
     * @example
     * // Get one NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NutritionGoalFindFirstArgs>(args?: SelectSubset<T, NutritionGoalFindFirstArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NutritionGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalFindFirstOrThrowArgs} args - Arguments to find a NutritionGoal
     * @example
     * // Get one NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NutritionGoalFindFirstOrThrowArgs>(args?: SelectSubset<T, NutritionGoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NutritionGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NutritionGoals
     * const nutritionGoals = await prisma.nutritionGoal.findMany()
     * 
     * // Get first 10 NutritionGoals
     * const nutritionGoals = await prisma.nutritionGoal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nutritionGoalWithIdOnly = await prisma.nutritionGoal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NutritionGoalFindManyArgs>(args?: SelectSubset<T, NutritionGoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NutritionGoal.
     * @param {NutritionGoalCreateArgs} args - Arguments to create a NutritionGoal.
     * @example
     * // Create one NutritionGoal
     * const NutritionGoal = await prisma.nutritionGoal.create({
     *   data: {
     *     // ... data to create a NutritionGoal
     *   }
     * })
     * 
     */
    create<T extends NutritionGoalCreateArgs>(args: SelectSubset<T, NutritionGoalCreateArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NutritionGoals.
     * @param {NutritionGoalCreateManyArgs} args - Arguments to create many NutritionGoals.
     * @example
     * // Create many NutritionGoals
     * const nutritionGoal = await prisma.nutritionGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NutritionGoalCreateManyArgs>(args?: SelectSubset<T, NutritionGoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NutritionGoals and returns the data saved in the database.
     * @param {NutritionGoalCreateManyAndReturnArgs} args - Arguments to create many NutritionGoals.
     * @example
     * // Create many NutritionGoals
     * const nutritionGoal = await prisma.nutritionGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NutritionGoals and only return the `id`
     * const nutritionGoalWithIdOnly = await prisma.nutritionGoal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NutritionGoalCreateManyAndReturnArgs>(args?: SelectSubset<T, NutritionGoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NutritionGoal.
     * @param {NutritionGoalDeleteArgs} args - Arguments to delete one NutritionGoal.
     * @example
     * // Delete one NutritionGoal
     * const NutritionGoal = await prisma.nutritionGoal.delete({
     *   where: {
     *     // ... filter to delete one NutritionGoal
     *   }
     * })
     * 
     */
    delete<T extends NutritionGoalDeleteArgs>(args: SelectSubset<T, NutritionGoalDeleteArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NutritionGoal.
     * @param {NutritionGoalUpdateArgs} args - Arguments to update one NutritionGoal.
     * @example
     * // Update one NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NutritionGoalUpdateArgs>(args: SelectSubset<T, NutritionGoalUpdateArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NutritionGoals.
     * @param {NutritionGoalDeleteManyArgs} args - Arguments to filter NutritionGoals to delete.
     * @example
     * // Delete a few NutritionGoals
     * const { count } = await prisma.nutritionGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NutritionGoalDeleteManyArgs>(args?: SelectSubset<T, NutritionGoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NutritionGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NutritionGoals
     * const nutritionGoal = await prisma.nutritionGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NutritionGoalUpdateManyArgs>(args: SelectSubset<T, NutritionGoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NutritionGoals and returns the data updated in the database.
     * @param {NutritionGoalUpdateManyAndReturnArgs} args - Arguments to update many NutritionGoals.
     * @example
     * // Update many NutritionGoals
     * const nutritionGoal = await prisma.nutritionGoal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NutritionGoals and only return the `id`
     * const nutritionGoalWithIdOnly = await prisma.nutritionGoal.updateManyAndReturn({
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
    updateManyAndReturn<T extends NutritionGoalUpdateManyAndReturnArgs>(args: SelectSubset<T, NutritionGoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NutritionGoal.
     * @param {NutritionGoalUpsertArgs} args - Arguments to update or create a NutritionGoal.
     * @example
     * // Update or create a NutritionGoal
     * const nutritionGoal = await prisma.nutritionGoal.upsert({
     *   create: {
     *     // ... data to create a NutritionGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NutritionGoal we want to update
     *   }
     * })
     */
    upsert<T extends NutritionGoalUpsertArgs>(args: SelectSubset<T, NutritionGoalUpsertArgs<ExtArgs>>): Prisma__NutritionGoalClient<$Result.GetResult<Prisma.$NutritionGoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NutritionGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalCountArgs} args - Arguments to filter NutritionGoals to count.
     * @example
     * // Count the number of NutritionGoals
     * const count = await prisma.nutritionGoal.count({
     *   where: {
     *     // ... the filter for the NutritionGoals we want to count
     *   }
     * })
    **/
    count<T extends NutritionGoalCountArgs>(
      args?: Subset<T, NutritionGoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NutritionGoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NutritionGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NutritionGoalAggregateArgs>(args: Subset<T, NutritionGoalAggregateArgs>): Prisma.PrismaPromise<GetNutritionGoalAggregateType<T>>

    /**
     * Group by NutritionGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionGoalGroupByArgs} args - Group by arguments.
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
      T extends NutritionGoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NutritionGoalGroupByArgs['orderBy'] }
        : { orderBy?: NutritionGoalGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NutritionGoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNutritionGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NutritionGoal model
   */
  readonly fields: NutritionGoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NutritionGoal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NutritionGoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NutritionGoal model
   */
  interface NutritionGoalFieldRefs {
    readonly id: FieldRef<"NutritionGoal", 'String'>
    readonly calories: FieldRef<"NutritionGoal", 'Int'>
    readonly protein: FieldRef<"NutritionGoal", 'Int'>
    readonly carbs: FieldRef<"NutritionGoal", 'Int'>
    readonly fat: FieldRef<"NutritionGoal", 'Int'>
    readonly updatedAt: FieldRef<"NutritionGoal", 'DateTime'>
    readonly userId: FieldRef<"NutritionGoal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * NutritionGoal findUnique
   */
  export type NutritionGoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter, which NutritionGoal to fetch.
     */
    where: NutritionGoalWhereUniqueInput
  }

  /**
   * NutritionGoal findUniqueOrThrow
   */
  export type NutritionGoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter, which NutritionGoal to fetch.
     */
    where: NutritionGoalWhereUniqueInput
  }

  /**
   * NutritionGoal findFirst
   */
  export type NutritionGoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter, which NutritionGoal to fetch.
     */
    where?: NutritionGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionGoals to fetch.
     */
    orderBy?: NutritionGoalOrderByWithRelationInput | NutritionGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NutritionGoals.
     */
    cursor?: NutritionGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NutritionGoals.
     */
    distinct?: NutritionGoalScalarFieldEnum | NutritionGoalScalarFieldEnum[]
  }

  /**
   * NutritionGoal findFirstOrThrow
   */
  export type NutritionGoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter, which NutritionGoal to fetch.
     */
    where?: NutritionGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionGoals to fetch.
     */
    orderBy?: NutritionGoalOrderByWithRelationInput | NutritionGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NutritionGoals.
     */
    cursor?: NutritionGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NutritionGoals.
     */
    distinct?: NutritionGoalScalarFieldEnum | NutritionGoalScalarFieldEnum[]
  }

  /**
   * NutritionGoal findMany
   */
  export type NutritionGoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter, which NutritionGoals to fetch.
     */
    where?: NutritionGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionGoals to fetch.
     */
    orderBy?: NutritionGoalOrderByWithRelationInput | NutritionGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NutritionGoals.
     */
    cursor?: NutritionGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NutritionGoals.
     */
    distinct?: NutritionGoalScalarFieldEnum | NutritionGoalScalarFieldEnum[]
  }

  /**
   * NutritionGoal create
   */
  export type NutritionGoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * The data needed to create a NutritionGoal.
     */
    data: XOR<NutritionGoalCreateInput, NutritionGoalUncheckedCreateInput>
  }

  /**
   * NutritionGoal createMany
   */
  export type NutritionGoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NutritionGoals.
     */
    data: NutritionGoalCreateManyInput | NutritionGoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NutritionGoal createManyAndReturn
   */
  export type NutritionGoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * The data used to create many NutritionGoals.
     */
    data: NutritionGoalCreateManyInput | NutritionGoalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * NutritionGoal update
   */
  export type NutritionGoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * The data needed to update a NutritionGoal.
     */
    data: XOR<NutritionGoalUpdateInput, NutritionGoalUncheckedUpdateInput>
    /**
     * Choose, which NutritionGoal to update.
     */
    where: NutritionGoalWhereUniqueInput
  }

  /**
   * NutritionGoal updateMany
   */
  export type NutritionGoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NutritionGoals.
     */
    data: XOR<NutritionGoalUpdateManyMutationInput, NutritionGoalUncheckedUpdateManyInput>
    /**
     * Filter which NutritionGoals to update
     */
    where?: NutritionGoalWhereInput
    /**
     * Limit how many NutritionGoals to update.
     */
    limit?: number
  }

  /**
   * NutritionGoal updateManyAndReturn
   */
  export type NutritionGoalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * The data used to update NutritionGoals.
     */
    data: XOR<NutritionGoalUpdateManyMutationInput, NutritionGoalUncheckedUpdateManyInput>
    /**
     * Filter which NutritionGoals to update
     */
    where?: NutritionGoalWhereInput
    /**
     * Limit how many NutritionGoals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * NutritionGoal upsert
   */
  export type NutritionGoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * The filter to search for the NutritionGoal to update in case it exists.
     */
    where: NutritionGoalWhereUniqueInput
    /**
     * In case the NutritionGoal found by the `where` argument doesn't exist, create a new NutritionGoal with this data.
     */
    create: XOR<NutritionGoalCreateInput, NutritionGoalUncheckedCreateInput>
    /**
     * In case the NutritionGoal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NutritionGoalUpdateInput, NutritionGoalUncheckedUpdateInput>
  }

  /**
   * NutritionGoal delete
   */
  export type NutritionGoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
    /**
     * Filter which NutritionGoal to delete.
     */
    where: NutritionGoalWhereUniqueInput
  }

  /**
   * NutritionGoal deleteMany
   */
  export type NutritionGoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NutritionGoals to delete
     */
    where?: NutritionGoalWhereInput
    /**
     * Limit how many NutritionGoals to delete.
     */
    limit?: number
  }

  /**
   * NutritionGoal without action
   */
  export type NutritionGoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionGoal
     */
    select?: NutritionGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionGoal
     */
    omit?: NutritionGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NutritionGoalInclude<ExtArgs> | null
  }


  /**
   * Model MealLog
   */

  export type AggregateMealLog = {
    _count: MealLogCountAggregateOutputType | null
    _avg: MealLogAvgAggregateOutputType | null
    _sum: MealLogSumAggregateOutputType | null
    _min: MealLogMinAggregateOutputType | null
    _max: MealLogMaxAggregateOutputType | null
  }

  export type MealLogAvgAggregateOutputType = {
    cal: number | null
    protein: Decimal | null
    carbs: Decimal | null
    fat: Decimal | null
  }

  export type MealLogSumAggregateOutputType = {
    cal: number | null
    protein: Decimal | null
    carbs: Decimal | null
    fat: Decimal | null
  }

  export type MealLogMinAggregateOutputType = {
    id: string | null
    logDate: Date | null
    meal: $Enums.Meal | null
    name: string | null
    cal: number | null
    protein: Decimal | null
    carbs: Decimal | null
    fat: Decimal | null
    userId: string | null
  }

  export type MealLogMaxAggregateOutputType = {
    id: string | null
    logDate: Date | null
    meal: $Enums.Meal | null
    name: string | null
    cal: number | null
    protein: Decimal | null
    carbs: Decimal | null
    fat: Decimal | null
    userId: string | null
  }

  export type MealLogCountAggregateOutputType = {
    id: number
    logDate: number
    meal: number
    name: number
    cal: number
    protein: number
    carbs: number
    fat: number
    userId: number
    _all: number
  }


  export type MealLogAvgAggregateInputType = {
    cal?: true
    protein?: true
    carbs?: true
    fat?: true
  }

  export type MealLogSumAggregateInputType = {
    cal?: true
    protein?: true
    carbs?: true
    fat?: true
  }

  export type MealLogMinAggregateInputType = {
    id?: true
    logDate?: true
    meal?: true
    name?: true
    cal?: true
    protein?: true
    carbs?: true
    fat?: true
    userId?: true
  }

  export type MealLogMaxAggregateInputType = {
    id?: true
    logDate?: true
    meal?: true
    name?: true
    cal?: true
    protein?: true
    carbs?: true
    fat?: true
    userId?: true
  }

  export type MealLogCountAggregateInputType = {
    id?: true
    logDate?: true
    meal?: true
    name?: true
    cal?: true
    protein?: true
    carbs?: true
    fat?: true
    userId?: true
    _all?: true
  }

  export type MealLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MealLog to aggregate.
     */
    where?: MealLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: MealLogOrderByWithRelationInput | MealLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MealLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MealLogs
    **/
    _count?: true | MealLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MealLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MealLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MealLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MealLogMaxAggregateInputType
  }

  export type GetMealLogAggregateType<T extends MealLogAggregateArgs> = {
        [P in keyof T & keyof AggregateMealLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMealLog[P]>
      : GetScalarType<T[P], AggregateMealLog[P]>
  }




  export type MealLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MealLogWhereInput
    orderBy?: MealLogOrderByWithAggregationInput | MealLogOrderByWithAggregationInput[]
    by: MealLogScalarFieldEnum[] | MealLogScalarFieldEnum
    having?: MealLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MealLogCountAggregateInputType | true
    _avg?: MealLogAvgAggregateInputType
    _sum?: MealLogSumAggregateInputType
    _min?: MealLogMinAggregateInputType
    _max?: MealLogMaxAggregateInputType
  }

  export type MealLogGroupByOutputType = {
    id: string
    logDate: Date
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal
    carbs: Decimal
    fat: Decimal
    userId: string
    _count: MealLogCountAggregateOutputType | null
    _avg: MealLogAvgAggregateOutputType | null
    _sum: MealLogSumAggregateOutputType | null
    _min: MealLogMinAggregateOutputType | null
    _max: MealLogMaxAggregateOutputType | null
  }

  type GetMealLogGroupByPayload<T extends MealLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MealLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MealLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MealLogGroupByOutputType[P]>
            : GetScalarType<T[P], MealLogGroupByOutputType[P]>
        }
      >
    >


  export type MealLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    meal?: boolean
    name?: boolean
    cal?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealLog"]>

  export type MealLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    meal?: boolean
    name?: boolean
    cal?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealLog"]>

  export type MealLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    meal?: boolean
    name?: boolean
    cal?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealLog"]>

  export type MealLogSelectScalar = {
    id?: boolean
    logDate?: boolean
    meal?: boolean
    name?: boolean
    cal?: boolean
    protein?: boolean
    carbs?: boolean
    fat?: boolean
    userId?: boolean
  }

  export type MealLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "logDate" | "meal" | "name" | "cal" | "protein" | "carbs" | "fat" | "userId", ExtArgs["result"]["mealLog"]>
  export type MealLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MealLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MealLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MealLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MealLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      logDate: Date
      meal: $Enums.Meal
      name: string
      cal: number
      protein: Prisma.Decimal
      carbs: Prisma.Decimal
      fat: Prisma.Decimal
      userId: string
    }, ExtArgs["result"]["mealLog"]>
    composites: {}
  }

  type MealLogGetPayload<S extends boolean | null | undefined | MealLogDefaultArgs> = $Result.GetResult<Prisma.$MealLogPayload, S>

  type MealLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MealLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MealLogCountAggregateInputType | true
    }

  export interface MealLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MealLog'], meta: { name: 'MealLog' } }
    /**
     * Find zero or one MealLog that matches the filter.
     * @param {MealLogFindUniqueArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MealLogFindUniqueArgs>(args: SelectSubset<T, MealLogFindUniqueArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MealLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MealLogFindUniqueOrThrowArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MealLogFindUniqueOrThrowArgs>(args: SelectSubset<T, MealLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MealLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindFirstArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MealLogFindFirstArgs>(args?: SelectSubset<T, MealLogFindFirstArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MealLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindFirstOrThrowArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MealLogFindFirstOrThrowArgs>(args?: SelectSubset<T, MealLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MealLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MealLogs
     * const mealLogs = await prisma.mealLog.findMany()
     * 
     * // Get first 10 MealLogs
     * const mealLogs = await prisma.mealLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MealLogFindManyArgs>(args?: SelectSubset<T, MealLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MealLog.
     * @param {MealLogCreateArgs} args - Arguments to create a MealLog.
     * @example
     * // Create one MealLog
     * const MealLog = await prisma.mealLog.create({
     *   data: {
     *     // ... data to create a MealLog
     *   }
     * })
     * 
     */
    create<T extends MealLogCreateArgs>(args: SelectSubset<T, MealLogCreateArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MealLogs.
     * @param {MealLogCreateManyArgs} args - Arguments to create many MealLogs.
     * @example
     * // Create many MealLogs
     * const mealLog = await prisma.mealLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MealLogCreateManyArgs>(args?: SelectSubset<T, MealLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MealLogs and returns the data saved in the database.
     * @param {MealLogCreateManyAndReturnArgs} args - Arguments to create many MealLogs.
     * @example
     * // Create many MealLogs
     * const mealLog = await prisma.mealLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MealLogs and only return the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MealLogCreateManyAndReturnArgs>(args?: SelectSubset<T, MealLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MealLog.
     * @param {MealLogDeleteArgs} args - Arguments to delete one MealLog.
     * @example
     * // Delete one MealLog
     * const MealLog = await prisma.mealLog.delete({
     *   where: {
     *     // ... filter to delete one MealLog
     *   }
     * })
     * 
     */
    delete<T extends MealLogDeleteArgs>(args: SelectSubset<T, MealLogDeleteArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MealLog.
     * @param {MealLogUpdateArgs} args - Arguments to update one MealLog.
     * @example
     * // Update one MealLog
     * const mealLog = await prisma.mealLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MealLogUpdateArgs>(args: SelectSubset<T, MealLogUpdateArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MealLogs.
     * @param {MealLogDeleteManyArgs} args - Arguments to filter MealLogs to delete.
     * @example
     * // Delete a few MealLogs
     * const { count } = await prisma.mealLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MealLogDeleteManyArgs>(args?: SelectSubset<T, MealLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MealLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MealLogs
     * const mealLog = await prisma.mealLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MealLogUpdateManyArgs>(args: SelectSubset<T, MealLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MealLogs and returns the data updated in the database.
     * @param {MealLogUpdateManyAndReturnArgs} args - Arguments to update many MealLogs.
     * @example
     * // Update many MealLogs
     * const mealLog = await prisma.mealLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MealLogs and only return the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.updateManyAndReturn({
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
    updateManyAndReturn<T extends MealLogUpdateManyAndReturnArgs>(args: SelectSubset<T, MealLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MealLog.
     * @param {MealLogUpsertArgs} args - Arguments to update or create a MealLog.
     * @example
     * // Update or create a MealLog
     * const mealLog = await prisma.mealLog.upsert({
     *   create: {
     *     // ... data to create a MealLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MealLog we want to update
     *   }
     * })
     */
    upsert<T extends MealLogUpsertArgs>(args: SelectSubset<T, MealLogUpsertArgs<ExtArgs>>): Prisma__MealLogClient<$Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MealLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogCountArgs} args - Arguments to filter MealLogs to count.
     * @example
     * // Count the number of MealLogs
     * const count = await prisma.mealLog.count({
     *   where: {
     *     // ... the filter for the MealLogs we want to count
     *   }
     * })
    **/
    count<T extends MealLogCountArgs>(
      args?: Subset<T, MealLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MealLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MealLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MealLogAggregateArgs>(args: Subset<T, MealLogAggregateArgs>): Prisma.PrismaPromise<GetMealLogAggregateType<T>>

    /**
     * Group by MealLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogGroupByArgs} args - Group by arguments.
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
      T extends MealLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MealLogGroupByArgs['orderBy'] }
        : { orderBy?: MealLogGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MealLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMealLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MealLog model
   */
  readonly fields: MealLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MealLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MealLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MealLog model
   */
  interface MealLogFieldRefs {
    readonly id: FieldRef<"MealLog", 'String'>
    readonly logDate: FieldRef<"MealLog", 'DateTime'>
    readonly meal: FieldRef<"MealLog", 'Meal'>
    readonly name: FieldRef<"MealLog", 'String'>
    readonly cal: FieldRef<"MealLog", 'Int'>
    readonly protein: FieldRef<"MealLog", 'Decimal'>
    readonly carbs: FieldRef<"MealLog", 'Decimal'>
    readonly fat: FieldRef<"MealLog", 'Decimal'>
    readonly userId: FieldRef<"MealLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MealLog findUnique
   */
  export type MealLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter, which MealLog to fetch.
     */
    where: MealLogWhereUniqueInput
  }

  /**
   * MealLog findUniqueOrThrow
   */
  export type MealLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter, which MealLog to fetch.
     */
    where: MealLogWhereUniqueInput
  }

  /**
   * MealLog findFirst
   */
  export type MealLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter, which MealLog to fetch.
     */
    where?: MealLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: MealLogOrderByWithRelationInput | MealLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MealLogs.
     */
    cursor?: MealLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MealLogs.
     */
    distinct?: MealLogScalarFieldEnum | MealLogScalarFieldEnum[]
  }

  /**
   * MealLog findFirstOrThrow
   */
  export type MealLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter, which MealLog to fetch.
     */
    where?: MealLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: MealLogOrderByWithRelationInput | MealLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MealLogs.
     */
    cursor?: MealLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MealLogs.
     */
    distinct?: MealLogScalarFieldEnum | MealLogScalarFieldEnum[]
  }

  /**
   * MealLog findMany
   */
  export type MealLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter, which MealLogs to fetch.
     */
    where?: MealLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: MealLogOrderByWithRelationInput | MealLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MealLogs.
     */
    cursor?: MealLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MealLogs.
     */
    distinct?: MealLogScalarFieldEnum | MealLogScalarFieldEnum[]
  }

  /**
   * MealLog create
   */
  export type MealLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * The data needed to create a MealLog.
     */
    data: XOR<MealLogCreateInput, MealLogUncheckedCreateInput>
  }

  /**
   * MealLog createMany
   */
  export type MealLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MealLogs.
     */
    data: MealLogCreateManyInput | MealLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MealLog createManyAndReturn
   */
  export type MealLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * The data used to create many MealLogs.
     */
    data: MealLogCreateManyInput | MealLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MealLog update
   */
  export type MealLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * The data needed to update a MealLog.
     */
    data: XOR<MealLogUpdateInput, MealLogUncheckedUpdateInput>
    /**
     * Choose, which MealLog to update.
     */
    where: MealLogWhereUniqueInput
  }

  /**
   * MealLog updateMany
   */
  export type MealLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MealLogs.
     */
    data: XOR<MealLogUpdateManyMutationInput, MealLogUncheckedUpdateManyInput>
    /**
     * Filter which MealLogs to update
     */
    where?: MealLogWhereInput
    /**
     * Limit how many MealLogs to update.
     */
    limit?: number
  }

  /**
   * MealLog updateManyAndReturn
   */
  export type MealLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * The data used to update MealLogs.
     */
    data: XOR<MealLogUpdateManyMutationInput, MealLogUncheckedUpdateManyInput>
    /**
     * Filter which MealLogs to update
     */
    where?: MealLogWhereInput
    /**
     * Limit how many MealLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MealLog upsert
   */
  export type MealLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * The filter to search for the MealLog to update in case it exists.
     */
    where: MealLogWhereUniqueInput
    /**
     * In case the MealLog found by the `where` argument doesn't exist, create a new MealLog with this data.
     */
    create: XOR<MealLogCreateInput, MealLogUncheckedCreateInput>
    /**
     * In case the MealLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MealLogUpdateInput, MealLogUncheckedUpdateInput>
  }

  /**
   * MealLog delete
   */
  export type MealLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
    /**
     * Filter which MealLog to delete.
     */
    where: MealLogWhereUniqueInput
  }

  /**
   * MealLog deleteMany
   */
  export type MealLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MealLogs to delete
     */
    where?: MealLogWhereInput
    /**
     * Limit how many MealLogs to delete.
     */
    limit?: number
  }

  /**
   * MealLog without action
   */
  export type MealLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: MealLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealLog
     */
    omit?: MealLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealLogInclude<ExtArgs> | null
  }


  /**
   * Model WeightLog
   */

  export type AggregateWeightLog = {
    _count: WeightLogCountAggregateOutputType | null
    _avg: WeightLogAvgAggregateOutputType | null
    _sum: WeightLogSumAggregateOutputType | null
    _min: WeightLogMinAggregateOutputType | null
    _max: WeightLogMaxAggregateOutputType | null
  }

  export type WeightLogAvgAggregateOutputType = {
    weight: Decimal | null
  }

  export type WeightLogSumAggregateOutputType = {
    weight: Decimal | null
  }

  export type WeightLogMinAggregateOutputType = {
    id: string | null
    logDate: Date | null
    weight: Decimal | null
    userId: string | null
  }

  export type WeightLogMaxAggregateOutputType = {
    id: string | null
    logDate: Date | null
    weight: Decimal | null
    userId: string | null
  }

  export type WeightLogCountAggregateOutputType = {
    id: number
    logDate: number
    weight: number
    userId: number
    _all: number
  }


  export type WeightLogAvgAggregateInputType = {
    weight?: true
  }

  export type WeightLogSumAggregateInputType = {
    weight?: true
  }

  export type WeightLogMinAggregateInputType = {
    id?: true
    logDate?: true
    weight?: true
    userId?: true
  }

  export type WeightLogMaxAggregateInputType = {
    id?: true
    logDate?: true
    weight?: true
    userId?: true
  }

  export type WeightLogCountAggregateInputType = {
    id?: true
    logDate?: true
    weight?: true
    userId?: true
    _all?: true
  }

  export type WeightLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightLog to aggregate.
     */
    where?: WeightLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightLogs to fetch.
     */
    orderBy?: WeightLogOrderByWithRelationInput | WeightLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeightLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeightLogs
    **/
    _count?: true | WeightLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeightLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeightLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeightLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeightLogMaxAggregateInputType
  }

  export type GetWeightLogAggregateType<T extends WeightLogAggregateArgs> = {
        [P in keyof T & keyof AggregateWeightLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeightLog[P]>
      : GetScalarType<T[P], AggregateWeightLog[P]>
  }




  export type WeightLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightLogWhereInput
    orderBy?: WeightLogOrderByWithAggregationInput | WeightLogOrderByWithAggregationInput[]
    by: WeightLogScalarFieldEnum[] | WeightLogScalarFieldEnum
    having?: WeightLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeightLogCountAggregateInputType | true
    _avg?: WeightLogAvgAggregateInputType
    _sum?: WeightLogSumAggregateInputType
    _min?: WeightLogMinAggregateInputType
    _max?: WeightLogMaxAggregateInputType
  }

  export type WeightLogGroupByOutputType = {
    id: string
    logDate: Date
    weight: Decimal
    userId: string
    _count: WeightLogCountAggregateOutputType | null
    _avg: WeightLogAvgAggregateOutputType | null
    _sum: WeightLogSumAggregateOutputType | null
    _min: WeightLogMinAggregateOutputType | null
    _max: WeightLogMaxAggregateOutputType | null
  }

  type GetWeightLogGroupByPayload<T extends WeightLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeightLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeightLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeightLogGroupByOutputType[P]>
            : GetScalarType<T[P], WeightLogGroupByOutputType[P]>
        }
      >
    >


  export type WeightLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    weight?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightLog"]>

  export type WeightLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    weight?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightLog"]>

  export type WeightLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    logDate?: boolean
    weight?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightLog"]>

  export type WeightLogSelectScalar = {
    id?: boolean
    logDate?: boolean
    weight?: boolean
    userId?: boolean
  }

  export type WeightLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "logDate" | "weight" | "userId", ExtArgs["result"]["weightLog"]>
  export type WeightLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WeightLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WeightLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WeightLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeightLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      logDate: Date
      weight: Prisma.Decimal
      userId: string
    }, ExtArgs["result"]["weightLog"]>
    composites: {}
  }

  type WeightLogGetPayload<S extends boolean | null | undefined | WeightLogDefaultArgs> = $Result.GetResult<Prisma.$WeightLogPayload, S>

  type WeightLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeightLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeightLogCountAggregateInputType | true
    }

  export interface WeightLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeightLog'], meta: { name: 'WeightLog' } }
    /**
     * Find zero or one WeightLog that matches the filter.
     * @param {WeightLogFindUniqueArgs} args - Arguments to find a WeightLog
     * @example
     * // Get one WeightLog
     * const weightLog = await prisma.weightLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeightLogFindUniqueArgs>(args: SelectSubset<T, WeightLogFindUniqueArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeightLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeightLogFindUniqueOrThrowArgs} args - Arguments to find a WeightLog
     * @example
     * // Get one WeightLog
     * const weightLog = await prisma.weightLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeightLogFindUniqueOrThrowArgs>(args: SelectSubset<T, WeightLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogFindFirstArgs} args - Arguments to find a WeightLog
     * @example
     * // Get one WeightLog
     * const weightLog = await prisma.weightLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeightLogFindFirstArgs>(args?: SelectSubset<T, WeightLogFindFirstArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogFindFirstOrThrowArgs} args - Arguments to find a WeightLog
     * @example
     * // Get one WeightLog
     * const weightLog = await prisma.weightLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeightLogFindFirstOrThrowArgs>(args?: SelectSubset<T, WeightLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeightLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeightLogs
     * const weightLogs = await prisma.weightLog.findMany()
     * 
     * // Get first 10 WeightLogs
     * const weightLogs = await prisma.weightLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weightLogWithIdOnly = await prisma.weightLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeightLogFindManyArgs>(args?: SelectSubset<T, WeightLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeightLog.
     * @param {WeightLogCreateArgs} args - Arguments to create a WeightLog.
     * @example
     * // Create one WeightLog
     * const WeightLog = await prisma.weightLog.create({
     *   data: {
     *     // ... data to create a WeightLog
     *   }
     * })
     * 
     */
    create<T extends WeightLogCreateArgs>(args: SelectSubset<T, WeightLogCreateArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeightLogs.
     * @param {WeightLogCreateManyArgs} args - Arguments to create many WeightLogs.
     * @example
     * // Create many WeightLogs
     * const weightLog = await prisma.weightLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeightLogCreateManyArgs>(args?: SelectSubset<T, WeightLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeightLogs and returns the data saved in the database.
     * @param {WeightLogCreateManyAndReturnArgs} args - Arguments to create many WeightLogs.
     * @example
     * // Create many WeightLogs
     * const weightLog = await prisma.weightLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeightLogs and only return the `id`
     * const weightLogWithIdOnly = await prisma.weightLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeightLogCreateManyAndReturnArgs>(args?: SelectSubset<T, WeightLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WeightLog.
     * @param {WeightLogDeleteArgs} args - Arguments to delete one WeightLog.
     * @example
     * // Delete one WeightLog
     * const WeightLog = await prisma.weightLog.delete({
     *   where: {
     *     // ... filter to delete one WeightLog
     *   }
     * })
     * 
     */
    delete<T extends WeightLogDeleteArgs>(args: SelectSubset<T, WeightLogDeleteArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeightLog.
     * @param {WeightLogUpdateArgs} args - Arguments to update one WeightLog.
     * @example
     * // Update one WeightLog
     * const weightLog = await prisma.weightLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeightLogUpdateArgs>(args: SelectSubset<T, WeightLogUpdateArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeightLogs.
     * @param {WeightLogDeleteManyArgs} args - Arguments to filter WeightLogs to delete.
     * @example
     * // Delete a few WeightLogs
     * const { count } = await prisma.weightLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeightLogDeleteManyArgs>(args?: SelectSubset<T, WeightLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeightLogs
     * const weightLog = await prisma.weightLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeightLogUpdateManyArgs>(args: SelectSubset<T, WeightLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightLogs and returns the data updated in the database.
     * @param {WeightLogUpdateManyAndReturnArgs} args - Arguments to update many WeightLogs.
     * @example
     * // Update many WeightLogs
     * const weightLog = await prisma.weightLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WeightLogs and only return the `id`
     * const weightLogWithIdOnly = await prisma.weightLog.updateManyAndReturn({
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
    updateManyAndReturn<T extends WeightLogUpdateManyAndReturnArgs>(args: SelectSubset<T, WeightLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WeightLog.
     * @param {WeightLogUpsertArgs} args - Arguments to update or create a WeightLog.
     * @example
     * // Update or create a WeightLog
     * const weightLog = await prisma.weightLog.upsert({
     *   create: {
     *     // ... data to create a WeightLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeightLog we want to update
     *   }
     * })
     */
    upsert<T extends WeightLogUpsertArgs>(args: SelectSubset<T, WeightLogUpsertArgs<ExtArgs>>): Prisma__WeightLogClient<$Result.GetResult<Prisma.$WeightLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeightLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogCountArgs} args - Arguments to filter WeightLogs to count.
     * @example
     * // Count the number of WeightLogs
     * const count = await prisma.weightLog.count({
     *   where: {
     *     // ... the filter for the WeightLogs we want to count
     *   }
     * })
    **/
    count<T extends WeightLogCountArgs>(
      args?: Subset<T, WeightLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeightLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeightLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WeightLogAggregateArgs>(args: Subset<T, WeightLogAggregateArgs>): Prisma.PrismaPromise<GetWeightLogAggregateType<T>>

    /**
     * Group by WeightLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightLogGroupByArgs} args - Group by arguments.
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
      T extends WeightLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeightLogGroupByArgs['orderBy'] }
        : { orderBy?: WeightLogGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeightLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeightLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeightLog model
   */
  readonly fields: WeightLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeightLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeightLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeightLog model
   */
  interface WeightLogFieldRefs {
    readonly id: FieldRef<"WeightLog", 'String'>
    readonly logDate: FieldRef<"WeightLog", 'DateTime'>
    readonly weight: FieldRef<"WeightLog", 'Decimal'>
    readonly userId: FieldRef<"WeightLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WeightLog findUnique
   */
  export type WeightLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter, which WeightLog to fetch.
     */
    where: WeightLogWhereUniqueInput
  }

  /**
   * WeightLog findUniqueOrThrow
   */
  export type WeightLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter, which WeightLog to fetch.
     */
    where: WeightLogWhereUniqueInput
  }

  /**
   * WeightLog findFirst
   */
  export type WeightLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter, which WeightLog to fetch.
     */
    where?: WeightLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightLogs to fetch.
     */
    orderBy?: WeightLogOrderByWithRelationInput | WeightLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightLogs.
     */
    cursor?: WeightLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightLogs.
     */
    distinct?: WeightLogScalarFieldEnum | WeightLogScalarFieldEnum[]
  }

  /**
   * WeightLog findFirstOrThrow
   */
  export type WeightLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter, which WeightLog to fetch.
     */
    where?: WeightLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightLogs to fetch.
     */
    orderBy?: WeightLogOrderByWithRelationInput | WeightLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightLogs.
     */
    cursor?: WeightLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightLogs.
     */
    distinct?: WeightLogScalarFieldEnum | WeightLogScalarFieldEnum[]
  }

  /**
   * WeightLog findMany
   */
  export type WeightLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter, which WeightLogs to fetch.
     */
    where?: WeightLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightLogs to fetch.
     */
    orderBy?: WeightLogOrderByWithRelationInput | WeightLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeightLogs.
     */
    cursor?: WeightLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightLogs.
     */
    distinct?: WeightLogScalarFieldEnum | WeightLogScalarFieldEnum[]
  }

  /**
   * WeightLog create
   */
  export type WeightLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * The data needed to create a WeightLog.
     */
    data: XOR<WeightLogCreateInput, WeightLogUncheckedCreateInput>
  }

  /**
   * WeightLog createMany
   */
  export type WeightLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeightLogs.
     */
    data: WeightLogCreateManyInput | WeightLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightLog createManyAndReturn
   */
  export type WeightLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * The data used to create many WeightLogs.
     */
    data: WeightLogCreateManyInput | WeightLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WeightLog update
   */
  export type WeightLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * The data needed to update a WeightLog.
     */
    data: XOR<WeightLogUpdateInput, WeightLogUncheckedUpdateInput>
    /**
     * Choose, which WeightLog to update.
     */
    where: WeightLogWhereUniqueInput
  }

  /**
   * WeightLog updateMany
   */
  export type WeightLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeightLogs.
     */
    data: XOR<WeightLogUpdateManyMutationInput, WeightLogUncheckedUpdateManyInput>
    /**
     * Filter which WeightLogs to update
     */
    where?: WeightLogWhereInput
    /**
     * Limit how many WeightLogs to update.
     */
    limit?: number
  }

  /**
   * WeightLog updateManyAndReturn
   */
  export type WeightLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * The data used to update WeightLogs.
     */
    data: XOR<WeightLogUpdateManyMutationInput, WeightLogUncheckedUpdateManyInput>
    /**
     * Filter which WeightLogs to update
     */
    where?: WeightLogWhereInput
    /**
     * Limit how many WeightLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WeightLog upsert
   */
  export type WeightLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * The filter to search for the WeightLog to update in case it exists.
     */
    where: WeightLogWhereUniqueInput
    /**
     * In case the WeightLog found by the `where` argument doesn't exist, create a new WeightLog with this data.
     */
    create: XOR<WeightLogCreateInput, WeightLogUncheckedCreateInput>
    /**
     * In case the WeightLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeightLogUpdateInput, WeightLogUncheckedUpdateInput>
  }

  /**
   * WeightLog delete
   */
  export type WeightLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
    /**
     * Filter which WeightLog to delete.
     */
    where: WeightLogWhereUniqueInput
  }

  /**
   * WeightLog deleteMany
   */
  export type WeightLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightLogs to delete
     */
    where?: WeightLogWhereInput
    /**
     * Limit how many WeightLogs to delete.
     */
    limit?: number
  }

  /**
   * WeightLog without action
   */
  export type WeightLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightLog
     */
    select?: WeightLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightLog
     */
    omit?: WeightLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightLogInclude<ExtArgs> | null
  }


  /**
   * Model WeightGoal
   */

  export type AggregateWeightGoal = {
    _count: WeightGoalCountAggregateOutputType | null
    _avg: WeightGoalAvgAggregateOutputType | null
    _sum: WeightGoalSumAggregateOutputType | null
    _min: WeightGoalMinAggregateOutputType | null
    _max: WeightGoalMaxAggregateOutputType | null
  }

  export type WeightGoalAvgAggregateOutputType = {
    goalWeight: Decimal | null
    startWeight: Decimal | null
  }

  export type WeightGoalSumAggregateOutputType = {
    goalWeight: Decimal | null
    startWeight: Decimal | null
  }

  export type WeightGoalMinAggregateOutputType = {
    id: string | null
    goalWeight: Decimal | null
    startWeight: Decimal | null
    updatedAt: Date | null
    userId: string | null
  }

  export type WeightGoalMaxAggregateOutputType = {
    id: string | null
    goalWeight: Decimal | null
    startWeight: Decimal | null
    updatedAt: Date | null
    userId: string | null
  }

  export type WeightGoalCountAggregateOutputType = {
    id: number
    goalWeight: number
    startWeight: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type WeightGoalAvgAggregateInputType = {
    goalWeight?: true
    startWeight?: true
  }

  export type WeightGoalSumAggregateInputType = {
    goalWeight?: true
    startWeight?: true
  }

  export type WeightGoalMinAggregateInputType = {
    id?: true
    goalWeight?: true
    startWeight?: true
    updatedAt?: true
    userId?: true
  }

  export type WeightGoalMaxAggregateInputType = {
    id?: true
    goalWeight?: true
    startWeight?: true
    updatedAt?: true
    userId?: true
  }

  export type WeightGoalCountAggregateInputType = {
    id?: true
    goalWeight?: true
    startWeight?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type WeightGoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightGoal to aggregate.
     */
    where?: WeightGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightGoals to fetch.
     */
    orderBy?: WeightGoalOrderByWithRelationInput | WeightGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeightGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeightGoals
    **/
    _count?: true | WeightGoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeightGoalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeightGoalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeightGoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeightGoalMaxAggregateInputType
  }

  export type GetWeightGoalAggregateType<T extends WeightGoalAggregateArgs> = {
        [P in keyof T & keyof AggregateWeightGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeightGoal[P]>
      : GetScalarType<T[P], AggregateWeightGoal[P]>
  }




  export type WeightGoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightGoalWhereInput
    orderBy?: WeightGoalOrderByWithAggregationInput | WeightGoalOrderByWithAggregationInput[]
    by: WeightGoalScalarFieldEnum[] | WeightGoalScalarFieldEnum
    having?: WeightGoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeightGoalCountAggregateInputType | true
    _avg?: WeightGoalAvgAggregateInputType
    _sum?: WeightGoalSumAggregateInputType
    _min?: WeightGoalMinAggregateInputType
    _max?: WeightGoalMaxAggregateInputType
  }

  export type WeightGoalGroupByOutputType = {
    id: string
    goalWeight: Decimal
    startWeight: Decimal
    updatedAt: Date
    userId: string
    _count: WeightGoalCountAggregateOutputType | null
    _avg: WeightGoalAvgAggregateOutputType | null
    _sum: WeightGoalSumAggregateOutputType | null
    _min: WeightGoalMinAggregateOutputType | null
    _max: WeightGoalMaxAggregateOutputType | null
  }

  type GetWeightGoalGroupByPayload<T extends WeightGoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeightGoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeightGoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeightGoalGroupByOutputType[P]>
            : GetScalarType<T[P], WeightGoalGroupByOutputType[P]>
        }
      >
    >


  export type WeightGoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    goalWeight?: boolean
    startWeight?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightGoal"]>

  export type WeightGoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    goalWeight?: boolean
    startWeight?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightGoal"]>

  export type WeightGoalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    goalWeight?: boolean
    startWeight?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weightGoal"]>

  export type WeightGoalSelectScalar = {
    id?: boolean
    goalWeight?: boolean
    startWeight?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type WeightGoalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "goalWeight" | "startWeight" | "updatedAt" | "userId", ExtArgs["result"]["weightGoal"]>
  export type WeightGoalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WeightGoalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WeightGoalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WeightGoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeightGoal"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      goalWeight: Prisma.Decimal
      startWeight: Prisma.Decimal
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["weightGoal"]>
    composites: {}
  }

  type WeightGoalGetPayload<S extends boolean | null | undefined | WeightGoalDefaultArgs> = $Result.GetResult<Prisma.$WeightGoalPayload, S>

  type WeightGoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeightGoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeightGoalCountAggregateInputType | true
    }

  export interface WeightGoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeightGoal'], meta: { name: 'WeightGoal' } }
    /**
     * Find zero or one WeightGoal that matches the filter.
     * @param {WeightGoalFindUniqueArgs} args - Arguments to find a WeightGoal
     * @example
     * // Get one WeightGoal
     * const weightGoal = await prisma.weightGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeightGoalFindUniqueArgs>(args: SelectSubset<T, WeightGoalFindUniqueArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeightGoal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeightGoalFindUniqueOrThrowArgs} args - Arguments to find a WeightGoal
     * @example
     * // Get one WeightGoal
     * const weightGoal = await prisma.weightGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeightGoalFindUniqueOrThrowArgs>(args: SelectSubset<T, WeightGoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalFindFirstArgs} args - Arguments to find a WeightGoal
     * @example
     * // Get one WeightGoal
     * const weightGoal = await prisma.weightGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeightGoalFindFirstArgs>(args?: SelectSubset<T, WeightGoalFindFirstArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalFindFirstOrThrowArgs} args - Arguments to find a WeightGoal
     * @example
     * // Get one WeightGoal
     * const weightGoal = await prisma.weightGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeightGoalFindFirstOrThrowArgs>(args?: SelectSubset<T, WeightGoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeightGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeightGoals
     * const weightGoals = await prisma.weightGoal.findMany()
     * 
     * // Get first 10 WeightGoals
     * const weightGoals = await prisma.weightGoal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weightGoalWithIdOnly = await prisma.weightGoal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeightGoalFindManyArgs>(args?: SelectSubset<T, WeightGoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeightGoal.
     * @param {WeightGoalCreateArgs} args - Arguments to create a WeightGoal.
     * @example
     * // Create one WeightGoal
     * const WeightGoal = await prisma.weightGoal.create({
     *   data: {
     *     // ... data to create a WeightGoal
     *   }
     * })
     * 
     */
    create<T extends WeightGoalCreateArgs>(args: SelectSubset<T, WeightGoalCreateArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeightGoals.
     * @param {WeightGoalCreateManyArgs} args - Arguments to create many WeightGoals.
     * @example
     * // Create many WeightGoals
     * const weightGoal = await prisma.weightGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeightGoalCreateManyArgs>(args?: SelectSubset<T, WeightGoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeightGoals and returns the data saved in the database.
     * @param {WeightGoalCreateManyAndReturnArgs} args - Arguments to create many WeightGoals.
     * @example
     * // Create many WeightGoals
     * const weightGoal = await prisma.weightGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeightGoals and only return the `id`
     * const weightGoalWithIdOnly = await prisma.weightGoal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeightGoalCreateManyAndReturnArgs>(args?: SelectSubset<T, WeightGoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WeightGoal.
     * @param {WeightGoalDeleteArgs} args - Arguments to delete one WeightGoal.
     * @example
     * // Delete one WeightGoal
     * const WeightGoal = await prisma.weightGoal.delete({
     *   where: {
     *     // ... filter to delete one WeightGoal
     *   }
     * })
     * 
     */
    delete<T extends WeightGoalDeleteArgs>(args: SelectSubset<T, WeightGoalDeleteArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeightGoal.
     * @param {WeightGoalUpdateArgs} args - Arguments to update one WeightGoal.
     * @example
     * // Update one WeightGoal
     * const weightGoal = await prisma.weightGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeightGoalUpdateArgs>(args: SelectSubset<T, WeightGoalUpdateArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeightGoals.
     * @param {WeightGoalDeleteManyArgs} args - Arguments to filter WeightGoals to delete.
     * @example
     * // Delete a few WeightGoals
     * const { count } = await prisma.weightGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeightGoalDeleteManyArgs>(args?: SelectSubset<T, WeightGoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeightGoals
     * const weightGoal = await prisma.weightGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeightGoalUpdateManyArgs>(args: SelectSubset<T, WeightGoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightGoals and returns the data updated in the database.
     * @param {WeightGoalUpdateManyAndReturnArgs} args - Arguments to update many WeightGoals.
     * @example
     * // Update many WeightGoals
     * const weightGoal = await prisma.weightGoal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WeightGoals and only return the `id`
     * const weightGoalWithIdOnly = await prisma.weightGoal.updateManyAndReturn({
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
    updateManyAndReturn<T extends WeightGoalUpdateManyAndReturnArgs>(args: SelectSubset<T, WeightGoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WeightGoal.
     * @param {WeightGoalUpsertArgs} args - Arguments to update or create a WeightGoal.
     * @example
     * // Update or create a WeightGoal
     * const weightGoal = await prisma.weightGoal.upsert({
     *   create: {
     *     // ... data to create a WeightGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeightGoal we want to update
     *   }
     * })
     */
    upsert<T extends WeightGoalUpsertArgs>(args: SelectSubset<T, WeightGoalUpsertArgs<ExtArgs>>): Prisma__WeightGoalClient<$Result.GetResult<Prisma.$WeightGoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeightGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalCountArgs} args - Arguments to filter WeightGoals to count.
     * @example
     * // Count the number of WeightGoals
     * const count = await prisma.weightGoal.count({
     *   where: {
     *     // ... the filter for the WeightGoals we want to count
     *   }
     * })
    **/
    count<T extends WeightGoalCountArgs>(
      args?: Subset<T, WeightGoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeightGoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeightGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WeightGoalAggregateArgs>(args: Subset<T, WeightGoalAggregateArgs>): Prisma.PrismaPromise<GetWeightGoalAggregateType<T>>

    /**
     * Group by WeightGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightGoalGroupByArgs} args - Group by arguments.
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
      T extends WeightGoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeightGoalGroupByArgs['orderBy'] }
        : { orderBy?: WeightGoalGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeightGoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeightGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeightGoal model
   */
  readonly fields: WeightGoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeightGoal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeightGoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeightGoal model
   */
  interface WeightGoalFieldRefs {
    readonly id: FieldRef<"WeightGoal", 'String'>
    readonly goalWeight: FieldRef<"WeightGoal", 'Decimal'>
    readonly startWeight: FieldRef<"WeightGoal", 'Decimal'>
    readonly updatedAt: FieldRef<"WeightGoal", 'DateTime'>
    readonly userId: FieldRef<"WeightGoal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WeightGoal findUnique
   */
  export type WeightGoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter, which WeightGoal to fetch.
     */
    where: WeightGoalWhereUniqueInput
  }

  /**
   * WeightGoal findUniqueOrThrow
   */
  export type WeightGoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter, which WeightGoal to fetch.
     */
    where: WeightGoalWhereUniqueInput
  }

  /**
   * WeightGoal findFirst
   */
  export type WeightGoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter, which WeightGoal to fetch.
     */
    where?: WeightGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightGoals to fetch.
     */
    orderBy?: WeightGoalOrderByWithRelationInput | WeightGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightGoals.
     */
    cursor?: WeightGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightGoals.
     */
    distinct?: WeightGoalScalarFieldEnum | WeightGoalScalarFieldEnum[]
  }

  /**
   * WeightGoal findFirstOrThrow
   */
  export type WeightGoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter, which WeightGoal to fetch.
     */
    where?: WeightGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightGoals to fetch.
     */
    orderBy?: WeightGoalOrderByWithRelationInput | WeightGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightGoals.
     */
    cursor?: WeightGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightGoals.
     */
    distinct?: WeightGoalScalarFieldEnum | WeightGoalScalarFieldEnum[]
  }

  /**
   * WeightGoal findMany
   */
  export type WeightGoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter, which WeightGoals to fetch.
     */
    where?: WeightGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightGoals to fetch.
     */
    orderBy?: WeightGoalOrderByWithRelationInput | WeightGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeightGoals.
     */
    cursor?: WeightGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightGoals.
     */
    distinct?: WeightGoalScalarFieldEnum | WeightGoalScalarFieldEnum[]
  }

  /**
   * WeightGoal create
   */
  export type WeightGoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * The data needed to create a WeightGoal.
     */
    data: XOR<WeightGoalCreateInput, WeightGoalUncheckedCreateInput>
  }

  /**
   * WeightGoal createMany
   */
  export type WeightGoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeightGoals.
     */
    data: WeightGoalCreateManyInput | WeightGoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightGoal createManyAndReturn
   */
  export type WeightGoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * The data used to create many WeightGoals.
     */
    data: WeightGoalCreateManyInput | WeightGoalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WeightGoal update
   */
  export type WeightGoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * The data needed to update a WeightGoal.
     */
    data: XOR<WeightGoalUpdateInput, WeightGoalUncheckedUpdateInput>
    /**
     * Choose, which WeightGoal to update.
     */
    where: WeightGoalWhereUniqueInput
  }

  /**
   * WeightGoal updateMany
   */
  export type WeightGoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeightGoals.
     */
    data: XOR<WeightGoalUpdateManyMutationInput, WeightGoalUncheckedUpdateManyInput>
    /**
     * Filter which WeightGoals to update
     */
    where?: WeightGoalWhereInput
    /**
     * Limit how many WeightGoals to update.
     */
    limit?: number
  }

  /**
   * WeightGoal updateManyAndReturn
   */
  export type WeightGoalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * The data used to update WeightGoals.
     */
    data: XOR<WeightGoalUpdateManyMutationInput, WeightGoalUncheckedUpdateManyInput>
    /**
     * Filter which WeightGoals to update
     */
    where?: WeightGoalWhereInput
    /**
     * Limit how many WeightGoals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WeightGoal upsert
   */
  export type WeightGoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * The filter to search for the WeightGoal to update in case it exists.
     */
    where: WeightGoalWhereUniqueInput
    /**
     * In case the WeightGoal found by the `where` argument doesn't exist, create a new WeightGoal with this data.
     */
    create: XOR<WeightGoalCreateInput, WeightGoalUncheckedCreateInput>
    /**
     * In case the WeightGoal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeightGoalUpdateInput, WeightGoalUncheckedUpdateInput>
  }

  /**
   * WeightGoal delete
   */
  export type WeightGoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
    /**
     * Filter which WeightGoal to delete.
     */
    where: WeightGoalWhereUniqueInput
  }

  /**
   * WeightGoal deleteMany
   */
  export type WeightGoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightGoals to delete
     */
    where?: WeightGoalWhereInput
    /**
     * Limit how many WeightGoals to delete.
     */
    limit?: number
  }

  /**
   * WeightGoal without action
   */
  export type WeightGoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightGoal
     */
    select?: WeightGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightGoal
     */
    omit?: WeightGoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeightGoalInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    goalId: 'goalId',
    weightKg: 'weightKg',
    heightCm: 'heightCm',
    age: 'age',
    updatedAt: 'updatedAt'
  };

  export type UserProfileScalarFieldEnum = (typeof UserProfileScalarFieldEnum)[keyof typeof UserProfileScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    expiresAt: 'expiresAt',
    token: 'token',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    providerId: 'providerId',
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    idToken: 'idToken',
    accessTokenExpiresAt: 'accessTokenExpiresAt',
    refreshTokenExpiresAt: 'refreshTokenExpiresAt',
    scope: 'scope',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const VerificationScalarFieldEnum: {
    id: 'id',
    identifier: 'identifier',
    value: 'value',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum]


  export const WorkoutSessionScalarFieldEnum: {
    id: 'id',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    notes: 'notes',
    userId: 'userId'
  };

  export type WorkoutSessionScalarFieldEnum = (typeof WorkoutSessionScalarFieldEnum)[keyof typeof WorkoutSessionScalarFieldEnum]


  export const WorkoutExerciseScalarFieldEnum: {
    id: 'id',
    exerciseName: 'exerciseName',
    sets: 'sets',
    sessionId: 'sessionId'
  };

  export type WorkoutExerciseScalarFieldEnum = (typeof WorkoutExerciseScalarFieldEnum)[keyof typeof WorkoutExerciseScalarFieldEnum]


  export const NutritionGoalScalarFieldEnum: {
    id: 'id',
    calories: 'calories',
    protein: 'protein',
    carbs: 'carbs',
    fat: 'fat',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type NutritionGoalScalarFieldEnum = (typeof NutritionGoalScalarFieldEnum)[keyof typeof NutritionGoalScalarFieldEnum]


  export const MealLogScalarFieldEnum: {
    id: 'id',
    logDate: 'logDate',
    meal: 'meal',
    name: 'name',
    cal: 'cal',
    protein: 'protein',
    carbs: 'carbs',
    fat: 'fat',
    userId: 'userId'
  };

  export type MealLogScalarFieldEnum = (typeof MealLogScalarFieldEnum)[keyof typeof MealLogScalarFieldEnum]


  export const WeightLogScalarFieldEnum: {
    id: 'id',
    logDate: 'logDate',
    weight: 'weight',
    userId: 'userId'
  };

  export type WeightLogScalarFieldEnum = (typeof WeightLogScalarFieldEnum)[keyof typeof WeightLogScalarFieldEnum]


  export const WeightGoalScalarFieldEnum: {
    id: 'id',
    goalWeight: 'goalWeight',
    startWeight: 'startWeight',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type WeightGoalScalarFieldEnum = (typeof WeightGoalScalarFieldEnum)[keyof typeof WeightGoalScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Meal'
   */
  export type EnumMealFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Meal'>
    


  /**
   * Reference to a field of type 'Meal[]'
   */
  export type ListEnumMealFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Meal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    emailVerified?: BoolFilter<"User"> | boolean
    image?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sessions?: SessionListRelationFilter
    accounts?: AccountListRelationFilter
    workoutSessions?: WorkoutSessionListRelationFilter
    profile?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    nutritionGoal?: XOR<NutritionGoalNullableScalarRelationFilter, NutritionGoalWhereInput> | null
    mealLogs?: MealLogListRelationFilter
    weightLogs?: WeightLogListRelationFilter
    weightGoal?: XOR<WeightGoalNullableScalarRelationFilter, WeightGoalWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessions?: SessionOrderByRelationAggregateInput
    accounts?: AccountOrderByRelationAggregateInput
    workoutSessions?: WorkoutSessionOrderByRelationAggregateInput
    profile?: UserProfileOrderByWithRelationInput
    nutritionGoal?: NutritionGoalOrderByWithRelationInput
    mealLogs?: MealLogOrderByRelationAggregateInput
    weightLogs?: WeightLogOrderByRelationAggregateInput
    weightGoal?: WeightGoalOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    emailVerified?: BoolFilter<"User"> | boolean
    image?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sessions?: SessionListRelationFilter
    accounts?: AccountListRelationFilter
    workoutSessions?: WorkoutSessionListRelationFilter
    profile?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    nutritionGoal?: XOR<NutritionGoalNullableScalarRelationFilter, NutritionGoalWhereInput> | null
    mealLogs?: MealLogListRelationFilter
    weightLogs?: WeightLogListRelationFilter
    weightGoal?: XOR<WeightGoalNullableScalarRelationFilter, WeightGoalWhereInput> | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    emailVerified?: BoolWithAggregatesFilter<"User"> | boolean
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserProfileWhereInput = {
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    id?: StringFilter<"UserProfile"> | string
    userId?: StringFilter<"UserProfile"> | string
    goalId?: StringNullableFilter<"UserProfile"> | string | null
    weightKg?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    heightCm?: IntNullableFilter<"UserProfile"> | number | null
    age?: IntNullableFilter<"UserProfile"> | number | null
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    goalId?: SortOrderInput | SortOrder
    weightKg?: SortOrderInput | SortOrder
    heightCm?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    goalId?: StringNullableFilter<"UserProfile"> | string | null
    weightKg?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    heightCm?: IntNullableFilter<"UserProfile"> | number | null
    age?: IntNullableFilter<"UserProfile"> | number | null
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type UserProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    goalId?: SortOrderInput | SortOrder
    weightKg?: SortOrderInput | SortOrder
    heightCm?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: UserProfileCountOrderByAggregateInput
    _avg?: UserProfileAvgOrderByAggregateInput
    _max?: UserProfileMaxOrderByAggregateInput
    _min?: UserProfileMinOrderByAggregateInput
    _sum?: UserProfileSumOrderByAggregateInput
  }

  export type UserProfileScalarWhereWithAggregatesInput = {
    AND?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    OR?: UserProfileScalarWhereWithAggregatesInput[]
    NOT?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserProfile"> | string
    userId?: StringWithAggregatesFilter<"UserProfile"> | string
    goalId?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    weightKg?: DecimalNullableWithAggregatesFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    heightCm?: IntNullableWithAggregatesFilter<"UserProfile"> | number | null
    age?: IntNullableWithAggregatesFilter<"UserProfile"> | number | null
    updatedAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    token?: StringFilter<"Session"> | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    token?: StringWithAggregatesFilter<"Session"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"Session"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"Session"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    userId?: StringWithAggregatesFilter<"Session"> | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    accountId?: StringFilter<"Account"> | string
    providerId?: StringFilter<"Account"> | string
    accessToken?: StringNullableFilter<"Account"> | string | null
    refreshToken?: StringNullableFilter<"Account"> | string | null
    idToken?: StringNullableFilter<"Account"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    password?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    userId?: StringFilter<"Account"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    idToken?: SortOrderInput | SortOrder
    accessTokenExpiresAt?: SortOrderInput | SortOrder
    refreshTokenExpiresAt?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    accountId?: StringFilter<"Account"> | string
    providerId?: StringFilter<"Account"> | string
    accessToken?: StringNullableFilter<"Account"> | string | null
    refreshToken?: StringNullableFilter<"Account"> | string | null
    idToken?: StringNullableFilter<"Account"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    password?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    userId?: StringFilter<"Account"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    idToken?: SortOrderInput | SortOrder
    accessTokenExpiresAt?: SortOrderInput | SortOrder
    refreshTokenExpiresAt?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: AccountCountOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    accountId?: StringWithAggregatesFilter<"Account"> | string
    providerId?: StringWithAggregatesFilter<"Account"> | string
    accessToken?: StringNullableWithAggregatesFilter<"Account"> | string | null
    refreshToken?: StringNullableWithAggregatesFilter<"Account"> | string | null
    idToken?: StringNullableWithAggregatesFilter<"Account"> | string | null
    accessTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
    scope?: StringNullableWithAggregatesFilter<"Account"> | string | null
    password?: StringNullableWithAggregatesFilter<"Account"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    userId?: StringWithAggregatesFilter<"Account"> | string
  }

  export type VerificationWhereInput = {
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    id?: StringFilter<"Verification"> | string
    identifier?: StringFilter<"Verification"> | string
    value?: StringFilter<"Verification"> | string
    expiresAt?: DateTimeFilter<"Verification"> | Date | string
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
  }

  export type VerificationOrderByWithRelationInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    identifier?: StringFilter<"Verification"> | string
    value?: StringFilter<"Verification"> | string
    expiresAt?: DateTimeFilter<"Verification"> | Date | string
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
  }, "id">

  export type VerificationOrderByWithAggregationInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VerificationCountOrderByAggregateInput
    _max?: VerificationMaxOrderByAggregateInput
    _min?: VerificationMinOrderByAggregateInput
  }

  export type VerificationScalarWhereWithAggregatesInput = {
    AND?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    OR?: VerificationScalarWhereWithAggregatesInput[]
    NOT?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Verification"> | string
    identifier?: StringWithAggregatesFilter<"Verification"> | string
    value?: StringWithAggregatesFilter<"Verification"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
  }

  export type WorkoutSessionWhereInput = {
    AND?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    OR?: WorkoutSessionWhereInput[]
    NOT?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    id?: StringFilter<"WorkoutSession"> | string
    startedAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutSession"> | string | null
    userId?: StringFilter<"WorkoutSession"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    exercises?: WorkoutExerciseListRelationFilter
  }

  export type WorkoutSessionOrderByWithRelationInput = {
    id?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    exercises?: WorkoutExerciseOrderByRelationAggregateInput
  }

  export type WorkoutSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    OR?: WorkoutSessionWhereInput[]
    NOT?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    startedAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutSession"> | string | null
    userId?: StringFilter<"WorkoutSession"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    exercises?: WorkoutExerciseListRelationFilter
  }, "id">

  export type WorkoutSessionOrderByWithAggregationInput = {
    id?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    userId?: SortOrder
    _count?: WorkoutSessionCountOrderByAggregateInput
    _max?: WorkoutSessionMaxOrderByAggregateInput
    _min?: WorkoutSessionMinOrderByAggregateInput
  }

  export type WorkoutSessionScalarWhereWithAggregatesInput = {
    AND?: WorkoutSessionScalarWhereWithAggregatesInput | WorkoutSessionScalarWhereWithAggregatesInput[]
    OR?: WorkoutSessionScalarWhereWithAggregatesInput[]
    NOT?: WorkoutSessionScalarWhereWithAggregatesInput | WorkoutSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutSession"> | string
    startedAt?: DateTimeWithAggregatesFilter<"WorkoutSession"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutSession"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    userId?: StringWithAggregatesFilter<"WorkoutSession"> | string
  }

  export type WorkoutExerciseWhereInput = {
    AND?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    OR?: WorkoutExerciseWhereInput[]
    NOT?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    id?: StringFilter<"WorkoutExercise"> | string
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    sets?: JsonFilter<"WorkoutExercise">
    sessionId?: StringFilter<"WorkoutExercise"> | string
    session?: XOR<WorkoutSessionScalarRelationFilter, WorkoutSessionWhereInput>
  }

  export type WorkoutExerciseOrderByWithRelationInput = {
    id?: SortOrder
    exerciseName?: SortOrder
    sets?: SortOrder
    sessionId?: SortOrder
    session?: WorkoutSessionOrderByWithRelationInput
  }

  export type WorkoutExerciseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    OR?: WorkoutExerciseWhereInput[]
    NOT?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    sets?: JsonFilter<"WorkoutExercise">
    sessionId?: StringFilter<"WorkoutExercise"> | string
    session?: XOR<WorkoutSessionScalarRelationFilter, WorkoutSessionWhereInput>
  }, "id">

  export type WorkoutExerciseOrderByWithAggregationInput = {
    id?: SortOrder
    exerciseName?: SortOrder
    sets?: SortOrder
    sessionId?: SortOrder
    _count?: WorkoutExerciseCountOrderByAggregateInput
    _max?: WorkoutExerciseMaxOrderByAggregateInput
    _min?: WorkoutExerciseMinOrderByAggregateInput
  }

  export type WorkoutExerciseScalarWhereWithAggregatesInput = {
    AND?: WorkoutExerciseScalarWhereWithAggregatesInput | WorkoutExerciseScalarWhereWithAggregatesInput[]
    OR?: WorkoutExerciseScalarWhereWithAggregatesInput[]
    NOT?: WorkoutExerciseScalarWhereWithAggregatesInput | WorkoutExerciseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    exerciseName?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    sets?: JsonWithAggregatesFilter<"WorkoutExercise">
    sessionId?: StringWithAggregatesFilter<"WorkoutExercise"> | string
  }

  export type NutritionGoalWhereInput = {
    AND?: NutritionGoalWhereInput | NutritionGoalWhereInput[]
    OR?: NutritionGoalWhereInput[]
    NOT?: NutritionGoalWhereInput | NutritionGoalWhereInput[]
    id?: StringFilter<"NutritionGoal"> | string
    calories?: IntFilter<"NutritionGoal"> | number
    protein?: IntFilter<"NutritionGoal"> | number
    carbs?: IntFilter<"NutritionGoal"> | number
    fat?: IntFilter<"NutritionGoal"> | number
    updatedAt?: DateTimeFilter<"NutritionGoal"> | Date | string
    userId?: StringFilter<"NutritionGoal"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type NutritionGoalOrderByWithRelationInput = {
    id?: SortOrder
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type NutritionGoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: NutritionGoalWhereInput | NutritionGoalWhereInput[]
    OR?: NutritionGoalWhereInput[]
    NOT?: NutritionGoalWhereInput | NutritionGoalWhereInput[]
    calories?: IntFilter<"NutritionGoal"> | number
    protein?: IntFilter<"NutritionGoal"> | number
    carbs?: IntFilter<"NutritionGoal"> | number
    fat?: IntFilter<"NutritionGoal"> | number
    updatedAt?: DateTimeFilter<"NutritionGoal"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type NutritionGoalOrderByWithAggregationInput = {
    id?: SortOrder
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: NutritionGoalCountOrderByAggregateInput
    _avg?: NutritionGoalAvgOrderByAggregateInput
    _max?: NutritionGoalMaxOrderByAggregateInput
    _min?: NutritionGoalMinOrderByAggregateInput
    _sum?: NutritionGoalSumOrderByAggregateInput
  }

  export type NutritionGoalScalarWhereWithAggregatesInput = {
    AND?: NutritionGoalScalarWhereWithAggregatesInput | NutritionGoalScalarWhereWithAggregatesInput[]
    OR?: NutritionGoalScalarWhereWithAggregatesInput[]
    NOT?: NutritionGoalScalarWhereWithAggregatesInput | NutritionGoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NutritionGoal"> | string
    calories?: IntWithAggregatesFilter<"NutritionGoal"> | number
    protein?: IntWithAggregatesFilter<"NutritionGoal"> | number
    carbs?: IntWithAggregatesFilter<"NutritionGoal"> | number
    fat?: IntWithAggregatesFilter<"NutritionGoal"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"NutritionGoal"> | Date | string
    userId?: StringWithAggregatesFilter<"NutritionGoal"> | string
  }

  export type MealLogWhereInput = {
    AND?: MealLogWhereInput | MealLogWhereInput[]
    OR?: MealLogWhereInput[]
    NOT?: MealLogWhereInput | MealLogWhereInput[]
    id?: StringFilter<"MealLog"> | string
    logDate?: DateTimeFilter<"MealLog"> | Date | string
    meal?: EnumMealFilter<"MealLog"> | $Enums.Meal
    name?: StringFilter<"MealLog"> | string
    cal?: IntFilter<"MealLog"> | number
    protein?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    fat?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"MealLog"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MealLogOrderByWithRelationInput = {
    id?: SortOrder
    logDate?: SortOrder
    meal?: SortOrder
    name?: SortOrder
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type MealLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MealLogWhereInput | MealLogWhereInput[]
    OR?: MealLogWhereInput[]
    NOT?: MealLogWhereInput | MealLogWhereInput[]
    logDate?: DateTimeFilter<"MealLog"> | Date | string
    meal?: EnumMealFilter<"MealLog"> | $Enums.Meal
    name?: StringFilter<"MealLog"> | string
    cal?: IntFilter<"MealLog"> | number
    protein?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    fat?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"MealLog"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type MealLogOrderByWithAggregationInput = {
    id?: SortOrder
    logDate?: SortOrder
    meal?: SortOrder
    name?: SortOrder
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    userId?: SortOrder
    _count?: MealLogCountOrderByAggregateInput
    _avg?: MealLogAvgOrderByAggregateInput
    _max?: MealLogMaxOrderByAggregateInput
    _min?: MealLogMinOrderByAggregateInput
    _sum?: MealLogSumOrderByAggregateInput
  }

  export type MealLogScalarWhereWithAggregatesInput = {
    AND?: MealLogScalarWhereWithAggregatesInput | MealLogScalarWhereWithAggregatesInput[]
    OR?: MealLogScalarWhereWithAggregatesInput[]
    NOT?: MealLogScalarWhereWithAggregatesInput | MealLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MealLog"> | string
    logDate?: DateTimeWithAggregatesFilter<"MealLog"> | Date | string
    meal?: EnumMealWithAggregatesFilter<"MealLog"> | $Enums.Meal
    name?: StringWithAggregatesFilter<"MealLog"> | string
    cal?: IntWithAggregatesFilter<"MealLog"> | number
    protein?: DecimalWithAggregatesFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    carbs?: DecimalWithAggregatesFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    fat?: DecimalWithAggregatesFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringWithAggregatesFilter<"MealLog"> | string
  }

  export type WeightLogWhereInput = {
    AND?: WeightLogWhereInput | WeightLogWhereInput[]
    OR?: WeightLogWhereInput[]
    NOT?: WeightLogWhereInput | WeightLogWhereInput[]
    id?: StringFilter<"WeightLog"> | string
    logDate?: DateTimeFilter<"WeightLog"> | Date | string
    weight?: DecimalFilter<"WeightLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"WeightLog"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type WeightLogOrderByWithRelationInput = {
    id?: SortOrder
    logDate?: SortOrder
    weight?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type WeightLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WeightLogWhereInput | WeightLogWhereInput[]
    OR?: WeightLogWhereInput[]
    NOT?: WeightLogWhereInput | WeightLogWhereInput[]
    logDate?: DateTimeFilter<"WeightLog"> | Date | string
    weight?: DecimalFilter<"WeightLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"WeightLog"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type WeightLogOrderByWithAggregationInput = {
    id?: SortOrder
    logDate?: SortOrder
    weight?: SortOrder
    userId?: SortOrder
    _count?: WeightLogCountOrderByAggregateInput
    _avg?: WeightLogAvgOrderByAggregateInput
    _max?: WeightLogMaxOrderByAggregateInput
    _min?: WeightLogMinOrderByAggregateInput
    _sum?: WeightLogSumOrderByAggregateInput
  }

  export type WeightLogScalarWhereWithAggregatesInput = {
    AND?: WeightLogScalarWhereWithAggregatesInput | WeightLogScalarWhereWithAggregatesInput[]
    OR?: WeightLogScalarWhereWithAggregatesInput[]
    NOT?: WeightLogScalarWhereWithAggregatesInput | WeightLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeightLog"> | string
    logDate?: DateTimeWithAggregatesFilter<"WeightLog"> | Date | string
    weight?: DecimalWithAggregatesFilter<"WeightLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringWithAggregatesFilter<"WeightLog"> | string
  }

  export type WeightGoalWhereInput = {
    AND?: WeightGoalWhereInput | WeightGoalWhereInput[]
    OR?: WeightGoalWhereInput[]
    NOT?: WeightGoalWhereInput | WeightGoalWhereInput[]
    id?: StringFilter<"WeightGoal"> | string
    goalWeight?: DecimalFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFilter<"WeightGoal"> | Date | string
    userId?: StringFilter<"WeightGoal"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type WeightGoalOrderByWithRelationInput = {
    id?: SortOrder
    goalWeight?: SortOrder
    startWeight?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type WeightGoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: WeightGoalWhereInput | WeightGoalWhereInput[]
    OR?: WeightGoalWhereInput[]
    NOT?: WeightGoalWhereInput | WeightGoalWhereInput[]
    goalWeight?: DecimalFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFilter<"WeightGoal"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type WeightGoalOrderByWithAggregationInput = {
    id?: SortOrder
    goalWeight?: SortOrder
    startWeight?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: WeightGoalCountOrderByAggregateInput
    _avg?: WeightGoalAvgOrderByAggregateInput
    _max?: WeightGoalMaxOrderByAggregateInput
    _min?: WeightGoalMinOrderByAggregateInput
    _sum?: WeightGoalSumOrderByAggregateInput
  }

  export type WeightGoalScalarWhereWithAggregatesInput = {
    AND?: WeightGoalScalarWhereWithAggregatesInput | WeightGoalScalarWhereWithAggregatesInput[]
    OR?: WeightGoalScalarWhereWithAggregatesInput[]
    NOT?: WeightGoalScalarWhereWithAggregatesInput | WeightGoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeightGoal"> | string
    goalWeight?: DecimalWithAggregatesFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalWithAggregatesFilter<"WeightGoal"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeWithAggregatesFilter<"WeightGoal"> | Date | string
    userId?: StringWithAggregatesFilter<"WeightGoal"> | string
  }

  export type UserCreateInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileCreateInput = {
    id?: string
    goalId?: string | null
    weightKg?: Decimal | DecimalJsLike | number | string | null
    heightCm?: number | null
    age?: number | null
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
  }

  export type UserProfileUncheckedCreateInput = {
    id?: string
    userId: string
    goalId?: string | null
    weightKg?: Decimal | DecimalJsLike | number | string | null
    heightCm?: number | null
    age?: number | null
    updatedAt?: Date | string
  }

  export type UserProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
  }

  export type UserProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileCreateManyInput = {
    id?: string
    userId: string
    goalId?: string | null
    weightKg?: Decimal | DecimalJsLike | number | string | null
    heightCm?: number | null
    age?: number | null
    updatedAt?: Date | string
  }

  export type UserProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type SessionCreateManyInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AccountCreateInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAccountsInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AccountCreateManyInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type VerificationCreateInput = {
    id?: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUncheckedCreateInput = {
    id?: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationCreateManyInput = {
    id?: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkoutSessionCreateInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    user: UserCreateNestedOneWithoutWorkoutSessionsInput
    exercises?: WorkoutExerciseCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUncheckedCreateInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    userId: string
    exercises?: WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutWorkoutSessionsNestedInput
    exercises?: WorkoutExerciseUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    exercises?: WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionCreateManyInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    userId: string
  }

  export type WorkoutSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WorkoutExerciseCreateInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
    session: WorkoutSessionCreateNestedOneWithoutExercisesInput
  }

  export type WorkoutExerciseUncheckedCreateInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
    sessionId: string
  }

  export type WorkoutExerciseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
    session?: WorkoutSessionUpdateOneRequiredWithoutExercisesNestedInput
  }

  export type WorkoutExerciseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
    sessionId?: StringFieldUpdateOperationsInput | string
  }

  export type WorkoutExerciseCreateManyInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
    sessionId: string
  }

  export type WorkoutExerciseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
    sessionId?: StringFieldUpdateOperationsInput | string
  }

  export type NutritionGoalCreateInput = {
    id?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutNutritionGoalInput
  }

  export type NutritionGoalUncheckedCreateInput = {
    id?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt?: Date | string
    userId: string
  }

  export type NutritionGoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutNutritionGoalNestedInput
  }

  export type NutritionGoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type NutritionGoalCreateManyInput = {
    id?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt?: Date | string
    userId: string
  }

  export type NutritionGoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionGoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MealLogCreateInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
    user: UserCreateNestedOneWithoutMealLogsInput
  }

  export type MealLogUncheckedCreateInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
    userId: string
  }

  export type MealLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    user?: UserUpdateOneRequiredWithoutMealLogsNestedInput
  }

  export type MealLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MealLogCreateManyInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
    userId: string
  }

  export type MealLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type MealLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WeightLogCreateInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
    user: UserCreateNestedOneWithoutWeightLogsInput
  }

  export type WeightLogUncheckedCreateInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
    userId: string
  }

  export type WeightLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    user?: UserUpdateOneRequiredWithoutWeightLogsNestedInput
  }

  export type WeightLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WeightLogCreateManyInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
    userId: string
  }

  export type WeightLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type WeightLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WeightGoalCreateInput = {
    id?: string
    goalWeight: Decimal | DecimalJsLike | number | string
    startWeight: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutWeightGoalInput
  }

  export type WeightGoalUncheckedCreateInput = {
    id?: string
    goalWeight: Decimal | DecimalJsLike | number | string
    startWeight: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
    userId: string
  }

  export type WeightGoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWeightGoalNestedInput
  }

  export type WeightGoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type WeightGoalCreateManyInput = {
    id?: string
    goalWeight: Decimal | DecimalJsLike | number | string
    startWeight: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
    userId: string
  }

  export type WeightGoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightGoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type WorkoutSessionListRelationFilter = {
    every?: WorkoutSessionWhereInput
    some?: WorkoutSessionWhereInput
    none?: WorkoutSessionWhereInput
  }

  export type UserProfileNullableScalarRelationFilter = {
    is?: UserProfileWhereInput | null
    isNot?: UserProfileWhereInput | null
  }

  export type NutritionGoalNullableScalarRelationFilter = {
    is?: NutritionGoalWhereInput | null
    isNot?: NutritionGoalWhereInput | null
  }

  export type MealLogListRelationFilter = {
    every?: MealLogWhereInput
    some?: MealLogWhereInput
    none?: MealLogWhereInput
  }

  export type WeightLogListRelationFilter = {
    every?: WeightLogWhereInput
    some?: WeightLogWhereInput
    none?: WeightLogWhereInput
  }

  export type WeightGoalNullableScalarRelationFilter = {
    is?: WeightGoalWhereInput | null
    isNot?: WeightGoalWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkoutSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MealLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WeightLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    goalId?: SortOrder
    weightKg?: SortOrder
    heightCm?: SortOrder
    age?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileAvgOrderByAggregateInput = {
    weightKg?: SortOrder
    heightCm?: SortOrder
    age?: SortOrder
  }

  export type UserProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    goalId?: SortOrder
    weightKg?: SortOrder
    heightCm?: SortOrder
    age?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    goalId?: SortOrder
    weightKg?: SortOrder
    heightCm?: SortOrder
    age?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileSumOrderByAggregateInput = {
    weightKg?: SortOrder
    heightCm?: SortOrder
    age?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type VerificationCountOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMaxOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMinOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkoutExerciseListRelationFilter = {
    every?: WorkoutExerciseWhereInput
    some?: WorkoutExerciseWhereInput
    none?: WorkoutExerciseWhereInput
  }

  export type WorkoutExerciseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkoutSessionCountOrderByAggregateInput = {
    id?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
    userId?: SortOrder
  }

  export type WorkoutSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
    userId?: SortOrder
  }

  export type WorkoutSessionMinOrderByAggregateInput = {
    id?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
    userId?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type WorkoutSessionScalarRelationFilter = {
    is?: WorkoutSessionWhereInput
    isNot?: WorkoutSessionWhereInput
  }

  export type WorkoutExerciseCountOrderByAggregateInput = {
    id?: SortOrder
    exerciseName?: SortOrder
    sets?: SortOrder
    sessionId?: SortOrder
  }

  export type WorkoutExerciseMaxOrderByAggregateInput = {
    id?: SortOrder
    exerciseName?: SortOrder
    sessionId?: SortOrder
  }

  export type WorkoutExerciseMinOrderByAggregateInput = {
    id?: SortOrder
    exerciseName?: SortOrder
    sessionId?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NutritionGoalCountOrderByAggregateInput = {
    id?: SortOrder
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type NutritionGoalAvgOrderByAggregateInput = {
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
  }

  export type NutritionGoalMaxOrderByAggregateInput = {
    id?: SortOrder
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type NutritionGoalMinOrderByAggregateInput = {
    id?: SortOrder
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type NutritionGoalSumOrderByAggregateInput = {
    calories?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumMealFilter<$PrismaModel = never> = {
    equals?: $Enums.Meal | EnumMealFieldRefInput<$PrismaModel>
    in?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    notIn?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    not?: NestedEnumMealFilter<$PrismaModel> | $Enums.Meal
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type MealLogCountOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    meal?: SortOrder
    name?: SortOrder
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    userId?: SortOrder
  }

  export type MealLogAvgOrderByAggregateInput = {
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
  }

  export type MealLogMaxOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    meal?: SortOrder
    name?: SortOrder
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    userId?: SortOrder
  }

  export type MealLogMinOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    meal?: SortOrder
    name?: SortOrder
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
    userId?: SortOrder
  }

  export type MealLogSumOrderByAggregateInput = {
    cal?: SortOrder
    protein?: SortOrder
    carbs?: SortOrder
    fat?: SortOrder
  }

  export type EnumMealWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Meal | EnumMealFieldRefInput<$PrismaModel>
    in?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    notIn?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    not?: NestedEnumMealWithAggregatesFilter<$PrismaModel> | $Enums.Meal
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMealFilter<$PrismaModel>
    _max?: NestedEnumMealFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type WeightLogCountOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    weight?: SortOrder
    userId?: SortOrder
  }

  export type WeightLogAvgOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type WeightLogMaxOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    weight?: SortOrder
    userId?: SortOrder
  }

  export type WeightLogMinOrderByAggregateInput = {
    id?: SortOrder
    logDate?: SortOrder
    weight?: SortOrder
    userId?: SortOrder
  }

  export type WeightLogSumOrderByAggregateInput = {
    weight?: SortOrder
  }

  export type WeightGoalCountOrderByAggregateInput = {
    id?: SortOrder
    goalWeight?: SortOrder
    startWeight?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type WeightGoalAvgOrderByAggregateInput = {
    goalWeight?: SortOrder
    startWeight?: SortOrder
  }

  export type WeightGoalMaxOrderByAggregateInput = {
    id?: SortOrder
    goalWeight?: SortOrder
    startWeight?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type WeightGoalMinOrderByAggregateInput = {
    id?: SortOrder
    goalWeight?: SortOrder
    startWeight?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type WeightGoalSumOrderByAggregateInput = {
    goalWeight?: SortOrder
    startWeight?: SortOrder
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type AccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type WorkoutSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput> | WorkoutSessionCreateWithoutUserInput[] | WorkoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutUserInput | WorkoutSessionCreateOrConnectWithoutUserInput[]
    createMany?: WorkoutSessionCreateManyUserInputEnvelope
    connect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
  }

  export type UserProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type NutritionGoalCreateNestedOneWithoutUserInput = {
    create?: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: NutritionGoalCreateOrConnectWithoutUserInput
    connect?: NutritionGoalWhereUniqueInput
  }

  export type MealLogCreateNestedManyWithoutUserInput = {
    create?: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput> | MealLogCreateWithoutUserInput[] | MealLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MealLogCreateOrConnectWithoutUserInput | MealLogCreateOrConnectWithoutUserInput[]
    createMany?: MealLogCreateManyUserInputEnvelope
    connect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
  }

  export type WeightLogCreateNestedManyWithoutUserInput = {
    create?: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput> | WeightLogCreateWithoutUserInput[] | WeightLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WeightLogCreateOrConnectWithoutUserInput | WeightLogCreateOrConnectWithoutUserInput[]
    createMany?: WeightLogCreateManyUserInputEnvelope
    connect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
  }

  export type WeightGoalCreateNestedOneWithoutUserInput = {
    create?: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: WeightGoalCreateOrConnectWithoutUserInput
    connect?: WeightGoalWhereUniqueInput
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type WorkoutSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput> | WorkoutSessionCreateWithoutUserInput[] | WorkoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutUserInput | WorkoutSessionCreateOrConnectWithoutUserInput[]
    createMany?: WorkoutSessionCreateManyUserInputEnvelope
    connect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
  }

  export type UserProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type NutritionGoalUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: NutritionGoalCreateOrConnectWithoutUserInput
    connect?: NutritionGoalWhereUniqueInput
  }

  export type MealLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput> | MealLogCreateWithoutUserInput[] | MealLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MealLogCreateOrConnectWithoutUserInput | MealLogCreateOrConnectWithoutUserInput[]
    createMany?: MealLogCreateManyUserInputEnvelope
    connect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
  }

  export type WeightLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput> | WeightLogCreateWithoutUserInput[] | WeightLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WeightLogCreateOrConnectWithoutUserInput | WeightLogCreateOrConnectWithoutUserInput[]
    createMany?: WeightLogCreateManyUserInputEnvelope
    connect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
  }

  export type WeightGoalUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: WeightGoalCreateOrConnectWithoutUserInput
    connect?: WeightGoalWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type AccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type WorkoutSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput> | WorkoutSessionCreateWithoutUserInput[] | WorkoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutUserInput | WorkoutSessionCreateOrConnectWithoutUserInput[]
    upsert?: WorkoutSessionUpsertWithWhereUniqueWithoutUserInput | WorkoutSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WorkoutSessionCreateManyUserInputEnvelope
    set?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    disconnect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    delete?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    connect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    update?: WorkoutSessionUpdateWithWhereUniqueWithoutUserInput | WorkoutSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WorkoutSessionUpdateManyWithWhereWithoutUserInput | WorkoutSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WorkoutSessionScalarWhereInput | WorkoutSessionScalarWhereInput[]
  }

  export type UserProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type NutritionGoalUpdateOneWithoutUserNestedInput = {
    create?: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: NutritionGoalCreateOrConnectWithoutUserInput
    upsert?: NutritionGoalUpsertWithoutUserInput
    disconnect?: NutritionGoalWhereInput | boolean
    delete?: NutritionGoalWhereInput | boolean
    connect?: NutritionGoalWhereUniqueInput
    update?: XOR<XOR<NutritionGoalUpdateToOneWithWhereWithoutUserInput, NutritionGoalUpdateWithoutUserInput>, NutritionGoalUncheckedUpdateWithoutUserInput>
  }

  export type MealLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput> | MealLogCreateWithoutUserInput[] | MealLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MealLogCreateOrConnectWithoutUserInput | MealLogCreateOrConnectWithoutUserInput[]
    upsert?: MealLogUpsertWithWhereUniqueWithoutUserInput | MealLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MealLogCreateManyUserInputEnvelope
    set?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    disconnect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    delete?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    connect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    update?: MealLogUpdateWithWhereUniqueWithoutUserInput | MealLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MealLogUpdateManyWithWhereWithoutUserInput | MealLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MealLogScalarWhereInput | MealLogScalarWhereInput[]
  }

  export type WeightLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput> | WeightLogCreateWithoutUserInput[] | WeightLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WeightLogCreateOrConnectWithoutUserInput | WeightLogCreateOrConnectWithoutUserInput[]
    upsert?: WeightLogUpsertWithWhereUniqueWithoutUserInput | WeightLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WeightLogCreateManyUserInputEnvelope
    set?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    disconnect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    delete?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    connect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    update?: WeightLogUpdateWithWhereUniqueWithoutUserInput | WeightLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WeightLogUpdateManyWithWhereWithoutUserInput | WeightLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WeightLogScalarWhereInput | WeightLogScalarWhereInput[]
  }

  export type WeightGoalUpdateOneWithoutUserNestedInput = {
    create?: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: WeightGoalCreateOrConnectWithoutUserInput
    upsert?: WeightGoalUpsertWithoutUserInput
    disconnect?: WeightGoalWhereInput | boolean
    delete?: WeightGoalWhereInput | boolean
    connect?: WeightGoalWhereUniqueInput
    update?: XOR<XOR<WeightGoalUpdateToOneWithWhereWithoutUserInput, WeightGoalUpdateWithoutUserInput>, WeightGoalUncheckedUpdateWithoutUserInput>
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput> | WorkoutSessionCreateWithoutUserInput[] | WorkoutSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutUserInput | WorkoutSessionCreateOrConnectWithoutUserInput[]
    upsert?: WorkoutSessionUpsertWithWhereUniqueWithoutUserInput | WorkoutSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WorkoutSessionCreateManyUserInputEnvelope
    set?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    disconnect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    delete?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    connect?: WorkoutSessionWhereUniqueInput | WorkoutSessionWhereUniqueInput[]
    update?: WorkoutSessionUpdateWithWhereUniqueWithoutUserInput | WorkoutSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WorkoutSessionUpdateManyWithWhereWithoutUserInput | WorkoutSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WorkoutSessionScalarWhereInput | WorkoutSessionScalarWhereInput[]
  }

  export type UserProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type NutritionGoalUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: NutritionGoalCreateOrConnectWithoutUserInput
    upsert?: NutritionGoalUpsertWithoutUserInput
    disconnect?: NutritionGoalWhereInput | boolean
    delete?: NutritionGoalWhereInput | boolean
    connect?: NutritionGoalWhereUniqueInput
    update?: XOR<XOR<NutritionGoalUpdateToOneWithWhereWithoutUserInput, NutritionGoalUpdateWithoutUserInput>, NutritionGoalUncheckedUpdateWithoutUserInput>
  }

  export type MealLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput> | MealLogCreateWithoutUserInput[] | MealLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MealLogCreateOrConnectWithoutUserInput | MealLogCreateOrConnectWithoutUserInput[]
    upsert?: MealLogUpsertWithWhereUniqueWithoutUserInput | MealLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MealLogCreateManyUserInputEnvelope
    set?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    disconnect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    delete?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    connect?: MealLogWhereUniqueInput | MealLogWhereUniqueInput[]
    update?: MealLogUpdateWithWhereUniqueWithoutUserInput | MealLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MealLogUpdateManyWithWhereWithoutUserInput | MealLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MealLogScalarWhereInput | MealLogScalarWhereInput[]
  }

  export type WeightLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput> | WeightLogCreateWithoutUserInput[] | WeightLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WeightLogCreateOrConnectWithoutUserInput | WeightLogCreateOrConnectWithoutUserInput[]
    upsert?: WeightLogUpsertWithWhereUniqueWithoutUserInput | WeightLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WeightLogCreateManyUserInputEnvelope
    set?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    disconnect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    delete?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    connect?: WeightLogWhereUniqueInput | WeightLogWhereUniqueInput[]
    update?: WeightLogUpdateWithWhereUniqueWithoutUserInput | WeightLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WeightLogUpdateManyWithWhereWithoutUserInput | WeightLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WeightLogScalarWhereInput | WeightLogScalarWhereInput[]
  }

  export type WeightGoalUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
    connectOrCreate?: WeightGoalCreateOrConnectWithoutUserInput
    upsert?: WeightGoalUpsertWithoutUserInput
    disconnect?: WeightGoalWhereInput | boolean
    delete?: WeightGoalWhereInput | boolean
    connect?: WeightGoalWhereUniqueInput
    update?: XOR<XOR<WeightGoalUpdateToOneWithWhereWithoutUserInput, WeightGoalUpdateWithoutUserInput>, WeightGoalUncheckedUpdateWithoutUserInput>
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    upsert?: UserUpsertWithoutAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserCreateNestedOneWithoutWorkoutSessionsInput = {
    create?: XOR<UserCreateWithoutWorkoutSessionsInput, UserUncheckedCreateWithoutWorkoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWorkoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type WorkoutExerciseCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
  }

  export type WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutWorkoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutWorkoutSessionsInput, UserUncheckedCreateWithoutWorkoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWorkoutSessionsInput
    upsert?: UserUpsertWithoutWorkoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWorkoutSessionsInput, UserUpdateWithoutWorkoutSessionsInput>, UserUncheckedUpdateWithoutWorkoutSessionsInput>
  }

  export type WorkoutExerciseUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    set?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    disconnect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    delete?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    update?: WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutExerciseUpdateManyWithWhereWithoutSessionInput | WorkoutExerciseUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
  }

  export type WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    set?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    disconnect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    delete?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    update?: WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutExerciseUpdateManyWithWhereWithoutSessionInput | WorkoutExerciseUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
  }

  export type WorkoutSessionCreateNestedOneWithoutExercisesInput = {
    create?: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutExercisesInput
    connect?: WorkoutSessionWhereUniqueInput
  }

  export type WorkoutSessionUpdateOneRequiredWithoutExercisesNestedInput = {
    create?: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutExercisesInput
    upsert?: WorkoutSessionUpsertWithoutExercisesInput
    connect?: WorkoutSessionWhereUniqueInput
    update?: XOR<XOR<WorkoutSessionUpdateToOneWithWhereWithoutExercisesInput, WorkoutSessionUpdateWithoutExercisesInput>, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
  }

  export type UserCreateNestedOneWithoutNutritionGoalInput = {
    create?: XOR<UserCreateWithoutNutritionGoalInput, UserUncheckedCreateWithoutNutritionGoalInput>
    connectOrCreate?: UserCreateOrConnectWithoutNutritionGoalInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutNutritionGoalNestedInput = {
    create?: XOR<UserCreateWithoutNutritionGoalInput, UserUncheckedCreateWithoutNutritionGoalInput>
    connectOrCreate?: UserCreateOrConnectWithoutNutritionGoalInput
    upsert?: UserUpsertWithoutNutritionGoalInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNutritionGoalInput, UserUpdateWithoutNutritionGoalInput>, UserUncheckedUpdateWithoutNutritionGoalInput>
  }

  export type UserCreateNestedOneWithoutMealLogsInput = {
    create?: XOR<UserCreateWithoutMealLogsInput, UserUncheckedCreateWithoutMealLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMealLogsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumMealFieldUpdateOperationsInput = {
    set?: $Enums.Meal
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutMealLogsNestedInput = {
    create?: XOR<UserCreateWithoutMealLogsInput, UserUncheckedCreateWithoutMealLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMealLogsInput
    upsert?: UserUpsertWithoutMealLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMealLogsInput, UserUpdateWithoutMealLogsInput>, UserUncheckedUpdateWithoutMealLogsInput>
  }

  export type UserCreateNestedOneWithoutWeightLogsInput = {
    create?: XOR<UserCreateWithoutWeightLogsInput, UserUncheckedCreateWithoutWeightLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWeightLogsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutWeightLogsNestedInput = {
    create?: XOR<UserCreateWithoutWeightLogsInput, UserUncheckedCreateWithoutWeightLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWeightLogsInput
    upsert?: UserUpsertWithoutWeightLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWeightLogsInput, UserUpdateWithoutWeightLogsInput>, UserUncheckedUpdateWithoutWeightLogsInput>
  }

  export type UserCreateNestedOneWithoutWeightGoalInput = {
    create?: XOR<UserCreateWithoutWeightGoalInput, UserUncheckedCreateWithoutWeightGoalInput>
    connectOrCreate?: UserCreateOrConnectWithoutWeightGoalInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutWeightGoalNestedInput = {
    create?: XOR<UserCreateWithoutWeightGoalInput, UserUncheckedCreateWithoutWeightGoalInput>
    connectOrCreate?: UserCreateOrConnectWithoutWeightGoalInput
    upsert?: UserUpsertWithoutWeightGoalInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWeightGoalInput, UserUpdateWithoutWeightGoalInput>, UserUncheckedUpdateWithoutWeightGoalInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumMealFilter<$PrismaModel = never> = {
    equals?: $Enums.Meal | EnumMealFieldRefInput<$PrismaModel>
    in?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    notIn?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    not?: NestedEnumMealFilter<$PrismaModel> | $Enums.Meal
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedEnumMealWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Meal | EnumMealFieldRefInput<$PrismaModel>
    in?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    notIn?: $Enums.Meal[] | ListEnumMealFieldRefInput<$PrismaModel>
    not?: NestedEnumMealWithAggregatesFilter<$PrismaModel> | $Enums.Meal
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMealFilter<$PrismaModel>
    _max?: NestedEnumMealFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AccountCreateWithoutUserInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountUncheckedCreateWithoutUserInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountCreateOrConnectWithoutUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountCreateManyUserInputEnvelope = {
    data: AccountCreateManyUserInput | AccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WorkoutSessionCreateWithoutUserInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    exercises?: WorkoutExerciseCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUncheckedCreateWithoutUserInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    exercises?: WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionCreateOrConnectWithoutUserInput = {
    where: WorkoutSessionWhereUniqueInput
    create: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput>
  }

  export type WorkoutSessionCreateManyUserInputEnvelope = {
    data: WorkoutSessionCreateManyUserInput | WorkoutSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserProfileCreateWithoutUserInput = {
    id?: string
    goalId?: string | null
    weightKg?: Decimal | DecimalJsLike | number | string | null
    heightCm?: number | null
    age?: number | null
    updatedAt?: Date | string
  }

  export type UserProfileUncheckedCreateWithoutUserInput = {
    id?: string
    goalId?: string | null
    weightKg?: Decimal | DecimalJsLike | number | string | null
    heightCm?: number | null
    age?: number | null
    updatedAt?: Date | string
  }

  export type UserProfileCreateOrConnectWithoutUserInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
  }

  export type NutritionGoalCreateWithoutUserInput = {
    id?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt?: Date | string
  }

  export type NutritionGoalUncheckedCreateWithoutUserInput = {
    id?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    updatedAt?: Date | string
  }

  export type NutritionGoalCreateOrConnectWithoutUserInput = {
    where: NutritionGoalWhereUniqueInput
    create: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
  }

  export type MealLogCreateWithoutUserInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
  }

  export type MealLogUncheckedCreateWithoutUserInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
  }

  export type MealLogCreateOrConnectWithoutUserInput = {
    where: MealLogWhereUniqueInput
    create: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput>
  }

  export type MealLogCreateManyUserInputEnvelope = {
    data: MealLogCreateManyUserInput | MealLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WeightLogCreateWithoutUserInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
  }

  export type WeightLogUncheckedCreateWithoutUserInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
  }

  export type WeightLogCreateOrConnectWithoutUserInput = {
    where: WeightLogWhereUniqueInput
    create: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput>
  }

  export type WeightLogCreateManyUserInputEnvelope = {
    data: WeightLogCreateManyUserInput | WeightLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WeightGoalCreateWithoutUserInput = {
    id?: string
    goalWeight: Decimal | DecimalJsLike | number | string
    startWeight: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type WeightGoalUncheckedCreateWithoutUserInput = {
    id?: string
    goalWeight: Decimal | DecimalJsLike | number | string
    startWeight: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type WeightGoalCreateOrConnectWithoutUserInput = {
    where: WeightGoalWhereUniqueInput
    create: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    token?: StringFilter<"Session"> | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
  }

  export type AccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
  }

  export type AccountUpdateManyWithWhereWithoutUserInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    id?: StringFilter<"Account"> | string
    accountId?: StringFilter<"Account"> | string
    providerId?: StringFilter<"Account"> | string
    accessToken?: StringNullableFilter<"Account"> | string | null
    refreshToken?: StringNullableFilter<"Account"> | string | null
    idToken?: StringNullableFilter<"Account"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    password?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    userId?: StringFilter<"Account"> | string
  }

  export type WorkoutSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: WorkoutSessionWhereUniqueInput
    update: XOR<WorkoutSessionUpdateWithoutUserInput, WorkoutSessionUncheckedUpdateWithoutUserInput>
    create: XOR<WorkoutSessionCreateWithoutUserInput, WorkoutSessionUncheckedCreateWithoutUserInput>
  }

  export type WorkoutSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: WorkoutSessionWhereUniqueInput
    data: XOR<WorkoutSessionUpdateWithoutUserInput, WorkoutSessionUncheckedUpdateWithoutUserInput>
  }

  export type WorkoutSessionUpdateManyWithWhereWithoutUserInput = {
    where: WorkoutSessionScalarWhereInput
    data: XOR<WorkoutSessionUpdateManyMutationInput, WorkoutSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type WorkoutSessionScalarWhereInput = {
    AND?: WorkoutSessionScalarWhereInput | WorkoutSessionScalarWhereInput[]
    OR?: WorkoutSessionScalarWhereInput[]
    NOT?: WorkoutSessionScalarWhereInput | WorkoutSessionScalarWhereInput[]
    id?: StringFilter<"WorkoutSession"> | string
    startedAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    completedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutSession"> | string | null
    userId?: StringFilter<"WorkoutSession"> | string
  }

  export type UserProfileUpsertWithoutUserInput = {
    update: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalId?: NullableStringFieldUpdateOperationsInput | string | null
    weightKg?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    heightCm?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionGoalUpsertWithoutUserInput = {
    update: XOR<NutritionGoalUpdateWithoutUserInput, NutritionGoalUncheckedUpdateWithoutUserInput>
    create: XOR<NutritionGoalCreateWithoutUserInput, NutritionGoalUncheckedCreateWithoutUserInput>
    where?: NutritionGoalWhereInput
  }

  export type NutritionGoalUpdateToOneWithWhereWithoutUserInput = {
    where?: NutritionGoalWhereInput
    data: XOR<NutritionGoalUpdateWithoutUserInput, NutritionGoalUncheckedUpdateWithoutUserInput>
  }

  export type NutritionGoalUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionGoalUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    calories?: IntFieldUpdateOperationsInput | number
    protein?: IntFieldUpdateOperationsInput | number
    carbs?: IntFieldUpdateOperationsInput | number
    fat?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealLogUpsertWithWhereUniqueWithoutUserInput = {
    where: MealLogWhereUniqueInput
    update: XOR<MealLogUpdateWithoutUserInput, MealLogUncheckedUpdateWithoutUserInput>
    create: XOR<MealLogCreateWithoutUserInput, MealLogUncheckedCreateWithoutUserInput>
  }

  export type MealLogUpdateWithWhereUniqueWithoutUserInput = {
    where: MealLogWhereUniqueInput
    data: XOR<MealLogUpdateWithoutUserInput, MealLogUncheckedUpdateWithoutUserInput>
  }

  export type MealLogUpdateManyWithWhereWithoutUserInput = {
    where: MealLogScalarWhereInput
    data: XOR<MealLogUpdateManyMutationInput, MealLogUncheckedUpdateManyWithoutUserInput>
  }

  export type MealLogScalarWhereInput = {
    AND?: MealLogScalarWhereInput | MealLogScalarWhereInput[]
    OR?: MealLogScalarWhereInput[]
    NOT?: MealLogScalarWhereInput | MealLogScalarWhereInput[]
    id?: StringFilter<"MealLog"> | string
    logDate?: DateTimeFilter<"MealLog"> | Date | string
    meal?: EnumMealFilter<"MealLog"> | $Enums.Meal
    name?: StringFilter<"MealLog"> | string
    cal?: IntFilter<"MealLog"> | number
    protein?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    fat?: DecimalFilter<"MealLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"MealLog"> | string
  }

  export type WeightLogUpsertWithWhereUniqueWithoutUserInput = {
    where: WeightLogWhereUniqueInput
    update: XOR<WeightLogUpdateWithoutUserInput, WeightLogUncheckedUpdateWithoutUserInput>
    create: XOR<WeightLogCreateWithoutUserInput, WeightLogUncheckedCreateWithoutUserInput>
  }

  export type WeightLogUpdateWithWhereUniqueWithoutUserInput = {
    where: WeightLogWhereUniqueInput
    data: XOR<WeightLogUpdateWithoutUserInput, WeightLogUncheckedUpdateWithoutUserInput>
  }

  export type WeightLogUpdateManyWithWhereWithoutUserInput = {
    where: WeightLogScalarWhereInput
    data: XOR<WeightLogUpdateManyMutationInput, WeightLogUncheckedUpdateManyWithoutUserInput>
  }

  export type WeightLogScalarWhereInput = {
    AND?: WeightLogScalarWhereInput | WeightLogScalarWhereInput[]
    OR?: WeightLogScalarWhereInput[]
    NOT?: WeightLogScalarWhereInput | WeightLogScalarWhereInput[]
    id?: StringFilter<"WeightLog"> | string
    logDate?: DateTimeFilter<"WeightLog"> | Date | string
    weight?: DecimalFilter<"WeightLog"> | Decimal | DecimalJsLike | number | string
    userId?: StringFilter<"WeightLog"> | string
  }

  export type WeightGoalUpsertWithoutUserInput = {
    update: XOR<WeightGoalUpdateWithoutUserInput, WeightGoalUncheckedUpdateWithoutUserInput>
    create: XOR<WeightGoalCreateWithoutUserInput, WeightGoalUncheckedCreateWithoutUserInput>
    where?: WeightGoalWhereInput
  }

  export type WeightGoalUpdateToOneWithWhereWithoutUserInput = {
    where?: WeightGoalWhereInput
    data: XOR<WeightGoalUpdateWithoutUserInput, WeightGoalUncheckedUpdateWithoutUserInput>
  }

  export type WeightGoalUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightGoalUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    goalWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    startWeight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutAccountsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAccountsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
  }

  export type UserUpsertWithoutAccountsInput = {
    update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutWorkoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWorkoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWorkoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWorkoutSessionsInput, UserUncheckedCreateWithoutWorkoutSessionsInput>
  }

  export type WorkoutExerciseCreateWithoutSessionInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseUncheckedCreateWithoutSessionInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseCreateOrConnectWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    create: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutExerciseCreateManySessionInputEnvelope = {
    data: WorkoutExerciseCreateManySessionInput | WorkoutExerciseCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutWorkoutSessionsInput = {
    update: XOR<UserUpdateWithoutWorkoutSessionsInput, UserUncheckedUpdateWithoutWorkoutSessionsInput>
    create: XOR<UserCreateWithoutWorkoutSessionsInput, UserUncheckedCreateWithoutWorkoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWorkoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWorkoutSessionsInput, UserUncheckedUpdateWithoutWorkoutSessionsInput>
  }

  export type UserUpdateWithoutWorkoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWorkoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    update: XOR<WorkoutExerciseUpdateWithoutSessionInput, WorkoutExerciseUncheckedUpdateWithoutSessionInput>
    create: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    data: XOR<WorkoutExerciseUpdateWithoutSessionInput, WorkoutExerciseUncheckedUpdateWithoutSessionInput>
  }

  export type WorkoutExerciseUpdateManyWithWhereWithoutSessionInput = {
    where: WorkoutExerciseScalarWhereInput
    data: XOR<WorkoutExerciseUpdateManyMutationInput, WorkoutExerciseUncheckedUpdateManyWithoutSessionInput>
  }

  export type WorkoutExerciseScalarWhereInput = {
    AND?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
    OR?: WorkoutExerciseScalarWhereInput[]
    NOT?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
    id?: StringFilter<"WorkoutExercise"> | string
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    sets?: JsonFilter<"WorkoutExercise">
    sessionId?: StringFilter<"WorkoutExercise"> | string
  }

  export type WorkoutSessionCreateWithoutExercisesInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    user: UserCreateNestedOneWithoutWorkoutSessionsInput
  }

  export type WorkoutSessionUncheckedCreateWithoutExercisesInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
    userId: string
  }

  export type WorkoutSessionCreateOrConnectWithoutExercisesInput = {
    where: WorkoutSessionWhereUniqueInput
    create: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
  }

  export type WorkoutSessionUpsertWithoutExercisesInput = {
    update: XOR<WorkoutSessionUpdateWithoutExercisesInput, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
    create: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    where?: WorkoutSessionWhereInput
  }

  export type WorkoutSessionUpdateToOneWithWhereWithoutExercisesInput = {
    where?: WorkoutSessionWhereInput
    data: XOR<WorkoutSessionUpdateWithoutExercisesInput, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
  }

  export type WorkoutSessionUpdateWithoutExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutWorkoutSessionsNestedInput
  }

  export type WorkoutSessionUncheckedUpdateWithoutExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateWithoutNutritionGoalInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutNutritionGoalInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutNutritionGoalInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNutritionGoalInput, UserUncheckedCreateWithoutNutritionGoalInput>
  }

  export type UserUpsertWithoutNutritionGoalInput = {
    update: XOR<UserUpdateWithoutNutritionGoalInput, UserUncheckedUpdateWithoutNutritionGoalInput>
    create: XOR<UserCreateWithoutNutritionGoalInput, UserUncheckedCreateWithoutNutritionGoalInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNutritionGoalInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNutritionGoalInput, UserUncheckedUpdateWithoutNutritionGoalInput>
  }

  export type UserUpdateWithoutNutritionGoalInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutNutritionGoalInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutMealLogsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMealLogsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMealLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMealLogsInput, UserUncheckedCreateWithoutMealLogsInput>
  }

  export type UserUpsertWithoutMealLogsInput = {
    update: XOR<UserUpdateWithoutMealLogsInput, UserUncheckedUpdateWithoutMealLogsInput>
    create: XOR<UserCreateWithoutMealLogsInput, UserUncheckedCreateWithoutMealLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMealLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMealLogsInput, UserUncheckedUpdateWithoutMealLogsInput>
  }

  export type UserUpdateWithoutMealLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMealLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutWeightLogsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWeightLogsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightGoal?: WeightGoalUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWeightLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWeightLogsInput, UserUncheckedCreateWithoutWeightLogsInput>
  }

  export type UserUpsertWithoutWeightLogsInput = {
    update: XOR<UserUpdateWithoutWeightLogsInput, UserUncheckedUpdateWithoutWeightLogsInput>
    create: XOR<UserCreateWithoutWeightLogsInput, UserUncheckedCreateWithoutWeightLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWeightLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWeightLogsInput, UserUncheckedUpdateWithoutWeightLogsInput>
  }

  export type UserUpdateWithoutWeightLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWeightLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightGoal?: WeightGoalUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutWeightGoalInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AccountCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalCreateNestedOneWithoutUserInput
    mealLogs?: MealLogCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWeightGoalInput = {
    id?: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    workoutSessions?: WorkoutSessionUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    nutritionGoal?: NutritionGoalUncheckedCreateNestedOneWithoutUserInput
    mealLogs?: MealLogUncheckedCreateNestedManyWithoutUserInput
    weightLogs?: WeightLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWeightGoalInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWeightGoalInput, UserUncheckedCreateWithoutWeightGoalInput>
  }

  export type UserUpsertWithoutWeightGoalInput = {
    update: XOR<UserUpdateWithoutWeightGoalInput, UserUncheckedUpdateWithoutWeightGoalInput>
    create: XOR<UserCreateWithoutWeightGoalInput, UserUncheckedCreateWithoutWeightGoalInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWeightGoalInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWeightGoalInput, UserUncheckedUpdateWithoutWeightGoalInput>
  }

  export type UserUpdateWithoutWeightGoalInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AccountUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWeightGoalInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    workoutSessions?: WorkoutSessionUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    nutritionGoal?: NutritionGoalUncheckedUpdateOneWithoutUserNestedInput
    mealLogs?: MealLogUncheckedUpdateManyWithoutUserNestedInput
    weightLogs?: WeightLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SessionCreateManyUserInput = {
    id?: string
    expiresAt: Date | string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountCreateManyUserInput = {
    id?: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkoutSessionCreateManyUserInput = {
    id?: string
    startedAt?: Date | string
    completedAt?: Date | string | null
    notes?: string | null
  }

  export type MealLogCreateManyUserInput = {
    id?: string
    logDate: Date | string
    meal: $Enums.Meal
    name: string
    cal: number
    protein: Decimal | DecimalJsLike | number | string
    carbs: Decimal | DecimalJsLike | number | string
    fat: Decimal | DecimalJsLike | number | string
  }

  export type WeightLogCreateManyUserInput = {
    id?: string
    logDate: Date | string
    weight: Decimal | DecimalJsLike | number | string
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkoutSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: WorkoutExerciseUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MealLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type MealLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type MealLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    meal?: EnumMealFieldUpdateOperationsInput | $Enums.Meal
    name?: StringFieldUpdateOperationsInput | string
    cal?: IntFieldUpdateOperationsInput | number
    protein?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    carbs?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type WeightLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type WeightLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type WeightLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    logDate?: DateTimeFieldUpdateOperationsInput | Date | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type WorkoutExerciseCreateManySessionInput = {
    id?: string
    exerciseName: string
    sets: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
  }

  export type WorkoutExerciseUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciseName?: StringFieldUpdateOperationsInput | string
    sets?: JsonNullValueInput | InputJsonValue
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}