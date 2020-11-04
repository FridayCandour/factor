import { sortPriority } from "@factor/api/utils"
import Vue from "vue"
import { omit } from "./utils-lodash"

export type FilterCallbacks = Record<string, CallbackItem>

/**
 * Store the filters on the global Vue object
 * The filters need to be retained on server resets
 */
declare module "vue/types/vue" {
  export interface VueConstructor {
    $filters: GlobalFilterObject
  }
}

type FilterRecord = Record<string, FilterCallbacks>

interface HookItem {
  hook: string
  key: string
  priority?: number
}

interface FilterItem extends HookItem {
  callback: (input: any, _arguments: any) => any
}

interface CallbackItem extends HookItem {
  callback: (...a: any[]) => any
}

interface GlobalFilterObject {
  filters: FilterRecord
  applied: FilterRecord
  controllers: FilterRecord
}

/**
 * Get globally set filter functions
 * @remarks
 * The globals must not get destroyed with a hot server restart
 */
export const getGlobals = (): GlobalFilterObject => {
  // Use global value as filters need to remain in tact
  // even after all modules are purged on server resets
  if (!Vue.$filters) {
    Vue.$filters = {
      filters: {},
      applied: {},
      controllers: {},
    }
  }

  return Vue.$filters
}

/**
 * Gets all items attached to a specific hook ID
 * @param hook - hook ID
 */
export const getFilters = (
  hook: string,
  ...rest: any[]
): Record<string, CallbackItem> => {
  const { filters, controllers } = getGlobals()
  if (!filters[hook]) {
    filters[hook] = {}
  }

  let hooks = filters[hook]

  // Allow for filter control using global in special cases
  // This allows special builds and multi-builds to control how filters are applied
  if (controllers && controllers[hook]) {
    const controllerCbs = Object.values(controllers[hook]).map(
      (_) => _.callback,
    )
    for (const controller of controllerCbs) {
      const result = controller(hooks, ...rest)
      if (typeof result !== "undefined") {
        hooks = result
      }
    }
  }

  return hooks
}

export const getApplied = (): FilterRecord => {
  const { applied } = getGlobals()
  return applied
}

/**
 * Adds filter config to the global object
 */
const setFilter = ({
  hook,
  key,
  callback,
  priority,
}: CallbackItem): Record<string, any> => {
  const { filters } = getGlobals()
  if (!filters[hook]) filters[hook] = {}

  filters[hook][key] = { hook, key, callback, priority }

  return filters[hook]
}

/**
 * Gets the number of filters/hooks/callbacks that have been added to an ID
 * @param hook - hook ID
 */
export const getFilterCount = (hook: string): number => {
  const added = getFilters(hook)

  return added && Object.keys(added).length > 0 ? Object.keys(added).length : 0
}

/**
 * Apply function callbacks that are hooked to an identifier when and fired with this function.
 * Data is passed sequentially from one callback to the next
 *
 * @param hook - unique identifier for the hook item, can be callback, filter, action
 * @param data - data to pass through the filters or callbacks
 * @param rest - additional arguments
 */
export const applyFilters = <U>(
  hook: string,
  data: U,
  ...rest: any[]
): typeof data => {
  const _added = getFilters(hook, ...rest) // Get Filters Added

  const filterKeys = Object.keys(_added)
  const numFilters = filterKeys.length

  // Thread through filters if they exist
  if (_added && numFilters > 0) {
    const _addedArray = filterKeys.map((key) => _added[key])
    const _sorted = sortPriority(_addedArray)

    for (const element of _sorted) {
      const { callback } = element
      const result = callback(data, ...rest)

      // Add into what is passed into next item
      // If nothing is returned, don't unset the original data
      if (typeof result !== "undefined") {
        data = result
      }
    }
  }

  // Sort priority if array is returned
  if (Array.isArray(data)) {
    data = sortPriority(data)
  }
  return data
}

/**
 * Add a filter to data provided to 'applyFilters'
 * Uses a hook Id and receives the parameters provided to that function
 *
 * @param hook - the Hook ID
 * @param callback - the filter callback, must return the end result
 * @param key - a unique cache identifier for the hooked item
 */
export const addFilter = (options: FilterItem): void => {
  let { callback } = options
  const rest = omit(options, ["callback"])

  // For simpler assignments where no callback is needed
  callback =
    typeof callback != "function" ? (): typeof callback => callback : callback

  setFilter({ ...rest, callback })

  return
}

/**
 * Helper function
 * Adds an item/object to the end of an array provided to a filter.
 * Only works with array based filters
 *
 * @param item - the item to add to the array
 * @param hook = the hook ID
 * @param key - a unique cache identifier for the hooked item
 */
export const pushToFilter = <T>(options: HookItem & { item: T }): void => {
  let { item } = options
  const rest = omit(options, ["item"])
  addFilter({
    ...rest,
    callback: (input: T[], ...args: any[]): T[] => {
      item = typeof item == "function" ? item(...args) : item

      return [...input, item]
    },
  })

  return
}

/**
 * Helper function
 * Push a callback to an array of callbacks
 * @param callback - the callback to add
 * @param hook - the hook ID
 * @param key - a unique cache identifier for the hooked item
 */
export const addCallback = (options: CallbackItem): void => {
  const { callback, ...rest } = options

  addFilter({
    ...rest,
    callback: (_: ((...a: any[]) => any)[] = [], ...args: any[]) => [
      ..._,
      callback(...args),
    ],
  })

  return
}

export const addController = (options: FilterItem): void => {
  const { hook, key } = options

  const { controllers } = getGlobals()
  if (!controllers[hook]) {
    controllers[hook] = {}
  }

  controllers[hook][key] = options

  return
}

/**
 * Run array of promises and await the result
 * @param hook - the hook ID
 * @param _arguments - arguments to pass to callbacks
 */
export const runCallbacks = async <T = unknown>(
  hook: string,
  ..._arguments: any[]
): Promise<T[]> => {
  const _promises: PromiseLike<T>[] = applyFilters(hook, [], ..._arguments)

  return await Promise.all(_promises)
}

// Use the function that called the filter in the key
// this prevents issues where two filters in different may match each other
// which causes difficult to solve bugs (data-schemas is an example)
const callerKey = (): string => {
  const error = new Error()

  let stacker = "no-stack"
  if (error && error.stack) {
    const line = error.stack
      .toString()
      .split("(")
      .find((line) => !line.match(/(filter|Error)/))

    if (line) {
      stacker = line.slice(0, Math.max(0, line.indexOf(":")))
    }
  }

  return stacker
}
