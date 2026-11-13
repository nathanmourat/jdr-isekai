--!nocheck
-- Fichier GÉNÉRÉ par `npm run moteur` à partir de src/moteur (TypeScript). Ne pas modifier à la main.
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]

local ____modules = {}
local ____moduleCache = {}
local ____originalRequire = require
local function require(file, ...)
    if ____moduleCache[file] then
        return ____moduleCache[file].value
    end
    if ____modules[file] then
        local module = ____modules[file]
        local value = nil
        if (select("#", ...) > 0) then value = module(...) else value = module(file) end
        ____moduleCache[file] = { value = value }
        return value
    else
        if ____originalRequire then
            return ____originalRequire(file)
        else
            error("module '" .. file .. "' not found")
        end
    end
end
____modules = {
["lualib_bundle"] = function(...) 
local function __TS__ArrayAt(self, relativeIndex)
    local absoluteIndex = relativeIndex < 0 and #self + relativeIndex or relativeIndex
    if absoluteIndex >= 0 and absoluteIndex < #self then
        return self[absoluteIndex + 1]
    end
    return nil
end

local function __TS__ArrayIsArray(value)
    return type(value) == "table" and (value[1] ~= nil or next(value) == nil)
end

local function __TS__ArrayConcat(self, ...)
    local items = {...}
    local result = {}
    local len = 0
    for i = 1, #self do
        len = len + 1
        result[len] = self[i]
    end
    for i = 1, #items do
        local item = items[i]
        if __TS__ArrayIsArray(item) then
            for j = 1, #item do
                len = len + 1
                result[len] = item[j]
            end
        else
            len = len + 1
            result[len] = item
        end
    end
    return result
end

local __TS__Symbol, Symbol
do
    local symbolMetatable = {__tostring = function(self)
        return ("Symbol(" .. (self.description or "")) .. ")"
    end}
    function __TS__Symbol(description)
        return setmetatable({description = description}, symbolMetatable)
    end
    Symbol = {
        asyncDispose = __TS__Symbol("Symbol.asyncDispose"),
        dispose = __TS__Symbol("Symbol.dispose"),
        iterator = __TS__Symbol("Symbol.iterator"),
        hasInstance = __TS__Symbol("Symbol.hasInstance"),
        species = __TS__Symbol("Symbol.species"),
        toStringTag = __TS__Symbol("Symbol.toStringTag")
    }
end

local function __TS__ArrayEntries(array)
    local key = 0
    return {
        [Symbol.iterator] = function(self)
            return self
        end,
        next = function(self)
            local result = {done = array[key + 1] == nil, value = {key, array[key + 1]}}
            key = key + 1
            return result
        end
    }
end

local function __TS__ArrayEvery(self, callbackfn, thisArg)
    for i = 1, #self do
        if not callbackfn(thisArg, self[i], i - 1, self) then
            return false
        end
    end
    return true
end

local function __TS__ArrayFill(self, value, start, ____end)
    local relativeStart = start or 0
    local relativeEnd = ____end or #self
    if relativeStart < 0 then
        relativeStart = relativeStart + #self
    end
    if relativeEnd < 0 then
        relativeEnd = relativeEnd + #self
    end
    do
        local i = relativeStart
        while i < relativeEnd do
            self[i + 1] = value
            i = i + 1
        end
    end
    return self
end

local function __TS__ArrayFilter(self, callbackfn, thisArg)
    local result = {}
    local len = 0
    for i = 1, #self do
        if callbackfn(thisArg, self[i], i - 1, self) then
            len = len + 1
            result[len] = self[i]
        end
    end
    return result
end

local function __TS__ArrayForEach(self, callbackFn, thisArg)
    for i = 1, #self do
        callbackFn(thisArg, self[i], i - 1, self)
    end
end

local function __TS__ArrayFind(self, predicate, thisArg)
    for i = 1, #self do
        local elem = self[i]
        if predicate(thisArg, elem, i - 1, self) then
            return elem
        end
    end
    return nil
end

local function __TS__ArrayFindIndex(self, callbackFn, thisArg)
    for i = 1, #self do
        if callbackFn(thisArg, self[i], i - 1, self) then
            return i - 1
        end
    end
    return -1
end

local __TS__Iterator
do
    local function iteratorGeneratorStep(self)
        local co = self.____coroutine
        local status, value = coroutine.resume(co)
        if not status then
            error(value, 0)
        end
        if coroutine.status(co) == "dead" then
            return
        end
        return true, value
    end
    local function iteratorIteratorStep(self)
        local result = self:next()
        if result.done then
            return
        end
        return true, result.value
    end
    local function iteratorStringStep(self, index)
        index = index + 1
        if index > #self then
            return
        end
        return index, string.sub(self, index, index)
    end
    function __TS__Iterator(iterable)
        if type(iterable) == "string" then
            return iteratorStringStep, iterable, 0
        elseif iterable.____coroutine ~= nil then
            return iteratorGeneratorStep, iterable
        elseif iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            return iteratorIteratorStep, iterator
        else
            return ipairs(iterable)
        end
    end
end

local __TS__ArrayFrom
do
    local function arrayLikeStep(self, index)
        index = index + 1
        if index > self.length then
            return
        end
        return index, self[index]
    end
    local function arrayLikeIterator(arr)
        if type(arr.length) == "number" then
            return arrayLikeStep, arr, 0
        end
        return __TS__Iterator(arr)
    end
    function __TS__ArrayFrom(arrayLike, mapFn, thisArg)
        local result = {}
        if mapFn == nil then
            for ____, v in arrayLikeIterator(arrayLike) do
                result[#result + 1] = v
            end
        else
            local i = 0
            for ____, v in arrayLikeIterator(arrayLike) do
                local ____mapFn_3 = mapFn
                local ____thisArg_1 = thisArg
                local ____v_2 = v
                local ____i_0 = i
                i = ____i_0 + 1
                result[#result + 1] = ____mapFn_3(____thisArg_1, ____v_2, ____i_0)
            end
        end
        return result
    end
end

local function __TS__ArrayIncludes(self, searchElement, fromIndex)
    if fromIndex == nil then
        fromIndex = 0
    end
    local len = #self
    local k = fromIndex
    if fromIndex < 0 then
        k = len + fromIndex
    end
    if k < 0 then
        k = 0
    end
    for i = k + 1, len do
        if self[i] == searchElement then
            return true
        end
    end
    return false
end

local function __TS__ArrayIndexOf(self, searchElement, fromIndex)
    if fromIndex == nil then
        fromIndex = 0
    end
    local len = #self
    if len == 0 then
        return -1
    end
    if fromIndex >= len then
        return -1
    end
    if fromIndex < 0 then
        fromIndex = len + fromIndex
        if fromIndex < 0 then
            fromIndex = 0
        end
    end
    for i = fromIndex + 1, len do
        if self[i] == searchElement then
            return i - 1
        end
    end
    return -1
end

local function __TS__ArrayJoin(self, separator)
    if separator == nil then
        separator = ","
    end
    local parts = {}
    for i = 1, #self do
        parts[i] = tostring(self[i])
    end
    return table.concat(parts, separator)
end

local function __TS__ArrayMap(self, callbackfn, thisArg)
    local result = {}
    for i = 1, #self do
        result[i] = callbackfn(thisArg, self[i], i - 1, self)
    end
    return result
end

local function __TS__ArrayPush(self, ...)
    local items = {...}
    local len = #self
    for i = 1, #items do
        len = len + 1
        self[len] = items[i]
    end
    return len
end

local function __TS__ArrayPushArray(self, items)
    local len = #self
    for i = 1, #items do
        len = len + 1
        self[len] = items[i]
    end
    return len
end

local function __TS__CountVarargs(...)
    return select("#", ...)
end

local function __TS__ArrayReduce(self, callbackFn, ...)
    local len = #self
    local k = 0
    local accumulator = nil
    if __TS__CountVarargs(...) ~= 0 then
        accumulator = ...
    elseif len > 0 then
        accumulator = self[1]
        k = 1
    else
        error("Reduce of empty array with no initial value", 0)
    end
    for i = k + 1, len do
        accumulator = callbackFn(
            nil,
            accumulator,
            self[i],
            i - 1,
            self
        )
    end
    return accumulator
end

local function __TS__ArrayReduceRight(self, callbackFn, ...)
    local len = #self
    local k = len - 1
    local accumulator = nil
    if __TS__CountVarargs(...) ~= 0 then
        accumulator = ...
    elseif len > 0 then
        accumulator = self[k + 1]
        k = k - 1
    else
        error("Reduce of empty array with no initial value", 0)
    end
    for i = k + 1, 1, -1 do
        accumulator = callbackFn(
            nil,
            accumulator,
            self[i],
            i - 1,
            self
        )
    end
    return accumulator
end

local function __TS__ArrayReverse(self)
    local i = 1
    local j = #self
    while i < j do
        local temp = self[j]
        self[j] = self[i]
        self[i] = temp
        i = i + 1
        j = j - 1
    end
    return self
end

local function __TS__ArrayUnshift(self, ...)
    local items = {...}
    local numItemsToInsert = #items
    if numItemsToInsert == 0 then
        return #self
    end
    for i = #self, 1, -1 do
        self[i + numItemsToInsert] = self[i]
    end
    for i = 1, numItemsToInsert do
        self[i] = items[i]
    end
    return #self
end

local function __TS__ArraySort(self, compareFn)
    if compareFn ~= nil then
        table.sort(
            self,
            function(a, b) return compareFn(nil, a, b) < 0 end
        )
    else
        table.sort(self)
    end
    return self
end

local function __TS__ArraySlice(self, first, last)
    local len = #self
    first = first or 0
    if first < 0 then
        first = len + first
        if first < 0 then
            first = 0
        end
    else
        if first > len then
            first = len
        end
    end
    last = last or len
    if last < 0 then
        last = len + last
        if last < 0 then
            last = 0
        end
    else
        if last > len then
            last = len
        end
    end
    local out = {}
    first = first + 1
    last = last + 1
    local n = 1
    while first < last do
        out[n] = self[first]
        first = first + 1
        n = n + 1
    end
    return out
end

local function __TS__ArraySome(self, callbackfn, thisArg)
    for i = 1, #self do
        if callbackfn(thisArg, self[i], i - 1, self) then
            return true
        end
    end
    return false
end

local function __TS__ArraySplice(self, ...)
    local args = {...}
    local len = #self
    local actualArgumentCount = __TS__CountVarargs(...)
    local start = args[1]
    local deleteCount = args[2]
    if start < 0 then
        start = len + start
        if start < 0 then
            start = 0
        end
    elseif start > len then
        start = len
    end
    local itemCount = actualArgumentCount - 2
    if itemCount < 0 then
        itemCount = 0
    end
    local actualDeleteCount
    if actualArgumentCount == 0 then
        actualDeleteCount = 0
    elseif actualArgumentCount == 1 then
        actualDeleteCount = len - start
    else
        actualDeleteCount = deleteCount or 0
        if actualDeleteCount < 0 then
            actualDeleteCount = 0
        end
        if actualDeleteCount > len - start then
            actualDeleteCount = len - start
        end
    end
    local out = {}
    for k = 1, actualDeleteCount do
        local from = start + k
        if self[from] ~= nil then
            out[k] = self[from]
        end
    end
    if itemCount < actualDeleteCount then
        for k = start + 1, len - actualDeleteCount do
            local from = k + actualDeleteCount
            local to = k + itemCount
            if self[from] then
                self[to] = self[from]
            else
                self[to] = nil
            end
        end
        for k = len - actualDeleteCount + itemCount + 1, len do
            self[k] = nil
        end
    elseif itemCount > actualDeleteCount then
        for k = len - actualDeleteCount, start + 1, -1 do
            local from = k + actualDeleteCount
            local to = k + itemCount
            if self[from] then
                self[to] = self[from]
            else
                self[to] = nil
            end
        end
    end
    local j = start + 1
    for i = 3, actualArgumentCount do
        self[j] = args[i]
        j = j + 1
    end
    for k = #self, len - actualDeleteCount + itemCount + 1, -1 do
        self[k] = nil
    end
    return out
end

local function __TS__ArrayToObject(self)
    local object = {}
    for i = 1, #self do
        object[i - 1] = self[i]
    end
    return object
end

local function __TS__ArrayFlat(self, depth)
    if depth == nil then
        depth = 1
    end
    local result = {}
    local len = 0
    for i = 1, #self do
        local value = self[i]
        if depth > 0 and __TS__ArrayIsArray(value) then
            local toAdd
            if depth == 1 then
                toAdd = value
            else
                toAdd = __TS__ArrayFlat(value, depth - 1)
            end
            for j = 1, #toAdd do
                local val = toAdd[j]
                len = len + 1
                result[len] = val
            end
        else
            len = len + 1
            result[len] = value
        end
    end
    return result
end

local function __TS__ArrayFlatMap(self, callback, thisArg)
    local result = {}
    local len = 0
    for i = 1, #self do
        local value = callback(thisArg, self[i], i - 1, self)
        if __TS__ArrayIsArray(value) then
            for j = 1, #value do
                len = len + 1
                result[len] = value[j]
            end
        else
            len = len + 1
            result[len] = value
        end
    end
    return result
end

local function __TS__ArraySetLength(self, length)
    if length < 0 or length ~= length or length == math.huge or math.floor(length) ~= length then
        error(
            "invalid array length: " .. tostring(length),
            0
        )
    end
    for i = length + 1, #self do
        self[i] = nil
    end
    return length
end

local __TS__Unpack = table.unpack or unpack

local function __TS__ArrayToReversed(self)
    local copy = {__TS__Unpack(self)}
    __TS__ArrayReverse(copy)
    return copy
end

local function __TS__ArrayToSorted(self, compareFn)
    local copy = {__TS__Unpack(self)}
    __TS__ArraySort(copy, compareFn)
    return copy
end

local function __TS__ArrayToSpliced(self, start, deleteCount, ...)
    local copy = {__TS__Unpack(self)}
    __TS__ArraySplice(copy, start, deleteCount, ...)
    return copy
end

local function __TS__ArrayWith(self, index, value)
    local copy = {__TS__Unpack(self)}
    copy[index + 1] = value
    return copy
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end

local function __TS__InstanceOf(obj, classTbl)
    if type(classTbl) ~= "table" then
        error("Right-hand side of 'instanceof' is not an object", 0)
    end
    if classTbl[Symbol.hasInstance] ~= nil then
        return not not classTbl[Symbol.hasInstance](classTbl, obj)
    end
    if type(obj) == "table" then
        local luaClass = obj.constructor
        while luaClass ~= nil do
            if luaClass == classTbl then
                return true
            end
            luaClass = luaClass.____super
        end
    end
    return false
end

local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local __TS__Promise
do
    local function makeDeferredPromiseFactory()
        local resolve
        local reject
        local function executor(____, res, rej)
            resolve = res
            reject = rej
        end
        return function()
            local promise = __TS__New(__TS__Promise, executor)
            return promise, resolve, reject
        end
    end
    local makeDeferredPromise = makeDeferredPromiseFactory()
    local function isPromiseLike(value)
        return __TS__InstanceOf(value, __TS__Promise)
    end
    local function doNothing(self)
    end
    local ____pcall = pcall
    __TS__Promise = __TS__Class()
    __TS__Promise.name = "__TS__Promise"
    function __TS__Promise.prototype.____constructor(self, executor)
        self.state = 0
        self.fulfilledCallbacks = {}
        self.rejectedCallbacks = {}
        local success, ____error = ____pcall(
            executor,
            nil,
            function(____, v) return self:resolve(v) end,
            function(____, err) return self:reject(err) end
        )
        if not success then
            self:reject(____error)
        end
    end
    function __TS__Promise.resolve(value)
        if __TS__InstanceOf(value, __TS__Promise) then
            return value
        end
        local promise = __TS__New(__TS__Promise, doNothing)
        promise.state = 1
        promise.value = value
        return promise
    end
    function __TS__Promise.reject(reason)
        local promise = __TS__New(__TS__Promise, doNothing)
        promise.state = 2
        promise.rejectionReason = reason
        return promise
    end
    __TS__Promise.prototype["then"] = function(self, onFulfilled, onRejected)
        local promise, resolve, reject = makeDeferredPromise()
        self:addCallbacks(
            onFulfilled and self:createPromiseResolvingCallback(onFulfilled, resolve, reject) or resolve,
            onRejected and self:createPromiseResolvingCallback(onRejected, resolve, reject) or reject
        )
        return promise
    end
    function __TS__Promise.prototype.addCallbacks(self, fulfilledCallback, rejectedCallback)
        if self.state == 1 then
            return fulfilledCallback(nil, self.value)
        end
        if self.state == 2 then
            return rejectedCallback(nil, self.rejectionReason)
        end
        local ____self_fulfilledCallbacks_0 = self.fulfilledCallbacks
        ____self_fulfilledCallbacks_0[#____self_fulfilledCallbacks_0 + 1] = fulfilledCallback
        local ____self_rejectedCallbacks_1 = self.rejectedCallbacks
        ____self_rejectedCallbacks_1[#____self_rejectedCallbacks_1 + 1] = rejectedCallback
    end
    function __TS__Promise.prototype.catch(self, onRejected)
        return self["then"](self, nil, onRejected)
    end
    function __TS__Promise.prototype.finally(self, onFinally)
        if type(onFinally) ~= "function" then
            return self["then"](self, onFinally, onFinally)
        end
        return self["then"](
            self,
            function(____, x)
                local ____self_2 = __TS__New(
                    __TS__Promise,
                    function(____, resolve) return resolve(
                        nil,
                        onFinally(nil)
                    ) end
                )
                return ____self_2["then"](
                    ____self_2,
                    function() return x end
                )
            end,
            function(____, e)
                local ____self_3 = __TS__New(
                    __TS__Promise,
                    function(____, resolve) return resolve(
                        nil,
                        onFinally(nil)
                    ) end
                )
                return ____self_3["then"](
                    ____self_3,
                    function()
                        error(e, 0)
                    end
                )
            end
        )
    end
    function __TS__Promise.prototype.resolve(self, value)
        if isPromiseLike(value) then
            return value:addCallbacks(
                function(____, v) return self:resolve(v) end,
                function(____, err) return self:reject(err) end
            )
        end
        if self.state == 0 then
            self.state = 1
            self.value = value
            return self:invokeCallbacks(self.fulfilledCallbacks, value)
        end
    end
    function __TS__Promise.prototype.reject(self, reason)
        if self.state == 0 then
            self.state = 2
            self.rejectionReason = reason
            return self:invokeCallbacks(self.rejectedCallbacks, reason)
        end
    end
    function __TS__Promise.prototype.invokeCallbacks(self, callbacks, value)
        local callbacksLength = #callbacks
        if callbacksLength ~= 0 then
            for i = 1, callbacksLength - 1 do
                callbacks[i](callbacks, value)
            end
            return callbacks[callbacksLength](callbacks, value)
        end
    end
    function __TS__Promise.prototype.createPromiseResolvingCallback(self, f, resolve, reject)
        return function(____, value)
            local success, resultOrError = ____pcall(f, nil, value)
            if not success then
                return reject(nil, resultOrError)
            end
            return self:handleCallbackValue(resultOrError, resolve, reject)
        end
    end
    function __TS__Promise.prototype.handleCallbackValue(self, value, resolve, reject)
        if isPromiseLike(value) then
            local nextpromise = value
            if nextpromise.state == 1 then
                return resolve(nil, nextpromise.value)
            elseif nextpromise.state == 2 then
                return reject(nil, nextpromise.rejectionReason)
            else
                return nextpromise:addCallbacks(resolve, reject)
            end
        else
            return resolve(nil, value)
        end
    end
end

local __TS__AsyncAwaiter, __TS__Await
do
    local ____coroutine = coroutine or ({})
    local cocreate = ____coroutine.create
    local coresume = ____coroutine.resume
    local costatus = ____coroutine.status
    local coyield = ____coroutine.yield
    function __TS__AsyncAwaiter(generator)
        return __TS__New(
            __TS__Promise,
            function(____, resolve, reject)
                local fulfilled, step, resolved, asyncCoroutine
                function fulfilled(self, value)
                    local success, resultOrError = coresume(asyncCoroutine, value)
                    if success then
                        return step(resultOrError)
                    end
                    return reject(nil, resultOrError)
                end
                function step(result)
                    if resolved then
                        return
                    end
                    if costatus(asyncCoroutine) == "dead" then
                        return resolve(nil, result)
                    end
                    return __TS__Promise.resolve(result):addCallbacks(fulfilled, reject)
                end
                resolved = false
                asyncCoroutine = cocreate(generator)
                local success, resultOrError = coresume(
                    asyncCoroutine,
                    function(____, v)
                        resolved = true
                        return __TS__Promise.resolve(v):addCallbacks(resolve, reject)
                    end
                )
                if success then
                    return step(resultOrError)
                else
                    return reject(nil, resultOrError)
                end
            end
        )
    end
    function __TS__Await(thing)
        return coyield(thing)
    end
end

local function __TS__ClassExtends(target, base)
    target.____super = base
    local staticMetatable = setmetatable({__index = base}, base)
    setmetatable(target, staticMetatable)
    local baseMetatable = getmetatable(base)
    if baseMetatable then
        if type(baseMetatable.__index) == "function" then
            staticMetatable.__index = baseMetatable.__index
        end
        if type(baseMetatable.__newindex) == "function" then
            staticMetatable.__newindex = baseMetatable.__newindex
        end
    end
    setmetatable(target.prototype, base.prototype)
    if type(base.prototype.__index) == "function" then
        target.prototype.__index = base.prototype.__index
    end
    if type(base.prototype.__newindex) == "function" then
        target.prototype.__newindex = base.prototype.__newindex
    end
    if type(base.prototype.__tostring) == "function" then
        target.prototype.__tostring = base.prototype.__tostring
    end
end

local function __TS__CloneDescriptor(____bindingPattern0)
    local value
    local writable
    local set
    local get
    local configurable
    local enumerable
    enumerable = ____bindingPattern0.enumerable
    configurable = ____bindingPattern0.configurable
    get = ____bindingPattern0.get
    set = ____bindingPattern0.set
    writable = ____bindingPattern0.writable
    value = ____bindingPattern0.value
    local descriptor = {enumerable = enumerable == true, configurable = configurable == true}
    local hasGetterOrSetter = get ~= nil or set ~= nil
    local hasValueOrWritableAttribute = writable ~= nil or value ~= nil
    if hasGetterOrSetter and hasValueOrWritableAttribute then
        error("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute.", 0)
    end
    if get or set then
        descriptor.get = get
        descriptor.set = set
    else
        descriptor.value = value
        descriptor.writable = writable == true
    end
    return descriptor
end

local function __TS__Decorate(self, originalValue, decorators, context)
    local result = originalValue
    do
        local i = #decorators
        while i >= 0 do
            local decorator = decorators[i + 1]
            if decorator ~= nil then
                local ____decorator_result_0 = decorator(self, result, context)
                if ____decorator_result_0 == nil then
                    ____decorator_result_0 = result
                end
                result = ____decorator_result_0
            end
            i = i - 1
        end
    end
    return result
end

local function __TS__ObjectAssign(target, ...)
    local sources = {...}
    for i = 1, #sources do
        local source = sources[i]
        if type(source) == "table" then
            for key in pairs(source) do
                target[key] = source[key]
            end
        end
    end
    return target
end

local function __TS__ObjectGetOwnPropertyDescriptor(object, key)
    local metatable = getmetatable(object)
    if not metatable then
        return
    end
    if not rawget(metatable, "_descriptors") then
        return
    end
    return rawget(metatable, "_descriptors")[key]
end

local __TS__DescriptorGet
do
    local getmetatable = getmetatable
    local ____rawget = rawget
    function __TS__DescriptorGet(self, metatable, key)
        while metatable do
            local rawResult = ____rawget(metatable, key)
            if rawResult ~= nil then
                return rawResult
            end
            local descriptors = ____rawget(metatable, "_descriptors")
            if descriptors then
                local descriptor = descriptors[key]
                if descriptor ~= nil then
                    if descriptor.get then
                        return descriptor.get(self)
                    end
                    return descriptor.value
                end
            end
            metatable = getmetatable(metatable)
        end
    end
end

local __TS__DescriptorSet
do
    local getmetatable = getmetatable
    local ____rawget = rawget
    local rawset = rawset
    function __TS__DescriptorSet(self, metatable, key, value)
        while metatable do
            local descriptors = ____rawget(metatable, "_descriptors")
            if descriptors then
                local descriptor = descriptors[key]
                if descriptor ~= nil then
                    if descriptor.set then
                        descriptor.set(self, value)
                    else
                        if descriptor.writable == false then
                            error(
                                ((("Cannot assign to read only property '" .. key) .. "' of object '") .. tostring(self)) .. "'",
                                0
                            )
                        end
                        descriptor.value = value
                    end
                    return
                end
            end
            metatable = getmetatable(metatable)
        end
        rawset(self, key, value)
    end
end

local __TS__SetDescriptor
do
    local getmetatable = getmetatable
    local function descriptorIndex(self, key)
        return __TS__DescriptorGet(
            self,
            getmetatable(self),
            key
        )
    end
    local function descriptorNewIndex(self, key, value)
        return __TS__DescriptorSet(
            self,
            getmetatable(self),
            key,
            value
        )
    end
    function __TS__SetDescriptor(target, key, desc, isPrototype)
        if isPrototype == nil then
            isPrototype = false
        end
        local ____isPrototype_0
        if isPrototype then
            ____isPrototype_0 = target
        else
            ____isPrototype_0 = getmetatable(target)
        end
        local metatable = ____isPrototype_0
        if not metatable then
            metatable = {}
            setmetatable(target, metatable)
        end
        if not isPrototype and not rawget(metatable, "_isOwnDescriptorMetatable") then
            local instanceMetatable = {}
            instanceMetatable._isOwnDescriptorMetatable = true
            setmetatable(instanceMetatable, metatable)
            setmetatable(target, instanceMetatable)
            metatable = instanceMetatable
        end
        local value = rawget(target, key)
        if value ~= nil then
            rawset(target, key, nil)
        end
        if not rawget(metatable, "_descriptors") then
            metatable._descriptors = {}
        end
        metatable._descriptors[key] = __TS__CloneDescriptor(desc)
        metatable.__index = descriptorIndex
        metatable.__newindex = descriptorNewIndex
    end
end

local function __TS__DecorateLegacy(decorators, target, key, desc)
    local result = target
    do
        local i = #decorators
        while i >= 0 do
            local decorator = decorators[i + 1]
            if decorator ~= nil then
                local oldResult = result
                if key == nil then
                    result = decorator(nil, result)
                elseif desc == true then
                    local value = rawget(target, key)
                    local descriptor = __TS__ObjectGetOwnPropertyDescriptor(target, key) or ({configurable = true, writable = true, value = value})
                    local desc = decorator(nil, target, key, descriptor) or descriptor
                    local isSimpleValue = desc.configurable == true and desc.writable == true and not desc.get and not desc.set
                    if isSimpleValue then
                        rawset(target, key, desc.value)
                    else
                        __TS__SetDescriptor(
                            target,
                            key,
                            __TS__ObjectAssign({}, descriptor, desc)
                        )
                    end
                elseif desc == false then
                    result = decorator(nil, target, key, desc)
                else
                    result = decorator(nil, target, key)
                end
                result = result or oldResult
            end
            i = i - 1
        end
    end
    return result
end

local function __TS__DecorateParam(paramIndex, decorator)
    return function(____, target, key) return decorator(nil, target, key, paramIndex) end
end

local function __TS__StringIncludes(self, searchString, position)
    if not position then
        position = 1
    else
        position = position + 1
    end
    local index = string.find(self, searchString, position, true)
    return index ~= nil
end

local Error, RangeError, ReferenceError, SyntaxError, TypeError, URIError
do
    local function getErrorStack(self, constructor)
        if debug == nil or debug.getinfo == nil then
            return nil
        end
        local level = 1
        while true do
            local info = debug.getinfo(level, "f")
            level = level + 1
            if not info then
                level = 1
                break
            elseif info.func == constructor then
                break
            end
        end
        if __TS__StringIncludes(_VERSION, "Lua 5.0") then
            return debug.traceback(("[Level " .. tostring(level)) .. "]")
        elseif _VERSION == "Lua 5.1" then
            return string.sub(
                debug.traceback("", level),
                2
            )
        else
            return debug.traceback(nil, level)
        end
    end
    local function wrapErrorToString(self, getDescription)
        return function(self)
            local description = getDescription(self)
            local caller = debug.getinfo and debug.getinfo(3, "f")
            local isClassicLua = __TS__StringIncludes(_VERSION, "Lua 5.0")
            if isClassicLua or caller and caller.func ~= error then
                return description
            else
                return (description .. "\n") .. tostring(self.stack)
            end
        end
    end
    local function initErrorClass(self, Type, name)
        Type.name = name
        return setmetatable(
            Type,
            {__call = function(____, _self, message) return __TS__New(Type, message) end}
        )
    end
    local ____initErrorClass_1 = initErrorClass
    local ____class_0 = __TS__Class()
    ____class_0.name = ""
    function ____class_0.prototype.____constructor(self, message)
        if message == nil then
            message = ""
        end
        self.message = message
        self.name = "Error"
        self.stack = getErrorStack(nil, __TS__New)
        local metatable = getmetatable(self)
        if metatable and not metatable.__errorToStringPatched then
            metatable.__errorToStringPatched = true
            metatable.__tostring = wrapErrorToString(nil, metatable.__tostring)
        end
    end
    function ____class_0.prototype.__tostring(self)
        return self.message ~= "" and (self.name .. ": ") .. self.message or self.name
    end
    Error = ____initErrorClass_1(nil, ____class_0, "Error")
    local function createErrorClass(self, name)
        local ____initErrorClass_3 = initErrorClass
        local ____class_2 = __TS__Class()
        ____class_2.name = ____class_2.name
        __TS__ClassExtends(____class_2, Error)
        function ____class_2.prototype.____constructor(self, ...)
            ____class_2.____super.prototype.____constructor(self, ...)
            self.name = name
        end
        return ____initErrorClass_3(nil, ____class_2, name)
    end
    RangeError = createErrorClass(nil, "RangeError")
    ReferenceError = createErrorClass(nil, "ReferenceError")
    SyntaxError = createErrorClass(nil, "SyntaxError")
    TypeError = createErrorClass(nil, "TypeError")
    URIError = createErrorClass(nil, "URIError")
end

local function __TS__ObjectGetOwnPropertyDescriptors(object)
    local metatable = getmetatable(object)
    if not metatable then
        return {}
    end
    return rawget(metatable, "_descriptors") or ({})
end

local function __TS__Delete(target, key)
    local descriptors = __TS__ObjectGetOwnPropertyDescriptors(target)
    local descriptor = descriptors[key]
    if descriptor then
        if not descriptor.configurable then
            error(
                __TS__New(
                    TypeError,
                    ((("Cannot delete property " .. tostring(key)) .. " of ") .. tostring(target)) .. "."
                ),
                0
            )
        end
        descriptors[key] = nil
        return true
    end
    target[key] = nil
    return true
end

local function __TS__StringAccess(self, index)
    if index >= 0 and index < #self then
        return string.sub(self, index + 1, index + 1)
    end
end

local function __TS__DelegatedYield(iterable)
    if type(iterable) == "string" then
        for index = 0, #iterable - 1 do
            coroutine.yield(__TS__StringAccess(iterable, index))
        end
    elseif iterable.____coroutine ~= nil then
        local co = iterable.____coroutine
        while true do
            local status, value = coroutine.resume(co)
            if not status then
                error(value, 0)
            end
            if coroutine.status(co) == "dead" then
                return value
            else
                coroutine.yield(value)
            end
        end
    elseif iterable[Symbol.iterator] then
        local iterator = iterable[Symbol.iterator](iterable)
        while true do
            local result = iterator:next()
            if result.done then
                return result.value
            else
                coroutine.yield(result.value)
            end
        end
    else
        for ____, value in ipairs(iterable) do
            coroutine.yield(value)
        end
    end
end

local function __TS__FunctionBind(fn, ...)
    local boundArgs = {...}
    return function(____, ...)
        local args = {...}
        __TS__ArrayUnshift(
            args,
            __TS__Unpack(boundArgs)
        )
        return fn(__TS__Unpack(args))
    end
end

local __TS__Generator
do
    local function generatorIterator(self)
        return self
    end
    local function generatorNext(self, ...)
        local co = self.____coroutine
        if coroutine.status(co) == "dead" then
            return {done = true}
        end
        local status, value = coroutine.resume(co, ...)
        if not status then
            error(value, 0)
        end
        return {
            value = value,
            done = coroutine.status(co) == "dead"
        }
    end
    function __TS__Generator(fn)
        return function(...)
            local args = {...}
            local argsLength = __TS__CountVarargs(...)
            return {
                ____coroutine = coroutine.create(function() return fn(__TS__Unpack(args, 1, argsLength)) end),
                [Symbol.iterator] = generatorIterator,
                next = generatorNext
            }
        end
    end
end

local function __TS__InstanceOfObject(value)
    local valueType = type(value)
    return valueType == "table" or valueType == "function"
end

local function __TS__LuaIteratorSpread(self, state, firstKey)
    local results = {}
    local key, value = self(state, firstKey)
    while key do
        results[#results + 1] = {key, value}
        key, value = self(state, key)
    end
    return __TS__Unpack(results)
end

local Map
do
    Map = __TS__Class()
    Map.name = "Map"
    function Map.prototype.____constructor(self, entries)
        self[Symbol.toStringTag] = "Map"
        self.items = {}
        self.size = 0
        self.nextKey = {}
        self.previousKey = {}
        if entries == nil then
            return
        end
        local iterable = entries
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                local value = result.value
                self:set(value[1], value[2])
            end
        else
            local array = entries
            for ____, kvp in ipairs(array) do
                self:set(kvp[1], kvp[2])
            end
        end
    end
    function Map.prototype.clear(self)
        self.items = {}
        self.nextKey = {}
        self.previousKey = {}
        self.firstKey = nil
        self.lastKey = nil
        self.size = 0
    end
    function Map.prototype.delete(self, key)
        local contains = self:has(key)
        if contains then
            self.size = self.size - 1
            local next = self.nextKey[key]
            local previous = self.previousKey[key]
            if next ~= nil and previous ~= nil then
                self.nextKey[previous] = next
                self.previousKey[next] = previous
            elseif next ~= nil then
                self.firstKey = next
                self.previousKey[next] = nil
            elseif previous ~= nil then
                self.lastKey = previous
                self.nextKey[previous] = nil
            else
                self.firstKey = nil
                self.lastKey = nil
            end
            self.nextKey[key] = nil
            self.previousKey[key] = nil
        end
        self.items[key] = nil
        return contains
    end
    function Map.prototype.forEach(self, callback)
        for ____, key in __TS__Iterator(self:keys()) do
            callback(nil, self.items[key], key, self)
        end
    end
    function Map.prototype.get(self, key)
        return self.items[key]
    end
    function Map.prototype.has(self, key)
        return self.nextKey[key] ~= nil or self.lastKey == key
    end
    function Map.prototype.set(self, key, value)
        local isNewValue = not self:has(key)
        if isNewValue then
            self.size = self.size + 1
        end
        self.items[key] = value
        if self.firstKey == nil then
            self.firstKey = key
            self.lastKey = key
        elseif isNewValue then
            self.nextKey[self.lastKey] = key
            self.previousKey[key] = self.lastKey
            self.lastKey = key
        end
        return self
    end
    Map.prototype[Symbol.iterator] = function(self)
        return self:entries()
    end
    function Map.prototype.entries(self)
        local function getFirstKey()
            return self.firstKey
        end
        local items = self.items
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = {key, items[key]}}
            end
        }
    end
    function Map.prototype.keys(self)
        local function getFirstKey()
            return self.firstKey
        end
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = key}
            end
        }
    end
    function Map.prototype.values(self)
        local function getFirstKey()
            return self.firstKey
        end
        local items = self.items
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = items[key]}
            end
        }
    end
    Map[Symbol.species] = Map
end

local function __TS__MapGroupBy(items, keySelector)
    local result = __TS__New(Map)
    local i = 0
    for ____, item in __TS__Iterator(items) do
        local key = keySelector(nil, item, i)
        if result:has(key) then
            local ____temp_0 = result:get(key)
            ____temp_0[#____temp_0 + 1] = item
        else
            result:set(key, {item})
        end
        i = i + 1
    end
    return result
end

local __TS__Match = string.match

local __TS__MathAtan2 = math.atan2 or math.atan

local __TS__MathModf = math.modf

local function __TS__NumberIsNaN(value)
    return value ~= value
end

local function __TS__MathSign(val)
    if __TS__NumberIsNaN(val) or val == 0 then
        return val
    end
    if val < 0 then
        return -1
    end
    return 1
end

local function __TS__NumberIsFinite(value)
    return type(value) == "number" and value == value and value ~= math.huge and value ~= -math.huge
end

local function __TS__MathTrunc(val)
    if not __TS__NumberIsFinite(val) or val == 0 then
        return val
    end
    return val > 0 and math.floor(val) or math.ceil(val)
end

local function __TS__Number(value)
    local valueType = type(value)
    if valueType == "number" then
        return value
    elseif valueType == "string" then
        local numberValue = tonumber(value)
        if numberValue then
            return numberValue
        end
        if value == "Infinity" then
            return math.huge
        end
        if value == "-Infinity" then
            return -math.huge
        end
        local stringWithoutSpaces = string.gsub(value, "%s", "")
        if stringWithoutSpaces == "" then
            return 0
        end
        return 0 / 0
    elseif valueType == "boolean" then
        return value and 1 or 0
    else
        return 0 / 0
    end
end

local function __TS__NumberIsInteger(value)
    return __TS__NumberIsFinite(value) and math.floor(value) == value
end

local function __TS__StringSubstring(self, start, ____end)
    if ____end ~= ____end then
        ____end = 0
    end
    if ____end ~= nil and start > ____end then
        start, ____end = ____end, start
    end
    if start >= 0 then
        start = start + 1
    else
        start = 1
    end
    if ____end ~= nil and ____end < 0 then
        ____end = 0
    end
    return string.sub(self, start, ____end)
end

local __TS__ParseInt
do
    local parseIntBasePattern = "0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTvVwWxXyYzZ"
    function __TS__ParseInt(numberString, base)
        if base == nil then
            base = 10
            local hexMatch = __TS__Match(numberString, "^%s*-?0[xX]")
            if hexMatch ~= nil then
                base = 16
                numberString = (__TS__Match(hexMatch, "-")) and "-" .. __TS__StringSubstring(numberString, #hexMatch) or __TS__StringSubstring(numberString, #hexMatch)
            end
        end
        if base < 2 or base > 36 then
            return 0 / 0
        end
        local allowedDigits = base <= 10 and __TS__StringSubstring(parseIntBasePattern, 0, base) or __TS__StringSubstring(parseIntBasePattern, 0, 10 + 2 * (base - 10))
        local pattern = ("^%s*(-?[" .. allowedDigits) .. "]*)"
        local number = tonumber((__TS__Match(numberString, pattern)), base)
        if number == nil then
            return 0 / 0
        end
        if number >= 0 then
            return math.floor(number)
        else
            return math.ceil(number)
        end
    end
end

local function __TS__ParseFloat(numberString)
    local infinityMatch = __TS__Match(numberString, "^%s*(-?Infinity)")
    if infinityMatch ~= nil then
        return __TS__StringAccess(infinityMatch, 0) == "-" and -math.huge or math.huge
    end
    local number = tonumber((__TS__Match(numberString, "^%s*(-?%d+%.?%d*)")))
    return number or 0 / 0
end

local __TS__NumberToString
do
    local radixChars = "0123456789abcdefghijklmnopqrstuvwxyz"
    function __TS__NumberToString(self, radix)
        if radix == nil or radix == 10 or self == math.huge or self == -math.huge or self ~= self then
            return tostring(self)
        end
        radix = math.floor(radix)
        if radix < 2 or radix > 36 then
            error("toString() radix argument must be between 2 and 36", 0)
        end
        local integer, fraction = __TS__MathModf(math.abs(self))
        local result = ""
        if radix == 8 then
            result = string.format("%o", integer)
        elseif radix == 16 then
            result = string.format("%x", integer)
        else
            repeat
                do
                    result = __TS__StringAccess(radixChars, integer % radix) .. result
                    integer = math.floor(integer / radix)
                end
            until not (integer ~= 0)
        end
        if fraction ~= 0 then
            result = result .. "."
            local delta = 1e-16
            repeat
                do
                    fraction = fraction * radix
                    delta = delta * radix
                    local digit = math.floor(fraction)
                    result = result .. __TS__StringAccess(radixChars, digit)
                    fraction = fraction - digit
                end
            until not (fraction >= delta)
        end
        if self < 0 then
            result = "-" .. result
        end
        return result
    end
end

local function __TS__NumberToFixed(self, fractionDigits)
    if math.abs(self) >= 1e+21 or self ~= self then
        return tostring(self)
    end
    local f = math.floor(fractionDigits or 0)
    if f < 0 or f > 99 then
        error("toFixed() digits argument must be between 0 and 99", 0)
    end
    return string.format(
        ("%." .. tostring(f)) .. "f",
        self
    )
end

local function __TS__ObjectDefineProperty(target, key, desc)
    local luaKey = type(key) == "number" and key + 1 or key
    local value = rawget(target, luaKey)
    local hasGetterOrSetter = desc.get ~= nil or desc.set ~= nil
    local descriptor
    if hasGetterOrSetter then
        if value ~= nil then
            error(
                "Cannot redefine property: " .. tostring(key),
                0
            )
        end
        descriptor = desc
    else
        local valueExists = value ~= nil
        local ____desc_set_4 = desc.set
        local ____desc_get_5 = desc.get
        local ____desc_configurable_0 = desc.configurable
        if ____desc_configurable_0 == nil then
            ____desc_configurable_0 = valueExists
        end
        local ____desc_enumerable_1 = desc.enumerable
        if ____desc_enumerable_1 == nil then
            ____desc_enumerable_1 = valueExists
        end
        local ____desc_writable_2 = desc.writable
        if ____desc_writable_2 == nil then
            ____desc_writable_2 = valueExists
        end
        local ____temp_3
        if desc.value ~= nil then
            ____temp_3 = desc.value
        else
            ____temp_3 = value
        end
        descriptor = {
            set = ____desc_set_4,
            get = ____desc_get_5,
            configurable = ____desc_configurable_0,
            enumerable = ____desc_enumerable_1,
            writable = ____desc_writable_2,
            value = ____temp_3
        }
    end
    __TS__SetDescriptor(target, luaKey, descriptor)
    return target
end

local function __TS__ObjectEntries(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = {key, obj[key]}
    end
    return result
end

local function __TS__ObjectFromEntries(entries)
    local obj = {}
    local iterable = entries
    if iterable[Symbol.iterator] then
        local iterator = iterable[Symbol.iterator](iterable)
        while true do
            local result = iterator:next()
            if result.done then
                break
            end
            local value = result.value
            obj[value[1]] = value[2]
        end
    else
        for ____, entry in ipairs(entries) do
            obj[entry[1]] = entry[2]
        end
    end
    return obj
end

local function __TS__ObjectGroupBy(items, keySelector)
    local result = {}
    local i = 0
    for ____, item in __TS__Iterator(items) do
        local key = keySelector(nil, item, i)
        if result[key] ~= nil then
            local ____result_key_0 = result[key]
            ____result_key_0[#____result_key_0 + 1] = item
        else
            result[key] = {item}
        end
        i = i + 1
    end
    return result
end

local function __TS__ObjectKeys(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = key
    end
    return result
end

local function __TS__ObjectRest(target, usedProperties)
    local result = {}
    for property in pairs(target) do
        if not usedProperties[property] then
            result[property] = target[property]
        end
    end
    return result
end

local function __TS__ObjectValues(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = obj[key]
    end
    return result
end

local function __TS__PromiseAll(iterable)
    local results = {}
    local toResolve = {}
    local numToResolve = 0
    local i = 0
    for ____, item in __TS__Iterator(iterable) do
        if __TS__InstanceOf(item, __TS__Promise) then
            if item.state == 1 then
                results[i + 1] = item.value
            elseif item.state == 2 then
                return __TS__Promise.reject(item.rejectionReason)
            else
                numToResolve = numToResolve + 1
                toResolve[i] = item
            end
        else
            results[i + 1] = item
        end
        i = i + 1
    end
    if numToResolve == 0 then
        return __TS__Promise.resolve(results)
    end
    return __TS__New(
        __TS__Promise,
        function(____, resolve, reject)
            for index, promise in pairs(toResolve) do
                promise["then"](
                    promise,
                    function(____, data)
                        results[index + 1] = data
                        numToResolve = numToResolve - 1
                        if numToResolve == 0 then
                            resolve(nil, results)
                        end
                    end,
                    function(____, reason)
                        reject(nil, reason)
                    end
                )
            end
        end
    )
end

local function __TS__PromiseAllSettled(iterable)
    local results = {}
    local toResolve = {}
    local numToResolve = 0
    local i = 0
    for ____, item in __TS__Iterator(iterable) do
        if __TS__InstanceOf(item, __TS__Promise) then
            if item.state == 1 then
                results[i + 1] = {status = "fulfilled", value = item.value}
            elseif item.state == 2 then
                results[i + 1] = {status = "rejected", reason = item.rejectionReason}
            else
                numToResolve = numToResolve + 1
                toResolve[i] = item
            end
        else
            results[i + 1] = {status = "fulfilled", value = item}
        end
        i = i + 1
    end
    if numToResolve == 0 then
        return __TS__Promise.resolve(results)
    end
    return __TS__New(
        __TS__Promise,
        function(____, resolve)
            for index, promise in pairs(toResolve) do
                promise["then"](
                    promise,
                    function(____, data)
                        results[index + 1] = {status = "fulfilled", value = data}
                        numToResolve = numToResolve - 1
                        if numToResolve == 0 then
                            resolve(nil, results)
                        end
                    end,
                    function(____, reason)
                        results[index + 1] = {status = "rejected", reason = reason}
                        numToResolve = numToResolve - 1
                        if numToResolve == 0 then
                            resolve(nil, results)
                        end
                    end
                )
            end
        end
    )
end

local function __TS__PromiseAny(iterable)
    local rejections = {}
    local pending = {}
    for ____, item in __TS__Iterator(iterable) do
        if __TS__InstanceOf(item, __TS__Promise) then
            if item.state == 1 then
                return __TS__Promise.resolve(item.value)
            elseif item.state == 2 then
                rejections[#rejections + 1] = item.rejectionReason
            else
                pending[#pending + 1] = item
            end
        else
            return __TS__Promise.resolve(item)
        end
    end
    if #pending == 0 then
        return __TS__Promise.reject("No promises to resolve with .any()")
    end
    local numResolved = 0
    return __TS__New(
        __TS__Promise,
        function(____, resolve, reject)
            for ____, promise in ipairs(pending) do
                promise["then"](
                    promise,
                    function(____, data)
                        resolve(nil, data)
                    end,
                    function(____, reason)
                        rejections[#rejections + 1] = reason
                        numResolved = numResolved + 1
                        if numResolved == #pending then
                            reject(nil, {name = "AggregateError", message = "All Promises rejected", errors = rejections})
                        end
                    end
                )
            end
        end
    )
end

local function __TS__PromiseRace(iterable)
    local pending = {}
    for ____, item in __TS__Iterator(iterable) do
        if __TS__InstanceOf(item, __TS__Promise) then
            if item.state == 1 then
                return __TS__Promise.resolve(item.value)
            elseif item.state == 2 then
                return __TS__Promise.reject(item.rejectionReason)
            else
                pending[#pending + 1] = item
            end
        else
            return __TS__Promise.resolve(item)
        end
    end
    return __TS__New(
        __TS__Promise,
        function(____, resolve, reject)
            for ____, promise in ipairs(pending) do
                promise["then"](
                    promise,
                    function(____, value) return resolve(nil, value) end,
                    function(____, reason) return reject(nil, reason) end
                )
            end
        end
    )
end

local Set
do
    Set = __TS__Class()
    Set.name = "Set"
    function Set.prototype.____constructor(self, values)
        self[Symbol.toStringTag] = "Set"
        self.size = 0
        self.nextKey = {}
        self.previousKey = {}
        if values == nil then
            return
        end
        local iterable = values
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                self:add(result.value)
            end
        else
            local array = values
            for ____, value in ipairs(array) do
                self:add(value)
            end
        end
    end
    function Set.prototype.add(self, value)
        local isNewValue = not self:has(value)
        if isNewValue then
            self.size = self.size + 1
        end
        if self.firstKey == nil then
            self.firstKey = value
            self.lastKey = value
        elseif isNewValue then
            self.nextKey[self.lastKey] = value
            self.previousKey[value] = self.lastKey
            self.lastKey = value
        end
        return self
    end
    function Set.prototype.clear(self)
        self.nextKey = {}
        self.previousKey = {}
        self.firstKey = nil
        self.lastKey = nil
        self.size = 0
    end
    function Set.prototype.delete(self, value)
        local contains = self:has(value)
        if contains then
            self.size = self.size - 1
            local next = self.nextKey[value]
            local previous = self.previousKey[value]
            if next ~= nil and previous ~= nil then
                self.nextKey[previous] = next
                self.previousKey[next] = previous
            elseif next ~= nil then
                self.firstKey = next
                self.previousKey[next] = nil
            elseif previous ~= nil then
                self.lastKey = previous
                self.nextKey[previous] = nil
            else
                self.firstKey = nil
                self.lastKey = nil
            end
            self.nextKey[value] = nil
            self.previousKey[value] = nil
        end
        return contains
    end
    function Set.prototype.forEach(self, callback)
        for ____, key in __TS__Iterator(self:keys()) do
            callback(nil, key, key, self)
        end
    end
    function Set.prototype.has(self, value)
        return self.nextKey[value] ~= nil or self.lastKey == value
    end
    Set.prototype[Symbol.iterator] = function(self)
        return self:values()
    end
    function Set.prototype.entries(self)
        local function getFirstKey()
            return self.firstKey
        end
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = {key, key}}
            end
        }
    end
    function Set.prototype.keys(self)
        local function getFirstKey()
            return self.firstKey
        end
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = key}
            end
        }
    end
    function Set.prototype.values(self)
        local function getFirstKey()
            return self.firstKey
        end
        local nextKey = self.nextKey
        local key
        local started = false
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                if not started then
                    started = true
                    key = getFirstKey(nil)
                else
                    key = nextKey[key]
                end
                return {done = not key, value = key}
            end
        }
    end
    function Set.prototype.union(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            result:add(item)
        end
        return result
    end
    function Set.prototype.intersection(self, other)
        local result = __TS__New(Set)
        for ____, item in __TS__Iterator(self) do
            if other:has(item) then
                result:add(item)
            end
        end
        return result
    end
    function Set.prototype.difference(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            result:delete(item)
        end
        return result
    end
    function Set.prototype.symmetricDifference(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            if self:has(item) then
                result:delete(item)
            else
                result:add(item)
            end
        end
        return result
    end
    function Set.prototype.isSubsetOf(self, other)
        for ____, item in __TS__Iterator(self) do
            if not other:has(item) then
                return false
            end
        end
        return true
    end
    function Set.prototype.isSupersetOf(self, other)
        for ____, item in __TS__Iterator(other) do
            if not self:has(item) then
                return false
            end
        end
        return true
    end
    function Set.prototype.isDisjointFrom(self, other)
        for ____, item in __TS__Iterator(self) do
            if other:has(item) then
                return false
            end
        end
        return true
    end
    Set[Symbol.species] = Set
end

local function __TS__SparseArrayNew(...)
    local sparseArray = {...}
    sparseArray.sparseLength = __TS__CountVarargs(...)
    return sparseArray
end

local function __TS__SparseArrayPush(sparseArray, ...)
    local args = {...}
    local argsLen = __TS__CountVarargs(...)
    local listLen = sparseArray.sparseLength
    for i = 1, argsLen do
        sparseArray[listLen + i] = args[i]
    end
    sparseArray.sparseLength = listLen + argsLen
end

local function __TS__SparseArraySpread(sparseArray)
    local _unpack = unpack or table.unpack
    return _unpack(sparseArray, 1, sparseArray.sparseLength)
end

local WeakMap
do
    WeakMap = __TS__Class()
    WeakMap.name = "WeakMap"
    function WeakMap.prototype.____constructor(self, entries)
        self[Symbol.toStringTag] = "WeakMap"
        self.items = {}
        setmetatable(self.items, {__mode = "k"})
        if entries == nil then
            return
        end
        local iterable = entries
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                local value = result.value
                self.items[value[1]] = value[2]
            end
        else
            for ____, kvp in ipairs(entries) do
                self.items[kvp[1]] = kvp[2]
            end
        end
    end
    function WeakMap.prototype.delete(self, key)
        local contains = self:has(key)
        self.items[key] = nil
        return contains
    end
    function WeakMap.prototype.get(self, key)
        return self.items[key]
    end
    function WeakMap.prototype.has(self, key)
        return self.items[key] ~= nil
    end
    function WeakMap.prototype.set(self, key, value)
        self.items[key] = value
        return self
    end
    WeakMap[Symbol.species] = WeakMap
end

local WeakSet
do
    WeakSet = __TS__Class()
    WeakSet.name = "WeakSet"
    function WeakSet.prototype.____constructor(self, values)
        self[Symbol.toStringTag] = "WeakSet"
        self.items = {}
        setmetatable(self.items, {__mode = "k"})
        if values == nil then
            return
        end
        local iterable = values
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                self.items[result.value] = true
            end
        else
            for ____, value in ipairs(values) do
                self.items[value] = true
            end
        end
    end
    function WeakSet.prototype.add(self, value)
        self.items[value] = true
        return self
    end
    function WeakSet.prototype.delete(self, value)
        local contains = self:has(value)
        self.items[value] = nil
        return contains
    end
    function WeakSet.prototype.has(self, value)
        return self.items[value] == true
    end
    WeakSet[Symbol.species] = WeakSet
end

local function __TS__SourceMapTraceBack(fileName, sourceMap)
    _G.__TS__sourcemap = _G.__TS__sourcemap or ({})
    _G.__TS__sourcemap[fileName] = sourceMap
    if _G.__TS__originalTraceback == nil then
        local originalTraceback = debug.traceback
        _G.__TS__originalTraceback = originalTraceback
        debug.traceback = function(thread, message, level)
            local trace
            if thread == nil and message == nil and level == nil then
                trace = originalTraceback()
            elseif __TS__StringIncludes(_VERSION, "Lua 5.0") then
                trace = originalTraceback((("[Level " .. tostring(level)) .. "] ") .. tostring(message))
            else
                trace = originalTraceback(thread, message, level)
            end
            if type(trace) ~= "string" then
                return trace
            end
            local function replacer(____, file, srcFile, line)
                local fileSourceMap = _G.__TS__sourcemap[file]
                if fileSourceMap ~= nil and fileSourceMap[line] ~= nil then
                    local data = fileSourceMap[line]
                    if type(data) == "number" then
                        return (srcFile .. ":") .. tostring(data)
                    end
                    return (data.file .. ":") .. tostring(data.line)
                end
                return (file .. ":") .. line
            end
            local result = string.gsub(
                trace,
                "([^%s<]+)%.lua:(%d+)",
                function(file, line) return replacer(nil, file .. ".lua", file .. ".ts", line) end
            )
            local function stringReplacer(____, file, line)
                local fileSourceMap = _G.__TS__sourcemap[file]
                if fileSourceMap ~= nil and fileSourceMap[line] ~= nil then
                    local chunkName = (__TS__Match(file, "%[string \"([^\"]+)\"%]"))
                    local sourceName = string.gsub(chunkName, ".lua$", ".ts")
                    local data = fileSourceMap[line]
                    if type(data) == "number" then
                        return (sourceName .. ":") .. tostring(data)
                    end
                    return (data.file .. ":") .. tostring(data.line)
                end
                return (file .. ":") .. line
            end
            result = string.gsub(
                result,
                "(%[string \"[^\"]+\"%]):(%d+)",
                function(file, line) return stringReplacer(nil, file, line) end
            )
            return result
        end
    end
end

local function __TS__Spread(iterable)
    local arr = {}
    if type(iterable) == "string" then
        for i = 0, #iterable - 1 do
            arr[i + 1] = __TS__StringAccess(iterable, i)
        end
    else
        local len = 0
        for ____, item in __TS__Iterator(iterable) do
            len = len + 1
            arr[len] = item
        end
    end
    return __TS__Unpack(arr)
end

local function __TS__StringCharAt(self, pos)
    if pos ~= pos then
        pos = 0
    end
    if pos < 0 then
        return ""
    end
    return string.sub(self, pos + 1, pos + 1)
end

local function __TS__StringCharCodeAt(self, index)
    if index ~= index then
        index = 0
    end
    if index < 0 then
        return 0 / 0
    end
    return string.byte(self, index + 1) or 0 / 0
end

local function __TS__StringEndsWith(self, searchString, endPosition)
    if endPosition == nil or endPosition > #self then
        endPosition = #self
    end
    return string.sub(self, endPosition - #searchString + 1, endPosition) == searchString
end

local function __TS__StringPadEnd(self, maxLength, fillString)
    if fillString == nil then
        fillString = " "
    end
    if maxLength ~= maxLength then
        maxLength = 0
    end
    if maxLength == -math.huge or maxLength == math.huge then
        error("Invalid string length", 0)
    end
    if #self >= maxLength or #fillString == 0 then
        return self
    end
    maxLength = maxLength - #self
    if maxLength > #fillString then
        fillString = fillString .. string.rep(
            fillString,
            math.floor(maxLength / #fillString)
        )
    end
    return self .. string.sub(
        fillString,
        1,
        math.floor(maxLength)
    )
end

local function __TS__StringPadStart(self, maxLength, fillString)
    if fillString == nil then
        fillString = " "
    end
    if maxLength ~= maxLength then
        maxLength = 0
    end
    if maxLength == -math.huge or maxLength == math.huge then
        error("Invalid string length", 0)
    end
    if #self >= maxLength or #fillString == 0 then
        return self
    end
    maxLength = maxLength - #self
    if maxLength > #fillString then
        fillString = fillString .. string.rep(
            fillString,
            math.floor(maxLength / #fillString)
        )
    end
    return string.sub(
        fillString,
        1,
        math.floor(maxLength)
    ) .. self
end

local __TS__StringReplace
do
    local sub = string.sub
    function __TS__StringReplace(source, searchValue, replaceValue)
        local startPos, endPos = string.find(source, searchValue, nil, true)
        if not startPos then
            return source
        end
        local before = sub(source, 1, startPos - 1)
        local replacement = type(replaceValue) == "string" and replaceValue or replaceValue(nil, searchValue, startPos - 1, source)
        local after = sub(source, endPos + 1)
        return (before .. replacement) .. after
    end
end

local __TS__StringSplit
do
    local sub = string.sub
    local find = string.find
    function __TS__StringSplit(source, separator, limit)
        if limit == nil then
            limit = 4294967295
        end
        if limit == 0 then
            return {}
        end
        local result = {}
        local resultIndex = 1
        if separator == nil or separator == "" then
            for i = 1, #source do
                result[resultIndex] = sub(source, i, i)
                resultIndex = resultIndex + 1
            end
        else
            local currentPos = 1
            while resultIndex <= limit do
                local startPos, endPos = find(source, separator, currentPos, true)
                if not startPos then
                    break
                end
                result[resultIndex] = sub(source, currentPos, startPos - 1)
                resultIndex = resultIndex + 1
                currentPos = endPos + 1
            end
            if resultIndex <= limit then
                result[resultIndex] = sub(source, currentPos)
            end
        end
        return result
    end
end

local __TS__StringReplaceAll
do
    local sub = string.sub
    local find = string.find
    function __TS__StringReplaceAll(source, searchValue, replaceValue)
        if type(replaceValue) == "string" then
            local concat = table.concat(
                __TS__StringSplit(source, searchValue),
                replaceValue
            )
            if #searchValue == 0 then
                return (replaceValue .. concat) .. replaceValue
            end
            return concat
        end
        local parts = {}
        local partsIndex = 1
        if #searchValue == 0 then
            parts[1] = replaceValue(nil, "", 0, source)
            partsIndex = 2
            for i = 1, #source do
                parts[partsIndex] = sub(source, i, i)
                parts[partsIndex + 1] = replaceValue(nil, "", i, source)
                partsIndex = partsIndex + 2
            end
        else
            local currentPos = 1
            while true do
                local startPos, endPos = find(source, searchValue, currentPos, true)
                if not startPos then
                    break
                end
                parts[partsIndex] = sub(source, currentPos, startPos - 1)
                parts[partsIndex + 1] = replaceValue(nil, searchValue, startPos - 1, source)
                partsIndex = partsIndex + 2
                currentPos = endPos + 1
            end
            parts[partsIndex] = sub(source, currentPos)
        end
        return table.concat(parts)
    end
end

local function __TS__StringSlice(self, start, ____end)
    if start == nil or start ~= start then
        start = 0
    end
    if ____end ~= ____end then
        ____end = 0
    end
    if start >= 0 then
        start = start + 1
    end
    if ____end ~= nil and ____end < 0 then
        ____end = ____end - 1
    end
    return string.sub(self, start, ____end)
end

local function __TS__StringStartsWith(self, searchString, position)
    if position == nil or position < 0 then
        position = 0
    end
    return string.sub(self, position + 1, #searchString + position) == searchString
end

local function __TS__StringSubstr(self, from, length)
    if from ~= from then
        from = 0
    end
    if length ~= nil then
        if length ~= length or length <= 0 then
            return ""
        end
        length = length + from
    end
    if from >= 0 then
        from = from + 1
    end
    return string.sub(self, from, length)
end

local function __TS__StringTrim(self)
    local result = string.gsub(self, "^[%s ﻿]*(.-)[%s ﻿]*$", "%1")
    return result
end

local function __TS__StringTrimEnd(self)
    local result = string.gsub(self, "[%s ﻿]*$", "")
    return result
end

local function __TS__StringTrimStart(self)
    local result = string.gsub(self, "^[%s ﻿]*", "")
    return result
end

local __TS__SymbolRegistryFor, __TS__SymbolRegistryKeyFor
do
    local symbolRegistry = {}
    function __TS__SymbolRegistryFor(key)
        if not symbolRegistry[key] then
            symbolRegistry[key] = __TS__Symbol(key)
        end
        return symbolRegistry[key]
    end
    function __TS__SymbolRegistryKeyFor(sym)
        for key in pairs(symbolRegistry) do
            if symbolRegistry[key] == sym then
                return key
            end
        end
        return nil
    end
end

local function __TS__TypeOf(value)
    local luaType = type(value)
    if luaType == "table" then
        return "object"
    elseif luaType == "nil" then
        return "undefined"
    else
        return luaType
    end
end

local function __TS__Using(self, cb, ...)
    local args = {...}
    local thrownError
    local ok, result = xpcall(
        function() return cb(__TS__Unpack(args)) end,
        function(err)
            thrownError = err
            return thrownError
        end
    )
    local argArray = {__TS__Unpack(args)}
    do
        local i = #argArray - 1
        while i >= 0 do
            local ____self_0 = argArray[i + 1]
            ____self_0[Symbol.dispose](____self_0)
            i = i - 1
        end
    end
    if not ok then
        error(thrownError, 0)
    end
    return result
end

local function __TS__UsingAsync(self, cb, ...)
    local args = {...}
    return __TS__AsyncAwaiter(function(____awaiter_resolve)
        local thrownError
        local ok, result = xpcall(
            function() return cb(
                nil,
                __TS__Unpack(args)
            ) end,
            function(err)
                thrownError = err
                return thrownError
            end
        )
        local argArray = {__TS__Unpack(args)}
        do
            local i = #argArray - 1
            while i >= 0 do
                if argArray[i + 1][Symbol.dispose] ~= nil then
                    local ____self_0 = argArray[i + 1]
                    ____self_0[Symbol.dispose](____self_0)
                end
                if argArray[i + 1][Symbol.asyncDispose] ~= nil then
                    local ____self_1 = argArray[i + 1]
                    __TS__Await(____self_1[Symbol.asyncDispose](____self_1))
                end
                i = i - 1
            end
        end
        if not ok then
            error(thrownError, 0)
        end
        return ____awaiter_resolve(nil, result)
    end)
end

return {
  __TS__ArrayAt = __TS__ArrayAt,
  __TS__ArrayConcat = __TS__ArrayConcat,
  __TS__ArrayEntries = __TS__ArrayEntries,
  __TS__ArrayEvery = __TS__ArrayEvery,
  __TS__ArrayFill = __TS__ArrayFill,
  __TS__ArrayFilter = __TS__ArrayFilter,
  __TS__ArrayForEach = __TS__ArrayForEach,
  __TS__ArrayFind = __TS__ArrayFind,
  __TS__ArrayFindIndex = __TS__ArrayFindIndex,
  __TS__ArrayFrom = __TS__ArrayFrom,
  __TS__ArrayIncludes = __TS__ArrayIncludes,
  __TS__ArrayIndexOf = __TS__ArrayIndexOf,
  __TS__ArrayIsArray = __TS__ArrayIsArray,
  __TS__ArrayJoin = __TS__ArrayJoin,
  __TS__ArrayMap = __TS__ArrayMap,
  __TS__ArrayPush = __TS__ArrayPush,
  __TS__ArrayPushArray = __TS__ArrayPushArray,
  __TS__ArrayReduce = __TS__ArrayReduce,
  __TS__ArrayReduceRight = __TS__ArrayReduceRight,
  __TS__ArrayReverse = __TS__ArrayReverse,
  __TS__ArrayUnshift = __TS__ArrayUnshift,
  __TS__ArraySort = __TS__ArraySort,
  __TS__ArraySlice = __TS__ArraySlice,
  __TS__ArraySome = __TS__ArraySome,
  __TS__ArraySplice = __TS__ArraySplice,
  __TS__ArrayToObject = __TS__ArrayToObject,
  __TS__ArrayFlat = __TS__ArrayFlat,
  __TS__ArrayFlatMap = __TS__ArrayFlatMap,
  __TS__ArraySetLength = __TS__ArraySetLength,
  __TS__ArrayToReversed = __TS__ArrayToReversed,
  __TS__ArrayToSorted = __TS__ArrayToSorted,
  __TS__ArrayToSpliced = __TS__ArrayToSpliced,
  __TS__ArrayWith = __TS__ArrayWith,
  __TS__AsyncAwaiter = __TS__AsyncAwaiter,
  __TS__Await = __TS__Await,
  __TS__Class = __TS__Class,
  __TS__ClassExtends = __TS__ClassExtends,
  __TS__CloneDescriptor = __TS__CloneDescriptor,
  __TS__CountVarargs = __TS__CountVarargs,
  __TS__Decorate = __TS__Decorate,
  __TS__DecorateLegacy = __TS__DecorateLegacy,
  __TS__DecorateParam = __TS__DecorateParam,
  __TS__Delete = __TS__Delete,
  __TS__DelegatedYield = __TS__DelegatedYield,
  __TS__DescriptorGet = __TS__DescriptorGet,
  __TS__DescriptorSet = __TS__DescriptorSet,
  Error = Error,
  RangeError = RangeError,
  ReferenceError = ReferenceError,
  SyntaxError = SyntaxError,
  TypeError = TypeError,
  URIError = URIError,
  __TS__FunctionBind = __TS__FunctionBind,
  __TS__Generator = __TS__Generator,
  __TS__InstanceOf = __TS__InstanceOf,
  __TS__InstanceOfObject = __TS__InstanceOfObject,
  __TS__Iterator = __TS__Iterator,
  __TS__LuaIteratorSpread = __TS__LuaIteratorSpread,
  Map = Map,
  __TS__MapGroupBy = __TS__MapGroupBy,
  __TS__Match = __TS__Match,
  __TS__MathAtan2 = __TS__MathAtan2,
  __TS__MathModf = __TS__MathModf,
  __TS__MathSign = __TS__MathSign,
  __TS__MathTrunc = __TS__MathTrunc,
  __TS__New = __TS__New,
  __TS__Number = __TS__Number,
  __TS__NumberIsFinite = __TS__NumberIsFinite,
  __TS__NumberIsInteger = __TS__NumberIsInteger,
  __TS__NumberIsNaN = __TS__NumberIsNaN,
  __TS__ParseInt = __TS__ParseInt,
  __TS__ParseFloat = __TS__ParseFloat,
  __TS__NumberToString = __TS__NumberToString,
  __TS__NumberToFixed = __TS__NumberToFixed,
  __TS__ObjectAssign = __TS__ObjectAssign,
  __TS__ObjectDefineProperty = __TS__ObjectDefineProperty,
  __TS__ObjectEntries = __TS__ObjectEntries,
  __TS__ObjectFromEntries = __TS__ObjectFromEntries,
  __TS__ObjectGetOwnPropertyDescriptor = __TS__ObjectGetOwnPropertyDescriptor,
  __TS__ObjectGetOwnPropertyDescriptors = __TS__ObjectGetOwnPropertyDescriptors,
  __TS__ObjectGroupBy = __TS__ObjectGroupBy,
  __TS__ObjectKeys = __TS__ObjectKeys,
  __TS__ObjectRest = __TS__ObjectRest,
  __TS__ObjectValues = __TS__ObjectValues,
  __TS__ParseFloat = __TS__ParseFloat,
  __TS__ParseInt = __TS__ParseInt,
  __TS__Promise = __TS__Promise,
  __TS__PromiseAll = __TS__PromiseAll,
  __TS__PromiseAllSettled = __TS__PromiseAllSettled,
  __TS__PromiseAny = __TS__PromiseAny,
  __TS__PromiseRace = __TS__PromiseRace,
  Set = Set,
  __TS__SetDescriptor = __TS__SetDescriptor,
  __TS__SparseArrayNew = __TS__SparseArrayNew,
  __TS__SparseArrayPush = __TS__SparseArrayPush,
  __TS__SparseArraySpread = __TS__SparseArraySpread,
  WeakMap = WeakMap,
  WeakSet = WeakSet,
  __TS__SourceMapTraceBack = __TS__SourceMapTraceBack,
  __TS__Spread = __TS__Spread,
  __TS__StringAccess = __TS__StringAccess,
  __TS__StringCharAt = __TS__StringCharAt,
  __TS__StringCharCodeAt = __TS__StringCharCodeAt,
  __TS__StringEndsWith = __TS__StringEndsWith,
  __TS__StringIncludes = __TS__StringIncludes,
  __TS__StringPadEnd = __TS__StringPadEnd,
  __TS__StringPadStart = __TS__StringPadStart,
  __TS__StringReplace = __TS__StringReplace,
  __TS__StringReplaceAll = __TS__StringReplaceAll,
  __TS__StringSlice = __TS__StringSlice,
  __TS__StringSplit = __TS__StringSplit,
  __TS__StringStartsWith = __TS__StringStartsWith,
  __TS__StringSubstr = __TS__StringSubstr,
  __TS__StringSubstring = __TS__StringSubstring,
  __TS__StringTrim = __TS__StringTrim,
  __TS__StringTrimEnd = __TS__StringTrimEnd,
  __TS__StringTrimStart = __TS__StringTrimStart,
  __TS__Symbol = __TS__Symbol,
  Symbol = Symbol,
  __TS__SymbolRegistryFor = __TS__SymbolRegistryFor,
  __TS__SymbolRegistryKeyFor = __TS__SymbolRegistryKeyFor,
  __TS__TypeOf = __TS__TypeOf,
  __TS__Unpack = __TS__Unpack,
  __TS__Using = __TS__Using,
  __TS__UsingAsync = __TS__UsingAsync
}
 end,
["src.contenu.constantes"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
--- Constantes du contenu partagées par le moteur (sans dépendance : utilisables sur le web et sur Roblox).
____exports.CARACS = {
    "FOR",
    "AGI",
    "INT",
    "VIT",
    "ESP",
    "CHA"
}
return ____exports
 end,
["src.contenu.schemas"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____zod = require("zod")
local z = ____zod.z
local ____constantes = require("src.contenu.constantes")
local CARACS = ____constantes.CARACS
____exports.CARACS = CARACS
____exports.zCarac = z:enum(CARACS)
____exports.zCaracs = z:object({
    FOR = z:number():int(),
    AGI = z:number():int(),
    INT = z:number():int(),
    VIT = z:number():int(),
    ESP = z:number():int(),
    CHA = z:number():int()
})
____exports.zCaracsPartielles = ____exports.zCaracs:partial()
____exports.ELEMENTS = {
    "physique",
    "feu",
    "glace",
    "foudre",
    "sacre",
    "ombre",
    "poison",
    "arcane"
}
____exports.zElement = z:enum(____exports.ELEMENTS)
____exports.ETATS = {
    "brulure",
    "poison",
    "gel",
    "immobilise",
    "sommeil",
    "peur",
    "silence",
    "provoque",
    "marque",
    "furtif",
    "bonus_degats",
    "bonus_defense",
    "bonus_initiative",
    "bonus_precision",
    "malus_defense",
    "regeneration",
    "garde",
    "expose",
    "affaibli"
}
____exports.zEtat = z:enum(____exports.ETATS)
____exports.CIBLES = {
    "ennemi",
    "tous_ennemis",
    "ennemi_aleatoire",
    "allie",
    "allie_ko",
    "tous_allies",
    "soi"
}
____exports.zCible = z:enum(____exports.CIBLES)
local zEffetDegats = z:object({
    type = z:literal("degats"),
    puissance = z:number(),
    stat = ____exports.zCarac,
    element = ____exports.zElement:default("physique"),
    coups = z:number():int():min(1):default(1),
    critique_garanti = z:boolean():default(false),
    cout_pv_pourcent = z:number():default(0),
    bonus_si_etat = z:object({
        etat = ____exports.zEtat,
        multiplicateur = z:number()
    }):optional(),
    executer_sous_pourcent = z:number():optional()
})
local zEffetSoin = z:object({
    type = z:literal("soin"),
    puissance = z:number(),
    stat = ____exports.zCarac:default("ESP"),
    cible = ____exports.zCible:optional()
})
local zEffetEtat = z:object({
    type = z:literal("etat"),
    etat = ____exports.zEtat,
    duree = z:number():int(),
    valeur = z:number():default(0),
    chance = z:number():min(0):max(1):default(1),
    cible = ____exports.zCible:optional(),
    cumul_max = z:number():int():default(1)
})
local zEffetBouclier = z:object({
    type = z:literal("bouclier"),
    pourcent_pv = z:number(),
    stat = ____exports.zCarac:optional(),
    bonus_par_point = z:number():default(0),
    cible = ____exports.zCible:optional()
})
local zEffetInvocation = z:object({
    type = z:literal("invocation"),
    creature = z:string(),
    duree = z:number():int()
})
local zEffetPurifier = z:object({
    type = z:literal("purifier"),
    cible = ____exports.zCible:optional()
})
local zEffetCharge = z:object({
    type = z:literal("charge_rune"),
    nombre = z:number():int()
})
local zEffetMana = z:object({
    type = z:literal("mana"),
    valeur = z:number(),
    cible = ____exports.zCible:optional()
})
local zEffetEchange = z:object({
    type = z:literal("soigner_invocations"),
    pourcent = z:number()
})
local zEffetRelever = z:object({
    type = z:literal("relever"),
    pourcent_pv = z:number(),
    cible = ____exports.zCible:optional()
})
____exports.zEffet = z:discriminatedUnion("type", {
    zEffetDegats,
    zEffetSoin,
    zEffetEtat,
    zEffetBouclier,
    zEffetInvocation,
    zEffetPurifier,
    zEffetCharge,
    zEffetMana,
    zEffetEchange,
    zEffetRelever
})
____exports.zCompetence = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string(),
    cout = z:number():int():default(0),
    recharge = z:number():int():default(0),
    cible = ____exports.zCible,
    portee = z:enum({"melee", "distance"}):default("distance"),
    effets = z:array(____exports.zEffet):min(1),
    ia = z:object({
        priorite = z:number():default(1),
        quand = z:enum({
            "toujours",
            "allie_blesse",
            "plusieurs_ennemis",
            "debut_combat",
            "cible_faible",
            "soi_blesse",
            "allie_ko"
        }):default("toujours")
    }):default({priorite = 1, quand = "toujours"})
})
____exports.zClasse = z:object({
    id = z:string(),
    nom = z:string(),
    role = z:string(),
    description = z:string(),
    caracteristiques = ____exports.zCaracs,
    attaque = z:object({
        stat = ____exports.zCarac,
        element = ____exports.zElement:default("physique"),
        portee = z:enum({"melee", "distance"}),
        puissance = z:number():default(8)
    }),
    rang_prefere = z:enum({"avant", "arriere"}),
    armure = z:number():default(0),
    passif = z:object({
        id = z:string(),
        nom = z:string(),
        description = z:string(),
        parametres = z:record(
            z:string(),
            z:number()
        ):default({})
    }),
    competences = z:array(z:string()):min(2),
    branches = z:array(z:object({
        id = z:string(),
        nom = z:string(),
        description = z:string(),
        competences = z:array(z:object({
            niveau = z:number():int(),
            competence = z:string()
        }))
    })):length(2),
    ultime = z:object({
        nom = z:string(),
        description = z:string()
    }),
    point_fort = z:string(),
    point_faible = z:string(),
    competences_detail = z:array(____exports.zCompetence)
})
____exports.zRace = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string(),
    modificateurs = ____exports.zCaracsPartielles,
    modificateurs_libres = z:object({
        plus = z:number():int(),
        moins = z:number():int()
    }):optional(),
    trait = z:object({
        id = z:string(),
        nom = z:string(),
        avantage = z:string(),
        defaut = z:string(),
        parametres = z:record(
            z:string(),
            z:number()
        ):default({})
    }),
    reputation_depart = z:record(
        z:string(),
        z:number()
    ):default({}),
    calque = z:boolean():default(true),
    echelle = z:number():default(1),
    teinte = z:string():optional()
})
____exports.zDon = z:object({
    id = z:string(),
    nom = z:string(),
    combat = z:string(),
    hors_combat = z:string(),
    parametres = z:record(
        z:string(),
        z:number()
    ):default({})
})
____exports.zEnnemi = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string():default(""),
    niveau = z:number():int(),
    caracteristiques = ____exports.zCaracs,
    pv = z:number():optional(),
    armure = z:number():default(0),
    resistances = z:record(
        z:string(),
        z:number()
    ):default({}),
    attaque = z:object({
        stat = ____exports.zCarac,
        element = ____exports.zElement:default("physique"),
        portee = z:enum({"melee", "distance"}),
        puissance = z:number():default(8)
    }),
    rang = z:enum({"avant", "arriere"}):default("avant"),
    competences = z:array(____exports.zCompetence):default({}),
    recompenses = z:object({
        xp = z:number(),
        ["or"] = z:number():default(0),
        objets = z:array(z:object({
            id = z:string(),
            chance = z:number()
        })):default({})
    }),
    categorie = z:enum({
        "bete",
        "demon",
        "mort-vivant",
        "humanoide",
        "construction",
        "esprit"
    }):default("humanoide"),
    boss = z:boolean():default(false),
    invocation = z:boolean():default(false),
    fuit_sous_pourcent = z:number():optional(),
    sprite = z:string():optional()
})
____exports.zRencontre = z:object({
    id = z:string(),
    nom = z:string(),
    fond = z:string():default("plaine"),
    ennemis = z:array(z:object({
        id = z:string(),
        rang = z:enum({"avant", "arriere"}):optional()
    })):min(1),
    renforts = z:array(z:string()):default({}),
    fuite_possible = z:boolean():default(true)
})
____exports.zObjet = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string(),
    type = z:enum({
        "consommable",
        "cadeau",
        "equipement",
        "quete",
        "materiau"
    }),
    prix = z:number():default(0),
    effets = z:array(____exports.zEffet):default({}),
    cible = ____exports.zCible:default("soi"),
    emplacement = z:enum({"arme", "armure", "accessoire"}):optional(),
    bonus = z:object({
        armure = z:number():default(0),
        puissance = z:number():default(0),
        caracs = ____exports.zCaracsPartielles:default({})
    }):optional()
})
____exports.zCompagnon = z:object({
    id = z:string(),
    nom = z:string(),
    titre = z:string(),
    age = z:number():int():min(18),
    genre = z:enum({"f", "m", "autre"}),
    personnalite = z:string(),
    passe = z:string(),
    objectif = z:string(),
    chapitre_arrivee = z:number():int(),
    lignes_rouges = z:array(z:object({
        flag = z:string(),
        description = z:string(),
        definitive = z:boolean():default(false),
        penalite = z:number():default(-30)
    })),
    cadeaux = z:object({
        prefere = z:array(z:string()),
        apprecie = z:array(z:string()),
        deteste = z:array(z:string())
    }),
    combat = z:object({
        caracteristiques = ____exports.zCaracs,
        attaque = z:object({
            stat = ____exports.zCarac,
            element = ____exports.zElement:default("physique"),
            portee = z:enum({"melee", "distance"}),
            puissance = z:number():default(8)
        }),
        armure = z:number():default(0),
        rang = z:enum({"avant", "arriere"}),
        competences = z:array(____exports.zCompetence):default({})
    }),
    bonus_paliers = z:record(
        z:string(),
        z:object({
            id = z:string(),
            nom = z:string(),
            description = z:string(),
            parametres = z:record(
                z:string(),
                z:number()
            ):default({})
        })
    ),
    quete = z:string():optional()
})
____exports.zCondition = z:lazy(function() return z:object({
    flag = z:string():optional(),
    pas_flag = z:string():optional(),
    race = z:union({
        z:string(),
        z:array(z:string())
    }):optional(),
    classe = z:union({
        z:string(),
        z:array(z:string())
    }):optional(),
    origine = z:enum({"invoque", "reincarne"}):optional(),
    don = z:string():optional(),
    affinite_min = z:record(
        z:string(),
        z:number()
    ):optional(),
    affinite_palier = z:record(
        z:string(),
        z:string()
    ):optional(),
    reputation_min = z:record(
        z:string(),
        z:number()
    ):optional(),
    carac_min = ____exports.zCaracsPartielles:optional(),
    niveau_min = z:number():optional(),
    or_min = z:number():optional(),
    objet = z:string():optional(),
    quete_etape = z:record(
        z:string(),
        z:string()
    ):optional(),
    quete_terminee = z:string():optional(),
    date_min = z:object({
        annee = z:number(),
        mois = z:number():default(1),
        jour = z:number():default(1)
    }):optional(),
    rang_guilde_min = z:string():optional(),
    ou = z:array(____exports.zCondition):optional()
}) end)
____exports.zConsequence = z:object({
    flag = z:union({
        z:string(),
        z:array(z:string())
    }):optional(),
    retirer_flag = z:string():optional(),
    reputation = z:record(
        z:string(),
        z:number()
    ):optional(),
    affinite = z:record(
        z:string(),
        z:number()
    ):optional(),
    xp = z:number():optional(),
    ["or"] = z:number():optional(),
    objet = z:union({
        z:string(),
        z:array(z:string())
    }):optional(),
    retirer_objet = z:string():optional(),
    points_guilde = z:number():optional(),
    quete = z:object({
        id = z:string(),
        etape = z:string()
    }):optional(),
    terminer_quete = z:string():optional(),
    recruter = z:string():optional(),
    pnj_mort = z:string():optional(),
    atout = z:string():optional(),
    origine_enfance = z:string():optional(),
    contact = z:string():optional(),
    journal = z:string():optional(),
    avancer_temps = z:object({
        jours = z:number():default(0),
        mois = z:number():default(0)
    }):optional(),
    aller_date = z:object({
        annee = z:number(),
        mois = z:number(),
        jour = z:number():default(1)
    }):optional(),
    ellipse = z:object({
        jusqua = z:object({
            annee = z:number(),
            mois = z:number(),
            jour = z:number():default(1)
        }),
        titre = z:string()
    }):optional(),
    fin_chapitre = z:number():optional(),
    soigner_groupe = z:boolean():optional()
})
____exports.zReplique = z:object({
    qui = z:string():default("narrateur"),
    expression = z:string():default("neutre"),
    dit = z:string(),
    si = ____exports.zCondition:optional()
})
____exports.zChoix = z:object({
    texte = z:string(),
    si = ____exports.zCondition:optional(),
    visible_si_bloque = z:boolean():default(false),
    test = z:object({
        carac = ____exports.zCarac,
        difficulte = z:number(),
        reussite = z:string(),
        echec = z:string()
    }):optional(),
    effets = z:array(____exports.zConsequence):default({}),
    aller = z:string():optional()
})
____exports.zNoeud = z:object({
    decor = z:string():optional(),
    repliques = z:array(____exports.zReplique):default({}),
    effets = z:array(____exports.zConsequence):default({}),
    choix = z:array(____exports.zChoix):default({}),
    suite = z:string():optional(),
    combat = z:object({
        rencontre = z:string(),
        victoire = z:string(),
        defaite = z:string()
    }):optional(),
    donjon = z:object({
        id = z:string(),
        sortie = z:string()
    }):optional(),
    fin = z:boolean():default(false)
})
____exports.zScene = z:object({
    id = z:string(),
    titre = z:string(),
    type = z:enum({"groupe", "individuel"}),
    lieu = z:string():optional(),
    decor = z:string(),
    debut = z:string():default("debut"),
    disponible_si = ____exports.zCondition:optional(),
    repetable = z:boolean():default(false),
    quete = z:string():optional(),
    noeuds = z:record(
        z:string(),
        ____exports.zNoeud
    )
})
____exports.zQuete = z:object({
    id = z:string(),
    titre = z:string(),
    type = z:enum({
        "principale",
        "secondaire",
        "classe",
        "compagnon",
        "contrat"
    }),
    chapitre = z:number():int(),
    region = z:string():default("aubeclaire"),
    resume = z:string(),
    etapes = z:array(z:object({
        id = z:string(),
        objectif = z:string(),
        scene = z:string():optional(),
        lieu = z:string():optional()
    }))
})
____exports.zLieu = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string(),
    decor = z:string(),
    position = z:object({
        x = z:number(),
        y = z:number()
    }),
    disponible_si = ____exports.zCondition:optional(),
    pnj = z:array(z:object({
        id = z:string(),
        si = ____exports.zCondition:optional()
    })):default({}),
    boutique = z:array(z:string()):default({})
})
____exports.zRegion = z:object({
    id = z:string(),
    nom = z:string(),
    carte = z:string(),
    lieux = z:array(____exports.zLieu)
})
____exports.zPnj = z:object({
    id = z:string(),
    nom = z:string(),
    titre = z:string():default(""),
    description = z:string():default("")
})
____exports.zDonjon = z:object({
    id = z:string(),
    nom = z:string(),
    tileset = z:string(),
    carte = z:array(z:string()):min(3),
    legende = z:record(
        z:string(),
        z:string()
    ),
    depart = z:object({
        x = z:number():int(),
        y = z:number():int()
    }),
    evenements = z:array(z:object({
        id = z:string(),
        x = z:number():int(),
        y = z:number():int(),
        type = z:enum({
            "combat",
            "coffre",
            "piege",
            "scene",
            "sortie",
            "texte"
        }),
        rencontre = z:string():optional(),
        objets = z:array(z:string()):default({}),
        ["or"] = z:number():default(0),
        texte = z:string():optional(),
        degats_pourcent = z:number():default(0),
        test = z:object({
            carac = ____exports.zCarac,
            difficulte = z:number()
        }):optional(),
        scene = z:string():optional(),
        unique = z:boolean():default(true),
        si = ____exports.zCondition:optional()
    }))
})
____exports.zContrat = z:object({
    id = z:string(),
    titre = z:string(),
    description = z:string(),
    rang_min = z:string():default("F"),
    rencontre = z:string():optional(),
    test = z:object({
        carac = ____exports.zCarac,
        difficulte = z:number()
    }):optional(),
    duree_jours = z:number():int(),
    recompenses = z:object({
        ["or"] = z:number(),
        xp = z:number(),
        points_guilde = z:number(),
        objets = z:array(z:string()):default({})
    }),
    disponible_si = ____exports.zCondition:optional()
})
____exports.zActivite = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string(),
    disponible_si = ____exports.zCondition:optional(),
    gains = z:object({
        xp_pourcent_niveau = z:number():default(0),
        or_base = z:number():default(0),
        or_par_carac = z:object({
            carac = ____exports.zCarac,
            valeur = z:number()
        }):optional(),
        affinite = z:number():default(0),
        affinite_tous = z:number():default(0),
        points_guilde = z:number():default(0),
        objet_artisanat = z:boolean():default(false),
        carac_plus_un = z:boolean():default(false),
        soigne_blessure = z:boolean():default(false)
    }),
    choix_compagnon = z:boolean():default(false)
})
____exports.zDifficulte = z:object({
    puissance = z:number(),
    pv = z:number(),
    degats = z:number(),
    ennemis_en_plus = z:number():int()
})
____exports.zConfig = z:object({
    saison_actuelle = z:number():int(),
    saisons = z:array(z:object({
        numero = z:number():int(),
        titre = z:string(),
        annee_debut = z:number():int(),
        annees_par_chapitre = z:number():int(),
        chapitres = z:number():int(),
        sessions_par_chapitre = z:number():int(),
        niveau_max = z:number():int(),
        niveau_ultime = z:number():int()
    })):min(1),
    calendrier = z:object({
        jours_par_mois = z:number():int(),
        mois = z:array(z:object({
            nom = z:string(),
            saison = z:string()
        })):length(12),
        fetes = z:array(z:object({
            nom = z:string(),
            mois = z:number():int(),
            jour = z:number():int()
        }))
    }),
    ellipses = z:object({
        entre_quetes_mois = z:array(z:number()):length(2),
        activites_temps_libre = z:number():int(),
        duree_reference_mois = z:number()
    }),
    personnage = z:object({
        total_caracteristiques = z:number():int(),
        carac_min = z:number():int(),
        carac_max = z:number():int(),
        points_carac_par_niveau = z:number():int(),
        age_invoque_min = z:number():int(),
        age_invoque_max = z:number():int(),
        annee_naissance_reincarne = z:number():int(),
        niveau_branche = z:number():int(),
        rang_competence_max = z:number():int(),
        variantes_max = z:number():int():default(2),
        competences_equipees_max = z:number():int():default(6),
        fusion_rang_min = z:number():int():default(2)
    }),
    experience = z:object({
        base = z:number(),
        exposant = z:number()
    }),
    affinite = z:object({
        paliers = z:array(z:object({
            id = z:string(),
            nom = z:string(),
            seuil = z:number()
        })),
        cadeau = z:object({
            prefere = z:number(),
            apprecie = z:number(),
            neutre = z:number(),
            deteste = z:number()
        }),
        jours_entre_cadeaux = z:number():int()
    }),
    reputation = z:object({paliers = z:array(z:object({
        nom = z:string(),
        seuil = z:number()
    }))}),
    guilde = z:object({rangs = z:array(z:object({
        rang = z:string(),
        points = z:number()
    }))}),
    difficulte = z:array(____exports.zDifficulte):min(1),
    combat = z:object({
        minuteur_tour_secondes = z:number(),
        regen_mana_base = z:number(),
        defense_par_vit = z:number(),
        resistance_par_esp = z:number(),
        toucher_base = z:number(),
        toucher_par_agi = z:number(),
        toucher_min = z:number(),
        toucher_max = z:number(),
        critique_base = z:number(),
        critique_par_agi = z:number(),
        multiplicateur_critique = z:number(),
        variance_degats = z:number(),
        potions_depart = z:number():int()
    }),
    mort_douce = z:object({
        perte_or_pourcent = z:number(),
        blessure_pv_pourcent = z:number()
    }),
    graphismes = z:record(
        z:string(),
        z:number()
    )
})
return ____exports
 end,
["src.contenu.types"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
return ____exports
 end,
["src.moteur.outils"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local ____exports = {}
--- Tri stable (tri fusion) : même résultat en JavaScript et en Luau, sans modifier la liste d'origine.
function ____exports.trier(liste, comparer)
    if #liste <= 1 then
        return __TS__ArraySlice(liste)
    end
    local milieu = math.floor(#liste / 2)
    local g = ____exports.trier(
        __TS__ArraySlice(liste, 0, milieu),
        comparer
    )
    local d = ____exports.trier(
        __TS__ArraySlice(liste, milieu),
        comparer
    )
    local res = {}
    local i = 0
    local j = 0
    while i < #g and j < #d do
        if comparer(d[j + 1], g[i + 1]) < 0 then
            local ____j_0 = j
            j = ____j_0 + 1
            res[#res + 1] = d[____j_0 + 1]
        else
            local ____i_1 = i
            i = ____i_1 + 1
            res[#res + 1] = g[____i_1 + 1]
        end
    end
    while i < #g do
        local ____i_2 = i
        i = ____i_2 + 1
        res[#res + 1] = g[____i_2 + 1]
    end
    while j < #d do
        local ____j_3 = j
        j = ____j_3 + 1
        res[#res + 1] = d[____j_3 + 1]
    end
    return res
end
--- « Vrai » au sens de JavaScript : ni undefined, null, false, 0, "" ni NaN (en Luau, 0 et "" sont vrais).
function ____exports.vrai(x)
    return x ~= nil and x ~= nil and x ~= false and x ~= 0 and x ~= "" and x == x
end
--- Clés d'un objet, triées (en Luau, l'ordre de parcours d'une table n'est pas garanti).
function ____exports.cles(o)
    local res = {}
    for k in pairs(o) do
        res[#res + 1] = k
    end
    return ____exports.trier(
        res,
        function(a, b) return (if a < b then -1 else (if a > b then 1 else 0)) end
    )
end
--- Valeurs d'un objet, dans l'ordre de ses clés triées.
function ____exports.valeurs(o)
    return __TS__ArrayMap(
        ____exports.cles(o),
        function(____, k) return o[k] end
    )
end
--- Paires [clé, valeur] d'un objet, dans l'ordre de ses clés triées.
function ____exports.entrees(o)
    return __TS__ArrayMap(
        ____exports.cles(o),
        function(____, k) return {k, o[k]} end
    )
end
--- Copie profonde de données simples (objets, listes, nombres, textes, booléens).
function ____exports.copieProfonde(x)
    if x == nil or type(x) ~= "table" then
        return x
    end
    if __TS__ArrayIsArray(x) then
        return __TS__ArrayMap(
            x,
            function(____, v) return ____exports.copieProfonde(v) end
        )
    end
    local res = {}
    for k in pairs(x) do
        res[k] = ____exports.copieProfonde(x[k])
    end
    return res
end
--- Multiplication entière 32 bits (équivalent de Math.imul, absent en Luau).
function ____exports.imul(a, b)
    local aHaut = bit32.band(
        bit32.rshift(a, 16),
        65535
    )
    local aBas = bit32.band(a, 65535)
    local bHaut = bit32.band(
        bit32.rshift(b, 16),
        65535
    )
    local bBas = bit32.band(b, 65535)
    return bit32.bor(
        aBas * bBas + bit32.rshift(
            bit32.lshift(aHaut * bBas + aBas * bHaut, 16),
            0
        ),
        0
    )
end
return ____exports
 end,
["src.moteur.affinite"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local ____exports = {}
local ____outils = require("src.moteur.outils")
local trier = ____outils.trier
local vrai = ____outils.vrai
____exports.affiniteVide = function() return {points = 0, blocage = nil, dernierCadeau = nil, lignesFranchies = {}} end
function ____exports.paliers(contenu)
    return trier(
        {table.unpack(contenu.config.affinite.paliers)},
        function(a, b) return a.seuil - b.seuil end
    )
end
--- Palier effectif (tient compte des blocages et de la quête personnelle pour « Engagée »).
function ____exports.palier(contenu, a, queteTerminee)
    local ps = ____exports.paliers(contenu)
    local i = 0
    do
        local k = 0
        while k < #ps do
            if a.points >= ps[k + 1].seuil then
                i = k
            end
            k = k + 1
        end
    end
    local iProche = __TS__ArrayFindIndex(
        ps,
        function(____, p) return p.id == "proche" end
    )
    local iAlliee = __TS__ArrayFindIndex(
        ps,
        function(____, p) return p.id == "alliee" end
    )
    local iEngagee = __TS__ArrayFindIndex(
        ps,
        function(____, p) return p.id == "engagee" end
    )
    if a.blocage == "definitive" then
        i = math.min(i, iAlliee)
    end
    if a.blocage == "temporaire" then
        i = math.min(i, iProche)
    end
    if i == iEngagee and not queteTerminee then
        i = iEngagee - 1
    end
    return {id = ps[i + 1].id, nom = ps[i + 1].nom, index = i}
end
--- Paliers atteints (pour les bonus de combat cumulés).
function ____exports.paliersAtteints(contenu, a, queteTerminee)
    local p = ____exports.palier(contenu, a, queteTerminee)
    return __TS__ArrayMap(
        __TS__ArraySlice(
            ____exports.paliers(contenu),
            0,
            p.index + 1
        ),
        function(____, x) return x.id end
    )
end
--- Modifie l'affinité ; renvoie la variation réellement appliquée.
function ____exports.modifierAffinite(contenu, a, delta, opts)
    if opts.ageHeros < 18 then
        return 0
    end
    local d = delta
    if d > 0 and vrai(opts.bonusDialogue) then
        d = math.floor(d * (1 + opts.bonusDialogue) + 0.5)
    end
    local plafond = (if a.blocage == "definitive" then __TS__ArrayFind(
        ____exports.paliers(contenu),
        function(____, p) return p.id == "proche" end
    ).seuil - 1 else 100)
    local avant = a.points
    a.points = math.max(
        0,
        math.min(plafond, a.points + d)
    )
    return a.points - avant
end
function ____exports.reactionCadeau(contenu, compagnonId, objetId)
    local c = contenu.compagnons[compagnonId].cadeaux
    if __TS__ArrayIncludes(c.prefere, objetId) then
        return "prefere"
    end
    if __TS__ArrayIncludes(c.apprecie, objetId) then
        return "apprecie"
    end
    if __TS__ArrayIncludes(c.deteste, objetId) then
        return "deteste"
    end
    return "neutre"
end
function ____exports.peutOffrir(contenu, a, jour)
    return a.dernierCadeau == nil or jour - a.dernierCadeau >= contenu.config.affinite.jours_entre_cadeaux
end
--- Vérifie les lignes rouges d'un compagnon après un changement de drapeaux. Renvoie les lignes franchies maintenant.
function ____exports.verifierLignesRouges(contenu, compagnonId, a, aLeFlag)
    local nouvelles = {}
    for ____, l in ipairs(contenu.compagnons[compagnonId].lignes_rouges) do
        if __TS__ArrayIncludes(a.lignesFranchies, l.flag) or not aLeFlag(l.flag) then
            continue
        end
        local ____a_lignesFranchies_0 = a.lignesFranchies
        ____a_lignesFranchies_0[#____a_lignesFranchies_0 + 1] = l.flag
        a.points = math.max(0, a.points + l.penalite)
        a.blocage = (if l.definitive then "definitive" else (if a.blocage == "definitive" then "definitive" else "temporaire"))
        nouvelles[#nouvelles + 1] = l.description
    end
    return nouvelles
end
function ____exports.pardonner(a)
    if a.blocage == "temporaire" then
        a.blocage = nil
    end
end
return ____exports
 end,
["src.moteur.rng"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringCharCodeAt = ____lualib.__TS__StringCharCodeAt
local ____exports = {}
local ____outils = require("src.moteur.outils")
local imul = ____outils.imul
function ____exports.creerRng(graine)
    local h = bit32.rshift(2166136261, 0)
    local s = tostring(graine)
    do
        local i = 0
        while i < #s do
            h = bit32.rshift(
                imul(
                    bit32.bxor(
                        h,
                        __TS__StringCharCodeAt(s, i)
                    ),
                    16777619
                ),
                0
            )
            i = i + 1
        end
    end
    return {etat = (if h ~= 0 then h else 1)}
end
--- Nombre dans [0, 1[ (algorithme mulberry32). Fait avancer l'état.
function ____exports.aleatoire(rng)
    rng.etat = bit32.rshift(rng.etat + 1831565813, 0)
    local t = rng.etat
    t = imul(
        bit32.bxor(
            t,
            bit32.rshift(t, 15)
        ),
        bit32.bor(t, 1)
    )
    t = bit32.bxor(
        t,
        t + imul(
            bit32.bxor(
                t,
                bit32.rshift(t, 7)
            ),
            bit32.bor(t, 61)
        )
    )
    return bit32.rshift(
        bit32.bxor(
            t,
            bit32.rshift(t, 14)
        ),
        0
    ) / 4294967296
end
--- Entier entre min et max inclus.
function ____exports.entier(rng, min, max)
    return min + math.floor(____exports.aleatoire(rng) * (max - min + 1))
end
function ____exports.de(rng, faces)
    return ____exports.entier(rng, 1, faces)
end
function ____exports.chance(rng, p)
    return ____exports.aleatoire(rng) < p
end
function ____exports.choisir(rng, liste)
    return liste[math.floor(____exports.aleatoire(rng) * #liste) + 1]
end
return ____exports
 end,
["src.moteur.personnage"] = function(...) 
local ____lualib = require("lualib_bundle")
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__New = ____lualib.__TS__New
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__StringTrim = ____lualib.__TS__StringTrim
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ObjectFromEntries = ____lualib.__TS__ObjectFromEntries
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local ____exports = {}
local monterNiveau
local ____constantes = require("src.contenu.constantes")
local CARACS = ____constantes.CARACS
local ____outils = require("src.moteur.outils")
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
function ____exports.niveauMax(contenu)
    local s = __TS__ArrayFind(
        contenu.config.saisons,
        function(____, x) return x.numero == contenu.config.saison_actuelle end
    ) or contenu.config.saisons[1]
    return math.max(table.unpack(__TS__ArrayMap(
        __TS__ArrayFilter(
            contenu.config.saisons,
            function(____, x) return x.numero <= s.numero end
        ),
        function(____, x) return x.niveau_max end
    )))
end
function monterNiveau(contenu, h)
    h.niveau = h.niveau + 1
    h.pointsCaracDispo = h.pointsCaracDispo + contenu.config.personnage.points_carac_par_niveau
    h.pointsCompetenceDispo = h.pointsCompetenceDispo + 1
end
--- Monte directement un héros à un niveau (joueur qui rejoint en cours de route).
function ____exports.monterJusquA(contenu, h, niveau, repartirAuto)
    while h.niveau < math.min(
        niveau,
        ____exports.niveauMax(contenu)
    ) do
        monterNiveau(contenu, h)
    end
    if repartirAuto then
        ____exports.repartitionAutomatique(contenu, h)
    end
end
--- Répartition automatique (modifiable ensuite) : la caractéristique d'attaque, puis VIT, puis l'ESP.
function ____exports.repartitionAutomatique(contenu, h)
    local cl = contenu.classes[h.classe]
    local ordre = {
        cl.attaque.stat,
        "VIT",
        cl.attaque.stat,
        "ESP",
        "AGI"
    }
    local i = 0
    while h.pointsCaracDispo > 0 do
        local ____i_6 = i
        i = ____i_6 + 1
        local c = ordre[____i_6 % #ordre + 1]
        if ____exports.caracsTotales(contenu, h)[c] < 99 then
            local ____h_caracsBonus_7, ____c_8 = h.caracsBonus, c
            ____h_caracsBonus_7[____c_8] = ____h_caracsBonus_7[____c_8] + 1
            h.pointsCaracDispo = h.pointsCaracDispo - 1
        end
    end
    if h.niveau >= contenu.config.personnage.niveau_branche and not vrai(h.branche) then
        ____exports.choisirBranche(contenu, h, cl.branches[1].id)
    end
    local comps = ____exports.competencesConnues(contenu, h)
    while h.pointsCompetenceDispo > 0 and #comps > 0 do
        local cible = __TS__ArrayReduce(
            comps,
            function(____, a, b) return (if (h.rangsCompetences[a] or 1) <= (h.rangsCompetences[b] or 1) then a else b) end
        )
        if (h.rangsCompetences[cible] or 1) >= contenu.config.personnage.rang_competence_max then
            break
        end
        ____exports.ameliorerCompetence(contenu, h, cible)
    end
end
function ____exports.choisirBranche(contenu, h, brancheId)
    local cl = contenu.classes[h.classe]
    if vrai(h.branche) then
        error(
            __TS__New(Error, "La branche est déjà choisie"),
            0
        )
    end
    if h.niveau < contenu.config.personnage.niveau_branche then
        error(
            __TS__New(
                Error,
                "Branche disponible au niveau " .. tostring(contenu.config.personnage.niveau_branche)
            ),
            0
        )
    end
    if not __TS__ArraySome(
        cl.branches,
        function(____, b) return b.id == brancheId end
    ) then
        error(
            __TS__New(Error, "Branche inconnue"),
            0
        )
    end
    h.branche = brancheId
end
function ____exports.competencesConnues(contenu, h)
    local cl = contenu.classes[h.classe]
    local res = {table.unpack(cl.competences)}
    local b = __TS__ArrayFind(
        cl.branches,
        function(____, x) return x.id == h.branche end
    )
    if b then
        for ____, c in ipairs(b.competences) do
            if h.niveau >= c.niveau then
                res[#res + 1] = c.competence
            end
        end
    end
    return res
end
function ____exports.ameliorerCompetence(contenu, h, id)
    if h.pointsCompetenceDispo <= 0 then
        error(
            __TS__New(Error, "Aucun point de compétence disponible"),
            0
        )
    end
    if not __TS__ArrayIncludes(
        ____exports.competencesConnues(contenu, h),
        id
    ) then
        error(
            __TS__New(Error, "Compétence non connue"),
            0
        )
    end
    local r = h.rangsCompetences[id] or 1
    if r >= contenu.config.personnage.rang_competence_max then
        error(
            __TS__New(Error, "Rang maximum atteint"),
            0
        )
    end
    h.rangsCompetences[id] = r + 1
    h.pointsCompetenceDispo = h.pointsCompetenceDispo - 1
end
function ____exports.caracsTotales(contenu, h)
    local res = __TS__ObjectAssign({}, h.caracsBase)
    for ____, c in ipairs(CARACS) do
        res[c] = res[c] + h.caracsBonus[c]
    end
    for ____, slot in ipairs(valeurs(h.equipement)) do
        local o = (if vrai(slot) then contenu.objets[slot] else nil)
        for ____, c in ipairs(CARACS) do
            local ____res_17, ____c_18 = res, c
            local ____opt_13 = o and o.bonus
            local ____opt_11 = ____opt_13 and ____opt_13.caracs
            ____res_17[____c_18] = ____res_17[____c_18] + (____opt_11 and ____opt_11[c] or 0)
        end
    end
    return res
end
____exports.caracsVides = function() return {
    FOR = 0,
    AGI = 0,
    INT = 0,
    VIT = 0,
    ESP = 0,
    CHA = 0
} end
function ____exports.caracsDeDepart(contenu, classe, race, libres)
    local cl = contenu.classes[classe]
    local ra = contenu.races[race]
    if not cl then
        error(
            __TS__New(Error, "Classe inconnue : " .. classe),
            0
        )
    end
    if not ra then
        error(
            __TS__New(Error, "Race inconnue : " .. race),
            0
        )
    end
    local cfg = contenu.config.personnage
    local res = __TS__ObjectAssign({}, cl.caracteristiques)
    for ____, c in ipairs(CARACS) do
        res[c] = res[c] + (ra.modificateurs[c] or 0)
    end
    if ra.modificateurs_libres then
        local inutiles = __TS__ArrayFilter(
            {
                "CHA",
                "INT",
                "FOR",
                "ESP",
                "AGI"
            },
            function(____, c) return c ~= cl.attaque.stat and c ~= "VIT" end
        )
        local plus = libres and libres.plus or ({[cl.attaque.stat] = 1, VIT = 1})
        local moins = libres and libres.moins or ({[inutiles[1]] = 1, [inutiles[(if cl.attaque.stat == "INT" then 2 else 1) + 1]] = 1})
        for ____, c in ipairs(CARACS) do
            if (plus[c] or 0) > 1 or (moins[c] or 0) > 1 then
                error(
                    __TS__New(Error, "Répartition libre : au plus +1 ou −1 par caractéristique"),
                    0
                )
            end
            if (plus[c] or 0) > 0 and (moins[c] or 0) > 0 then
                error(
                    __TS__New(Error, "Répartition libre : une même caractéristique ne peut pas avoir +1 et −1"),
                    0
                )
            end
        end
        local sp = __TS__ArrayReduce(
            valeurs(plus),
            function(____, a, b) return a + (b or 0) end,
            0
        )
        local sm = __TS__ArrayReduce(
            valeurs(moins),
            function(____, a, b) return a + (b or 0) end,
            0
        )
        if sp ~= ra.modificateurs_libres.plus or sm ~= ra.modificateurs_libres.moins then
            error(
                __TS__New(
                    Error,
                    (("Répartition libre invalide : il faut +" .. tostring(ra.modificateurs_libres.plus)) .. " et −") .. tostring(ra.modificateurs_libres.moins)
                ),
                0
            )
        end
        for ____, c in ipairs(CARACS) do
            res[c] = res[c] + ((plus[c] or 0) - (moins[c] or 0))
        end
    end
    for ____, c in ipairs(CARACS) do
        if res[c] < cfg.carac_min or res[c] > cfg.carac_max then
            error(
                __TS__New(
                    Error,
                    ((((((c .. " = ") .. tostring(res[c])) .. " hors limites (") .. tostring(cfg.carac_min)) .. " à ") .. tostring(cfg.carac_max)) .. ")"
                ),
                0
            )
        end
    end
    return res
end
function ____exports.creerHeros(contenu, o)
    local cfg = contenu.config.personnage
    if not contenu.dons[o.don] then
        error(
            __TS__New(Error, "Don inconnu : " .. o.don),
            0
        )
    end
    local age = (if o.origine == "reincarne" then o.anneeCampagne - cfg.annee_naissance_reincarne else o.age or 20)
    if o.origine == "invoque" and (age < cfg.age_invoque_min or age > cfg.age_invoque_max) then
        error(
            __TS__New(
                Error,
                ((("Âge d'un invoqué : entre " .. tostring(cfg.age_invoque_min)) .. " et ") .. tostring(cfg.age_invoque_max)) .. " ans"
            ),
            0
        )
    end
    local cl = contenu.classes[o.classe]
    local h = {
        id = o.id,
        joueurId = o.joueurId,
        nom = (if vrai(__TS__StringTrim(o.nom)) then __TS__StringTrim(o.nom) else "Héros sans nom"),
        classe = o.classe,
        race = o.race,
        don = o.don,
        origine = o.origine,
        anneeNaissance = o.anneeCampagne - age,
        niveau = 1,
        xp = 0,
        caracsBase = ____exports.caracsDeDepart(contenu, o.classe, o.race, o.libres),
        caracsBonus = ____exports.caracsVides(),
        pointsCaracDispo = 0,
        pointsCompetenceDispo = 0,
        rangsCompetences = __TS__ObjectFromEntries(__TS__ArrayMap(
            cl.competences,
            function(____, c) return {c, 1} end
        )),
        branche = nil,
        equipement = {arme = nil, armure = nil, accessoire = nil},
        inventaire = {["potion-soin-petite"] = contenu.config.combat.potions_depart},
        ["or"] = 50,
        blessure = false,
        atout = nil,
        origineEnfance = nil,
        contacts = {},
        portrait = nil,
        siAbsent = "ia",
        variantes = {},
        varianteActive = {},
        equipees = nil
    }
    if vrai(o.niveau) and o.niveau > 1 then
        ____exports.monterJusquA(contenu, h, o.niveau, true)
    end
    return h
end
--- XP nécessaire pour passer du niveau n au niveau n+1.
function ____exports.xpPourNiveau(contenu, n)
    local e = contenu.config.experience
    return math.floor(e.base * n ^ e.exposant + 0.5)
end
--- Ajoute de l'XP ; renvoie le nombre de niveaux gagnés.
function ____exports.gagnerXp(contenu, h, xp)
    local ____opt_4 = contenu.dons[h.don]
    local bonus = ____opt_4 and ____opt_4.parametres.xp or 0
    h.xp = h.xp + math.floor(xp * (1 + bonus) + 0.5)
    local gagnes = 0
    while h.niveau < ____exports.niveauMax(contenu) and h.xp >= ____exports.xpPourNiveau(contenu, h.niveau) do
        h.xp = h.xp - ____exports.xpPourNiveau(contenu, h.niveau)
        monterNiveau(contenu, h)
        gagnes = gagnes + 1
    end
    if h.niveau >= ____exports.niveauMax(contenu) then
        h.xp = 0
    end
    return gagnes
end
function ____exports.repartirPoint(contenu, h, c)
    if h.pointsCaracDispo <= 0 then
        error(
            __TS__New(Error, "Aucun point de caractéristique disponible"),
            0
        )
    end
    local ____h_caracsBonus_9, ____c_10 = h.caracsBonus, c
    ____h_caracsBonus_9[____c_10] = ____h_caracsBonus_9[____c_10] + 1
    h.pointsCaracDispo = h.pointsCaracDispo - 1
end
--- Compétences utilisables en combat (au plus `competences_equipees_max`).
function ____exports.competencesEquipees(contenu, h)
    local max = contenu.config.personnage.competences_equipees_max
    local connues = ____exports.competencesConnues(contenu, h)
    local choix = (if h.equipees then __TS__ArrayFilter(
        h.equipees,
        function(____, id) return __TS__ArrayIncludes(connues, id) end
    ) else connues)
    return __TS__ArraySlice(choix, 0, max)
end
function ____exports.pvMax(contenu, vit, niveau)
    return math.floor(30 + 5 * vit + 4 * (niveau - 1) * (1 + vit / 20) + 0.5)
end
function ____exports.manaMax(esp, niveau)
    return math.floor(10 + 3 * esp + 2 * (niveau - 1) + 0.5)
end
function ____exports.age(h, annee)
    return annee - h.anneeNaissance
end
--- Niveau moyen du groupe (arrondi à l'inférieur) : niveau d'arrivée d'un nouveau joueur.
function ____exports.niveauMoyen(heros)
    if #heros == 0 then
        return 1
    end
    return math.max(
        1,
        math.floor(__TS__ArrayReduce(
            heros,
            function(____, a, h) return a + h.niveau end,
            0
        ) / #heros)
    )
end
function ____exports.competenceDe(contenu, id)
    local c = contenu.competences[id]
    if not c then
        error(
            __TS__New(Error, "Compétence inconnue : " .. id),
            0
        )
    end
    return c
end
return ____exports
 end,
["src.moteur.combat"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ObjectFromEntries = ____lualib.__TS__ObjectFromEntries
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__New = ____lualib.__TS__New
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__StringSplit = ____lualib.__TS__StringSplit
local __TS__Number = ____lualib.__TS__Number
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local Map = ____lualib.Map
local __TS__ArrayEvery = ____lualib.__TS__ArrayEvery
local ____exports = {}
local sansParticularite, log, aEtat, valeurEtat, ajouterEtat, toutesCompetences, multiplicateurDegatsSource, reductionCible, chanceToucher, chanceCritique, infliger, mettreKo, soigner, invoquer, resoudreCibles, appliquerEffets, attaqueSimple, calculerOrdre, verifierFin, debutTour, finTour, debutRound, verifierAction, pacifiable, executer, conditionIA, dejaActif, choisirCibleEnnemie, ETATS_NEGATIFS, ETATS_CONTROLE, actif, ELEMENTS_MAGIQUES
local ____rng = require("src.moteur.rng")
local aleatoire = ____rng.aleatoire
local chance = ____rng.chance
local choisir = ____rng.choisir
local de = ____rng.de
local ____outils = require("src.moteur.outils")
local cles = ____outils.cles
local copieProfonde = ____outils.copieProfonde
local entrees = ____outils.entrees
local trier = ____outils.trier
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
local ____personnage = require("src.moteur.personnage")
local caracsTotales = ____personnage.caracsTotales
local competencesEquipees = ____personnage.competencesEquipees
local manaMax = ____personnage.manaMax
local pvMax = ____personnage.pvMax
--- Créatures sans tête ni membres (gelées, esprits, constructions simples).
function ____exports.sansMembres(x)
    return __TS__ArraySome(
        {"gelee", "feu-follet", "tourelle", "champignon"},
        function(____, p) return __TS__StringStartsWith(x.refId, p) end
    )
end
function sansParticularite()
    return {passif = nil, trait = nil, don = nil, bonusCompagnon = {}}
end
function ____exports.combattantEnnemi(contenu, def, id, mult)
    if mult == nil then
        mult = {pv = 1, degats = 1}
    end
    local pmax = math.floor((def.pv or pvMax(contenu, def.caracteristiques.VIT, def.niveau)) * mult.pv + 0.5)
    return __TS__ObjectAssign(
        {
            id = id,
            nom = def.nom,
            camp = "ennemis",
            type = (if def.invocation then "invocation" else "ennemi"),
            refId = def.id,
            joueurId = nil,
            controle = false,
            herosId = nil,
            maitreId = nil,
            dureeInvocation = nil,
            niveau = def.niveau,
            caracs = __TS__ObjectAssign({}, def.caracteristiques),
            pvMax = pmax,
            pv = pmax,
            manaMax = 999,
            mana = 999,
            armure = def.armure,
            rang = def.rang,
            attaque = __TS__ObjectAssign({}, def.attaque),
            competences = {},
            competencesPropres = def.competences,
            recharges = {},
            etats = {},
            bouclier = 0,
            ko = false,
            parti = false
        },
        sansParticularite(),
        {
            resistances = def.resistances,
            resistanceMagique = 0,
            categorie = def.categorie,
            boss = def.boss,
            fuitSous = def.fuit_sous_pourcent or nil,
            compteurs = {multDegats = mult.degats},
            derniereCible = nil,
            potions = 0,
            bombes = 0,
            recompenses = def.recompenses,
            sprite = "ennemis/" .. (def.sprite or def.id),
            echelle = 1,
            teinte = nil,
            race = nil
        }
    )
end
function log(c, e)
    local ____c_evenements_20 = c.evenements
    ____c_evenements_20[#____c_evenements_20 + 1] = __TS__ObjectAssign({tour = c.tour}, e)
end
function ____exports.trouver(c, id)
    local x = __TS__ArrayFind(
        c.combattants,
        function(____, y) return y.id == id end
    )
    if not x then
        error(
            __TS__New(Error, "Combattant introuvable : " .. id),
            0
        )
    end
    return x
end
function aEtat(x, id)
    return __TS__ArraySome(
        x.etats,
        function(____, e) return e.id == id end
    )
end
function valeurEtat(x, id)
    return __TS__ArrayReduce(
        __TS__ArrayFilter(
            x.etats,
            function(____, e) return e.id == id end
        ),
        function(____, a, e) return a + e.valeur * e.cumul end,
        0
    )
end
function ajouterEtat(c, x, e, cumulMax)
    if cumulMax == nil then
        cumulMax = 1
    end
    local existant = __TS__ArrayFind(
        x.etats,
        function(____, y) return y.id == e.id and (e.id ~= "provoque" or y.source == e.source) end
    )
    if existant then
        existant.duree = math.max(existant.duree, e.duree)
        existant.valeur = math.max(existant.valeur, e.valeur)
        existant.cumul = math.min(cumulMax, existant.cumul + (if cumulMax > 1 then 1 else 0))
        if e.id == "provoque" then
            existant.source = e.source
        end
    else
        if e.id == "provoque" then
            x.etats = __TS__ArrayFilter(
                x.etats,
                function(____, y) return y.id ~= "provoque" end
            )
        end
        local ____x_etats_21 = x.etats
        ____x_etats_21[#____x_etats_21 + 1] = __TS__ObjectAssign({}, e)
    end
end
function ____exports.competenceCombattant(contenu, x, id)
    local propre = __TS__ArrayFind(
        x.competencesPropres,
        function(____, k) return k.id == id end
    )
    if propre then
        return {comp = propre, rang = x.compteurs["rang:" .. id] or 1}
    end
    local r = __TS__ArrayFind(
        x.competences,
        function(____, k) return k.id == id end
    )
    if r then
        return {comp = contenu.competences[id], rang = r.rang}
    end
    return nil
end
function toutesCompetences(contenu, x)
    local ____array_22 = __TS__SparseArrayNew(table.unpack(__TS__ArrayMap(
        x.competences,
        function(____, k) return {comp = contenu.competences[k.id], rang = k.rang} end
    )))
    __TS__SparseArrayPush(
        ____array_22,
        table.unpack(__TS__ArrayMap(
            x.competencesPropres,
            function(____, k) return {comp = k, rang = x.compteurs["rang:" .. k.id] or 1} end
        ))
    )
    return {__TS__SparseArraySpread(____array_22)}
end
function ____exports.competenceUtilisable(contenu, x, comp)
    if aEtat(x, "silence") then
        return false
    end
    if (x.recharges[comp.id] or 0) > 0 then
        return false
    end
    if x.mana < comp.cout then
        return false
    end
    if comp.id == "souffle-draconique" and (x.compteurs.souffle or 0) > 0 then
        return false
    end
    return true
end
--- Cibles valides d'une attaque, compte tenu de la portée, de la furtivité et de la provocation.
function ____exports.ciblesValides(c, x, ____type, portee)
    if ____type == "allie" then
        return ____exports.allies(c, x)
    end
    if ____type == "allie_ko" then
        return __TS__ArrayFilter(
            c.combattants,
            function(____, y) return y.camp == x.camp and y.ko and not y.parti and y.type ~= "invocation" end
        )
    end
    local liste = ____exports.adversaires(c, x)
    local visibles = __TS__ArrayFilter(
        liste,
        function(____, y) return not aEtat(y, "furtif") end
    )
    if #visibles > 0 then
        liste = visibles
    end
    local prov = __TS__ArrayFind(
        x.etats,
        function(____, e) return e.id == "provoque" end
    )
    if prov then
        local src = __TS__ArrayFind(
            liste,
            function(____, y) return y.id == prov.source end
        )
        if src then
            return {src}
        end
    end
    if portee == "melee" then
        local avant = __TS__ArrayFilter(
            liste,
            function(____, y) return y.rang == "avant" end
        )
        if #avant > 0 then
            return avant
        end
    end
    return liste
end
function multiplicateurDegatsSource(combat, s, cible, element)
    local m = 1 + valeurEtat(s, "bonus_degats")
    m = m * (1 - valeurEtat(s, "affaibli"))
    if s.type == "heros" or s.type == "compagnon" then
        m = m * (1 + 0.01 * (s.caracs.CHA - 10))
    end
    if s.camp == "ennemis" then
        m = m * (s.compteurs.multDegats or 1)
    end
    local ____opt_23 = s.passif
    if (____opt_23 and ____opt_23.id) == "sang-de-dragon" then
        local manque = 1 - s.pv / s.pvMax
        m = m * (1 + math.min(s.passif.parametres.max or 0.4, manque / 2))
    end
    local ____opt_25 = s.don
    if (____opt_25 and ____opt_25.id) == "oeil-du-seuil" then
        m = m * (1 + (s.don.parametres.degats or 0))
        if (cible.resistances[element] or 0) < 0 then
            m = m * (1 + (s.don.parametres.degats_faiblesse or 0))
        end
    end
    local ____opt_27 = s.don
    if (____opt_27 and ____opt_27.id) == "lien-des-betes" and cible.categorie == "bete" then
        m = m * (1 + (s.don.parametres.degats_betes or 0))
    end
    local ____opt_29 = s.trait
    if (____opt_29 and ____opt_29.id) == "instinct-de-meute" and __TS__ArraySome(
        combat.frappesCeTour[cible.id] or ({}),
        function(____, id) return id ~= s.id end
    ) then
        m = m * (1 + (s.trait.parametres.degats_meute or 0))
    end
    if __TS__ArraySome(
        ____exports.allies(combat, s),
        function(____, a)
            local ____opt_31 = a.don
            return (____opt_31 and ____opt_31.id) == "aura-de-l-elu"
        end
    ) then
        m = m * (1 + 0.05)
    end
    return m
end
function reductionCible(combat, cible, element)
    local cfg = {def = 2, res = 2}
    local m = 1
    if element == "physique" or element == "poison" then
        local defense = cible.caracs.VIT * cfg.def + cible.armure
        m = m * (100 / (100 + defense))
    else
        local res = cible.caracs.ESP * cfg.res
        m = m * (100 / (100 + res))
        m = m * (1 - cible.resistanceMagique)
    end
    m = m * (1 - (cible.resistances[element] or 0))
    local def = valeurEtat(cible, "bonus_defense") - valeurEtat(cible, "malus_defense")
    local ____opt_33 = cible.trait
    if (____opt_33 and ____opt_33.id) == "robuste" then
        def = def + (cible.trait.parametres.defense or 0)
    end
    m = m * math.max(0.3, 1 - def)
    m = m * (1 + valeurEtat(cible, "marque"))
    if cible.type == "heros" or cible.type == "compagnon" then
        m = m * (1 - 0.01 * (cible.caracs.CHA - 10))
    end
    if aEtat(cible, "garde") then
        m = m * 0.5
    end
    if __TS__ArraySome(
        ____exports.allies(combat, cible),
        function(____, a)
            local ____opt_35 = a.don
            return (____opt_35 and ____opt_35.id) == "aura-de-l-elu"
        end
    ) then
        m = m * 0.95
    end
    return math.max(0, m)
end
function chanceToucher(contenu, s, cible)
    local k = contenu.config.combat
    if aEtat(cible, "sommeil") or aEtat(cible, "immobilise") then
        return 1
    end
    local p = k.toucher_base + k.toucher_par_agi * (s.caracs.AGI - cible.caracs.AGI)
    p = p + valeurEtat(s, "bonus_precision")
    p = p + (s.compteurs.modToucher or 0)
    local ____opt_37 = s.trait
    if (____opt_37 and ____opt_37.id) == "entre-deux-mondes" then
        p = p + (s.trait.parametres.precision or 0)
    end
    local ____opt_39 = cible.trait
    if (____opt_39 and ____opt_39.id) == "ruse" then
        p = p - (cible.trait.parametres.esquive or 0)
    end
    return math.min(
        k.toucher_max,
        math.max(k.toucher_min, p)
    )
end
function chanceCritique(contenu, s, cible)
    local k = contenu.config.combat
    local p = k.critique_base + k.critique_par_agi * s.caracs.AGI
    local ____opt_41 = s.passif
    if (____opt_41 and ____opt_41.id) == "dans-le-dos" then
        local affaiblie = __TS__ArraySome(
            cible.etats,
            function(____, e) return __TS__ArrayIncludes(ETATS_NEGATIFS, e.id) end
        )
        if affaiblie or cible.derniereCible ~= s.id then
            p = p + (s.passif.parametres.critique or 0.25)
        end
    end
    return math.min(0.9, p)
end
function infliger(contenu, combat, rng, s, cibleInitiale, brut, element, critique, monoCible, competence)
    local cible = cibleInitiale
    if monoCible and s.camp ~= cible.camp then
        for ____, g in ipairs(____exports.allies(combat, cible)) do
            if g.id == cible.id then
                continue
            end
            local ____opt_43 = g.passif
            local rempart = (if (____opt_43 and ____opt_43.id) == "rempart" then g.passif.parametres else nil)
            local garde = __TS__ArrayFind(
                g.bonusCompagnon,
                function(____, b) return b.id == "garde-partagee" end
            )
            local protegeCible = garde and (cible.herosId == g.herosId and cible.type == "heros")
            local p = (if rempart then rempart.chance else (if protegeCible then garde.parametres.chance else 0))
            if p > 0 and chance(rng, p) then
                local red = (if rempart then rempart.reduction or 0.2 else 0.2)
                brut = brut * (1 - red)
                log(combat, {type = "info", source = g.id, cible = cible.id, texte = ((g.nom .. " s'interpose devant ") .. cible.nom) .. " !"})
                cible = g
                break
            end
        end
    end
    local degats = math.max(
        1,
        math.floor(brut * reductionCible(combat, cible, element) + 0.5)
    )
    if cible.bouclier > 0 then
        local abs = math.min(cible.bouclier, degats)
        cible.bouclier = cible.bouclier - abs
        degats = degats - abs
        if abs > 0 then
            log(
                combat,
                {
                    type = "bouclier",
                    cible = cible.id,
                    valeur = abs,
                    texte = ((("Le bouclier de " .. cible.nom) .. " absorbe ") .. tostring(abs)) .. " dégâts."
                }
            )
        end
    end
    cible.pv = cible.pv - degats
    local ____combat_frappesCeTour_45, ____cible_id_46 = combat.frappesCeTour, cible.id
    if ____combat_frappesCeTour_45[____cible_id_46] == nil then
        ____combat_frappesCeTour_45[____cible_id_46] = {}
    end
    local ____combat_frappesCeTour_cible_id_48 = combat.frappesCeTour[cible.id]
    ____combat_frappesCeTour_cible_id_48[#____combat_frappesCeTour_cible_id_48 + 1] = s.id
    cible.etats = __TS__ArrayFilter(
        cible.etats,
        function(____, e) return e.id ~= "sommeil" end
    )
    log(
        combat,
        {
            type = "degats",
            source = s.id,
            cible = cible.id,
            valeur = degats,
            critique = critique,
            element = element,
            competence = competence,
            texte = (((((((s.nom .. " inflige ") .. tostring(degats)) .. " dégâts") .. (if element ~= "physique" then (" (" .. element) .. ")" else "")) .. " à ") .. cible.nom) .. (if critique then " (critique !)" else "")) .. "."
        }
    )
    if cible.pv > 0 and cible.pv / cible.pvMax < 0.25 and (cible.compteurs.determination or 0) > 0 then
        local v = math.floor(cible.pvMax * 0.1 + 0.5)
        cible.pv = cible.pv + v
        cible.compteurs.determination = 0
        log(
            combat,
            {
                type = "soin",
                cible = cible.id,
                valeur = v,
                texte = ((cible.nom .. " serre les dents et regagne ") .. tostring(v)) .. " PV ! (Détermination)"
            }
        )
    end
    if cible.pv <= 0 then
        mettreKo(combat, cible)
    elseif vrai(cible.fuitSous) and cible.pv / cible.pvMax <= cible.fuitSous then
        cible.parti = true
        log(combat, {type = "fuite", cible = cible.id, texte = cible.nom .. " bat en retraite dans un nuage de cendres !"})
    end
    if not cible.ko and s.camp ~= cible.camp then
        local ca = __TS__ArrayFind(
            cible.bonusCompagnon,
            function(____, b) return b.id == "contre-attaque" end
        )
        if ca and chance(rng, ca.parametres.chance or 0.25) and actif(s) then
            local dg = math.floor(cible.attaque.puissance * (1 + cible.caracs[cible.attaque.stat] / 20) * 0.6 * reductionCible(combat, s, "physique") + 0.5)
            s.pv = s.pv - math.max(1, dg)
            log(
                combat,
                {
                    type = "degats",
                    source = cible.id,
                    cible = s.id,
                    valeur = dg,
                    texte = ((((cible.nom .. " contre-attaque : ") .. tostring(dg)) .. " dégâts à ") .. s.nom) .. "."
                }
            )
            if s.pv <= 0 then
                mettreKo(combat, s)
            end
        end
    end
    return degats
end
function mettreKo(combat, x)
    x.pv = 0
    x.ko = true
    x.etats = {}
    x.bouclier = 0
    log(combat, {type = "ko", cible = x.id, texte = (if x.camp == "heros" then x.nom .. " est K.O. !" else x.nom .. " est vaincu.")})
    if x.type == "invocation" then
        x.parti = x.dureeInvocation ~= nil
    end
    if x.refId == "loup-spectral" and vrai(x.maitreId) then
        local m = __TS__ArrayFind(
            combat.combattants,
            function(____, y) return y.id == x.maitreId end
        )
        if m then
            local ____m_compteurs_51 = m.compteurs
            local ____opt_49 = m.passif
            ____m_compteurs_51.retourFamilier = ____opt_49 and ____opt_49.parametres.retour or 3
        end
    end
end
function soigner(contenu, combat, s, cible, montant)
    if cible.ko then
        return
    end
    local m = montant
    local ____opt_52 = cible.trait
    if (____opt_52 and ____opt_52.id) == "sang-cendre" and s.id ~= cible.id and (s.refId == "guerisseur" or s.refId == "gardien") then
        m = m * (1 + (cible.trait.parametres.soins_sacres or 0))
    end
    m = math.floor(m + 0.5)
    local manque = cible.pvMax - cible.pv
    local reel = math.min(manque, m)
    cible.pv = cible.pv + reel
    log(
        combat,
        {
            type = "soin",
            source = s.id,
            cible = cible.id,
            valeur = reel,
            texte = ((cible.nom .. " récupère ") .. tostring(reel)) .. " PV."
        }
    )
    local ____opt_54 = s.passif
    if (____opt_54 and ____opt_54.id) == "main-bienveillante" and m > reel then
        local b = math.floor((m - reel) * (s.passif.parametres.bouclier_surplus or 0.5) + 0.5)
        if b > 0 then
            cible.bouclier = cible.bouclier + b
            log(
                combat,
                {
                    type = "bouclier",
                    cible = cible.id,
                    valeur = b,
                    texte = ("Le surplus de soin devient un bouclier de " .. tostring(b)) .. "."
                }
            )
        end
    end
end
function invoquer(contenu, combat, maitre, creature, duree)
    local def = contenu.ennemis[creature]
    combat.compteurInvocations = combat.compteurInvocations + 1
    local inv = ____exports.combattantEnnemi(
        contenu,
        def,
        (("i:" .. creature) .. ":") .. tostring(combat.compteurInvocations)
    )
    local f = 1 + 0.12 * (maitre.niveau - 1)
    inv.camp = maitre.camp
    inv.type = "invocation"
    inv.maitreId = maitre.id
    inv.joueurId = maitre.joueurId
    inv.herosId = maitre.herosId
    inv.dureeInvocation = duree
    inv.niveau = maitre.niveau
    inv.pvMax = math.floor(inv.pvMax * f + 0.5)
    inv.pv = inv.pvMax
    inv.compteurs = {multDegats = f}
    inv.recompenses = nil
    inv.sprite = "invocations/" .. creature
    local ____combat_combattants_56 = combat.combattants
    ____combat_combattants_56[#____combat_combattants_56 + 1] = inv
    log(combat, {type = "invocation", source = maitre.id, cible = inv.id, texte = ((maitre.nom .. " invoque : ") .. inv.nom) .. " !"})
end
function resoudreCibles(combat, rng, s, ____type, cibleChoisie, portee)
    repeat
        local ____switch155 = ____type
        local ____cond155 = ____switch155 == "soi"
        if ____cond155 then
            return {s}
        end
        ____cond155 = ____cond155 or ____switch155 == "tous_allies"
        if ____cond155 then
            return ____exports.allies(combat, s)
        end
        ____cond155 = ____cond155 or ____switch155 == "tous_ennemis"
        if ____cond155 then
            return ____exports.adversaires(combat, s)
        end
        ____cond155 = ____cond155 or ____switch155 == "ennemi_aleatoire"
        if ____cond155 then
            return {}
        end
        ____cond155 = ____cond155 or ____switch155 == "allie_ko"
        if ____cond155 then
            return (if cibleChoisie then {cibleChoisie} else {})
        end
        ____cond155 = ____cond155 or ____switch155 == "allie"
        if ____cond155 then
            return {cibleChoisie or s}
        end
        do
            do
                local valides = ____exports.ciblesValides(combat, s, "ennemi", portee)
                if cibleChoisie and __TS__ArraySome(
                    valides,
                    function(____, v) return v.id == cibleChoisie.id end
                ) then
                    return {cibleChoisie}
                end
                return (if #valides > 0 then {choisir(rng, valides)} else {})
            end
        end
    until true
end
function appliquerEffets(contenu, combat, rng, s, comp, rang, cibleChoisie, depuisObjet)
    if depuisObjet == nil then
        depuisObjet = false
    end
    local facteurRang = 1 + 0.1 * (rang - 1)
    local consommeRunes = false
    local premiereCibleOffensive = nil
    local elementsComp = __TS__ArrayMap(
        __TS__ArrayFilter(
            comp.effets,
            function(____, e) return e.type == "degats" end
        ),
        function(____, e) return e.element end
    )
    local bonusResonance = 1
    local ____opt_57 = s.passif
    if (____opt_57 and ____opt_57.id) == "resonance" and #elementsComp > 0 then
        local dernier = s.compteurs.dernierElement
        local code = __TS__ArrayIndexOf(ELEMENTS_MAGIQUES, elementsComp[1]) + 1
        if vrai(dernier) and vrai(code) and dernier ~= code then
            bonusResonance = 1 + (s.passif.parametres.bonus or 0.25)
        end
        if vrai(code) then
            s.compteurs.dernierElement = code
        end
    end
    local bonusRunes = 1
    local ____opt_59 = s.passif
    if (____opt_59 and ____opt_59.id) == "runes-gravees" and not depuisObjet and #elementsComp > 0 then
        local charges = s.compteurs.runes or 0
        bonusRunes = 1 + charges * (s.passif.parametres.bonus_par_charge or 0.2)
        if charges > 0 then
            consommeRunes = true
        end
    end
    local ____depuisObjet_63 = depuisObjet
    if ____depuisObjet_63 then
        local ____opt_61 = s.passif
        ____depuisObjet_63 = (____opt_61 and ____opt_61.id) == "fioles-optimisees"
    end
    local multObjet = (if ____depuisObjet_63 then 1 + (s.passif.parametres.efficacite or 0.4) else 1)
    for ____, ef in ipairs(comp.effets) do
        local typeCible = (if ef.cible ~= nil and ef.cible then ef.cible else comp.cible)
        if ef.type == "degats" then
            local n = ef.coups
            do
                local k = 0
                while k < n do
                    local cibles
                    if typeCible == "ennemi_aleatoire" then
                        local v = ____exports.ciblesValides(combat, s, "ennemi", "distance")
                        cibles = (if #v > 0 then {choisir(rng, v)} else {})
                    else
                        cibles = resoudreCibles(
                            combat,
                            rng,
                            s,
                            typeCible,
                            premiereCibleOffensive or cibleChoisie,
                            comp.portee
                        )
                    end
                    for ____, cible in ipairs(cibles) do
                        if not actif(cible) then
                            continue
                        end
                        if premiereCibleOffensive == nil then
                            premiereCibleOffensive = cible
                        end
                        local monoCible = typeCible == "ennemi"
                        local touche = depuisObjet or chance(
                            rng,
                            chanceToucher(contenu, s, cible)
                        )
                        if not touche and (s.compteurs.relances or 0) > 0 then
                            local ____s_compteurs_64, ____relances_65 = s.compteurs, "relances"
                            ____s_compteurs_64[____relances_65] = ____s_compteurs_64[____relances_65] - 1
                            touche = chance(
                                rng,
                                chanceToucher(contenu, s, cible)
                            )
                        end
                        if touche and (cible.compteurs.esquives or 0) > 0 and monoCible then
                            local ____cible_compteurs_66, ____esquives_67 = cible.compteurs, "esquives"
                            ____cible_compteurs_66[____esquives_67] = ____cible_compteurs_66[____esquives_67] - 1
                            touche = false
                            ajouterEtat(combat, cible, {
                                id = "furtif",
                                duree = 1,
                                valeur = 0,
                                source = cible.id,
                                cumul = 1
                            })
                            log(combat, {type = "rate", source = s.id, cible = cible.id, texte = cible.nom .. " disparaît dans l'ombre et esquive ! (Pas de l'ombre)"})
                            continue
                        end
                        if not touche then
                            log(combat, {type = "rate", source = s.id, cible = cible.id, texte = ((s.nom .. " rate ") .. cible.nom) .. "."})
                            continue
                        end
                        local furtif = aEtat(s, "furtif")
                        local critique = ef.critique_garanti or furtif or chance(
                            rng,
                            chanceCritique(contenu, s, cible)
                        )
                        if not critique and (s.compteurs.relancesCrit or 0) > 0 then
                            local ____s_compteurs_68, ____relancesCrit_69 = s.compteurs, "relancesCrit"
                            ____s_compteurs_68[____relancesCrit_69] = ____s_compteurs_68[____relancesCrit_69] - 1
                            critique = chance(
                                rng,
                                chanceCritique(contenu, s, cible)
                            )
                        end
                        local statVal = (if depuisObjet then 10 else s.caracs[ef.stat])
                        local variance = 1 + (aleatoire(rng) * 2 - 1) * contenu.config.combat.variance_degats
                        local brut = ef.puissance * facteurRang * (1 + statVal / 20) * variance * multObjet
                        brut = brut * (multiplicateurDegatsSource(combat, s, cible, ef.element) * bonusResonance * bonusRunes)
                        if critique then
                            brut = brut * contenu.config.combat.multiplicateur_critique
                        end
                        if vrai(ef.executer_sous_pourcent) and cible.pv / cible.pvMax <= ef.executer_sous_pourcent then
                            brut = brut * 2
                        end
                        if vrai(ef.cout_pv_pourcent) then
                            s.pv = math.max(
                                1,
                                s.pv - math.floor(s.pvMax * ef.cout_pv_pourcent + 0.5)
                            )
                        end
                        infliger(
                            contenu,
                            combat,
                            rng,
                            s,
                            cible,
                            brut,
                            ef.element,
                            critique,
                            monoCible,
                            comp.id
                        )
                        if furtif then
                            s.etats = __TS__ArrayFilter(
                                s.etats,
                                function(____, e) return e.id ~= "furtif" end
                            )
                        end
                    end
                    k = k + 1
                end
            end
        elseif ef.type == "soin" then
            local cibles = resoudreCibles(
                combat,
                rng,
                s,
                typeCible,
                cibleChoisie,
                "distance"
            )
            local statVal = (if depuisObjet then 10 else s.caracs[ef.stat])
            for ____, cible in ipairs(cibles) do
                soigner(
                    contenu,
                    combat,
                    s,
                    cible,
                    ef.puissance * facteurRang * (1 + statVal / 20) * multObjet
                )
            end
        elseif ef.type == "etat" then
            local cibles = (if typeCible == "ennemi" and premiereCibleOffensive then {premiereCibleOffensive} else resoudreCibles(
                combat,
                rng,
                s,
                typeCible,
                cibleChoisie,
                comp.portee
            ))
            for ____, cible in ipairs(cibles) do
                if not actif(cible) then
                    continue
                end
                local p = ef.chance
                if cible.camp ~= s.camp and __TS__ArrayIncludes(ETATS_CONTROLE, ef.etat) then
                    if cible.boss then
                        p = p * 0.5
                    end
                    local ____opt_70 = cible.trait
                    if (____opt_70 and ____opt_70.id) == "instinct-de-meute" then
                        p = p * (1 - (cible.trait.parametres.resistance_controle or 0))
                    end
                end
                if cible.camp ~= s.camp and ef.etat == "poison" and (cible.resistances.poison or 0) >= 1 then
                    log(combat, {type = "info", cible = cible.id, texte = cible.nom .. " est insensible au poison."})
                    continue
                end
                if not chance(
                    rng,
                    math.min(1, p)
                ) then
                    log(combat, {type = "info", cible = cible.id, texte = cible.nom .. " résiste."})
                    continue
                end
                local duree = ef.duree
                local ____temp_74 = ef.etat == "poison"
                if ____temp_74 then
                    local ____opt_72 = cible.trait
                    ____temp_74 = (____opt_72 and ____opt_72.id) == "sang-ancien"
                end
                if ____temp_74 then
                    duree = duree + (cible.trait.parametres.duree_poison_bonus or 1)
                end
                local ____temp_77 = ef.etat == "poison"
                if ____temp_77 then
                    local ____opt_75 = cible.trait
                    ____temp_77 = (____opt_75 and ____opt_75.id) == "robuste"
                end
                if ____temp_77 then
                    if chance(rng, cible.trait.parametres.resistance_poison or 0.5) then
                        log(combat, {type = "info", cible = cible.id, texte = cible.nom .. " résiste au poison."})
                        continue
                    end
                end
                local ____opt_78 = s.passif
                if (____opt_78 and ____opt_78.id) == "refrain" and typeCible == "tous_allies" then
                    duree = 99
                end
                local valeur = (if ef.etat == "poison" or ef.etat == "brulure" then ef.valeur * facteurRang * (1 + s.caracs[s.attaque.stat] / 40) else ef.valeur)
                ajouterEtat(combat, cible, {
                    id = ef.etat,
                    duree = duree + (if cible.id == s.id then 1 else 0),
                    valeur = valeur,
                    source = s.id,
                    cumul = 1
                }, ef.cumul_max)
                log(combat, {type = "etat", source = s.id, cible = cible.id, texte = ((cible.nom .. " : ") .. ____exports.NOMS_ETATS[ef.etat]) .. "."})
            end
        elseif ef.type == "bouclier" then
            local cibles = resoudreCibles(
                combat,
                rng,
                s,
                typeCible,
                cibleChoisie,
                "distance"
            )
            for ____, cible in ipairs(cibles) do
                local v = math.floor(cible.pvMax * ef.pourcent_pv * facteurRang * multObjet + 0.5)
                cible.bouclier = cible.bouclier + v
                log(
                    combat,
                    {
                        type = "bouclier",
                        source = s.id,
                        cible = cible.id,
                        valeur = v,
                        texte = ((cible.nom .. " gagne un bouclier de ") .. tostring(v)) .. "."
                    }
                )
            end
        elseif ef.type == "invocation" then
            invoquer(
                contenu,
                combat,
                s,
                ef.creature,
                ef.duree
            )
        elseif ef.type == "purifier" then
            for ____, cible in ipairs(resoudreCibles(
                combat,
                rng,
                s,
                typeCible,
                cibleChoisie,
                "distance"
            )) do
                cible.etats = __TS__ArrayFilter(
                    cible.etats,
                    function(____, e) return not __TS__ArrayIncludes(ETATS_NEGATIFS, e.id) end
                )
                log(combat, {type = "etat", cible = cible.id, texte = cible.nom .. " est purifié."})
            end
        elseif ef.type == "charge_rune" then
            local ____s_compteurs_82 = s.compteurs
            local ____opt_80 = s.passif
            ____s_compteurs_82.runes = math.min(____opt_80 and ____opt_80.parametres.max or 3, (s.compteurs.runes or 0) + ef.nombre)
        elseif ef.type == "mana" then
            for ____, cible in ipairs(resoudreCibles(
                combat,
                rng,
                s,
                typeCible,
                cibleChoisie,
                "distance"
            )) do
                cible.mana = math.min(cible.manaMax, cible.mana + ef.valeur)
            end
        elseif ef.type == "soigner_invocations" then
            for ____, inv in ipairs(__TS__ArrayFilter(
                ____exports.allies(combat, s),
                function(____, a) return a.maitreId == s.id and a.type == "invocation" end
            )) do
                inv.pv = math.min(
                    inv.pvMax,
                    inv.pv + math.floor(inv.pvMax * ef.pourcent + 0.5)
                )
            end
        elseif ef.type == "relever" then
            for ____, cible in ipairs(resoudreCibles(
                combat,
                rng,
                s,
                "allie_ko",
                cibleChoisie,
                "distance"
            )) do
                if cible.ko then
                    cible.ko = false
                    cible.pv = math.floor(cible.pvMax * ef.pourcent_pv + 0.5)
                    log(combat, {type = "soin", cible = cible.id, texte = cible.nom .. " se relève !"})
                end
            end
        end
    end
    if consommeRunes then
        s.compteurs.runes = 0
    end
    if premiereCibleOffensive then
        s.derniereCible = premiereCibleOffensive.id
    end
end
function attaqueSimple(contenu, combat, rng, s, cible)
    local comp = {
        id = "attaque",
        nom = "Attaque",
        description = "",
        cout = 0,
        recharge = 0,
        cible = "ennemi",
        portee = s.attaque.portee,
        effets = {{
            type = "degats",
            puissance = s.attaque.puissance,
            stat = s.attaque.stat,
            element = s.attaque.element,
            coups = 1,
            critique_garanti = false,
            cout_pv_pourcent = 0
        }},
        ia = {priorite = 1, quand = "toujours"}
    }
    local avantPv = cible and cible.pv or 0
    appliquerEffets(
        contenu,
        combat,
        rng,
        s,
        comp,
        1,
        cible
    )
    local c = (if vrai(s.derniereCible) then __TS__ArrayFind(
        combat.combattants,
        function(____, x) return x.id == s.derniereCible end
    ) else nil)
    local ____opt_85 = s.passif
    if (____opt_85 and ____opt_85.id) == "runes-gravees" and c and c.pv < avantPv then
        s.compteurs.runes = math.min(s.passif.parametres.max or 3, (s.compteurs.runes or 0) + 1)
    end
    local ____opt_87 = s.passif
    if (____opt_87 and ____opt_87.id) == "oeil-du-faucon" and c and actif(c) and chance(rng, s.passif.parametres.chance_marque or 0.3) then
        ajouterEtat(combat, c, {
            id = "marque",
            duree = 2,
            valeur = 0.15,
            source = s.id,
            cumul = 1
        })
        log(combat, {type = "etat", source = s.id, cible = c.id, texte = c.nom .. " est marqué."})
    end
end
function calculerOrdre(contenu, combat, rng)
    local vivants = __TS__ArrayFilter(
        combat.combattants,
        function(____, x) return actif(x) end
    )
    local init = __TS__New(Map)
    for ____, x in ipairs(vivants) do
        local v = x.caracs.AGI + de(rng, 10)
        v = v * (1 + valeurEtat(x, "bonus_initiative"))
        if aEtat(x, "gel") then
            v = v * 0.5
        end
        if x.trait then
            v = v + (x.trait.parametres.initiative or 0)
        end
        init:set(
            x.id,
            v + aleatoire(rng) * 0.01
        )
    end
    combat.ordre = trier(
        __TS__ArrayMap(
            vivants,
            function(____, x) return x.id end
        ),
        function(a, b) return init:get(b) - init:get(a) end
    )
    combat.index = 0
end
function verifierFin(combat)
    if combat.resultat then
        return true
    end
    local heros = __TS__ArrayFilter(
        combat.combattants,
        function(____, x) return x.camp == "heros" and x.type ~= "invocation" end
    )
    local ennemis = __TS__ArrayFilter(
        combat.combattants,
        function(____, x) return x.camp == "ennemis" end
    )
    if __TS__ArrayEvery(
        ennemis,
        function(____, x) return not actif(x) end
    ) then
        combat.resultat = "victoire"
        log(combat, {type = "fin", texte = "Victoire !"})
    elseif __TS__ArrayEvery(
        heros,
        function(____, x) return not actif(x) end
    ) then
        combat.resultat = "defaite"
        log(combat, {type = "fin", texte = "Défaite…"})
    end
    if combat.resultat then
        combat.enAttente = nil
    end
    return not not combat.resultat
end
function debutTour(contenu, combat, rng, x)
    for ____, e in ipairs(__TS__ArrayFilter(
        x.etats,
        function(____, y) return y.id == "brulure" or y.id == "poison" end
    )) do
        local element = (if e.id == "brulure" then "feu" else "poison")
        local dg = math.max(
            1,
            math.floor(e.valeur * e.cumul * (1 - (x.resistances[element] or 0)) + 0.5)
        )
        if (x.resistances[element] or 0) >= 1 then
            dg = 0
        end
        if dg > 0 then
            x.pv = x.pv - dg
            log(
                combat,
                {
                    type = "degats",
                    cible = x.id,
                    valeur = dg,
                    element = element,
                    texte = ((((x.nom .. " subit ") .. tostring(dg)) .. " dégâts de ") .. string.lower(____exports.NOMS_ETATS[e.id])) .. "."
                }
            )
            if x.pv <= 0 then
                mettreKo(combat, x)
                return false
            end
        end
    end
    local regen = valeurEtat(x, "regeneration")
    local ____opt_89 = x.don
    if (____opt_89 and ____opt_89.id) == "coeur-inepuisable" then
        regen = regen + (x.don.parametres.regeneration or 0.03)
    end
    local ____opt_91 = x.trait
    if (____opt_91 and ____opt_91.id) == "sang-cendre" and x.pv / x.pvMax < 0.5 then
        regen = regen + (x.trait.parametres.regeneration or 0.02)
    end
    if regen > 0 and x.pv < x.pvMax then
        local v = math.min(
            x.pvMax - x.pv,
            math.max(
                1,
                math.floor(x.pvMax * regen + 0.5)
            )
        )
        x.pv = x.pv + v
        log(
            combat,
            {
                type = "soin",
                cible = x.id,
                valeur = v,
                texte = ((x.nom .. " régénère ") .. tostring(v)) .. " PV."
            }
        )
    end
    x.mana = math.min(
        x.manaMax,
        x.mana + contenu.config.combat.regen_mana_base + math.floor(x.caracs.ESP / 5)
    )
    x.etats = __TS__ArrayFilter(
        x.etats,
        function(____, e) return e.id ~= "garde" end
    )
    if aEtat(x, "immobilise") or aEtat(x, "sommeil") then
        log(combat, {type = "info", cible = x.id, texte = x.nom .. " ne peut pas agir."})
        return false
    end
    if aEtat(x, "peur") and chance(rng, 0.5) then
        log(combat, {type = "info", cible = x.id, texte = x.nom .. " est paralysé par la peur."})
        return false
    end
    return true
end
function finTour(combat, x)
    for ____, e in ipairs(x.etats) do
        e.duree = e.duree - 1
    end
    x.etats = __TS__ArrayFilter(
        x.etats,
        function(____, e) return e.duree > 0 end
    )
    for ____, k in ipairs(cles(x.recharges)) do
        if x.recharges[k] > 0 then
            local ____x_recharges_93, ____k_94 = x.recharges, k
            ____x_recharges_93[____k_94] = ____x_recharges_93[____k_94] - 1
        end
    end
    if x.type == "invocation" and x.dureeInvocation ~= nil then
        x.dureeInvocation = x.dureeInvocation - 1
        if x.dureeInvocation <= 0 and not x.ko then
            x.parti = true
            log(combat, {type = "info", cible = x.id, texte = x.nom .. " disparaît."})
        end
    end
end
function debutRound(contenu, combat, rng)
    combat.tour = combat.tour + 1
    combat.frappesCeTour = {}
    for ____, x in ipairs(combat.combattants) do
        x.etats = __TS__ArrayFilter(
            x.etats,
            function(____, e)
                if e.duree < 50 then
                    return true
                end
                local src = __TS__ArrayFind(
                    combat.combattants,
                    function(____, y) return y.id == e.source end
                )
                return not not src and actif(src)
            end
        )
    end
    for ____, m in ipairs(__TS__ArrayFilter(
        combat.combattants,
        function(____, y)
            local ____actif_result_99 = actif(y)
            if ____actif_result_99 then
                local ____opt_97 = y.passif
                ____actif_result_99 = (____opt_97 and ____opt_97.id) == "lien-d-ame"
            end
            return ____actif_result_99
        end
    )) do
        if (m.compteurs.retourFamilier or 0) > 0 then
            local ____m_compteurs_95, ____retourFamilier_96 = m.compteurs, "retourFamilier"
            ____m_compteurs_95[____retourFamilier_96] = ____m_compteurs_95[____retourFamilier_96] - 1
            if m.compteurs.retourFamilier == 0 then
                invoquer(
                    contenu,
                    combat,
                    m,
                    "loup-spectral",
                    nil
                )
            end
        end
    end
    calculerOrdre(contenu, combat, rng)
    combat.instantane = nil
    combat.instantane = copieProfonde(__TS__ObjectAssign({}, combat, {evenements = {}}))
end
--- Fait jouer l'IA jusqu'au prochain tour d'un joueur, ou jusqu'à la fin du combat.
function ____exports.avancer(contenu, combat, rng)
    local garde = 0
    while not verifierFin(combat) do
        garde = garde + 1
        if garde > 5000 then
            error(
                __TS__New(Error, "Combat bloqué (boucle infinie)"),
                0
            )
        end
        if combat.tour == 0 or combat.index >= #combat.ordre then
            debutRound(contenu, combat, rng)
        end
        local id = combat.ordre[combat.index + 1]
        local x = __TS__ArrayFind(
            combat.combattants,
            function(____, y) return y.id == id end
        )
        if not actif(x) then
            combat.index = combat.index + 1
            continue
        end
        if combat.enAttente == x.id then
            return
        end
        local peutAgir = debutTour(contenu, combat, rng, x)
        if verifierFin(combat) then
            return
        end
        if not peutAgir or not actif(x) then
            finTour(combat, x)
            combat.index = combat.index + 1
            continue
        end
        if x.controle then
            combat.enAttente = x.id
            return
        end
        local action = ____exports.choisirActionIA(contenu, combat, rng, x)
        executer(
            contenu,
            combat,
            rng,
            x,
            action
        )
        finTour(combat, x)
        combat.index = combat.index + 1
    end
end
function verifierAction(contenu, combat, x, a)
    if a.type == "competence" then
        local k = ____exports.competenceCombattant(contenu, x, a.competence)
        if not k then
            error(
                __TS__New(Error, "Compétence inconnue"),
                0
            )
        end
        if not ____exports.competenceUtilisable(contenu, x, k.comp) then
            error(
                __TS__New(Error, "Compétence indisponible (mana, recharge ou silence)"),
                0
            )
        end
    end
    if a.type == "objet" and a.objet == "potion" and x.potions <= 0 then
        error(
            __TS__New(Error, "Plus de potion"),
            0
        )
    end
    if a.type == "objet" and a.objet == "bombe" and x.bombes <= 0 then
        error(
            __TS__New(Error, "Plus de bombe"),
            0
        )
    end
    if a.type == "fuir" and not combat.fuitePossible then
        error(
            __TS__New(Error, "Impossible de fuir ce combat"),
            0
        )
    end
    if a.type == "pacifier" then
        local c = ____exports.trouver(combat, a.cible)
        local ____opt_100 = x.don
        if (____opt_100 and ____opt_100.id) ~= "langue-universelle" then
            error(
                __TS__New(Error, "Il faut le don Langue universelle"),
                0
            )
        end
        if not pacifiable(x, c) then
            error(
                __TS__New(Error, "Cette créature ne peut pas être pacifiée maintenant"),
                0
            )
        end
    end
    if a.type == "viser" then
        local c = ____exports.trouver(combat, a.cible)
        if not __TS__ArraySome(
            ____exports.ciblesValides(combat, x, "ennemi", x.attaque.portee),
            function(____, y) return y.id == c.id end
        ) then
            error(
                __TS__New(Error, c.nom .. " est hors de portée"),
                0
            )
        end
        if ____exports.sansMembres(c) then
            error(
                __TS__New(Error, c.nom .. " n'a ni tête ni membres à viser"),
                0
            )
        end
    end
    if a.type == "se_cacher" and aEtat(x, "furtif") then
        error(
            __TS__New(Error, "Vous êtes déjà caché"),
            0
        )
    end
end
--- Chance de réussir à se cacher (Agilité contre la perception des ennemis).
function ____exports.chanceSeCacher(combat, x)
    local perception = math.max(
        0,
        table.unpack(__TS__ArrayMap(
            ____exports.adversaires(combat, x),
            function(____, y) return y.caracs.ESP end
        ))
    )
    local p = 0.35 + 0.03 * (x.caracs.AGI - perception)
    local ____temp_104 = x.refId == "ombre"
    if not ____temp_104 then
        local ____opt_102 = x.don
        ____temp_104 = (____opt_102 and ____opt_102.id) == "pas-de-l-ombre"
    end
    if ____temp_104 then
        p = p + 0.2
    end
    return math.min(
        0.85,
        math.max(0.15, p)
    )
end
function pacifiable(x, c)
    local ____temp_108 = actif(c) and c.camp ~= x.camp and not c.boss and (c.categorie == "bete" or c.categorie == "demon")
    if ____temp_108 then
        local ____temp_107 = c.pv / c.pvMax
        local ____opt_105 = x.don
        ____temp_108 = ____temp_107 <= (____opt_105 and ____opt_105.parametres.seuil_pacifier or 0.3)
    end
    return ____temp_108
end
function executer(contenu, combat, rng, x, a)
    repeat
        local ____switch312 = a.type
        local ____cond312 = ____switch312 == "attaque"
        if ____cond312 then
            do
                log(combat, {
                    type = "action",
                    source = x.id,
                    cible = a.cible,
                    competence = "attaque",
                    texte = x.nom .. " attaque."
                })
                attaqueSimple(
                    contenu,
                    combat,
                    rng,
                    x,
                    __TS__ArrayFind(
                        combat.combattants,
                        function(____, y) return y.id == a.cible end
                    ) or nil
                )
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "competence"
        if ____cond312 then
            do
                local k = ____exports.competenceCombattant(contenu, x, a.competence)
                x.mana = x.mana - k.comp.cout
                if vrai(k.comp.recharge) then
                    x.recharges[k.comp.id] = k.comp.recharge + 1
                end
                if k.comp.id == "souffle-draconique" then
                    x.compteurs.souffle = 1
                end
                log(combat, {
                    type = "action",
                    source = x.id,
                    cible = a.cible,
                    competence = k.comp.id,
                    texte = ((x.nom .. " utilise ") .. k.comp.nom) .. " !"
                })
                appliquerEffets(
                    contenu,
                    combat,
                    rng,
                    x,
                    k.comp,
                    k.rang,
                    (if vrai(a.cible) then __TS__ArrayFind(
                        combat.combattants,
                        function(____, y) return y.id == a.cible end
                    ) or nil else nil)
                )
                if x.camp == "ennemis" and x.type == "ennemi" then
                    for ____, m in ipairs(__TS__ArrayFilter(
                        ____exports.adversaires(combat, x),
                        function(____, y)
                            local ____opt_110 = y.don
                            return (____opt_110 and ____opt_110.id) == "mimetisme" and not vrai(y.compteurs.copie)
                        end
                    )) do
                        local ____m_competencesPropres_109 = m.competencesPropres
                        ____m_competencesPropres_109[#____m_competencesPropres_109 + 1] = __TS__ObjectAssign({}, k.comp, {id = "copie:" .. k.comp.id, nom = k.comp.nom .. " (copiée)", cout = 4, ia = {priorite = 2, quand = "toujours"}})
                        m.compteurs.copie = 1
                        log(combat, {type = "info", cible = m.id, texte = ((m.nom .. " copie la technique « ") .. k.comp.nom) .. " » ! (Mimétisme)"})
                    end
                end
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "objet"
        if ____cond312 then
            do
                local cible = (if vrai(a.cible) then __TS__ArrayFind(
                    combat.combattants,
                    function(____, y) return y.id == a.cible end
                ) or x else x)
                local objetId = (if a.objet == "potion" then "potion-soin-petite" else "bombe-feu")
                local obj = contenu.objets[objetId]
                local ____opt_112 = x.passif
                local economise = (____opt_112 and ____opt_112.id) == "fioles-optimisees" and chance(rng, x.passif.parametres.economie or 0.25)
                if a.objet == "potion" then
                    if not economise then
                        x.potions = x.potions - 1
                    end
                elseif not economise then
                    x.bombes = x.bombes - 1
                end
                if a.objet == "potion" and not economise and (x.compteurs.potionsInventaire or 0) > 0 then
                    local ____x_compteurs_114, ____potionsInventaire_115 = x.compteurs, "potionsInventaire"
                    ____x_compteurs_114[____potionsInventaire_115] = ____x_compteurs_114[____potionsInventaire_115] - 1
                    x.compteurs.potionsUtilisees = (x.compteurs.potionsUtilisees or 0) + 1
                end
                log(combat, {
                    type = "action",
                    source = x.id,
                    cible = cible.id,
                    competence = objetId,
                    texte = (((x.nom .. " utilise : ") .. obj.nom) .. (if economise then " (sans la consommer !)" else "")) .. "."
                })
                appliquerEffets(
                    contenu,
                    combat,
                    rng,
                    x,
                    {
                        id = objetId,
                        nom = obj.nom,
                        description = "",
                        cout = 0,
                        recharge = 0,
                        cible = obj.cible,
                        portee = "distance",
                        effets = obj.effets,
                        ia = {priorite = 1, quand = "toujours"}
                    },
                    1,
                    cible,
                    true
                )
                if (x.compteurs.objetGratuit or 0) > 0 then
                    x.compteurs.objetGratuit = 0
                    log(combat, {type = "info", source = x.id, texte = x.nom .. " agit encore ! (Réserve du Néant)"})
                    return true
                end
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "defendre"
        if ____cond312 then
            ajouterEtat(combat, x, {
                id = "garde",
                duree = 2,
                valeur = 0.5,
                source = x.id,
                cumul = 1
            })
            x.mana = math.min(
                x.manaMax,
                x.mana + math.floor(x.manaMax * 0.1 + 0.5)
            )
            log(combat, {type = "action", source = x.id, texte = x.nom .. " se met en garde."})
            return false
        end
        ____cond312 = ____cond312 or ____switch312 == "changer_rang"
        if ____cond312 then
            x.rang = (if x.rang == "avant" then "arriere" else "avant")
            log(combat, {type = "action", source = x.id, texte = ((x.nom .. " passe au rang ") .. (if x.rang == "avant" then "avant" else "arrière")) .. "."})
            return false
        end
        ____cond312 = ____cond312 or ____switch312 == "pacifier"
        if ____cond312 then
            do
                local c = ____exports.trouver(combat, a.cible)
                c.parti = true
                log(combat, {type = "fuite", source = x.id, cible = c.id, texte = ((x.nom .. " parle à ") .. c.nom) .. ", qui renonce au combat et s'éloigne. (Langue universelle)"})
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "viser"
        if ____cond312 then
            do
                local v = ____exports.VISEES[a.partie]
                local c = ____exports.trouver(combat, a.cible)
                log(combat, {
                    type = "action",
                    source = x.id,
                    cible = c.id,
                    competence = "attaque",
                    texte = ((((x.nom .. " vise ") .. v.nom) .. " de ") .. c.nom) .. "."
                })
                local comp = {
                    id = "attaque-visee",
                    nom = "Attaque visée",
                    description = "",
                    cout = 0,
                    recharge = 0,
                    cible = "ennemi",
                    portee = x.attaque.portee,
                    effets = {{
                        type = "degats",
                        puissance = x.attaque.puissance * v.degats,
                        stat = x.attaque.stat,
                        element = x.attaque.element,
                        coups = 1,
                        critique_garanti = false,
                        cout_pv_pourcent = 0
                    }},
                    ia = {priorite = 1, quand = "toujours"}
                }
                local avant = #combat.evenements
                x.compteurs.modToucher = v.toucher
                appliquerEffets(
                    contenu,
                    combat,
                    rng,
                    x,
                    comp,
                    1,
                    c
                )
                x.compteurs.modToucher = 0
                local touche = __TS__ArraySome(
                    __TS__ArraySlice(combat.evenements, avant),
                    function(____, e) return e.type == "degats" and e.source == x.id end
                )
                if touche and actif(c) and chance(rng, v.chance * (if c.boss then 0.5 else 1)) then
                    ajouterEtat(combat, c, {
                        id = v.etat,
                        duree = v.duree,
                        valeur = v.valeur,
                        source = x.id,
                        cumul = 1
                    })
                    log(combat, {type = "etat", source = x.id, cible = c.id, texte = ((c.nom .. " ") .. v.texte) .. "."})
                end
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "se_cacher"
        if ____cond312 then
            do
                if chance(
                    rng,
                    ____exports.chanceSeCacher(combat, x)
                ) then
                    ajouterEtat(combat, x, {
                        id = "furtif",
                        duree = 2,
                        valeur = 0,
                        source = x.id,
                        cumul = 1
                    })
                    log(combat, {type = "action", source = x.id, texte = x.nom .. " se fond dans l'ombre : impossible à cibler, sa prochaine attaque sera critique."})
                else
                    log(combat, {type = "action", source = x.id, texte = x.nom .. " tente de se cacher… mais se fait repérer."})
                end
                return false
            end
        end
        ____cond312 = ____cond312 or ____switch312 == "fuir"
        if ____cond312 then
            do
                local p = 0.5 + 0.03 * (x.caracs.AGI - math.max(table.unpack(__TS__ArrayMap(
                    ____exports.adversaires(combat, x),
                    function(____, y) return y.caracs.AGI end
                ))))
                if chance(
                    rng,
                    math.min(
                        0.9,
                        math.max(0.2, p)
                    )
                ) then
                    combat.resultat = "fuite"
                    combat.enAttente = nil
                    log(combat, {type = "fin", texte = "Le groupe prend la fuite !"})
                else
                    log(combat, {type = "info", source = x.id, texte = x.nom .. " tente de fuir, sans succès."})
                end
                return false
            end
        end
    until true
end
function conditionIA(combat, x, comp)
    local q = comp.ia.quand
    local amis = ____exports.allies(combat, x)
    repeat
        local ____switch342 = q
        local ____cond342 = ____switch342 == "allie_blesse"
        if ____cond342 then
            return __TS__ArraySome(
                amis,
                function(____, a) return a.pv / a.pvMax < 0.6 and a.type ~= "invocation" end
            )
        end
        ____cond342 = ____cond342 or ____switch342 == "soi_blesse"
        if ____cond342 then
            return x.pv / x.pvMax < 0.5
        end
        ____cond342 = ____cond342 or ____switch342 == "plusieurs_ennemis"
        if ____cond342 then
            return #____exports.adversaires(combat, x) >= 2
        end
        ____cond342 = ____cond342 or ____switch342 == "debut_combat"
        if ____cond342 then
            return combat.tour <= 2
        end
        ____cond342 = ____cond342 or ____switch342 == "cible_faible"
        if ____cond342 then
            return __TS__ArraySome(
                ____exports.adversaires(combat, x),
                function(____, a) return a.pv / a.pvMax < 0.4 end
            )
        end
        ____cond342 = ____cond342 or ____switch342 == "allie_ko"
        if ____cond342 then
            return __TS__ArraySome(
                combat.combattants,
                function(____, a) return a.camp == x.camp and a.ko and a.type ~= "invocation" end
            )
        end
        do
            return true
        end
    until true
end
function dejaActif(combat, x, comp)
    local ef = __TS__ArrayFind(
        comp.effets,
        function(____, e) return e.type == "etat" end
    )
    if ef and ef.type == "etat" and (comp.cible == "soi" or comp.cible == "tous_allies") and aEtat(x, ef.etat) then
        return true
    end
    if __TS__ArrayEvery(
        comp.effets,
        function(____, e) return e.type == "invocation" end
    ) then
        return #__TS__ArrayFilter(
            ____exports.allies(combat, x),
            function(____, a) return a.maitreId == x.id and a.dureeInvocation ~= nil end
        ) >= 2
    end
    return false
end
function ____exports.choisirActionIA(contenu, combat, rng, x)
    local amis = __TS__ArrayFilter(
        ____exports.allies(combat, x),
        function(____, a) return a.type ~= "invocation" end
    )
    if x.potions > 0 and x.pv / x.pvMax < 0.35 then
        return {type = "objet", acteur = x.id, objet = "potion", cible = x.id}
    end
    if x.bombes > 0 and #____exports.adversaires(combat, x) >= 2 then
        return {type = "objet", acteur = x.id, objet = "bombe"}
    end
    local ____opt_116 = x.don
    if (____opt_116 and ____opt_116.id) == "langue-universelle" then
        local p = __TS__ArrayFind(
            ____exports.adversaires(combat, x),
            function(____, c) return pacifiable(x, c) end
        )
        if p then
            return {type = "pacifier", acteur = x.id, cible = p.id}
        end
    end
    local candidats = __TS__ArrayMap(
        __TS__ArrayFilter(
            toutesCompetences(contenu, x),
            function(____, ____bindingPattern0)
                local comp
                comp = ____bindingPattern0.comp
                return ____exports.competenceUtilisable(contenu, x, comp) and conditionIA(combat, x, comp) and not dejaActif(combat, x, comp)
            end
        ),
        function(____, ____bindingPattern0)
            local comp
            comp = ____bindingPattern0.comp
            return comp
        end
    )
    local meilleure = nil
    for ____, comp in ipairs(candidats) do
        if not meilleure or comp.ia.priorite > meilleure.ia.priorite then
            meilleure = comp
        end
    end
    if meilleure and meilleure.ia.priorite <= 2 and x.mana < x.manaMax * 0.3 and chance(rng, 0.5) then
        meilleure = nil
    end
    if meilleure then
        local cible
        if meilleure.cible == "allie" then
            local blesse = trier(
                {table.unpack(amis)},
                function(a, b) return a.pv / a.pvMax - b.pv / b.pvMax end
            )[1]
            cible = blesse and blesse.id or x.id
        elseif meilleure.cible == "allie_ko" then
            local ____opt_120 = __TS__ArrayFind(
                combat.combattants,
                function(____, a) return a.camp == x.camp and a.ko and a.type ~= "invocation" end
            )
            cible = ____opt_120 and ____opt_120.id
        elseif meilleure.cible == "ennemi" then
            local ____opt_122 = choisirCibleEnnemie(combat, rng, x, meilleure.portee)
            cible = ____opt_122 and ____opt_122.id
        end
        return {type = "competence", acteur = x.id, competence = meilleure.id, cible = cible}
    end
    local c = choisirCibleEnnemie(combat, rng, x, x.attaque.portee)
    return {type = "attaque", acteur = x.id, cible = c and c.id or ""}
end
function choisirCibleEnnemie(combat, rng, x, portee)
    local v = ____exports.ciblesValides(combat, x, "ennemi", portee)
    if #v == 0 then
        return nil
    end
    if x.camp == "heros" then
        return trier(
            {table.unpack(v)},
            function(a, b) return a.pv - b.pv end
        )[1]
    end
    local poids = __TS__ArrayMap(
        v,
        function(____, y) return (if y.rang == "avant" then 2 else 1) * (if y.type == "invocation" then 0.7 else 1) end
    )
    local r = aleatoire(rng) * __TS__ArrayReduce(
        poids,
        function(____, a, b) return a + b end,
        0
    )
    do
        local i = 0
        while i < #v do
            r = r - poids[i + 1]
            if r <= 0 then
                return v[i + 1]
            end
            i = i + 1
        end
    end
    return v[#v]
end
ETATS_NEGATIFS = {
    "brulure",
    "poison",
    "gel",
    "immobilise",
    "sommeil",
    "peur",
    "silence",
    "provoque",
    "marque",
    "malus_defense",
    "expose",
    "affaibli"
}
ETATS_CONTROLE = {
    "immobilise",
    "sommeil",
    "peur",
    "provoque",
    "silence"
}
____exports.NOMS_ETATS = {
    brulure = "Brûlure",
    poison = "Poison",
    gel = "Gel",
    immobilise = "Immobilisé",
    sommeil = "Sommeil",
    peur = "Peur",
    silence = "Silence",
    provoque = "Provoqué",
    marque = "Marqué",
    furtif = "Furtif",
    bonus_degats = "Dégâts +",
    bonus_defense = "Défense +",
    bonus_initiative = "Initiative +",
    bonus_precision = "Précision +",
    malus_defense = "Défense −",
    regeneration = "Régénération",
    garde = "En garde",
    expose = "Exposé",
    affaibli = "Affaibli"
}
--- Attaques visées : malus de toucher, multiplicateur de dégâts, effet si le coup porte.
____exports.VISEES = {tete = {
    nom = "la tête",
    toucher = -0.2,
    degats = 1.25,
    etat = "immobilise",
    duree = 1,
    valeur = 0,
    chance = 0.15,
    texte = "vacille, sonné"
}, jambes = {
    nom = "les jambes",
    toucher = -0.1,
    degats = 0.9,
    etat = "gel",
    duree = 2,
    valeur = 0,
    chance = 0.5,
    texte = "est ralenti"
}, bras = {
    nom = "le bras armé",
    toucher = -0.1,
    degats = 0.9,
    etat = "affaibli",
    duree = 2,
    valeur = 0.2,
    chance = 0.5,
    texte = "frappe moins fort"
}}
---
-- @param techniques grimoire de la partie : les variantes actives du héros y sont prises
function ____exports.combattantHeros(contenu, h, controle, techniques)
    if techniques == nil then
        techniques = {}
    end
    local cl = contenu.classes[h.classe]
    local race = contenu.races[h.race]
    local don = contenu.dons[h.don]
    local caracs = caracsTotales(contenu, h)
    local armure = cl.armure
    local puissance = cl.attaque.puissance
    for ____, slot in ipairs(valeurs(h.equipement)) do
        local o = (if vrai(slot) then contenu.objets[slot] else nil)
        local ____opt_0 = o and o.bonus
        armure = armure + (____opt_0 and ____opt_0.armure or 0)
        local ____opt_4 = o and o.bonus
        puissance = puissance + (____opt_4 and ____opt_4.puissance or 0)
    end
    local pmax = math.floor(pvMax(contenu, caracs.VIT, h.niveau) * (if h.blessure then 1 - contenu.config.mort_douce.blessure_pv_pourcent / 100 else 1) + 0.5)
    local propres = {}
    local rangsVariantes = {}
    local competences = {}
    for ____, id in ipairs(competencesEquipees(contenu, h)) do
        local ____opt_8 = h.varianteActive
        local v = ____opt_8 and ____opt_8[id]
        if vrai(v) and techniques[v] then
            propres[#propres + 1] = __TS__ObjectAssign({}, techniques[v])
            rangsVariantes[v] = h.rangsCompetences[id] or 1
        else
            competences[#competences + 1] = {id = id, rang = h.rangsCompetences[id] or 1}
        end
    end
    if race.trait.id == "ecailles-et-souffle" then
        propres[#propres + 1] = {
            id = "souffle-draconique",
            nom = "Souffle draconique",
            description = "Un souffle de feu sur tous les ennemis (une fois par combat).",
            cout = 0,
            recharge = 99,
            cible = "tous_ennemis",
            portee = "distance",
            effets = {{
                type = "degats",
                puissance = race.trait.parametres.souffle_puissance or 10,
                stat = "VIT",
                element = "feu",
                coups = 1,
                critique_garanti = false,
                cout_pv_pourcent = 0
            }},
            ia = {priorite = 3, quand = "toujours"}
        }
    end
    local potionsInventaire = h.inventaire["potion-soin-petite"] or 0
    local potions = potionsInventaire + (cl.passif.parametres.potions_bonus or 0) + (don.parametres.potions_bonus or 0) + (don.parametres.objets_improvises or 0)
    local res = {}
    local tp = race.trait.parametres
    if vrai(tp.resistance_feu) then
        res.feu = tp.resistance_feu
    end
    if vrai(tp.resistance_ombre) then
        res.ombre = tp.resistance_ombre
    end
    if vrai(tp.faiblesse_sacre) then
        res.sacre = -tp.faiblesse_sacre
    end
    if vrai(tp.faiblesse_glace) then
        res.glace = -tp.faiblesse_glace
    end
    if vrai(tp.resistance_poison) then
        res.poison = tp.resistance_poison
    end
    return {
        id = "h:" .. h.id,
        nom = h.nom,
        camp = "heros",
        type = "heros",
        refId = h.classe,
        joueurId = h.joueurId,
        controle = controle,
        herosId = h.id,
        maitreId = nil,
        dureeInvocation = nil,
        niveau = h.niveau,
        caracs = caracs,
        pvMax = pmax,
        pv = pmax,
        manaMax = manaMax(caracs.ESP, h.niveau),
        mana = manaMax(caracs.ESP, h.niveau),
        armure = armure,
        rang = cl.rang_prefere,
        attaque = __TS__ObjectAssign({}, cl.attaque, {puissance = puissance}),
        competences = competences,
        competencesPropres = propres,
        recharges = {},
        etats = {},
        bouclier = 0,
        ko = false,
        parti = false,
        passif = {id = cl.passif.id, parametres = cl.passif.parametres},
        trait = {id = race.trait.id, parametres = race.trait.parametres},
        don = {id = don.id, parametres = don.parametres},
        bonusCompagnon = {},
        resistances = res,
        resistanceMagique = tp.resistance_magique or 0,
        categorie = "humanoide",
        boss = false,
        fuitSous = nil,
        compteurs = __TS__ObjectAssign(
            {
                potionsInventaire = potionsInventaire,
                bombes = don.parametres.objets_improvises or 0,
                esquives = don.parametres.esquives or 0,
                relances = don.parametres.relances or 0,
                determination = (if race.trait.id == "determination" then 1 else 0),
                objetGratuit = (if don.id == "reserve-du-neant" then 1 else 0)
            },
            __TS__ObjectFromEntries(__TS__ArrayMap(
                entrees(rangsVariantes),
                function(____, ____bindingPattern0)
                    local v
                    local k
                    k = ____bindingPattern0[1]
                    v = ____bindingPattern0[2]
                    return {"rang:" .. k, v}
                end
            ))
        ),
        derniereCible = nil,
        potions = potions,
        bombes = don.parametres.objets_improvises or 0,
        recompenses = nil,
        sprite = "heros/" .. h.classe,
        echelle = race.echelle,
        teinte = race.teinte or nil,
        race = h.race
    }
end
--- Compagnon (ex. Aveline) : niveau = niveau de son héros ; bonus selon le palier d'affinité.
function ____exports.combattantCompagnon(contenu, compagnonId, h, paliersAtteints)
    local def = contenu.compagnons[compagnonId]
    local caracs = __TS__ObjectAssign({}, def.combat.caracteristiques)
    local gain = math.floor((h.niveau - 1) * 1.5)
    local ____caracs_10, ____def_combat_attaque_stat_11 = caracs, def.combat.attaque.stat
    ____caracs_10[____def_combat_attaque_stat_11] = ____caracs_10[____def_combat_attaque_stat_11] + math.ceil(gain / 2)
    caracs.VIT = caracs.VIT + math.floor(gain / 2)
    local pmax = pvMax(contenu, caracs.VIT, h.niveau)
    local bonus = __TS__ArrayMap(
        __TS__ArrayFilter(
            __TS__ArrayMap(
                paliersAtteints,
                function(____, p) return def.bonus_paliers[p] end
            ),
            function(____, b) return b ~= nil end
        ),
        function(____, b) return {id = b.id, parametres = b.parametres} end
    )
    return __TS__ObjectAssign(
        {
            id = (("c:" .. compagnonId) .. ":") .. h.id,
            nom = def.nom,
            camp = "heros",
            type = "compagnon",
            refId = compagnonId,
            joueurId = h.joueurId,
            controle = false,
            herosId = h.id,
            maitreId = "h:" .. h.id,
            dureeInvocation = nil,
            niveau = h.niveau,
            caracs = caracs,
            pvMax = pmax,
            pv = pmax,
            manaMax = manaMax(caracs.ESP, h.niveau),
            mana = manaMax(caracs.ESP, h.niveau),
            armure = def.combat.armure,
            rang = def.combat.rang,
            attaque = __TS__ObjectAssign({}, def.combat.attaque),
            competences = {},
            competencesPropres = def.combat.competences,
            recharges = {},
            etats = {},
            bouclier = 0,
            ko = false,
            parti = false
        },
        sansParticularite(),
        {
            bonusCompagnon = bonus,
            resistances = {},
            resistanceMagique = 0,
            categorie = "humanoide",
            boss = false,
            fuitSous = nil,
            compteurs = {},
            derniereCible = nil,
            potions = 0,
            bombes = 0,
            recompenses = nil,
            sprite = "compagnons/" .. compagnonId,
            echelle = 1,
            teinte = nil,
            race = nil
        }
    )
end
function ____exports.multiplicateursDifficulte(contenu, puissance)
    local t = trier(
        {table.unpack(contenu.config.difficulte)},
        function(a, b) return a.puissance - b.puissance end
    )
    if puissance <= t[1].puissance then
        return {pv = t[1].pv, degats = t[1].degats, ennemisEnPlus = t[1].ennemis_en_plus, puissance = puissance}
    end
    do
        local i = 0
        while i < #t - 1 do
            local a = t[i + 1]
            local b = t[i + 1 + 1]
            if puissance <= b.puissance then
                local f = (puissance - a.puissance) / (b.puissance - a.puissance)
                return {pv = a.pv + f * (b.pv - a.pv), degats = a.degats + f * (b.degats - a.degats), ennemisEnPlus = (if f < 0.5 then a.ennemis_en_plus else b.ennemis_en_plus), puissance = puissance}
            end
            i = i + 1
        end
    end
    local z = t[#t]
    return {pv = z.pv, degats = z.degats, ennemisEnPlus = z.ennemis_en_plus, puissance = puissance}
end
function ____exports.demarrerCombat(contenu, rencontreId, allies, rng, id)
    if id == nil then
        id = "combat"
    end
    local r = contenu.rencontres[rencontreId]
    if not r then
        error(
            __TS__New(Error, "Rencontre inconnue : " .. rencontreId),
            0
        )
    end
    local nbHeros = #__TS__ArrayFilter(
        allies,
        function(____, a) return a.type == "heros" end
    )
    local nbCompagnons = #__TS__ArrayFilter(
        allies,
        function(____, a) return a.type == "compagnon" end
    )
    local puissance = math.max(1, nbHeros + 0.5 * nbCompagnons)
    local m = ____exports.multiplicateursDifficulte(contenu, puissance)
    local listeEnnemis = __TS__ArrayMap(
        r.ennemis,
        function(____, e) return __TS__ObjectAssign({}, e) end
    )
    do
        local i = 0
        while i < m.ennemisEnPlus and #r.renforts > 0 do
            listeEnnemis[#listeEnnemis + 1] = {id = r.renforts[i % #r.renforts + 1], rang = nil}
            i = i + 1
        end
    end
    local pvBase = __TS__ArrayReduce(
        r.ennemis,
        function(____, a, e) return a + (contenu.ennemis[e.id].pv or 40) end,
        0
    )
    local pvAjoute = __TS__ArrayReduce(
        __TS__ArraySlice(listeEnnemis, #r.ennemis),
        function(____, a, e) return a + (contenu.ennemis[e.id].pv or 40) end,
        0
    )
    local multPv = math.max(0.5, (m.pv * pvBase - pvAjoute) / pvBase)
    local comptes = {}
    local ennemis = __TS__ArrayMap(
        listeEnnemis,
        function(____, e)
            comptes[e.id] = (comptes[e.id] or 0) + 1
            local def = contenu.ennemis[e.id]
            local c = ____exports.combattantEnnemi(
                contenu,
                def,
                (("e:" .. e.id) .. ":") .. tostring(comptes[e.id]),
                {pv = multPv, degats = m.degats}
            )
            if e.rang then
                c.rang = e.rang
            end
            return c
        end
    )
    for ____, c in ipairs(ennemis) do
        if (comptes[c.refId] or 0) > 1 then
            c.nom = (c.nom .. " ") .. string.char(64 + __TS__Number(__TS__StringSplit(c.id, ":")[3]))
        end
    end
    local ____id_13 = id
    local ____rencontreId_14 = rencontreId
    local ____r_nom_15 = r.nom
    local ____r_fond_16 = r.fond
    local ____temp_17 = {}
    local ____array_12 = __TS__SparseArrayNew(table.unpack(allies))
    __TS__SparseArrayPush(
        ____array_12,
        table.unpack(ennemis)
    )
    local combat = {
        id = ____id_13,
        rencontre = ____rencontreId_14,
        nom = ____r_nom_15,
        fond = ____r_fond_16,
        tour = 0,
        ordre = ____temp_17,
        index = 0,
        combattants = {__TS__SparseArraySpread(____array_12)},
        evenements = {},
        resultat = nil,
        enAttente = nil,
        frappesCeTour = {},
        fuitePossible = r.fuite_possible,
        multiplicateurs = m,
        instantane = nil,
        compteurInvocations = 0
    }
    log(combat, {type = "info", texte = ("Le combat commence : " .. r.nom) .. " !"})
    for ____, c in ipairs({table.unpack(combat.combattants)}) do
        local ____opt_18 = c.passif
        if (____opt_18 and ____opt_18.id) == "lien-d-ame" then
            invoquer(
                contenu,
                combat,
                c,
                "loup-spectral",
                nil
            )
        end
        if __TS__ArraySome(
            c.bonusCompagnon,
            function(____, b) return b.id == "aura-defense" end
        ) then
            local v = __TS__ArrayFind(
                c.bonusCompagnon,
                function(____, b) return b.id == "aura-defense" end
            ).parametres.valeur or 0.1
            for ____, a in ipairs(allies) do
                ajouterEtat(combat, a, {
                    id = "bonus_defense",
                    duree = 999,
                    valeur = v,
                    source = c.id,
                    cumul = 1
                })
            end
        end
    end
    ____exports.avancer(contenu, combat, rng)
    return combat
end
actif = function(x) return not x.ko and not x.parti end
____exports.allies = function(c, x) return __TS__ArrayFilter(
    c.combattants,
    function(____, y) return y.camp == x.camp and actif(y) end
) end
____exports.adversaires = function(c, x) return __TS__ArrayFilter(
    c.combattants,
    function(____, y) return y.camp ~= x.camp and actif(y) end
) end
ELEMENTS_MAGIQUES = {
    "feu",
    "glace",
    "foudre",
    "sacre",
    "ombre",
    "arcane"
}
--- Le joueur dont c'est le tour joue une action.
function ____exports.jouerAction(contenu, combat, rng, action)
    if combat.resultat then
        error(
            __TS__New(Error, "Le combat est terminé"),
            0
        )
    end
    if combat.enAttente ~= action.acteur then
        error(
            __TS__New(Error, "Ce n'est pas le tour de ce personnage"),
            0
        )
    end
    local x = ____exports.trouver(combat, action.acteur)
    verifierAction(contenu, combat, x, action)
    combat.enAttente = nil
    local rejoue = executer(
        contenu,
        combat,
        rng,
        x,
        action
    )
    if rejoue and not combat.resultat then
        combat.enAttente = x.id
        return
    end
    finTour(combat, x)
    combat.index = combat.index + 1
    ____exports.avancer(contenu, combat, rng)
end
--- Second départ : rejoue le tour en cours depuis son début (une fois par session, géré par la partie).
function ____exports.annulerTour(combat)
    if not combat.instantane then
        error(
            __TS__New(Error, "Aucun tour à annuler"),
            0
        )
    end
    local restaure = copieProfonde(combat.instantane)
    local ____array_126 = __TS__SparseArrayNew(table.unpack(__TS__ArrayFilter(
        combat.evenements,
        function(____, e) return e.tour < combat.tour end
    )))
    __TS__SparseArrayPush(____array_126, {tour = combat.tour, type = "info", texte = "Le temps se replie… le tour recommence ! (Second départ)"})
    restaure.evenements = {__TS__SparseArraySpread(____array_126)}
    restaure.instantane = combat.instantane
    restaure.resultat = nil
    return restaure
end
--- Actions proposées au joueur dont c'est le tour (pour l'interface).
function ____exports.actionsDisponibles(contenu, combat, acteurId)
    local x = ____exports.trouver(combat, acteurId)
    local comps = __TS__ArrayMap(
        toutesCompetences(contenu, x),
        function(____, ____bindingPattern0)
            local rang
            local comp
            comp = ____bindingPattern0.comp
            rang = ____bindingPattern0.rang
            return {
                comp = comp,
                rang = rang,
                utilisable = ____exports.competenceUtilisable(contenu, x, comp),
                raison = (if aEtat(x, "silence") then "Réduit au silence" else (if (x.recharges[comp.id] or 0) > 0 then ("Recharge : " .. tostring(x.recharges[comp.id])) .. " tour(s)" else (if x.mana < comp.cout then "Mana insuffisant" else (if comp.id == "souffle-draconique" and vrai(x.compteurs.souffle) then "Déjà utilisé" else ""))))
            }
        end
    )
    local ____x_potions_129 = x.potions
    local ____x_bombes_130 = x.bombes
    local ____opt_127 = x.don
    return {
        competences = comps,
        potions = ____x_potions_129,
        bombes = ____x_bombes_130,
        pacifier = (if (____opt_127 and ____opt_127.id) == "langue-universelle" then __TS__ArrayMap(
            __TS__ArrayFilter(
                ____exports.adversaires(combat, x),
                function(____, c) return pacifiable(x, c) end
            ),
            function(____, c) return c.id end
        ) else {}),
        fuite = combat.fuitePossible,
        ciblesMelee = __TS__ArrayMap(
            ____exports.ciblesValides(combat, x, "ennemi", "melee"),
            function(____, c) return c.id end
        ),
        ciblesDistance = __TS__ArrayMap(
            ____exports.ciblesValides(combat, x, "ennemi", "distance"),
            function(____, c) return c.id end
        ),
        allies = __TS__ArrayMap(
            ____exports.allies(combat, x),
            function(____, c) return c.id end
        ),
        alliesKo = __TS__ArrayMap(
            ____exports.ciblesValides(combat, x, "allie_ko", "distance"),
            function(____, c) return c.id end
        )
    }
end
--- Récompenses d'une victoire, réparties entre les héros présents.
function ____exports.recompensesCombat(contenu, combat, rng)
    local vaincus = __TS__ArrayFilter(
        combat.combattants,
        function(____, x) return x.camp == "ennemis" and x.type == "ennemi" and (x.ko or x.parti) and x.recompenses end
    )
    local heros = __TS__ArrayFilter(
        combat.combattants,
        function(____, x) return x.type == "heros" end
    )
    local facteur = combat.multiplicateurs.pv / math.max(1, combat.multiplicateurs.puissance)
    local xpTotal = __TS__ArrayReduce(
        vaincus,
        function(____, a, x) return a + x.recompenses.xp end,
        0
    )
    local orTotal = __TS__ArrayReduce(
        vaincus,
        function(____, a, x) return a + x.recompenses["or"] end,
        0
    )
    local objets = {}
    for ____, v in ipairs(vaincus) do
        for ____, o in ipairs(v.recompenses.objets) do
            if chance(rng, o.chance) then
                objets[#objets + 1] = o.id
            end
        end
    end
    return {
        xpParHeros = math.floor(xpTotal * facteur + 0.5),
        orParHeros = math.floor(orTotal * facteur / math.max(1, #heros) * 1.5 + 0.5),
        objets = objets
    }
end
local function estimationImpossible(raison)
    return {
        possible = false,
        raison = raison,
        reussite = nil,
        critique = nil,
        mana = 0,
        degats = nil,
        soin = nil,
        nbCibles = 0,
        effets = {}
    }
end
--- Estime une action SANS la jouer : faisabilité, chances, mana, dégâts. Ne modifie rien.
function ____exports.estimerAction(contenu, combat, a)
    local x = __TS__ArrayFind(
        combat.combattants,
        function(____, y) return y.id == a.acteur end
    )
    if not x then
        return estimationImpossible("Personnage inconnu.")
    end
    if combat.resultat then
        return estimationImpossible("Le combat est terminé.")
    end
    if combat.enAttente ~= x.id then
        return estimationImpossible(("Ce n'est pas le tour de " .. x.nom) .. ".")
    end
    do
        local function ____catch(e)
            return true, estimationImpossible(e.message .. ".")
        end
        local ____try, ____hasReturned, ____returnValue = pcall(function()
            verifierAction(contenu, combat, x, a)
        end)
        if not ____try then
            ____hasReturned, ____returnValue = ____catch(____hasReturned)
        end
        if ____hasReturned then
            return ____returnValue
        end
    end
    local variance = contenu.config.combat.variance_degats
    local res = {
        possible = true,
        raison = nil,
        reussite = nil,
        critique = nil,
        mana = 0,
        degats = nil,
        soin = nil,
        nbCibles = 1,
        effets = {}
    }
    local function estimerDegats(cible, puissance, stat, element, rang, coups)
        local brut = puissance * (1 + 0.1 * (rang - 1)) * (1 + x.caracs[stat] / 20) * multiplicateurDegatsSource(combat, x, cible, element)
        local net = math.max(
            1,
            brut * reductionCible(combat, cible, element)
        ) * coups
        return {
            math.max(
                1,
                math.floor(net * (1 - variance) + 0.5)
            ),
            math.max(
                1,
                math.floor(net * (1 + variance) + 0.5)
            )
        }
    end
    local function ajouter(d)
        res.degats = (if res.degats then {res.degats[1] + d[1], res.degats[2] + d[2]} else d)
    end
    local function verifierCible(id, portee)
        local c = (if vrai(id) then __TS__ArrayFind(
            combat.combattants,
            function(____, y) return y.id == id end
        ) else nil)
        if not c then
            return "Il faut choisir une cible."
        end
        if not actif(c) then
            return c.nom .. " est déjà hors de combat."
        end
        if c.camp == x.camp then
            return c.nom .. " est un allié."
        end
        if not __TS__ArraySome(
            ____exports.ciblesValides(combat, x, "ennemi", portee),
            function(____, y) return y.id == c.id end
        ) then
            if aEtat(c, "furtif") then
                return c.nom .. " est caché : impossible de le viser."
            end
            local prov = __TS__ArrayFind(
                x.etats,
                function(____, e) return e.id == "provoque" end
            )
            if prov then
                local ____opt_131 = __TS__ArrayFind(
                    combat.combattants,
                    function(____, y) return y.id == prov.source end
                )
                return ("Vous êtes provoqué : vous devez attaquer " .. (____opt_131 and ____opt_131.nom or "votre provocateur")) .. "."
            end
            if portee == "melee" and c.rang == "arriere" then
                return c.nom .. " est protégé au rang arrière : il faut une attaque à distance, ou éliminer d'abord le rang avant."
            end
            return c.nom .. " est hors de portée."
        end
        return c
    end
    repeat
        local ____switch423 = a.type
        local ____cond423 = ____switch423 == "attaque" or ____switch423 == "viser"
        if ____cond423 then
            do
                local c = verifierCible(a.cible, x.attaque.portee)
                if type(c) == "string" then
                    return estimationImpossible(c)
                end
                local v = (if a.type == "viser" then ____exports.VISEES[a.partie] else nil)
                x.compteurs.modToucher = v and v.toucher or 0
                res.reussite = chanceToucher(contenu, x, c)
                x.compteurs.modToucher = 0
                res.critique = (if aEtat(x, "furtif") then 1 else chanceCritique(contenu, x, c))
                ajouter(estimerDegats(
                    c,
                    x.attaque.puissance * (v and v.degats or 1),
                    x.attaque.stat,
                    x.attaque.element,
                    1,
                    1
                ))
                if v then
                    local ____res_effets_137 = res.effets
                    ____res_effets_137[#____res_effets_137 + 1] = (tostring(math.floor(v.chance * (if c.boss then 0.5 else 1) * 100 + 0.5)) .. " % : ") .. string.lower(____exports.NOMS_ETATS[v.etat])
                end
                return res
            end
        end
        ____cond423 = ____cond423 or ____switch423 == "competence"
        if ____cond423 then
            do
                local k = ____exports.competenceCombattant(contenu, x, a.competence)
                res.mana = k.comp.cout
                local principale = nil
                if k.comp.cible == "ennemi" then
                    local c = verifierCible(a.cible, k.comp.portee)
                    if type(c) == "string" then
                        return estimationImpossible(c)
                    end
                    principale = c
                elseif k.comp.cible == "tous_ennemis" or k.comp.cible == "ennemi_aleatoire" then
                    principale = ____exports.ciblesValides(combat, x, "ennemi", "distance")[1] or nil
                    res.nbCibles = (if k.comp.cible == "tous_ennemis" then #____exports.adversaires(combat, x) else 1)
                elseif k.comp.cible == "allie" or k.comp.cible == "allie_ko" then
                    local liste = (if k.comp.cible == "allie" then ____exports.allies(combat, x) else ____exports.ciblesValides(combat, x, "allie_ko", "distance"))
                    if not vrai(a.cible) or not __TS__ArraySome(
                        liste,
                        function(____, y) return y.id == a.cible end
                    ) then
                        return estimationImpossible((if k.comp.cible == "allie_ko" then "Il faut choisir un allié K.O." else "Il faut choisir un allié."))
                    end
                elseif k.comp.cible == "tous_allies" then
                    res.nbCibles = #____exports.allies(combat, x)
                end
                for ____, ef in ipairs(k.comp.effets) do
                    if ef.type == "degats" and principale then
                        ajouter(estimerDegats(
                            principale,
                            ef.puissance,
                            ef.stat,
                            ef.element,
                            k.rang,
                            ef.coups
                        ))
                        if res.reussite == nil then
                            res.reussite = chanceToucher(contenu, x, principale)
                        end
                        if res.critique == nil then
                            res.critique = (if ef.critique_garanti or aEtat(x, "furtif") then 1 else chanceCritique(contenu, x, principale))
                        end
                    elseif ef.type == "soin" then
                        local s = ef.puissance * (1 + 0.1 * (k.rang - 1)) * (1 + x.caracs[ef.stat] / 20)
                        res.soin = {
                            math.floor(s + 0.5),
                            math.floor(s + 0.5)
                        }
                    elseif ef.type == "etat" then
                        local ____res_effets_138 = res.effets
                        ____res_effets_138[#____res_effets_138 + 1] = (if ef.chance < 1 then tostring(math.floor(ef.chance * 100 + 0.5)) .. " % : " else "") .. string.lower(____exports.NOMS_ETATS[ef.etat])
                    elseif ef.type == "bouclier" then
                        local ____res_effets_139 = res.effets
                        ____res_effets_139[#____res_effets_139 + 1] = ("bouclier (" .. tostring(math.floor(ef.pourcent_pv * 100 + 0.5))) .. " % des PV)"
                    elseif ef.type == "invocation" then
                        local ____res_effets_142 = res.effets
                        local ____opt_140 = contenu.ennemis[ef.creature]
                        ____res_effets_142[#____res_effets_142 + 1] = "invocation : " .. (____opt_140 and ____opt_140.nom or ef.creature)
                    end
                end
                return res
            end
        end
        ____cond423 = ____cond423 or ____switch423 == "se_cacher"
        if ____cond423 then
            res.reussite = ____exports.chanceSeCacher(combat, x)
            local ____res_effets_143 = res.effets
            ____res_effets_143[#____res_effets_143 + 1] = "furtif : impossible à cibler, prochaine attaque critique"
            return res
        end
        ____cond423 = ____cond423 or ____switch423 == "fuir"
        if ____cond423 then
            res.reussite = math.min(
                0.9,
                math.max(
                    0.2,
                    0.5 + 0.03 * (x.caracs.AGI - math.max(table.unpack(__TS__ArrayMap(
                        ____exports.adversaires(combat, x),
                        function(____, y) return y.caracs.AGI end
                    ))))
                )
            )
            return res
        end
        ____cond423 = ____cond423 or ____switch423 == "objet"
        if ____cond423 then
            if a.objet == "potion" then
                local ____temp_146 = 16 * 1.5
                local ____opt_144 = x.passif
                local s = ____temp_146 * (if (____opt_144 and ____opt_144.id) == "fioles-optimisees" then 1 + (x.passif.parametres.efficacite or 0.4) else 1)
                res.soin = {
                    math.floor(s + 0.5),
                    math.floor(s + 0.5)
                }
            end
            return res
        end
        ____cond423 = ____cond423 or ____switch423 == "defendre"
        if ____cond423 then
            local ____res_effets_147 = res.effets
            ____res_effets_147[#____res_effets_147 + 1] = "−50 % de dégâts reçus jusqu'au prochain tour, +10 % de mana"
            return res
        end
        do
            return res
        end
    until true
end
return ____exports
 end,
["src.moteur.fusions"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local ____exports = {}
local ____personnage = require("src.moteur.personnage")
local competencesConnues = ____personnage.competencesConnues
local ____outils = require("src.moteur.outils")
local vrai = ____outils.vrai
____exports.NOM_ELEMENT = {
    physique = "acier",
    feu = "flamme",
    glace = "givre",
    foudre = "foudre",
    sacre = "lumière",
    ombre = "ombre",
    poison = "venin",
    arcane = "runes"
}
local ELEMENT_D_ETAT = {
    brulure = "feu",
    gel = "glace",
    poison = "poison",
    silence = "arcane",
    peur = "ombre",
    sommeil = "arcane",
    marque = "arcane",
    immobilise = "physique"
}
--- Élément « dominant » d'une compétence : celui de ses dégâts, sinon celui de son principal effet.
function ____exports.elementDe(c)
    local d = __TS__ArrayFind(
        c.effets,
        function(____, e) return e.type == "degats" end
    )
    if d then
        return d.element
    end
    local s = __TS__ArrayFind(
        c.effets,
        function(____, e) return e.type == "etat" end
    )
    return (if s then ELEMENT_D_ETAT[s.etat] or nil else nil)
end
____exports.idFusion = function(parent, secondaire) return (("fusion:" .. parent) .. "+") .. secondaire end
--- Construit la technique (sans l'apprendre).
function ____exports.creerTechnique(contenu, parentId, secondaireId, auteur)
    local p = contenu.competences[parentId]
    local q = contenu.competences[secondaireId]
    if not p or not q then
        return {ok = false, raison = "Compétence inconnue."}
    end
    if parentId == secondaireId then
        return {ok = false, raison = "Il faut deux compétences différentes."}
    end
    local dp = __TS__ArrayFind(
        p.effets,
        function(____, e) return e.type == "degats" end
    )
    if not dp then
        return {ok = false, raison = ("« " .. p.nom) .. " » n'inflige pas de dégâts : elle ne peut pas servir de base à une fusion. Essayez dans l'autre sens."}
    end
    local e1 = dp.element
    local e2 = ____exports.elementDe(q)
    if not vrai(e2) then
        return {ok = false, raison = ("« " .. q.nom) .. " » n'a pas d'élément à transmettre."}
    end
    if e1 == e2 then
        return {ok = false, raison = ((((("« " .. p.nom) .. " » et « ") .. q.nom) .. " » sont du même élément (") .. ____exports.NOM_ELEMENT[e1]) .. ") : rien à fusionner."}
    end
    local dq = __TS__ArrayFind(
        q.effets,
        function(____, e) return e.type == "degats" end
    )
    local etatsQ = __TS__ArrayFilter(
        q.effets,
        function(____, e) return e.type == "etat" and e.cible ~= "soi" and e.cible ~= "tous_allies" end
    )
    local effets = {
        __TS__ObjectAssign(
            {},
            dp,
            {puissance = math.floor(dp.puissance * 0.75 * 10 + 0.5) / 10}
        ),
        {
            type = "degats",
            puissance = math.floor((dq and dq.puissance or 8) * 0.45 * 10 + 0.5) / 10,
            stat = dq and dq.stat or dp.stat,
            element = e2,
            coups = 1,
            critique_garanti = false,
            cout_pv_pourcent = 0
        },
        table.unpack(__TS__ArrayMap(
            etatsQ,
            function(____, e) return __TS__ObjectAssign(
                {},
                e,
                {chance = math.floor(e.chance * 0.8 * 100 + 0.5) / 100}
            ) end
        ))
    }
    local technique = {
        id = ____exports.idFusion(parentId, secondaireId),
        nom = (p.nom .. " ✦ ") .. ____exports.NOM_ELEMENT[e2],
        description = ((((("Variante de « " .. p.nom) .. " » imprégnée de ") .. ____exports.NOM_ELEMENT[e2]) .. " (fusion avec « ") .. q.nom) .. " »).",
        cout = math.floor((p.cout + q.cout) * 0.75 + 0.5),
        recharge = math.max(p.recharge, q.recharge) + 1,
        cible = p.cible,
        portee = p.portee,
        effets = effets,
        ia = {priorite = 3, quand = "toujours"},
        parent = parentId,
        secondaire = secondaireId,
        elementPrincipal = e1,
        elementSecondaire = e2,
        creePar = auteur
    }
    return {ok = true, technique = technique}
end
--- Le héros peut-il apprendre cette technique ? (raison en français sinon)
function ____exports.peutApprendre(contenu, h, t)
    local cfg = contenu.config.personnage
    local connues = competencesConnues(contenu, h)
    for ____, id in ipairs({t.parent, t.secondaire}) do
        if not __TS__ArrayIncludes(connues, id) then
            local ____opt_4 = contenu.competences[id]
            return ("Il faut connaître « " .. (____opt_4 and ____opt_4.nom or id)) .. " »."
        end
        if (h.rangsCompetences[id] or 1) < cfg.fusion_rang_min then
            return ((((("Il faut « " .. contenu.competences[id].nom) .. " » au rang ") .. tostring(cfg.fusion_rang_min)) .. " au moins (actuellement ") .. tostring(h.rangsCompetences[id] or 1)) .. ")."
        end
    end
    local deja = h.variantes[t.parent] or ({})
    if __TS__ArrayIncludes(deja, t.id) then
        return "Vous connaissez déjà cette technique."
    end
    if #deja >= cfg.variantes_max then
        return ((("« " .. contenu.competences[t.parent].nom) .. " » a déjà ") .. tostring(cfg.variantes_max)) .. " variantes : oubliez-en une d'abord (fiche du personnage)."
    end
    return nil
end
--- Apprend la technique et l'active.
function ____exports.apprendre(h, t)
    local ____h_variantes_7 = h.variantes
    local ____t_parent_8 = t.parent
    local ____array_6 = __TS__SparseArrayNew(table.unpack(h.variantes[t.parent] or ({})))
    __TS__SparseArrayPush(____array_6, t.id)
    ____h_variantes_7[____t_parent_8] = {__TS__SparseArraySpread(____array_6)}
    h.varianteActive[t.parent] = t.id
end
return ____exports
 end,
["src.moteur.temps"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local ____exports = {}
local ____outils = require("src.moteur.outils")
local vrai = ____outils.vrai
local function cal(contenu)
    local c = contenu.config.calendrier
    return {jpm = c.jours_par_mois, mois = c.mois, jpa = c.jours_par_mois * #c.mois}
end
function ____exports.anneeDepart(contenu)
    return contenu.config.saisons[1].annee_debut
end
function ____exports.versDate(contenu, jourAbsolu)
    local ____cal_result_0 = cal(contenu)
    local jpm = ____cal_result_0.jpm
    local jpa = ____cal_result_0.jpa
    local a = math.floor(jourAbsolu / jpa)
    local reste = jourAbsolu - a * jpa
    return {
        annee = ____exports.anneeDepart(contenu) + a,
        mois = math.floor(reste / jpm) + 1,
        jour = reste % jpm + 1
    }
end
function ____exports.versJour(contenu, d)
    local ____cal_result_1 = cal(contenu)
    local jpm = ____cal_result_1.jpm
    local jpa = ____cal_result_1.jpa
    return (d.annee - ____exports.anneeDepart(contenu)) * jpa + ((d.mois or 1) - 1) * jpm + ((d.jour or 1) - 1)
end
function ____exports.formaterDate(contenu, jourAbsolu)
    local d = ____exports.versDate(contenu, jourAbsolu)
    local m = contenu.config.calendrier.mois[d.mois]
    return ((((tostring((if d.jour == 1 then "1er" else d.jour)) .. " ") .. m.nom) .. " ") .. tostring(d.annee)) .. " AV"
end
function ____exports.saisonDe(contenu, jourAbsolu)
    return contenu.config.calendrier.mois[____exports.versDate(contenu, jourAbsolu).mois].saison
end
function ____exports.feteDuJour(contenu, jourAbsolu)
    local d = ____exports.versDate(contenu, jourAbsolu)
    local ____opt_2 = __TS__ArrayFind(
        contenu.config.calendrier.fetes,
        function(____, f) return f.mois == d.mois and f.jour == d.jour end
    )
    return ____opt_2 and ____opt_2.nom or nil
end
--- Fêtes rencontrées entre deux dates (exclu, inclus).
function ____exports.fetesEntre(contenu, de, a)
    local res = {}
    do
        local j = de + 1
        while j <= a do
            local f = ____exports.feteDuJour(contenu, j)
            if vrai(f) then
                res[#res + 1] = {jour = j, nom = f}
            end
            j = j + 1
        end
    end
    return res
end
function ____exports.joursParMois(contenu)
    return contenu.config.calendrier.jours_par_mois
end
--- Chapitre correspondant à une date (saison 1).
function ____exports.chapitreDe(contenu, jourAbsolu)
    local s = contenu.config.saisons[1]
    local annees = ____exports.versDate(contenu, jourAbsolu).annee - s.annee_debut
    return math.min(
        s.chapitres,
        math.max(
            1,
            math.floor(annees / s.annees_par_chapitre) + 1
        )
    )
end
return ____exports
 end,
["src.moteur.partie"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__New = ____lualib.__TS__New
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__StringReplaceAll = ____lualib.__TS__StringReplaceAll
local __TS__ObjectRest = ____lualib.__TS__ObjectRest
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__ArrayUnshift = ____lualib.__TS__ArrayUnshift
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__StringAccess = ____lualib.__TS__StringAccess
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__StringTrim = ____lualib.__TS__StringTrim
local __TS__ArrayEvery = ____lualib.__TS__ArrayEvery
local __TS__ArrayFlatMap = ____lualib.__TS__ArrayFlatMap
local __TS__ArrayPush = ____lualib.__TS__ArrayPush
local Set = ____lualib.Set
local __TS__Spread = ____lualib.__TS__Spread
local Map = ____lualib.Map
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__InstanceOf = ____lualib.__TS__InstanceOf
local ____exports = {}
local journal, appliquerConsequence, avancerTemps, participantsGroupe, entrerNoeud, terminerScene, resoudreChoix, lancerCombat, reveler, resoudreVote, refuser
local ____affinite = require("src.moteur.affinite")
local affiniteVide = ____affinite.affiniteVide
local modifierAffinite = ____affinite.modifierAffinite
local palier = ____affinite.palier
local paliersAtteints = ____affinite.paliersAtteints
local pardonner = ____affinite.pardonner
local peutOffrir = ____affinite.peutOffrir
local reactionCadeau = ____affinite.reactionCadeau
local verifierLignesRouges = ____affinite.verifierLignesRouges
local ____combat = require("src.moteur.combat")
local annulerTour = ____combat.annulerTour
local avancer = ____combat.avancer
local combattantCompagnon = ____combat.combattantCompagnon
local combattantHeros = ____combat.combattantHeros
local demarrerCombat = ____combat.demarrerCombat
local jouerAction = ____combat.jouerAction
local recompensesCombat = ____combat.recompensesCombat
local ____personnage = require("src.moteur.personnage")
local age = ____personnage.age
local ameliorerCompetence = ____personnage.ameliorerCompetence
local caracsTotales = ____personnage.caracsTotales
local choisirBranche = ____personnage.choisirBranche
local competencesConnues = ____personnage.competencesConnues
local creerHeros = ____personnage.creerHeros
local gagnerXp = ____personnage.gagnerXp
local niveauMoyen = ____personnage.niveauMoyen
local repartirPoint = ____personnage.repartirPoint
local xpPourNiveau = ____personnage.xpPourNiveau
local ____rng = require("src.moteur.rng")
local creerRng = ____rng.creerRng
local de = ____rng.de
local ____outils = require("src.moteur.outils")
local cles = ____outils.cles
local copieProfonde = ____outils.copieProfonde
local entrees = ____outils.entrees
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
local ____fusions = require("src.moteur.fusions")
local apprendre = ____fusions.apprendre
local creerTechnique = ____fusions.creerTechnique
local idFusion = ____fusions.idFusion
local peutApprendre = ____fusions.peutApprendre
local ____temps = require("src.moteur.temps")
local anneeDepart = ____temps.anneeDepart
local chapitreDe = ____temps.chapitreDe
local fetesEntre = ____temps.fetesEntre
local formaterDate = ____temps.formaterDate
local joursParMois = ____temps.joursParMois
local versDate = ____temps.versDate
local versJour = ____temps.versJour
function ____exports.listeHeros(etat)
    return __TS__ArrayMap(
        __TS__ArrayFilter(
            __TS__ArrayMap(
                etat.ordreJoueurs,
                function(____, j) return etat.joueurs[j].herosId end
            ),
            function(____, x) return vrai(x) end
        ),
        function(____, h) return etat.heros[h] end
    )
end
function journal(contenu, etat, texte)
    local ____etat_journal_0 = etat.journal
    ____etat_journal_0[#____etat_journal_0 + 1] = {
        jour = etat.jour,
        chapitre = etat.chapitre,
        texte = (formaterDate(contenu, etat.jour) .. " — ") .. texte
    }
    local ____etat_dernieresNouvelles_1 = etat.dernieresNouvelles
    ____etat_dernieresNouvelles_1[#____etat_dernieresNouvelles_1 + 1] = texte
end
function ____exports.aFlag(etat, flag, herosId)
    return not not etat.flags[flag] or vrai(herosId) and not not etat.flags[(herosId .. ":") .. flag]
end
function ____exports.affinite(etat, herosId, compagnon)
    local ____etat_affinites_2, ____herosId_3 = etat.affinites, herosId
    if ____etat_affinites_2[____herosId_3] == nil then
        ____etat_affinites_2[____herosId_3] = {}
    end
    local ____etat_affinites_herosId_4, ____compagnon_5 = etat.affinites[herosId], compagnon
    if ____etat_affinites_herosId_4[____compagnon_5] == nil then
        ____etat_affinites_herosId_4[____compagnon_5] = affiniteVide()
    end
    return etat.affinites[herosId][compagnon]
end
function ____exports.queteTerminee(etat, q)
    local ____vrai_result_9 = vrai(q)
    if ____vrai_result_9 then
        local ____opt_7 = etat.quetes[q]
        ____vrai_result_9 = not not (____opt_7 and ____opt_7.terminee)
    end
    return ____vrai_result_9
end
function ____exports.rangGuilde(contenu, points)
    local r = "F"
    for ____, x in ipairs(contenu.config.guilde.rangs) do
        if points >= x.points then
            r = x.rang
        end
    end
    return r
end
function appliquerConsequence(contenu, etat, eff, heros, messages)
    local hs = __TS__ArrayMap(
        heros,
        function(____, h) return etat.heros[h] end
    )
    local function liste(v)
        return (if v == nil then {} else (if __TS__ArrayIsArray(v) then v else {v}))
    end
    for ____, f in ipairs(liste(eff.flag)) do
        if __TS__StringStartsWith(f, "heros:") then
            for ____, h in ipairs(heros) do
                etat.flags[(h .. ":") .. string.sub(f, 7)] = true
            end
        else
            etat.flags[f] = true
        end
    end
    if vrai(eff.retirer_flag) then
        __TS__Delete(etat.flags, eff.retirer_flag)
    end
    for ____, ____value in ipairs(entrees(eff.reputation or ({}))) do
        local f = ____value[1]
        local v = ____value[2]
        etat.reputation[f] = math.max(
            -100,
            math.min(100, (etat.reputation[f] or 0) + v)
        )
        messages[#messages + 1] = ((("Réputation " .. ____exports.nomFaction(f)) .. " ") .. (if v > 0 then "+" else "")) .. tostring(v)
    end
    for ____, ____value in ipairs(entrees(eff.affinite or ({}))) do
        local co = ____value[1]
        local v = ____value[2]
        for ____, h in ipairs(hs) do
            local bonus = (contenu.races[h.race].trait.parametres.affinite_dialogue or 0) + (contenu.dons[h.don].parametres.affinite_dialogue or 0)
            local d = modifierAffinite(
                contenu,
                ____exports.affinite(etat, h.id, co),
                v,
                {
                    ageHeros = age(
                        h,
                        versDate(contenu, etat.jour).annee
                    ),
                    bonusDialogue = bonus
                }
            )
            if d ~= 0 then
                messages[#messages + 1] = (((((contenu.compagnons[co].nom .. " : affinité ") .. (if d > 0 then "+" else "")) .. tostring(d)) .. " (") .. h.nom) .. ")"
            end
        end
    end
    if vrai(eff.xp) then
        for ____, h in ipairs(hs) do
            local n = gagnerXp(contenu, h, eff.xp)
            messages[#messages + 1] = (((h.nom .. " gagne ") .. tostring(eff.xp)) .. " XP") .. (if vrai(n) then (" et monte au niveau " .. tostring(h.niveau)) .. " !" else "")
        end
    end
    if vrai(eff["or"]) then
        for ____, h in ipairs(hs) do
            h["or"] = math.max(0, h["or"] + eff["or"])
            messages[#messages + 1] = ((((h.nom .. " ") .. (if eff["or"] > 0 then "gagne" else "perd")) .. " ") .. tostring(math.abs(eff["or"]))) .. " pièces d'or"
        end
    end
    for ____, o in ipairs(liste(eff.objet)) do
        local h = hs[1]
        if h ~= nil then
            h.inventaire[o] = (h.inventaire[o] or 0) + 1
            messages[#messages + 1] = (h.nom .. " obtient : ") .. contenu.objets[o].nom
        end
    end
    if vrai(eff.retirer_objet) then
        for ____, h in ipairs(hs) do
            if vrai(h.inventaire[eff.retirer_objet]) then
                local ____h_inventaire_26, ____eff_retirer_objet_27 = h.inventaire, eff.retirer_objet
                ____h_inventaire_26[____eff_retirer_objet_27] = ____h_inventaire_26[____eff_retirer_objet_27] - 1
                break
            end
        end
    end
    if vrai(eff.points_guilde) then
        for ____, h in ipairs(hs) do
            local avant = ____exports.rangGuilde(contenu, etat.pointsGuilde[h.id] or 0)
            etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] or 0) + eff.points_guilde
            local apres = ____exports.rangGuilde(contenu, etat.pointsGuilde[h.id])
            messages[#messages + 1] = (((h.nom .. " : +") .. tostring(eff.points_guilde)) .. " points de guilde") .. (if apres ~= avant then (" — nouveau rang " .. apres) .. " !" else "")
        end
    end
    if eff.quete then
        local neuve = not etat.quetes[eff.quete.id]
        etat.quetes[eff.quete.id] = {etape = eff.quete.etape, terminee = false}
        local q = contenu.quetes[eff.quete.id]
        if neuve then
            journal(contenu, etat, ("Nouvelle quête : " .. q.titre) .. ".")
            messages[#messages + 1] = "Nouvelle quête : " .. q.titre
        else
            messages[#messages + 1] = "Quête mise à jour : " .. q.titre
        end
    end
    if vrai(eff.terminer_quete) then
        local ____etat_quetes_30 = etat.quetes
        local ____eff_terminer_quete_31 = eff.terminer_quete
        local ____opt_28 = etat.quetes[eff.terminer_quete]
        ____etat_quetes_30[____eff_terminer_quete_31] = {etape = ____opt_28 and ____opt_28.etape or "fin", terminee = true}
        local q = contenu.quetes[eff.terminer_quete]
        journal(contenu, etat, ("Quête terminée : " .. q.titre) .. ".")
        messages[#messages + 1] = "Quête terminée : " .. q.titre
    end
    if vrai(eff.recruter) and not __TS__ArrayIncludes(etat.compagnonsRencontres, eff.recruter) then
        local ____etat_compagnonsRencontres_32 = etat.compagnonsRencontres
        ____etat_compagnonsRencontres_32[#____etat_compagnonsRencontres_32 + 1] = eff.recruter
        local nom = contenu.compagnons[eff.recruter].nom
        journal(contenu, etat, nom .. " croise la route du groupe.")
        messages[#messages + 1] = nom .. " peut désormais accompagner un héros (palier « Alliée » requis)."
    end
    if vrai(eff.pnj_mort) and not __TS__ArrayIncludes(etat.pnjMorts, eff.pnj_mort) then
        local ____etat_pnjMorts_33 = etat.pnjMorts
        ____etat_pnjMorts_33[#____etat_pnjMorts_33 + 1] = eff.pnj_mort
        etat.flags["mort:" .. eff.pnj_mort] = true
        local ____journal_38 = journal
        local ____contenu_36 = contenu
        local ____etat_37 = etat
        local ____opt_34 = contenu.pnj[eff.pnj_mort]
        ____journal_38(____contenu_36, ____etat_37, (____opt_34 and ____opt_34.nom or eff.pnj_mort) .. " a perdu la vie.")
    end
    for ____, h in ipairs(hs) do
        if vrai(eff.atout) then
            h.atout = eff.atout
        end
        if vrai(eff.origine_enfance) then
            h.origineEnfance = eff.origine_enfance
        end
        if vrai(eff.contact) and not __TS__ArrayIncludes(h.contacts, eff.contact) then
            local ____h_contacts_39 = h.contacts
            ____h_contacts_39[#____h_contacts_39 + 1] = eff.contact
        end
    end
    if vrai(eff.journal) then
        journal(
            contenu,
            etat,
            ____exports.remplacerVariables(contenu, etat, eff.journal, heros)
        )
    end
    if eff.avancer_temps then
        avancerTemps(
            contenu,
            etat,
            eff.avancer_temps.jours + eff.avancer_temps.mois * joursParMois(contenu)
        )
    end
    if eff.aller_date then
        local cible = versJour(contenu, eff.aller_date)
        if cible > etat.jour then
            avancerTemps(contenu, etat, cible - etat.jour)
        end
    end
    if eff.ellipse then
        local jusqua = versJour(contenu, eff.ellipse.jusqua)
        if jusqua > etat.jour then
            etat.tempsLibre = {
                titre = eff.ellipse.titre,
                jusqua = jusqua,
                mois = math.floor((jusqua - etat.jour) / joursParMois(contenu) + 0.5),
                choix = {},
                resultats = nil
            }
            messages[#messages + 1] = ("Ellipse : " .. eff.ellipse.titre) .. ". Chaque joueur choisit ses activités de temps libre."
        end
    end
    if eff.soigner_groupe then
        for ____, h in ipairs(hs) do
            h.blessure = false
        end
    end
    if vrai(eff.fin_chapitre) then
        etat.finChapitre = eff.fin_chapitre
        journal(
            contenu,
            etat,
            ("Fin du chapitre " .. tostring(eff.fin_chapitre)) .. "."
        )
    end
    for ____, h in ipairs(hs) do
        for ____, co in ipairs(cles(contenu.compagnons)) do
            local lignes = verifierLignesRouges(
                contenu,
                co,
                ____exports.affinite(etat, h.id, co),
                function(f) return ____exports.aFlag(etat, f, h.id) end
            )
            for ____, l in ipairs(lignes) do
                messages[#messages + 1] = (contenu.compagnons[co].nom .. " est profondément blessée : ") .. l
            end
            if ____exports.aFlag(etat, "pardon:" .. co, h.id) then
                pardonner(____exports.affinite(etat, h.id, co))
            end
        end
    end
end
function avancerTemps(contenu, etat, jours)
    local avant = etat.jour
    etat.jour = etat.jour + jours
    for ____, f in ipairs(fetesEntre(contenu, avant, etat.jour)) do
        local ____etat_journal_40 = etat.journal
        ____etat_journal_40[#____etat_journal_40 + 1] = {
            jour = f.jour,
            chapitre = etat.chapitre,
            texte = ((formaterDate(contenu, f.jour) .. " — ") .. f.nom) .. "."
        }
    end
    etat.chapitre = math.max(
        etat.chapitre,
        chapitreDe(contenu, etat.jour)
    )
end
function ____exports.nomFaction(f)
    return ({couronne = "Couronne", guilde = "Guilde", concorde = "Concorde", ordre = "Ordre"})[f] or f
end
function ____exports.remplacerVariables(contenu, etat, texte, heros)
    local noms = __TS__ArrayFilter(
        __TS__ArrayMap(
            heros,
            function(____, h)
                local ____opt_41 = etat.heros[h]
                return ____opt_41 and ____opt_41.nom
            end
        ),
        function(____, n) return vrai(n) end
    )
    local listeNoms = (if #noms <= 1 then noms[1] or "le héros" else (table.concat(
        __TS__ArraySlice(noms, 0, -1),
        ", "
    ) .. " et ") .. noms[#noms])
    local ____vrai_result_46 = vrai(etat.meneur)
    if ____vrai_result_46 then
        local ____vrai_45 = vrai
        local ____opt_43 = etat.joueurs[etat.meneur]
        ____vrai_result_46 = ____vrai_45(____opt_43 and ____opt_43.herosId)
    end
    local meneur = (if ____vrai_result_46 then etat.heros[etat.joueurs[etat.meneur].herosId].nom else noms[1] or "")
    local h0 = (if vrai(heros[1]) then etat.heros[heros[1]] else nil)
    return __TS__StringReplaceAll(
        __TS__StringReplaceAll(
            __TS__StringReplaceAll(
                __TS__StringReplaceAll(
                    __TS__StringReplaceAll(
                        __TS__StringReplaceAll(texte, "{heros}", listeNoms),
                        "{groupe}",
                        listeNoms
                    ),
                    "{meneur}",
                    meneur
                ),
                "{date}",
                formaterDate(contenu, etat.jour)
            ),
            "{race}",
            (if h0 then string.lower(contenu.races[h0.race].nom) else "")
        ),
        "{classe}",
        (if h0 then string.lower(contenu.classes[h0.classe].nom) else "")
    )
end
function participantsGroupe(etat)
    return __TS__ArrayMap(
        __TS__ArrayFilter(
            ____exports.listeHeros(etat),
            function(____, h)
                local ____opt_47 = etat.joueurs[h.joueurId]
                return ____opt_47 and ____opt_47.present or h.siAbsent == "ia"
            end
        ),
        function(____, h) return h.id end
    )
end
function entrerNoeud(contenu, etat, cle, noeudId)
    local es = etat.scenes[cle]
    local scene = contenu.scenes[es.sceneId]
    local n = scene.noeuds[noeudId] or refuser("Nœud introuvable : " .. noeudId)
    es.noeud = noeudId
    es.votes = {}
    es.messages = {}
    for ____, eff in ipairs(n.effets) do
        appliquerConsequence(
            contenu,
            etat,
            eff,
            es.heros,
            es.messages
        )
    end
    if n.combat then
        lancerCombat(
            contenu,
            etat,
            n.combat.rencontre,
            (if cle == "groupe" then "groupe" else cle),
            {
                cle = (if cle == "groupe" then "groupe" else cle),
                origine = "scene",
                sceneCle = cle,
                victoire = n.combat.victoire,
                defaite = n.combat.defaite,
                evenementDonjon = nil,
                contrat = nil,
                bilan = nil
            }
        )
    elseif n.donjon then
        local d = contenu.donjons[n.donjon.id]
        etat.donjon = {
            id = d.id,
            x = d.depart.x,
            y = d.depart.y,
            faits = {},
            sceneCle = cle,
            sortie = n.donjon.sortie,
            messages = {("Le groupe entre dans : " .. d.nom) .. "."},
            vus = {}
        }
        reveler(etat, d.depart.x, d.depart.y)
    elseif n.fin then
        terminerScene(contenu, etat, cle)
    end
end
function terminerScene(contenu, etat, cle)
    local es = etat.scenes[cle]
    local s = contenu.scenes[es.sceneId]
    if not s.repetable then
        local ____etat_scenesVues_49 = etat.scenesVues
        ____etat_scenesVues_49[#____etat_scenesVues_49 + 1] = (if s.type == "individuel" then (s.id .. "@") .. es.heros[1] else s.id)
    end
    es.noeud = "__fin__"
end
function ____exports.noeudCourant(contenu, etat, cle)
    local es = etat.scenes[cle]
    if not es or es.noeud == "__fin__" then
        return nil
    end
    return contenu.scenes[es.sceneId].noeuds[es.noeud] or nil
end
function resoudreChoix(contenu, etat, cle, index, votants)
    local es = etat.scenes[cle]
    local n = ____exports.noeudCourant(contenu, etat, cle)
    local ch = n.choix[index + 1]
    local herosVotants = __TS__ArrayFilter(
        __TS__ArrayMap(
            votants,
            function(____, j)
                local ____opt_50 = etat.joueurs[j]
                return ____opt_50 and ____opt_50.herosId
            end
        ),
        function(____, h) return vrai(h) and __TS__ArrayIncludes(es.heros, h) end
    )
    local msgs = {}
    for ____, eff in ipairs(ch.effets) do
        local aff = eff.affinite
        local flag = eff.flag
        local reste = __TS__ObjectRest(eff, {affinite = true, flag = true})
        local flags = (if flag == nil then {} else (if __TS__ArrayIsArray(flag) then flag else {flag}))
        local perso = __TS__ArrayFilter(
            flags,
            function(____, f) return __TS__StringStartsWith(f, "heros:") end
        )
        local communs = __TS__ArrayFilter(
            flags,
            function(____, f) return not __TS__StringStartsWith(f, "heros:") end
        )
        appliquerConsequence(
            contenu,
            etat,
            __TS__ObjectAssign({}, reste, {flag = communs}),
            es.heros,
            msgs
        )
        if aff or #perso > 0 then
            appliquerConsequence(
                contenu,
                etat,
                {affinite = aff, flag = perso},
                (if #herosVotants > 0 then herosVotants else es.heros),
                msgs
            )
        end
    end
    local suite = ch.aller
    es.dernierTest = nil
    if ch.test then
        local candidats = __TS__ArrayMap(
            es.heros,
            function(____, h) return etat.heros[h] end
        )
        local meilleur = __TS__ArrayReduce(
            candidats,
            function(____, a, b) return (if caracsTotales(contenu, b)[ch.test.carac] > caracsTotales(contenu, a)[ch.test.carac] then b else a) end
        )
        local jet = de(etat.rng, 20)
        local total = jet + caracsTotales(contenu, meilleur)[ch.test.carac]
        local reussi = jet == 20 or jet ~= 1 and total >= ch.test.difficulte
        es.dernierTest = {
            carac = ch.test.carac,
            jet = jet,
            total = total,
            difficulte = ch.test.difficulte,
            reussi = reussi,
            heros = meilleur.id
        }
        suite = (if reussi then ch.test.reussite else ch.test.echec)
    end
    entrerNoeud(contenu, etat, cle, suite)
    __TS__ArrayUnshift(
        etat.scenes[cle].messages,
        table.unpack(msgs)
    )
end
function lancerCombat(contenu, etat, rencontre, cle, contexte)
    local herosIds = (if cle == "groupe" then participantsGroupe(etat) else {cle})
    if #herosIds == 0 then
        refuser("Aucun héros disponible pour combattre")
    end
    local allies = {}
    for ____, id in ipairs(herosIds) do
        local h = etat.heros[id]
        local ____opt_52 = etat.joueurs[h.joueurId]
        local ____temp_54 = ____opt_52 and ____opt_52.present
        if ____temp_54 == nil then
            ____temp_54 = false
        end
        local present = ____temp_54
        allies[#allies + 1] = combattantHeros(contenu, h, present, etat.grimoire)
        local co = etat.equipe[id]
        if vrai(co) and __TS__ArrayIncludes(etat.compagnonsRencontres, co) then
            local p = paliersAtteints(
                contenu,
                ____exports.affinite(etat, id, co),
                ____exports.queteTerminee(etat, contenu.compagnons[co].quete)
            )
            if __TS__ArrayIncludes(p, "alliee") then
                allies[#allies + 1] = combattantCompagnon(contenu, co, h, p)
            end
        end
    end
    local combat = demarrerCombat(
        contenu,
        rencontre,
        allies,
        etat.rng,
        (cle .. ":") .. tostring(etat.numeroAction)
    )
    etat.combats[cle] = {combat = combat, contexte = contexte}
end
function reveler(etat, x, y)
    if not etat.donjon then
        return
    end
    do
        local dy = -3
        while dy <= 3 do
            do
                local dx = -3
                while dx <= 3 do
                    local k = (tostring(x + dx) .. ",") .. tostring(y + dy)
                    if not __TS__ArrayIncludes(etat.donjon.vus, k) then
                        local ____etat_donjon_vus_59 = etat.donjon.vus
                        ____etat_donjon_vus_59[#____etat_donjon_vus_59 + 1] = k
                    end
                    dx = dx + 1
                end
            end
            dy = dy + 1
        end
    end
end
function resoudreVote(contenu, etat)
    local es = etat.scenes.groupe
    local comptes = __TS__New(Map)
    for ____, ____value in ipairs(entrees(es.votes)) do
        local joueur = ____value[1]
        local idx = ____value[2]
        local ____comptes_set_94 = comptes.set
        local ____idx_93 = idx
        local ____array_92 = __TS__SparseArrayNew(table.unpack(comptes:get(idx) or ({})))
        __TS__SparseArrayPush(____array_92, joueur)
        ____comptes_set_94(
            comptes,
            ____idx_93,
            {__TS__SparseArraySpread(____array_92)}
        )
    end
    local meilleur = -1
    local max = -1
    for ____, ____value in __TS__Iterator(comptes) do
        local idx = ____value[1]
        local v = ____value[2]
        if #v > max or #v == max and vrai(etat.meneur) and __TS__ArrayIncludes(v, etat.meneur) then
            meilleur = idx
            max = #v
        end
    end
    resoudreChoix(
        contenu,
        etat,
        "groupe",
        meilleur,
        comptes:get(meilleur) or ({})
    )
end
function ____exports.prixAchat(contenu, h, objet)
    local p = contenu.objets[objet].prix
    local r = contenu.races[h.race].trait.parametres.prix or 0
    return math.max(
        1,
        math.floor(p * (1 + r) + 0.5)
    )
end
function ____exports.prixVente(contenu, h, objet)
    local p = contenu.objets[objet].prix
    return math.max(
        0,
        math.floor(p * (if h.don == "reserve-du-neant" then 0.6 else 0.5))
    )
end
____exports.VERSION_ETAT = 2
____exports.MAX_JOUEURS = 6
____exports.ErreurAction = __TS__Class()
local ErreurAction = ____exports.ErreurAction
ErreurAction.name = "ErreurAction"
__TS__ClassExtends(ErreurAction, Error)
function ErreurAction.prototype.____constructor(self, message)
    Error.prototype.____constructor(self, message)
    self.name = "ErreurAction"
end
refuser = function(m)
    error(
        __TS__New(____exports.ErreurAction, m),
        0
    )
end
function ____exports.nouvellePartie(contenu, id, nom, graine)
    return {
        version = ____exports.VERSION_ETAT,
        id = id,
        nom = nom,
        graine = graine,
        rng = creerRng(graine),
        numeroAction = 0,
        joueurs = {},
        ordreJoueurs = {},
        heros = {},
        jour = 0,
        chapitre = 1,
        session = 1,
        meneur = nil,
        flags = {},
        reputation = {couronne = 0, guilde = 0, concorde = 0, ordre = 0},
        affinites = {},
        compagnonsRencontres = {},
        equipe = {},
        pnjMorts = {},
        quetes = {},
        pointsGuilde = {},
        scenes = {},
        scenesVues = {},
        combats = {},
        donjon = nil,
        tempsLibre = nil,
        journal = {{
            jour = 0,
            chapitre = 1,
            texte = ((("Printemps " .. tostring(anneeDepart(contenu))) .. " AV : la partie « ") .. nom) .. " » commence."
        }},
        secondDepart = {},
        dernieresNouvelles = {},
        finChapitre = nil,
        grimoire = {}
    }
end
function ____exports.herosDuJoueur(etat, joueur)
    local j = etat.joueurs[joueur] or refuser("Joueur inconnu")
    return etat.heros[j.herosId or ""] or refuser("Ce joueur n'a pas encore de héros")
end
function ____exports.palierCompagnon(contenu, etat, herosId, compagnon)
    local ____palier_16 = palier
    local ____contenu_14 = contenu
    local ____exports_affinite_result_15 = ____exports.affinite(etat, herosId, compagnon)
    local ____exports_queteTerminee_13 = ____exports.queteTerminee
    local ____etat_12 = etat
    local ____opt_10 = contenu.compagnons[compagnon]
    return ____palier_16(
        ____contenu_14,
        ____exports_affinite_result_15,
        ____exports_queteTerminee_13(____etat_12, ____opt_10 and ____opt_10.quete)
    )
end
local ordreRangs = {
    "F",
    "E",
    "D",
    "C",
    "B",
    "A",
    "S"
}
--- Une condition sur un héros précis (scènes individuelles, dialogues).
function ____exports.conditionHeros(contenu, etat, c, h)
    if not c then
        return true
    end
    local function liste(v)
        return (if v == nil then nil else (if __TS__ArrayIsArray(v) then v else {v}))
    end
    if vrai(c.flag) and not ____exports.aFlag(etat, c.flag, h and h.id) then
        return false
    end
    if vrai(c.pas_flag) and ____exports.aFlag(etat, c.pas_flag, h and h.id) then
        return false
    end
    for ____, ____value in ipairs(entrees(c.quete_etape or ({}))) do
        local q = ____value[1]
        local et = ____value[2]
        local ____opt_21 = etat.quetes[q]
        if (____opt_21 and ____opt_21.etape) ~= et then
            return false
        end
    end
    local ____vrai_result_25 = vrai(c.quete_terminee)
    if ____vrai_result_25 then
        local ____opt_23 = etat.quetes[c.quete_terminee]
        ____vrai_result_25 = not (____opt_23 and ____opt_23.terminee)
    end
    if ____vrai_result_25 then
        return false
    end
    for ____, ____value in ipairs(entrees(c.reputation_min or ({}))) do
        local f = ____value[1]
        local v = ____value[2]
        if (etat.reputation[f] or 0) < v then
            return false
        end
    end
    if c.date_min and etat.jour < versJour(contenu, c.date_min) then
        return false
    end
    if c.ou and not __TS__ArraySome(
        c.ou,
        function(____, x) return ____exports.conditionHeros(contenu, etat, x, h) end
    ) then
        return false
    end
    local besoinHeros = __TS__ArraySome(
        {
            c.race,
            c.classe,
            c.origine,
            c.don,
            c.affinite_min,
            c.affinite_palier,
            c.carac_min,
            c.objet,
            c.rang_guilde_min
        },
        function(____, x) return vrai(x) end
    ) or c.niveau_min ~= nil or c.or_min ~= nil
    if not besoinHeros then
        return true
    end
    if not h then
        return false
    end
    local races = liste(c.race)
    if races and not __TS__ArrayIncludes(races, h.race) then
        return false
    end
    local classes = liste(c.classe)
    if classes and not __TS__ArrayIncludes(classes, h.classe) then
        return false
    end
    if c.origine and h.origine ~= c.origine then
        return false
    end
    if vrai(c.don) and h.don ~= c.don then
        return false
    end
    for ____, ____value in ipairs(entrees(c.affinite_min or ({}))) do
        local co = ____value[1]
        local v = ____value[2]
        if ____exports.affinite(etat, h.id, co).points < v then
            return false
        end
    end
    for ____, ____value in ipairs(entrees(c.affinite_palier or ({}))) do
        local co = ____value[1]
        local p = ____value[2]
        local ps = __TS__ArrayMap(
            contenu.config.affinite.paliers,
            function(____, x) return x.id end
        )
        if ____exports.palierCompagnon(contenu, etat, h.id, co).index < __TS__ArrayIndexOf(ps, p) then
            return false
        end
    end
    local ca = caracsTotales(contenu, h)
    for ____, ____value in ipairs(entrees(c.carac_min or ({}))) do
        local k = ____value[1]
        local v = ____value[2]
        if ca[k] < (v or 0) then
            return false
        end
    end
    if c.niveau_min ~= nil and h.niveau < c.niveau_min then
        return false
    end
    if c.or_min ~= nil and h["or"] < c.or_min then
        return false
    end
    if vrai(c.objet) and not (h.inventaire[c.objet] > 0) then
        return false
    end
    if vrai(c.rang_guilde_min) and __TS__ArrayIndexOf(
        ordreRangs,
        ____exports.rangGuilde(contenu, etat.pointsGuilde[h.id] or 0)
    ) < __TS__ArrayIndexOf(ordreRangs, c.rang_guilde_min) then
        return false
    end
    return true
end
--- Une condition dans une scène : vraie si au moins un héros participant la remplit.
function ____exports.conditionScene(contenu, etat, c, heros)
    if not c then
        return true
    end
    if #heros == 0 then
        return ____exports.conditionHeros(contenu, etat, c, nil)
    end
    return __TS__ArraySome(
        heros,
        function(____, h) return ____exports.conditionHeros(contenu, etat, c, etat.heros[h]) end
    )
end
function ____exports.sceneEstDisponible(contenu, etat, s, herosId)
    if not s.repetable and __TS__ArrayIncludes(etat.scenesVues, s.id) then
        return false
    end
    if s.type == "individuel" then
        if not vrai(herosId) then
            return false
        end
        if not s.repetable and __TS__ArrayIncludes(etat.scenesVues, (s.id .. "@") .. herosId) then
            return false
        end
        return ____exports.conditionHeros(contenu, etat, s.disponible_si, etat.heros[herosId])
    end
    return ____exports.conditionScene(
        contenu,
        etat,
        s.disponible_si,
        __TS__ArrayMap(
            ____exports.listeHeros(etat),
            function(____, h) return h.id end
        )
    )
end
--- Scènes que l'on peut lancer dans un lieu (ou partout si lieu = null).
function ____exports.scenesDisponibles(contenu, etat, lieu, herosId)
    return __TS__ArrayFilter(
        valeurs(contenu.scenes),
        function(____, s) return (if lieu == nil then not vrai(s.lieu) else s.lieu == lieu) and ____exports.sceneEstDisponible(contenu, etat, s, herosId) end
    )
end
function ____exports.choixVisibles(contenu, etat, cle)
    local n = ____exports.noeudCourant(contenu, etat, cle)
    if not n then
        return {}
    end
    local es = etat.scenes[cle]
    return __TS__ArrayFilter(
        __TS__ArrayMap(
            n.choix,
            function(____, choix, index) return {
                choix = choix,
                index = index,
                possible = ____exports.conditionScene(contenu, etat, choix.si, es.heros)
            } end
        ),
        function(____, c) return c.possible or c.choix.visible_si_bloque end
    )
end
local function terminerCombat(contenu, etat, cle)
    local ____etat_combats_cle_55 = etat.combats[cle]
    local combat = ____etat_combats_cle_55.combat
    local contexte = ____etat_combats_cle_55.contexte
    local bilan = {}
    local heros = __TS__ArrayMap(
        __TS__ArrayFilter(
            combat.combattants,
            function(____, c) return c.type == "heros" end
        ),
        function(____, c) return etat.heros[c.herosId] end
    )
    for ____, c in ipairs(__TS__ArrayFilter(
        combat.combattants,
        function(____, x) return x.type == "heros" end
    )) do
        local h = etat.heros[c.herosId]
        local utilisees = c.compteurs.potionsUtilisees or 0
        if vrai(utilisees) then
            h.inventaire["potion-soin-petite"] = math.max(0, (h.inventaire["potion-soin-petite"] or 0) - utilisees)
        end
    end
    if combat.resultat == "victoire" then
        local r = recompensesCombat(contenu, combat, etat.rng)
        for ____, h in ipairs(heros) do
            local n = gagnerXp(contenu, h, r.xpParHeros)
            h["or"] = h["or"] + r.orParHeros
            bilan[#bilan + 1] = (((((h.nom .. " : +") .. tostring(r.xpParHeros)) .. " XP, +") .. tostring(r.orParHeros)) .. " or") .. (if vrai(n) then (" — niveau " .. tostring(h.niveau)) .. " !" else "")
        end
        __TS__ArrayForEach(
            r.objets,
            function(____, o, i)
                local h = heros[i % #heros + 1]
                h.inventaire[o] = (h.inventaire[o] or 0) + 1
                bilan[#bilan + 1] = (h.nom .. " récupère : ") .. contenu.objets[o].nom
            end
        )
    elseif combat.resultat == "defaite" then
        for ____, h in ipairs(heros) do
            local perte = math.floor(h["or"] * contenu.config.mort_douce.perte_or_pourcent / 100)
            h["or"] = h["or"] - perte
            h.blessure = true
            bilan[#bilan + 1] = ((((h.nom .. " se réveille au refuge, blessé (−") .. tostring(contenu.config.mort_douce.blessure_pv_pourcent)) .. " % de PV max jusqu'au repos) et perd ") .. tostring(perte)) .. " or."
        end
        journal(contenu, etat, ("Défaite face à : " .. combat.nom) .. ".")
    else
        bilan[#bilan + 1] = "Le groupe a pris la fuite."
    end
    contexte.bilan = bilan
end
local function apresCombat(contenu, etat, cle)
    local ____etat_combats_cle_56 = etat.combats[cle]
    local combat = ____etat_combats_cle_56.combat
    local contexte = ____etat_combats_cle_56.contexte
    __TS__Delete(etat.combats, cle)
    local victoire = combat.resultat == "victoire"
    if contexte.origine == "scene" and vrai(contexte.sceneCle) and etat.scenes[contexte.sceneCle] then
        entrerNoeud(contenu, etat, contexte.sceneCle, (if victoire then contexte.victoire else contexte.defaite))
        __TS__ArrayUnshift(
            etat.scenes[contexte.sceneCle].messages,
            table.unpack(contexte.bilan or ({}))
        )
    elseif contexte.origine == "donjon" and etat.donjon then
        if victoire and vrai(contexte.evenementDonjon) then
            local ____etat_donjon_faits_57 = etat.donjon.faits
            ____etat_donjon_faits_57[#____etat_donjon_faits_57 + 1] = contexte.evenementDonjon
        end
        etat.donjon.messages = {table.unpack(contexte.bilan or ({}))}
        if not victoire then
            local d = etat.donjon
            local ____array_58 = __TS__SparseArrayNew(table.unpack(contexte.bilan or ({})))
            __TS__SparseArrayPush(____array_58, "Vous reprenez connaissance près de l'escalier d'entrée. Les ennemis vaincus ne se relèveront pas.")
            local msg = (if combat.resultat == "defaite" then {__TS__SparseArraySpread(____array_58)} else {"Le groupe se replie vers l'entrée."})
            etat.donjon = __TS__ObjectAssign({}, d, {x = contenu.donjons[d.id].depart.x, y = contenu.donjons[d.id].depart.y, messages = msg})
        end
    elseif contexte.origine == "contrat" and vrai(contexte.contrat) then
        local h = etat.heros[cle]
        local ct = contenu.contrats[contexte.contrat]
        if victoire then
            local msgs = {}
            appliquerConsequence(
                contenu,
                etat,
                {["or"] = ct.recompenses["or"], xp = ct.recompenses.xp, points_guilde = ct.recompenses.points_guilde, objet = ct.recompenses.objets},
                {h.id},
                msgs
            )
            journal(contenu, etat, ((h.nom .. " remplit le contrat « ") .. ct.titre) .. " ».")
        end
    end
end
local INFRANCHISSABLE = {"mur", "vide", "eau", "colonne"}
function ____exports.caseDonjon(contenu, id, x, y)
    local d = contenu.donjons[id]
    local ligne = d.carte[y + 1]
    if not vrai(ligne) or x < 0 or x >= #ligne then
        return "vide"
    end
    return d.legende[__TS__StringAccess(ligne, x)]
end
local function deplacerDonjon(contenu, etat, dx, dy)
    local dj = etat.donjon or refuser("Le groupe n'est pas dans un donjon")
    if __TS__ArrayIncludes(
        cles(etat.combats),
        "groupe"
    ) then
        refuser("Un combat est en cours")
    end
    if math.abs(dx) + math.abs(dy) ~= 1 then
        refuser("Déplacement d'une case à la fois")
    end
    local nx = dj.x + dx
    local ny = dj.y + dy
    local t = ____exports.caseDonjon(contenu, dj.id, nx, ny)
    local d = contenu.donjons[dj.id]
    local ev = __TS__ArrayFind(
        d.evenements,
        function(____, e) return e.x == nx and e.y == ny and not (e.unique and __TS__ArrayIncludes(dj.faits, e.id)) and ____exports.conditionScene(
            contenu,
            etat,
            e.si,
            participantsGroupe(etat)
        ) end
    )
    if __TS__ArraySome(
        INFRANCHISSABLE,
        function(____, m) return __TS__StringStartsWith(t, m) end
    ) then
        if (ev and ev.type) == "texte" and vrai(ev.texte) then
            dj.messages = {ev.texte}
        else
            refuser("Passage bloqué")
        end
        return
    end
    if __TS__StringStartsWith(t, "porte-verrouillee") and not __TS__ArraySome(
        ____exports.listeHeros(etat),
        function(____, h) return vrai(h.inventaire["cle-crypte"]) end
    ) then
        dj.messages = {"Une lourde porte de bronze, verrouillée. Il faudrait une clé."}
        return
    end
    dj.x = nx
    dj.y = ny
    dj.messages = {}
    reveler(etat, nx, ny)
    if not ev then
        return
    end
    local heros = participantsGroupe(etat)
    repeat
        local ____switch212 = ev.type
        local ____cond212 = ____switch212 == "combat"
        if ____cond212 then
            lancerCombat(
                contenu,
                etat,
                ev.rencontre,
                "groupe",
                {
                    cle = "groupe",
                    origine = "donjon",
                    sceneCle = dj.sceneCle,
                    victoire = nil,
                    defaite = nil,
                    evenementDonjon = ev.id,
                    contrat = nil,
                    bilan = nil
                }
            )
            if vrai(ev.texte) then
                local ____dj_messages_62 = dj.messages
                ____dj_messages_62[#____dj_messages_62 + 1] = ev.texte
            end
            return
        end
        ____cond212 = ____cond212 or ____switch212 == "coffre"
        if ____cond212 then
            do
                local ____dj_faits_63 = dj.faits
                ____dj_faits_63[#____dj_faits_63 + 1] = ev.id
                local msgs = {ev.texte or "Un coffre !"}
                if vrai(ev["or"]) then
                    appliquerConsequence(
                        contenu,
                        etat,
                        {["or"] = math.floor(ev["or"] / math.max(1, #heros) + 0.5)},
                        heros,
                        msgs
                    )
                end
                __TS__ArrayForEach(
                    ev.objets,
                    function(____, o, i) return appliquerConsequence(
                        contenu,
                        etat,
                        {objet = o},
                        {heros[i % #heros + 1]},
                        msgs
                    ) end
                )
                dj.messages = msgs
                return
            end
        end
        ____cond212 = ____cond212 or ____switch212 == "piege"
        if ____cond212 then
            do
                local ____dj_faits_64 = dj.faits
                ____dj_faits_64[#____dj_faits_64 + 1] = ev.id
                local t2 = ev.test or ({carac = "AGI", difficulte = 15})
                local meilleur = __TS__ArrayReduce(
                    __TS__ArrayMap(
                        heros,
                        function(____, h) return etat.heros[h] end
                    ),
                    function(____, a, b) return (if caracsTotales(contenu, b)[t2.carac] > caracsTotales(contenu, a)[t2.carac] then b else a) end
                )
                local jet = de(etat.rng, 20)
                local total = jet + caracsTotales(contenu, meilleur)[t2.carac]
                if total >= t2.difficulte then
                    dj.messages = {(((((((((((((ev.texte or "Un piège !") .. " ") .. meilleur.nom) .. " le repère à temps (") .. t2.carac) .. " : ") .. tostring(jet)) .. " + ") .. tostring(total - jet)) .. " = ") .. tostring(total)) .. " ≥ ") .. tostring(t2.difficulte)) .. ")."}
                else
                    for ____, h in ipairs(heros) do
                        etat.heros[h].blessure = true
                    end
                    dj.messages = {(((((((ev.texte or "Un piège !") .. " Le groupe est pris au dépourvu (") .. t2.carac) .. " : ") .. tostring(total)) .. " < ") .. tostring(t2.difficulte)) .. ") : tout le monde est blessé jusqu'au prochain repos."}
                end
                return
            end
        end
        ____cond212 = ____cond212 or ____switch212 == "texte"
        if ____cond212 then
            if ev.unique then
                local ____dj_faits_65 = dj.faits
                ____dj_faits_65[#____dj_faits_65 + 1] = ev.id
            end
            dj.messages = {ev.texte or ""}
            return
        end
        ____cond212 = ____cond212 or ____switch212 == "sortie"
        if ____cond212 then
            do
                local cle = dj.sceneCle
                local sortie = dj.sortie
                etat.donjon = nil
                if etat.scenes[cle] then
                    entrerNoeud(contenu, etat, cle, sortie)
                end
                return
            end
        end
        ____cond212 = ____cond212 or ____switch212 == "scene"
        if ____cond212 then
            local ____dj_faits_66 = dj.faits
            ____dj_faits_66[#____dj_faits_66 + 1] = ev.id
            dj.messages = {ev.texte or ""}
            return
        end
    until true
end
local function resoudreTempsLibre(contenu, etat)
    local tl = etat.tempsLibre
    local f = tl.mois / contenu.config.ellipses.duree_reference_mois
    local resultats = {}
    for ____, h in ipairs(____exports.listeHeros(etat)) do
        local r = {}
        for ____, choix in ipairs(tl.choix[h.id] or ({})) do
            local a = contenu.activites[choix.activite]
            local g = a.gains
            if vrai(g.xp_pourcent_niveau) then
                local xp = math.floor(xpPourNiveau(contenu, h.niveau) * g.xp_pourcent_niveau * f + 0.5)
                local n = gagnerXp(contenu, h, xp)
                r[#r + 1] = (((a.nom .. " : +") .. tostring(xp)) .. " XP") .. (if vrai(n) then (" (niveau " .. tostring(h.niveau)) .. " !)" else "")
            end
            if g.carac_plus_un then
                h.pointsCaracDispo = h.pointsCaracDispo + 1
                r[#r + 1] = a.nom .. " : +1 point de caractéristique à répartir"
            end
            local ____or = g.or_base * f
            if g.or_par_carac then
                ____or = ____or + caracsTotales(contenu, h)[g.or_par_carac.carac] * g.or_par_carac.valeur * f
            end
            if vrai(____or) then
                h["or"] = h["or"] + math.floor(____or + 0.5)
                r[#r + 1] = ((a.nom .. " : +") .. tostring(math.floor(____or + 0.5))) .. " or"
            end
            if vrai(g.points_guilde) then
                local p = math.floor(g.points_guilde * f + 0.5)
                etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] or 0) + p
                r[#r + 1] = ((((a.nom .. " : +") .. tostring(p)) .. " points de guilde (rang ") .. ____exports.rangGuilde(contenu, etat.pointsGuilde[h.id])) .. ")"
            end
            if g.objet_artisanat then
                local n = math.max(
                    1,
                    math.floor(f * (1 + (if h.don == "main-de-l-artisan" then 1 else 0) + (if h.classe == "alchimiste" then 1 else 0)) + 0.5)
                )
                h.inventaire["potion-soin"] = (h.inventaire["potion-soin"] or 0) + n
                r[#r + 1] = ((a.nom .. " : ") .. tostring(n)) .. " potion(s) de soin fabriquée(s)"
            end
            if vrai(g.affinite) and vrai(choix.compagnon) then
                local d = modifierAffinite(
                    contenu,
                    ____exports.affinite(etat, h.id, choix.compagnon),
                    math.floor(g.affinite * math.max(1, f) + 0.5),
                    {ageHeros = age(
                        h,
                        versDate(contenu, tl.jusqua).annee
                    )}
                )
                r[#r + 1] = (((a.nom .. " avec ") .. contenu.compagnons[choix.compagnon].nom) .. " : affinité +") .. tostring(d)
            end
            if vrai(g.affinite_tous) then
                for ____, co in ipairs(etat.compagnonsRencontres) do
                    modifierAffinite(
                        contenu,
                        ____exports.affinite(etat, h.id, co),
                        g.affinite_tous,
                        {ageHeros = age(
                            h,
                            versDate(contenu, tl.jusqua).annee
                        )}
                    )
                end
            end
            if g.soigne_blessure then
                h.blessure = false
                r[#r + 1] = a.nom .. " : blessures guéries"
            end
        end
        resultats[h.id] = r
    end
    tl.resultats = resultats
    journal(
        contenu,
        etat,
        ((tl.titre .. " (") .. tostring(tl.mois)) .. " mois passent)."
    )
    avancerTemps(contenu, etat, tl.jusqua - etat.jour)
    for ____, h in ipairs(____exports.listeHeros(etat)) do
        h.blessure = false
    end
end
function ____exports.appliquer(contenu, etatAvant, action)
    local etat = copieProfonde(etatAvant)
    etat.dernieresNouvelles = {}
    if etat.grimoire == nil then
        etat.grimoire = {}
    end
    local j = etat.joueurs[action.joueur]
    if action.type ~= "rejoindre" and not j then
        refuser("Joueur inconnu : rejoignez la partie d'abord")
    end
    repeat
        local ____switch247 = action.type
        local ____cond247 = ____switch247 == "rejoindre"
        if ____cond247 then
            do
                if j ~= nil then
                    j.pseudo = action.pseudo
                    j.present = true
                    break
                end
                if #etat.ordreJoueurs >= ____exports.MAX_JOUEURS then
                    refuser(("La partie est complète (" .. tostring(____exports.MAX_JOUEURS)) .. " joueurs maximum)")
                end
                local pseudo = string.sub(
                    __TS__StringTrim(action.pseudo),
                    1,
                    24
                )
                if not vrai(pseudo) then
                    refuser("Choisissez un pseudo")
                end
                if __TS__ArraySome(
                    valeurs(etat.joueurs),
                    function(____, x) return string.lower(x.pseudo) == string.lower(pseudo) end
                ) then
                    refuser("Ce pseudo est déjà pris dans cette partie")
                end
                etat.joueurs[action.joueur] = {id = action.joueur, pseudo = pseudo, herosId = nil, present = true}
                local ____etat_ordreJoueurs_67 = etat.ordreJoueurs
                ____etat_ordreJoueurs_67[#____etat_ordreJoueurs_67 + 1] = action.joueur
                if etat.meneur == nil then
                    etat.meneur = action.joueur
                end
                journal(contenu, etat, pseudo .. " rejoint la partie.")
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "presence"
        if ____cond247 then
            j.present = action.present
            break
        end
        ____cond247 = ____cond247 or ____switch247 == "creer_heros"
        if ____cond247 then
            do
                if vrai(j.herosId) then
                    refuser("Vous avez déjà un héros")
                end
                local h = action.heros
                if __TS__ArraySome(
                    ____exports.listeHeros(etat),
                    function(____, x) return x.don == h.don end
                ) then
                    local ____opt_68 = contenu.dons[h.don]
                    refuser(("Le don « " .. (____opt_68 and ____opt_68.nom or h.don)) .. " » est déjà pris par un autre joueur")
                end
                local existants = ____exports.listeHeros(etat)
                local enCours = etat.jour > 0 or __TS__ArraySome(
                    existants,
                    function(____, x) return x.niveau > 1 end
                )
                local niveau = (if enCours then niveauMoyen(existants) else 1)
                local id = "h" .. tostring(__TS__ArrayIndexOf(etat.ordreJoueurs, action.joueur) + 1)
                local hero
                do
                    local function ____catch(e)
                        return true, refuser(e.message)
                    end
                    local ____try, ____hasReturned, ____returnValue = pcall(function()
                        hero = creerHeros(
                            contenu,
                            __TS__ObjectAssign(
                                {},
                                h,
                                {
                                    id = id,
                                    joueurId = action.joueur,
                                    anneeCampagne = versDate(
                                        contenu,
                                        math.max(0, etat.jour)
                                    ).annee,
                                    niveau = niveau
                                }
                            )
                        )
                    end)
                    if not ____try then
                        ____hasReturned, ____returnValue = ____catch(____hasReturned)
                    end
                    if ____hasReturned then
                        return ____returnValue
                    end
                end
                etat.heros[id] = hero
                j.herosId = id
                for ____, ____value in ipairs(entrees(contenu.races[hero.race].reputation_depart)) do
                    local f = ____value[1]
                    local v = ____value[2]
                    etat.reputation[f] = (etat.reputation[f] or 0) + v / math.max(1, #existants + 1)
                end
                etat.pointsGuilde[id] = (if enCours then math.floor(__TS__ArrayReduce(
                    existants,
                    function(____, a, x) return a + (etat.pointsGuilde[x.id] or 0) end,
                    0
                ) / math.max(1, #existants) + 0.5) else 0)
                etat.equipe[id] = nil
                if vrai(contenu.dons[hero.don].parametres.affinite_depart) then
                    for ____, co in ipairs(cles(contenu.compagnons)) do
                        ____exports.affinite(etat, id, co).points = contenu.dons[hero.don].parametres.affinite_depart
                    end
                end
                journal(
                    contenu,
                    etat,
                    ((((((((hero.nom .. ", ") .. string.lower(contenu.races[hero.race].nom)) .. " ") .. string.lower(contenu.classes[hero.classe].nom)) .. ", ") .. (if hero.origine == "invoque" then "invoqué" else "réincarné")) .. ", rejoint l'histoire") .. (if niveau > 1 then " au niveau " .. tostring(niveau) else "")) .. "."
                )
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "portrait"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if vrai(action.image) and #action.image > 300000 then
                    refuser("Image trop lourde (300 Ko maximum)")
                end
                h.portrait = action.image
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "si_absent"
        if ____cond247 then
            ____exports.herosDuJoueur(etat, action.joueur).siAbsent = action.mode
            break
        end
        ____cond247 = ____cond247 or ____switch247 == "lancer_scene"
        if ____cond247 then
            do
                local s = contenu.scenes[action.scene] or refuser("Scène inconnue")
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if s.type == "groupe" then
                    if etat.tempsLibre and not etat.tempsLibre.resultats then
                        refuser("Terminez d'abord le temps libre")
                    end
                    if etat.scenes.groupe and etat.scenes.groupe.noeud ~= "__fin__" then
                        refuser("Une scène de groupe est déjà en cours")
                    end
                    if etat.donjon then
                        refuser("Le groupe est dans un donjon")
                    end
                    if not ____exports.sceneEstDisponible(contenu, etat, s, h.id) then
                        refuser("Cette scène n'est pas disponible")
                    end
                    etat.scenes.groupe = {
                        sceneId = s.id,
                        noeud = s.debut,
                        heros = participantsGroupe(etat),
                        votes = {},
                        dernierTest = nil,
                        messages = {}
                    }
                    local ____opt_70 = etat.tempsLibre
                    if ____opt_70 and ____opt_70.resultats then
                        etat.tempsLibre = nil
                    end
                    entrerNoeud(contenu, etat, "groupe", s.debut)
                else
                    if etat.scenes[h.id] and etat.scenes[h.id].noeud ~= "__fin__" then
                        refuser("Vous êtes déjà dans une scène")
                    end
                    if not ____exports.sceneEstDisponible(contenu, etat, s, h.id) then
                        refuser("Cette scène n'est pas disponible")
                    end
                    etat.scenes[h.id] = {
                        sceneId = s.id,
                        noeud = s.debut,
                        heros = {h.id},
                        votes = {},
                        dernierTest = nil,
                        messages = {}
                    }
                    entrerNoeud(contenu, etat, h.id, s.debut)
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "choisir"
        if ____cond247 then
            do
                local es = etat.scenes[action.cle] or refuser("Aucune scène")
                if action.cle ~= "groupe" and j.herosId ~= action.cle then
                    refuser("Ce n'est pas votre scène")
                end
                if etat.combats[action.cle] then
                    refuser("Un combat est en cours")
                end
                if etat.donjon and action.cle == "groupe" then
                    refuser("Le groupe explore un donjon")
                end
                local visibles = ____exports.choixVisibles(contenu, etat, action.cle)
                local c = __TS__ArrayFind(
                    visibles,
                    function(____, x) return x.index == action.index end
                )
                if not c or not c.possible then
                    refuser("Choix impossible")
                end
                if action.cle ~= "groupe" then
                    resoudreChoix(
                        contenu,
                        etat,
                        action.cle,
                        action.index,
                        {action.joueur}
                    )
                    break
                end
                es.votes[action.joueur] = action.index
                local presents = __TS__ArrayFilter(
                    etat.ordreJoueurs,
                    function(____, x) return etat.joueurs[x].present and vrai(etat.joueurs[x].herosId) end
                )
                if __TS__ArrayEvery(
                    presents,
                    function(____, p) return es.votes[p] ~= nil end
                ) then
                    resoudreVote(contenu, etat)
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "trancher"
        if ____cond247 then
            do
                if etat.meneur ~= action.joueur then
                    refuser("Seul le meneur du jour peut trancher")
                end
                local es = etat.scenes.groupe or refuser("Aucune scène de groupe")
                if #cles(es.votes) == 0 then
                    refuser("Personne n'a encore voté")
                end
                resoudreVote(contenu, etat)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "continuer"
        if ____cond247 then
            do
                if action.cle ~= "groupe" and j.herosId ~= action.cle then
                    refuser("Ce n'est pas votre scène")
                end
                if etat.combats[action.cle] then
                    refuser("Un combat est en cours")
                end
                local n = ____exports.noeudCourant(contenu, etat, action.cle) or refuser("Rien à continuer")
                if not vrai(n.suite) then
                    refuser("Il faut faire un choix")
                end
                if action.cle == "groupe" and etat.donjon then
                    refuser("Le groupe explore un donjon")
                end
                entrerNoeud(contenu, etat, action.cle, n.suite)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "quitter_scene"
        if ____cond247 then
            do
                local es = etat.scenes[action.cle]
                if not es then
                    break
                end
                if es.noeud ~= "__fin__" then
                    local s = contenu.scenes[es.sceneId]
                    if not s.repetable or etat.combats[action.cle] then
                        refuser("Cette scène doit être menée jusqu'au bout")
                    end
                end
                __TS__Delete(etat.scenes, action.cle)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "combat"
        if ____cond247 then
            do
                local entree = etat.combats[action.cle] or refuser("Aucun combat")
                local acteur = __TS__ArrayFind(
                    entree.combat.combattants,
                    function(____, c) return c.id == action.action.acteur end
                ) or refuser("Combattant inconnu")
                if acteur.joueurId ~= action.joueur then
                    refuser("Ce personnage ne vous appartient pas")
                end
                do
                    local function ____catch(e)
                        refuser(e.message)
                    end
                    local ____try, ____hasReturned = pcall(function()
                        jouerAction(contenu, entree.combat, etat.rng, action.action)
                    end)
                    if not ____try then
                        ____catch(____hasReturned)
                    end
                end
                if entree.combat.resultat then
                    terminerCombat(contenu, etat, action.cle)
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "second_depart"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if h.don ~= "second-depart" then
                    refuser("Il faut le don Second départ")
                end
                if etat.secondDepart[h.id] == etat.session then
                    refuser("Déjà utilisé pendant cette session")
                end
                local entree = etat.combats[action.cle] or refuser("Aucun combat")
                entree.combat = annulerTour(entree.combat)
                entree.contexte.bilan = nil
                etat.secondDepart[h.id] = etat.session
                avancer(contenu, entree.combat, etat.rng)
                if entree.combat.resultat then
                    terminerCombat(contenu, etat, action.cle)
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "fin_combat"
        if ____cond247 then
            do
                local entree = etat.combats[action.cle] or refuser("Aucun combat")
                if not entree.combat.resultat then
                    refuser("Le combat n'est pas terminé")
                end
                apresCombat(contenu, etat, action.cle)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "donjon_deplacer"
        if ____cond247 then
            local ____temp_74 = etat.meneur ~= action.joueur
            if ____temp_74 then
                local ____opt_72 = etat.joueurs[etat.meneur or ""]
                ____temp_74 = ____opt_72 and ____opt_72.present
            end
            if ____temp_74 then
                refuser("C'est le meneur du jour qui guide le groupe")
            end
            deplacerDonjon(contenu, etat, action.dx, action.dy)
            break
        end
        ____cond247 = ____cond247 or ____switch247 == "temps_libre"
        if ____cond247 then
            do
                local tl = etat.tempsLibre or refuser("Pas de temps libre en cours")
                if tl.resultats then
                    refuser("Le temps libre est terminé")
                end
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local n = contenu.config.ellipses.activites_temps_libre + (if h.don == "croissance-acceleree" then 1 else 0)
                if #action.activites ~= n then
                    refuser(("Choisissez " .. tostring(n)) .. " activités")
                end
                for ____, a in ipairs(action.activites) do
                    local act = contenu.activites[a.activite] or refuser("Activité inconnue")
                    if not ____exports.conditionHeros(contenu, etat, act.disponible_si, h) then
                        refuser(("Activité « " .. act.nom) .. " » indisponible")
                    end
                    if act.choix_compagnon and (not vrai(a.compagnon) or not __TS__ArrayIncludes(etat.compagnonsRencontres, a.compagnon)) then
                        refuser("Choisissez un compagnon rencontré")
                    end
                end
                if h.don == "croissance-acceleree" and #__TS__ArrayFilter(
                    action.activites,
                    function(____, a) return a.activite == "entrainement" end
                ) < 1 then
                    refuser("Le don Croissance accélérée donne une activité « Entraînement » en plus : choisissez-la")
                end
                tl.choix[h.id] = action.activites
                local tous = __TS__ArrayEvery(
                    ____exports.listeHeros(etat),
                    function(____, x) return tl.choix[x.id] end
                )
                if tous then
                    resoudreTempsLibre(contenu, etat)
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "valider_temps_libre"
        if ____cond247 then
            do
                local tl = etat.tempsLibre or refuser("Pas de temps libre en cours")
                if tl.resultats then
                    etat.tempsLibre = nil
                    break
                end
                if etat.meneur ~= action.joueur then
                    refuser("Seul le meneur du jour peut valider pour les absents")
                end
                for ____, h in ipairs(____exports.listeHeros(etat)) do
                    if not tl.choix[h.id] then
                        tl.choix[h.id] = {{activite = "repos"}, {activite = "guilde"}}
                    end
                end
                resoudreTempsLibre(contenu, etat)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "cadeau"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if not __TS__ArrayIncludes(etat.compagnonsRencontres, action.compagnon) then
                    refuser("Vous ne connaissez pas encore ce personnage")
                end
                if not (h.inventaire[action.objet] > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                local a = ____exports.affinite(etat, h.id, action.compagnon)
                if not peutOffrir(contenu, a, etat.jour) then
                    refuser(("Un cadeau tous les " .. tostring(contenu.config.affinite.jours_entre_cadeaux)) .. " jours au plus")
                end
                local ____h_inventaire_75, ____action_objet_76 = h.inventaire, action.objet
                ____h_inventaire_75[____action_objet_76] = ____h_inventaire_75[____action_objet_76] - 1
                local r = reactionCadeau(contenu, action.compagnon, action.objet)
                local d = modifierAffinite(
                    contenu,
                    a,
                    contenu.config.affinite.cadeau[r],
                    {ageHeros = age(
                        h,
                        versDate(contenu, etat.jour).annee
                    )}
                )
                a.dernierCadeau = etat.jour
                local ____etat_dernieresNouvelles_77 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_77[#____etat_dernieresNouvelles_77 + 1] = (((((contenu.compagnons[action.compagnon].nom .. " ") .. ({prefere = "adore", apprecie = "apprécie", neutre = "accepte poliment", deteste = "n'aime pas du tout"})[r]) .. " ce cadeau (") .. (if d >= 0 then "+" else "")) .. tostring(d)) .. ")."
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "equipe"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if vrai(action.compagnon) then
                    if not __TS__ArrayIncludes(etat.compagnonsRencontres, action.compagnon) then
                        refuser("Compagnon inconnu")
                    end
                    if ____exports.palierCompagnon(contenu, etat, h.id, action.compagnon).index < 1 then
                        refuser("Il faut atteindre le palier « Alliée »")
                    end
                    local deja = __TS__ArrayFind(
                        entrees(etat.equipe),
                        function(____, ____bindingPattern0)
                            local c
                            local hid
                            hid = ____bindingPattern0[1]
                            c = ____bindingPattern0[2]
                            return c == action.compagnon and hid ~= h.id
                        end
                    )
                    if deja then
                        refuser((contenu.compagnons[action.compagnon].nom .. " accompagne déjà ") .. etat.heros[deja[1]].nom)
                    end
                end
                etat.equipe[h.id] = action.compagnon
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "equiper"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local o = contenu.objets[action.objet] or refuser("Objet inconnu")
                if o.type ~= "equipement" or not o.emplacement then
                    refuser("Cet objet ne s'équipe pas")
                end
                if not (h.inventaire[o.id] > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                local emplacement = o.emplacement
                local ancien = h.equipement[emplacement]
                if vrai(ancien) then
                    h.inventaire[ancien] = (h.inventaire[ancien] or 0) + 1
                end
                local ____h_inventaire_78, ____o_id_79 = h.inventaire, o.id
                ____h_inventaire_78[____o_id_79] = ____h_inventaire_78[____o_id_79] - 1
                h.equipement[emplacement] = o.id
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "desequiper"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local ancien = h.equipement[action.emplacement]
                if vrai(ancien) then
                    h.inventaire[ancien] = (h.inventaire[ancien] or 0) + 1
                    h.equipement[action.emplacement] = nil
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "acheter"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local lieu = __TS__ArrayFind(
                    __TS__ArrayFlatMap(
                        valeurs(contenu.regions),
                        function(____, r) return r.lieux end
                    ),
                    function(____, l) return l.id == action.lieu end
                ) or refuser("Lieu inconnu")
                if not __TS__ArrayIncludes(lieu.boutique, action.objet) then
                    refuser("Cet objet n'est pas vendu ici")
                end
                local prix = ____exports.prixAchat(contenu, h, action.objet)
                if h["or"] < prix then
                    refuser("Pas assez d'or")
                end
                h["or"] = h["or"] - prix
                h.inventaire[action.objet] = (h.inventaire[action.objet] or 0) + 1
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "vendre"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local o = contenu.objets[action.objet] or refuser("Objet inconnu")
                if not (h.inventaire[o.id] > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                if o.type == "quete" then
                    refuser("On ne vend pas un objet de quête")
                end
                local ____h_inventaire_80, ____o_id_81 = h.inventaire, o.id
                ____h_inventaire_80[____o_id_81] = ____h_inventaire_80[____o_id_81] - 1
                h["or"] = h["or"] + ____exports.prixVente(contenu, h, o.id)
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "utiliser"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if not (h.inventaire[action.objet] > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                if action.objet == "potion-soin" or action.objet == "potion-soin-petite" then
                    refuser("Les potions se boivent en combat (les PV remontent au maximum après chaque combat)")
                end
                refuser("Cet objet ne s'utilise pas hors combat")
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "repartir"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                do
                    local function ____catch(e)
                        refuser(e.message)
                    end
                    local ____try, ____hasReturned = pcall(function()
                        repartirPoint(contenu, h, action.carac)
                    end)
                    if not ____try then
                        ____catch(____hasReturned)
                    end
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "ameliorer"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                do
                    local function ____catch(e)
                        refuser(e.message)
                    end
                    local ____try, ____hasReturned = pcall(function()
                        ameliorerCompetence(contenu, h, action.competence)
                    end)
                    if not ____try then
                        ____catch(____hasReturned)
                    end
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "branche"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                do
                    local function ____catch(e)
                        refuser(e.message)
                    end
                    local ____try, ____hasReturned = pcall(function()
                        choisirBranche(contenu, h, action.branche)
                    end)
                    if not ____try then
                        ____catch(____hasReturned)
                    end
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "contrat"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local ct = contenu.contrats[action.contrat] or refuser("Contrat inconnu")
                if etat.combats[h.id] then
                    refuser("Vous êtes déjà en combat")
                end
                if __TS__ArrayIndexOf(
                    ordreRangs,
                    ____exports.rangGuilde(contenu, etat.pointsGuilde[h.id] or 0)
                ) < __TS__ArrayIndexOf(ordreRangs, ct.rang_min) then
                    refuser("Contrat réservé au rang " .. ct.rang_min)
                end
                if not ____exports.conditionHeros(contenu, etat, ct.disponible_si, h) then
                    refuser("Contrat indisponible")
                end
                if vrai(ct.rencontre) then
                    lancerCombat(
                        contenu,
                        etat,
                        ct.rencontre,
                        h.id,
                        {
                            cle = h.id,
                            origine = "contrat",
                            sceneCle = nil,
                            victoire = nil,
                            defaite = nil,
                            evenementDonjon = nil,
                            contrat = ct.id,
                            bilan = nil
                        }
                    )
                elseif ct.test then
                    local jet = de(etat.rng, 20)
                    local total = jet + caracsTotales(contenu, h)[ct.test.carac]
                    local msgs = {}
                    if total >= ct.test.difficulte then
                        appliquerConsequence(
                            contenu,
                            etat,
                            {["or"] = ct.recompenses["or"], xp = ct.recompenses.xp, points_guilde = ct.recompenses.points_guilde, objet = ct.recompenses.objets},
                            {h.id},
                            msgs
                        )
                        __TS__ArrayPush(
                            etat.dernieresNouvelles,
                            ((((((((("Contrat réussi (" .. ct.test.carac) .. " : ") .. tostring(jet)) .. " + ") .. tostring(total - jet)) .. " = ") .. tostring(total)) .. " ≥ ") .. tostring(ct.test.difficulte)) .. ").",
                            table.unpack(msgs)
                        )
                        journal(contenu, etat, ((h.nom .. " remplit le contrat « ") .. ct.titre) .. " ».")
                    else
                        appliquerConsequence(
                            contenu,
                            etat,
                            {xp = math.floor(ct.recompenses.xp / 3 + 0.5)},
                            {h.id},
                            msgs
                        )
                        __TS__ArrayPush(
                            etat.dernieresNouvelles,
                            ((((("Contrat raté (" .. ct.test.carac) .. " : ") .. tostring(total)) .. " < ") .. tostring(ct.test.difficulte)) .. "). Vous en tirez quand même une leçon.",
                            table.unpack(msgs)
                        )
                    end
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "meneur"
        if ____cond247 then
            if not etat.joueurs[action.nouveau] then
                refuser("Joueur inconnu")
            end
            etat.meneur = action.nouveau
            break
        end
        ____cond247 = ____cond247 or ____switch247 == "nouvelle_session"
        if ____cond247 then
            do
                etat.session = etat.session + 1
                local idx = __TS__ArrayIndexOf(etat.ordreJoueurs, etat.meneur or "")
                etat.meneur = etat.ordreJoueurs[(idx + 1) % #etat.ordreJoueurs + 1] or nil
                local ____journal_86 = journal
                local ____contenu_85 = contenu
                local ____etat_session_84 = etat.session
                local ____opt_82 = etat.joueurs[etat.meneur or ""]
                ____journal_86(
                    ____contenu_85,
                    etat,
                    ((("Session " .. tostring(____etat_session_84)) .. " : ") .. (____opt_82 and ____opt_82.pseudo or "?")) .. " est le meneur du jour."
                )
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "fusionner"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local id = idFusion(action.parent, action.secondaire)
                local t = etat.grimoire[id]
                if not t then
                    local r = creerTechnique(contenu, action.parent, action.secondaire, h.nom)
                    if not r.ok then
                        refuser(r.raison)
                    end
                    t = r.technique
                end
                local connue = __TS__ArrayIncludes(h.variantes[t.parent] or ({}), t.id)
                if not connue then
                    local pb = peutApprendre(contenu, h, t)
                    if vrai(pb) then
                        refuser(pb)
                    end
                end
                local entree = (if vrai(action.cle) then etat.combats[action.cle] else nil)
                local ____opt_87 = entree
                local acteur = ____opt_87 and __TS__ArrayFind(
                    entree and entree.combat.combattants,
                    function(____, c) return c.herosId == h.id and c.type == "heros" end
                )
                if vrai(action.cle) and (not entree or not acteur or entree.combat.enAttente ~= acteur.id) then
                    refuser("Ce n'est pas votre tour")
                end
                if not etat.grimoire[id] then
                    etat.grimoire[id] = t
                    journal(contenu, etat, ((h.nom .. " invente une technique : ") .. t.nom) .. ". Elle rejoint le grimoire de la partie.")
                end
                if not connue then
                    apprendre(h, t)
                else
                    h.varianteActive[t.parent] = t.id
                end
                if entree and acteur then
                    acteur.competences = __TS__ArrayFilter(
                        acteur.competences,
                        function(____, k) return k.id ~= t.parent end
                    )
                    if not __TS__ArraySome(
                        acteur.competencesPropres,
                        function(____, k) return k.id == t.id end
                    ) then
                        local ____acteur_competencesPropres_91 = acteur.competencesPropres
                        ____acteur_competencesPropres_91[#____acteur_competencesPropres_91 + 1] = __TS__ObjectAssign({}, t)
                    end
                    acteur.compteurs["rang:" .. t.id] = h.rangsCompetences[t.parent] or 1
                    do
                        local function ____catch(e)
                            refuser(e.message)
                        end
                        local ____try, ____hasReturned = pcall(function()
                            jouerAction(contenu, entree.combat, etat.rng, {type = "competence", acteur = acteur.id, competence = t.id, cible = action.cible})
                        end)
                        if not ____try then
                            ____catch(____hasReturned)
                        end
                    end
                    if entree.combat.resultat then
                        terminerCombat(contenu, etat, action.cle)
                    end
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "apprendre_technique"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local t = etat.grimoire[action.technique] or refuser("Technique absente du grimoire")
                local pb = peutApprendre(contenu, h, t)
                if vrai(pb) then
                    refuser(pb)
                end
                apprendre(h, t)
                journal(contenu, etat, ((h.nom .. " apprend la technique ") .. t.nom) .. ".")
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "oublier_variante"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local t = etat.grimoire[action.technique] or refuser("Technique inconnue")
                h.variantes[t.parent] = __TS__ArrayFilter(
                    h.variantes[t.parent] or ({}),
                    function(____, x) return x ~= t.id end
                )
                if h.varianteActive[t.parent] == t.id then
                    h.varianteActive[t.parent] = nil
                end
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "variante_active"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if vrai(action.technique) and not __TS__ArrayIncludes(h.variantes[action.competence] or ({}), action.technique) then
                    refuser("Variante non apprise")
                end
                h.varianteActive[action.competence] = action.technique
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "equiper_competences"
        if ____cond247 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local max = contenu.config.personnage.competences_equipees_max
                if #action.competences > max then
                    refuser(tostring(max) .. " compétences équipées au maximum")
                end
                local connues = competencesConnues(contenu, h)
                if __TS__ArraySome(
                    action.competences,
                    function(____, c) return not __TS__ArrayIncludes(connues, c) end
                ) then
                    refuser("Compétence non connue")
                end
                h.equipees = {__TS__Spread(__TS__New(Set, action.competences))}
                break
            end
        end
        ____cond247 = ____cond247 or ____switch247 == "chapitre_suivant"
        if ____cond247 then
            if not vrai(etat.finChapitre) then
                refuser("Le chapitre n'est pas terminé")
            end
            etat.finChapitre = nil
            break
        end
    until true
    etat.numeroAction = etat.numeroAction + 1
    return etat
end
--- Rejoue une liste d'actions ; les actions invalides sont ignorées (et signalées).
function ____exports.rejouer(contenu, depart, actions)
    local etat = depart
    local erreurs = {}
    __TS__ArrayForEach(
        actions,
        function(____, a, i)
            do
                local function ____catch(e)
                    if __TS__InstanceOf(e, ____exports.ErreurAction) then
                        erreurs[#erreurs + 1] = {index = i, message = e.message}
                    else
                        error(e, 0)
                    end
                end
                local ____try, ____hasReturned = pcall(function()
                    etat = ____exports.appliquer(contenu, etat, a)
                end)
                if not ____try then
                    ____catch(____hasReturned)
                end
            end
        end
    )
    return {etat = etat, erreurs = erreurs}
end
function ____exports.moisRestants(contenu, etat)
    return (if etat.tempsLibre then etat.tempsLibre.mois else 0)
end
____exports.formaterDate = formaterDate
____exports.versDate = versDate
return ____exports
 end,
["src.moteur.guide"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local ____exports = {}
local ____partie = require("src.moteur.partie")
local conditionHeros = ____partie.conditionHeros
local scenesDisponibles = ____partie.scenesDisponibles
local sceneEstDisponible = ____partie.sceneEstDisponible
local ____outils = require("src.moteur.outils")
local entrees = ____outils.entrees
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
--- Vrai si un des nœuds de la scène lance un combat ou un donjon.
function ____exports.sceneAvecCombat(s)
    return __TS__ArraySome(
        valeurs(s.noeuds),
        function(____, n) return not not n.combat or not not n.donjon end
    )
end
--- Vrai si le lieu propose un combat au héros : scène de combat disponible, ou contrats à la Guilde.
function ____exports.lieuAvecCombat(contenu, etat, lieu, herosId)
    if __TS__ArraySome(
        scenesDisponibles(contenu, etat, lieu, herosId),
        function(____, s) return ____exports.sceneAvecCombat(s) end
    ) then
        return true
    end
    if lieu == "guilde" and vrai(herosId) then
        local h = etat.heros[herosId]
        return not not h and __TS__ArraySome(
            valeurs(contenu.contrats),
            function(____, ct) return conditionHeros(contenu, etat, ct.disponible_si, h) end
        )
    end
    return false
end
local function nomDuLieu(contenu, lieu)
    if not vrai(lieu) then
        return nil
    end
    for ____, r in ipairs(valeurs(contenu.regions)) do
        local l = __TS__ArrayFind(
            r.lieux,
            function(____, x) return x.id == lieu end
        )
        if l then
            return l.nom
        end
    end
    return lieu
end
--- Étape en cours de la quête principale ; avant son début, la première scène principale disponible.
function ____exports.prochaineEtape(contenu, etat, herosId)
    for ____, ____value in ipairs(entrees(etat.quetes)) do
        local id = ____value[1]
        local q = ____value[2]
        local def = contenu.quetes[id]
        if not def or def.type ~= "principale" or q.terminee then
            continue
        end
        local e = __TS__ArrayFind(
            def.etapes,
            function(____, x) return x.id == q.etape end
        )
        if not e then
            continue
        end
        local scene = (if vrai(e.scene) then contenu.scenes[e.scene] else nil)
        local lieu = e.lieu or scene and scene.lieu or nil
        return {
            objectif = e.objectif,
            lieu = lieu,
            nomLieu = nomDuLieu(contenu, lieu),
            disponible = not not scene and sceneEstDisponible(contenu, etat, scene, herosId)
        }
    end
    local debut = __TS__ArrayFind(
        valeurs(contenu.scenes),
        function(____, s)
            local ____vrai_result_4 = vrai(s.quete)
            if ____vrai_result_4 then
                local ____opt_2 = contenu.quetes[s.quete]
                ____vrai_result_4 = (____opt_2 and ____opt_2.type) == "principale"
            end
            return ____vrai_result_4 and sceneEstDisponible(contenu, etat, s, herosId)
        end
    )
    if not debut then
        return nil
    end
    local def = contenu.quetes[debut.quete]
    local e = __TS__ArrayFind(
        def.etapes,
        function(____, x) return x.scene == debut.id end
    )
    local lieu = debut.lieu or nil
    return {
        objectif = e and e.objectif or debut.titre,
        lieu = lieu,
        nomLieu = nomDuLieu(contenu, lieu),
        disponible = true
    }
end
return ____exports
 end,
["src.sauvegarde.migrations"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__New = ____lualib.__TS__New
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__Delete = ____lualib.__TS__Delete
local ____exports = {}
local ____partie = require("src.moteur.partie")
local VERSION_ETAT = ____partie.VERSION_ETAT
local ____outils = require("src.moteur.outils")
local copieProfonde = ____outils.copieProfonde
function ____exports.migrer(s)
    local res = s
    while res.version < VERSION_ETAT do
        local m = ____exports.migrations[res.version]
        if not m then
            error(
                __TS__New(
                    ____exports.ErreurSauvegarde,
                    ((("Aucune migration pour passer du format " .. tostring(res.version)) .. " au format ") .. tostring(res.version + 1)) .. "."
                ),
                0
            )
        end
        res = m(copieProfonde(res))
    end
    if res ~= s then
        __TS__Delete(res, "instantane")
    end
    return res
end
____exports.FORMAT = "velmaris-sauvegarde"
--- migrations[n] transforme une sauvegarde de version n en version n+1.
____exports.migrations = {[1] = function(s)
    local ____s_depart_0, ____grimoire_1 = s.depart, "grimoire"
    if ____s_depart_0[____grimoire_1] == nil then
        ____s_depart_0[____grimoire_1] = {}
    end
    s.version = 2
    return s
end}
____exports.ErreurSauvegarde = __TS__Class()
local ErreurSauvegarde = ____exports.ErreurSauvegarde
ErreurSauvegarde.name = "ErreurSauvegarde"
__TS__ClassExtends(ErreurSauvegarde, Error)
function ErreurSauvegarde.prototype.____constructor(self, message)
    Error.prototype.____constructor(self, message)
    self.name = "ErreurSauvegarde"
end
function ____exports.creerSauvegarde(depart, actions, date, instantane)
    return {
        format = ____exports.FORMAT,
        version = VERSION_ETAT,
        exporteeLe = date,
        depart = depart,
        actions = actions,
        instantane = instantane
    }
end
--- Vérifie une sauvegarde déjà décodée (objet), puis la met au format courant.
function ____exports.verifierSauvegarde(brut)
    local s = brut
    if s == nil or type(s) ~= "table" or s.format ~= ____exports.FORMAT then
        error(
            __TS__New(____exports.ErreurSauvegarde, "Ce fichier n'est pas une sauvegarde des Appelés de Velmaris."),
            0
        )
    end
    if type(s.version) ~= "number" or s.depart == nil or not __TS__ArrayIsArray(s.actions) then
        error(
            __TS__New(____exports.ErreurSauvegarde, "Sauvegarde incomplète ou abîmée."),
            0
        )
    end
    if s.version > VERSION_ETAT then
        error(
            __TS__New(
                ____exports.ErreurSauvegarde,
                ("Cette sauvegarde vient d'une version plus récente du jeu (format " .. tostring(s.version)) .. "). Mettez le jeu à jour."
            ),
            0
        )
    end
    return ____exports.migrer(s)
end
return ____exports
 end,
["src.moteur.roblox"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
do
    local ____export = require("src.moteur.partie")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.combat")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.guide")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.fusions")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.temps")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.personnage")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.affinite")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.rng")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____export = require("src.moteur.outils")
    for ____exportKey, ____exportValue in pairs(____export) do
        if ____exportKey ~= "default" then
            ____exports[____exportKey] = ____exportValue
        end
    end
end
do
    local ____migrations = require("src.sauvegarde.migrations")
    ____exports.creerSauvegarde = ____migrations.creerSauvegarde
    ____exports.verifierSauvegarde = ____migrations.verifierSauvegarde
    ____exports.ErreurSauvegarde = ____migrations.ErreurSauvegarde
    ____exports.FORMAT = ____migrations.FORMAT
end
return ____exports
 end,
}
local ____entry = require("src.moteur.roblox", ...)
return ____entry
