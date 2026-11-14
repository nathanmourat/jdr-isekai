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
        description = z:string(),
        competence = z:string():optional()
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
    attaques = z:array(z:object({
        nom = z:string(),
        phrase = z:string(),
        element = ____exports.zElement:optional(),
        effet = z:string():optional()
    })):default({}),
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
____exports.RARETES = {
    "commun",
    "peu-commun",
    "rare",
    "epique",
    "legendaire",
    "mythique"
}
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
    }):optional(),
    rarete = z:enum(____exports.RARETES):optional(),
    palier = z:string():optional(),
    niveau = z:number():int():optional(),
    categorie = z:string():optional(),
    classes = z:array(z:string()):optional(),
    effets_equipement = z:array(z:object({
        effet = z:enum({
            "critique",
            "precision",
            "resistance",
            "touche",
            "mana",
            "vigueur"
        }),
        valeur = z:number():optional(),
        puissance = z:number():optional(),
        element = ____exports.zElement:optional()
    })):default({}),
    pouvoir_unique = z:string():optional(),
    unique_par_partie = z:boolean():default(false),
    utilite = z:string():optional(),
    mystere = z:boolean():default(false)
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
    groupe_min = z:number():optional(),
    groupe_max = z:number():optional(),
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
    soigner_groupe = z:boolean():optional(),
    reveler_gout = z:record(
        z:string(),
        z:string()
    ):optional(),
    miser = z:number():int():min(1):optional(),
    debloquer_ultime = z:boolean():optional(),
    gain_pari = z:number():min(0):optional(),
    perte_pari = z:boolean():optional()
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
--- Un personnage s'adresse à UN joueur précis, par son pseudo. Seul ce joueur répond, parmi 3 réponses au plus.
--  - `regle` : quel héros est interrogé (ex. { classe: arcaniste }) ; si plusieurs conviennent, ou aucun, tirage à graine ;
--  - `question` : dans le texte, {pseudo} = pseudo du joueur, {nom} = nom de son héros ;
--  - `reponses` : celles dont le `si` correspond au héros passent d'abord, puis celles sans `si`.
____exports.zParoleA = z:object({
    regle = ____exports.zCondition:optional(),
    question = ____exports.zReplique,
    reponses = z:array(z:object({
        texte = z:string(),
        si = ____exports.zCondition:optional(),
        effets = z:array(____exports.zConsequence):default({}),
        aller = z:string()
    })):min(1)
})
____exports.zNoeud = z:object({
    decor = z:string():optional(),
    parole_a = ____exports.zParoleA:optional(),
    pari = z:object({
        mise = z:number():int():min(1),
        gain = z:number():min(1):default(2),
        flag = z:string():optional(),
        aller = z:string(),
        personne = z:string()
    }):optional(),
    repliques = z:array(____exports.zReplique):default({}),
    effets = z:array(____exports.zConsequence):default({}),
    choix = z:array(____exports.zChoix):default({}),
    suite = z:string():optional(),
    aiguillage = z:array(z:object({
        si = ____exports.zCondition,
        aller = z:string()
    })):default({}),
    combat = z:object({
        rencontre = z:string(),
        victoire = z:string(),
        defaite = z:string()
    }):optional(),
    donjon = z:object({
        id = z:string(),
        sortie = z:string(),
        abandon = z:string():optional()
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
    romance = z:boolean():default(false),
    quete = z:string():optional(),
    pnj = z:string():optional(),
    rend_quete = z:boolean():default(false),
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
    niveau = z:number({error = "niveau conseillé obligatoire (champ « niveau »)"}):int():min(1),
    region = z:string():default("aubeclaire"),
    resume = z:string(),
    etapes = z:array(z:object({
        id = z:string(),
        objectif = z:string(),
        scene = z:string():optional(),
        lieu = z:string():optional(),
        niveau = z:number():int():min(1):optional(),
        declencheur = z:object({
            acheter = z:string():optional(),
            vendre = z:boolean():optional()
        }):optional()
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
    ville = z:string():optional(),
    position_plan = z:object({
        x = z:number(),
        y = z:number()
    }):optional(),
    disponible_si = ____exports.zCondition:optional(),
    pnj = z:array(z:object({
        id = z:string(),
        si = ____exports.zCondition:optional(),
        position = z:object({
            x = z:number(),
            y = z:number()
        }):optional()
    })):default({}),
    boutique = z:array(z:string()):default({}),
    gerant = z:string():optional(),
    etape_seulement = z:boolean():default(false),
    auberge = z:boolean():default(false)
})
____exports.zVille = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string():default(""),
    plan = z:string(),
    position = z:object({
        x = z:number(),
        y = z:number()
    })
})
____exports.zRegion = z:object({
    id = z:string(),
    nom = z:string(),
    description = z:string():default(""),
    carte = z:string(),
    chapitre = z:number():int():default(1),
    position_monde = z:object({
        x = z:number(),
        y = z:number()
    }):optional(),
    disponible_si = ____exports.zCondition:optional(),
    villes = z:array(____exports.zVille):default({}),
    lieux = z:array(____exports.zLieu)
})
____exports.zPnj = z:object({
    id = z:string(),
    nom = z:string(),
    titre = z:string():default(""),
    description = z:string():default(""),
    accueil = z:string():optional(),
    identifie = z:number():int():min(0):optional()
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
--- Phrase d'ambiance dite par un passant (version Roblox : bulles au-dessus des têtes).
____exports.zAmbiance = z:object({
    id = z:string(),
    lieu = z:string():optional(),
    moment = z:enum({"jour", "nuit", "toujours"}):default("toujours"),
    qui = z:enum({
        "villageois",
        "garde",
        "marchand",
        "client",
        "pretre"
    }):default("villageois"),
    texte = z:string(),
    si = ____exports.zCondition:optional()
})
--- Étape d'un contrat, jouée sur la carte : on se rend au `lieu`, on lit le `texte`, puis
--  - `choix` : un petit choix (chaque réponse a son `resultat` et ses `effets`) ;
--  - `test` : un jet de caractéristique (raté : le contrat échoue, avec le texte `echec`) ;
--  - `combat` : une rencontre à gagner pour passer à la suite ;
--  - rien : on continue simplement. La dernière étape se joue à la Guilde et donne la récompense.
____exports.zEtapeContrat = z:object({
    lieu = z:string(),
    objectif = z:string(),
    texte = z:string(),
    bouton = z:string():optional(),
    choix = z:array(z:object({
        texte = z:string(),
        resultat = z:string():default(""),
        effets = z:array(____exports.zConsequence):default({})
    })):default({}),
    test = z:object({
        carac = ____exports.zCarac,
        difficulte = z:number(),
        reussite = z:string():default(""),
        echec = z:string():default("")
    }):optional(),
    combat = z:string():optional()
})
____exports.zContrat = z:object({
    id = z:string(),
    titre = z:string(),
    description = z:string(),
    rang_min = z:string():default("F"),
    niveau = z:number({error = "niveau conseillé obligatoire (champ « niveau »)"}):int():min(1),
    etapes = z:array(____exports.zEtapeContrat):default({}),
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
        soigne_blessure = z:boolean():default(false),
        maitrise = z:number():default(0),
        reputation = z:record(
            z:string(),
            z:number()
        ):default({})
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
    romance = z:boolean():default(true),
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
        duree_reference_mois = z:number(),
        durees_auberge_mois = z:array(z:number():int():min(1)):default({1, 3, 6})
    }),
    jours_temps_reel = z:object({
        minutes_par_jour = z:number():default(10),
        inactivite_minutes = z:number():default(10)
    }):default({minutes_par_jour = 10, inactivite_minutes = 10}),
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
        potions_depart = z:number():int(),
        toucher_bonus_attaque_base = z:number():default(0),
        toucher_malus_par_mana = z:number():default(0),
        toucher_malus_max = z:number():default(0),
        toucher_mana_gratuit = z:number():default(0),
        toucher_par_niveau = z:number():default(0)
    }),
    maitrise = z:object({
        seuils = z:array(z:number()):default({
            5,
            15,
            30,
            50,
            80
        }),
        degats_par_rang = z:number():default(0.02),
        toucher_par_rang = z:number():default(0.01)
    }):default({seuils = {
        5,
        15,
        30,
        50,
        80
    }, degats_par_rang = 0.02, toucher_par_rang = 0.01}),
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
--- Fusions que ce héros pourrait apprendre à la Guilde : toutes les combinaisons de SES compétences
-- (sa classe, sa branche) que les règles de fusion autorisent. `probleme` dit ce qui manque encore (rang…), ou null.
function ____exports.fusionsPossibles(contenu, h)
    local connues = competencesConnues(contenu, h)
    local res = {}
    for ____, a in ipairs(connues) do
        for ____, b in ipairs(connues) do
            if a == b then
                continue
            end
            local r = ____exports.creerTechnique(contenu, a, b, h.nom)
            if not r.ok then
                continue
            end
            if __TS__ArrayIncludes(h.variantes[a] or ({}), r.technique.id) then
                continue
            end
            res[#res + 1] = {
                technique = r.technique,
                probleme = ____exports.peutApprendre(contenu, h, r.technique)
            }
        end
    end
    return res
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
    local s = contenu.config.saisons[1]
    if h.ultime == true and vrai(cl.ultime.competence) and h.niveau >= s.niveau_ultime then
        res[#res + 1] = cl.ultime.competence
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
        inventaire = {["potion-soin-petite"] = contenu.config.combat.potions_depart, ration = 3},
        ["or"] = 50,
        blessure = false,
        atout = nil,
        origineEnfance = nil,
        contacts = {},
        portrait = nil,
        siAbsent = "ia",
        variantes = {},
        varianteActive = {},
        equipees = nil,
        grimoire = {},
        maitrise = {}
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
--- Rang de maîtrise (0 à 5) pour un nombre de points.
function ____exports.rangMaitrise(contenu, points)
    local rang = 0
    for ____, s in ipairs(contenu.config.maitrise.seuils) do
        if points >= s then
            rang = rang + 1
        end
    end
    return rang
end
--- Ajoute des points de maîtrise à une compétence (plafonnés au dernier seuil).
function ____exports.gagnerMaitrise(contenu, h, competence, points)
    local seuils = contenu.config.maitrise.seuils
    local max = (if #seuils > 0 then seuils[#seuils] else 0)
    h.maitrise[competence] = math.min(max, (h.maitrise[competence] or 0) + points)
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
["src.moteur.equipement"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local ____exports = {}
local ____outils = require("src.moteur.outils")
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
--- Pouvoirs uniques codés (id de l'objet → description courte, pour les tests et l'interface).
____exports.POUVOIRS = {
    velgraive = "Commence chaque combat avec 1 charge de rune.",
    ysgarde = "Les sorts de zone coûtent 15 % de mana en moins.",
    nyxaliel = "Les invocations commencent le combat avec 20 % de PV en plus.",
    murmure = "La première attaque du combat est toujours un coup critique.",
    solenne = "Le héros subit 10 % de dégâts en moins.",
    prisme = "Les objets de soin et les bombes sont 25 % plus efficaces.",
    kestrevane = "L'attaque touche toujours, même un ennemi caché.",
    lumenae = "Les soins du héros rendent 15 % de PV en plus.",
    drakhaar = "Sang de dragon donne son plein effet dès 50 % de PV.",
    melisande = "Refrain dure 1 tour de plus.",
    ["aube-premiere"] = "Une fois par combat, relève un allié K.O. avec 30 % de ses PV.",
    ["brise-monde"] = "Chaque ennemi vaincu par le porteur lui rend 10 % de ses PV max.",
    ["nuit-premiere"] = "Les coups critiques infligent × 2 au lieu de × 1,5.",
    lointain = "25 % de chances de tirer une seconde flèche sur un autre ennemi.",
    ["il-du-voile"] = "Les tirs ignorent 30 % de la défense et des résistances de la cible.",
    ylvarae = "Les compétences coûtent 20 % de mana en moins."
}
--- Couleurs des raretés (gris, vert, bleu, violet, or, rouge), pour les interfaces.
____exports.COULEURS_RARETE = {
    commun = "#b8b8b8",
    ["peu-commun"] = "#5fc95f",
    rare = "#4a9bff",
    epique = "#b26bff",
    legendaire = "#f2b53a",
    mythique = "#ff4a4a"
}
____exports.NOMS_RARETE = {
    commun = "Commun",
    ["peu-commun"] = "Peu commun",
    rare = "Rare",
    epique = "Épique",
    legendaire = "Légendaire",
    mythique = "Mythique"
}
function ____exports.bonusVide()
    return {
        critique = 0,
        precision = 0,
        mana = 0,
        vigueur = 0,
        resistances = {},
        touches = {},
        pouvoirs = {}
    }
end
--- Additionne les effets de l'équipement porté par un héros.
function ____exports.bonusEquipement(contenu, h)
    local b = ____exports.bonusVide()
    for ____, slot in ipairs(valeurs(h.equipement)) do
        if not vrai(slot) then
            continue
        end
        local o = contenu.objets[slot]
        if o == nil then
            continue
        end
        for ____, e in ipairs(o.effets_equipement or ({})) do
            local v = e.valeur or 0
            if e.effet == "critique" then
                b.critique = b.critique + v
            elseif e.effet == "precision" then
                b.precision = b.precision + v
            elseif e.effet == "mana" then
                b.mana = b.mana + v
            elseif e.effet == "vigueur" then
                b.vigueur = b.vigueur + v
            elseif e.effet == "resistance" and e.element ~= nil then
                local el = e.element
                b.resistances[el] = (b.resistances[el] or 0) + v
            elseif e.effet == "touche" and e.element ~= nil then
                local ____b_touches_0 = b.touches
                ____b_touches_0[#____b_touches_0 + 1] = {element = e.element, puissance = e.puissance or 0}
            end
        end
        if vrai(o.pouvoir_unique) and ____exports.POUVOIRS[o.id] ~= nil then
            local ____b_pouvoirs_1 = b.pouvoirs
            ____b_pouvoirs_1[#____b_pouvoirs_1 + 1] = o.id
        end
    end
    return b
end
--- Raison pour laquelle le héros ne peut pas équiper l'objet (undefined : il peut).
function ____exports.problemeEquipement(contenu, h, o)
    if o.type ~= "equipement" or o.emplacement == nil then
        return "Cet objet ne s'équipe pas"
    end
    if o.niveau ~= nil and h.niveau < o.niveau then
        return ("Niveau " .. tostring(o.niveau)) .. " requis"
    end
    if o.classes ~= nil and #o.classes > 0 and not __TS__ArrayIncludes(o.classes, h.classe) then
        return "Réservé à : " .. table.concat(
            __TS__ArrayMap(
                o.classes,
                function(____, c)
                    local ____opt_2 = contenu.classes[c]
                    return ____opt_2 and ____opt_2.nom or c
                end
            ),
            ", "
        )
    end
    return nil
end
--- Nombre d'exemplaires d'un objet dans la partie (inventaires et équipement de tous les héros).
function ____exports.exemplaires(heros, objet)
    local n = 0
    for ____, h in ipairs(heros) do
        n = n + (h.inventaire[objet] or 0)
        for ____, slot in ipairs(valeurs(h.equipement)) do
            if slot == objet then
                n = n + 1
            end
        end
    end
    return n
end
--- Description des effets d'un objet, en français (fiche, boutique, Roblox).
function ____exports.texteEffets(o)
    local res = {}
    local function pct(v)
        return tostring(math.floor(v * 100 + 0.5)) .. " %"
    end
    local b = o.bonus
    if b ~= nil then
        if b.puissance ~= 0 then
            res[#res + 1] = ("+" .. tostring(b.puissance)) .. " puissance"
        end
        if b.armure ~= 0 then
            res[#res + 1] = ("+" .. tostring(b.armure)) .. " armure"
        end
        for ____, ____value in ipairs({
            {"FOR", b.caracs.FOR},
            {"AGI", b.caracs.AGI},
            {"INT", b.caracs.INT},
            {"VIT", b.caracs.VIT},
            {"ESP", b.caracs.ESP},
            {"CHA", b.caracs.CHA}
        }) do
            local k = ____value[1]
            local v = ____value[2]
            if v ~= nil and v ~= 0 then
                res[#res + 1] = (((if v > 0 then "+" else "") .. tostring(v)) .. " ") .. k
            end
        end
    end
    for ____, e in ipairs(o.effets_equipement or ({})) do
        local v = e.valeur or 0
        if e.effet == "critique" then
            res[#res + 1] = ("+" .. pct(v)) .. " critique"
        elseif e.effet == "precision" then
            res[#res + 1] = ("+" .. pct(v)) .. " précision"
        elseif e.effet == "mana" then
            res[#res + 1] = ("+" .. tostring(v)) .. " mana max"
        elseif e.effet == "vigueur" then
            res[#res + 1] = ("+" .. pct(v)) .. " PV max"
        elseif e.effet == "resistance" then
            res[#res + 1] = (("résistance " .. (e.element or "")) .. " ") .. pct(v)
        elseif e.effet == "touche" then
            res[#res + 1] = ((("touche de " .. (e.element or "")) .. " (+") .. tostring(e.puissance or 0)) .. ")"
        end
    end
    return res
end
return ____exports
 end,
["src.moteur.combat"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
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
local __TS__StringSlice = ____lualib.__TS__StringSlice
local __TS__StringReplaceAll = ____lualib.__TS__StringReplaceAll
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local Map = ____lualib.Map
local __TS__ArrayEvery = ____lualib.__TS__ArrayEvery
local ____exports = {}
local sansParticularite, sacDeCombat, log, aEtat, valeurEtat, ajouterEtat, toutesCompetences, multiplicateurDegatsSource, reductionCible, chanceToucher, chanceCritique, infliger, mettreKo, soigner, invoquer, resoudreCibles, appliquerEffets, attaqueSimple, calculerOrdre, verifierFin, debutTour, finTour, debutRound, verifierAction, pacifiable, executer, conditionIA, dejaActif, choisirCibleEnnemie, ETATS_NEGATIFS, ETATS_CONTROLE, actif, ELEMENTS_MAGIQUES
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
local ____equipement = require("src.moteur.equipement")
local bonusEquipement = ____equipement.bonusEquipement
local ____personnage = require("src.moteur.personnage")
local caracsTotales = ____personnage.caracsTotales
local competencesEquipees = ____personnage.competencesEquipees
local manaMax = ____personnage.manaMax
local pvMax = ____personnage.pvMax
local rangMaitrise = ____personnage.rangMaitrise
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
function sacDeCombat(contenu, h)
    local res = {}
    for ____, ____value in ipairs(entrees(h.inventaire)) do
        local id = ____value[1]
        local n = ____value[2]
        local o = contenu.objets[id]
        if not o or n <= 0 or id == "potion-soin-petite" or o.type ~= "consommable" or #o.effets == 0 then
            continue
        end
        res["sac:" .. id] = n
    end
    return res
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
            race = nil,
            attaques = def.attaques or ({}),
            phrase = nil,
            effetAttaque = nil
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
--- Le combattant porte-t-il l'objet qui donne ce pouvoir unique ?
function ____exports.aPouvoir(x, objet)
    return x.objets ~= nil and __TS__ArrayIncludes(x.objets.pouvoirs, objet)
end
--- Mana réellement payé pour une compétence (pouvoirs d'équipement qui réduisent le coût).
function ____exports.coutMana(x, comp)
    local c = comp.cout
    if ____exports.aPouvoir(x, "ylvarae") then
        c = c * 0.8
    end
    if ____exports.aPouvoir(x, "ysgarde") and (comp.cible == "tous_ennemis" or comp.cible == "tous_allies") then
        c = c * 0.85
    end
    return math.floor(c + 0.5)
end
function ____exports.competenceUtilisable(contenu, x, comp)
    if aEtat(x, "silence") then
        return false
    end
    if (x.recharges[comp.id] or 0) > 0 then
        return false
    end
    if x.mana < ____exports.coutMana(x, comp) then
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
    if s.camp == "ennemis" or s.type == "invocation" then
        m = m * (s.compteurs.multDegats or 1)
    end
    local combinee = __TS__ArrayFind(
        s.bonusCompagnon,
        function(____, b) return b.id == "attaque-combinee" end
    )
    if combinee ~= nil then
        m = m * (1 + (combinee.parametres.degats or 0.25))
    end
    local ____opt_23 = s.passif
    if (____opt_23 and ____opt_23.id) == "sang-de-dragon" then
        local manque = 1 - s.pv / s.pvMax
        local max = s.passif.parametres.max or 0.4
        m = m * (1 + (if ____exports.aPouvoir(s, "drakhaar") and s.pv / s.pvMax <= 0.5 then max else math.min(max, manque / 2)))
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
    if combat.tour > 30 then
        m = m * (1 + 0.1 * (combat.tour - 30))
    end
    return m
end
function reductionCible(combat, cible, element, source)
    local cfg = {def = 2, res = 2}
    local perce = (if source ~= nil and ____exports.aPouvoir(source, "il-du-voile") then 0.7 else 1)
    local m = 1
    if element == "physique" or element == "poison" then
        local defense = (cible.caracs.VIT * cfg.def + cible.armure) * perce
        m = m * (100 / (100 + defense))
    else
        local res = cible.caracs.ESP * cfg.res * perce
        m = m * (100 / (100 + res))
        m = m * (1 - cible.resistanceMagique * perce)
    end
    m = m * (1 - (cible.resistances[element] or 0) * perce)
    if ____exports.aPouvoir(cible, "solenne") then
        m = m * 0.9
    end
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
--- Compétence de base dont dépend la maîtrise (une fusion « fusion:a+b » suit la compétence a).
function ____exports.competenceDeBase(id)
    if not __TS__StringStartsWith(id, "fusion:") then
        return id
    end
    local i = (string.find(id, "+", nil, true) or 0) - 1
    return (if i < 0 then string.sub(id, 8) else __TS__StringSlice(id, 7, i))
end
--- Points de chance de toucher perdus par une compétence selon son coût en mana (les premiers points de mana sont gratuits).
function ____exports.malusPuissance(contenu, cout)
    local k = contenu.config.combat
    return math.min(
        k.toucher_malus_max,
        math.max(0, cout - k.toucher_mana_gratuit) * k.toucher_malus_par_mana
    )
end
--- Rang de maîtrise (0 à 5) du combattant pour cette compétence.
function ____exports.maitriseDe(x, competence)
    return x.compteurs["maitrise:" .. ____exports.competenceDeBase(competence)] or 0
end
function chanceToucher(contenu, s, cible, comp)
    local k = contenu.config.combat
    if aEtat(cible, "sommeil") or aEtat(cible, "immobilise") then
        return 1
    end
    if ____exports.aPouvoir(s, "kestrevane") then
        return 1
    end
    local p = k.toucher_base + k.toucher_par_agi * (s.caracs.AGI - cible.caracs.AGI)
    local ____opt_37 = s.objets
    p = p + (____opt_37 and ____opt_37.precision or 0)
    if comp and s.camp == "heros" then
        if comp.id == "attaque" or comp.id == "attaque-visee" then
            p = p + k.toucher_bonus_attaque_base
        else
            p = p - ____exports.malusPuissance(contenu, comp.cout)
        end
        p = p + contenu.config.maitrise.toucher_par_rang * ____exports.maitriseDe(s, comp.id)
    end
    p = p + k.toucher_par_niveau * math.max(
        -10,
        math.min(10, s.niveau - cible.niveau)
    )
    p = p + valeurEtat(s, "bonus_precision")
    p = p + (s.compteurs.modToucher or 0)
    local ____opt_39 = s.trait
    if (____opt_39 and ____opt_39.id) == "entre-deux-mondes" then
        p = p + (s.trait.parametres.precision or 0)
    end
    local ____opt_41 = cible.trait
    if (____opt_41 and ____opt_41.id) == "ruse" then
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
    local ____opt_43 = s.objets
    p = p + (____opt_43 and ____opt_43.critique or 0)
    local ____opt_45 = s.passif
    if (____opt_45 and ____opt_45.id) == "dans-le-dos" then
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
            local ____opt_47 = g.passif
            local rempart = (if (____opt_47 and ____opt_47.id) == "rempart" then g.passif.parametres else nil)
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
        math.floor(brut * reductionCible(combat, cible, element, s) + 0.5)
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
    local ____combat_frappesCeTour_49, ____cible_id_50 = combat.frappesCeTour, cible.id
    if ____combat_frappesCeTour_49[____cible_id_50] == nil then
        ____combat_frappesCeTour_49[____cible_id_50] = {}
    end
    local ____combat_frappesCeTour_cible_id_52 = combat.frappesCeTour[cible.id]
    ____combat_frappesCeTour_cible_id_52[#____combat_frappesCeTour_cible_id_52 + 1] = s.id
    cible.etats = __TS__ArrayFilter(
        cible.etats,
        function(____, e) return e.id ~= "sommeil" end
    )
    log(combat, {
        type = "degats",
        source = s.id,
        cible = cible.id,
        valeur = degats,
        critique = critique,
        element = element,
        competence = competence,
        effet = s.effetAttaque or nil,
        texte = (if s.phrase ~= nil then ((((((s.nom .. " ") .. __TS__StringReplaceAll(s.phrase, "{cible}", cible.nom)) .. " : ") .. tostring(degats)) .. " dégâts") .. (if critique then " (critique !)" else "")) .. "." else (((((((s.nom .. " inflige ") .. tostring(degats)) .. " dégâts") .. (if element ~= "physique" then (" (" .. element) .. ")" else "")) .. " à ") .. cible.nom) .. (if critique then " (critique !)" else "")) .. ".")
    })
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
        if cible.ko and cible.camp ~= s.camp and ____exports.aPouvoir(s, "brise-monde") and actif(s) then
            local v = math.min(
                s.pvMax - s.pv,
                math.floor(s.pvMax * 0.1 + 0.5)
            )
            if v > 0 then
                s.pv = s.pv + v
                log(
                    combat,
                    {
                        type = "soin",
                        source = s.id,
                        cible = s.id,
                        valeur = v,
                        texte = ((s.nom .. " récupère ") .. tostring(v)) .. " PV. (Brise-Monde)"
                    }
                )
            end
        end
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
    if x.type == "heros" or x.type == "compagnon" then
        local porteur = __TS__ArrayFind(
            combat.combattants,
            function(____, g) return g.id ~= x.id and g.camp == x.camp and actif(g) and (g.compteurs.aubePrete or 0) > 0 end
        )
        if porteur ~= nil then
            porteur.compteurs.aubePrete = 0
            x.ko = false
            x.pv = math.max(
                1,
                math.floor(x.pvMax * 0.3 + 0.5)
            )
            log(combat, {
                type = "soin",
                source = porteur.id,
                cible = x.id,
                valeur = x.pv,
                texte = ((porteur.nom .. " relève ") .. x.nom) .. " ! (Aube-Première)"
            })
            return
        end
    end
    if x.type == "invocation" then
        x.parti = x.dureeInvocation ~= nil
    end
    if x.refId == "loup-spectral" and vrai(x.maitreId) then
        local m = __TS__ArrayFind(
            combat.combattants,
            function(____, y) return y.id == x.maitreId end
        )
        if m then
            local ____m_compteurs_55 = m.compteurs
            local ____opt_53 = m.passif
            ____m_compteurs_55.retourFamilier = ____opt_53 and ____opt_53.parametres.retour or 3
        end
    end
end
function soigner(contenu, combat, s, cible, montant)
    if cible.ko then
        return
    end
    local m = montant
    local ____opt_56 = cible.trait
    if (____opt_56 and ____opt_56.id) == "sang-cendre" and s.id ~= cible.id and (s.refId == "guerisseur" or s.refId == "gardien") then
        m = m * (1 + (cible.trait.parametres.soins_sacres or 0))
    end
    if ____exports.aPouvoir(s, "lumenae") then
        m = m * 1.15
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
    local ____opt_58 = s.passif
    if (____opt_58 and ____opt_58.id) == "main-bienveillante" and m > reel then
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
    inv.pvMax = math.floor(inv.pvMax * f * (if ____exports.aPouvoir(maitre, "nyxaliel") then 1.2 else 1) + 0.5)
    inv.pv = inv.pvMax
    inv.compteurs = {multDegats = f * (maitre.facteurArme or 1)}
    inv.recompenses = nil
    inv.sprite = "invocations/" .. creature
    local ____combat_combattants_60 = combat.combattants
    ____combat_combattants_60[#____combat_combattants_60 + 1] = inv
    log(combat, {type = "invocation", source = maitre.id, cible = inv.id, texte = ((maitre.nom .. " invoque : ") .. inv.nom) .. " !"})
end
function resoudreCibles(combat, rng, s, ____type, cibleChoisie, portee)
    repeat
        local ____switch191 = ____type
        local ____cond191 = ____switch191 == "soi"
        if ____cond191 then
            return {s}
        end
        ____cond191 = ____cond191 or ____switch191 == "tous_allies"
        if ____cond191 then
            return ____exports.allies(combat, s)
        end
        ____cond191 = ____cond191 or ____switch191 == "tous_ennemis"
        if ____cond191 then
            return ____exports.adversaires(combat, s)
        end
        ____cond191 = ____cond191 or ____switch191 == "ennemi_aleatoire"
        if ____cond191 then
            return {}
        end
        ____cond191 = ____cond191 or ____switch191 == "allie_ko"
        if ____cond191 then
            return (if cibleChoisie then {cibleChoisie} else {})
        end
        ____cond191 = ____cond191 or ____switch191 == "allie"
        if ____cond191 then
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
    local facteurMaitrise = (if depuisObjet then 1 else 1 + contenu.config.maitrise.degats_par_rang * ____exports.maitriseDe(s, comp.id))
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
    local ____opt_61 = s.passif
    if (____opt_61 and ____opt_61.id) == "resonance" and #elementsComp > 0 then
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
    local ____opt_63 = s.passif
    if (____opt_63 and ____opt_63.id) == "runes-gravees" and not depuisObjet and #elementsComp > 0 then
        local charges = s.compteurs.runes or 0
        bonusRunes = 1 + charges * (s.passif.parametres.bonus_par_charge or 0.2)
        if charges > 0 then
            consommeRunes = true
        end
    end
    local ____depuisObjet_67 = depuisObjet
    if ____depuisObjet_67 then
        local ____opt_65 = s.passif
        ____depuisObjet_67 = (____opt_65 and ____opt_65.id) == "fioles-optimisees"
    end
    local multObjet = (if ____depuisObjet_67 then 1 + (s.passif.parametres.efficacite or 0.4) else 1)
    if depuisObjet and ____exports.aPouvoir(s, "prisme") then
        multObjet = multObjet * 1.25
    end
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
                        local pToucher = (if depuisObjet then 1 else chanceToucher(contenu, s, cible, comp))
                        local touche = depuisObjet or chance(rng, pToucher)
                        if not touche and (s.compteurs.relances or 0) > 0 then
                            local ____s_compteurs_68, ____relances_69 = s.compteurs, "relances"
                            ____s_compteurs_68[____relances_69] = ____s_compteurs_68[____relances_69] - 1
                            touche = chance(rng, pToucher)
                        end
                        if touche and (cible.compteurs.esquives or 0) > 0 and monoCible then
                            local ____cible_compteurs_70, ____esquives_71 = cible.compteurs, "esquives"
                            ____cible_compteurs_70[____esquives_71] = ____cible_compteurs_70[____esquives_71] - 1
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
                            log(combat, {
                                type = "rate",
                                source = s.id,
                                cible = cible.id,
                                chance = pToucher,
                                competence = comp.id,
                                texte = ((s.nom .. " rate ") .. cible.nom) .. "."
                            })
                            continue
                        end
                        local furtif = aEtat(s, "furtif")
                        local critique = ef.critique_garanti or furtif or chance(
                            rng,
                            chanceCritique(contenu, s, cible)
                        )
                        if (s.compteurs.premierCritique or 0) > 0 then
                            critique = true
                            s.compteurs.premierCritique = 0
                        end
                        if not critique and (s.compteurs.relancesCrit or 0) > 0 then
                            local ____s_compteurs_72, ____relancesCrit_73 = s.compteurs, "relancesCrit"
                            ____s_compteurs_72[____relancesCrit_73] = ____s_compteurs_72[____relancesCrit_73] - 1
                            critique = chance(
                                rng,
                                chanceCritique(contenu, s, cible)
                            )
                        end
                        local statVal = (if depuisObjet then 10 else s.caracs[ef.stat])
                        local variance = 1 + (aleatoire(rng) * 2 - 1) * contenu.config.combat.variance_degats
                        local brut = ef.puissance * facteurRang * facteurMaitrise * (1 + statVal / 20) * variance * multObjet
                        if comp.id ~= "attaque" and not depuisObjet then
                            brut = brut * (s.facteurArme or 1)
                        end
                        brut = brut * (multiplicateurDegatsSource(combat, s, cible, ef.element) * bonusResonance * bonusRunes)
                        if critique then
                            brut = brut * (if ____exports.aPouvoir(s, "nuit-premiere") then 2 else contenu.config.combat.multiplicateur_critique)
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
                        local avantEvt = #combat.evenements
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
                        do
                            local i = avantEvt
                            while i < #combat.evenements do
                                if combat.evenements[i + 1].type == "degats" and combat.evenements[i + 1].source == s.id then
                                    combat.evenements[i + 1].chance = pToucher
                                end
                                i = i + 1
                            end
                        end
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
                    ef.puissance * facteurRang * facteurMaitrise * (1 + statVal / 20) * multObjet * (if depuisObjet then 1 else s.facteurArme or 1)
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
                    local ____opt_74 = cible.trait
                    if (____opt_74 and ____opt_74.id) == "instinct-de-meute" then
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
                local ____temp_78 = ef.etat == "poison"
                if ____temp_78 then
                    local ____opt_76 = cible.trait
                    ____temp_78 = (____opt_76 and ____opt_76.id) == "sang-ancien"
                end
                if ____temp_78 then
                    duree = duree + (cible.trait.parametres.duree_poison_bonus or 1)
                end
                local ____temp_81 = ef.etat == "poison"
                if ____temp_81 then
                    local ____opt_79 = cible.trait
                    ____temp_81 = (____opt_79 and ____opt_79.id) == "robuste"
                end
                if ____temp_81 then
                    if chance(rng, cible.trait.parametres.resistance_poison or 0.5) then
                        log(combat, {type = "info", cible = cible.id, texte = cible.nom .. " résiste au poison."})
                        continue
                    end
                end
                local ____opt_82 = s.passif
                if (____opt_82 and ____opt_82.id) == "refrain" and typeCible == "tous_allies" then
                    duree = 99
                end
                local valeur = (if ef.etat == "poison" or ef.etat == "brulure" then ef.valeur * facteurRang * (1 + s.caracs[s.attaque.stat] / 40) else ef.valeur)
                local bonusRefrain = (if ____exports.aPouvoir(s, "melisande") and cible.camp == s.camp then 1 else 0)
                ajouterEtat(combat, cible, {
                    id = ef.etat,
                    duree = duree + (if cible.id == s.id then 1 else 0) + bonusRefrain,
                    valeur = valeur,
                    source = s.id,
                    cumul = 1
                }, ef.cumul_max)
                local pose = __TS__ArrayFind(
                    cible.etats,
                    function(____, e) return e.id == ef.etat end
                )
                local cumulTexte = (if pose and pose.cumul > 1 then " ×" .. tostring(pose.cumul) else "")
                log(combat, {
                    type = "etat",
                    source = s.id,
                    cible = cible.id,
                    etat = ef.etat,
                    texte = (if ef.etat == "poison" or ef.etat == "brulure" then (((((((cible.nom .. " : ") .. ____exports.NOMS_ETATS[ef.etat]) .. cumulTexte) .. " (") .. tostring(math.max(
                        1,
                        math.floor(valeur * (pose and pose.cumul or 1) + 0.5)
                    ))) .. " dégâts par tour pendant ") .. tostring(pose and pose.duree or duree)) .. " tours)." else ((cible.nom .. " : ") .. ____exports.NOMS_ETATS[ef.etat]) .. ".")
                })
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
            local ____s_compteurs_90 = s.compteurs
            local ____opt_88 = s.passif
            ____s_compteurs_90.runes = math.min(____opt_88 and ____opt_88.parametres.max or 3, (s.compteurs.runes or 0) + ef.nombre)
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
            local aRelever = (if ef.cible == "tous_allies" then __TS__ArrayFilter(
                combat.combattants,
                function(____, x) return x.camp == s.camp and x.ko and not x.parti end
            ) else resoudreCibles(
                combat,
                rng,
                s,
                "allie_ko",
                cibleChoisie,
                "distance"
            ))
            for ____, cible in ipairs(aRelever) do
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
    local nommee = (if #s.attaques > 0 then choisir(rng, s.attaques) else nil)
    local element = nommee and nommee.element or s.attaque.element
    local comp = {
        id = "attaque",
        nom = nommee and nommee.nom or "Attaque",
        description = "",
        cout = 0,
        recharge = 0,
        cible = "ennemi",
        portee = s.attaque.portee,
        effets = {{
            type = "degats",
            puissance = s.attaque.puissance,
            stat = s.attaque.stat,
            element = element,
            coups = 1,
            critique_garanti = false,
            cout_pv_pourcent = 0
        }},
        ia = {priorite = 1, quand = "toujours"}
    }
    local avantPv = cible and cible.pv or 0
    if nommee then
        s.phrase = nommee.phrase
        s.effetAttaque = nommee.effet or nil
    end
    appliquerEffets(
        contenu,
        combat,
        rng,
        s,
        comp,
        1,
        cible
    )
    s.phrase = nil
    s.effetAttaque = nil
    local c = (if vrai(s.derniereCible) then __TS__ArrayFind(
        combat.combattants,
        function(____, x) return x.id == s.derniereCible end
    ) else nil)
    if c and c.pv < avantPv and s.objets ~= nil then
        for ____, t in ipairs(s.objets.touches) do
            if not actif(c) then
                break
            end
            local brut = t.puissance * (1 + s.caracs[s.attaque.stat] / 20) * multiplicateurDegatsSource(combat, s, c, t.element)
            infliger(
                contenu,
                combat,
                rng,
                s,
                c,
                brut,
                t.element,
                false,
                true,
                "touche"
            )
        end
    end
    if ____exports.aPouvoir(s, "lointain") and chance(rng, 0.25) then
        local autres = __TS__ArrayFilter(
            ____exports.ciblesValides(combat, s, "ennemi", "distance"),
            function(____, y) return c == nil or c == nil or y.id ~= c.id end
        )
        if #autres > 0 then
            local autre = choisir(rng, autres)
            log(combat, {
                type = "action",
                source = s.id,
                cible = autre.id,
                competence = "attaque",
                texte = s.nom .. " tire une seconde flèche ! (Lointain)"
            })
            appliquerEffets(
                contenu,
                combat,
                rng,
                s,
                comp,
                1,
                autre
            )
        end
    end
    local ____opt_97 = s.passif
    if (____opt_97 and ____opt_97.id) == "runes-gravees" and c and c.pv < avantPv then
        s.compteurs.runes = math.min(s.passif.parametres.max or 3, (s.compteurs.runes or 0) + 1)
    end
    local ____opt_99 = s.passif
    if (____opt_99 and ____opt_99.id) == "oeil-du-faucon" and c and actif(c) and chance(rng, s.passif.parametres.chance_marque or 0.3) then
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
                    etat = e.id,
                    texte = (((((((((x.nom .. " : −") .. tostring(dg)) .. " PV (") .. string.lower(____exports.NOMS_ETATS[e.id])) .. (if e.cumul > 1 then " ×" .. tostring(e.cumul) else "")) .. ", encore ") .. tostring(e.duree)) .. " tour") .. (if e.duree > 1 then "s" else "")) .. ")."
                }
            )
            if x.pv <= 0 then
                mettreKo(combat, x)
                return false
            end
        end
    end
    local regen = valeurEtat(x, "regeneration")
    local ____opt_101 = x.don
    if (____opt_101 and ____opt_101.id) == "coeur-inepuisable" then
        regen = regen + (x.don.parametres.regeneration or 0.03)
    end
    local ____opt_103 = x.trait
    if (____opt_103 and ____opt_103.id) == "sang-cendre" and x.pv / x.pvMax < 0.5 then
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
            local ____x_recharges_105, ____k_106 = x.recharges, k
            ____x_recharges_105[____k_106] = ____x_recharges_105[____k_106] - 1
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
            local ____actif_result_111 = actif(y)
            if ____actif_result_111 then
                local ____opt_109 = y.passif
                ____actif_result_111 = (____opt_109 and ____opt_109.id) == "lien-d-ame"
            end
            return ____actif_result_111
        end
    )) do
        if (m.compteurs.retourFamilier or 0) > 0 then
            local ____m_compteurs_107, ____retourFamilier_108 = m.compteurs, "retourFamilier"
            ____m_compteurs_107[____retourFamilier_108] = ____m_compteurs_107[____retourFamilier_108] - 1
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
    if a.type == "objet" and vrai(a.item) then
        if not contenu.objets[a.item] or (x.compteurs["sac:" .. a.item] or 0) <= 0 then
            error(
                __TS__New(Error, "Vous n'avez plus cet objet"),
                0
            )
        end
    else
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
    end
    if a.type == "fuir" and not combat.fuitePossible then
        error(
            __TS__New(Error, "Impossible de fuir ce combat"),
            0
        )
    end
    if a.type == "pacifier" then
        local c = ____exports.trouver(combat, a.cible)
        local ____opt_112 = x.don
        if (____opt_112 and ____opt_112.id) ~= "langue-universelle" then
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
    local ____temp_116 = x.refId == "ombre"
    if not ____temp_116 then
        local ____opt_114 = x.don
        ____temp_116 = (____opt_114 and ____opt_114.id) == "pas-de-l-ombre"
    end
    if ____temp_116 then
        p = p + 0.2
    end
    return math.min(
        0.85,
        math.max(0.15, p)
    )
end
function pacifiable(x, c)
    local ____temp_120 = actif(c) and c.camp ~= x.camp and not c.boss and (c.categorie == "bete" or c.categorie == "demon")
    if ____temp_120 then
        local ____temp_119 = c.pv / c.pvMax
        local ____opt_117 = x.don
        ____temp_120 = ____temp_119 <= (____opt_117 and ____opt_117.parametres.seuil_pacifier or 0.3)
    end
    return ____temp_120
end
function executer(contenu, combat, rng, x, a)
    repeat
        local ____switch367 = a.type
        local ____cond367 = ____switch367 == "attaque"
        if ____cond367 then
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
        ____cond367 = ____cond367 or ____switch367 == "competence"
        if ____cond367 then
            do
                local k = ____exports.competenceCombattant(contenu, x, a.competence)
                x.mana = x.mana - ____exports.coutMana(x, k.comp)
                if x.type == "heros" then
                    local cu = "usage:" .. ____exports.competenceDeBase(k.comp.id)
                    x.compteurs[cu] = (x.compteurs[cu] or 0) + 1
                end
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
                            local ____opt_122 = y.don
                            return (____opt_122 and ____opt_122.id) == "mimetisme" and not vrai(y.compteurs.copie)
                        end
                    )) do
                        local ____m_competencesPropres_121 = m.competencesPropres
                        ____m_competencesPropres_121[#____m_competencesPropres_121 + 1] = __TS__ObjectAssign({}, k.comp, {id = "copie:" .. k.comp.id, nom = k.comp.nom .. " (copiée)", cout = 4, ia = {priorite = 2, quand = "toujours"}})
                        m.compteurs.copie = 1
                        log(combat, {type = "info", cible = m.id, texte = ((m.nom .. " copie la technique « ") .. k.comp.nom) .. " » ! (Mimétisme)"})
                    end
                end
                return false
            end
        end
        ____cond367 = ____cond367 or ____switch367 == "objet"
        if ____cond367 then
            do
                local cible = (if vrai(a.cible) then __TS__ArrayFind(
                    combat.combattants,
                    function(____, y) return y.id == a.cible end
                ) or x else x)
                local duSac = vrai(a.item)
                local objetId = (if duSac then a.item else (if a.objet == "potion" then "potion-soin-petite" else "bombe-feu"))
                local obj = contenu.objets[objetId]
                local ____opt_124 = x.passif
                local economise = (____opt_124 and ____opt_124.id) == "fioles-optimisees" and chance(rng, x.passif.parametres.economie or 0.25)
                if duSac then
                    if not economise then
                        x.compteurs["sac:" .. objetId] = (x.compteurs["sac:" .. objetId] or 0) - 1
                        x.compteurs["utilise:" .. objetId] = (x.compteurs["utilise:" .. objetId] or 0) + 1
                    end
                elseif a.objet == "potion" then
                    if not economise then
                        x.potions = x.potions - 1
                    end
                elseif not economise then
                    x.bombes = x.bombes - 1
                end
                if not duSac and a.objet == "potion" and not economise and (x.compteurs.potionsInventaire or 0) > 0 then
                    local ____x_compteurs_126, ____potionsInventaire_127 = x.compteurs, "potionsInventaire"
                    ____x_compteurs_126[____potionsInventaire_127] = ____x_compteurs_126[____potionsInventaire_127] - 1
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
        ____cond367 = ____cond367 or ____switch367 == "defendre"
        if ____cond367 then
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
        ____cond367 = ____cond367 or ____switch367 == "changer_rang"
        if ____cond367 then
            x.rang = (if x.rang == "avant" then "arriere" else "avant")
            log(combat, {type = "action", source = x.id, texte = ((x.nom .. " passe au rang ") .. (if x.rang == "avant" then "avant" else "arrière")) .. "."})
            return false
        end
        ____cond367 = ____cond367 or ____switch367 == "pacifier"
        if ____cond367 then
            do
                local c = ____exports.trouver(combat, a.cible)
                c.parti = true
                log(combat, {type = "fuite", source = x.id, cible = c.id, texte = ((x.nom .. " parle à ") .. c.nom) .. ", qui renonce au combat et s'éloigne. (Langue universelle)"})
                return false
            end
        end
        ____cond367 = ____cond367 or ____switch367 == "viser"
        if ____cond367 then
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
        ____cond367 = ____cond367 or ____switch367 == "se_cacher"
        if ____cond367 then
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
        ____cond367 = ____cond367 or ____switch367 == "fuir"
        if ____cond367 then
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
        local ____switch400 = q
        local ____cond400 = ____switch400 == "allie_blesse"
        if ____cond400 then
            return __TS__ArraySome(
                amis,
                function(____, a) return a.pv / a.pvMax < 0.6 and a.type ~= "invocation" end
            )
        end
        ____cond400 = ____cond400 or ____switch400 == "soi_blesse"
        if ____cond400 then
            return x.pv / x.pvMax < 0.5
        end
        ____cond400 = ____cond400 or ____switch400 == "plusieurs_ennemis"
        if ____cond400 then
            return #____exports.adversaires(combat, x) >= 2
        end
        ____cond400 = ____cond400 or ____switch400 == "debut_combat"
        if ____cond400 then
            return combat.tour <= 2
        end
        ____cond400 = ____cond400 or ____switch400 == "cible_faible"
        if ____cond400 then
            return __TS__ArraySome(
                ____exports.adversaires(combat, x),
                function(____, a) return a.pv / a.pvMax < 0.4 end
            )
        end
        ____cond400 = ____cond400 or ____switch400 == "allie_ko"
        if ____cond400 then
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
    local ____opt_128 = x.don
    if (____opt_128 and ____opt_128.id) == "langue-universelle" then
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
            local ____opt_132 = __TS__ArrayFind(
                combat.combattants,
                function(____, a) return a.camp == x.camp and a.ko and a.type ~= "invocation" end
            )
            cible = ____opt_132 and ____opt_132.id
        elseif meilleure.cible == "ennemi" then
            local ____opt_134 = choisirCibleEnnemie(combat, rng, x, meilleure.portee)
            cible = ____opt_134 and ____opt_134.id
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
    local be = bonusEquipement(contenu, h)
    local pmax = math.floor(pvMax(contenu, caracs.VIT, h.niveau) * (if h.blessure then 1 - contenu.config.mort_douce.blessure_pv_pourcent / 100 else 1) * (1 + be.vigueur) + 0.5)
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
    for ____, ____value in ipairs(entrees(be.resistances)) do
        local el = ____value[1]
        local v = ____value[2]
        res[el] = (res[el] or 0) + (v or 0)
    end
    local manaTotal = manaMax(caracs.ESP, h.niveau) + be.mana
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
        manaMax = manaTotal,
        mana = manaTotal,
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
            {},
            sacDeCombat(contenu, h),
            {
                potionsInventaire = potionsInventaire,
                bombes = don.parametres.objets_improvises or 0,
                esquives = don.parametres.esquives or 0,
                relances = don.parametres.relances or 0,
                determination = (if race.trait.id == "determination" then 1 else 0),
                objetGratuit = (if don.id == "reserve-du-neant" then 1 else 0),
                runes = (if __TS__ArrayIncludes(be.pouvoirs, "velgraive") and cl.passif.id == "runes-gravees" then 1 else 0),
                premierCritique = (if __TS__ArrayIncludes(be.pouvoirs, "murmure") then 1 else 0),
                aubePrete = (if __TS__ArrayIncludes(be.pouvoirs, "aube-premiere") then 1 else 0)
            },
            __TS__ObjectFromEntries(__TS__ArrayMap(
                entrees(h.maitrise or ({})),
                function(____, ____bindingPattern0)
                    local v
                    local k
                    k = ____bindingPattern0[1]
                    v = ____bindingPattern0[2]
                    return {
                        "maitrise:" .. k,
                        rangMaitrise(contenu, v)
                    }
                end
            )),
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
        objets = be,
        facteurArme = puissance / math.max(1, cl.attaque.puissance),
        echelle = race.echelle,
        teinte = race.teinte or nil,
        race = h.race,
        attaques = {},
        phrase = nil,
        effetAttaque = nil
    }
end
--- Objets du sac encore disponibles pour ce combattant : identifiant, nom, nombre, cible.
function ____exports.objetsDuSac(contenu, x)
    local res = {}
    for ____, ____value in ipairs(entrees(x.compteurs)) do
        local k = ____value[1]
        local n = ____value[2]
        if not __TS__StringStartsWith(k, "sac:") or n <= 0 then
            continue
        end
        local o = contenu.objets[string.sub(k, 5)]
        if o then
            res[#res + 1] = {
                id = o.id,
                nom = o.nom,
                nombre = n,
                cible = o.cible,
                description = o.description
            }
        end
    end
    return trier(
        res,
        function(a, b) return (if a.id < b.id then -1 else (if a.id > b.id then 1 else 0)) end
    )
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
            race = nil,
            attaques = {},
            phrase = nil,
            effetAttaque = nil
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
        local auras = {{"aura-defense", "bonus_defense"}, {"aura-degats", "bonus_degats"}, {"aura-precision", "bonus_precision"}, {"regeneration-groupe", "regeneration"}}
        for ____, ____value in ipairs(auras) do
            local bonus = ____value[1]
            local etatAura = ____value[2]
            local b = __TS__ArrayFind(
                c.bonusCompagnon,
                function(____, x) return x.id == bonus end
            )
            if b == nil then
                continue
            end
            local v = b.parametres.valeur or 0.1
            for ____, a in ipairs(allies) do
                ajouterEtat(combat, a, {
                    id = etatAura,
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
    local ____array_138 = __TS__SparseArrayNew(table.unpack(__TS__ArrayFilter(
        combat.evenements,
        function(____, e) return e.tour < combat.tour end
    )))
    __TS__SparseArrayPush(____array_138, {tour = combat.tour, type = "info", texte = "Le temps se replie… le tour recommence ! (Second départ)"})
    restaure.evenements = {__TS__SparseArraySpread(____array_138)}
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
                raison = (if aEtat(x, "silence") then "Réduit au silence" else (if (x.recharges[comp.id] or 0) > 0 then ("Recharge : " .. tostring(x.recharges[comp.id])) .. " tour(s)" else (if x.mana < ____exports.coutMana(x, comp) then "Mana insuffisant" else (if comp.id == "souffle-draconique" and vrai(x.compteurs.souffle) then "Déjà utilisé" else ""))))
            }
        end
    )
    local ____x_potions_141 = x.potions
    local ____x_bombes_142 = x.bombes
    local ____exports_objetsDuSac_result_143 = ____exports.objetsDuSac(contenu, x)
    local ____opt_139 = x.don
    return {
        competences = comps,
        potions = ____x_potions_141,
        bombes = ____x_bombes_142,
        sac = ____exports_objetsDuSac_result_143,
        pacifier = (if (____opt_139 and ____opt_139.id) == "langue-universelle" then __TS__ArrayMap(
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
--- Sert seulement à dire à `chanceToucher` qu'il s'agit d'une attaque de base (bonus de fiabilité).
local ATTAQUE_DE_BASE = {
    id = "attaque",
    nom = "Attaque",
    description = "",
    cout = 0,
    recharge = 0,
    cible = "ennemi",
    portee = "melee",
    effets = {{type = "charge_rune", nombre = 0}},
    ia = {priorite = 1, quand = "toujours"}
}
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
    local function estimerDegats(cible, puissance, stat, element, rang, coups, maitrise)
        if maitrise == nil then
            maitrise = 0
        end
        local brut = puissance * (1 + 0.1 * (rang - 1)) * (1 + contenu.config.maitrise.degats_par_rang * maitrise) * (1 + x.caracs[stat] / 20) * multiplicateurDegatsSource(combat, x, cible, element)
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
                local ____opt_144 = __TS__ArrayFind(
                    combat.combattants,
                    function(____, y) return y.id == prov.source end
                )
                return ("Vous êtes provoqué : vous devez attaquer " .. (____opt_144 and ____opt_144.nom or "votre provocateur")) .. "."
            end
            if portee == "melee" and c.rang == "arriere" then
                return c.nom .. " est protégé au rang arrière : il faut une attaque à distance, ou éliminer d'abord le rang avant."
            end
            return c.nom .. " est hors de portée."
        end
        return c
    end
    repeat
        local ____switch481 = a.type
        local ____cond481 = ____switch481 == "attaque" or ____switch481 == "viser"
        if ____cond481 then
            do
                local c = verifierCible(a.cible, x.attaque.portee)
                if type(c) == "string" then
                    return estimationImpossible(c)
                end
                local v = (if a.type == "viser" then ____exports.VISEES[a.partie] else nil)
                x.compteurs.modToucher = v and v.toucher or 0
                res.reussite = chanceToucher(contenu, x, c, ATTAQUE_DE_BASE)
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
                    local ____res_effets_150 = res.effets
                    ____res_effets_150[#____res_effets_150 + 1] = (tostring(math.floor(v.chance * (if c.boss then 0.5 else 1) * 100 + 0.5)) .. " % : ") .. string.lower(____exports.NOMS_ETATS[v.etat])
                end
                return res
            end
        end
        ____cond481 = ____cond481 or ____switch481 == "competence"
        if ____cond481 then
            do
                local k = ____exports.competenceCombattant(contenu, x, a.competence)
                res.mana = ____exports.coutMana(x, k.comp)
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
                            ef.coups,
                            ____exports.maitriseDe(x, k.comp.id)
                        ))
                        if res.reussite == nil then
                            res.reussite = chanceToucher(contenu, x, principale, k.comp)
                        end
                        if res.critique == nil then
                            res.critique = (if ef.critique_garanti or aEtat(x, "furtif") then 1 else chanceCritique(contenu, x, principale))
                        end
                    elseif ef.type == "soin" then
                        local s = ef.puissance * (1 + 0.1 * (k.rang - 1)) * (1 + contenu.config.maitrise.degats_par_rang * ____exports.maitriseDe(x, k.comp.id)) * (1 + x.caracs[ef.stat] / 20)
                        res.soin = {
                            math.floor(s + 0.5),
                            math.floor(s + 0.5)
                        }
                    elseif ef.type == "etat" then
                        local ____res_effets_151 = res.effets
                        ____res_effets_151[#____res_effets_151 + 1] = (if ef.chance < 1 then tostring(math.floor(ef.chance * 100 + 0.5)) .. " % : " else "") .. string.lower(____exports.NOMS_ETATS[ef.etat])
                    elseif ef.type == "bouclier" then
                        local ____res_effets_152 = res.effets
                        ____res_effets_152[#____res_effets_152 + 1] = ("bouclier (" .. tostring(math.floor(ef.pourcent_pv * 100 + 0.5))) .. " % des PV)"
                    elseif ef.type == "invocation" then
                        local ____res_effets_155 = res.effets
                        local ____opt_153 = contenu.ennemis[ef.creature]
                        ____res_effets_155[#____res_effets_155 + 1] = "invocation : " .. (____opt_153 and ____opt_153.nom or ef.creature)
                    end
                end
                return res
            end
        end
        ____cond481 = ____cond481 or ____switch481 == "se_cacher"
        if ____cond481 then
            res.reussite = ____exports.chanceSeCacher(combat, x)
            local ____res_effets_156 = res.effets
            ____res_effets_156[#____res_effets_156 + 1] = "furtif : impossible à cibler, prochaine attaque critique"
            return res
        end
        ____cond481 = ____cond481 or ____switch481 == "fuir"
        if ____cond481 then
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
        ____cond481 = ____cond481 or ____switch481 == "objet"
        if ____cond481 then
            if a.objet == "potion" then
                local ____temp_159 = 16 * 1.5
                local ____opt_157 = x.passif
                local s = ____temp_159 * (if (____opt_157 and ____opt_157.id) == "fioles-optimisees" then 1 + (x.passif.parametres.efficacite or 0.4) else 1)
                res.soin = {
                    math.floor(s + 0.5),
                    math.floor(s + 0.5)
                }
            end
            return res
        end
        ____cond481 = ____cond481 or ____switch481 == "defendre"
        if ____cond481 then
            local ____res_effets_160 = res.effets
            ____res_effets_160[#____res_effets_160 + 1] = "−50 % de dégâts reçus jusqu'au prochain tour, +10 % de mana"
            return res
        end
        do
            return res
        end
    until true
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
    return (((((((("Jour " .. tostring(d.jour)) .. " · ") .. m.nom) .. " (mois ") .. tostring(d.mois)) .. "/") .. tostring(#contenu.config.calendrier.mois)) .. ") · An ") .. tostring(d.annee)
end
--- Aide affichée au survol de la date : saison, calendrier « AV », fête la plus proche.
function ____exports.aideDate(contenu, jourAbsolu)
    local ____cal_result_2 = cal(contenu)
    local jpa = ____cal_result_2.jpa
    local d = ____exports.versDate(contenu, jourAbsolu)
    local mois = contenu.config.calendrier.mois
    local m = mois[d.mois]
    local rangSaison = 0
    do
        local i = 0
        while i < d.mois do
            if mois[i + 1].saison == m.saison then
                rangSaison = rangSaison + 1
            end
            i = i + 1
        end
    end
    local article = (if m.saison == "printemps" then "du printemps" else (if m.saison == "hiver" then "de l'hiver" else "de l'" .. m.saison))
    local res = {
        ((((m.nom .. " : ") .. (if rangSaison == 1 then "1er" else tostring(rangSaison) .. "e")) .. " mois ") .. article) .. ".",
        ("« AV » veut dire « Après le Voile » : c'est le calendrier de Velmaris. Nous sommes en " .. tostring(d.annee)) .. " AV."
    }
    local meilleure = nil
    for ____, f in ipairs(contenu.config.calendrier.fetes) do
        local dans = ____exports.versJour(contenu, {annee = d.annee, mois = f.mois, jour = f.jour}) - jourAbsolu
        if dans < 0 then
            dans = dans + jpa
        end
        if meilleure == nil or dans < meilleure.dans then
            meilleure = {nom = f.nom, dans = dans}
        end
    end
    if meilleure ~= nil then
        res[#res + 1] = (if meilleure.dans == 0 then ("Aujourd'hui : " .. meilleure.nom) .. " !" else ((((("Prochaine fête : " .. meilleure.nom) .. ", dans ") .. tostring(meilleure.dans)) .. " jour") .. (if meilleure.dans > 1 then "s" else "")) .. ".")
    end
    return res
end
function ____exports.saisonDe(contenu, jourAbsolu)
    return contenu.config.calendrier.mois[____exports.versDate(contenu, jourAbsolu).mois].saison
end
function ____exports.feteDuJour(contenu, jourAbsolu)
    local d = ____exports.versDate(contenu, jourAbsolu)
    local ____opt_3 = __TS__ArrayFind(
        contenu.config.calendrier.fetes,
        function(____, f) return f.mois == d.mois and f.jour == d.jour end
    )
    return ____opt_3 and ____opt_3.nom or nil
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
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__StringSlice = ____lualib.__TS__StringSlice
local __TS__StringSplit = ____lualib.__TS__StringSplit
local __TS__StringReplaceAll = ____lualib.__TS__StringReplaceAll
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__ArrayUnshift = ____lualib.__TS__ArrayUnshift
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ObjectRest = ____lualib.__TS__ObjectRest
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__StringAccess = ____lualib.__TS__StringAccess
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
local journal, appliquerConsequence, avancerTemps, accorder, participantsGroupe, entrerNoeud, repondreParole, resoudrePari, terminerScene, resoudreChoix, decouvrirGout, lancerCombat, reveler, repartirAncienGrimoire, avancerContrat, quantiteValide, declencherEtapes, resoudreVote, dejaUnique, refuser, ordreRangs
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
local competencesEquipees = ____personnage.competencesEquipees
local creerHeros = ____personnage.creerHeros
local gagnerMaitrise = ____personnage.gagnerMaitrise
local gagnerXp = ____personnage.gagnerXp
local niveauMoyen = ____personnage.niveauMoyen
local rangMaitrise = ____personnage.rangMaitrise
local repartirPoint = ____personnage.repartirPoint
local xpPourNiveau = ____personnage.xpPourNiveau
local ____rng = require("src.moteur.rng")
local choisirAuHasard = ____rng.choisir
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
local ____personnage = require("src.moteur.personnage")
local connuesDe = ____personnage.competencesConnues
local ____equipement = require("src.moteur.equipement")
local exemplaires = ____equipement.exemplaires
local problemeEquipement = ____equipement.problemeEquipement
local ____temps = require("src.moteur.temps")
local anneeDepart = ____temps.anneeDepart
local chapitreDe = ____temps.chapitreDe
local fetesEntre = ____temps.fetesEntre
local formaterDate = ____temps.formaterDate
local joursParMois = ____temps.joursParMois
local versDate = ____temps.versDate
local versJour = ____temps.versJour
function ____exports.listeHeros(etat)
    local res = {}
    for ____, j in ipairs(etat.ordreJoueurs) do
        local id = etat.joueurs[j].herosId
        if vrai(id) then
            res[#res + 1] = etat.heros[id]
        end
    end
    return res
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
function ____exports.rangGuilde(contenu, points)
    local r = "F"
    for ____, x in ipairs(contenu.config.guilde.rangs) do
        if points >= x.points then
            r = x.rang
        end
    end
    return r
end
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
    local besoinHeros = vrai(c.race) or vrai(c.classe) or vrai(c.origine) or vrai(c.don) or vrai(c.affinite_min) or vrai(c.affinite_palier) or vrai(c.carac_min) or vrai(c.objet) or vrai(c.rang_guilde_min) or c.niveau_min ~= nil or c.or_min ~= nil
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
    if vrai(c.objet) and not ((h.inventaire[c.objet] or 0) > 0) then
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
    if eff.debloquer_ultime == true then
        for ____, h in ipairs(hs) do
            if h.ultime == true then
                continue
            end
            h.ultime = true
            local u = contenu.classes[h.classe].ultime
            messages[#messages + 1] = (((h.nom .. " débloque son ultime : ") .. u.nom) .. (if h.niveau < contenu.config.saisons[1].niveau_ultime then (" (utilisable au niveau " .. tostring(contenu.config.saisons[1].niveau_ultime)) .. ")" else "")) .. " !"
        end
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
            if dejaUnique(contenu, etat, o) then
                messages[#messages + 1] = contenu.objets[o].nom .. " existe déjà dans la partie : il n'en existe qu'un."
            else
                h.inventaire[o] = (h.inventaire[o] or 0) + 1
                messages[#messages + 1] = (h.nom .. " obtient : ") .. contenu.objets[o].nom
            end
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
    for ____, ____value in ipairs(entrees(eff.reveler_gout or ({}))) do
        local co = ____value[1]
        local o = ____value[2]
        decouvrirGout(etat, co, o)
    end
    if eff.miser ~= nil then
        for ____, h in ipairs(hs) do
            if h["or"] < eff.miser then
                continue
            end
            h["or"] = h["or"] - eff.miser
            etat.mises[h.id] = (etat.mises[h.id] or 0) + eff.miser
            local ____etat_mouvementsOr_40 = etat.mouvementsOr
            ____etat_mouvementsOr_40[#____etat_mouvementsOr_40 + 1] = {heros = h.id, montant = -eff.miser, raison = "mise"}
            messages[#messages + 1] = ((h.nom .. " mise ") .. tostring(eff.miser)) .. " pièces d'or."
        end
    end
    if eff.gain_pari ~= nil then
        for ____, h in ipairs(hs) do
            local mise = etat.mises[h.id] or 0
            if mise <= 0 then
                continue
            end
            local gain = math.floor(mise * eff.gain_pari + 0.5)
            h["or"] = h["or"] + gain
            __TS__Delete(etat.mises, h.id)
            local ____etat_mouvementsOr_41 = etat.mouvementsOr
            ____etat_mouvementsOr_41[#____etat_mouvementsOr_41 + 1] = {heros = h.id, montant = gain, raison = "pari gagné"}
            messages[#messages + 1] = ((h.nom .. " gagne son pari : +") .. tostring(gain)) .. " pièces d'or (mise comprise)."
        end
    end
    if eff.perte_pari == true then
        for ____, h in ipairs(hs) do
            local mise = etat.mises[h.id] or 0
            if mise <= 0 then
                continue
            end
            __TS__Delete(etat.mises, h.id)
            messages[#messages + 1] = ((h.nom .. " perd sa mise de ") .. tostring(mise)) .. " pièces d'or."
        end
    end
    if vrai(eff.fin_chapitre) then
        etat.finChapitre = eff.fin_chapitre
        etat.flags[("chapitre-" .. tostring(eff.fin_chapitre)) .. "-fini"] = true
        journal(
            contenu,
            etat,
            ("Fin du chapitre " .. tostring(eff.fin_chapitre)) .. ". Un long moment va passer : rendez-vous à l'auberge quand tout le monde est prêt."
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
        local ____etat_journal_42 = etat.journal
        ____etat_journal_42[#____etat_journal_42 + 1] = {
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
    return ({
        couronne = "Couronne",
        guilde = "Guilde",
        concorde = "Concorde",
        ordre = "Ordre",
        ourvalis = "Tribus ourvalis",
        elfes = "Elfes de Sylvenoire",
        nains = "Nains de Grisfer",
        dragons = "Dragons et Archipel",
        troupes = "Troupes des domaines",
        legion = "Légion Cendrée"
    })[f] or f
end
function accorder(texte, seul)
    local res = ""
    local reste = texte
    do
        local garde = 0
        while garde < 100 do
            local i = (string.find(reste, "[[", nil, true) or 0) - 1
            if i < 0 then
                break
            end
            local j = (string.find(
                reste,
                "]]",
                math.max(i + 1, 1),
                true
            ) or 0) - 1
            if j < 0 then
                break
            end
            local morceaux = __TS__StringSplit(
                __TS__StringSlice(reste, i + 2, j),
                "||"
            )
            res = res .. __TS__StringSlice(reste, 0, i) .. (if seul then morceaux[1] else morceaux[2] or morceaux[1])
            reste = __TS__StringSlice(reste, j + 2)
            garde = garde + 1
        end
    end
    return res .. reste
end
---
-- @param interroge héros à qui un personnage s'adresse : {pseudo} = pseudo de son joueur, {nom} = son nom
function ____exports.remplacerVariables(contenu, etat, texteBrut, heros, interroge)
    local texte = accorder(texteBrut, #heros <= 1)
    local hi = (if vrai(interroge) then etat.heros[interroge] else nil)
    if hi then
        local ____texte_50 = texte
        local ____opt_48 = etat.joueurs[hi.joueurId]
        texte = __TS__StringReplaceAll(
            __TS__StringReplaceAll(____texte_50, "{pseudo}", ____opt_48 and ____opt_48.pseudo or hi.nom),
            "{nom}",
            hi.nom
        )
    end
    local noms = __TS__ArrayFilter(
        __TS__ArrayMap(
            heros,
            function(____, h)
                local ____opt_51 = etat.heros[h]
                return ____opt_51 and ____opt_51.nom
            end
        ),
        function(____, n) return vrai(n) end
    )
    local listeNoms = (if #noms <= 1 then noms[1] or "le héros" else (table.concat(
        __TS__ArraySlice(noms, 0, -1),
        ", "
    ) .. " et ") .. noms[#noms])
    local ____vrai_result_56 = vrai(etat.meneur)
    if ____vrai_result_56 then
        local ____vrai_55 = vrai
        local ____opt_53 = etat.joueurs[etat.meneur]
        ____vrai_result_56 = ____vrai_55(____opt_53 and ____opt_53.herosId)
    end
    local meneur = (if ____vrai_result_56 then etat.heros[etat.joueurs[etat.meneur].herosId].nom else noms[1] or "")
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
                local ____opt_57 = etat.joueurs[h.joueurId]
                return ____opt_57 and ____opt_57.present or h.siAbsent == "ia"
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
    es.parole = nil
    es.pari = nil
    for ____, eff in ipairs(n.effets) do
        appliquerConsequence(
            contenu,
            etat,
            eff,
            es.heros,
            es.messages
        )
    end
    if n.pari then
        es.pari = {}
        if #____exports.joueursDuPari(etat, cle) == 0 then
            resoudrePari(contenu, etat, cle)
        end
        return
    end
    if n.parole_a then
        local pa = n.parole_a
        local candidats = __TS__ArrayFilter(
            es.heros,
            function(____, h) return ____exports.conditionHeros(contenu, etat, pa.regle, etat.heros[h]) end
        )
        if #candidats == 0 then
            candidats = es.heros
        end
        local elu = choisirAuHasard(etat.rng, candidats)
        local h = etat.heros[elu]
        local specifiques = {}
        local generiques = {}
        __TS__ArrayForEach(
            pa.reponses,
            function(____, r, i)
                if not r.si then
                    generiques[#generiques + 1] = i
                elseif ____exports.conditionHeros(contenu, etat, r.si, h) then
                    specifiques[#specifiques + 1] = i
                end
            end
        )
        local ____array_59 = __TS__SparseArrayNew(table.unpack(specifiques))
        __TS__SparseArrayPush(
            ____array_59,
            table.unpack(generiques)
        )
        es.parole = {
            heros = elu,
            reponses = __TS__ArraySlice(
                {__TS__SparseArraySpread(____array_59)},
                0,
                3
            )
        }
        local ____opt_60 = etat.joueurs[h.joueurId]
        local ____temp_62 = ____opt_60 and ____opt_60.present
        if ____temp_62 == nil then
            ____temp_62 = false
        end
        if not ____temp_62 then
            repondreParole(contenu, etat, cle, es.parole.reponses[1])
        end
        return
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
            },
            scene.lieu or nil
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
        if vrai(n.donjon.abandon) then
            etat.donjon.abandon = n.donjon.abandon
        end
        reveler(etat, d.depart.x, d.depart.y)
    elseif n.fin then
        terminerScene(contenu, etat, cle)
    end
end
function repondreParole(contenu, etat, cle, index)
    local es = etat.scenes[cle]
    local n = ____exports.noeudCourant(contenu, etat, cle)
    local p = es.parole
    local rep = n.parole_a.reponses[index + 1]
    local msgs = {(etat.heros[p.heros].nom .. " répond : ") .. ____exports.remplacerVariables(
        contenu,
        etat,
        rep.texte,
        es.heros,
        p.heros
    )}
    for ____, eff in ipairs(rep.effets) do
        appliquerConsequence(
            contenu,
            etat,
            eff,
            {p.heros},
            msgs
        )
    end
    entrerNoeud(contenu, etat, cle, rep.aller)
    __TS__ArrayUnshift(
        etat.scenes[cle].messages,
        table.unpack(msgs)
    )
end
--- Joueurs qui doivent répondre au pari de la scène : présents, avec un héros dans la scène, dans l'ordre de la partie.
function ____exports.joueursDuPari(etat, cle)
    local es = etat.scenes[cle]
    if not es then
        return {}
    end
    return __TS__ArrayFilter(
        etat.ordreJoueurs,
        function(____, j)
            local x = etat.joueurs[j]
            return x.present and vrai(x.herosId) and __TS__ArrayIncludes(es.heros, x.herosId)
        end
    )
end
--- Répartit une mise entre des parieurs, sans virgule : division entière, puis les pièces qui restent
-- sont données une par une aux premiers (ordre de la liste). Exemple : 20 à 3 → 7, 7, 6.
function ____exports.partsDeMise(total, nombre)
    local res = {}
    if nombre <= 0 then
        return res
    end
    local base = math.floor(total / nombre)
    local reste = total - base * nombre
    do
        local i = 0
        while i < nombre do
            res[#res + 1] = base + (if i < reste then 1 else 0)
            i = i + 1
        end
    end
    return res
end
function resoudrePari(contenu, etat, cle)
    local es = etat.scenes[cle]
    local n = ____exports.noeudCourant(contenu, etat, cle)
    local pari = n.pari
    local reponses = es.pari or ({})
    local parieurs = __TS__ArrayMap(
        __TS__ArrayFilter(
            ____exports.joueursDuPari(etat, cle),
            function(____, j) return reponses[j] == true end
        ),
        function(____, j) return etat.heros[etat.joueurs[j].herosId] end
    )
    local msgs = {}
    local parts = {}
    do
        local garde = 0
        while garde < 10 and #parieurs > 0 do
            parts = ____exports.partsDeMise(pari.mise, #parieurs)
            local fauche = __TS__ArrayFindIndex(
                parieurs,
                function(____, h, i) return h["or"] < parts[i + 1] end
            )
            if fauche < 0 then
                break
            end
            msgs[#msgs + 1] = parieurs[fauche + 1].nom .. " n'a pas assez d'or pour sa part et se retire du pari."
            parieurs = __TS__ArrayFilter(
                parieurs,
                function(____, _, i) return i ~= fauche end
            )
            garde = garde + 1
        end
    end
    es.pari = nil
    if #parieurs == 0 then
        msgs[#msgs + 1] = "Personne ne parie."
        entrerNoeud(contenu, etat, cle, pari.personne)
    else
        __TS__ArrayForEach(
            parieurs,
            function(____, h, i)
                h["or"] = h["or"] - parts[i + 1]
                etat.mises[h.id] = (etat.mises[h.id] or 0) + parts[i + 1]
                local ____etat_mouvementsOr_63 = etat.mouvementsOr
                ____etat_mouvementsOr_63[#____etat_mouvementsOr_63 + 1] = {heros = h.id, montant = -parts[i + 1], raison = "mise"}
                msgs[#msgs + 1] = ((((h.nom .. " mise ") .. tostring(parts[i + 1])) .. " pièce") .. (if parts[i + 1] > 1 then "s" else "")) .. " d'or."
            end
        )
        if vrai(pari.flag) then
            etat.flags[pari.flag] = true
        end
        entrerNoeud(contenu, etat, cle, pari.aller)
    end
    __TS__ArrayUnshift(
        etat.scenes[cle].messages,
        table.unpack(msgs)
    )
end
function terminerScene(contenu, etat, cle)
    local es = etat.scenes[cle]
    local s = contenu.scenes[es.sceneId]
    if not s.repetable then
        local ____etat_scenesVues_64 = etat.scenesVues
        ____etat_scenesVues_64[#____etat_scenesVues_64 + 1] = (if s.type == "individuel" then (s.id .. "@") .. es.heros[1] else s.id)
    end
    es.noeudFin = es.noeud
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
    local herosVotants = {}
    for ____, j in ipairs(votants) do
        local ____opt_65 = etat.joueurs[j]
        local h = ____opt_65 and ____opt_65.herosId
        if vrai(h) and __TS__ArrayIncludes(es.heros, h) then
            herosVotants[#herosVotants + 1] = h
        end
    end
    local msgs = {}
    for ____, eff in ipairs(ch.effets) do
        local aff = eff.affinite
        local flag = eff.flag
        local miser = eff.miser
        local reste = __TS__ObjectRest(eff, {affinite = true, flag = true, miser = true})
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
        if aff or #perso > 0 or miser ~= nil then
            appliquerConsequence(
                contenu,
                etat,
                {affinite = aff, flag = perso, miser = miser},
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
function decouvrirGout(etat, compagnon, objet)
    local ____etat_goutsConnus_71, ____compagnon_72 = etat.goutsConnus, compagnon
    if ____etat_goutsConnus_71[____compagnon_72] == nil then
        ____etat_goutsConnus_71[____compagnon_72] = {}
    end
    if not __TS__ArrayIncludes(etat.goutsConnus[compagnon], objet) then
        local ____etat_goutsConnus_compagnon_73 = etat.goutsConnus[compagnon]
        ____etat_goutsConnus_compagnon_73[#____etat_goutsConnus_compagnon_73 + 1] = objet
    end
end
--- Vrai si un combat dans ce lieu se passe « en route » (hors d'une ville) : chaque héros y mange une ration.
function ____exports.lieuHorsVille(contenu, lieu)
    if not vrai(lieu) then
        return false
    end
    for ____, r in ipairs(valeurs(contenu.regions)) do
        local l = __TS__ArrayFind(
            r.lieux,
            function(____, x) return x.id == lieu end
        )
        if l then
            return not vrai(l.ville)
        end
    end
    return false
end
function lancerCombat(contenu, etat, rencontre, cle, contexte, lieu)
    local herosIds = (if cle == "groupe" then participantsGroupe(etat) else {cle})
    if #herosIds == 0 then
        refuser("Aucun héros disponible pour combattre")
    end
    local allies = {}
    for ____, id in ipairs(herosIds) do
        local h = etat.heros[id]
        local ____opt_74 = etat.joueurs[h.joueurId]
        local ____temp_76 = ____opt_74 and ____opt_74.present
        if ____temp_76 == nil then
            ____temp_76 = false
        end
        local present = ____temp_76
        allies[#allies + 1] = combattantHeros(contenu, h, present, h.grimoire)
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
    if ____exports.lieuHorsVille(contenu, lieu) then
        for ____, x in ipairs(combat.combattants) do
            if x.type ~= "heros" or not vrai(x.herosId) then
                continue
            end
            local h = etat.heros[x.herosId]
            if (h.inventaire[____exports.RATION.objet] or 0) > 0 then
                local ____h_inventaire_77, ____exports_RATION_objet_78 = h.inventaire, ____exports.RATION.objet
                ____h_inventaire_77[____exports_RATION_objet_78] = ____h_inventaire_77[____exports_RATION_objet_78] - 1
                local ____etat_dernieresNouvelles_79 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_79[#____etat_dernieresNouvelles_79 + 1] = h.nom .. " mange une ration de voyage en route."
            else
                x.pv = math.max(
                    1,
                    x.pv - math.floor(x.pvMax * ____exports.RATION.malusPv + 0.5)
                )
                local ____etat_dernieresNouvelles_80 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_80[#____etat_dernieresNouvelles_80 + 1] = ((h.nom .. " n'a pas de ration : la route l'a fatigué (−") .. tostring(math.floor(____exports.RATION.malusPv * 100 + 0.5))) .. " % de PV au début du combat)."
            end
        end
    end
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
                        local ____etat_donjon_vus_92 = etat.donjon.vus
                        ____etat_donjon_vus_92[#____etat_donjon_vus_92 + 1] = k
                    end
                    dx = dx + 1
                end
            end
            dy = dy + 1
        end
    end
end
function repartirAncienGrimoire(contenu, etat)
    for ____, t in ipairs(valeurs(etat.grimoire or ({}))) do
        local heros = valeurs(etat.heros)
        local appris = __TS__ArrayFilter(
            heros,
            function(____, h) return __TS__ArrayIncludes(h.variantes[t.parent] or ({}), t.id) end
        )
        local cibles = (if #appris > 0 then appris else __TS__ArrayFilter(
            heros,
            function(____, h) return peutApprendre(contenu, h, t) == nil end
        ))
        for ____, h in ipairs(cibles) do
            h.grimoire[t.id] = t
        end
    end
    __TS__Delete(etat, "grimoire")
end
--- Étape en cours du contrat d'un héros (null s'il n'a pas de contrat).
function ____exports.etapeContrat(contenu, etat, herosId)
    local ____opt_142 = etat.contrats
    local st = ____opt_142 and ____opt_142[herosId]
    if not st then
        return nil
    end
    local ct = contenu.contrats[st.id]
    if not ct or st.etape >= #ct.etapes then
        return nil
    end
    return {
        contrat = ct,
        etape = ct.etapes[st.etape + 1],
        numero = st.etape + 1,
        total = #ct.etapes,
        notes = st.notes,
        derniere = st.etape == #ct.etapes - 1
    }
end
function avancerContrat(contenu, etat, h)
    local st = etat.contrats[h.id]
    local ct = contenu.contrats[st.id]
    st.etape = st.etape + 1
    if st.etape < #ct.etapes then
        local ____etat_dernieresNouvelles_144 = etat.dernieresNouvelles
        ____etat_dernieresNouvelles_144[#____etat_dernieresNouvelles_144 + 1] = (("Contrat « " .. ct.titre) .. " » : ") .. ct.etapes[st.etape + 1].objectif
        return
    end
    local msgs = {}
    appliquerConsequence(
        contenu,
        etat,
        {["or"] = ct.recompenses["or"], xp = ct.recompenses.xp, points_guilde = ct.recompenses.points_guilde, objet = ct.recompenses.objets},
        {h.id},
        msgs
    )
    __TS__Delete(etat.contrats, h.id)
    __TS__ArrayPush(
        etat.dernieresNouvelles,
        ("Contrat rempli : " .. ct.titre) .. ".",
        table.unpack(msgs)
    )
    journal(contenu, etat, ((h.nom .. " remplit le contrat « ") .. ct.titre) .. " ».")
end
function quantiteValide(q)
    if q == nil then
        return 1
    end
    if q < 1 or q > 99 or math.floor(q) ~= q then
        refuser("Quantité invalide (de 1 à 99)")
    end
    return q
end
function declencherEtapes(contenu, etat, correspond)
    for ____, ____value in ipairs(entrees(etat.quetes)) do
        local id = ____value[1]
        local q = ____value[2]
        local def = contenu.quetes[id]
        if not def or q.terminee then
            continue
        end
        local i = __TS__ArrayFindIndex(
            def.etapes,
            function(____, e) return e.id == q.etape end
        )
        if i < 0 or i + 1 >= #def.etapes then
            continue
        end
        local d = def.etapes[i + 1].declencheur
        if not d or not correspond(d) then
            continue
        end
        q.etape = def.etapes[i + 1 + 1].id
        local ____etat_dernieresNouvelles_145 = etat.dernieresNouvelles
        ____etat_dernieresNouvelles_145[#____etat_dernieresNouvelles_145 + 1] = (("Quête « " .. def.titre) .. " » : ") .. def.etapes[i + 1 + 1].objectif
    end
end
function resoudreVote(contenu, etat)
    local es = etat.scenes.groupe
    local comptes = __TS__New(Map)
    for ____, ____value in ipairs(entrees(es.votes)) do
        local joueur = ____value[1]
        local idx = ____value[2]
        local ____comptes_set_148 = comptes.set
        local ____idx_147 = idx
        local ____array_146 = __TS__SparseArrayNew(table.unpack(comptes:get(idx) or ({})))
        __TS__SparseArrayPush(____array_146, joueur)
        ____comptes_set_148(
            comptes,
            ____idx_147,
            {__TS__SparseArraySpread(____array_146)}
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
function dejaUnique(contenu, etat, objet)
    local ____opt_149 = contenu.objets[objet]
    return (____opt_149 and ____opt_149.unique_par_partie) == true and exemplaires(
        ____exports.listeHeros(etat),
        objet
    ) > 0
end
____exports.VERSION_ETAT = 6
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
        repos = nil,
        journal = {{
            jour = 0,
            chapitre = 1,
            texte = ((("Printemps " .. tostring(anneeDepart(contenu))) .. " AV : la partie « ") .. nom) .. " » commence."
        }},
        secondDepart = {},
        dernieresNouvelles = {},
        finChapitre = nil,
        mises = {},
        mouvementsOr = {},
        contrats = {},
        objetsConnus = {},
        goutsConnus = {}
    }
end
function ____exports.herosDuJoueur(etat, joueur)
    local j = etat.joueurs[joueur] or refuser("Joueur inconnu")
    return etat.heros[j.herosId or ""] or refuser("Ce joueur n'a pas encore de héros")
end
ordreRangs = {
    "F",
    "E",
    "D",
    "C",
    "B",
    "A",
    "S"
}
--- Une condition dans une scène : vraie si au moins un héros participant la remplit.
function ____exports.conditionScene(contenu, etat, c, heros)
    if not c then
        return true
    end
    if c.groupe_min ~= nil and #heros < c.groupe_min then
        return false
    end
    if c.groupe_max ~= nil and #heros > c.groupe_max then
        return false
    end
    if #heros == 0 then
        return ____exports.conditionHeros(contenu, etat, c, nil)
    end
    return __TS__ArraySome(
        heros,
        function(____, h) return ____exports.conditionHeros(contenu, etat, c, etat.heros[h]) end
    )
end
--- Vrai si le minuteur de jeu actif peut encore faire passer un jour (il ne change jamais de mois).
function ____exports.jourPeutPasser(contenu, etat)
    if etat.tempsLibre ~= nil then
        return false
    end
    return versDate(contenu, etat.jour).jour < joursParMois(contenu)
end
--- Prochaine date que l'histoire attend : la scène principale en cours si elle exige une date,
-- sinon le début du chapitre suivant quand le chapitre est terminé. Null s'il n'y a rien à attendre.
function ____exports.prochaineDateHistoire(contenu, etat)
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
        local scene = (if e and vrai(e.scene) then contenu.scenes[e.scene] else nil)
        local ____opt_43 = scene and scene.disponible_si
        local d = ____opt_43 and ____opt_43.date_min
        if d then
            local jour = versJour(contenu, d)
            if jour > etat.jour then
                return {jour = jour, raison = e.objectif}
            end
        end
    end
    if ____exports.aFlag(
        etat,
        ("chapitre-" .. tostring(etat.chapitre)) .. "-fini"
    ) and etat.chapitre < contenu.config.saisons[1].chapitres then
        local s = contenu.config.saisons[1]
        local jour = versJour(contenu, {annee = s.annee_debut + etat.chapitre * s.annees_par_chapitre})
        if jour > etat.jour then
            return {
                jour = jour,
                raison = "Début du chapitre " .. tostring(etat.chapitre + 1)
            }
        end
    end
    return nil
end
--- Joueurs dont on attend encore l'accord pour dormir (présents, avec un héros).
function ____exports.attenteRepos(etat)
    if not etat.repos then
        return {}
    end
    local r = etat.repos
    return __TS__ArrayFilter(
        etat.ordreJoueurs,
        function(____, j) return etat.joueurs[j].present and vrai(etat.joueurs[j].herosId) and not __TS__ArrayIncludes(r.accords, j) end
    )
end
local function reposImpossible(etat)
    if etat.tempsLibre ~= nil then
        return "Un temps libre est déjà en cours"
    end
    if etat.donjon then
        return "Le groupe est dans un donjon"
    end
    if #cles(etat.combats) > 0 then
        return "Un combat est en cours"
    end
    for ____, es in ipairs(valeurs(etat.scenes)) do
        if es.noeud ~= "__fin__" then
            return "Une scène est en cours : terminez-la d'abord"
        end
    end
    return nil
end
--- Tous les joueurs présents sont d'accord : le temps libre commence (les mois passeront à sa résolution).
local function commencerRepos(contenu, etat)
    local r = etat.repos
    etat.repos = nil
    etat.tempsLibre = {
        titre = ("Repos à l'auberge (" .. tostring(r.mois)) .. " mois)",
        jusqua = r.jusqua,
        mois = r.mois,
        choix = {},
        resultats = nil
    }
    local ____etat_dernieresNouvelles_47 = etat.dernieresNouvelles
    ____etat_dernieresNouvelles_47[#____etat_dernieresNouvelles_47 + 1] = ("Tout le monde est d'accord : " .. tostring(r.mois)) .. " mois vont passer. Chacun choisit ses activités."
end
function ____exports.sceneEstDisponible(contenu, etat, s, herosId)
    if s.romance and contenu.config.romance == false then
        return false
    end
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
--- Part la plus petite possible (tout le monde mise) : en dessous, un héros ne peut pas miser.
function ____exports.partMinimaleDePari(etat, cle, total)
    local n = math.max(
        1,
        #____exports.joueursDuPari(etat, cle)
    )
    return math.floor(total / n)
end
--- Somme qu'un choix fait miser (0 si ce n'est pas un pari).
function ____exports.miseDuChoix(ch)
    local total = 0
    for ____, eff in ipairs(ch.effets) do
        total = total + (eff.miser or 0)
    end
    return total
end
--- Nœud à afficher : le nœud en cours, ou le dernier nœud d'une scène terminée (ses répliques restent à lire).
function ____exports.noeudAffiche(contenu, etat, cle)
    local es = etat.scenes[cle]
    if not es then
        return nil
    end
    if es.noeud ~= "__fin__" then
        return contenu.scenes[es.sceneId].noeuds[es.noeud] or nil
    end
    return (if vrai(es.noeudFin) then contenu.scenes[es.sceneId].noeuds[es.noeudFin] or nil else nil)
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
--- Vrai si l'effet de cet objet est connu du joueur (un objet mystérieux reste « ??? » tant qu'il n'est pas découvert).
function ____exports.objetConnu(contenu, etat, objet)
    local ____opt_67 = contenu.objets[objet]
    return not (____opt_67 and ____opt_67.mystere) or __TS__ArrayIncludes(etat.objetsConnus or ({}), objet)
end
local function decouvrirObjet(contenu, etat, objet)
    if ____exports.objetConnu(contenu, etat, objet) then
        return
    end
    local ____etat_objetsConnus_69 = etat.objetsConnus
    ____etat_objetsConnus_69[#____etat_objetsConnus_69 + 1] = objet
    local o = contenu.objets[objet]
    local ____etat_dernieresNouvelles_70 = etat.dernieresNouvelles
    ____etat_dernieresNouvelles_70[#____etat_dernieresNouvelles_70 + 1] = (("Objet identifié : " .. o.nom) .. ". ") .. o.description
end
--- Réaction connue d'un compagnon à un cadeau (null tant qu'on ne l'a pas découverte).
function ____exports.goutConnu(contenu, etat, compagnon, objet)
    if not __TS__ArrayIncludes((etat.goutsConnus or ({}))[compagnon] or ({}), objet) then
        return nil
    end
    return reactionCadeau(contenu, compagnon, objet)
end
--- Ration de voyage : il en faut une par héros pour un combat hors de la ville ; sans ration, on part fatigué.
____exports.RATION = {objet = "ration", malusPv = 0.15}
local function terminerCombat(contenu, etat, cle)
    local ____etat_combats_cle_81 = etat.combats[cle]
    local combat = ____etat_combats_cle_81.combat
    local contexte = ____etat_combats_cle_81.contexte
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
        for ____, ____value in ipairs(entrees(c.compteurs)) do
            local k = ____value[1]
            local n = ____value[2]
            if not __TS__StringStartsWith(k, "utilise:") or n <= 0 then
                continue
            end
            local objet = string.sub(k, 9)
            h.inventaire[objet] = math.max(0, (h.inventaire[objet] or 0) - n)
        end
        for ____, ____value in ipairs(entrees(c.compteurs)) do
            local k = ____value[1]
            local n = ____value[2]
            if not __TS__StringStartsWith(k, "usage:") or n <= 0 then
                continue
            end
            local id = string.sub(k, 7)
            local avant = rangMaitrise(contenu, h.maitrise[id] or 0)
            gagnerMaitrise(contenu, h, id, n)
            local apres = rangMaitrise(contenu, h.maitrise[id] or 0)
            if apres > avant then
                local ____h_nom_84 = h.nom
                local ____opt_82 = contenu.competences[id]
                bilan[#bilan + 1] = ((((((____h_nom_84 .. " maîtrise mieux « ") .. (____opt_82 and ____opt_82.nom or id)) .. " » : maîtrise ") .. tostring(apres)) .. "/") .. tostring(#contenu.config.maitrise.seuils)) .. "."
            end
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
                if dejaUnique(contenu, etat, o) then
                    return
                end
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
    local ____etat_combats_cle_85 = etat.combats[cle]
    local combat = ____etat_combats_cle_85.combat
    local contexte = ____etat_combats_cle_85.contexte
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
            local ____etat_donjon_faits_86 = etat.donjon.faits
            ____etat_donjon_faits_86[#____etat_donjon_faits_86 + 1] = contexte.evenementDonjon
        end
        etat.donjon.messages = {table.unpack(contexte.bilan or ({}))}
        if not victoire then
            local d = etat.donjon
            local defaites = (d.defaites or 0) + (if combat.resultat == "defaite" then 1 else 0)
            local ____array_87 = __TS__SparseArrayNew(table.unpack(contexte.bilan or ({})))
            __TS__SparseArrayPush(____array_87, "Vous reprenez connaissance près de l'escalier d'entrée. Les ennemis vaincus ne se relèveront pas.")
            local msg = (if combat.resultat == "defaite" then {__TS__SparseArraySpread(____array_87)} else {"Le groupe se replie vers l'entrée."})
            if defaites >= 3 and vrai(d.abandon) then
                msg[#msg + 1] = "Le groupe est épuisé. Vous pouvez renoncer et remonter par l'escalier d'entrée : l'histoire continuera sans ce que vous cherchiez ici."
            end
            etat.donjon = __TS__ObjectAssign({}, d, {x = contenu.donjons[d.id].depart.x, y = contenu.donjons[d.id].depart.y, messages = msg, defaites = defaites})
        end
    else
        local ____temp_90 = contexte.origine == "contrat" and vrai(contexte.contrat)
        if ____temp_90 then
            local ____opt_88 = etat.contrats[cle]
            ____temp_90 = (____opt_88 and ____opt_88.id) == contexte.contrat
        end
        if ____temp_90 then
            local st = etat.contrats[cle]
            if victoire then
                st.notes = {table.unpack(contexte.bilan or ({}))}
                avancerContrat(contenu, etat, etat.heros[cle])
            else
                local ____array_91 = __TS__SparseArrayNew(table.unpack(contexte.bilan or ({})))
                __TS__SparseArrayPush(____array_91, (if combat.resultat == "defaite" then "Vous êtes repoussé. Reprenez des forces, puis revenez : le contrat tient toujours." else "Vous vous repliez. Le contrat tient toujours : revenez quand vous êtes prêt."))
                st.notes = {__TS__SparseArraySpread(____array_91)}
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
        function(____, h) return __TS__ArraySome(
            entrees(h.inventaire),
            function(____, ____bindingPattern0)
                local n
                local o
                o = ____bindingPattern0[1]
                n = ____bindingPattern0[2]
                return __TS__StringStartsWith(o, "cle-") and n > 0
            end
        ) end
    ) then
        dj.messages = {"Une lourde porte de bronze, verrouillée. Il faudrait une clé."}
        return
    end
    dj.x = nx
    dj.y = ny
    dj.messages = {}
    reveler(etat, nx, ny)
    local sortieFermee = (if (ev and ev.type) ~= "sortie" then __TS__ArrayFind(
        d.evenements,
        function(____, e) return e.type == "sortie" and e.x == nx and e.y == ny end
    ) else nil)
    if sortieFermee and (dj.defaites or 0) >= 3 and vrai(dj.abandon) then
        local cle = dj.sceneCle
        local abandon = dj.abandon
        etat.donjon = nil
        if etat.scenes[cle] then
            entrerNoeud(contenu, etat, cle, abandon)
        end
        return
    end
    if not ev then
        return
    end
    local heros = participantsGroupe(etat)
    repeat
        local ____switch337 = ev.type
        local ____cond337 = ____switch337 == "combat"
        if ____cond337 then
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
                local ____dj_messages_97 = dj.messages
                ____dj_messages_97[#____dj_messages_97 + 1] = ev.texte
            end
            return
        end
        ____cond337 = ____cond337 or ____switch337 == "coffre"
        if ____cond337 then
            do
                local ____dj_faits_98 = dj.faits
                ____dj_faits_98[#____dj_faits_98 + 1] = ev.id
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
        ____cond337 = ____cond337 or ____switch337 == "piege"
        if ____cond337 then
            do
                local ____dj_faits_99 = dj.faits
                ____dj_faits_99[#____dj_faits_99 + 1] = ev.id
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
        ____cond337 = ____cond337 or ____switch337 == "texte"
        if ____cond337 then
            if ev.unique then
                local ____dj_faits_100 = dj.faits
                ____dj_faits_100[#____dj_faits_100 + 1] = ev.id
            end
            dj.messages = {ev.texte or ""}
            return
        end
        ____cond337 = ____cond337 or ____switch337 == "sortie"
        if ____cond337 then
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
        ____cond337 = ____cond337 or ____switch337 == "scene"
        if ____cond337 then
            local ____dj_faits_101 = dj.faits
            ____dj_faits_101[#____dj_faits_101 + 1] = ev.id
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
            for ____, ____value in ipairs(entrees(g.reputation or ({}))) do
                local fac = ____value[1]
                local v = ____value[2]
                local gain = math.max(
                    1,
                    math.floor(v * f + 0.5)
                )
                etat.reputation[fac] = math.max(
                    -100,
                    math.min(100, (etat.reputation[fac] or 0) + gain)
                )
                r[#r + 1] = (((a.nom .. " : ") .. ____exports.nomFaction(fac)) .. " +") .. tostring(gain)
            end
            if vrai(g.maitrise) then
                local points = math.max(
                    1,
                    math.floor(g.maitrise * f + 0.5)
                )
                local montees = {}
                for ____, id in ipairs(competencesEquipees(contenu, h)) do
                    local avant = rangMaitrise(contenu, h.maitrise[id] or 0)
                    gagnerMaitrise(contenu, h, id, points)
                    if rangMaitrise(contenu, h.maitrise[id] or 0) > avant then
                        montees[#montees + 1] = ((contenu.competences[id].nom .. " (maîtrise ") .. tostring(rangMaitrise(contenu, h.maitrise[id]))) .. ")"
                    end
                end
                r[#r + 1] = (((a.nom .. " : +") .. tostring(points)) .. " points de maîtrise par compétence équipée") .. (if #montees > 0 then " — progrès : " .. table.concat(montees, ", ") else "")
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
    etat.mouvementsOr = {}
    if etat.mises == nil then
        etat.mises = {}
    end
    if etat.objetsConnus == nil then
        etat.objetsConnus = {}
    end
    if etat.goutsConnus == nil then
        etat.goutsConnus = {}
    end
    if etat.contrats == nil then
        etat.contrats = {}
    end
    for ____, h in ipairs(valeurs(etat.heros)) do
        if h.grimoire == nil then
            h.grimoire = {}
        end
        if h.maitrise == nil then
            h.maitrise = {}
        end
    end
    if etat.grimoire then
        repartirAncienGrimoire(contenu, etat)
    end
    if etat.repos == nil then
        etat.repos = nil
    end
    local j = etat.joueurs[action.joueur]
    if action.type ~= "rejoindre" and not j then
        refuser("Joueur inconnu : rejoignez la partie d'abord")
    end
    repeat
        local ____switch382 = action.type
        local ____cond382 = ____switch382 == "rejoindre"
        if ____cond382 then
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
                local ____etat_ordreJoueurs_102 = etat.ordreJoueurs
                ____etat_ordreJoueurs_102[#____etat_ordreJoueurs_102 + 1] = action.joueur
                if etat.meneur == nil then
                    etat.meneur = action.joueur
                end
                journal(contenu, etat, pseudo .. " rejoint la partie.")
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "presence"
        if ____cond382 then
            j.present = action.present
            for ____, ____value in ipairs(entrees(etat.scenes)) do
                local k = ____value[1]
                local es = ____value[2]
                local ____temp_105 = not es.pari
                if not ____temp_105 then
                    local ____opt_103 = ____exports.noeudCourant(contenu, etat, k)
                    ____temp_105 = not (____opt_103 and ____opt_103.pari)
                end
                if ____temp_105 then
                    continue
                end
                if __TS__ArrayEvery(
                    ____exports.joueursDuPari(etat, k),
                    function(____, x) return es.pari[x] ~= nil end
                ) then
                    resoudrePari(contenu, etat, k)
                end
            end
            break
        end
        ____cond382 = ____cond382 or ____switch382 == "creer_heros"
        if ____cond382 then
            do
                if vrai(j.herosId) then
                    refuser("Vous avez déjà un héros")
                end
                local h = action.heros
                if __TS__ArraySome(
                    ____exports.listeHeros(etat),
                    function(____, x) return x.don == h.don end
                ) then
                    local ____opt_106 = contenu.dons[h.don]
                    refuser(("Le don « " .. (____opt_106 and ____opt_106.nom or h.don)) .. " » est déjà pris par un autre joueur")
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
                    ((((((((hero.nom .. " (") .. string.lower(contenu.races[hero.race].nom)) .. ", ") .. contenu.classes[hero.classe].nom) .. ", ") .. (if hero.origine == "invoque" then "invoqué" else "réincarné")) .. ") rejoint l'histoire") .. (if niveau > 1 then " au niveau " .. tostring(niveau) else "")) .. "."
                )
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "portrait"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if vrai(action.image) and #action.image > 300000 then
                    refuser("Image trop lourde (300 Ko maximum)")
                end
                h.portrait = action.image
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "si_absent"
        if ____cond382 then
            ____exports.herosDuJoueur(etat, action.joueur).siAbsent = action.mode
            break
        end
        ____cond382 = ____cond382 or ____switch382 == "lancer_scene"
        if ____cond382 then
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
                        messages = {},
                        parole = nil
                    }
                    local ____opt_108 = etat.tempsLibre
                    if ____opt_108 and ____opt_108.resultats then
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
                        messages = {},
                        parole = nil
                    }
                    entrerNoeud(contenu, etat, h.id, s.debut)
                end
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "choisir"
        if ____cond382 then
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
                local mise = ____exports.miseDuChoix(c.choix)
                if mise > 0 and vrai(j.herosId) and etat.heros[j.herosId]["or"] < mise then
                    refuser(((("Pas assez d'or pour miser " .. tostring(mise)) .. " pièces (vous en avez ") .. tostring(etat.heros[j.herosId]["or"])) .. ")")
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
        ____cond382 = ____cond382 or ____switch382 == "repondre"
        if ____cond382 then
            do
                local es = etat.scenes[action.cle] or refuser("Aucune scène")
                local p = es.parole or refuser("Personne ne vous pose de question")
                if j.herosId ~= p.heros then
                    refuser(("C'est à " .. etat.heros[p.heros].nom) .. " de répondre")
                end
                if not __TS__ArrayIncludes(p.reponses, action.index) then
                    refuser("Réponse impossible")
                end
                repondreParole(contenu, etat, action.cle, action.index)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "parier"
        if ____cond382 then
            do
                local es = etat.scenes[action.cle] or refuser("Aucune scène")
                local n = ____exports.noeudCourant(contenu, etat, action.cle)
                if not n or not n.pari or not es.pari then
                    refuser("Aucun pari en cours")
                end
                local attendus = ____exports.joueursDuPari(etat, action.cle)
                if not __TS__ArrayIncludes(attendus, action.joueur) then
                    refuser("Vous ne participez pas à ce pari")
                end
                if es.pari[action.joueur] ~= nil then
                    refuser("Vous avez déjà répondu")
                end
                local hj = ____exports.herosDuJoueur(etat, action.joueur)
                local minimum = ____exports.partMinimaleDePari(etat, action.cle, n.pari.mise)
                if action.mise and hj["or"] < minimum then
                    refuser(((("Pas assez d'or pour miser : il faut au moins " .. tostring(minimum)) .. " pièces (vous en avez ") .. tostring(hj["or"])) .. ")")
                end
                es.pari[action.joueur] = action.mise == true
                if __TS__ArrayEvery(
                    attendus,
                    function(____, x) return es.pari[x] ~= nil end
                ) then
                    resoudrePari(contenu, etat, action.cle)
                end
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "trancher"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "continuer"
        if ____cond382 then
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
                local dest = n.suite
                for ____, a in ipairs(n.aiguillage or ({})) do
                    if ____exports.conditionScene(contenu, etat, a.si, etat.scenes[action.cle].heros) then
                        dest = a.aller
                        break
                    end
                end
                entrerNoeud(contenu, etat, action.cle, dest)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "quitter_scene"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "combat"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "second_depart"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "fin_combat"
        if ____cond382 then
            do
                local entree = etat.combats[action.cle] or refuser("Aucun combat")
                if not entree.combat.resultat then
                    refuser("Le combat n'est pas terminé")
                end
                apresCombat(contenu, etat, action.cle)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "donjon_deplacer"
        if ____cond382 then
            local ____temp_112 = etat.meneur ~= action.joueur
            if ____temp_112 then
                local ____opt_110 = etat.joueurs[etat.meneur or ""]
                ____temp_112 = ____opt_110 and ____opt_110.present
            end
            if ____temp_112 then
                refuser("C'est le meneur du jour qui guide le groupe")
            end
            deplacerDonjon(contenu, etat, action.dx, action.dy)
            break
        end
        ____cond382 = ____cond382 or ____switch382 == "temps_libre"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "valider_temps_libre"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "jour_passe"
        if ____cond382 then
            do
                if action.jour ~= etat.jour then
                    refuser("Ce jour est déjà passé")
                end
                if not ____exports.jourPeutPasser(contenu, etat) then
                    refuser("Dernier jour du mois : pour changer de mois, dormez à l'auberge")
                end
                avancerTemps(contenu, etat, 1)
                local fete = fetesEntre(contenu, etat.jour - 1, etat.jour)[1]
                local ____etat_dernieresNouvelles_113 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_113[#____etat_dernieresNouvelles_113 + 1] = (if fete then ("Un nouveau jour se lève : " .. fete.nom) .. " !" else ("Un nouveau jour se lève : " .. formaterDate(contenu, etat.jour)) .. ".")
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "proposer_repos"
        if ____cond382 then
            do
                ____exports.herosDuJoueur(etat, action.joueur)
                local pb = reposImpossible(etat)
                if vrai(pb) then
                    refuser(pb)
                end
                local mois = action.mois or 0
                local jusqua = etat.jour + mois * joursParMois(contenu)
                if action.histoire == true then
                    local d = ____exports.prochaineDateHistoire(contenu, etat) or refuser("L'histoire n'attend aucune date pour le moment")
                    jusqua = d.jour
                    mois = math.max(
                        1,
                        math.floor((d.jour - etat.jour) / joursParMois(contenu) + 0.5)
                    )
                elseif not __TS__ArrayIncludes(contenu.config.ellipses.durees_auberge_mois, mois) then
                    refuser("Durée de repos non proposée")
                end
                etat.repos = {par = action.joueur, mois = mois, jusqua = jusqua, accords = {action.joueur}}
                if #____exports.attenteRepos(etat) == 0 then
                    commencerRepos(contenu, etat)
                else
                    local ____etat_dernieresNouvelles_114 = etat.dernieresNouvelles
                    ____etat_dernieresNouvelles_114[#____etat_dernieresNouvelles_114 + 1] = ((((j.pseudo .. " propose de dormir ") .. tostring(mois)) .. " mois à l'auberge. En attente de : ") .. table.concat(
                        __TS__ArrayMap(
                            ____exports.attenteRepos(etat),
                            function(____, x) return etat.joueurs[x].pseudo end
                        ),
                        ", "
                    )) .. "."
                end
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "repondre_repos"
        if ____cond382 then
            do
                local r = etat.repos or refuser("Personne ne propose de dormir pour le moment")
                ____exports.herosDuJoueur(etat, action.joueur)
                if not action.accepte then
                    etat.repos = nil
                    local ____etat_dernieresNouvelles_115 = etat.dernieresNouvelles
                    ____etat_dernieresNouvelles_115[#____etat_dernieresNouvelles_115 + 1] = ((j.pseudo .. " préfère ne pas dormir ") .. tostring(r.mois)) .. " mois. Proposez une autre durée."
                    break
                end
                local pb = reposImpossible(etat)
                if vrai(pb) then
                    refuser(pb)
                end
                if not __TS__ArrayIncludes(r.accords, action.joueur) then
                    local ____r_accords_116 = r.accords
                    ____r_accords_116[#____r_accords_116 + 1] = action.joueur
                end
                if #____exports.attenteRepos(etat) == 0 then
                    commencerRepos(contenu, etat)
                end
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "cadeau"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if not __TS__ArrayIncludes(etat.compagnonsRencontres, action.compagnon) then
                    refuser("Vous ne connaissez pas encore ce personnage")
                end
                if not ((h.inventaire[action.objet] or 0) > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                local a = ____exports.affinite(etat, h.id, action.compagnon)
                if not peutOffrir(contenu, a, etat.jour) then
                    refuser(("Un cadeau tous les " .. tostring(contenu.config.affinite.jours_entre_cadeaux)) .. " jours au plus")
                end
                local ____h_inventaire_117, ____action_objet_118 = h.inventaire, action.objet
                ____h_inventaire_117[____action_objet_118] = ____h_inventaire_117[____action_objet_118] - 1
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
                decouvrirGout(etat, action.compagnon, action.objet)
                local ____etat_dernieresNouvelles_119 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_119[#____etat_dernieresNouvelles_119 + 1] = (((((contenu.compagnons[action.compagnon].nom .. " ") .. ({prefere = "adore", apprecie = "apprécie", neutre = "accepte poliment", deteste = "n'aime pas du tout"})[r]) .. " ce cadeau (") .. (if d >= 0 then "+" else "")) .. tostring(d)) .. ")."
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "equipe"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "equiper"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local o = contenu.objets[action.objet] or refuser("Objet inconnu")
                if not ((h.inventaire[o.id] or 0) > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                local probleme = problemeEquipement(contenu, h, o)
                if probleme ~= nil then
                    refuser(probleme)
                end
                local emplacement = o.emplacement
                local ancien = h.equipement[emplacement]
                if vrai(ancien) then
                    h.inventaire[ancien] = (h.inventaire[ancien] or 0) + 1
                end
                local ____h_inventaire_120, ____o_id_121 = h.inventaire, o.id
                ____h_inventaire_120[____o_id_121] = ____h_inventaire_120[____o_id_121] - 1
                h.equipement[emplacement] = o.id
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "desequiper"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "acheter"
        if ____cond382 then
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
                local n = quantiteValide(action.quantite)
                local ____opt_122 = contenu.objets[action.objet]
                if ____opt_122 and ____opt_122.unique_par_partie and (n > 1 or dejaUnique(contenu, etat, action.objet)) then
                    refuser("Cet objet est unique : il n'en existe qu'un dans la partie")
                end
                local prix = ____exports.prixAchat(contenu, h, action.objet) * n
                if h["or"] < prix then
                    refuser("Pas assez d'or")
                end
                h["or"] = h["or"] - prix
                h.inventaire[action.objet] = (h.inventaire[action.objet] or 0) + n
                local ____etat_dernieresNouvelles_124 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_124[#____etat_dernieresNouvelles_124 + 1] = (((((h.nom .. " achète ") .. (if n > 1 then tostring(n) .. " × " else "")) .. contenu.objets[action.objet].nom) .. " : −") .. tostring(prix)) .. " or."
                decouvrirObjet(contenu, etat, action.objet)
                declencherEtapes(
                    contenu,
                    etat,
                    function(d) return d.acheter == action.lieu end
                )
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "vendre"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local o = contenu.objets[action.objet] or refuser("Objet inconnu")
                if not ((h.inventaire[o.id] or 0) > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                if o.type == "quete" then
                    refuser("On ne vend pas un objet de quête")
                end
                local n = quantiteValide(action.quantite)
                if (h.inventaire[o.id] or 0) < n then
                    refuser("Vous n'en avez que " .. tostring(h.inventaire[o.id]))
                end
                local gain = ____exports.prixVente(contenu, h, o.id) * n
                local ____h_inventaire_125, ____o_id_126 = h.inventaire, o.id
                ____h_inventaire_125[____o_id_126] = ____h_inventaire_125[____o_id_126] - n
                h["or"] = h["or"] + gain
                local ____etat_dernieresNouvelles_127 = etat.dernieresNouvelles
                ____etat_dernieresNouvelles_127[#____etat_dernieresNouvelles_127 + 1] = (((((h.nom .. " vend ") .. (if n > 1 then tostring(n) .. " × " else "")) .. o.nom) .. " : +") .. tostring(gain)) .. " or."
                declencherEtapes(
                    contenu,
                    etat,
                    function(d) return d.vendre == true end
                )
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "identifier"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local o = contenu.objets[action.objet] or refuser("Objet inconnu")
                local expert = contenu.pnj[action.pnj] or refuser("Personnage inconnu")
                local prix = expert.identifie or refuser(expert.nom .. " n'identifie pas les objets")
                if __TS__ArrayIncludes(etat.pnjMorts, action.pnj) then
                    refuser(expert.nom .. " n'est plus là")
                end
                if not o.mystere then
                    refuser("Cet objet n'a rien de mystérieux")
                end
                if ____exports.objetConnu(contenu, etat, o.id) then
                    refuser("Vous savez déjà ce que c'est")
                end
                if h["or"] < prix then
                    refuser(("Pas assez d'or : l'identification coûte " .. tostring(prix)) .. " pièces")
                end
                h["or"] = h["or"] - prix
                local ____etat_mouvementsOr_128 = etat.mouvementsOr
                ____etat_mouvementsOr_128[#____etat_mouvementsOr_128 + 1] = {heros = h.id, montant = -prix, raison = "identification"}
                decouvrirObjet(contenu, etat, o.id)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "utiliser"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if not ((h.inventaire[action.objet] or 0) > 0) then
                    refuser("Vous n'avez pas cet objet")
                end
                if action.objet == "potion-soin" or action.objet == "potion-soin-petite" then
                    refuser("Les potions se boivent en combat (les PV remontent au maximum après chaque combat)")
                end
                refuser("Cet objet ne s'utilise pas hors combat")
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "repartir"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "ameliorer"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "branche"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "contrat"
        if ____cond382 then
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
                if #ct.etapes > 0 then
                    if etat.contrats[h.id] then
                        local ____opt_129 = contenu.contrats[etat.contrats[h.id].id]
                        refuser("Terminez d'abord votre contrat en cours : " .. (____opt_129 and ____opt_129.titre or ""))
                    end
                    etat.contrats[h.id] = {id = ct.id, etape = 0, notes = {}}
                    local ____etat_dernieresNouvelles_131 = etat.dernieresNouvelles
                    ____etat_dernieresNouvelles_131[#____etat_dernieresNouvelles_131 + 1] = (("Contrat accepté : " .. ct.titre) .. ". ") .. ct.etapes[1].objectif
                elseif vrai(ct.rencontre) then
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
        ____cond382 = ____cond382 or ____switch382 == "etape_contrat"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local x = ____exports.etapeContrat(contenu, etat, h.id) or refuser("Vous n'avez pas de contrat en cours")
                local st = etat.contrats[h.id]
                local e = x.etape
                if etat.combats[h.id] then
                    refuser("Vous êtes déjà en combat")
                end
                if vrai(e.combat) then
                    st.notes = {}
                    lancerCombat(
                        contenu,
                        etat,
                        e.combat,
                        h.id,
                        {
                            cle = h.id,
                            origine = "contrat",
                            sceneCle = nil,
                            victoire = nil,
                            defaite = nil,
                            evenementDonjon = nil,
                            contrat = x.contrat.id,
                            bilan = nil
                        },
                        e.lieu
                    )
                    break
                end
                if e.test then
                    local jet = de(etat.rng, 20)
                    local total = jet + caracsTotales(contenu, h)[e.test.carac]
                    local detail = (((((((e.test.carac .. " : dé ") .. tostring(jet)) .. " + ") .. tostring(total - jet)) .. " = ") .. tostring(total)) .. " contre ") .. tostring(e.test.difficulte)
                    if jet == 20 or jet ~= 1 and total >= e.test.difficulte then
                        st.notes = {(("Réussi (" .. detail) .. "). ") .. e.test.reussite}
                        avancerContrat(contenu, etat, h)
                    else
                        local msgs = {}
                        appliquerConsequence(
                            contenu,
                            etat,
                            {xp = math.floor(x.contrat.recompenses.xp / 3 + 0.5)},
                            {h.id},
                            msgs
                        )
                        __TS__Delete(etat.contrats, h.id)
                        __TS__ArrayPush(
                            etat.dernieresNouvelles,
                            ((("Contrat raté (" .. detail) .. "). ") .. e.test.echec) .. " Vous en tirez quand même une leçon.",
                            table.unpack(msgs)
                        )
                    end
                    break
                end
                if #e.choix > 0 then
                    local ch = e.choix[(action.choix or -1) + 1] or refuser("Choisissez une des réponses proposées")
                    local msgs = {}
                    for ____, eff in ipairs(ch.effets) do
                        appliquerConsequence(
                            contenu,
                            etat,
                            eff,
                            {h.id},
                            msgs
                        )
                    end
                    st.notes = (if vrai(ch.resultat) then {
                        ch.resultat,
                        table.unpack(msgs)
                    } else msgs)
                    avancerContrat(contenu, etat, h)
                    break
                end
                st.notes = {}
                avancerContrat(contenu, etat, h)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "abandonner_contrat"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if not etat.contrats[h.id] then
                    refuser("Vous n'avez pas de contrat en cours")
                end
                if etat.combats[h.id] then
                    refuser("Terminez d'abord le combat")
                end
                __TS__Delete(etat.contrats, h.id)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "meneur"
        if ____cond382 then
            if not etat.joueurs[action.nouveau] then
                refuser("Joueur inconnu")
            end
            etat.meneur = action.nouveau
            break
        end
        ____cond382 = ____cond382 or ____switch382 == "nouvelle_session"
        if ____cond382 then
            do
                etat.session = etat.session + 1
                local idx = __TS__ArrayIndexOf(etat.ordreJoueurs, etat.meneur or "")
                etat.meneur = etat.ordreJoueurs[(idx + 1) % #etat.ordreJoueurs + 1] or nil
                local ____journal_136 = journal
                local ____contenu_135 = contenu
                local ____etat_session_134 = etat.session
                local ____opt_132 = etat.joueurs[etat.meneur or ""]
                ____journal_136(
                    ____contenu_135,
                    etat,
                    ((("Session " .. tostring(____etat_session_134)) .. " : ") .. (____opt_132 and ____opt_132.pseudo or "?")) .. " est le meneur du jour."
                )
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "fusionner"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local id = idFusion(action.parent, action.secondaire)
                local t = h.grimoire[id]
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
                local ____opt_137 = entree
                local acteur = ____opt_137 and __TS__ArrayFind(
                    entree and entree.combat.combattants,
                    function(____, c) return c.herosId == h.id and c.type == "heros" end
                )
                if vrai(action.cle) and (not entree or not acteur or entree.combat.enAttente ~= acteur.id) then
                    refuser("Ce n'est pas votre tour")
                end
                if not h.grimoire[id] then
                    h.grimoire[id] = t
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
                        local ____acteur_competencesPropres_141 = acteur.competencesPropres
                        ____acteur_competencesPropres_141[#____acteur_competencesPropres_141 + 1] = __TS__ObjectAssign({}, t)
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
        ____cond382 = ____cond382 or ____switch382 == "apprendre_technique"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local t = nil
                local connues = connuesDe(contenu, h)
                for ____, a in ipairs(connues) do
                    for ____, b in ipairs(connues) do
                        if t == nil and a ~= b and idFusion(a, b) == action.technique then
                            local r = creerTechnique(contenu, a, b, h.nom)
                            if not r.ok then
                                refuser(r.raison)
                            end
                            t = r.technique
                        end
                    end
                end
                if t == nil then
                    return refuser("Votre classe ne peut pas apprendre cette fusion")
                end
                local pb = peutApprendre(contenu, h, t)
                if vrai(pb) then
                    refuser(pb)
                end
                apprendre(h, t)
                h.grimoire[t.id] = t
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "oublier_variante"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                local t = h.grimoire[action.technique] or refuser("Technique inconnue")
                h.variantes[t.parent] = __TS__ArrayFilter(
                    h.variantes[t.parent] or ({}),
                    function(____, x) return x ~= t.id end
                )
                if h.varianteActive[t.parent] == t.id then
                    h.varianteActive[t.parent] = nil
                end
                __TS__Delete(h.grimoire, t.id)
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "variante_active"
        if ____cond382 then
            do
                local h = ____exports.herosDuJoueur(etat, action.joueur)
                if vrai(action.technique) and not __TS__ArrayIncludes(h.variantes[action.competence] or ({}), action.technique) then
                    refuser("Variante non apprise")
                end
                h.varianteActive[action.competence] = action.technique
                break
            end
        end
        ____cond382 = ____cond382 or ____switch382 == "equiper_competences"
        if ____cond382 then
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
        ____cond382 = ____cond382 or ____switch382 == "chapitre_suivant"
        if ____cond382 then
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
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local ____exports = {}
local ____partie = require("src.moteur.partie")
local conditionHeros = ____partie.conditionHeros
local etapeContrat = ____partie.etapeContrat
local listeHeros = ____partie.listeHeros
local scenesDisponibles = ____partie.scenesDisponibles
local sceneEstDisponible = ____partie.sceneEstDisponible
local ____personnage = require("src.moteur.personnage")
local niveauMoyen = ____personnage.niveauMoyen
local ____outils = require("src.moteur.outils")
local entrees = ____outils.entrees
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
local ____temps = require("src.moteur.temps")
local versJour = ____temps.versJour
--- Un bureau de la Guilde (Lysmont, ou ses comptoirs dans les autres régions : `guilde-…`) : contrats et fusions.
function ____exports.estGuilde(lieu)
    return lieu == "guilde" or __TS__StringStartsWith(lieu, "guilde-")
end
--- Lieu de n'importe quelle région, et l'id de sa région.
function ____exports.trouverLieu(contenu, id)
    for ____, r in ipairs(valeurs(contenu.regions)) do
        local l = __TS__ArrayFind(
            r.lieux,
            function(____, x) return x.id == id end
        )
        if l then
            return {lieu = l, region = r.id}
        end
    end
    return nil
end
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
    local ec = (if vrai(herosId) then etapeContrat(contenu, etat, herosId) else nil)
    if ec and ec.etape.lieu == lieu and vrai(ec.etape.combat) then
        return true
    end
    if ____exports.estGuilde(lieu) and vrai(herosId) then
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
        local ____opt_2 = scene and scene.disponible_si
        local dateMin = ____opt_2 and ____opt_2.date_min
        local jourMin = (if dateMin then versJour(contenu, dateMin) else nil)
        return {
            objectif = e.objectif,
            lieu = lieu,
            nomLieu = nomDuLieu(contenu, lieu),
            disponible = not not scene and sceneEstDisponible(contenu, etat, scene, herosId),
            attenteJour = (if jourMin ~= nil and jourMin > etat.jour then jourMin else nil)
        }
    end
    local debut = __TS__ArrayFind(
        valeurs(contenu.scenes),
        function(____, s)
            local ____vrai_result_8 = vrai(s.quete)
            if ____vrai_result_8 then
                local ____opt_6 = contenu.quetes[s.quete]
                ____vrai_result_8 = (____opt_6 and ____opt_6.type) == "principale"
            end
            return ____vrai_result_8 and sceneEstDisponible(contenu, etat, s, herosId)
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
        disponible = true,
        attenteJour = nil
    }
end
local function marqueurScene(contenu, s)
    if s.rend_quete then
        return "rendre"
    end
    local ____vrai_result_13 = vrai(s.quete)
    if ____vrai_result_13 then
        local ____opt_11 = contenu.quetes[s.quete]
        ____vrai_result_13 = (____opt_11 and ____opt_11.type) == "principale"
    end
    if ____vrai_result_13 then
        return "principale"
    end
    return "secondaire"
end
local function plusImportant(a, b)
    if a == nil then
        return b
    end
    local ordre = {"secondaire", "rendre", "principale"}
    return (if __TS__ArrayIndexOf(ordre, b) > __TS__ArrayIndexOf(ordre, a) then b else a)
end
--- Scènes disponibles dans ce lieu qui se lancent en parlant à ce PNJ.
function ____exports.scenesDuPnj(contenu, etat, lieu, pnj, herosId)
    return __TS__ArrayFilter(
        scenesDisponibles(contenu, etat, lieu, herosId),
        function(____, s) return s.pnj == pnj end
    )
end
--- Symbole à afficher au-dessus d'un PNJ (null : rien d'important à dire).
function ____exports.marqueurPnj(contenu, etat, lieu, pnj, herosId)
    local res = nil
    for ____, s in ipairs(____exports.scenesDuPnj(
        contenu,
        etat,
        lieu,
        pnj,
        herosId
    )) do
        res = plusImportant(
            res,
            marqueurScene(contenu, s)
        )
    end
    return res
end
--- Symbole à afficher sur un lieu de la carte ou du plan (le plus important de ses scènes).
function ____exports.marqueurLieu(contenu, etat, lieu, herosId)
    local res = nil
    for ____, s in ipairs(scenesDisponibles(contenu, etat, lieu, herosId)) do
        res = plusImportant(
            res,
            marqueurScene(contenu, s)
        )
    end
    return res
end
--- Joueurs qui ne participeront pas à une scène de groupe lancée maintenant (absents dont le héros reste au camp, ou sans héros).
function ____exports.absentsDuGroupe(etat)
    local res = {}
    for ____, j in ipairs(etat.ordreJoueurs) do
        local joueur = etat.joueurs[j]
        local h = (if vrai(joueur.herosId) then etat.heros[joueur.herosId] else nil)
        if not h then
            res[#res + 1] = joueur.pseudo .. " (pas encore de héros)"
        elseif not joueur.present then
            res[#res + 1] = ((joueur.pseudo .. " (absent : ") .. (if h.siAbsent == "ia" then "son héros sera joué par l'ordinateur" else "son héros reste au camp")) .. ")"
        end
    end
    return res
end
--- Lieux où mène une étape en cours (quêtes de la partie, contrat du héros) : ils clignotent sur la carte.
-- Les lieux « etape_seulement » ne sont visibles que s'ils sont dans cette liste.
function ____exports.lieuxDesEtapes(contenu, etat, herosId)
    local res = {}
    for ____, ____value in ipairs(entrees(etat.quetes)) do
        local id = ____value[1]
        local q = ____value[2]
        local def = contenu.quetes[id]
        if not def or q.terminee then
            continue
        end
        local e = __TS__ArrayFind(
            def.etapes,
            function(____, x) return x.id == q.etape end
        )
        local ____e_lieu_16 = e.lieu
        if ____e_lieu_16 == nil then
            local ____opt_14 = contenu.scenes[e.scene]
            ____e_lieu_16 = (if vrai(e.scene) then ____opt_14 and ____opt_14.lieu else nil)
        end
        local lieu = (if e then ____e_lieu_16 else nil)
        if vrai(lieu) and not __TS__ArrayIncludes(res, lieu) then
            res[#res + 1] = lieu
        end
    end
    local ec = (if vrai(herosId) then etapeContrat(contenu, etat, herosId) else nil)
    if ec and not __TS__ArrayIncludes(res, ec.etape.lieu) then
        res[#res + 1] = ec.etape.lieu
    end
    return res
end
--- Niveau du groupe : la moyenne des niveaux des héros (arrondie à l'inférieur).
function ____exports.niveauGroupe(etat)
    return niveauMoyen(listeHeros(etat))
end
function ____exports.couleurNiveau(conseille, groupe)
    local manque = conseille - groupe
    if manque <= 0 then
        return "vert"
    end
    return (if manque <= 2 then "orange" else "rouge")
end
--- Phrase d'aide affichée à côté du niveau conseillé.
function ____exports.aideNiveau(conseille, groupe)
    local debut = ((("Conseillé : niveau " .. tostring(conseille)) .. ". Votre groupe : niveau ") .. tostring(groupe)) .. "."
    local couleur = ____exports.couleurNiveau(conseille, groupe)
    if couleur == "vert" then
        return debut .. " Vous avez le niveau."
    end
    if couleur == "orange" then
        return debut .. " Ce sera difficile : entraînez-vous ou faites d'abord des contrats plus faciles."
    end
    return debut .. " C'est bien trop fort pour l'instant : entraînez-vous ou faites d'abord des contrats plus faciles."
end
--- Niveau conseillé d'une quête : celui de son étape en cours si elle en a un, sinon celui de la quête.
function ____exports.niveauQuete(contenu, etat, queteId)
    local def = contenu.quetes[queteId]
    local e = __TS__ArrayFind(
        def.etapes,
        function(____, x)
            local ____x_id_19 = x.id
            local ____opt_17 = etat.quetes[queteId]
            return ____x_id_19 == (____opt_17 and ____opt_17.etape)
        end
    )
    return e and e.niveau or def.niveau
end
--- Niveau conseillé d'une scène : celui de l'étape de quête qui la lance (null : scène sans quête).
function ____exports.niveauScene(contenu, s)
    if not vrai(s.quete) then
        return nil
    end
    local def = contenu.quetes[s.quete]
    if not def then
        return nil
    end
    local ____opt_22 = __TS__ArrayFind(
        def.etapes,
        function(____, x) return x.scene == s.id end
    )
    return ____opt_22 and ____opt_22.niveau or def.niveau
end
--- Niveau conseillé le plus élevé parmi les étapes en cours qui mènent à ce lieu (quêtes, contrat du héros) ; null s'il n'y en a pas.
function ____exports.niveauDuLieu(contenu, etat, lieu, herosId)
    local res = nil
    local function garder(n)
        if res == nil or n > res then
            res = n
        end
    end
    for ____, ____value in ipairs(entrees(etat.quetes)) do
        local id = ____value[1]
        local q = ____value[2]
        local def = contenu.quetes[id]
        if not def or q.terminee then
            continue
        end
        local e = __TS__ArrayFind(
            def.etapes,
            function(____, x) return x.id == q.etape end
        )
        local ____e_lieu_26 = e.lieu
        if ____e_lieu_26 == nil then
            local ____opt_24 = contenu.scenes[e.scene]
            ____e_lieu_26 = (if vrai(e.scene) then ____opt_24 and ____opt_24.lieu else nil)
        end
        local l = (if e then ____e_lieu_26 else nil)
        if l == lieu then
            garder(e and e.niveau or def.niveau)
        end
    end
    local ec = (if vrai(herosId) then etapeContrat(contenu, etat, herosId) else nil)
    if ec and ec.etape.lieu == lieu then
        garder(ec.contrat.niveau)
    end
    return res
end
return ____exports
 end,
["src.sauvegarde.migrations"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Delete = ____lualib.__TS__Delete
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
local ____exports = {}
local ____partie = require("src.moteur.partie")
local VERSION_ETAT = ____partie.VERSION_ETAT
local ____outils = require("src.moteur.outils")
local cles = ____outils.cles
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
____exports.migrations = {
    [1] = function(s)
        local ____s_depart_0, ____grimoire_1 = s.depart, "grimoire"
        if ____s_depart_0[____grimoire_1] == nil then
            ____s_depart_0[____grimoire_1] = {}
        end
        s.version = 2
        return s
    end,
    [2] = function(s)
        local ____s_depart_2, ____repos_3 = s.depart, "repos"
        if ____s_depart_2[____repos_3] == nil then
            ____s_depart_2[____repos_3] = nil
        end
        s.version = 3
        return s
    end,
    [3] = function(s)
        local d = s.depart
        if d.grimoire and #cles(d.grimoire) == 0 then
            __TS__Delete(d, "grimoire")
        end
        if d.mises == nil then
            d.mises = {}
        end
        if d.mouvementsOr == nil then
            d.mouvementsOr = {}
        end
        s.version = 4
        return s
    end,
    [4] = function(s)
        local ____s_depart_4, ____contrats_5 = s.depart, "contrats"
        if ____s_depart_4[____contrats_5] == nil then
            ____s_depart_4[____contrats_5] = {}
        end
        s.version = 5
        return s
    end,
    [5] = function(s)
        local d = s.depart
        if d.objetsConnus == nil then
            d.objetsConnus = {}
        end
        if d.goutsConnus == nil then
            d.goutsConnus = {}
        end
        s.version = 6
        return s
    end
}
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
["src.moteur.fiche"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local ____exports = {}
local ____personnage = require("src.moteur.personnage")
local caracsTotales = ____personnage.caracsTotales
local ____outils = require("src.moteur.outils")
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
--- Nom complet et effet réel de chaque caractéristique (voir CONCEPTION § 3.2 et 3.3).
____exports.AIDE_CARACS = {
    FOR = {nom = "Force", effet = "augmente les dégâts des attaques et des compétences de corps à corps qui utilisent la Force (+5 % par point)."},
    AGI = {nom = "Agilité", effet = "fait agir plus tôt, toucher plus souvent (+2 % par point d'écart avec la cible), esquiver, et réussir plus de coups critiques (+0,5 % par point)."},
    INT = {nom = "Intelligence", effet = "augmente les dégâts des sorts et des compétences qui utilisent l'Intelligence (+5 % par point)."},
    VIT = {nom = "Vitalité", effet = "donne des points de vie (+5 PV par point) et réduit les dégâts physiques reçus."},
    ESP = {nom = "Esprit", effet = "donne du mana (+3 par point), le fait revenir plus vite, renforce les soins et réduit les dégâts magiques reçus."},
    CHA = {nom = "Charisme", effet = "donne de la « présence » en combat (±1 % de dégâts infligés et subis par point au-dessus ou au-dessous de 10) et aide dans les dialogues et le commerce."}
}
____exports.NOMS_ELEMENTS = {
    physique = "physique",
    feu = "feu",
    glace = "glace",
    foudre = "foudre",
    sacre = "sacré",
    ombre = "ombre",
    poison = "poison",
    arcane = "arcane"
}
____exports.NOMS_CIBLES = {
    ennemi = "un ennemi",
    tous_ennemis = "tous les ennemis",
    ennemi_aleatoire = "un ennemi au hasard",
    allie = "un allié",
    allie_ko = "un allié K.O.",
    tous_allies = "tout le groupe",
    soi = "soi-même"
}
local NOMS_ETATS_AIDE = {
    brulure = "brûlure",
    poison = "poison",
    gel = "gel (agit plus tard)",
    immobilise = "immobilisé (perd son tour)",
    sommeil = "sommeil",
    peur = "peur (peut perdre son tour)",
    silence = "silence (plus de compétences)",
    provoque = "provoqué",
    marque = "marqué (subit plus de dégâts)",
    furtif = "invisible",
    bonus_degats = "dégâts augmentés",
    bonus_defense = "défense augmentée",
    bonus_initiative = "initiative augmentée",
    bonus_precision = "précision augmentée",
    malus_defense = "défense réduite",
    regeneration = "régénération",
    garde = "en garde",
    expose = "exposé",
    affaibli = "affaibli (frappe moins fort)"
}
function ____exports.sujetHeros(contenu, h)
    local cl = contenu.classes[h.classe]
    local puissance = cl.attaque.puissance
    for ____, slot in ipairs(valeurs(h.equipement)) do
        local o = (if vrai(slot) then contenu.objets[slot] else nil)
        local ____opt_0 = o and o.bonus
        puissance = puissance + (____opt_0 and ____opt_0.puissance or 0)
    end
    return {
        caracs = caracsTotales(contenu, h),
        attaque = {stat = cl.attaque.stat, puissance = puissance}
    }
end
--- Réduction d'une « cible moyenne » (Vitalité 10, Esprit 10, sans armure) : sert seulement à donner un ordre de grandeur.
local REDUCTION_MOYENNE = 100 / 120
local function fourchette(contenu, net)
    local v = contenu.config.combat.variance_degats
    return {
        math.max(
            1,
            math.floor(net * (1 - v) + 0.5)
        ),
        math.max(
            1,
            math.floor(net * (1 + v) + 0.5)
        )
    }
end
local function tours(n)
    return (tostring(n) .. " tour") .. (if n > 1 then "s" else "")
end
--- Chiffres d'une compétence pour ce sujet, au rang donné. Hors combat : contre une cible moyenne.
function ____exports.chiffresCompetence(contenu, s, comp, rang, maitrise)
    if maitrise == nil then
        maitrise = 0
    end
    local k = contenu.config.combat
    local m = contenu.config.maitrise
    local facteurRang = (1 + 0.1 * (rang - 1)) * (1 + m.degats_par_rang * maitrise)
    local toucher = math.min(
        k.toucher_max,
        math.max(
            k.toucher_min,
            k.toucher_base - math.min(
                k.toucher_malus_max,
                math.max(0, comp.cout - k.toucher_mana_gratuit) * k.toucher_malus_par_mana
            ) + m.toucher_par_rang * maitrise
        )
    )
    local presence = 1 + 0.01 * (s.caracs.CHA - 10)
    local res = {
        cout = comp.cout,
        recharge = comp.recharge,
        cible = ____exports.NOMS_CIBLES[comp.cible] or comp.cible,
        element = nil,
        degats = nil,
        soin = nil,
        toucher = nil,
        effets = {}
    }
    for ____, ef in ipairs(comp.effets) do
        if ef.type == "degats" then
            local net = ef.puissance * facteurRang * (1 + s.caracs[ef.stat] / 20) * presence * REDUCTION_MOYENNE * ef.coups
            local f = fourchette(contenu, net)
            res.degats = (if res.degats == nil then f else {res.degats[1] + f[1], res.degats[2] + f[2]})
            if res.element == nil then
                res.element = ____exports.NOMS_ELEMENTS[ef.element] or ef.element
            end
            if res.toucher == nil then
                res.toucher = toucher
            end
            if ef.coups > 1 then
                local ____res_effets_4 = res.effets
                ____res_effets_4[#____res_effets_4 + 1] = tostring(ef.coups) .. " coups"
            end
            if ef.critique_garanti then
                local ____res_effets_5 = res.effets
                ____res_effets_5[#____res_effets_5 + 1] = "coup critique garanti"
            end
            if vrai(ef.executer_sous_pourcent) then
                local ____res_effets_6 = res.effets
                ____res_effets_6[#____res_effets_6 + 1] = ("dégâts doublés si la cible a moins de " .. tostring(math.floor(ef.executer_sous_pourcent * 100 + 0.5))) .. " % de ses PV"
            end
            if vrai(ef.cout_pv_pourcent) then
                local ____res_effets_7 = res.effets
                ____res_effets_7[#____res_effets_7 + 1] = ("coûte " .. tostring(math.floor(ef.cout_pv_pourcent * 100 + 0.5))) .. " % de tes PV"
            end
        elseif ef.type == "soin" then
            res.soin = math.floor(ef.puissance * facteurRang * (1 + s.caracs[ef.stat] / 20) + 0.5)
        elseif ef.type == "etat" then
            local surSoi = (ef.cible or comp.cible) == "soi"
            local duree = (if surSoi then math.max(1, ef.duree - 1) else ef.duree)
            local texte = ((NOMS_ETATS_AIDE[ef.etat] or ef.etat) .. " pendant ") .. tours(duree)
            if ef.etat == "poison" or ef.etat == "brulure" then
                local parTour = math.max(
                    1,
                    math.floor(ef.valeur * facteurRang * (1 + s.caracs[s.attaque.stat] / 40) + 0.5)
                )
                texte = texte .. (((" (" .. tostring(parTour)) .. " dégâts par tour") .. (if ef.cumul_max > 1 then (", cumulable " .. tostring(ef.cumul_max)) .. " fois" else "")) .. ")"
            elseif ef.valeur > 0 and ef.valeur < 1 then
                texte = texte .. (" (" .. tostring(math.floor(ef.valeur * 100 + 0.5))) .. " %)"
            end
            if ef.chance < 1 then
                texte = (tostring(math.floor(ef.chance * 100 + 0.5)) .. " % de chance : ") .. texte
            end
            local ____res_effets_8 = res.effets
            ____res_effets_8[#____res_effets_8 + 1] = texte
            if ef.etat == "furtif" then
                local net = s.attaque.puissance * (1 + s.caracs[s.attaque.stat] / 20) * presence * REDUCTION_MOYENNE * contenu.config.combat.multiplicateur_critique
                local f = fourchette(contenu, net)
                local ____res_effets_9 = res.effets
                ____res_effets_9[#____res_effets_9 + 1] = ((("ta prochaine attaque est un coup critique garanti (environ " .. tostring(f[1])) .. " à ") .. tostring(f[2])) .. " dégâts)"
            end
        elseif ef.type == "bouclier" then
            local ____res_effets_10 = res.effets
            ____res_effets_10[#____res_effets_10 + 1] = ("bouclier de " .. tostring(math.floor(ef.pourcent_pv * facteurRang * 100 + 0.5))) .. " % des PV"
        elseif ef.type == "invocation" then
            local ____res_effets_13 = res.effets
            local ____opt_11 = contenu.ennemis[ef.creature]
            ____res_effets_13[#____res_effets_13 + 1] = (("invoque : " .. (____opt_11 and ____opt_11.nom or ef.creature)) .. " pendant ") .. tours(ef.duree)
        elseif ef.type == "purifier" then
            local ____res_effets_14 = res.effets
            ____res_effets_14[#____res_effets_14 + 1] = "retire les effets négatifs"
        elseif ef.type == "charge_rune" then
            local ____res_effets_15 = res.effets
            ____res_effets_15[#____res_effets_15 + 1] = ((("+" .. tostring(ef.nombre)) .. " charge") .. (if ef.nombre > 1 then "s" else "")) .. " de rune"
        elseif ef.type == "mana" then
            local ____res_effets_16 = res.effets
            ____res_effets_16[#____res_effets_16 + 1] = ("rend " .. tostring(ef.valeur)) .. " mana"
        elseif ef.type == "soigner_invocations" then
            local ____res_effets_17 = res.effets
            ____res_effets_17[#____res_effets_17 + 1] = ("soigne tes invocations de " .. tostring(math.floor(ef.pourcent * 100 + 0.5))) .. " % de leurs PV"
        elseif ef.type == "relever" then
            local ____res_effets_18 = res.effets
            ____res_effets_18[#____res_effets_18 + 1] = ("relève un allié K.O. à " .. tostring(math.floor(ef.pourcent_pv * 100 + 0.5))) .. " % de ses PV"
        end
    end
    return res
end
--- D'où vient cette compétence pour ce héros (phrase courte).
function ____exports.origineCompetence(contenu, h, id)
    local cl = contenu.classes[h.classe]
    local article = (if __TS__StringIncludes(
        "AEIOUY",
        string.sub(cl.nom, 1, 1)
    ) then "l'" else (if __TS__StringStartsWith(cl.nom, "Lame") then "la " else "le "))
    local deLaClasse = (if article == "l'" then "de l'" .. cl.nom else (if article == "la " then "de la " .. cl.nom else "du " .. cl.nom))
    if __TS__ArrayIncludes(cl.competences, id) then
        return "compétence de départ " .. deLaClasse
    end
    for ____, b in ipairs(cl.branches) do
        for ____, k in ipairs(b.competences) do
            if k.competence == id then
                return ((("apprise au niveau " .. tostring(k.niveau)) .. " (branche ") .. b.nom) .. ")"
            end
        end
    end
    for ____, parent in ipairs(valeurs(h.variantes)) do
        if __TS__ArrayIncludes(parent, id) then
            return "fusion de ton grimoire"
        end
    end
    if id == "souffle-draconique" then
        return "trait de ta race"
    end
    return "compétence spéciale"
end
--- Phrase complète : « 5 mana, recharge 2 tours · cible : soi-même · … ».
function ____exports.resumeChiffres(k)
    local morceaux = {}
    morceaux[#morceaux + 1] = (if k.cout > 0 then tostring(k.cout) .. " mana" else "gratuit")
    if k.recharge > 0 then
        morceaux[#morceaux + 1] = "recharge " .. tours(k.recharge)
    end
    morceaux[#morceaux + 1] = "cible : " .. k.cible
    if k.element ~= nil then
        morceaux[#morceaux + 1] = "élément : " .. k.element
    end
    if k.degats ~= nil then
        morceaux[#morceaux + 1] = ((("environ " .. tostring(k.degats[1])) .. " à ") .. tostring(k.degats[2])) .. " dégâts"
    end
    if k.toucher ~= nil then
        morceaux[#morceaux + 1] = tostring(math.floor(k.toucher * 100 + 0.5)) .. " % de chance de toucher"
    end
    if k.soin ~= nil then
        morceaux[#morceaux + 1] = ("soigne environ " .. tostring(k.soin)) .. " PV"
    end
    return table.concat(morceaux, " · ")
end
return ____exports
 end,
["src.ia.texte"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringSplit = ____lualib.__TS__StringSplit
local __TS__StringCharCodeAt = ____lualib.__TS__StringCharCodeAt
local __TS__StringCharAt = ____lualib.__TS__StringCharAt
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local Set = ____lualib.Set
local __TS__New = ____lualib.__TS__New
local __TS__StringEndsWith = ____lualib.__TS__StringEndsWith
local __TS__StringSlice = ____lualib.__TS__StringSlice
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayFrom = ____lualib.__TS__ArrayFrom
local __TS__StringAccess = ____lualib.__TS__StringAccess
local __TS__ArraySome = ____lualib.__TS__ArraySome
local ____exports = {}
local ____outils = require("src.moteur.outils")
local imul = ____outils.imul
local vrai = ____outils.vrai
local ACCENTS = {
    {"à", "a"},
    {"â", "a"},
    {"ä", "a"},
    {"á", "a"},
    {"ã", "a"},
    {"å", "a"},
    {"À", "a"},
    {"Â", "a"},
    {"Ä", "a"},
    {"Á", "a"},
    {"ç", "c"},
    {"Ç", "c"},
    {"é", "e"},
    {"è", "e"},
    {"ê", "e"},
    {"ë", "e"},
    {"É", "e"},
    {"È", "e"},
    {"Ê", "e"},
    {"Ë", "e"},
    {"î", "i"},
    {"ï", "i"},
    {"í", "i"},
    {"ì", "i"},
    {"Î", "i"},
    {"Ï", "i"},
    {"ô", "o"},
    {"ö", "o"},
    {"ó", "o"},
    {"ò", "o"},
    {"õ", "o"},
    {"Ô", "o"},
    {"Ö", "o"},
    {"ù", "u"},
    {"û", "u"},
    {"ü", "u"},
    {"ú", "u"},
    {"Ù", "u"},
    {"Û", "u"},
    {"Ü", "u"},
    {"ÿ", "y"},
    {"Ÿ", "y"},
    {"ñ", "n"},
    {"Ñ", "n"},
    {"œ", "oe"},
    {"Œ", "oe"},
    {"æ", "ae"},
    {"Æ", "ae"}
}
function ____exports.normaliser(t)
    local s = t
    for ____, ____value in ipairs(ACCENTS) do
        local a = ____value[1]
        local b = ____value[2]
        s = table.concat(
            __TS__StringSplit(s, a),
            b or ","
        )
    end
    s = string.lower(s)
    local res = ""
    do
        local i = 0
        while i < #s do
            local code = __TS__StringCharCodeAt(s, i)
            res = res .. (if code >= 97 and code <= 122 or code >= 48 and code <= 57 then __TS__StringCharAt(s, i) else " ")
            i = i + 1
        end
    end
    return table.concat(
        __TS__ArrayFilter(
            __TS__StringSplit(res, " "),
            function(____, x) return #x > 0 end
        ),
        " "
    )
end
--- Mots vides ignorés pour reconnaître les noms (compétences, ennemis).
____exports.MOTS_VIDES = __TS__New(Set, {
    "le",
    "la",
    "les",
    "l",
    "un",
    "une",
    "des",
    "de",
    "du",
    "d",
    "a",
    "au",
    "aux",
    "et",
    "sur",
    "avec",
    "en",
    "je",
    "j",
    "me",
    "m",
    "mon",
    "ma",
    "mes",
    "son",
    "sa",
    "ses",
    "ce",
    "cet",
    "cette",
    "ces",
    "qui",
    "que",
    "pour",
    "par",
    "il",
    "elle",
    "lui",
    "y"
})
--- Racine grossière : retire les terminaisons fréquentes (pluriels, conjugaisons).
function ____exports.racine(mot)
    if #mot <= 4 then
        return mot
    end
    for ____, fin in ipairs({
        "ements",
        "ement",
        "aient",
        "ions",
        "erai",
        "eras",
        "era",
        "ons",
        "ent",
        "ez",
        "er",
        "es",
        "ee",
        "e",
        "s",
        "x"
    }) do
        if __TS__StringEndsWith(mot, fin) and #mot - #fin >= 4 then
            return __TS__StringSlice(mot, 0, -#fin)
        end
    end
    return mot
end
function ____exports.mots(t)
    return __TS__ArrayFilter(
        __TS__StringSplit(
            ____exports.normaliser(t),
            " "
        ),
        function(____, x) return #x > 0 end
    )
end
--- Traits utilisés par le classificateur : racines + paires de racines voisines.
function ____exports.traits(t)
    local r = __TS__ArrayMap(
        ____exports.mots(t),
        function(____, m) return ____exports.racine(m) end
    )
    local res = {table.unpack(r)}
    do
        local i = 0
        while i < #r - 1 do
            res[#res + 1] = (r[i + 1] .. "_") .. r[i + 1 + 1]
            i = i + 1
        end
    end
    return res
end
function ____exports.distance(a, b)
    if a == b then
        return 0
    end
    local m = #a
    local n = #b
    if not vrai(m) then
        return n
    end
    if not vrai(n) then
        return m
    end
    local prec = __TS__ArrayFrom(
        {length = n + 1},
        function(____, _, j) return j end
    )
    do
        local i = 1
        while i <= m do
            local cur = {i}
            do
                local j = 1
                while j <= n do
                    cur[j + 1] = math.min(prec[j + 1] + 1, cur[j] + 1, prec[j] + (if __TS__StringAccess(a, i - 1) == __TS__StringAccess(b, j - 1) then 0 else 1))
                    j = j + 1
                end
            end
            prec = cur
            i = i + 1
        end
    end
    return prec[n + 1]
end
--- Deux mots se ressemblent-ils (fautes de frappe tolérées selon la longueur) ?
function ____exports.ressemble(a, b)
    if a == b then
        return true
    end
    local l = math.max(#a, #b)
    local tol = (if l <= 4 then 0 else (if l <= 7 then 1 else 2))
    if vrai(tol) and math.abs(#a - #b) <= tol and ____exports.distance(a, b) <= tol then
        return true
    end
    return #a > 4 and #b > 4 and ____exports.racine(a) == ____exports.racine(b)
end
--- Proportion des mots significatifs de `nom` présents (à une faute près) dans `texte`.
function ____exports.correspondance(nom, texteMots)
    local cles = __TS__ArrayFilter(
        ____exports.mots(nom),
        function(____, m) return not ____exports.MOTS_VIDES:has(m) and #m > 1 end
    )
    if #cles == 0 then
        return 0
    end
    local trouves = __TS__ArrayFilter(
        cles,
        function(____, k) return __TS__ArraySome(
            texteMots,
            function(____, m) return ____exports.ressemble(m, k) end
        ) end
    )
    return #trouves / #cles
end
--- Petit hachage stable (pour varier les formulations sans hasard).
function ____exports.hachage(t)
    local h = 2166136261
    do
        local i = 0
        while i < #t do
            h = bit32.rshift(
                imul(
                    bit32.bxor(
                        h,
                        __TS__StringCharCodeAt(t, i)
                    ),
                    16777619
                ),
                0
            )
            i = i + 1
        end
    end
    return h
end
return ____exports
 end,
["src.ia.classificateur"] = function(...) 
local ____lualib = require("lualib_bundle")
local Map = ____lualib.Map
local __TS__New = ____lualib.__TS__New
local Set = ____lualib.Set
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__Spread = ____lualib.__TS__Spread
local __TS__ArrayFlat = ____lualib.__TS__ArrayFlat
local WeakMap = ____lualib.WeakMap
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local ____exports = {}
local ____texte = require("src.ia.texte")
local traits = ____texte.traits
local ____outils = require("src.moteur.outils")
local trier = ____outils.trier
---
-- @param minimum traits vus moins de `minimum` fois au total : ignorés (modèle plus léger, moins de bruit)
function ____exports.entrainer(exemples, classes, alpha, minimum)
    if alpha == nil then
        alpha = 0.5
    end
    if minimum == nil then
        minimum = 1
    end
    local frequence = __TS__New(Map)
    for ____, ex in ipairs(exemples) do
        for ____, t in __TS__Iterator(__TS__New(
            Set,
            traits(ex.texte)
        )) do
            frequence:set(
                t,
                (frequence:get(t) or 0) + 1
            )
        end
    end
    local index = __TS__New(Map)
    local vocab = {}
    local comptes = __TS__ArrayMap(
        classes,
        function() return __TS__New(Map) end
    )
    local docs = __TS__ArrayMap(
        classes,
        function() return 0 end
    )
    for ____, ex in ipairs(exemples) do
        local c = __TS__ArrayIndexOf(classes, ex.classe)
        if c < 0 then
            error(
                __TS__New(Error, "Classe inconnue : " .. ex.classe),
                0
            )
        end
        local ____docs_0, ____temp_1 = docs, c + 1
        ____docs_0[____temp_1] = ____docs_0[____temp_1] + 1
        for ____, t in __TS__Iterator(__TS__New(
            Set,
            traits(ex.texte)
        )) do
            if (frequence:get(t) or 0) < minimum then
                continue
            end
            if not index:has(t) then
                index:set(t, #vocab)
                vocab[#vocab + 1] = t
            end
            local i = index:get(t)
            comptes[c + 1]:set(
                i,
                (comptes[c + 1]:get(i) or 0) + 1
            )
        end
    end
    return {
        version = 2,
        classes = classes,
        alpha = alpha,
        docs = docs,
        vocab = vocab,
        comptes = __TS__ArrayMap(
            comptes,
            function(____, m) return __TS__ArrayFlat(trier(
                {__TS__Spread(m:entries())},
                function(a, b) return a[1] - b[1] end
            )) end
        )
    }
end
local caches = __TS__New(WeakMap)
local function preparer(m)
    local cache = caches:get(m)
    if cache then
        return cache
    end
    local V = #m.vocab
    local index = __TS__New(
        Map,
        __TS__ArrayMap(
            m.vocab,
            function(____, t, i) return {t, i} end
        )
    )
    local totalDocs = __TS__ArrayReduce(
        m.docs,
        function(____, a, b) return a + b end,
        0
    )
    local logP = {}
    local inconnu = {}
    __TS__ArrayForEach(
        m.classes,
        function(____, _, c)
            local brut = {}
            do
                local k = 0
                while k < V do
                    brut[#brut + 1] = 0
                    k = k + 1
                end
            end
            local total = 0
            do
                local k = 0
                while k < #m.comptes[c + 1] do
                    brut[m.comptes[c + 1][k + 1] + 1] = m.comptes[c + 1][k + 1 + 1]
                    total = total + m.comptes[c + 1][k + 1 + 1]
                    k = k + 2
                end
            end
            local denom = total + m.alpha * V
            logP[#logP + 1] = __TS__ArrayMap(
                brut,
                function(____, n) return math.log((n + m.alpha) / denom) end
            )
            inconnu[#inconnu + 1] = math.log(m.alpha / denom)
        end
    )
    local priors = __TS__ArrayMap(
        m.docs,
        function(____, n) return math.log((n + 1) / (totalDocs + #m.classes)) end
    )
    local p = {index = index, logP = logP, inconnu = inconnu, priors = priors}
    caches:set(m, p)
    return p
end
function ____exports.predire(m, texte)
    local ____preparer_result_2 = preparer(m)
    local index = ____preparer_result_2.index
    local logP = ____preparer_result_2.logP
    local priors = ____preparer_result_2.priors
    local t = {}
    for ____, x in __TS__Iterator(__TS__New(
        Set,
        traits(texte)
    )) do
        local i = index:get(x)
        if i ~= nil then
            t[#t + 1] = i
        end
    end
    local scores = __TS__ArrayMap(
        m.classes,
        function(____, _, c) return priors[c + 1] + __TS__ArrayReduce(
            t,
            function(____, s, i) return s + logP[c + 1][i + 1] end,
            0
        ) end
    )
    local max = math.max(table.unpack(scores))
    local exp = __TS__ArrayMap(
        scores,
        function(____, s) return math.exp(s - max) end
    )
    local somme = __TS__ArrayReduce(
        exp,
        function(____, a, b) return a + b end,
        0
    )
    local classement = trier(
        __TS__ArrayMap(
            m.classes,
            function(____, classe, c) return {classe = classe, p = exp[c + 1] / somme} end
        ),
        function(a, b) return b.p - a.p end
    )
    if #t == 0 then
        return {classe = "inconnu", confiance = 0, classement = classement}
    end
    return {classe = classement[1].classe, confiance = classement[1].p, classement = classement}
end
return ____exports
 end,
["src.ia.corpus"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
--- Corpus d'entraînement de l'IA maison : des modèles de phrases par intention.
-- Le générateur (scripts/entrainer-ia.ts) remplace les cases {E}, {A}, {P}, {C}, {C2}, {EL}
-- par des valeurs variées, ajoute des formules d'introduction et des fautes de frappe,
-- puis entraîne le classificateur sur plusieurs milliers de phrases.
-- Pour améliorer la compréhension : ajouter des modèles ici, puis `npm run ia:entrainer`.
____exports.INTENTIONS = {
    "attaquer",
    "competence",
    "viser",
    "defendre",
    "proteger",
    "fuir",
    "se_cacher",
    "soigner",
    "bombe",
    "voler",
    "pacifier",
    "changer_rang",
    "fusionner",
    "analyser",
    "provoquer",
    "invoquer"
}
____exports.MODELES = {
    attaquer = {
        "je lui colle une beigne",
        "je lui mets une raclée",
        "je l'étripe",
        "je lui fous un pain",
        "je lui mets une mandale",
        "coup de boule dans {E}",
        "je l'éventre",
        "je lui ouvre le ventre",
        "je le transperce",
        "je lui donne un coup de pied",
        "je le roue de coups",
        "je cours vers {E} et je l'attaque",
        "je fonce dans le tas",
        "je lui assène un coup",
        "je lui envoie un coup de hache",
        "j'attaque {E}",
        "je frappe {E}",
        "je tape {E}",
        "je cogne {E}",
        "je fonce sur {E} et je le frappe",
        "je charge {E}",
        "je donne un coup d'épée à {E}",
        "coup de poing sur {E}",
        "attaque normale sur {E}",
        "je tranche {E}",
        "je l'attaque",
        "je saute sur {E} et je frappe",
        "je me jette sur {E}",
        "je lui mets un coup",
        "je plante ma lame dans {E}",
        "je découpe {E}",
        "j'embroche {E}",
        "je pourfends {E}",
        "je tire une flèche sur {E}",
        "je lui tire dessus",
        "frappe {E}",
        "attaque",
        "je cogne dessus",
        "je l'éclate",
        "je lui défonce la tronche",
        "coup de dague dans {E}",
        "je lui rentre dedans",
        "on attaque {E}",
        "taper le plus faible",
        "je frappe le plus faible",
        "j'achève {E}",
        "je termine {E}",
        "je lui file un coup de bouclier",
        "je donne un coup de masse à {E}"
    },
    competence = {
        "je déchaîne la {EL} sur {E}",
        "je fais s'abattre la {EL} sur eux",
        "pluie de {EL}",
        "je canalise ma magie de {EL}",
        "avec ma magie je brûle {E}",
        "je fais jaillir la {EL}",
        "j'invoque la {EL} contre {E}",
        "{C} sur lui",
        "{C} direct",
        "je tente un {C}",
        "sort de {EL}",
        "je l'électrocute",
        "je le congèle",
        "je l'immole",
        "j'utilise {C} sur {E}",
        "je lance {C} sur {E}",
        "{C} sur {E}",
        "je lance {C}",
        "j'utilise {C}",
        "{C} !",
        "je déclenche {C}",
        "je fais {C} sur {E}",
        "technique {C}",
        "j'envoie {C} sur {E}",
        "je balance {C}",
        "je tente {C} contre {E}",
        "je prépare {C}",
        "je canalise {C}",
        "je récite {C}",
        "compétence {C} sur {E}",
        "je lui envoie un {C}",
        "je fais un {C}",
        "je lance mon sort sur {E}",
        "j'utilise ma compétence sur {E}",
        "je lance un sort",
        "je jette un sort de {EL} sur {E}",
        "je lui lance une boule de {EL}",
        "je projette du {EL} sur {E}",
        "j'enflamme {E}",
        "je gèle {E}",
        "je foudroie {E}",
        "je fais pleuvoir de la {EL}",
        "magie de {EL} sur {E}"
    },
    viser = {
        "je vise {P} de {E}",
        "je vise {P}",
        "je frappe {E} à {P}",
        "je lui tire dans {P}",
        "un coup dans {P}",
        "je vise {P} pour le ralentir",
        "je vise {P} pour le désarmer",
        "je tranche {P} de {E}",
        "je lui coupe {P}",
        "je tire une flèche dans {P} de {E}",
        "je vise la tête",
        "je vise les jambes",
        "je vise son arme",
        "je frappe au visage",
        "coup à la gorge",
        "je lui crève un oeil",
        "je fauche ses jambes",
        "je frappe son poignet pour lui faire lâcher son arme",
        "balayage dans les jambes",
        "je vise le point faible de {E}",
        "tir précis dans {P}"
    },
    defendre = {
        "je me défends",
        "je me mets en garde",
        "je lève mon bouclier",
        "je pare",
        "je me protège",
        "défense",
        "je bloque",
        "je reste sur la défensive",
        "j'encaisse",
        "je me prépare à parer",
        "je me couvre",
        "posture défensive",
        "je garde ma position",
        "je ne bouge pas et je me protège",
        "je me recroqueville derrière mon bouclier",
        "j'attends en garde",
        "je passe mon tour en défense"
    },
    proteger = {
        "je protège {A}",
        "je me mets devant {A}",
        "je couvre {A}",
        "bouclier sur {A}",
        "je m'interpose pour protéger {A}",
        "je défends {A}",
        "je fais un rempart pour {A}",
        "je protège mes alliés",
        "je protège l'équipe",
        "je mets un bouclier à {A}",
        "je garde {A}"
    },
    fuir = {
        "fuyez",
        "il faut fuir",
        "je me barre",
        "on file",
        "je détale",
        "je file à toute vitesse",
        "je m'en vais d'ici",
        "courez",
        "je tourne les talons",
        "je pars en courant",
        "on abandonne le combat",
        "je fuis",
        "je m'enfuis",
        "on se casse",
        "on fuit",
        "je prends la fuite",
        "je cours",
        "retraite",
        "on bat en retraite",
        "je me sauve",
        "je déguerpis",
        "je m'échappe",
        "sauve qui peut",
        "on se replie",
        "je recule et je fuis le combat",
        "on dégage d ici",
        "je quitte le combat"
    },
    se_cacher = {
        "je me cache",
        "je me planque",
        "je me cache derrière {OB}",
        "je disparais dans les ombres",
        "je me fonds dans le décor",
        "je me rends invisible",
        "je me camoufle",
        "je me dissimule",
        "je me faufile dans son dos",
        "je passe en furtif",
        "je me tapis dans le noir",
        "je me planque derrière {OB} pour le surprendre",
        "je m'efface dans l'ombre",
        "je deviens discret"
    },
    soigner = {
        "{CS} sur {A}",
        "je lance {CS}",
        "{CS}",
        "je soigne avec {CS}",
        "je redonne de la santé à {A}",
        "je soigne les blessés",
        "je me retape",
        "je rends la vie à {A}",
        "je soigne {A}",
        "je me soigne",
        "je bois une potion",
        "potion",
        "je prends une potion",
        "je donne une potion à {A}",
        "je guéris {A}",
        "je soigne le groupe",
        "je régénère {A}",
        "soin sur {A}",
        "je panse les blessures de {A}",
        "je récupère des PV",
        "heal {A}",
        "je me heal",
        "je bois une fiole de soin",
        "je rends des PV à {A}",
        "je prie pour soigner {A}",
        "je refais la vie de {A}"
    },
    bombe = {
        "je lance une bombe",
        "je jette une bombe sur {E}",
        "je balance un explosif",
        "grenade sur {E}",
        "je fais tout exploser",
        "bombe sur le groupe",
        "je lance un explosif sur eux",
        "je jette une fiole explosive"
    },
    voler = {
        "je prends mon envol",
        "je m'élance dans le ciel",
        "je fonds du ciel sur {E}",
        "je bats des ailes",
        "je reste en l'air",
        "je vole en cercle au dessus d'eux",
        "je m'envole",
        "je vole au dessus de {E}",
        "je décolle",
        "je m'élève dans les airs",
        "je vole jusqu à {E}",
        "je plane au dessus du combat",
        "je déploie mes ailes",
        "je survole le champ de bataille",
        "je vole pour attaquer {E} par le haut",
        "je m'envole pour esquiver"
    },
    pacifier = {
        "je lui dis de partir",
        "je lui ordonne de s'éloigner",
        "je l'apaise",
        "je lui fais comprendre qu'on ne lui veut pas de mal",
        "je tends la main vers {E}",
        "je murmure à {E}",
        "je convaincs {E} de partir",
        "je parle à {E}",
        "je calme {E}",
        "j'essaie de raisonner {E}",
        "je négocie avec {E}",
        "je lui demande de partir",
        "je lui parle doucement",
        "j'apprivoise {E}",
        "je tente de pacifier {E}",
        "je lui propose de se rendre",
        "je discute avec {E}",
        "je dis à {E} de fuir"
    },
    changer_rang = {
        "je me place derrière {A}",
        "je passe à l'arrière",
        "je rejoins le premier rang",
        "je me mets à l'abri derrière les autres",
        "j'avance",
        "je recule",
        "je passe devant",
        "je passe derrière",
        "je me mets en première ligne",
        "je recule au second rang",
        "je change de rang",
        "je reviens en arrière",
        "je monte au front",
        "je me replie à l'arrière",
        "je vais devant",
        "je me mets derrière le tank"
    },
    fusionner = {
        "je combine {C} et {C2}",
        "je mélange {C} avec {C2}",
        "je fusionne {C} et {C2}",
        "{C} et {C2} en même temps",
        "{C} plus {C2}",
        "je combine {EL} et {EL2}",
        "je mélange le {EL} et la {EL2}",
        "je fais une fusion {EL} {EL2}",
        "je mixe {C} et {C2} sur {E}",
        "j'associe {C} à {C2}",
        "combo {C} {C2}",
        "je fusionne mes deux sorts",
        "je crée une nouvelle technique avec {C} et {C2}"
    },
    analyser = {
        "je cherche ses faiblesses",
        "je l'inspecte",
        "quelle est sa faiblesse",
        "je jauge {E}",
        "j'évalue sa santé",
        "j'observe {E}",
        "j'analyse {E}",
        "je regarde ses faiblesses",
        "quelles sont ses faiblesses",
        "je scanne {E}",
        "je cherche son point faible",
        "combien de PV il lui reste",
        "j'examine {E}",
        "je l étudie",
        "il est fort contre quoi",
        "je regarde ses stats"
    },
    provoquer = {
        "je provoque {E}",
        "je provoque tout le monde",
        "j'attire leur attention",
        "je les nargue",
        "je hurle pour attirer les ennemis sur moi",
        "je les insulte pour qu ils me ciblent",
        "venez vous battre",
        "je fais diversion",
        "provocation"
    },
    invoquer = {
        "j'invoque une créature",
        "j'invoque un golem",
        "j'appelle mon familier",
        "je fais apparaître un allié",
        "invocation",
        "j'invoque des renforts",
        "je convoque un esprit",
        "je pose une tourelle",
        "j'appelle à l'aide une bête"
    }
}
____exports.REMPLISSAGE = {
    E = {
        "le loup",
        "ce loup",
        "le squelette",
        "ce gobelin",
        "le bandit",
        "le mage",
        "l'ennemi",
        "la bête",
        "le golem",
        "le cultiste",
        "ce monstre",
        "le chef",
        "l'araignée",
        "le rat",
        "la gelée",
        "le démon",
        "lui",
        "le premier",
        "celui de gauche",
        "le plus faible",
        "le gros",
        "le boss",
        "Vorthak",
        "le sanglier"
    },
    A = {
        "Aveline",
        "moi",
        "mon ami",
        "le gardien",
        "ma camarade",
        "notre guérisseur",
        "Kael",
        "Ilo",
        "le groupe",
        "mon allié",
        "tout le monde",
        "l'équipe"
    },
    P = {
        "la tête",
        "le crâne",
        "les yeux",
        "la gorge",
        "le visage",
        "les jambes",
        "le genou",
        "les pieds",
        "les chevilles",
        "le bras",
        "sa main",
        "son arme",
        "le poignet"
    },
    EL = {
        "feu",
        "flamme",
        "glace",
        "givre",
        "foudre",
        "éclair",
        "lumière",
        "ombre",
        "poison",
        "venin"
    },
    EL2 = {
        "glace",
        "feu",
        "foudre",
        "poison",
        "ombre",
        "lumière"
    },
    CS = {
        "lumière apaisante",
        "prière de groupe",
        "hymne de guérison",
        "purification",
        "souffle des ancêtres"
    },
    OB = {
        "un pilier",
        "une colonne",
        "un arbre",
        "un tonneau",
        "un rocher",
        "la fumée",
        "un mur"
    },
    INTRO = {
        "",
        "",
        "",
        "",
        "je vais ",
        "je veux ",
        "allez ",
        "bon ",
        "ok ",
        "vas y ",
        "maintenant ",
        "tant pis ",
        "j'essaie de ",
        "du coup "
    },
    FIN = {
        "",
        "",
        "",
        "",
        " !",
        " vite",
        " de toutes mes forces",
        " tout de suite",
        " sans réfléchir",
        " fort"
    }
}
return ____exports
 end,
["src.ia.interpreteur"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local __TS__StringCharAt = ____lualib.__TS__StringCharAt
local __TS__StringCharCodeAt = ____lualib.__TS__StringCharCodeAt
local __TS__StringSlice = ____lualib.__TS__StringSlice
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local Set = ____lualib.Set
local __TS__New = ____lualib.__TS__New
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local __TS__ArrayReduce = ____lualib.__TS__ArrayReduce
local __TS__StringTrim = ____lualib.__TS__StringTrim
local __TS__StringEndsWith = ____lualib.__TS__StringEndsWith
local ____exports = {}
local competenceDe, moyenne, valeur, preference, conseil
local ____fiche = require("src.moteur.fiche")
local origineCompetence = ____fiche.origineCompetence
local ____combat = require("src.moteur.combat")
local actionsDisponibles = ____combat.actionsDisponibles
local adversaires = ____combat.adversaires
local allies = ____combat.allies
local estimerAction = ____combat.estimerAction
local NOMS_ETATS = ____combat.NOMS_ETATS
local VISEES = ____combat.VISEES
local ____fusions = require("src.moteur.fusions")
local creerTechnique = ____fusions.creerTechnique
local elementDe = ____fusions.elementDe
local idFusion = ____fusions.idFusion
local NOM_ELEMENT = ____fusions.NOM_ELEMENT
local peutApprendre = ____fusions.peutApprendre
local ____personnage = require("src.moteur.personnage")
local competencesConnues = ____personnage.competencesConnues
local ____classificateur = require("src.ia.classificateur")
local predire = ____classificateur.predire
local modeleBrut = require("src.ia.modele")
local ____texte = require("src.ia.texte")
local correspondance = ____texte.correspondance
local hachage = ____texte.hachage
local mots = ____texte.mots
local normaliser = ____texte.normaliser
local ressemble = ____texte.ressemble
local ____outils = require("src.moteur.outils")
local copieProfonde = ____outils.copieProfonde
local entrees = ____outils.entrees
local trier = ____outils.trier
local valeurs = ____outils.valeurs
local vrai = ____outils.vrai
function competenceDe(ctx, id)
    local x = __TS__ArrayFind(
        ctx.combat.combattants,
        function(____, c) return c.id == ctx.acteur end
    )
    return __TS__ArrayFind(
        x.competencesPropres,
        function(____, k) return k.id == id end
    ) or ctx.contenu.competences[id] or ctx.grimoire[id] or nil
end
function moyenne(e)
    return (if e.degats then (e.degats[1] + e.degats[2]) / 2 else 0)
end
function valeur(ctx, x, p)
    local e = p.estimation
    local a = p.action
    local cibleId = (if a.kind == "fusion" then a.cible else (if a.action.cible ~= nil then a.action.cible else nil))
    local cible = (if vrai(cibleId) then __TS__ArrayFind(
        ctx.combat.combattants,
        function(____, c) return c.id == cibleId end
    ) else nil)
    local v = 0
    if e.degats then
        local r = e.reussite or 1
        local crit = 1 + (e.critique or 0) * 0.5
        local pvCible = (if cible and cible.camp ~= x.camp then cible.pv else 40)
        local dmg = moyenne(e) * r * crit * math.max(1, e.nbCibles * 0.8)
        v = v + math.min(
            1.2,
            dmg / math.max(1, pvCible)
        )
        if cible and cible.camp ~= x.camp and moyenne(e) >= cible.pv then
            v = v + 0.4 * r
        end
    end
    if e.soin and cible then
        local manque = (cible.pvMax - cible.pv) / cible.pvMax
        v = v + (if manque < 0.3 then 0 else math.min(e.soin[1], cible.pvMax - cible.pv) / cible.pvMax * 1.6)
    end
    if a.kind == "combat" then
        local t = a.action.type
        local ratio = x.pv / x.pvMax
        if t == "defendre" then
            v = v + (0.12 + (if ratio < 0.3 then 0.35 else 0))
        end
        if t == "se_cacher" then
            v = v + (e.reussite or 0) * (if ratio < 0.4 then 0.5 else 0.25)
        end
        if t == "fuir" then
            local groupe = __TS__ArrayFilter(
                allies(ctx.combat, x),
                function(____, y) return y.type ~= "invocation" end
            )
            local moy = __TS__ArrayReduce(
                groupe,
                function(____, s, y) return s + y.pv / y.pvMax end,
                0
            ) / math.max(1, #groupe)
            v = v + (if moy < 0.25 then 0.6 * (e.reussite or 0.5) else 0.01)
        end
        if t == "competence" and not e.degats and not e.soin then
            v = v + (if ctx.combat.tour <= 2 then 0.45 else 0.2)
        end
    end
    v = v - e.mana / math.max(1, x.manaMax) * 0.25
    return v
end
function preference(ctx, p, pref)
    local b = 0
    local a = p.action
    local cibleId = (if a.kind == "fusion" then a.cible else (if a.action.cible ~= nil then a.action.cible else nil))
    if vrai(pref.cible) and cibleId == pref.cible then
        b = b + 0.25
    end
    local comp = (if a.kind == "combat" and a.action.type == "competence" then competenceDe(ctx, a.action.competence) else nil)
    if vrai(pref.element) and comp and elementDe(comp) == pref.element then
        b = b + 0.4
    end
    local ____pref_distance_27 = pref.distance
    if ____pref_distance_27 then
        local ____temp_26 = (comp and comp.portee) == "distance"
        if not ____temp_26 then
            local ____temp_25 = a.kind == "combat" and a.action.type == "attaque"
            if ____temp_25 then
                local ____opt_23 = __TS__ArrayFind(
                    ctx.combat.combattants,
                    function(____, c) return c.id == ctx.acteur end
                )
                ____temp_25 = (____opt_23 and ____opt_23.attaque.portee) == "distance"
            end
            ____temp_26 = ____temp_25
        end
        ____pref_distance_27 = ____temp_26
    end
    if ____pref_distance_27 then
        b = b + 0.3
    end
    local t = (if a.kind == "combat" then a.action.type else "fusion")
    repeat
        local ____switch123 = pref.intention
        local ____cond123 = ____switch123 == "soigner"
        if ____cond123 then
            if p.estimation.soin then
                b = b + 0.6
            end
            break
        end
        ____cond123 = ____cond123 or (____switch123 == "proteger" or ____switch123 == "defendre")
        if ____cond123 then
            if t == "defendre" or __TS__ArraySome(
                p.estimation.effets,
                function(____, e) return __TS__StringStartsWith(e, "bouclier") end
            ) then
                b = b + 0.5
            end
            break
        end
        ____cond123 = ____cond123 or ____switch123 == "fuir"
        if ____cond123 then
            if t == "fuir" or t == "se_cacher" then
                b = b + 0.4
            end
            break
        end
        ____cond123 = ____cond123 or (____switch123 == "attaquer" or ____switch123 == "viser" or ____switch123 == "voler")
        if ____cond123 then
            if p.estimation.degats then
                b = b + 0.2
            end
            break
        end
        ____cond123 = ____cond123 or ____switch123 == "competence"
        if ____cond123 then
            if t == "competence" and p.estimation.degats then
                b = b + 0.25
            end
            break
        end
    until true
    return b
end
function conseil(ctx, x, p)
    local a = p.action
    local cibleId = (if a.kind == "fusion" then a.cible else (if a.action.cible ~= nil then a.action.cible else nil))
    local cible = (if vrai(cibleId) then __TS__ArrayFind(
        ctx.combat.combattants,
        function(____, c) return c.id == cibleId end
    ) else nil)
    if cible and cible.camp ~= x.camp and p.estimation.degats and moyenne(p.estimation) >= cible.pv then
        return ("De bonnes chances d'achever " .. cible.nom) .. "."
    end
    local comp = (if a.kind == "combat" and a.action.type == "competence" then competenceDe(ctx, a.action.competence) else nil)
    local el = (if comp then elementDe(comp) else nil)
    local ____temp_30 = cible and vrai(el) and (cible.resistances[el] or 0) < 0
    if ____temp_30 then
        local ____opt_28 = x.don
        ____temp_30 = (____opt_28 and ____opt_28.id) == "oeil-du-seuil" or x.caracs.INT >= 12
    end
    if ____temp_30 then
        return ((cible.nom .. " semble craindre ") .. (if NOM_ELEMENT[el] == "lumière" then "la lumière" else "le " .. NOM_ELEMENT[el])) .. "."
    end
    if p.estimation.soin and cible then
        return ((cible.nom .. " n'a plus que ") .. tostring(math.floor(cible.pv / cible.pvMax * 100 + 0.5))) .. " % de ses PV."
    end
    if a.kind == "combat" and a.action.type == "defendre" and x.pv / x.pvMax < 0.3 then
        return "Vous êtes très blessé : prudence."
    end
    if a.kind == "combat" and a.action.type == "fuir" then
        return "Le groupe est en mauvaise posture."
    end
    return ""
end
local ____modeleBrut_default_0 = modeleBrut.default
if ____modeleBrut_default_0 == nil then
    ____modeleBrut_default_0 = modeleBrut
end
local MODELE = ____modeleBrut_default_0
local MOTS_ELEMENTS = {
    feu = {
        "feu",
        "flamme",
        "flammes",
        "bruler",
        "brule",
        "enflamme",
        "enflammer",
        "incendie",
        "immole",
        "braise",
        "brasier"
    },
    glace = {
        "glace",
        "givre",
        "geler",
        "gele",
        "congele",
        "congeler",
        "froid",
        "gel",
        "glacial"
    },
    foudre = {
        "foudre",
        "eclair",
        "eclairs",
        "electrique",
        "electrocute",
        "tonnerre",
        "foudroie"
    },
    sacre = {
        "lumiere",
        "sacre",
        "sacree",
        "sainte",
        "divine",
        "benie"
    },
    ombre = {"ombre", "tenebres", "obscurite"},
    poison = {
        "poison",
        "venin",
        "empoisonne",
        "toxique",
        "toxine"
    }
}
local MOTS_PARTIES = {tete = {
    "tete",
    "crane",
    "visage",
    "yeux",
    "oeil",
    "gorge",
    "nuque",
    "front"
}, jambes = {
    "jambe",
    "jambes",
    "genou",
    "genoux",
    "pied",
    "pieds",
    "cheville",
    "chevilles",
    "jarret",
    "jarrets"
}, bras = {
    "bras",
    "main",
    "poignet",
    "arme",
    "epee",
    "hache",
    "baton"
}}
local MOTS_COMBINER = {
    "combine",
    "combiner",
    "melange",
    "melanger",
    "fusion",
    "fusionne",
    "fusionner",
    "mixe",
    "mix",
    "associe",
    "combo"
}
local function trouverMots(m, liste)
    return __TS__ArraySome(
        m,
        function(____, x) return __TS__ArraySome(
            liste,
            function(____, y) return ressemble(x, y) end
        ) end
    )
end
local function elementsCites(m)
    return __TS__ArrayMap(
        __TS__ArrayFilter(
            entrees(MOTS_ELEMENTS),
            function(____, ____bindingPattern0)
                local l
                l = ____bindingPattern0[2]
                return trouverMots(m, l)
            end
        ),
        function(____, ____bindingPattern0)
            local e
            e = ____bindingPattern0[1]
            return e
        end
    )
end
local function partieCitee(m)
    local ____opt_1 = __TS__ArrayFind(
        entrees(MOTS_PARTIES),
        function(____, ____bindingPattern0)
            local l
            l = ____bindingPattern0[2]
            return trouverMots(m, l)
        end
    )
    return ____opt_1 and ____opt_1[1] or nil
end
--- Compétences citées : nom reconnu (à une faute près par mot).
local function competencesCitees(contenu, m, ids)
    return trier(
        __TS__ArrayFilter(
            __TS__ArrayMap(
                ids,
                function(____, id)
                    local c = contenu.competences[id]
                    if not c then
                        return {id = id, score = 0}
                    end
                    local cles = __TS__ArrayFilter(
                        mots(c.nom),
                        function(____, x) return #x > 2 and not __TS__ArrayIncludes({"de", "du", "des"}, x) end
                    )
                    local s = correspondance(c.nom, m)
                    return {id = id, score = (if #cles <= 1 then (if s == 1 then 1 else 0) else (if s >= 0.75 or s >= 0.5 and #cles >= 3 then s else 0))}
                end
            ),
            function(____, x) return x.score > 0 end
        ),
        function(a, b) return b.score - a.score end
    )
end
local function ennemiCite(combat, x, m)
    local ennemis = adversaires(combat, x)
    local tous = trouverMots(m, {"tous", "eux", "groupe", "ensemble"}) or __TS__StringIncludes(
        table.concat(m, " "),
        "tout le monde"
    )
    if trouverMots(m, {"faible", "blesse", "agonisant", "mourant"}) then
        return {
            cible = trier(
                {table.unpack(ennemis)},
                function(a, b) return a.pv / a.pvMax - b.pv / b.pvMax end
            )[1] or nil,
            tous = tous
        }
    end
    if trouverMots(m, {"boss", "chef", "gros", "costaud"}) then
        return {
            cible = trier(
                {table.unpack(ennemis)},
                function(a, b) return b.pvMax - a.pvMax end
            )[1] or nil,
            tous = tous
        }
    end
    if trouverMots(m, {"mage", "sorcier", "lanceur", "pretre"}) then
        local mage = __TS__ArrayFind(
            ennemis,
            function(____, e) return e.attaque.stat == "INT" or e.rang == "arriere" end
        )
        if mage then
            return {cible = mage, tous = tous}
        end
    end
    local meilleur = nil
    for ____, e in ipairs(ennemis) do
        local n = #e.nom
        local finLettre = n >= 2 and __TS__StringCharAt(e.nom, n - 2) == " " and __TS__StringCharCodeAt(e.nom, n - 1) >= 65 and __TS__StringCharCodeAt(e.nom, n - 1) <= 90
        local nomBase = (if finLettre then __TS__StringSlice(e.nom, 0, n - 2) else e.nom)
        local s = correspondance(nomBase, m)
        local lettre = (if finLettre then string.lower(__TS__StringCharAt(e.nom, n - 1)) else nil)
        if s > 0 and vrai(lettre) and __TS__ArrayIncludes(m, lettre) then
            s = s + 0.5
        end
        if s > 0 and (not meilleur or s > meilleur.s or s == meilleur.s and e.pv < meilleur.e.pv) then
            meilleur = {e = e, s = s}
        end
    end
    if meilleur and meilleur.s >= 0.5 then
        return {cible = meilleur.e, tous = tous}
    end
    if trouverMots(m, {"arriere", "derriere", "fond"}) then
        return {
            cible = __TS__ArrayFind(
                ennemis,
                function(____, e) return e.rang == "arriere" end
            ) or nil,
            tous = tous
        }
    end
    local derniere = (if vrai(x.derniereCible) then __TS__ArrayFind(
        ennemis,
        function(____, e) return e.id == x.derniereCible end
    ) else nil)
    return {cible = derniere or (if #ennemis == 1 then ennemis[1] else nil), tous = tous}
end
local function allieCite(combat, x, m)
    local amis = __TS__ArrayFilter(
        allies(combat, x),
        function(____, a) return a.type ~= "invocation" end
    )
    if trouverMots(m, {"moi", "me", "soigne", "mes"}) and not __TS__ArraySome(
        amis,
        function(____, a) return a.id ~= x.id and correspondance(a.nom, m) > 0 end
    ) then
        if __TS__ArrayIncludes(m, "me") or __TS__ArrayIncludes(m, "moi") or __TS__ArrayIncludes(m, "mes") then
            return x
        end
    end
    for ____, a in ipairs(amis) do
        if correspondance(a.nom, m) >= 0.5 then
            return a
        end
    end
    return nil
end
local function pc(x)
    return (if x == nil then "" else tostring(math.floor(x * 100 + 0.5)) .. " %")
end
local function details(e)
    local l = {}
    if e.reussite ~= nil then
        l[#l + 1] = pc(e.reussite) .. " de réussite"
    end
    if e.degats then
        l[#l + 1] = (((tostring(e.degats[1]) .. "–") .. tostring(e.degats[2])) .. " dégâts") .. (if e.nbCibles > 1 then (" (×" .. tostring(e.nbCibles)) .. " cibles)" else "")
    end
    if e.soin then
        l[#l + 1] = ("+" .. tostring(e.soin[1])) .. " PV"
    end
    if vrai(e.mana) then
        l[#l + 1] = tostring(e.mana) .. " mana"
    end
    if e.critique ~= nil and e.critique >= 0.99 then
        l[#l + 1] = "critique assuré"
    end
    return table.concat(l, " · ")
end
local function nomCible(ctx, id)
    local ____opt_3 = __TS__ArrayFind(
        ctx.combat.combattants,
        function(____, c) return c.id == id end
    )
    return (if vrai(id) then ____opt_3 and ____opt_3.nom or "?" else "")
end
--- Explique d'où vient l'action proposée (compétence de départ, de niveau, du grimoire, objet de l'inventaire…).
local function sourceAction(ctx, a)
    if a.kind == "fusion" then
        return "fusion de deux de tes compétences"
    end
    local x = a.action
    if x.type == "competence" then
        if __TS__StringStartsWith(x.competence, "copie:") then
            return "technique copiée sur un ennemi (don Mimétisme)"
        end
        return (if ctx.heros then origineCompetence(ctx.contenu, ctx.heros, x.competence) else "")
    end
    if x.type == "objet" then
        return (if x.objet == "potion" then "potion de ton inventaire" else "bombe de ta réserve")
    end
    if x.type == "pacifier" then
        return "don Langue universelle"
    end
    if x.type == "attaque" or x.type == "viser" then
        return "attaque de base, fiable"
    end
    return ""
end
local function libelleAction(ctx, a)
    if a.kind == "fusion" then
        local p = ctx.contenu.competences[a.parent]
        local q = ctx.contenu.competences[a.secondaire]
        return ((("Fusion " .. (p and p.nom or a.parent)) .. " + ") .. (q and q.nom or a.secondaire)) .. (if vrai(a.cible) then " sur " .. nomCible(ctx, a.cible) else "")
    end
    local x = a.action
    repeat
        local ____switch58 = x.type
        local ____cond58 = ____switch58 == "attaque"
        if ____cond58 then
            return "Attaque sur " .. nomCible(ctx, x.cible)
        end
        ____cond58 = ____cond58 or ____switch58 == "viser"
        if ____cond58 then
            return (("Viser " .. VISEES[x.partie].nom) .. " de ") .. nomCible(ctx, x.cible)
        end
        ____cond58 = ____cond58 or ____switch58 == "competence"
        if ____cond58 then
            do
                local comp = competenceDe(ctx, x.competence)
                return (comp and comp.nom or x.competence) .. (if vrai(x.cible) then " sur " .. nomCible(ctx, x.cible) else "")
            end
        end
        ____cond58 = ____cond58 or ____switch58 == "objet"
        if ____cond58 then
            return (if x.objet == "potion" then "Potion de soin" .. (if vrai(x.cible) then " pour " .. nomCible(ctx, x.cible) else "") else "Lancer une bombe")
        end
        ____cond58 = ____cond58 or ____switch58 == "defendre"
        if ____cond58 then
            return "Se défendre"
        end
        ____cond58 = ____cond58 or ____switch58 == "changer_rang"
        if ____cond58 then
            return "Changer de rang"
        end
        ____cond58 = ____cond58 or ____switch58 == "pacifier"
        if ____cond58 then
            return ("Parler à " .. nomCible(ctx, x.cible)) .. " pour le pacifier"
        end
        ____cond58 = ____cond58 or ____switch58 == "se_cacher"
        if ____cond58 then
            return "Se cacher"
        end
        ____cond58 = ____cond58 or ____switch58 == "fuir"
        if ____cond58 then
            return "Fuir le combat"
        end
    until true
end
--- Estimation d'une fusion : on l'essaie sur une copie du combat (rien n'est modifié).
local function estimerFusion(ctx, parent, secondaire, cible)
    local existante = ctx.grimoire[idFusion(parent, secondaire)]
    local ____creerTechnique_14 = creerTechnique
    local ____array_13 = __TS__SparseArrayNew(ctx.contenu, parent, secondaire)
    local ____opt_11 = ctx.heros
    __TS__SparseArrayPush(____array_13, ____opt_11 and ____opt_11.nom or "")
    local r = (if existante then {ok = true, technique = existante} else ____creerTechnique_14(__TS__SparseArraySpread(____array_13)))
    local function impossible(raison)
        return {estimation = {
            possible = false,
            raison = raison,
            reussite = nil,
            critique = nil,
            mana = 0,
            degats = nil,
            soin = nil,
            nbCibles = 0,
            effets = {}
        }, technique = nil}
    end
    if not r.ok then
        return impossible(r.raison)
    end
    if ctx.heros and not __TS__ArrayIncludes(ctx.heros.variantes[r.technique.parent] or ({}), r.technique.id) then
        local pb = peutApprendre(ctx.contenu, ctx.heros, r.technique)
        if vrai(pb) then
            return impossible(pb)
        end
    end
    local copie = copieProfonde(ctx.combat)
    local x = __TS__ArrayFind(
        copie.combattants,
        function(____, c) return c.id == ctx.acteur end
    )
    local ____x_competencesPropres_15 = x.competencesPropres
    ____x_competencesPropres_15[#____x_competencesPropres_15 + 1] = r.technique
    local ____x_compteurs_18 = x.compteurs
    local ____temp_19 = "rang:" .. r.technique.id
    local ____opt_16 = ctx.heros
    ____x_compteurs_18[____temp_19] = ____opt_16 and ____opt_16.rangsCompetences[parent] or 1
    return {
        estimation = estimerAction(ctx.contenu, copie, {type = "competence", acteur = ctx.acteur, competence = r.technique.id, cible = cible}),
        technique = r.technique
    }
end
local function proposer(ctx, action)
    local estimation = (if action.kind == "fusion" then estimerFusion(ctx, action.parent, action.secondaire, action.cible).estimation else estimerAction(ctx.contenu, ctx.combat, action.action))
    return {
        libelle = libelleAction(ctx, action),
        action = action,
        estimation = estimation,
        details = details(estimation),
        conseil = "",
        score = 0,
        source = sourceAction(ctx, action)
    }
end
--- Les meilleures actions possibles maintenant, avec un score et un conseil.
function ____exports.conseiller(ctx, pref, nombre)
    if pref == nil then
        pref = {}
    end
    if nombre == nil then
        nombre = 3
    end
    local ____ctx_20 = ctx
    local contenu = ____ctx_20.contenu
    local combat = ____ctx_20.combat
    local x = __TS__ArrayFind(
        combat.combattants,
        function(____, c) return c.id == ctx.acteur end
    )
    if not x or combat.enAttente ~= x.id then
        return {}
    end
    local dispo = actionsDisponibles(contenu, combat, x.id)
    local ennemis = adversaires(combat, x)
    local amis = __TS__ArrayFilter(
        allies(combat, x),
        function(____, a) return a.type ~= "invocation" end
    )
    local candidats = {}
    local function ajouter(a, bonus)
        if bonus == nil then
            bonus = 0
        end
        local p = proposer(ctx, a)
        if not p.estimation.possible then
            return
        end
        p.score = valeur(ctx, x, p) + bonus + preference(ctx, p, pref)
        candidats[#candidats + 1] = p
    end
    local ciblesAttaque = (if x.attaque.portee == "melee" then dispo.ciblesMelee else dispo.ciblesDistance)
    for ____, id in ipairs(ciblesAttaque) do
        ajouter({kind = "combat", action = {type = "attaque", acteur = x.id, cible = id}})
    end
    local faible = trier(
        __TS__ArrayFilter(
            {table.unpack(ennemis)},
            function(____, e) return __TS__ArrayIncludes(ciblesAttaque, e.id) end
        ),
        function(a, b) return a.pv - b.pv end
    )[1]
    if faible then
        ajouter({kind = "combat", action = {type = "viser", acteur = x.id, cible = faible.id, partie = "tete"}}, -0.05)
    end
    for ____, k in ipairs(__TS__ArrayFilter(
        dispo.competences,
        function(____, k) return k.utilisable end
    )) do
        local comp = k.comp
        if comp.cible == "ennemi" then
            local ids = (if comp.portee == "melee" then dispo.ciblesMelee else dispo.ciblesDistance)
            for ____, id in ipairs(ids) do
                ajouter({kind = "combat", action = {type = "competence", acteur = x.id, competence = comp.id, cible = id}})
            end
        elseif comp.cible == "allie" then
            local blesse = trier(
                {table.unpack(amis)},
                function(a, b) return a.pv / a.pvMax - b.pv / b.pvMax end
            )[1]
            if blesse then
                ajouter({kind = "combat", action = {type = "competence", acteur = x.id, competence = comp.id, cible = blesse.id}})
            end
        elseif comp.cible == "allie_ko" then
            for ____, id in ipairs(dispo.alliesKo) do
                ajouter({kind = "combat", action = {type = "competence", acteur = x.id, competence = comp.id, cible = id}})
            end
        else
            ajouter({kind = "combat", action = {type = "competence", acteur = x.id, competence = comp.id}})
        end
    end
    if dispo.potions > 0 then
        local blesse = trier(
            {table.unpack(amis)},
            function(a, b) return a.pv / a.pvMax - b.pv / b.pvMax end
        )[1]
        if blesse then
            ajouter({kind = "combat", action = {type = "objet", acteur = x.id, objet = "potion", cible = blesse.id}})
        end
    end
    if dispo.bombes > 0 then
        ajouter({kind = "combat", action = {type = "objet", acteur = x.id, objet = "bombe"}})
    end
    for ____, id in ipairs(dispo.pacifier) do
        ajouter({kind = "combat", action = {type = "pacifier", acteur = x.id, cible = id}}, 0.3)
    end
    ajouter({kind = "combat", action = {type = "defendre", acteur = x.id}})
    ajouter({kind = "combat", action = {type = "se_cacher", acteur = x.id}})
    if dispo.fuite then
        ajouter({kind = "combat", action = {type = "fuir", acteur = x.id}})
    end
    local vus = __TS__New(Set)
    return __TS__ArrayMap(
        __TS__ArraySlice(
            __TS__ArrayFilter(
                trier(
                    candidats,
                    function(a, b) return b.score - a.score end
                ),
                function(____, p)
                    if vus:has(p.libelle) then
                        return false
                    end
                    vus:add(p.libelle)
                    return true
                end
            ),
            0,
            nombre
        ),
        function(____, p) return __TS__ObjectAssign(
            {},
            p,
            {conseil = conseil(ctx, x, p)}
        ) end
    )
end
local FORMULES_OK = {"Compris :", "Entendu :", "C'est parti :", "Bien vu :"}
local FORMULES_NON = {"Impossible :", "Ça ne marchera pas :", "Pas possible :"}
local function formule(liste, texte)
    return liste[hachage(normaliser(texte)) % #liste + 1]
end
--- Analyse la phrase du joueur. Ne modifie rien.
function ____exports.interpreter(ctx, texte)
    local ____ctx_31 = ctx
    local contenu = ____ctx_31.contenu
    local combat = ____ctx_31.combat
    local x = __TS__ArrayFind(
        combat.combattants,
        function(____, c) return c.id == ctx.acteur end
    )
    local vide = {
        texte = texte,
        intention = "inconnu",
        confiance = 0,
        proposition = nil,
        possible = false,
        message = "",
        alternatives = {},
        compteCommeEssai = false,
        informations = {}
    }
    if not x or combat.enAttente ~= x.id then
        return __TS__ObjectAssign({}, vide, {message = "Ce n'est pas votre tour."})
    end
    if not vrai(__TS__StringTrim(texte)) then
        return __TS__ObjectAssign({}, vide, {message = "Écrivez ce que fait votre personnage."})
    end
    local m = mots(texte)
    local pred = predire(MODELE, texte)
    local intention = pred.classe
    local dispo = actionsDisponibles(contenu, combat, x.id)
    local possedees = __TS__ArrayMap(
        dispo.competences,
        function(____, k) return k.comp.id end
    )
    local citees = competencesCitees(
        contenu,
        m,
        __TS__ArrayFilter(
            possedees,
            function(____, id) return contenu.competences[id] end
        )
    )
    local elements = elementsCites(m)
    local partie = partieCitee(m)
    local ____ennemiCite_result_32 = ennemiCite(combat, x, m)
    local cible = ____ennemiCite_result_32.cible
    local tous = ____ennemiCite_result_32.tous
    local allie = allieCite(combat, x, m)
    local combine = trouverMots(m, MOTS_COMBINER)
    if intention == "fusionner" and not combine and #citees < 2 and #elements < 2 then
        intention = (if #citees > 0 then "competence" else "attaquer")
    end
    if #citees >= 2 and (combine or __TS__ArrayIncludes(m, "et") or __TS__ArrayIncludes(m, "plus")) then
        intention = "fusionner"
    elseif #citees >= 1 and not __TS__ArrayIncludes({"soigner", "proteger", "fusionner"}, intention) then
        intention = "competence"
    elseif partie and __TS__ArrayIncludes({"attaquer", "competence", "inconnu"}, intention) and #citees == 0 then
        intention = "viser"
    end
    if intention == "inconnu" or pred.confiance < 0.3 then
        if #citees == 0 and not partie then
            intention = "inconnu"
        end
    end
    local pref = {intention = intention, element = elements[1] or nil, cible = cible and cible.id or nil}
    local function resultat(action, raisonSiNul)
        local proposition = (if action then proposer(ctx, action) else nil)
        local possible = not not (proposition and proposition.estimation.possible)
        local raison = proposition and proposition.estimation.raison or raisonSiNul or "Je n'ai pas compris l'action."
        if possible and proposition then
            proposition.conseil = conseil(ctx, x, proposition)
        end
        local alternatives = __TS__ArrayFilter(
            ____exports.conseiller(
                ctx,
                __TS__ObjectAssign(
                    {},
                    pref,
                    {distance = __TS__StringIncludes(raison, "rang arrière") or __TS__StringIncludes(raison, "portée")}
                ),
                (if possible then 2 else 3)
            ),
            function(____, a) return not proposition or a.libelle ~= proposition.libelle end
        )
        return {
            texte = texte,
            intention = intention,
            confiance = pred.confiance,
            proposition = proposition,
            possible = possible,
            alternatives = alternatives,
            informations = {},
            compteCommeEssai = not possible,
            message = (if possible then ((formule(FORMULES_OK, texte) .. " ") .. proposition.libelle) .. "." else __TS__StringTrim((((formule(FORMULES_NON, texte) .. " ") .. (if __TS__StringEndsWith(raison, ".") then string.sub(raison, 1, -2) else raison)) .. ". ") .. (if #alternatives > 0 then "Voici ce que vous pouvez faire à la place :" else "")))
        }
    end
    local function cibleOuDefaut(portee)
        return cible and cible.id or (if portee == "melee" then dispo.ciblesMelee else dispo.ciblesDistance)[1]
    end
    repeat
        local ____switch154 = intention
        local ____cond154 = ____switch154 == "fusionner"
        if ____cond154 then
            do
                local p, q = table.unpack(
                    __TS__ArrayMap(
                        citees,
                        function(____, c) return c.id end
                    ),
                    1,
                    2
                )
                if (not vrai(p) or not vrai(q)) and #elements >= 2 then
                    local function parElement(el)
                        return __TS__ArrayFind(
                            possedees,
                            function(____, id)
                                local k = contenu.competences[id]
                                return k and elementDe(k) == el
                            end
                        )
                    end
                    if p == nil then
                        p = parElement(elements[1])
                    end
                    q = parElement(elements[2])
                end
                if not vrai(p) or not vrai(q) then
                    local connues = (if ctx.heros then competencesConnues(contenu, ctx.heros) else possedees)
                    local pasConnue = __TS__ArrayFind(
                        valeurs(contenu.competences),
                        function(____, k) return not __TS__ArrayIncludes(connues, k.id) and correspondance(k.nom, m) >= 0.75 end
                    )
                    return resultat(nil, (if pasConnue then ("Vous ne connaissez pas « " .. pasConnue.nom) .. " »" else "Pour une fusion, nommez deux de vos compétences (ou deux éléments que vous maîtrisez)"))
                end
                local function aDegats(id)
                    local ____opt_41 = contenu.competences[id]
                    if ____opt_41 ~= nil then
                        local ____opt_42 = contenu.competences[id]
                        ____opt_41 = __TS__ArraySome(
                            ____opt_42 and ____opt_42.effets,
                            function(____, e) return e.type == "degats" end
                        )
                    end
                    return not not ____opt_41
                end
                if not aDegats(p) and aDegats(q) then
                    p, q = q, p
                end
                local base = contenu.competences[p]
                local portee = base and base.portee or "distance"
                return resultat({kind = "fusion", parent = p, secondaire = q, cible = (if (base and base.cible) == "ennemi" then cibleOuDefaut(portee) else nil)})
            end
        end
        ____cond154 = ____cond154 or (____switch154 == "competence" or ____switch154 == "soigner" or ____switch154 == "proteger" or ____switch154 == "provoquer" or ____switch154 == "invoquer")
        if ____cond154 then
            do
                local ____opt_49 = citees[1]
                local id = ____opt_49 and ____opt_49.id
                local comps = __TS__ArrayMap(
                    dispo.competences,
                    function(____, k) return k.comp end
                )
                if not vrai(id) then
                    local function cherche(f)
                        local ____opt_51 = __TS__ArrayFind(
                            comps,
                            function(____, k) return f(k) end
                        )
                        return ____opt_51 and ____opt_51.id
                    end
                    if intention == "soigner" then
                        id = cherche(function(k) return __TS__ArraySome(
                            k.effets,
                            function(____, e) return e.type == "soin" end
                        ) end)
                    elseif intention == "proteger" then
                        id = cherche(function(k) return k.cible == "allie" and __TS__ArraySome(
                            k.effets,
                            function(____, e) return e.type == "bouclier" end
                        ) end)
                    elseif intention == "provoquer" then
                        id = cherche(function(k) return __TS__ArraySome(
                            k.effets,
                            function(____, e) return e.type == "etat" and e.etat == "provoque" end
                        ) end)
                    elseif intention == "invoquer" then
                        id = cherche(function(k) return __TS__ArraySome(
                            k.effets,
                            function(____, e) return e.type == "invocation" end
                        ) end)
                    elseif #elements > 0 then
                        id = cherche(function(k) return elementDe(k) == elements[1] end)
                    else
                        local meilleure = __TS__ArrayFind(
                            ____exports.conseiller(ctx, {intention = intention}, 8),
                            function(____, p) return p.action.kind == "combat" and p.action.action.type == "competence" end
                        )
                        id = (if (meilleure and meilleure.action.kind) == "combat" and meilleure.action.action.type == "competence" then meilleure.action.action.competence else nil)
                    end
                end
                if not vrai(id) then
                    if intention == "soigner" then
                        if dispo.potions > 0 then
                            return resultat({kind = "combat", action = {type = "objet", acteur = x.id, objet = "potion", cible = allie and allie.id or x.id}})
                        end
                        return resultat(nil, "Vous n'avez ni sort de soin ni potion")
                    end
                    if intention == "proteger" then
                        return resultat(nil, ("Vous n'avez pas de technique pour protéger un allié" .. (if allie then " comme " .. allie.nom else "")) .. " ; seul un Gardien sacré sait s'interposer")
                    end
                    if intention == "provoquer" then
                        return resultat(nil, "Vous n'avez pas de technique de provocation")
                    end
                    if intention == "invoquer" then
                        return resultat(nil, "Vous ne savez pas invoquer de créature")
                    end
                    local autre = __TS__ArrayFind(
                        valeurs(contenu.competences),
                        function(____, k) return correspondance(k.nom, m) >= 0.75 end
                    )
                    if autre then
                        local classe = __TS__ArrayFind(
                            valeurs(contenu.classes),
                            function(____, c) return __TS__ArraySome(
                                c.competences_detail,
                                function(____, d) return d.id == autre.id end
                            ) end
                        )
                        return resultat(nil, (("Vous ne connaissez pas « " .. autre.nom) .. " »") .. (if classe then (" (c'est une compétence de " .. classe.nom) .. ")" else ""))
                    end
                    if #elements > 0 then
                        return resultat(nil, "Vous ne maîtrisez pas la magie de " .. (NOM_ELEMENT[elements[1]] or elements[1]))
                    end
                    return resultat(nil, "Vous n'avez pas de compétence utilisable pour ça")
                end
                local comp = competenceDe(ctx, id)
                local c
                if comp.cible == "ennemi" then
                    c = cibleOuDefaut(comp.portee)
                elseif comp.cible == "allie" then
                    local ____opt_57 = allie or trier(
                        __TS__ArrayFilter(
                            {table.unpack(allies(combat, x))},
                            function(____, a) return a.type ~= "invocation" end
                        ),
                        function(a, b) return a.pv / a.pvMax - b.pv / b.pvMax end
                    )[1]
                    c = ____opt_57 and ____opt_57.id
                elseif comp.cible == "allie_ko" then
                    c = dispo.alliesKo[1]
                end
                local ____ = tous
                return resultat({kind = "combat", action = {type = "competence", acteur = x.id, competence = id, cible = c}})
            end
        end
        ____cond154 = ____cond154 or ____switch154 == "attaquer"
        if ____cond154 then
            return resultat({
                kind = "combat",
                action = {
                    type = "attaque",
                    acteur = x.id,
                    cible = cibleOuDefaut(x.attaque.portee) or ""
                }
            })
        end
        ____cond154 = ____cond154 or ____switch154 == "viser"
        if ____cond154 then
            return resultat({
                kind = "combat",
                action = {
                    type = "viser",
                    acteur = x.id,
                    cible = cibleOuDefaut(x.attaque.portee) or "",
                    partie = partie or "tete"
                }
            })
        end
        ____cond154 = ____cond154 or ____switch154 == "defendre"
        if ____cond154 then
            return resultat({kind = "combat", action = {type = "defendre", acteur = x.id}})
        end
        ____cond154 = ____cond154 or ____switch154 == "fuir"
        if ____cond154 then
            return resultat({kind = "combat", action = {type = "fuir", acteur = x.id}})
        end
        ____cond154 = ____cond154 or ____switch154 == "se_cacher"
        if ____cond154 then
            return resultat({kind = "combat", action = {type = "se_cacher", acteur = x.id}})
        end
        ____cond154 = ____cond154 or ____switch154 == "bombe"
        if ____cond154 then
            if dispo.bombes <= 0 then
                return resultat(nil, "Vous n'avez pas de bombe sur vous")
            end
            return resultat({kind = "combat", action = {type = "objet", acteur = x.id, objet = "bombe"}})
        end
        ____cond154 = ____cond154 or ____switch154 == "voler"
        if ____cond154 then
            do
                local r = (if x.race == "sang-dragon" then "Votre sang de dragon vous donne des écailles, pas des ailes : impossible de voler" else "Votre personnage n'a pas d'ailes : impossible de voler")
                pref.distance = true
                return resultat(nil, r)
            end
        end
        ____cond154 = ____cond154 or ____switch154 == "pacifier"
        if ____cond154 then
            do
                local ____opt_59 = x.don
                if (____opt_59 and ____opt_59.id) ~= "langue-universelle" then
                    return resultat(nil, "Les créatures ne comprennent pas votre langue : seul le don « Langue universelle » permet de les raisonner")
                end
                if not cible then
                    return resultat(nil, "À qui voulez-vous parler ?")
                end
                return resultat({kind = "combat", action = {type = "pacifier", acteur = x.id, cible = cible.id}})
            end
        end
        ____cond154 = ____cond154 or ____switch154 == "changer_rang"
        if ____cond154 then
            do
                local veutAvant = trouverMots(m, {
                    "avance",
                    "devant",
                    "front",
                    "premiere",
                    "premier"
                })
                local veutArriere = trouverMots(m, {
                    "recule",
                    "derriere",
                    "arriere",
                    "second",
                    "abri"
                })
                if veutAvant and x.rang == "avant" or veutArriere and not veutAvant and x.rang == "arriere" then
                    return resultat(nil, "Vous êtes déjà au rang " .. (if x.rang == "avant" then "avant" else "arrière"))
                end
                return resultat({kind = "combat", action = {type = "changer_rang", acteur = x.id}})
            end
        end
        ____cond154 = ____cond154 or ____switch154 == "analyser"
        if ____cond154 then
            do
                local infos = __TS__ArrayMap(
                    adversaires(combat, x),
                    function(____, e)
                        local l = {((e.nom .. " : ") .. tostring(math.floor(e.pv / e.pvMax * 100 + 0.5))) .. " % de PV"}
                        if #e.etats > 0 then
                            l[#l + 1] = "état : " .. table.concat(
                                __TS__ArrayMap(
                                    e.etats,
                                    function(____, s) return string.lower(NOMS_ETATS[s.id]) end
                                ),
                                ", "
                            )
                        end
                        local ____opt_61 = x.don
                        local sait = (____opt_61 and ____opt_61.id) == "oeil-du-seuil" or x.caracs.INT >= 12 or x.caracs.ESP >= 12
                        if sait then
                            local faibles = __TS__ArrayMap(
                                __TS__ArrayFilter(
                                    entrees(e.resistances),
                                    function(____, ____bindingPattern0)
                                        local v
                                        v = ____bindingPattern0[2]
                                        return (v or 0) < 0
                                    end
                                ),
                                function(____, ____bindingPattern0)
                                    local k
                                    k = ____bindingPattern0[1]
                                    return NOM_ELEMENT[k] or k
                                end
                            )
                            local forts = __TS__ArrayMap(
                                __TS__ArrayFilter(
                                    entrees(e.resistances),
                                    function(____, ____bindingPattern0)
                                        local v
                                        v = ____bindingPattern0[2]
                                        return (v or 0) > 0
                                    end
                                ),
                                function(____, ____bindingPattern0)
                                    local k
                                    k = ____bindingPattern0[1]
                                    return NOM_ELEMENT[k] or k
                                end
                            )
                            if #faibles > 0 then
                                l[#l + 1] = "craint : " .. table.concat(faibles, ", ")
                            end
                            if #forts > 0 then
                                l[#l + 1] = "résiste : " .. table.concat(forts, ", ")
                            end
                        end
                        local ____opt_63 = x.don
                        if (____opt_63 and ____opt_63.id) == "oeil-du-seuil" then
                            l[#l + 1] = ((tostring(e.pv) .. "/") .. tostring(e.pvMax)) .. " PV exactement"
                        end
                        return table.concat(l, " — ")
                    end
                )
                local alternatives = ____exports.conseiller(ctx, pref, 3)
                local ____texte_67 = texte
                local ____intention_68 = intention
                local ____pred_confiance_69 = pred.confiance
                local ____alternatives_70 = alternatives
                local ____opt_65 = x.don
                return {
                    texte = ____texte_67,
                    intention = ____intention_68,
                    confiance = ____pred_confiance_69,
                    proposition = nil,
                    possible = false,
                    alternatives = ____alternatives_70,
                    informations = infos,
                    compteCommeEssai = false,
                    message = ("Vous observez le champ de bataille" .. (if (____opt_65 and ____opt_65.id) == "oeil-du-seuil" then " (Œil du Seuil)" else "")) .. ". Cela ne vous coûte pas votre tour."
                }
            end
        end
        do
            return resultat(nil, "Je n'ai pas compris l'action. Essayez par exemple « j'attaque le loup », « je vise la tête », « je lance Javelot de flamme sur le mage » ou « je me cache »")
        end
    until true
end
--- Mode « suivre le script » : les meilleures propositions, sans rien écrire.
function ____exports.propositionsScript(ctx)
    return ____exports.conseiller(ctx, {}, 3)
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
    local ____export = require("src.moteur.equipement")
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
do
    local ____interpreteur = require("src.ia.interpreteur")
    ____exports.interpreter = ____interpreteur.interpreter
    ____exports.propositionsScript = ____interpreteur.propositionsScript
    ____exports.conseiller = ____interpreteur.conseiller
end
do
    local ____texte = require("src.ia.texte")
    ____exports.normaliser = ____texte.normaliser
end
do
    local ____texte = require("src.ia.texte")
    ____exports.traits = ____texte.traits
    ____exports.hachage = ____texte.hachage
end
do
    local ____classificateur = require("src.ia.classificateur")
    ____exports.predire = ____classificateur.predire
end
return ____exports
 end,
["src.ia.modele"] = function(...) 
--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
return {
    version = 2,
    classes = {
        "attaquer",
        "competence",
        "viser",
        "defendre",
        "proteger",
        "fuir",
        "se_cacher",
        "soigner",
        "bombe",
        "voler",
        "pacifier",
        "changer_rang",
        "fusionner",
        "analyser",
        "provoquer",
        "invoquer"
    },
    alpha = 0.5,
    docs = {
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320,
        320
    },
    vocab = {
        "maintenant",
        "je",
        "fais",
        "apparaitr",
        "un",
        "alli",
        "vite",
        "maintenant_je",
        "je_fais",
        "fais_apparaitr",
        "apparaitr_un",
        "un_alli",
        "alli_vite",
        "vais",
        "diversion",
        "je_vais",
        "vais_je",
        "fais_diversion",
        "allez",
        "le",
        "transperc",
        "allez_je",
        "je_le",
        "le_transperc",
        "ok",
        "me",
        "jett",
        "sur",
        "lui",
        "ok_je",
        "je_me",
        "me_jett",
        "jett_sur",
        "sur_lui",
        "dissimul",
        "me_dissimul",
        "veux",
        "tourn",
        "les",
        "talon",
        "je_veux",
        "veux_je",
        "je_tourn",
        "tourn_les",
        "les_talon",
        "une",
        "fusion",
        "poison",
        "fais_une",
        "une_fusion",
        "poison_vite",
        "vas",
        "y",
        "recul",
        "au",
        "second",
        "rang",
        "vas_y",
        "y_je",
        "je_recul",
        "recul_au",
        "au_second",
        "second_rang",
        "prepar",
        "a",
        "parer",
        "me_prepar",
        "prepar_a",
        "a_parer",
        "taper",
        "plus",
        "faibl",
        "taper_le",
        "le_plus",
        "plus_faibl",
        "soign",
        "avec",
        "hymn",
        "de",
        "guerison",
        "je_soign",
        "soign_avec",
        "avec_hymn",
        "hymn_de",
        "de_guerison",
        "du",
        "coup",
        "pass",
        "derrier",
        "tout",
        "suit",
        "du_coup",
        "coup_je",
        "je_pass",
        "pass_derrier",
        "derrier_tout",
        "tout_de",
        "de_suit",
        "bon",
        "repli",
        "l",
        "arrier",
        "bon_je",
        "me_repli",
        "repli_a",
        "a_l",
        "l_arrier",
        "arrier_tout",
        "j",
        "essai",
        "tend",
        "la",
        "main",
        "vers",
        "ce",
        "monstr",
        "j_essai",
        "essai_de",
        "de_je",
        "je_tend",
        "tend_la",
        "la_main",
        "main_vers",
        "vers_ce",
        "ce_monstr",
        "prteg",
        "ilo",
        "je_prteg",
        "defend",
        "gardien",
        "je_defend",
        "defend_le",
        "le_gardien",
        "il",
        "faut",
        "fuir",
        "il_faut",
        "faut_fuir",
        "demand",
        "partir",
        "sans",
        "reflechir",
        "je_lui",
        "lui_demand",
        "demand_de",
        "de_partir",
        "partir_sans",
        "sans_reflechir",
        "competenc",
        "feux",
        "follet",
        "gobelin",
        "feux_follet",
        "follet_sur",
        "sur_ce",
        "ce_gobelin",
        "gobelin_vite",
        "associ",
        "echang",
        "d",
        "ame",
        "entaill",
        "runiqu",
        "j_associ",
        "echang_d",
        "d_ame",
        "a_entaill",
        "entaill_runiqu",
        "runiqu_tout",
        "tant",
        "pis",
        "bats",
        "des",
        "aile",
        "fort",
        "tant_pis",
        "pis_je",
        "je_bats",
        "bats_des",
        "des_aile",
        "aile_fort",
        "convainc",
        "bandit",
        "je_convainc",
        "convainc_le",
        "le_bandit",
        "bandit_de",
        "partir_fort",
        "mets",
        "en",
        "gard",
        "me_mets",
        "mets_en",
        "en_gard",
        "sceau",
        "silenc",
        "sceau_de",
        "de_silenc",
        "silenc_sur",
        "sur_le",
        "decoup",
        "chef",
        "mes",
        "forc",
        "je_decoup",
        "decoup_le",
        "le_chef",
        "chef_de",
        "de_tout",
        "tout_mes",
        "mes_forc",
        "eclat",
        "je_l",
        "l_eclat",
        "partir_vite",
        "vise",
        "gore",
        "pour",
        "desarm",
        "je_vise",
        "vise_la",
        "la_gore",
        "pour_le",
        "le_desarm",
        "desarm_sans",
        "proteg",
        "je_proteg",
        "proteg_mes",
        "mes_alli",
        "alli_fort",
        "gros",
        "vers_le",
        "le_gros",
        "frapp",
        "ecarlat",
        "et",
        "frenesi",
        "meme",
        "temp",
        "bon_frapp",
        "frapp_ecarlat",
        "ecarlat_et",
        "et_frenesi",
        "frenesi_en",
        "en_meme",
        "meme_temp",
        "temp_tout",
        "provoqu",
        "je_provoqu",
        "provoqu_le",
        "chef_sans",
        "etrip",
        "l_etrip",
        "detal",
        "je_detal",
        "detal_tout",
        "jamb",
        "vise_les",
        "les_jamb",
        "utilis",
        "de_j",
        "j_utilis",
        "raisonn",
        "maintenant_j",
        "de_raisonn",
        "raisonn_le",
        "faibl_de",
        "cach",
        "pili",
        "me_cach",
        "cach_derrier",
        "derrier_un",
        "un_pili",
        "pili_fort",
        "heal",
        "ma",
        "etudi",
        "l_etudi",
        "tir",
        "preci",
        "dans",
        "chevill",
        "tir_preci",
        "preci_dans",
        "dans_les",
        "les_chevill",
        "chevill_de",
        "fond",
        "ciel",
        "vorthak",
        "je_fond",
        "fond_du",
        "du_ciel",
        "ciel_sur",
        "sur_vorthak",
        "analys",
        "j_analys",
        "analys_le",
        "bandit_sans",
        "plan",
        "dessu",
        "combat",
        "je_plan",
        "plan_au",
        "au_dessu",
        "dessu_du",
        "du_combat",
        "prend",
        "fuit",
        "je_prend",
        "prend_la",
        "la_fuit",
        "m",
        "effac",
        "ombr",
        "je_m",
        "m_effac",
        "effac_dans",
        "dans_l",
        "l_ombr",
        "ombr_sans",
        "appell",
        "aide",
        "bete",
        "j_appell",
        "appell_a",
        "l_aide",
        "aide_une",
        "une_bete",
        "bete_de",
        "chang",
        "je_chang",
        "chang_de",
        "de_rang",
        "invoqu",
        "creatur",
        "bon_j",
        "j_invoqu",
        "invoqu_une",
        "une_creatur",
        "creatur_fort",
        "insult",
        "qu",
        "ils",
        "cibl",
        "je_les",
        "les_insult",
        "insult_pour",
        "pour_qu",
        "qu_ils",
        "ils_me",
        "me_cibl",
        "planqu",
        "mur",
        "surprendr",
        "me_planqu",
        "planqu_derrier",
        "un_mur",
        "mur_pour",
        "le_surprendr",
        "surprendr_sans",
        "ici",
        "m_en",
        "en_vais",
        "vais_d",
        "d_ici",
        "position",
        "je_gard",
        "gard_ma",
        "ma_position",
        "position_de",
        "planqu_vite",
        "sangli",
        "utilis_ma",
        "ma_competenc",
        "competenc_sur",
        "le_sangli",
        "quitt",
        "je_quitt",
        "quitt_le",
        "le_combat",
        "bois",
        "potion",
        "je_bois",
        "bois_une",
        "une_potion",
        "potion_de",
        "grenad",
        "ok_grenad",
        "grenad_sur",
        "gros_sans",
        "attend",
        "y_j",
        "j_attend",
        "attend_en",
        "cree",
        "nouvell",
        "techniqu",
        "incendiair",
        "flech",
        "marquant",
        "je_cree",
        "cree_une",
        "une_nouvell",
        "nouvell_techniqu",
        "techniqu_avec",
        "avec_grenad",
        "grenad_incendiair",
        "incendiair_et",
        "et_flech",
        "flech_marquant",
        "pis_j",
        "hurl",
        "attir",
        "ennemi",
        "moi",
        "je_hurl",
        "hurl_pour",
        "pour_attir",
        "attir_les",
        "les_ennemi",
        "ennemi_sur",
        "sur_moi",
        "moi_fort",
        "interpos",
        "mon",
        "ami",
        "m_interpos",
        "interpos_pour",
        "pour_proteg",
        "proteg_mon",
        "mon_ami",
        "ami_fort",
        "combin",
        "je_combin",
        "et_ombr",
        "ombr_vite",
        "lanc",
        "purification",
        "je_lanc",
        "lanc_purification",
        "prend_une",
        "encaiss",
        "j_encaiss",
        "combat_tout",
        "couvr",
        "me_couvr",
        "calm",
        "je_calm",
        "calm_vorthak",
        "vorthak_vite",
        "nuag",
        "toxiqu",
        "nuag_toxiqu",
        "toxiqu_sur",
        "charg",
        "je_charg",
        "charg_le",
        "pass_a",
        "arrier_sans",
        "balanc",
        "explosif",
        "je_balanc",
        "balanc_un",
        "un_explosif",
        "explosif_sans",
        "cran",
        "vise_le",
        "le_cran",
        "cran_pour",
        "desarm_de",
        "lui_coup",
        "coup_les",
        "retap",
        "me_retap",
        "fous",
        "pain",
        "lui_fous",
        "fous_un",
        "un_pain",
        "saint",
        "loup",
        "saint_sur",
        "le_loup",
        "revien",
        "je_revien",
        "revien_en",
        "en_arrier",
        "cogn",
        "gele",
        "je_cogn",
        "la_gele",
        "rest",
        "defensiv",
        "frce",
        "je_rest",
        "rest_sur",
        "sur_la",
        "la_defensiv",
        "mes_frce",
        "appel",
        "pierr",
        "appel_du",
        "du_gardien",
        "gardien_de",
        "de_pierr",
        "pierr_sur",
        "me_proteg",
        "proteg_tout",
        "nargu",
        "tuot",
        "les_nargu",
        "de_tuot",
        "tuot_mes",
        "envol",
        "esquiv",
        "m_envol",
        "envol_pour",
        "pour_esquiv",
        "givr",
        "fusion_givr",
        "givr_poison",
        "dis",
        "lui_dis",
        "dis_de",
        "survol",
        "champ",
        "bataill",
        "je_survol",
        "survol_le",
        "le_champ",
        "champ_de",
        "de_bataill",
        "aile_sans",
        "bomb",
        "une_bomb",
        "cour",
        "je_cour",
        "boucli",
        "je_mets",
        "mets_un",
        "un_boucli",
        "boucli_a",
        "a_moi",
        "moi_de",
        "bon_il",
        "souffl",
        "ancetr",
        "mond",
        "souffl_des",
        "des_ancetr",
        "ancetr_sur",
        "sur_tout",
        "tout_le",
        "le_mond",
        "mond_tout",
        "cibl_sans",
        "on",
        "pis_on",
        "on_fuit",
        "fuit_de",
        "ordonn",
        "s",
        "eloign",
        "lui_ordonn",
        "ordonn_de",
        "de_s",
        "s_eloign",
        "eloign_fort",
        "onde",
        "demon",
        "onde_de",
        "de_givr",
        "givr_sur",
        "le_demon",
        "demon_de",
        "prend_mon",
        "mon_envol",
        "golem",
        "invoqu_un",
        "un_golem",
        "devien",
        "discret",
        "je_devien",
        "devien_discret",
        "avanc",
        "coup_j",
        "j_avanc",
        "faufil",
        "son",
        "dos",
        "me_faufil",
        "faufil_dans",
        "dans_son",
        "son_dos",
        "calm_ce",
        "derrier_de",
        "rend",
        "pv",
        "kael",
        "je_rend",
        "rend_des",
        "des_pv",
        "pv_a",
        "a_kael",
        "kael_vite",
        "pain_vite",
        "camoufl",
        "me_camoufl",
        "fuis",
        "recul_et",
        "et_je",
        "je_fuis",
        "fuis_le",
        "fiol",
        "explosiv",
        "je_jett",
        "jett_une",
        "une_fiol",
        "fiol_explosiv",
        "explosiv_de",
        "la_bete",
        "defens",
        "tour",
        "pass_mon",
        "mon_tour",
        "tour_en",
        "en_defens",
        "regener",
        "je_regener",
        "kael_fort",
        "provoqu_ce",
        "ce_loup",
        "eux",
        "lanc_un",
        "explosif_sur",
        "sur_eux",
        "eux_tout",
        "saut",
        "boss",
        "je_saut",
        "saut_sur",
        "le_boss",
        "je_frapp",
        "cherch",
        "je_cherch",
        "cherch_son",
        "fauch",
        "ses",
        "je_fauch",
        "fauch_ses",
        "ses_jamb",
        "boomb",
        "lanc_une",
        "restt",
        "air",
        "je_restt",
        "en_l",
        "l_air",
        "air_sans",
        "examin",
        "j_examin",
        "examin_l",
        "l_ennemi",
        "ennemi_sans",
        "egle",
        "bomb_sur",
        "la_egle",
        "refelchir",
        "raisonn_l",
        "sans_refelchir",
        "visag",
        "frapp_au",
        "au_visag",
        "frapp_ce",
        "poignet",
        "fair",
        "lach",
        "arme",
        "frapp_son",
        "son_poignet",
        "poignet_pour",
        "pour_lui",
        "lui_fair",
        "fair_lach",
        "lach_son",
        "son_arme",
        "arme_fort",
        "ok_on",
        "parl",
        "mage",
        "je_parl",
        "parl_a",
        "a_le",
        "le_mage",
        "mage_vite",
        "equip",
        "proteg_l",
        "l_equip",
        "renfort",
        "invoqu_des",
        "des_renfort",
        "renfort_fort",
        "postur",
        "postur_defensiv",
        "premier",
        "lign",
        "en_premier",
        "premier_lign",
        "immol",
        "l_immol",
        "attaqu",
        "ok_j",
        "j_attaqu",
        "attaqu_le",
        "le_golem",
        "furtif",
        "en_furtif",
        "quell",
        "sont",
        "faibless",
        "quell_sont",
        "sont_ses",
        "ses_faibless",
        "faibless_de",
        "fais_un",
        "marquant_tout",
        "ballad",
        "courag",
        "ballad_du",
        "du_courag",
        "esai",
        "j_esai",
        "esai_de",
        "me_heal",
        "heal_vite",
        "cibl_fort",
        "est",
        "contr",
        "quoi",
        "il_est",
        "est_fort",
        "fort_contr",
        "contr_quoi",
        "quoi_tout",
        "tire",
        "bras",
        "lui_tire",
        "tire_dans",
        "dans_le",
        "le_bras",
        "decoll",
        "je_decoll",
        "celui",
        "gauch",
        "sur_celui",
        "celui_de",
        "de_gauch",
        "gauch_vite",
        "me_defend",
        "avelin",
        "ok_boucli",
        "boucli_sur",
        "sur_avelin",
        "avelin_fort",
        "renfort_de",
        "combien",
        "combien_de",
        "de_pv",
        "pv_il",
        "il_lui",
        "lui_rest",
        "loup_vite",
        "de_potion",
        "negoci",
        "je_negoci",
        "negoci_avec",
        "avec_ce",
        "gobelin_tout",
        "provocation",
        "y_provocation",
        "provocation_tout",
        "vise_son",
        "javelot",
        "flamm",
        "et_javelot",
        "javelot_de",
        "de_flamm",
        "pourfend",
        "je_pourfend",
        "pourfend_le",
        "bandit_tout",
        "un_coup",
        "coup_dans",
        "cultist",
        "le_cultist",
        "invocation",
        "pis_invocation",
        "invocation_de",
        "leur",
        "attention",
        "j_attir",
        "attir_leur",
        "leur_attention",
        "attention_vite",
        "chevill_vite",
        "rempart",
        "camarad",
        "un_rempart",
        "rempart_pour",
        "pour_ma",
        "ma_camarad",
        "chatim",
        "allez_j",
        "a_purification",
        "tete",
        "la_tete",
        "invisibl",
        "me_rend",
        "rend_invisibl",
        "invisibl_de",
        "explos",
        "fais_tout",
        "tout_explos",
        "regard",
        "je_regard",
        "regard_ses",
        "explos_vite",
        "tire_dessu",
        "file",
        "vitess",
        "je_file",
        "file_a",
        "a_tout",
        "tout_vitess",
        "proteg_avelin",
        "monst",
        "ce_monst",
        "rejoin",
        "premi",
        "je_rejoin",
        "rejoin_le",
        "le_premi",
        "premi_rang",
        "accord",
        "dissonant",
        "accord_dissonant",
        "tranch",
        "je_tranch",
        "tranch_les",
        "jamb_de",
        "de_ce",
        "monstr_sans",
        "devant",
        "vais_devant",
        "devant_tout",
        "elanc",
        "m_elanc",
        "elanc_dans",
        "le_ciel",
        "ciel_fort",
        "lboqu",
        "je_lboqu",
        "pars",
        "courant",
        "je_pars",
        "pars_en",
        "en_courant",
        "yeux",
        "je_tire",
        "tire_une",
        "une_flech",
        "flech_dans",
        "les_yeux",
        "yeux_de",
        "de_lui",
        "lui_de",
        "fendoir",
        "veux_j",
        "defens_de",
        "visag_de",
        "je_gele",
        "gele_le",
        "cran_de",
        "y_heal",
        "heal_mon",
        "ami_tout",
        "pans",
        "blessur",
        "je_pans",
        "pans_les",
        "les_blessur",
        "blessur_de",
        "de_mon",
        "mon_alli",
        "nargu_vite",
        "alez",
        "lannc",
        "alez_je",
        "je_lannc",
        "quel",
        "faibless_fort",
        "apais",
        "l_apais",
        "apais_vite",
        "quoi_de",
        "provoqu_tout",
        "atir",
        "j_atir",
        "atir_leur",
        "scann",
        "rat",
        "je_scann",
        "scann_le",
        "le_rat",
        "lumier",
        "apaisant",
        "lumier_apaisant",
        "apaisant_sur",
        "sur_mon",
        "lign_tout",
        "discut",
        "je_discut",
        "discut_avec",
        "gobelin_de",
        "fonc",
        "tas",
        "je_fonc",
        "fonc_dans",
        "le_tas",
        "odonn",
        "lui_odonn",
        "odonn_de",
        "derier",
        "roch",
        "un_roch",
        "tent",
        "pacifi",
        "je_tent",
        "tent_de",
        "de_pacifi",
        "melang",
        "eclair",
        "je_melang",
        "melang_le",
        "le_eclair",
        "eclair_et",
        "et_la",
        "la_lumier",
        "gueri",
        "je_gueri",
        "vole",
        "je_vole",
        "vole_au",
        "dessu_de",
        "de_le",
        "fusionn",
        "deux",
        "sort",
        "je_fusionn",
        "fusionn_mes",
        "mes_deux",
        "deux_sort",
        "apprivois",
        "j_apprivois",
        "apprivois_le",
        "elev",
        "airs",
        "m_elev",
        "elev_dans",
        "les_airs",
        "pose",
        "tourell",
        "je_pose",
        "pose_une",
        "une_tourell",
        "tourell_fort",
        "tranch_le",
        "demon_fort",
        "se",
        "cass",
        "on_se",
        "se_cass",
        "je_dis",
        "dis_a",
        "de_fuir",
        "fuir_fort",
        "convoqu",
        "esprit",
        "je_convoqu",
        "convoqu_un",
        "un_esprit",
        "esprit_fort",
        "esprit_vite",
        "recroquevill",
        "me_recroquevill",
        "recroquevill_derrier",
        "derrier_mon",
        "mon_boucli",
        "boucli_vite",
        "suiit",
        "rest_tout",
        "de_suiit",
        "redonn",
        "sant",
        "je_redonn",
        "redonn_de",
        "de_la",
        "la_sant",
        "sant_a",
        "rune",
        "rune_de",
        "de_gard",
        "gard_et",
        "et_nuag",
        "lui_file",
        "file_un",
        "coup_de",
        "de_boucli",
        "boucli_fort",
        "heal_moi",
        "chain",
        "givrr",
        "vais_j",
        "eclair_en",
        "en_chain",
        "balayag",
        "veux_balayag",
        "balayag_dans",
        "sangli_sans",
        "araign",
        "lanc_mon",
        "mon_sort",
        "sort_sur",
        "sur_l",
        "l_araign",
        "cherch_ses",
        "se_repli",
        "group",
        "de_bomb",
        "le_group",
        "notr",
        "guerisseur",
        "je_couvr",
        "couvr_notr",
        "notr_guerisseur",
        "canalis",
        "magi",
        "venin",
        "je_canalis",
        "canalis_ma",
        "ma_magi",
        "magi_de",
        "de_venin",
        "venin_de",
        "tourell_de",
        "leve",
        "je_leve",
        "leve_mon",
        "boucli_tout",
        "couvr_kael",
        "comprendr",
        "ne",
        "veut",
        "pas",
        "mal",
        "lui_fais",
        "fais_comprendr",
        "comprendr_qu",
        "qu_on",
        "on_ne",
        "ne_lui",
        "lui_veut",
        "veut_pas",
        "pas_de",
        "de_mal",
        "elixir",
        "et_elixir",
        "elixir_de",
        "de_combat",
        "creatur_de",
        "maintenant_bomb",
        "tourell_tout",
        "sauv",
        "qui",
        "peut",
        "sauv_qui",
        "qui_peut",
        "peut_fort",
        "pass_en",
        "coup_bomb",
        "pare",
        "je_pare",
        "pleuvoir",
        "fais_pleuvoir",
        "pleuvoir_de",
        "la_givr",
        "envoi",
        "lui_envoi",
        "envoi_un",
        "un_pas",
        "pas_d",
        "d_ombr",
        "ombr_tout",
        "bomb_sans",
        "boul",
        "de_boul",
        "boul_dans",
        "brul",
        "avec_ma",
        "magi_je",
        "je_brul",
        "brul_l",
        "suuit",
        "y_invocation",
        "invocation_tout",
        "de_suuit",
        "gard_sans",
        "boug",
        "je_ne",
        "ne_boug",
        "boug_pas",
        "pas_et",
        "eveil",
        "coloss",
        "suti",
        "eveil_du",
        "du_coloss",
        "coloss_et",
        "et_tir",
        "de_suti",
        "veux_defens",
        "eloign_de",
        "deploi",
        "je_deploi",
        "deploi_mes",
        "mes_aile",
        "murmur",
        "je_murmur",
        "murmur_a",
        "calm_le",
        "gros_de",
        "sort_sans",
        "le_poignet",
        "poignet_de",
        "de_l",
        "ennemi_de",
        "diversion_tout",
        "planqu_tout",
        "siut",
        "soign_les",
        "de_siut",
        "venez",
        "vous",
        "battr",
        "bon_venez",
        "venez_vous",
        "vous_battr",
        "pis_balayag",
        "jamb_sans",
        "vais_coup",
        "sangli_fort",
        "maintenaant",
        "proteg_ilo",
        "ilo_de",
        "boucleir",
        "un_boucleir",
        "boucleir_a",
        "a_ma",
        "camarad_vite",
        "creatur_sans",
        "combo",
        "glac",
        "mur_de",
        "de_glac",
        "glac_vite",
        "couvr_ilo",
        "ilo_tout",
        "vais_grenad",
        "soin",
        "soin_sur",
        "sur_notr",
        "guerisseur_tout",
        "silenc_et",
        "et_ballad",
        "couvr_le",
        "group_vite",
        "faibl_sans",
        "loup_tout",
        "foudroi",
        "je_foudroi",
        "foudroi_le",
        "chain_de",
        "toutt",
        "recul_de",
        "de_toutt",
        "toutt_mes",
        "prie",
        "je_prie",
        "prie_pour",
        "pour_soign",
        "plant",
        "lame",
        "je_plant",
        "plant_ma",
        "ma_lame",
        "lame_dans",
        "dans_la",
        "gele_sans",
        "retrait",
        "retrait_fort",
        "genou",
        "ralentir",
        "le_genou",
        "genou_pour",
        "le_ralentir",
        "disparai",
        "je_disparai",
        "disparai_dans",
        "les_ombr",
        "bless",
        "les_bless",
        "chef_vite",
        "bon_un",
        "chef_fort",
        "peut_sans",
        "decoup_vorthak",
        "vorthak_de",
        "couvr_l",
        "equip_vite",
        "attaqu_vite",
        "jett_un",
        "un_sort",
        "sort_de",
        "de_eclair",
        "eclair_sur",
        "obmb",
        "obmb_sur",
        "premi_de",
        "fuir_tout",
        "modn",
        "le_modn",
        "vie",
        "rend_la",
        "la_vie",
        "vie_a",
        "a_mon",
        "couvr_de",
        "foudr",
        "le_foudr",
        "foudr_et",
        "la_foudr",
        "combin_flamm",
        "flamm_et",
        "appell_mon",
        "allez_on",
        "repli_fort",
        "aube",
        "furieu",
        "boucli_d",
        "d_aube",
        "aube_et",
        "et_fendoir",
        "fendoir_furieu",
        "reflchir",
        "arme_sans",
        "sans_reflchir",
        "point",
        "son_point",
        "point_faibl",
        "pour_kael",
        "frapp_le",
        "rat_a",
        "courag_sur",
        "encaiss_sans",
        "soign_le",
        "group_fort",
        "rest_en",
        "gard_vite",
        "cibl_vite",
        "flech_sur",
        "bras_de",
        "de_celui",
        "defensiv_tout",
        "prier",
        "reflehcir",
        "avec_flech",
        "et_prier",
        "prier_de",
        "de_group",
        "group_sans",
        "sans_reflehcir",
        "fonc_sur",
        "cultist_et",
        "declench",
        "je_declench",
        "declench_pas",
        "pour_moi",
        "moi_sans",
        "ancetr_et",
        "et_grenad",
        "tent_un",
        "attention_fort",
        "gorg",
        "bon_coup",
        "coup_a",
        "a_la",
        "la_gorg",
        "cass_sans",
        "lanc_souffl",
        "attaqu_fort",
        "detal_sans",
        "evalu",
        "sa",
        "j_evalu",
        "evalu_sa",
        "sa_sant",
        "sant_tout",
        "ok_sauv",
        "peut_tout",
        "toue",
        "forrc",
        "aile_de",
        "de_toue",
        "toue_mes",
        "mes_forrc",
        "foi",
        "veux_combo",
        "de_foi",
        "encaiss_vite",
        "planqu_sans",
        "bat",
        "on_bat",
        "bat_en",
        "en_retrait",
        "cercl",
        "vole_en",
        "en_cercl",
        "cercl_au",
        "dessu_d",
        "d_eux",
        "eux_de",
        "ici_de",
        "combin_venin",
        "venin_et",
        "et_lumier",
        "lumier_tout",
        "nargu_sans",
        "defend_mon",
        "par",
        "haut",
        "vole_pour",
        "pour_attaqu",
        "attaqu_celui",
        "gauch_par",
        "par_le",
        "le_haut",
        "haut_sans",
        "usit",
        "de_usit",
        "bloqu",
        "je_bloqu",
        "tonneau",
        "un_tonneau",
        "tonneau_pour",
        "group_sur",
        "gardien_sans",
        "jamb_tout",
        "chatim_sur",
        "lui_vite",
        "faibl_tout",
        "vais_tir",
        "mond_sans",
        "coup_on",
        "on_file",
        "file_de",
        "alli_tout",
        "boss_tout",
        "mond_vite",
        "eux_fort",
        "nargu_fort",
        "combin_lumier",
        "lumier_et",
        "et_foudr",
        "le_point",
        "bete_tout",
        "projett",
        "je_projett",
        "projett_du",
        "du_foudr",
        "foudr_sur",
        "golem_de",
        "arrier_de",
        "heal_de",
        "observ",
        "squelett",
        "j_observ",
        "observ_le",
        "le_squelett",
        "squelett_tout",
        "jessai",
        "jessai_de",
        "fuis_de",
        "rang_vite",
        "amintenant",
        "amintenant_je",
        "golem_sans",
        "jusqu",
        "vole_jusqu",
        "jusqu_a",
        "associ_javelot",
        "flamm_a",
        "a_mur",
        "jtet",
        "je_jtet",
        "jtet_une",
        "enfui",
        "m_enfui",
        "embroch",
        "j_embroch",
        "bete_fort",
        "dissonant_de",
        "esquiv_vite",
        "explosif_fort",
        "rang_tout",
        "mandal",
        "lui_mets",
        "mets_une",
        "une_mandal",
        "plus_onde",
        "givr_fort",
        "frapp_lui",
        "vais_on",
        "jeett",
        "je_jeett",
        "jeett_une",
        "abri",
        "autr",
        "mets_a",
        "l_abri",
        "abri_derrier",
        "derrier_les",
        "les_autr",
        "mets_devant",
        "devant_l",
        "famili",
        "mon_famili",
        "famili_sans",
        "fusion_flamm",
        "flamm_glac",
        "ralentir_tout",
        "eessai",
        "j_eessai",
        "eessai_de",
        "a_vorthak",
        "lanc_hymn",
        "bete_vite",
        "veux_provocation",
        "gueri_mon",
        "barr",
        "me_barr",
        "barr_vite",
        "gard_tout",
        "gloem",
        "un_gloem",
        "associ_sceau",
        "silenc_a",
        "ralentir_sans",
        "faiblses",
        "maintenant_quell",
        "allez_combien",
        "coll",
        "lui_coll",
        "coll_une",
        "invoqu_la",
        "loup_sans",
        "fusion_foudr",
        "mal_fort",
        "abandonn",
        "on_abandonn",
        "abandonn_le",
        "aile_vite",
        "stat",
        "ses_stat",
        "le_frapp",
        "poignet_fort",
        "maintenant_boucli",
        "squelett_vite",
        "plac",
        "me_plac",
        "plac_derrier",
        "derrier_notr",
        "guerisseur_fort",
        "tourell_vite",
        "gorg_sans",
        "la_flamm",
        "flamm_contr",
        "vorthak_fort",
        "derri",
        "derri_un",
        "surprendr_tout",
        "famili_fort",
        "embroch_ce",
        "plui",
        "plui_de",
        "eloign_sans",
        "gard_avelin",
        "avelin_sans",
        "ombr_de",
        "de_defens",
        "invisibl_fort",
        "esprit_sans",
        "proteg_le",
        "utilis_souffl",
        "faibl_vite",
        "avec_le",
        "raisonn_vorthak",
        "ombbr",
        "gauch_tout",
        "moi_tout",
        "assen",
        "lui_assen",
        "assen_un",
        "tapi",
        "noir",
        "me_tapi",
        "tapi_dans",
        "le_noir",
        "veux_venez",
        "battr_fort",
        "colonn",
        "derrier_une",
        "une_colonn",
        "colonn_pour",
        "gorg_de",
        "ombr_et",
        "et_mur",
        "alil",
        "arme_de",
        "mond_fort",
        "convainc_ce",
        "y_boucli",
        "vise_sa",
        "sa_main",
        "main_pour",
        "arrier_vite",
        "partir_tout",
        "group_de",
        "proteg_vite",
        "decoll_vite",
        "monstr_fort",
        "rang_sans",
        "veux_retrait",
        "visag_tout",
        "echapp",
        "m_echapp",
        "devant_mon",
        "rat_de",
        "mont",
        "front",
        "je_mont",
        "mont_au",
        "au_front",
        "golem_vite",
        "y_on",
        "gardien_fort",
        "diversion_fort",
        "coombat",
        "retap_tout",
        "rentr",
        "dedan",
        "lui_rentr",
        "rentr_dedan",
        "rang_de",
        "enovl",
        "provooqu",
        "je_provooqu",
        "araign_tout",
        "envol_sans",
        "et_vole",
        "vole_d",
        "d_esprit",
        "bon_combo",
        "guerison_de",
        "attention_sans",
        "fume",
        "derrier_la",
        "la_fume",
        "ennemi_et",
        "frapp_sans",
        "defend_ilo",
        "examin_lui",
        "arrier_fort",
        "faibless_sans",
        "lnac",
        "je_lnac",
        "lnac_un",
        "partir_de",
        "ssai",
        "j_ssai",
        "ssai_de",
        "berceus",
        "me_sauv",
        "ok_quell",
        "quell_est",
        "est_sa",
        "sa_faibless",
        "couvr_vite",
        "jaug",
        "je_jaug",
        "soign_ma",
        "examin_le",
        "le_flamm",
        "la_ombr",
        "dissimul_sans",
        "premi_fort",
        "gele_tout",
        "discret_fort",
        "alli_sans",
        "eventr",
        "l_eventr",
        "eventr_sans",
        "a_ilo",
        "observ_la",
        "cogn_dessu",
        "maintenant_venez",
        "bete_sans",
        "enflamm",
        "j_enflamm",
        "enflamm_le",
        "de_grenad",
        "pour_avelin",
        "avelin_tout",
        "calm_celui",
        "gauch_sans",
        "gard_kael",
        "kael_tout",
        "maintenant_retrait",
        "retrait_sans",
        "termin",
        "je_termin",
        "termin_le",
        "faibl_fort",
        "arme_tout",
        "mage_fort",
        "marquant_sur",
        "creatur_tout",
        "lumier_vite",
        "grac",
        "avec_coup",
        "de_grac",
        "grac_tout",
        "golem_fort",
        "ouvr",
        "ventr",
        "lui_ouvr",
        "ouvr_le",
        "le_ventr",
        "associ_mur",
        "pass_devant",
        "devant_sans",
        "jugem",
        "sacr",
        "glac_et",
        "et_jugem",
        "jugem_sacr",
        "douc",
        "lui_parl",
        "parl_douc",
        "douc_vite",
        "mainenant",
        "mainenant_je",
        "defend_fort",
        "calm_la",
        "alnc",
        "je_alnc",
        "etudi_tout",
        "pour_ilo",
        "ilo_vite",
        "mantenant",
        "mantenant_je",
        "jaug_le",
        "mage_tout",
        "fuyez",
        "embroch_le",
        "attaqu_ce",
        "loup_par",
        "lanc_pas",
        "ombr_sur",
        "demon_vite",
        "tank",
        "mets_derrier",
        "derrier_le",
        "le_tank",
        "tank_vite",
        "purification_sur",
        "proteg_kael",
        "kael_sans",
        "fleh",
        "et_sceau",
        "coup_il",
        "gros_vite",
        "mal_tout",
        "direct",
        "jamb_vite",
        "parer_sans",
        "de_invocation",
        "la_poison",
        "propos",
        "rendr",
        "lui_propos",
        "propos_de",
        "de_se",
        "se_rendr",
        "flamm_sur",
        "y_competenc",
        "loup_de",
        "autr_de",
        "le_glac",
        "pacifi_le",
        "ami_de",
        "donn",
        "je_donn",
        "donn_une",
        "potion_a",
        "fore",
        "mes_fore",
        "dissimul_de",
        "paass",
        "je_paass",
        "paass_devant",
        "associ_frapp",
        "a_nuag",
        "de_poison",
        "defend_de",
        "je_prepar",
        "prepar_hymn",
        "discret_vite",
        "voll",
        "voll_d",
        "soign_kael",
        "normal",
        "bon_attaqu",
        "attaqu_normal",
        "normal_sur",
        "cultist_vite",
        "sort_vite",
        "mixe",
        "rugiss",
        "je_mixe",
        "rugiss_et",
        "et_hymn",
        "guerison_sur",
        "me_soign",
        "tete_fort",
        "sur_kael",
        "feu",
        "et_feu",
        "noir_vite",
        "equip_fort",
        "y_il",
        "tape",
        "je_tape",
        "tape_le",
        "rat_sans",
        "racl",
        "une_racl",
        "racl_sans",
        "perforant",
        "mixe_tir",
        "tir_perforant",
        "perforant_et",
        "bon_potion",
        "detal_vite",
        "elair",
        "de_elair",
        "explosif_vite",
        "faibless_tout",
        "poison_et",
        "lumier_sans",
        "battr_tout",
        "de_venez",
        "abattr",
        "fais_s",
        "s_abattr",
        "abattr_la",
        "la_glac",
        "glac_sur",
        "feu_vite",
        "defend_moi",
        "plus_mur",
        "maintennant",
        "maintennant_je",
        "plus_eveil",
        "l_attaqu",
        "aevlin",
        "tute",
        "soign_mon",
        "de_tute",
        "tute_mes",
        "front_de",
        "devant_de",
        "boss_de",
        "jamb_pour",
        "desarm_vite",
        "decor",
        "me_fond",
        "fond_dans",
        "le_decor",
        "attaqu_lui",
        "esprit_tout",
        "ennemi_fort",
        "y_frapp",
        "poiget",
        "proteg_ma",
        "camarad_sans",
        "autr_sans",
        "inspect",
        "l_inspect",
        "forec",
        "diversion_de",
        "mes_forec",
        "group_tout",
        "vais_quell",
        "cultist_sans",
        "discret_tout",
        "ilo_sans",
        "pour_tout",
        "lign_de",
        "reflecihr",
        "sans_reflecihr",
        "premi_tout",
        "ami_vite",
        "et_rugiss",
        "rugiss_en",
        "gard_mon",
        "vorthak_sans",
        "famili_vite",
        "repli_sans",
        "recuper",
        "je_recuper",
        "recuper_des",
        "pis_venez",
        "vais_venez",
        "grac_plus",
        "plus_vole",
        "mecaniqu",
        "tourell_mecaniqu",
        "poison_sur",
        "pierr_et",
        "de_coup",
        "gros_fort",
        "tranch_la",
        "bon_bomb",
        "degag",
        "bon_on",
        "on_degag",
        "degag_d",
        "famili_de",
        "mond_de",
        "proteg_de",
        "maintenant_plui",
        "sur_ilo",
        "pis_bomb",
        "congel",
        "le_congel",
        "sant_sans",
        "refai",
        "je_refai",
        "refai_la",
        "vie_de",
        "de_kael",
        "la_eclair",
        "y_cour",
        "cour_vite",
        "premi_vite",
        "alli_de",
        "maintenant_on",
        "decor_tout",
        "sur_ma",
        "camarad_de",
        "et_pas",
        "deguerpi",
        "je_deguerpi",
        "noir_de",
        "attention_de",
        "renfort_tout",
        "y_magi",
        "de_ombr",
        "grac_sur",
        "etudi_de",
        "peau",
        "ecaill",
        "peau_d",
        "d_ecaill",
        "givr_et",
        "grac_de",
        "la_feu",
        "esssai",
        "j_esssai",
        "esssai_de",
        "fuit_fort",
        "veux_attaqu",
        "cour_tout",
        "poing",
        "de_poing",
        "poing_sur",
        "bome",
        "monstr_tout",
        "y_grenad",
        "berceus_et",
        "et_tourell",
        "mecaniqu_en",
        "ecaill_sur",
        "pase",
        "je_pase",
        "et_eveil",
        "coloss_sur",
        "vers_l",
        "maintenant_un",
        "decoll_de",
        "dessu_sans",
        "avec_la",
        "cach_vite",
        "guerisseur_sans",
        "inspect_tout",
        "bomb_fort",
        "balanc_frenesi",
        "epee",
        "coup_d",
        "d_epee",
        "epee_a",
        "esprit_sur",
        "dagu",
        "ok_coup",
        "de_dagu",
        "dagu_dans",
        "gard_sur",
        "attaqu_sans",
        "battr_de",
        "toute",
        "de_toute",
        "toute_mes",
        "foce",
        "prepar_eclair",
        "mes_foce",
        "coup_sans",
        "de_fuyez",
        "diversion_sans",
        "derrier_ma",
        "envol_fort",
        "avec_vole",
        "esprit_et",
        "battr_vite",
        "attaqu_la",
        "gele_par",
        "haut_tout",
        "de_ma",
        "demon_sans",
        "vorthak_tout",
        "devant_fort",
        "avec_frapp",
        "et_entaill",
        "fiol_de",
        "de_soin",
        "combin_givr",
        "position_fort",
        "devant_vite",
        "front_fort",
        "gros_tout",
        "pour_l",
        "fusionn_tourell",
        "mecaniqu_et",
        "et_purification",
        "purification_sans",
        "pis_grenad",
        "et_appel",
        "cibl_de",
        "le_givr",
        "bmbe",
        "une_bmbe",
        "avec_prier",
        "loup_fort",
        "attaqu_tout",
        "foorc",
        "mes_foorc",
        "parer_tout",
        "avanc_de",
        "proteg_sans",
        "coup_venez",
        "suitt",
        "pare_tout",
        "de_suitt",
        "noir_tout",
        "loup_et",
        "squelett_de",
        "mixe_eveil",
        "esquiv_sans",
        "y_venez",
        "veux_on",
        "decoll_sans",
        "vers_celui",
        "vais_provocation",
        "recit",
        "je_recit",
        "eux_sans",
        "visag_vite",
        "coup_sa",
        "de_on",
        "ok_tir",
        "le_visag",
        "chatim_et",
        "gadr",
        "avelin_de",
        "pour_mon",
        "coup_coup",
        "glac_plus",
        "plus_feux",
        "jamb_fort",
        "retrait_vite",
        "beign",
        "une_beign",
        "beign_de",
        "roue",
        "le_roue",
        "roue_de",
        "gardien_vite",
        "ame_et",
        "et_souffl",
        "combin_poison",
        "de_feu",
        "feu_sur",
        "collant",
        "bomb_collant",
        "collant_et",
        "alll",
        "alll_je",
        "cour_vers",
        "gardien_tout",
        "arbr",
        "un_arbr",
        "crev",
        "oeil",
        "lui_crev",
        "crev_un",
        "un_oeil",
        "oeil_fort",
        "cach_de",
        "combin_ombr",
        "et_glac",
        "glac_sans",
        "gard_moi",
        "envol_vite",
        "ennemi_vite",
        "canalis_sceau",
        "invisbil",
        "rend_invisbil",
        "a_rugiss",
        "envol_tout",
        "bon_invocation",
        "provocation_vite",
        "bomb_tout",
        "combat_de",
        "explosif_tout",
        "jaillir",
        "fais_jaillir",
        "jaillir_la",
        "ok_combo",
        "combo_frapp",
        "chaamp",
        "le_chaamp",
        "chaamp_de",
        "golem_et",
        "transperc_de",
        "ombr_fort",
        "equip_de",
        "a_notr",
        "reflehir",
        "sans_reflehir",
        "toxiqu_et",
        "et_bomb",
        "coup_le",
        "bras_vite",
        "rugiss_tout",
        "couvr_avelin",
        "a_sceau",
        "silenc_de",
        "y_quell",
        "mass",
        "donn_un",
        "de_mass",
        "mass_a",
        "parer_fort",
        "front_tout",
        "cran_fort",
        "proteg_moi",
        "ami_sans",
        "gobelin_sans",
        "explos_de",
        "explosiv_tout",
        "combin_feu",
        "feu_et",
        "et_poison",
        "poison_de",
        "couvr_tout",
        "rendr_tout",
        "attaqu_de",
        "kael_de",
        "tank_sans",
        "maaintenant",
        "moi_vite",
        "mage_de",
        "grac_et",
        "defonc",
        "tronch",
        "lui_defonc",
        "defonc_la",
        "la_tronch",
        "monstr_de",
        "combat_sans",
        "demon_par",
        "site",
        "camarad_tout",
        "de_site",
        "explosiv_fort",
        "proteg_fort",
        "combin_purification",
        "purification_et",
        "et_onde",
        "noir_fort",
        "sacr_et",
        "combat_fort",
        "invocation_vite",
        "contr_le",
        "veux_quell",
        "couvr_mon",
        "ok_bomb",
        "diversion_vite",
        "a_ce",
        "squelett_sans",
        "froc",
        "mes_froc",
        "explosiv_sans",
        "de_lumier",
        "lumier_sur",
        "electrocut",
        "l_electrocut",
        "bon_quell",
        "coup_soin",
        "invisibl_sans",
        "tank_de",
        "reflecir",
        "sans_reflecir",
        "allz",
        "allz_je",
        "explosiv_vite",
        "boss_sans",
        "pacifi_la",
        "rang_fort",
        "chain_et",
        "glac_en",
        "temp_vite",
        "boucli_sans",
        "de_vorthak",
        "tete_tout",
        "tete_de",
        "araign_vite",
        "brul_le",
        "haut_de",
        "inspect_sans",
        "allez_provocation",
        "empoisonn",
        "et_lame",
        "lame_empoisonn",
        "empoisonn_sur",
        "equip_sans",
        "brul_la",
        "recul_sans",
        "eloign_tout",
        "lnce",
        "je_lnce",
        "bmbe_sur",
        "jaug_l",
        "defend_kael",
        "genou_de",
        "vers_lui",
        "dechain",
        "je_dechain",
        "dechain_la",
        "ancetr_fort",
        "cour_fort",
        "derrier_l",
        "essi",
        "j_essi",
        "essi_de",
        "melaang",
        "je_melaang",
        "melaang_le",
        "esquiv_de",
        "coup_fort",
        "combo_boucli",
        "combin_rugiss",
        "gorg_vite",
        "ancetr_sans",
        "glac_tout",
        "vais_magi",
        "sangli_de",
        "jaug_celui",
        "sauv_sans",
        "fuis_tout",
        "follet_et",
        "defend_ma",
        "ici_sans",
        "melang_rugiss",
        "rugiss_avec",
        "avec_eveil",
        "coloss_vite",
        "gobelin_fort",
        "veux_bomb",
        "equip_tout",
        "defens_sans",
        "jettt",
        "je_jettt",
        "jettt_une",
        "pase_derrier",
        "furieu_tout",
        "rat_fort",
        "cibl_tout",
        "reeflechir",
        "sans_reeflechir",
        "combo_lame",
        "y_combo",
        "combo_pas",
        "bomb_vite",
        "vais_balayag",
        "silenc_vite",
        "bandit_fort",
        "melang_mur",
        "sauv_tout",
        "obucli",
        "discret_sans",
        "douc_tout",
        "la_venin",
        "coup_prier",
        "enflamm_l",
        "soign_l",
        "gele_fort",
        "ralentir_de",
        "bloqu_fort",
        "a_avelin",
        "visag_pour",
        "regener_mon",
        "renfort_vite",
        "lui_fort",
        "defensiv_vite",
        "defend_sans",
        "on_attaqu",
        "bandit_vite",
        "vais_invocation",
        "combo_provocation",
        "invisibl_vite",
        "deguerpi_sans",
        "golem_tout",
        "patir",
        "de_patir",
        "forcc",
        "mes_forcc",
        "renfort_sans",
        "cour_de",
        "boucli_de",
        "provocation_saint",
        "et_frapp",
        "force",
        "mes_force",
        "apprivois_lui",
        "lui_tout",
        "provocation_sans",
        "main_de",
        "defens_fort",
        "pied",
        "frapp_la",
        "a_les",
        "les_pied",
        "pied_de",
        "gard_le",
        "je_ssai",
        "de_sort",
        "plus_sceau",
        "sort_tout",
        "allez_bomb",
        "fusionn_ballad",
        "courag_et",
        "et_eclair",
        "devant_moi",
        "avec_lame",
        "empoisonn_et",
        "toxiqu_de",
        "tas_vite",
        "furtif_vite",
        "faibless_vite",
        "cach_fort",
        "toxiqu_sans",
        "de_combien",
        "apepll",
        "j_apepll",
        "maiintenant",
        "erflechir",
        "sans_erflechir",
        "touut",
        "de_touut",
        "touut_mes",
        "termin_ce",
        "cultist_de",
        "runiqu_sur",
        "fusion_venin",
        "veux_coup",
        "le_coombat",
        "y_combien",
        "defend_notr",
        "guerisseur_de",
        "enfui_de",
        "de_moi",
        "et_accord",
        "failbess",
        "ses_failbess",
        "avec_l",
        "barr_sans",
        "decor_vite",
        "heal_le",
        "gauch_de",
        "plus_eclair",
        "totu",
        "de_totu",
        "totu_mes",
        "essaii",
        "j_essaii",
        "essaii_de",
        "fusionn_chatim",
        "potion_fort",
        "courag_vite",
        "laanc",
        "je_laanc",
        "reflechiir",
        "sans_reflechiir",
        "allez_heal",
        "observ_ce",
        "noir_sans",
        "oeil_de",
        "fuir_vite",
        "defend_tout",
        "boss_vite",
        "aile_tout",
        "tete_vite",
        "et_feux",
        "prroteg",
        "je_prroteg",
        "sangli_tout",
        "creatur_vite",
        "coup_combien",
        "potion_sans",
        "ennemi_tout",
        "un_alil",
        "explos_tout",
        "fusion_feu",
        "apppell",
        "j_apppell",
        "coup_quell",
        "cultist_tout",
        "ame_en",
        "refllechir",
        "position_sans",
        "sans_refllechir",
        "apaisant_sans",
        "boomb_sur",
        "observ_vorthak",
        "pili_pour",
        "surprendr_vite",
        "avec_purification",
        "purification_vite",
        "allez_tir",
        "j_envoi",
        "desarm_tout",
        "reflechhir",
        "sans_reflechhir",
        "combat_vite",
        "eux_vite",
        "tourrell",
        "une_tourrell",
        "premi_sans",
        "tourell_sans",
        "foudr_tout",
        "fusionn_coup",
        "analys_celui",
        "bras_pour",
        "lumier_de",
        "et_chatim",
        "dissonant_plus",
        "veux_combien",
        "poignet_sans",
        "rpovoqu",
        "je_rpovoqu",
        "soin_de",
        "coup_invocation",
        "ok_venez",
        "battr_sans",
        "lanc_lumier",
        "lign_fort",
        "ciel_vite",
        "front_sans",
        "front_vite",
        "reflecchir",
        "sans_reflecchir",
        "combin_frapp",
        "mixe_lame",
        "lui_donn",
        "de_pied",
        "coup_grenad",
        "pare_vite",
        "bataill_de",
        "avec_lumier",
        "saint_avec",
        "potion_tout",
        "achev",
        "j_achev",
        "nargu_tout",
        "coup_boucli",
        "parer_de",
        "apprivois_ce",
        "foi_fort",
        "fume_pour",
        "covoqu",
        "je_covoqu",
        "covoqu_un",
        "file_tout",
        "dos_vite",
        "fusion_glac",
        "foudr_sans",
        "convainc_l",
        "araign_de",
        "ennemi_par",
        "rest_vite",
        "attention_tout",
        "dos_tout",
        "poison_tout",
        "purification_tout",
        "ok_cour",
        "bloqu_sans",
        "heal_fort",
        "nenemi",
        "l_nenemi",
        "turell",
        "ecaill_et",
        "arbr_pour",
        "chain_sur",
        "drrier",
        "proteg_notr",
        "arme_vite",
        "apprivois_l",
        "sant_de",
        "bon_cour",
        "araign_fort",
        "glac_de",
        "rugiss_fort",
        "provoqu_l",
        "asngli",
        "ok_magi",
        "le_asngli",
        "a_souffl",
        "repi",
        "me_repi",
        "repi_a",
        "oeil_tout",
        "ecaill_plus",
        "plus_prier",
        "glaac",
        "de_glaac",
        "etrip_de",
        "courag_a",
        "associ_eveil",
        "coloss_a",
        "lui_lanc",
        "une_boul",
        "boul_de",
        "mage_sans",
        "narrgu",
        "les_narrgu",
        "bomb_de",
        "air_vite",
        "squelett_par",
        "derrier_fort",
        "douc_fort",
        "combin_eclair",
        "alle",
        "alle_je",
        "ok_techniqu",
        "soign_tout",
        "jaug_ce",
        "techniqu_mur",
        "camoufl_de",
        "mixe_feux",
        "faiblesss",
        "allez_invocation",
        "invocation_fort",
        "decor_sans",
        "camoufl_fort",
        "analys_l",
        "araign_sans",
        "explosif_de",
        "desssu",
        "sacr_tout",
        "golem_par",
        "dedan_vite",
        "boss_a",
        "combo_hymn",
        "camoufl_sans",
        "ok_provocation",
        "fuit_sans",
        "haut_vite",
        "explos_sans",
        "allez_venez",
        "airs_fort",
        "de_ilo",
        "avec_chatim",
        "de_il",
        "chef_tout",
        "demon_tout",
        "je_soin",
        "mixe_javelot",
        "stat_tout",
        "regener_tout",
        "rest_de",
        "defens_vite",
        "dans_ce",
        "observ_lui",
        "guerison_fort",
        "defend_avelin",
        "vais_boucli",
        "apais_de",
        "roch_pour",
        "fusionn_vole",
        "et_echang",
        "ame_de",
        "airs_de",
        "dans_sa",
        "gorup",
        "le_gorup",
        "venin_lumier",
        "invocation_sans",
        "hach",
        "de_hach",
        "furtif_tout",
        "gard_ilo",
        "gard_fort",
        "mage_et",
        "ciel_tout",
        "melang_ballad",
        "courag_avec",
        "veux_purification",
        "ok_taper",
        "fais_provocation",
        "flamm_fort",
        "rugiss_vite",
        "cour_sans",
        "ecarllat",
        "frapp_ecarllat",
        "observ_l",
        "flamm_feu",
        "potion_vite"
    },
    comptes = {
        {
            0,
            17,
            1,
            260,
            4,
            49,
            6,
            35,
            7,
            14,
            13,
            22,
            15,
            22,
            16,
            13,
            18,
            24,
            19,
            138,
            20,
            7,
            21,
            20,
            22,
            22,
            23,
            7,
            24,
            21,
            25,
            7,
            26,
            7,
            27,
            38,
            28,
            86,
            29,
            14,
            30,
            7,
            31,
            7,
            32,
            7,
            33,
            1,
            36,
            25,
            40,
            25,
            41,
            19,
            45,
            28,
            51,
            26,
            52,
            26,
            57,
            26,
            58,
            21,
            64,
            8,
            69,
            8,
            70,
            23,
            71,
            22,
            72,
            8,
            73,
            23,
            74,
            22,
            78,
            107,
            85,
            27,
            86,
            88,
            89,
            51,
            90,
            20,
            91,
            27,
            92,
            22,
            96,
            22,
            97,
            20,
            98,
            31,
            100,
            48,
            102,
            23,
            108,
            40,
            109,
            17,
            111,
            14,
            113,
            7,
            114,
            21,
            115,
            6,
            116,
            17,
            117,
            17,
            118,
            15,
            123,
            1,
            124,
            6,
            140,
            40,
            141,
            38,
            142,
            80,
            147,
            38,
            151,
            8,
            154,
            6,
            155,
            8,
            159,
            6,
            169,
            17,
            170,
            17,
            174,
            32,
            175,
            17,
            176,
            13,
            182,
            5,
            185,
            5,
            188,
            25,
            199,
            23,
            200,
            10,
            201,
            6,
            202,
            30,
            203,
            30,
            204,
            10,
            205,
            5,
            206,
            6,
            207,
            1,
            208,
            29,
            209,
            29,
            210,
            30,
            211,
            9,
            212,
            38,
            213,
            9,
            230,
            7,
            231,
            4,
            232,
            7,
            233,
            29,
            235,
            22,
            239,
            2,
            250,
            1,
            251,
            5,
            252,
            5,
            260,
            2,
            263,
            1,
            266,
            1,
            275,
            9,
            280,
            31,
            289,
            7,
            294,
            1,
            300,
            8,
            318,
            2,
            323,
            4,
            336,
            1,
            372,
            7,
            376,
            7,
            390,
            2,
            392,
            3,
            399,
            7,
            411,
            2,
            414,
            6,
            450,
            4,
            455,
            6,
            456,
            6,
            457,
            4,
            475,
            5,
            476,
            5,
            477,
            5,
            478,
            5,
            479,
            5,
            481,
            13,
            483,
            7,
            488,
            8,
            489,
            7,
            490,
            8,
            491,
            7,
            497,
            2,
            536,
            7,
            537,
            7,
            538,
            8,
            540,
            13,
            557,
            3,
            570,
            7,
            574,
            7,
            578,
            6,
            586,
            2,
            606,
            2,
            611,
            22,
            621,
            4,
            632,
            6,
            638,
            6,
            639,
            2,
            640,
            6,
            641,
            6,
            642,
            2,
            643,
            17,
            663,
            6,
            674,
            2,
            688,
            1,
            690,
            10,
            693,
            5,
            694,
            10,
            711,
            40,
            712,
            2,
            713,
            9,
            714,
            7,
            715,
            6,
            745,
            12,
            747,
            5,
            749,
            23,
            753,
            4,
            754,
            4,
            755,
            1,
            756,
            4,
            757,
            4,
            758,
            2,
            772,
            1,
            788,
            6,
            789,
            6,
            790,
            5,
            791,
            1,
            792,
            44,
            794,
            9,
            795,
            9,
            813,
            3,
            828,
            3,
            829,
            8,
            839,
            5,
            842,
            5,
            847,
            5,
            848,
            5,
            869,
            7,
            870,
            7,
            871,
            7,
            878,
            1,
            896,
            1,
            911,
            7,
            914,
            7,
            924,
            1,
            925,
            15,
            926,
            8,
            927,
            15,
            928,
            7,
            929,
            8,
            954,
            1,
            977,
            3,
            978,
            2,
            1000,
            1,
            1002,
            1,
            1015,
            8,
            1016,
            8,
            1017,
            37,
            1018,
            8,
            1019,
            1,
            1023,
            4,
            1029,
            1,
            1030,
            4,
            1034,
            4,
            1035,
            4,
            1097,
            1,
            1098,
            1,
            1099,
            1,
            1105,
            8,
            1106,
            8,
            1107,
            8,
            1113,
            1,
            1116,
            1,
            1160,
            4,
            1161,
            1,
            1187,
            2,
            1201,
            9,
            1202,
            9,
            1203,
            9,
            1204,
            9,
            1205,
            9,
            1206,
            9,
            1207,
            3,
            1208,
            1,
            1226,
            2,
            1227,
            1,
            1230,
            4,
            1271,
            12,
            1280,
            7,
            1292,
            8,
            1293,
            2,
            1306,
            1,
            1310,
            5,
            1320,
            1,
            1323,
            1,
            1324,
            1,
            1353,
            1,
            1369,
            1,
            1370,
            2,
            1395,
            6,
            1398,
            6,
            1399,
            2,
            1404,
            1,
            1405,
            1,
            1418,
            8,
            1419,
            8,
            1425,
            5,
            1426,
            25,
            1427,
            12,
            1428,
            5,
            1431,
            1,
            1451,
            2,
            1452,
            2,
            1453,
            2,
            1454,
            1,
            1471,
            9,
            1472,
            9,
            1473,
            9,
            1484,
            8,
            1487,
            1,
            1502,
            3,
            1514,
            3,
            1520,
            7,
            1521,
            7,
            1522,
            7,
            1557,
            2,
            1563,
            1,
            1569,
            8,
            1570,
            8,
            1571,
            8,
            1572,
            8,
            1577,
            1,
            1588,
            2,
            1589,
            3,
            1615,
            2,
            1616,
            1,
            1619,
            9,
            1620,
            9,
            1621,
            2,
            1624,
            5,
            1639,
            6,
            1640,
            6,
            1641,
            4,
            1642,
            2,
            1644,
            2,
            1653,
            2,
            1654,
            2,
            1655,
            2,
            1656,
            2,
            1657,
            2,
            1670,
            1,
            1671,
            1,
            1684,
            3,
            1701,
            1,
            1716,
            1,
            1721,
            12,
            1722,
            7,
            1741,
            5,
            1742,
            3,
            1743,
            4,
            1744,
            5,
            1745,
            2,
            1761,
            3,
            1762,
            3,
            1763,
            3,
            1764,
            3,
            1765,
            5,
            1766,
            5,
            1767,
            2,
            1794,
            13,
            1809,
            1,
            1811,
            1,
            1812,
            1,
            1824,
            2,
            1831,
            1,
            1850,
            6,
            1851,
            1,
            1855,
            1,
            1902,
            2,
            1904,
            3,
            1905,
            3,
            1906,
            3,
            1918,
            1,
            1921,
            3,
            1928,
            6,
            1929,
            6,
            1930,
            6,
            1931,
            6,
            1933,
            5,
            1934,
            2,
            1935,
            5,
            1936,
            5,
            1938,
            2,
            1946,
            2,
            1954,
            2,
            1958,
            1,
            1969,
            1,
            1982,
            2,
            1983,
            2,
            1994,
            3,
            1995,
            1,
            1999,
            1,
            2015,
            2,
            2020,
            7,
            2021,
            7,
            2022,
            3,
            2023,
            5,
            2024,
            5,
            2025,
            5,
            2037,
            7,
            2072,
            2,
            2073,
            2,
            2077,
            1,
            2078,
            1,
            2088,
            2,
            2089,
            12,
            2090,
            2,
            2091,
            2,
            2097,
            1,
            2106,
            2,
            2113,
            3,
            2114,
            3,
            2115,
            3,
            2116,
            3,
            2117,
            3,
            2118,
            1,
            2138,
            1,
            2185,
            1,
            2199,
            3,
            2217,
            1,
            2228,
            1,
            2229,
            1,
            2246,
            2,
            2253,
            1,
            2256,
            2,
            2257,
            1,
            2279,
            6,
            2280,
            1,
            2283,
            1,
            2297,
            2,
            2311,
            2,
            2315,
            1,
            2329,
            1,
            2356,
            1,
            2367,
            2,
            2388,
            1,
            2414,
            5,
            2415,
            6,
            2422,
            3,
            2423,
            3,
            2476,
            2,
            2506,
            1,
            2508,
            2,
            2511,
            2,
            2532,
            2,
            2548,
            2,
            2549,
            2,
            2553,
            2,
            2558,
            2
        },
        {
            0,
            24,
            1,
            224,
            2,
            42,
            4,
            32,
            6,
            31,
            7,
            18,
            8,
            42,
            13,
            17,
            15,
            17,
            16,
            11,
            18,
            17,
            19,
            94,
            21,
            11,
            22,
            6,
            24,
            30,
            26,
            8,
            27,
            116,
            28,
            24,
            29,
            21,
            33,
            13,
            36,
            17,
            40,
            17,
            41,
            9,
            45,
            5,
            47,
            8,
            51,
            25,
            52,
            25,
            57,
            25,
            58,
            18,
            63,
            8,
            70,
            6,
            71,
            6,
            73,
            6,
            74,
            6,
            76,
            7,
            77,
            4,
            78,
            150,
            79,
            3,
            83,
            4,
            84,
            3,
            85,
            35,
            86,
            27,
            89,
            58,
            90,
            26,
            91,
            21,
            92,
            14,
            96,
            30,
            97,
            26,
            98,
            14,
            100,
            30,
            102,
            9,
            108,
            56,
            109,
            18,
            111,
            52,
            114,
            13,
            115,
            1,
            116,
            18,
            117,
            18,
            118,
            10,
            124,
            1,
            129,
            3,
            140,
            25,
            141,
            24,
            142,
            10,
            147,
            24,
            148,
            14,
            149,
            2,
            150,
            2,
            151,
            6,
            152,
            2,
            153,
            2,
            154,
            10,
            155,
            6,
            156,
            2,
            158,
            1,
            159,
            23,
            160,
            1,
            161,
            4,
            162,
            4,
            164,
            1,
            165,
            1,
            167,
            4,
            168,
            1,
            169,
            22,
            170,
            22,
            172,
            5,
            174,
            23,
            175,
            22,
            176,
            16,
            182,
            9,
            185,
            9,
            186,
            1,
            189,
            6,
            190,
            2,
            194,
            6,
            195,
            6,
            196,
            6,
            197,
            6,
            198,
            3,
            199,
            64,
            201,
            5,
            202,
            31,
            203,
            28,
            206,
            5,
            208,
            28,
            209,
            28,
            210,
            28,
            212,
            17,
            230,
            4,
            232,
            4,
            233,
            3,
            234,
            1,
            236,
            6,
            240,
            1,
            259,
            22,
            260,
            5,
            261,
            22,
            263,
            1,
            266,
            1,
            275,
            20,
            278,
            3,
            289,
            5,
            294,
            1,
            298,
            2,
            301,
            3,
            314,
            20,
            320,
            1,
            323,
            10,
            334,
            4,
            336,
            1,
            337,
            4,
            353,
            6,
            357,
            1,
            372,
            7,
            373,
            7,
            374,
            7,
            375,
            7,
            376,
            7,
            387,
            1,
            392,
            1,
            397,
            7,
            398,
            1,
            399,
            4,
            400,
            5,
            407,
            1,
            410,
            4,
            411,
            1,
            414,
            5,
            425,
            12,
            436,
            3,
            437,
            37,
            438,
            1,
            439,
            32,
            451,
            5,
            452,
            5,
            453,
            4,
            454,
            2,
            460,
            6,
            462,
            6,
            480,
            6,
            481,
            11,
            482,
            4,
            483,
            5,
            489,
            9,
            491,
            3,
            494,
            1,
            497,
            10,
            499,
            1,
            500,
            3,
            501,
            3,
            502,
            3,
            503,
            3,
            504,
            3,
            505,
            3,
            506,
            2,
            510,
            1,
            512,
            1,
            513,
            1,
            519,
            9,
            534,
            2,
            538,
            2,
            546,
            5,
            547,
            5,
            549,
            5,
            550,
            5,
            551,
            4,
            562,
            9,
            569,
            1,
            570,
            8,
            571,
            1,
            572,
            6,
            573,
            3,
            574,
            8,
            575,
            1,
            578,
            7,
            586,
            2,
            616,
            8,
            621,
            10,
            632,
            6,
            633,
            9,
            634,
            8,
            636,
            9,
            637,
            1,
            639,
            10,
            642,
            10,
            653,
            5,
            663,
            5,
            665,
            1,
            667,
            1,
            690,
            5,
            694,
            5,
            709,
            7,
            710,
            7,
            712,
            3,
            715,
            7,
            725,
            7,
            726,
            1,
            727,
            5,
            728,
            3,
            729,
            5,
            730,
            3,
            738,
            10,
            753,
            3,
            754,
            3,
            755,
            2,
            756,
            3,
            757,
            3,
            779,
            5,
            780,
            1,
            783,
            4,
            784,
            12,
            786,
            4,
            787,
            8,
            791,
            3,
            792,
            1,
            794,
            3,
            795,
            3,
            812,
            2,
            813,
            2,
            839,
            5,
            842,
            5,
            844,
            3,
            845,
            4,
            846,
            3,
            877,
            6,
            878,
            3,
            881,
            7,
            882,
            3,
            911,
            4,
            914,
            4,
            915,
            9,
            916,
            1,
            917,
            1,
            924,
            1,
            936,
            8,
            938,
            8,
            942,
            17,
            948,
            1,
            951,
            2,
            958,
            39,
            988,
            3,
            1000,
            2,
            1002,
            2,
            1007,
            8,
            1010,
            2,
            1011,
            2,
            1012,
            2,
            1017,
            6,
            1021,
            6,
            1023,
            3,
            1024,
            6,
            1025,
            6,
            1029,
            1,
            1030,
            8,
            1031,
            10,
            1032,
            12,
            1033,
            12,
            1034,
            7,
            1035,
            8,
            1038,
            4,
            1046,
            13,
            1047,
            23,
            1048,
            10,
            1049,
            13,
            1050,
            6,
            1051,
            13,
            1052,
            16,
            1053,
            6,
            1054,
            4,
            1064,
            13,
            1076,
            2,
            1078,
            2,
            1079,
            3,
            1093,
            8,
            1094,
            8,
            1095,
            8,
            1096,
            3,
            1097,
            7,
            1098,
            4,
            1099,
            4,
            1100,
            4,
            1101,
            13,
            1102,
            11,
            1103,
            3,
            1105,
            5,
            1108,
            6,
            1109,
            7,
            1110,
            7,
            1111,
            6,
            1112,
            2,
            1113,
            2,
            1116,
            2,
            1123,
            1,
            1124,
            1,
            1126,
            1,
            1127,
            1,
            1142,
            2,
            1146,
            2,
            1162,
            1,
            1172,
            11,
            1173,
            6,
            1174,
            7,
            1175,
            1,
            1186,
            1,
            1188,
            2,
            1189,
            9,
            1190,
            9,
            1191,
            5,
            1192,
            2,
            1202,
            1,
            1208,
            1,
            1224,
            1,
            1227,
            1,
            1231,
            8,
            1232,
            17,
            1233,
            19,
            1234,
            6,
            1235,
            4,
            1248,
            6,
            1251,
            2,
            1257,
            1,
            1258,
            4,
            1259,
            1,
            1260,
            1,
            1263,
            4,
            1273,
            2,
            1284,
            4,
            1288,
            4,
            1289,
            4,
            1294,
            5,
            1295,
            5,
            1296,
            2,
            1301,
            2,
            1304,
            1,
            1326,
            2,
            1328,
            2,
            1365,
            1,
            1368,
            2,
            1369,
            1,
            1377,
            1,
            1385,
            1,
            1386,
            5,
            1387,
            5,
            1388,
            5,
            1389,
            3,
            1390,
            6,
            1391,
            1,
            1395,
            4,
            1398,
            4,
            1420,
            1,
            1421,
            1,
            1455,
            1,
            1456,
            2,
            1474,
            4,
            1475,
            1,
            1486,
            1,
            1487,
            1,
            1495,
            4,
            1496,
            2,
            1497,
            1,
            1503,
            5,
            1504,
            5,
            1513,
            2,
            1517,
            1,
            1518,
            1,
            1563,
            1,
            1580,
            2,
            1581,
            3,
            1594,
            2,
            1595,
            2,
            1596,
            1,
            1598,
            2,
            1599,
            1,
            1600,
            2,
            1601,
            3,
            1613,
            6,
            1615,
            1,
            1616,
            1,
            1627,
            8,
            1628,
            8,
            1629,
            6,
            1642,
            2,
            1645,
            2,
            1648,
            6,
            1650,
            6,
            1651,
            2,
            1652,
            1,
            1661,
            2,
            1662,
            1,
            1665,
            1,
            1674,
            2,
            1675,
            2,
            1679,
            1,
            1680,
            1,
            1687,
            2,
            1688,
            5,
            1689,
            1,
            1695,
            1,
            1698,
            1,
            1701,
            1,
            1703,
            3,
            1707,
            4,
            1714,
            5,
            1715,
            2,
            1716,
            1,
            1733,
            4,
            1735,
            8,
            1736,
            2,
            1738,
            1,
            1739,
            1,
            1748,
            3,
            1756,
            10,
            1764,
            1,
            1768,
            3,
            1770,
            3,
            1774,
            2,
            1775,
            2,
            1782,
            9,
            1783,
            9,
            1784,
            9,
            1785,
            9,
            1786,
            4,
            1787,
            5,
            1796,
            1,
            1798,
            1,
            1799,
            1,
            1802,
            1,
            1811,
            1,
            1836,
            1,
            1848,
            4,
            1861,
            2,
            1864,
            6,
            1865,
            6,
            1872,
            4,
            1875,
            1,
            1887,
            2,
            1888,
            3,
            1889,
            2,
            1891,
            5,
            1892,
            5,
            1893,
            5,
            1894,
            5,
            1896,
            1,
            1897,
            4,
            1908,
            1,
            1913,
            2,
            1917,
            1,
            1927,
            2,
            1932,
            1,
            1937,
            2,
            1943,
            2,
            1944,
            2,
            1945,
            2,
            2003,
            3,
            2004,
            3,
            2005,
            1,
            2030,
            5,
            2031,
            7,
            2032,
            1,
            2033,
            1,
            2035,
            1,
            2036,
            1,
            2050,
            1,
            2053,
            1,
            2054,
            2,
            2064,
            8,
            2065,
            8,
            2066,
            8,
            2074,
            2,
            2083,
            1,
            2111,
            1,
            2131,
            1,
            2133,
            6,
            2143,
            6,
            2144,
            6,
            2145,
            7,
            2146,
            7,
            2156,
            1,
            2166,
            1,
            2167,
            2,
            2171,
            1,
            2173,
            1,
            2174,
            1,
            2176,
            2,
            2179,
            2,
            2180,
            2,
            2186,
            8,
            2187,
            8,
            2188,
            8,
            2204,
            1,
            2205,
            2,
            2206,
            2,
            2225,
            1,
            2235,
            1,
            2236,
            1,
            2242,
            4,
            2244,
            2,
            2270,
            5,
            2275,
            1,
            2285,
            1,
            2286,
            2,
            2301,
            1,
            2313,
            2,
            2331,
            1,
            2332,
            1,
            2333,
            1,
            2334,
            1,
            2335,
            1,
            2336,
            1,
            2342,
            1,
            2343,
            1,
            2356,
            1,
            2367,
            1,
            2372,
            1,
            2380,
            3,
            2385,
            1,
            2388,
            2,
            2438,
            1,
            2453,
            2,
            2461,
            1,
            2464,
            2,
            2465,
            2,
            2466,
            2,
            2474,
            1,
            2475,
            1,
            2480,
            5,
            2481,
            5,
            2482,
            5,
            2494,
            2,
            2497,
            2,
            2509,
            1,
            2559,
            2,
            2560,
            1,
            2561,
            1,
            2563,
            1,
            2564,
            1
        },
        {
            0,
            31,
            1,
            277,
            4,
            22,
            6,
            36,
            7,
            28,
            13,
            19,
            15,
            19,
            16,
            15,
            18,
            23,
            19,
            110,
            21,
            21,
            24,
            25,
            28,
            64,
            29,
            20,
            36,
            24,
            38,
            80,
            40,
            24,
            41,
            17,
            45,
            13,
            51,
            18,
            52,
            18,
            54,
            22,
            57,
            18,
            58,
            16,
            64,
            27,
            70,
            3,
            71,
            12,
            73,
            3,
            74,
            3,
            78,
            120,
            85,
            16,
            86,
            55,
            89,
            56,
            90,
            24,
            91,
            16,
            92,
            14,
            96,
            25,
            97,
            24,
            98,
            28,
            100,
            6,
            102,
            21,
            108,
            19,
            109,
            19,
            111,
            54,
            112,
            14,
            114,
            10,
            115,
            3,
            116,
            19,
            117,
            19,
            118,
            14,
            124,
            3,
            140,
            30,
            141,
            27,
            142,
            42,
            147,
            27,
            151,
            2,
            155,
            2,
            156,
            1,
            169,
            21,
            170,
            21,
            174,
            34,
            175,
            21,
            176,
            19,
            182,
            2,
            185,
            2,
            201,
            3,
            202,
            33,
            203,
            31,
            206,
            3,
            208,
            31,
            209,
            31,
            210,
            31,
            215,
            132,
            216,
            2,
            217,
            45,
            218,
            15,
            219,
            132,
            220,
            27,
            221,
            2,
            222,
            26,
            223,
            15,
            224,
            2,
            230,
            9,
            232,
            9,
            233,
            54,
            256,
            56,
            257,
            32,
            258,
            47,
            266,
            9,
            278,
            12,
            279,
            10,
            280,
            68,
            281,
            10,
            282,
            10,
            283,
            10,
            284,
            32,
            285,
            10,
            286,
            2,
            289,
            3,
            323,
            1,
            390,
            1,
            399,
            12,
            414,
            3,
            466,
            12,
            467,
            37,
            468,
            12,
            469,
            4,
            470,
            3,
            471,
            15,
            472,
            4,
            481,
            8,
            483,
            4,
            489,
            1,
            491,
            1,
            570,
            2,
            574,
            2,
            578,
            2,
            589,
            53,
            593,
            2,
            621,
            1,
            632,
            4,
            639,
            5,
            642,
            5,
            643,
            54,
            647,
            9,
            648,
            10,
            649,
            9,
            650,
            9,
            651,
            9,
            663,
            3,
            671,
            35,
            672,
            22,
            673,
            21,
            675,
            30,
            676,
            16,
            677,
            17,
            678,
            53,
            679,
            19,
            680,
            16,
            681,
            18,
            682,
            19,
            683,
            16,
            684,
            15,
            685,
            17,
            686,
            53,
            687,
            3,
            693,
            5,
            715,
            2,
            745,
            28,
            746,
            15,
            747,
            15,
            748,
            15,
            749,
            26,
            750,
            15,
            753,
            3,
            754,
            3,
            756,
            3,
            757,
            3,
            778,
            1,
            782,
            28,
            792,
            13,
            793,
            13,
            794,
            1,
            795,
            1,
            805,
            3,
            815,
            27,
            816,
            27,
            847,
            13,
            848,
            13,
            849,
            6,
            850,
            8,
            851,
            10,
            852,
            1,
            868,
            15,
            869,
            13,
            870,
            13,
            871,
            12,
            872,
            12,
            873,
            15,
            874,
            7,
            875,
            2,
            876,
            1,
            880,
            8,
            883,
            5,
            896,
            1,
            911,
            5,
            914,
            5,
            955,
            31,
            977,
            3,
            1007,
            1,
            1026,
            13,
            1027,
            2,
            1028,
            13,
            1030,
            2,
            1035,
            2,
            1113,
            1,
            1116,
            1,
            1143,
            14,
            1144,
            3,
            1145,
            6,
            1146,
            1,
            1158,
            2,
            1159,
            3,
            1188,
            1,
            1207,
            5,
            1211,
            11,
            1212,
            9,
            1213,
            11,
            1214,
            2,
            1215,
            9,
            1223,
            2,
            1264,
            2,
            1265,
            8,
            1266,
            2,
            1267,
            10,
            1269,
            9,
            1271,
            9,
            1272,
            2,
            1281,
            4,
            1282,
            2,
            1303,
            23,
            1304,
            3,
            1305,
            14,
            1306,
            17,
            1307,
            23,
            1313,
            14,
            1367,
            4,
            1371,
            2,
            1377,
            1,
            1384,
            10,
            1385,
            1,
            1395,
            3,
            1398,
            3,
            1406,
            1,
            1431,
            1,
            1450,
            2,
            1467,
            2,
            1475,
            1,
            1485,
            5,
            1494,
            2,
            1497,
            1,
            1534,
            7,
            1538,
            6,
            1542,
            8,
            1543,
            14,
            1544,
            5,
            1553,
            3,
            1563,
            1,
            1634,
            1,
            1643,
            4,
            1701,
            2,
            1704,
            5,
            1716,
            1,
            1754,
            5,
            1796,
            1,
            1798,
            1,
            1799,
            1,
            1803,
            2,
            1804,
            3,
            1813,
            2,
            1819,
            1,
            1821,
            1,
            1850,
            2,
            1852,
            2,
            1919,
            2,
            1934,
            1,
            1982,
            1,
            2006,
            5,
            2007,
            2,
            2009,
            3,
            2010,
            14,
            2018,
            8,
            2041,
            9,
            2042,
            9,
            2043,
            9,
            2044,
            9,
            2045,
            9,
            2046,
            2,
            2081,
            7,
            2082,
            2,
            2094,
            2,
            2139,
            1,
            2140,
            1,
            2141,
            1,
            2163,
            2,
            2164,
            2,
            2165,
            3,
            2166,
            1,
            2184,
            4,
            2202,
            2,
            2226,
            1,
            2234,
            2,
            2247,
            3,
            2250,
            2,
            2277,
            3,
            2279,
            3,
            2280,
            1,
            2281,
            4,
            2282,
            3,
            2283,
            1,
            2308,
            1,
            2309,
            1,
            2310,
            1,
            2315,
            3,
            2347,
            3,
            2352,
            2,
            2379,
            1,
            2381,
            2,
            2393,
            2,
            2398,
            2,
            2438,
            1,
            2448,
            1,
            2449,
            1,
            2456,
            4,
            2471,
            2,
            2512,
            2,
            2543,
            3
        },
        {
            0,
            14,
            1,
            261,
            6,
            35,
            7,
            11,
            13,
            15,
            15,
            15,
            16,
            11,
            18,
            21,
            21,
            17,
            24,
            25,
            25,
            130,
            27,
            17,
            29,
            17,
            30,
            130,
            36,
            28,
            40,
            28,
            41,
            23,
            51,
            24,
            52,
            24,
            57,
            24,
            58,
            20,
            63,
            20,
            64,
            20,
            65,
            19,
            66,
            20,
            67,
            20,
            68,
            19,
            78,
            76,
            85,
            29,
            86,
            29,
            87,
            17,
            88,
            20,
            89,
            56,
            90,
            23,
            91,
            29,
            92,
            24,
            93,
            17,
            96,
            27,
            97,
            23,
            98,
            20,
            102,
            18,
            108,
            59,
            109,
            19,
            111,
            17,
            116,
            19,
            117,
            19,
            118,
            17,
            128,
            17,
            140,
            32,
            141,
            28,
            147,
            28,
            169,
            23,
            170,
            23,
            174,
            28,
            175,
            23,
            176,
            18,
            188,
            13,
            189,
            52,
            190,
            56,
            191,
            13,
            192,
            13,
            193,
            33,
            202,
            32,
            203,
            30,
            208,
            29,
            209,
            29,
            210,
            30,
            225,
            31,
            235,
            20,
            260,
            4,
            263,
            2,
            275,
            24,
            336,
            1,
            366,
            22,
            367,
            23,
            368,
            23,
            369,
            22,
            370,
            3,
            391,
            22,
            392,
            3,
            393,
            22,
            394,
            22,
            411,
            3,
            425,
            65,
            442,
            18,
            443,
            18,
            445,
            21,
            446,
            21,
            492,
            16,
            493,
            25,
            494,
            1,
            495,
            16,
            496,
            16,
            497,
            17,
            498,
            15,
            499,
            1,
            507,
            31,
            508,
            2,
            536,
            1,
            538,
            46,
            586,
            4,
            611,
            20,
            622,
            32,
            623,
            17,
            624,
            17,
            625,
            17,
            626,
            17,
            627,
            15,
            654,
            1,
            656,
            1,
            703,
            9,
            704,
            9,
            712,
            6,
            731,
            2,
            732,
            2,
            733,
            2,
            759,
            17,
            813,
            2,
            861,
            2,
            862,
            2,
            878,
            1,
            879,
            5,
            994,
            22,
            995,
            22,
            996,
            19,
            997,
            20,
            998,
            46,
            999,
            6,
            1000,
            1,
            1002,
            1,
            1019,
            6,
            1023,
            3,
            1056,
            25,
            1057,
            25,
            1058,
            25,
            1059,
            7,
            1062,
            20,
            1064,
            20,
            1091,
            21,
            1092,
            21,
            1117,
            3,
            1118,
            19,
            1119,
            20,
            1120,
            19,
            1121,
            19,
            1122,
            20,
            1125,
            1,
            1130,
            1,
            1131,
            4,
            1162,
            1,
            1193,
            1,
            1195,
            1,
            1196,
            1,
            1247,
            4,
            1264,
            1,
            1266,
            1,
            1274,
            3,
            1278,
            5,
            1283,
            4,
            1285,
            1,
            1291,
            1,
            1329,
            4,
            1358,
            1,
            1359,
            1,
            1360,
            15,
            1361,
            15,
            1451,
            1,
            1452,
            1,
            1453,
            1,
            1462,
            4,
            1509,
            2,
            1548,
            4,
            1607,
            3,
            1672,
            2,
            1705,
            3,
            1734,
            4,
            1796,
            1,
            1798,
            1,
            1799,
            1,
            1860,
            4,
            1940,
            1,
            1941,
            1,
            1942,
            1,
            1966,
            2,
            1986,
            3,
            1988,
            4,
            1990,
            1,
            1991,
            3,
            1992,
            1,
            2012,
            1,
            2092,
            3,
            2125,
            3,
            2162,
            4,
            2220,
            2,
            2248,
            2,
            2254,
            5,
            2255,
            2,
            2265,
            1,
            2266,
            1,
            2269,
            4,
            2278,
            3,
            2349,
            1,
            2369,
            2,
            2370,
            3,
            2371,
            2,
            2417,
            2,
            2426,
            2,
            2446,
            2,
            2454,
            1,
            2492,
            1,
            2531,
            3,
            2552,
            3,
            2562,
            1
        },
        {
            0,
            21,
            1,
            299,
            2,
            30,
            4,
            64,
            5,
            45,
            6,
            35,
            7,
            19,
            8,
            30,
            12,
            4,
            13,
            31,
            15,
            31,
            16,
            29,
            18,
            21,
            19,
            60,
            21,
            20,
            24,
            28,
            25,
            21,
            27,
            24,
            29,
            26,
            30,
            21,
            36,
            31,
            40,
            31,
            41,
            30,
            51,
            21,
            52,
            21,
            57,
            21,
            58,
            18,
            64,
            34,
            78,
            80,
            85,
            21,
            86,
            21,
            89,
            80,
            90,
            31,
            91,
            21,
            92,
            19,
            96,
            34,
            97,
            31,
            98,
            16,
            100,
            54,
            102,
            15,
            105,
            5,
            108,
            14,
            109,
            14,
            116,
            14,
            117,
            14,
            118,
            14,
            125,
            2,
            126,
            26,
            127,
            2,
            128,
            33,
            129,
            16,
            130,
            33,
            131,
            6,
            132,
            16,
            140,
            41,
            141,
            39,
            147,
            39,
            169,
            27,
            170,
            27,
            174,
            29,
            175,
            27,
            176,
            26,
            188,
            55,
            190,
            21,
            191,
            21,
            199,
            2,
            202,
            63,
            203,
            30,
            208,
            29,
            209,
            29,
            210,
            30,
            217,
            55,
            222,
            5,
            225,
            114,
            226,
            92,
            227,
            31,
            228,
            31,
            229,
            5,
            275,
            23,
            312,
            25,
            315,
            25,
            367,
            21,
            368,
            2,
            415,
            21,
            422,
            1,
            423,
            3,
            424,
            24,
            425,
            41,
            426,
            27,
            427,
            24,
            428,
            24,
            429,
            22,
            430,
            12,
            431,
            27,
            432,
            5,
            445,
            29,
            508,
            2,
            510,
            2,
            512,
            2,
            513,
            2,
            538,
            51,
            539,
            34,
            540,
            34,
            541,
            30,
            542,
            30,
            543,
            3,
            544,
            1,
            548,
            18,
            552,
            2,
            553,
            19,
            554,
            18,
            599,
            24,
            604,
            2,
            605,
            3,
            630,
            1,
            668,
            1,
            670,
            1,
            693,
            7,
            696,
            52,
            697,
            37,
            698,
            52,
            725,
            30,
            760,
            21,
            761,
            2,
            762,
            21,
            763,
            2,
            764,
            3,
            806,
            27,
            807,
            23,
            808,
            27,
            809,
            27,
            810,
            2,
            811,
            23,
            833,
            1,
            835,
            6,
            853,
            17,
            855,
            1,
            886,
            2,
            894,
            14,
            919,
            2,
            1018,
            1,
            1034,
            2,
            1038,
            19,
            1040,
            19,
            1041,
            13,
            1042,
            14,
            1043,
            29,
            1044,
            3,
            1045,
            12,
            1060,
            4,
            1163,
            4,
            1164,
            3,
            1165,
            2,
            1166,
            2,
            1167,
            2,
            1168,
            6,
            1169,
            2,
            1176,
            3,
            1177,
            4,
            1181,
            1,
            1182,
            1,
            1185,
            7,
            1186,
            5,
            1228,
            3,
            1229,
            4,
            1246,
            4,
            1270,
            3,
            1290,
            2,
            1297,
            4,
            1298,
            3,
            1348,
            5,
            1366,
            3,
            1372,
            3,
            1376,
            4,
            1378,
            4,
            1400,
            1,
            1401,
            1,
            1443,
            17,
            1444,
            2,
            1462,
            2,
            1486,
            2,
            1492,
            1,
            1506,
            2,
            1507,
            3,
            1512,
            9,
            1519,
            3,
            1537,
            1,
            1539,
            3,
            1541,
            2,
            1547,
            2,
            1556,
            8,
            1565,
            3,
            1590,
            4,
            1618,
            5,
            1622,
            3,
            1631,
            4,
            1632,
            3,
            1635,
            2,
            1636,
            6,
            1677,
            3,
            1678,
            3,
            1696,
            6,
            1697,
            4,
            1720,
            3,
            1755,
            3,
            1759,
            4,
            1789,
            2,
            1814,
            2,
            1815,
            5,
            1819,
            1,
            1821,
            1,
            1826,
            3,
            1827,
            2,
            1832,
            4,
            1835,
            3,
            1859,
            1,
            1862,
            5,
            1876,
            6,
            1879,
            4,
            1880,
            3,
            1924,
            2,
            1940,
            1,
            1941,
            1,
            1942,
            1,
            1970,
            2,
            1990,
            1,
            1992,
            1,
            2012,
            1,
            2013,
            2,
            2014,
            3,
            2026,
            1,
            2035,
            1,
            2036,
            1,
            2038,
            2,
            2051,
            3,
            2075,
            6,
            2076,
            1,
            2084,
            2,
            2095,
            2,
            2096,
            1,
            2104,
            3,
            2107,
            1,
            2110,
            1,
            2121,
            2,
            2122,
            4,
            2123,
            2,
            2135,
            2,
            2175,
            6,
            2183,
            3,
            2211,
            4,
            2219,
            4,
            2239,
            2,
            2249,
            2,
            2284,
            3,
            2293,
            3,
            2318,
            2,
            2319,
            2,
            2349,
            4,
            2354,
            2,
            2355,
            2,
            2382,
            1,
            2383,
            1,
            2425,
            2,
            2455,
            2,
            2492,
            2,
            2493,
            1,
            2535,
            2,
            2536,
            2,
            2551,
            2
        },
        {
            0,
            23,
            1,
            192,
            6,
            27,
            7,
            14,
            13,
            28,
            15,
            15,
            16,
            10,
            18,
            23,
            19,
            36,
            21,
            17,
            24,
            34,
            25,
            24,
            29,
            18,
            30,
            24,
            36,
            20,
            37,
            11,
            38,
            12,
            39,
            12,
            40,
            20,
            41,
            11,
            42,
            11,
            43,
            11,
            44,
            12,
            51,
            29,
            52,
            29,
            53,
            9,
            57,
            29,
            58,
            16,
            59,
            9,
            64,
            8,
            78,
            80,
            85,
            18,
            86,
            18,
            89,
            68,
            90,
            28,
            91,
            18,
            92,
            5,
            96,
            30,
            97,
            28,
            98,
            18,
            99,
            13,
            102,
            11,
            108,
            24,
            109,
            24,
            111,
            11,
            116,
            24,
            117,
            24,
            118,
            13,
            133,
            7,
            134,
            7,
            135,
            7,
            136,
            7,
            137,
            7,
            140,
            37,
            141,
            36,
            147,
            36,
            159,
            18,
            169,
            20,
            170,
            20,
            174,
            21,
            175,
            20,
            176,
            13,
            189,
            38,
            202,
            32,
            203,
            29,
            208,
            31,
            209,
            31,
            210,
            29,
            235,
            10,
            253,
            16,
            254,
            16,
            255,
            2,
            301,
            32,
            307,
            11,
            308,
            22,
            309,
            11,
            310,
            11,
            311,
            9,
            312,
            38,
            315,
            38,
            361,
            17,
            362,
            13,
            363,
            13,
            364,
            13,
            365,
            17,
            377,
            13,
            378,
            13,
            379,
            13,
            380,
            32,
            444,
            5,
            536,
            25,
            537,
            8,
            545,
            1,
            557,
            82,
            558,
            6,
            559,
            13,
            560,
            4,
            609,
            24,
            610,
            9,
            611,
            10,
            612,
            24,
            613,
            10,
            623,
            1,
            688,
            11,
            829,
            21,
            830,
            8,
            831,
            8,
            832,
            8,
            833,
            8,
            834,
            8,
            863,
            11,
            864,
            9,
            865,
            11,
            866,
            11,
            867,
            9,
            896,
            1,
            979,
            25,
            980,
            11,
            981,
            25,
            982,
            11,
            1037,
            13,
            1083,
            19,
            1084,
            12,
            1085,
            12,
            1086,
            11,
            1087,
            12,
            1088,
            3,
            1125,
            1,
            1130,
            1,
            1193,
            1,
            1195,
            1,
            1196,
            1,
            1209,
            25,
            1210,
            3,
            1225,
            2,
            1255,
            3,
            1256,
            3,
            1285,
            1,
            1291,
            1,
            1308,
            3,
            1311,
            2,
            1318,
            3,
            1319,
            2,
            1331,
            14,
            1332,
            14,
            1333,
            14,
            1334,
            13,
            1342,
            3,
            1358,
            1,
            1359,
            1,
            1373,
            10,
            1374,
            13,
            1375,
            2,
            1400,
            1,
            1401,
            1,
            1402,
            2,
            1416,
            9,
            1417,
            9,
            1432,
            2,
            1459,
            13,
            1460,
            13,
            1461,
            3,
            1478,
            12,
            1479,
            12,
            1480,
            12,
            1552,
            2,
            1554,
            15,
            1555,
            15,
            1564,
            7,
            1567,
            2,
            1602,
            8,
            1637,
            2,
            1638,
            5,
            1683,
            10,
            1700,
            1,
            1760,
            1,
            1773,
            2,
            1838,
            2,
            1854,
            5,
            1855,
            3,
            1856,
            5,
            1857,
            5,
            1873,
            4,
            1874,
            2,
            1877,
            6,
            1882,
            9,
            1883,
            9,
            1901,
            2,
            1903,
            2,
            1947,
            3,
            1999,
            5,
            2008,
            5,
            2019,
            3,
            2062,
            3,
            2119,
            2,
            2131,
            1,
            2190,
            2,
            2208,
            2,
            2209,
            5,
            2212,
            2,
            2238,
            2,
            2261,
            2,
            2265,
            2,
            2266,
            2,
            2268,
            5,
            2305,
            1,
            2316,
            2,
            2320,
            2,
            2326,
            2,
            2348,
            1,
            2384,
            3,
            2433,
            3,
            2445,
            2,
            2459,
            2,
            2492,
            1,
            2516,
            3,
            2523,
            2,
            2562,
            1
        },
        {
            0,
            25,
            1,
            320,
            4,
            36,
            6,
            33,
            7,
            25,
            13,
            23,
            15,
            23,
            16,
            23,
            18,
            16,
            19,
            75,
            21,
            16,
            24,
            23,
            25,
            223,
            29,
            23,
            30,
            223,
            34,
            20,
            35,
            20,
            36,
            24,
            38,
            26,
            40,
            24,
            41,
            24,
            45,
            12,
            51,
            20,
            52,
            20,
            57,
            20,
            58,
            20,
            78,
            76,
            85,
            18,
            86,
            18,
            87,
            19,
            88,
            47,
            89,
            57,
            90,
            27,
            91,
            18,
            92,
            18,
            93,
            19,
            96,
            30,
            97,
            27,
            98,
            28,
            100,
            21,
            102,
            28,
            108,
            23,
            109,
            22,
            111,
            7,
            116,
            22,
            117,
            22,
            118,
            24,
            140,
            33,
            141,
            33,
            147,
            33,
            169,
            31,
            170,
            31,
            174,
            24,
            175,
            31,
            176,
            31,
            189,
            20,
            202,
            29,
            203,
            27,
            208,
            27,
            209,
            27,
            210,
            27,
            217,
            27,
            222,
            27,
            267,
            48,
            268,
            6,
            269,
            48,
            270,
            24,
            271,
            30,
            272,
            6,
            273,
            2,
            280,
            110,
            284,
            26,
            287,
            26,
            312,
            21,
            313,
            20,
            314,
            43,
            315,
            21,
            316,
            20,
            317,
            20,
            318,
            21,
            319,
            20,
            320,
            8,
            352,
            46,
            353,
            8,
            354,
            23,
            355,
            46,
            356,
            18,
            357,
            8,
            358,
            6,
            359,
            23,
            360,
            2,
            371,
            2,
            436,
            3,
            581,
            28,
            582,
            28,
            583,
            28,
            584,
            27,
            588,
            14,
            589,
            15,
            590,
            15,
            591,
            14,
            592,
            14,
            593,
            15,
            594,
            15,
            597,
            18,
            607,
            18,
            608,
            18,
            716,
            18,
            717,
            18,
            749,
            48,
            817,
            17,
            818,
            18,
            819,
            16,
            820,
            3,
            933,
            2,
            934,
            7,
            935,
            7,
            1000,
            1,
            1002,
            1,
            1089,
            19,
            1103,
            2,
            1148,
            7,
            1149,
            1,
            1151,
            1,
            1173,
            1,
            1193,
            1,
            1195,
            1,
            1196,
            1,
            1216,
            25,
            1217,
            25,
            1218,
            25,
            1219,
            23,
            1320,
            1,
            1323,
            1,
            1324,
            1,
            1330,
            3,
            1358,
            1,
            1359,
            1,
            1362,
            3,
            1363,
            3,
            1364,
            3,
            1400,
            1,
            1401,
            1,
            1498,
            2,
            1499,
            2,
            1500,
            3,
            1508,
            4,
            1510,
            2,
            1517,
            2,
            1523,
            20,
            1524,
            21,
            1525,
            20,
            1526,
            20,
            1527,
            21,
            1530,
            10,
            1531,
            11,
            1532,
            10,
            1533,
            5,
            1585,
            7,
            1586,
            6,
            1587,
            7,
            1614,
            3,
            1617,
            3,
            1727,
            4,
            1737,
            5,
            1758,
            2,
            1805,
            25,
            1806,
            26,
            1807,
            26,
            1808,
            25,
            1825,
            4,
            1878,
            2,
            1884,
            4,
            1923,
            3,
            1984,
            1,
            1985,
            1,
            1993,
            4,
            2039,
            11,
            2040,
            11,
            2047,
            3,
            2055,
            2,
            2056,
            2,
            2074,
            1,
            2129,
            2,
            2149,
            2,
            2240,
            2,
            2260,
            2,
            2272,
            1,
            2273,
            1,
            2298,
            2,
            2300,
            4,
            2327,
            3,
            2346,
            2,
            2375,
            2,
            2376,
            2,
            2429,
            4,
            2434,
            2,
            2442,
            2,
            2452,
            3,
            2498,
            2,
            2503,
            3,
            2504,
            2,
            2514,
            2,
            2538,
            2,
            2550,
            2
        },
        {
            0,
            22,
            1,
            265,
            5,
            19,
            6,
            34,
            7,
            16,
            12,
            2,
            13,
            18,
            15,
            18,
            16,
            16,
            18,
            19,
            19,
            46,
            21,
            16,
            24,
            24,
            25,
            31,
            27,
            28,
            29,
            22,
            30,
            31,
            36,
            26,
            38,
            30,
            40,
            26,
            41,
            22,
            45,
            53,
            51,
            20,
            52,
            20,
            57,
            20,
            58,
            18,
            64,
            41,
            75,
            70,
            76,
            15,
            77,
            9,
            78,
            134,
            79,
            9,
            80,
            51,
            81,
            14,
            82,
            4,
            83,
            9,
            84,
            9,
            85,
            22,
            86,
            22,
            89,
            69,
            90,
            23,
            91,
            22,
            92,
            17,
            96,
            27,
            97,
            23,
            98,
            19,
            100,
            11,
            102,
            15,
            105,
            2,
            108,
            29,
            109,
            26,
            111,
            35,
            116,
            26,
            117,
            26,
            118,
            26,
            126,
            10,
            129,
            14,
            132,
            14,
            140,
            28,
            141,
            24,
            147,
            24,
            169,
            28,
            170,
            28,
            172,
            30,
            174,
            30,
            175,
            28,
            176,
            24,
            199,
            6,
            202,
            38,
            203,
            38,
            208,
            38,
            209,
            35,
            210,
            38,
            217,
            15,
            229,
            2,
            274,
            26,
            275,
            10,
            307,
            19,
            309,
            19,
            381,
            22,
            382,
            55,
            383,
            22,
            384,
            22,
            385,
            42,
            386,
            3,
            415,
            16,
            422,
            3,
            423,
            2,
            425,
            44,
            426,
            24,
            431,
            24,
            432,
            1,
            437,
            18,
            438,
            12,
            439,
            18,
            440,
            3,
            441,
            19,
            473,
            11,
            474,
            11,
            504,
            1,
            543,
            5,
            544,
            4,
            546,
            11,
            547,
            11,
            548,
            12,
            549,
            11,
            550,
            11,
            551,
            1,
            552,
            2,
            553,
            12,
            554,
            12,
            555,
            2,
            597,
            23,
            598,
            19,
            599,
            18,
            600,
            23,
            601,
            13,
            602,
            19,
            603,
            13,
            604,
            7,
            605,
            5,
            614,
            10,
            618,
            10,
            628,
            10,
            629,
            10,
            630,
            2,
            693,
            6,
            696,
            11,
            698,
            11,
            731,
            1,
            732,
            1,
            733,
            1,
            734,
            14,
            735,
            3,
            760,
            3,
            763,
            1,
            773,
            2,
            807,
            9,
            811,
            9,
            833,
            3,
            884,
            2,
            885,
            6,
            886,
            6,
            887,
            16,
            888,
            16,
            889,
            16,
            890,
            16,
            891,
            16,
            892,
            16,
            893,
            8,
            894,
            19,
            915,
            9,
            916,
            10,
            917,
            9,
            918,
            3,
            919,
            10,
            949,
            7,
            950,
            7,
            955,
            3,
            1000,
            2,
            1002,
            2,
            1003,
            8,
            1004,
            8,
            1005,
            8,
            1006,
            8,
            1007,
            8,
            1008,
            8,
            1009,
            8,
            1020,
            2,
            1034,
            1,
            1038,
            26,
            1040,
            17,
            1041,
            9,
            1042,
            9,
            1045,
            9,
            1145,
            3,
            1149,
            2,
            1150,
            14,
            1151,
            2,
            1168,
            2,
            1169,
            2,
            1179,
            24,
            1180,
            12,
            1181,
            3,
            1182,
            3,
            1186,
            2,
            1193,
            1,
            1195,
            1,
            1196,
            1,
            1197,
            15,
            1198,
            15,
            1199,
            15,
            1200,
            13,
            1220,
            12,
            1221,
            12,
            1229,
            1,
            1242,
            27,
            1243,
            10,
            1244,
            27,
            1245,
            10,
            1246,
            6,
            1275,
            15,
            1276,
            3,
            1284,
            7,
            1288,
            7,
            1289,
            9,
            1290,
            4,
            1298,
            1,
            1309,
            6,
            1320,
            1,
            1323,
            1,
            1324,
            1,
            1365,
            5,
            1366,
            2,
            1372,
            2,
            1376,
            1,
            1393,
            2,
            1400,
            1,
            1401,
            1,
            1451,
            1,
            1452,
            1,
            1453,
            1,
            1455,
            3,
            1458,
            3,
            1519,
            1,
            1537,
            1,
            1539,
            1,
            1547,
            1,
            1568,
            2,
            1583,
            1,
            1610,
            2,
            1622,
            5,
            1632,
            1,
            1636,
            1,
            1670,
            1,
            1671,
            1,
            1678,
            2,
            1695,
            3,
            1697,
            1,
            1720,
            3,
            1721,
            10,
            1722,
            10,
            1723,
            10,
            1724,
            10,
            1740,
            3,
            1752,
            1,
            1753,
            6,
            1759,
            2,
            1772,
            2,
            1795,
            2,
            1796,
            1,
            1797,
            7,
            1798,
            1,
            1799,
            1,
            1815,
            1,
            1822,
            1,
            1826,
            2,
            1832,
            3,
            1839,
            5,
            1840,
            5,
            1841,
            5,
            1859,
            3,
            1862,
            1,
            1867,
            17,
            1868,
            17,
            1869,
            17,
            1870,
            17,
            1871,
            6,
            1876,
            4,
            1879,
            1,
            1880,
            1,
            1898,
            1,
            1899,
            1,
            1900,
            1,
            1957,
            3,
            1963,
            10,
            1964,
            10,
            1974,
            1,
            1981,
            1,
            2013,
            1,
            2026,
            1,
            2038,
            1,
            2076,
            3,
            2096,
            2,
            2107,
            4,
            2109,
            1,
            2148,
            2,
            2151,
            1,
            2152,
            1,
            2175,
            2,
            2189,
            2,
            2203,
            3,
            2228,
            1,
            2229,
            1,
            2243,
            2,
            2245,
            4,
            2249,
            1,
            2251,
            3,
            2305,
            1,
            2319,
            1,
            2321,
            3,
            2328,
            2,
            2338,
            5,
            2340,
            1,
            2341,
            1,
            2342,
            1,
            2343,
            1,
            2344,
            2,
            2359,
            4,
            2372,
            1,
            2377,
            4,
            2378,
            2,
            2401,
            3,
            2405,
            3,
            2410,
            1,
            2411,
            1,
            2419,
            3,
            2421,
            2,
            2444,
            1,
            2447,
            3,
            2495,
            2,
            2521,
            3,
            2526,
            2,
            2529,
            2,
            2534,
            2,
            2544,
            1,
            2545,
            1,
            2557,
            2,
            2567,
            2
        },
        {
            0,
            19,
            1,
            244,
            2,
            29,
            4,
            73,
            6,
            27,
            7,
            10,
            8,
            29,
            13,
            25,
            15,
            25,
            16,
            19,
            18,
            19,
            19,
            106,
            21,
            17,
            24,
            24,
            26,
            86,
            27,
            177,
            28,
            2,
            29,
            16,
            33,
            2,
            36,
            19,
            40,
            19,
            41,
            16,
            45,
            132,
            51,
            29,
            52,
            29,
            57,
            29,
            58,
            25,
            70,
            4,
            71,
            4,
            73,
            4,
            74,
            4,
            78,
            101,
            85,
            20,
            86,
            20,
            89,
            90,
            90,
            33,
            91,
            20,
            92,
            13,
            96,
            34,
            97,
            33,
            98,
            20,
            100,
            5,
            102,
            12,
            108,
            34,
            109,
            33,
            111,
            6,
            114,
            13,
            115,
            3,
            116,
            33,
            117,
            33,
            118,
            26,
            124,
            3,
            140,
            30,
            141,
            27,
            147,
            27,
            151,
            2,
            154,
            13,
            155,
            2,
            169,
            18,
            170,
            18,
            174,
            35,
            175,
            18,
            176,
            13,
            182,
            4,
            185,
            4,
            199,
            106,
            201,
            5,
            202,
            37,
            203,
            34,
            206,
            5,
            208,
            33,
            209,
            33,
            210,
            34,
            230,
            3,
            232,
            3,
            289,
            2,
            294,
            2,
            298,
            1,
            323,
            4,
            372,
            4,
            376,
            4,
            387,
            39,
            388,
            4,
            389,
            39,
            390,
            1,
            414,
            2,
            437,
            70,
            439,
            70,
            460,
            32,
            461,
            69,
            462,
            32,
            463,
            32,
            464,
            69,
            465,
            2,
            481,
            9,
            483,
            3,
            489,
            1,
            491,
            1,
            497,
            6,
            510,
            1,
            512,
            1,
            513,
            1,
            534,
            121,
            535,
            82,
            570,
            4,
            574,
            4,
            578,
            4,
            614,
            38,
            615,
            38,
            616,
            86,
            617,
            86,
            618,
            38,
            619,
            35,
            620,
            5,
            621,
            4,
            632,
            6,
            633,
            40,
            634,
            33,
            635,
            38,
            636,
            40,
            637,
            3,
            639,
            5,
            642,
            5,
            652,
            3,
            653,
            37,
            663,
            2,
            664,
            1,
            665,
            1,
            666,
            85,
            667,
            1,
            668,
            1,
            670,
            1,
            690,
            5,
            694,
            5,
            695,
            1,
            715,
            4,
            753,
            3,
            754,
            3,
            755,
            3,
            756,
            3,
            757,
            3,
            794,
            5,
            795,
            5,
            821,
            28,
            822,
            29,
            823,
            28,
            827,
            5,
            836,
            1,
            837,
            1,
            839,
            7,
            842,
            7,
            896,
            1,
            897,
            2,
            898,
            1,
            899,
            2,
            911,
            2,
            914,
            2,
            1030,
            2,
            1034,
            5,
            1035,
            2,
            1038,
            43,
            1039,
            5,
            1040,
            43,
            1081,
            7,
            1090,
            5,
            1104,
            3,
            1149,
            1,
            1151,
            1,
            1161,
            2,
            1162,
            1,
            1178,
            5,
            1187,
            1,
            1188,
            1,
            1208,
            1,
            1236,
            2,
            1237,
            2,
            1238,
            1,
            1276,
            4,
            1290,
            4,
            1341,
            5,
            1369,
            1,
            1379,
            5,
            1385,
            1,
            1391,
            1,
            1395,
            4,
            1398,
            4,
            1399,
            1,
            1413,
            2,
            1414,
            2,
            1415,
            2,
            1423,
            2,
            1433,
            2,
            1434,
            2,
            1435,
            2,
            1487,
            1,
            1514,
            1,
            1547,
            8,
            1550,
            2,
            1563,
            1,
            1594,
            2,
            1595,
            2,
            1596,
            2,
            1598,
            1,
            1600,
            1,
            1630,
            4,
            1674,
            2,
            1675,
            2,
            1716,
            2,
            1725,
            2,
            1726,
            2,
            1745,
            1,
            1776,
            4,
            1791,
            1,
            1792,
            1,
            1802,
            1,
            1811,
            1,
            1822,
            4,
            1829,
            1,
            1830,
            1,
            1853,
            4,
            1863,
            3,
            1875,
            1,
            1898,
            1,
            1899,
            1,
            1900,
            1,
            1907,
            2,
            1909,
            3,
            1926,
            2,
            1940,
            1,
            1941,
            1,
            1942,
            1,
            1958,
            1,
            1975,
            2,
            1979,
            4,
            1980,
            3,
            1982,
            1,
            1984,
            1,
            1985,
            1,
            2005,
            3,
            2061,
            6,
            2063,
            4,
            2097,
            1,
            2098,
            3,
            2099,
            6,
            2109,
            1,
            2111,
            2,
            2124,
            6,
            2136,
            2,
            2142,
            5,
            2155,
            2,
            2156,
            1,
            2179,
            1,
            2180,
            1,
            2181,
            2,
            2218,
            2,
            2221,
            2,
            2222,
            2,
            2223,
            2,
            2226,
            2,
            2233,
            3,
            2257,
            1,
            2262,
            1,
            2285,
            1,
            2289,
            2,
            2308,
            1,
            2309,
            1,
            2310,
            1,
            2340,
            1,
            2341,
            1,
            2350,
            1,
            2356,
            1,
            2362,
            3,
            2367,
            1,
            2373,
            2,
            2382,
            1,
            2383,
            1,
            2385,
            4,
            2388,
            1,
            2416,
            2,
            2486,
            2,
            2507,
            4,
            2518,
            2,
            2524,
            1,
            2544,
            1,
            2545,
            1
        },
        {
            0,
            20,
            1,
            320,
            6,
            37,
            7,
            20,
            13,
            27,
            15,
            27,
            16,
            27,
            18,
            18,
            19,
            90,
            21,
            18,
            24,
            19,
            25,
            1,
            27,
            18,
            28,
            3,
            29,
            19,
            30,
            1,
            33,
            2,
            36,
            26,
            38,
            24,
            40,
            26,
            41,
            26,
            51,
            23,
            52,
            23,
            54,
            55,
            57,
            23,
            58,
            23,
            64,
            18,
            70,
            2,
            71,
            2,
            73,
            2,
            74,
            2,
            78,
            111,
            85,
            55,
            86,
            23,
            89,
            51,
            90,
            26,
            91,
            23,
            92,
            23,
            96,
            26,
            97,
            26,
            98,
            25,
            100,
            28,
            102,
            25,
            105,
            6,
            108,
            30,
            109,
            29,
            111,
            11,
            114,
            10,
            115,
            3,
            116,
            29,
            117,
            29,
            118,
            30,
            124,
            3,
            140,
            33,
            141,
            31,
            147,
            31,
            151,
            3,
            154,
            2,
            155,
            3,
            159,
            15,
            169,
            22,
            170,
            22,
            171,
            17,
            172,
            17,
            173,
            34,
            174,
            25,
            175,
            22,
            176,
            22,
            177,
            17,
            178,
            17,
            179,
            16,
            180,
            3,
            182,
            1,
            185,
            1,
            189,
            33,
            199,
            9,
            201,
            1,
            202,
            43,
            203,
            23,
            206,
            1,
            208,
            25,
            209,
            25,
            210,
            23,
            217,
            51,
            230,
            2,
            232,
            2,
            280,
            42,
            284,
            24,
            287,
            17,
            288,
            36,
            289,
            2,
            290,
            17,
            291,
            17,
            292,
            18,
            293,
            18,
            294,
            1,
            299,
            19,
            300,
            53,
            301,
            18,
            302,
            19,
            303,
            19,
            304,
            53,
            305,
            19,
            306,
            18,
            307,
            24,
            309,
            24,
            312,
            89,
            315,
            89,
            323,
            7,
            329,
            1,
            372,
            5,
            376,
            5,
            390,
            1,
            414,
            8,
            425,
            25,
            481,
            6,
            483,
            2,
            489,
            4,
            491,
            4,
            492,
            17,
            494,
            1,
            495,
            17,
            497,
            3,
            499,
            1,
            514,
            68,
            515,
            24,
            516,
            45,
            517,
            25,
            518,
            24,
            525,
            17,
            526,
            16,
            527,
            19,
            528,
            17,
            529,
            17,
            530,
            16,
            531,
            16,
            532,
            19,
            533,
            7,
            570,
            5,
            574,
            5,
            575,
            1,
            576,
            24,
            577,
            23,
            578,
            5,
            621,
            7,
            632,
            4,
            633,
            15,
            637,
            3,
            639,
            3,
            642,
            3,
            654,
            1,
            655,
            17,
            656,
            1,
            657,
            18,
            658,
            17,
            659,
            2,
            663,
            8,
            690,
            2,
            693,
            9,
            694,
            2,
            711,
            21,
            714,
            10,
            715,
            5,
            749,
            18,
            751,
            15,
            752,
            15,
            753,
            1,
            754,
            2,
            756,
            1,
            757,
            2,
            794,
            2,
            795,
            2,
            839,
            2,
            842,
            2,
            851,
            2,
            852,
            1,
            856,
            16,
            857,
            16,
            858,
            16,
            859,
            18,
            860,
            3,
            911,
            2,
            914,
            2,
            951,
            77,
            952,
            77,
            953,
            21,
            954,
            19,
            955,
            12,
            966,
            20,
            967,
            24,
            968,
            20,
            969,
            20,
            970,
            24,
            1007,
            5,
            1030,
            2,
            1034,
            1,
            1035,
            2,
            1056,
            1,
            1133,
            19,
            1134,
            19,
            1135,
            19,
            1136,
            18,
            1145,
            1,
            1188,
            1,
            1208,
            1,
            1222,
            1,
            1277,
            17,
            1320,
            2,
            1321,
            1,
            1322,
            3,
            1323,
            2,
            1324,
            2,
            1325,
            1,
            1335,
            15,
            1336,
            15,
            1337,
            15,
            1338,
            15,
            1339,
            15,
            1340,
            15,
            1341,
            2,
            1349,
            23,
            1350,
            23,
            1351,
            23,
            1352,
            21,
            1353,
            1,
            1354,
            2,
            1355,
            23,
            1356,
            23,
            1357,
            3,
            1379,
            2,
            1395,
            7,
            1398,
            7,
            1407,
            17,
            1408,
            17,
            1409,
            17,
            1420,
            1,
            1422,
            4,
            1454,
            1,
            1456,
            2,
            1481,
            4,
            1549,
            2,
            1550,
            1,
            1563,
            1,
            1567,
            1,
            1574,
            2,
            1577,
            1,
            1578,
            7,
            1685,
            4,
            1686,
            2,
            1689,
            1,
            1802,
            1,
            1809,
            1,
            1811,
            1,
            1836,
            1,
            1920,
            2,
            1950,
            4,
            1954,
            3,
            1955,
            2,
            1956,
            3,
            1982,
            1,
            1984,
            1,
            1985,
            1,
            1997,
            2,
            2000,
            3,
            2052,
            6,
            2053,
            1,
            2058,
            3,
            2062,
            2,
            2069,
            2,
            2070,
            2,
            2071,
            2,
            2119,
            1,
            2120,
            2,
            2131,
            2,
            2138,
            2,
            2139,
            1,
            2151,
            1,
            2152,
            1,
            2156,
            1,
            2168,
            2,
            2192,
            1,
            2193,
            1,
            2194,
            1,
            2198,
            3,
            2206,
            1,
            2228,
            1,
            2229,
            1,
            2236,
            1,
            2265,
            2,
            2266,
            2,
            2331,
            1,
            2332,
            1,
            2333,
            1,
            2351,
            4,
            2360,
            3,
            2384,
            1,
            2385,
            1,
            2407,
            2,
            2418,
            2,
            2439,
            2,
            2487,
            3,
            2488,
            2,
            2510,
            2,
            2517,
            4,
            2520,
            2,
            2542,
            3,
            2554,
            2
        },
        {
            0,
            13,
            1,
            281,
            2,
            12,
            6,
            28,
            7,
            11,
            13,
            28,
            15,
            28,
            16,
            25,
            18,
            21,
            19,
            125,
            21,
            18,
            24,
            38,
            28,
            115,
            29,
            30,
            36,
            19,
            40,
            19,
            41,
            17,
            51,
            16,
            52,
            16,
            57,
            16,
            58,
            11,
            64,
            53,
            70,
            11,
            71,
            10,
            73,
            11,
            74,
            10,
            76,
            28,
            78,
            214,
            85,
            15,
            86,
            15,
            89,
            64,
            90,
            36,
            91,
            15,
            92,
            15,
            96,
            38,
            97,
            36,
            98,
            17,
            100,
            27,
            102,
            15,
            105,
            4,
            108,
            69,
            109,
            45,
            110,
            20,
            111,
            33,
            112,
            21,
            113,
            21,
            114,
            23,
            115,
            8,
            116,
            45,
            117,
            45,
            118,
            25,
            119,
            20,
            120,
            20,
            121,
            21,
            122,
            21,
            123,
            2,
            124,
            8,
            135,
            25,
            138,
            21,
            139,
            55,
            140,
            28,
            141,
            26,
            142,
            107,
            143,
            21,
            144,
            21,
            145,
            55,
            146,
            3,
            147,
            26,
            151,
            11,
            155,
            11,
            156,
            1,
            169,
            15,
            170,
            15,
            174,
            36,
            175,
            15,
            176,
            13,
            181,
            18,
            182,
            6,
            183,
            18,
            184,
            12,
            185,
            6,
            186,
            3,
            187,
            4,
            201,
            14,
            202,
            26,
            203,
            25,
            206,
            14,
            207,
            7,
            208,
            26,
            209,
            26,
            210,
            25,
            212,
            10,
            214,
            6,
            230,
            12,
            231,
            14,
            232,
            12,
            260,
            4,
            262,
            20,
            263,
            2,
            264,
            20,
            265,
            12,
            266,
            4,
            289,
            11,
            298,
            1,
            323,
            7,
            336,
            2,
            342,
            12,
            372,
            10,
            376,
            10,
            390,
            1,
            392,
            5,
            411,
            2,
            414,
            8,
            447,
            21,
            448,
            21,
            449,
            2,
            450,
            1,
            481,
            13,
            483,
            9,
            489,
            5,
            491,
            5,
            522,
            42,
            523,
            17,
            524,
            17,
            557,
            12,
            561,
            18,
            562,
            20,
            563,
            20,
            564,
            18,
            565,
            18,
            566,
            20,
            567,
            20,
            568,
            5,
            570,
            6,
            574,
            6,
            575,
            2,
            578,
            8,
            595,
            4,
            621,
            7,
            632,
            4,
            639,
            5,
            642,
            5,
            663,
            8,
            664,
            1,
            668,
            1,
            669,
            4,
            670,
            1,
            689,
            29,
            690,
            6,
            691,
            15,
            692,
            15,
            693,
            37,
            694,
            6,
            695,
            1,
            712,
            8,
            715,
            8,
            753,
            7,
            754,
            7,
            756,
            7,
            757,
            7,
            772,
            1,
            774,
            14,
            775,
            14,
            776,
            14,
            777,
            8,
            778,
            2,
            794,
            9,
            795,
            9,
            813,
            3,
            815,
            1,
            839,
            10,
            842,
            10,
            876,
            1,
            878,
            2,
            902,
            9,
            903,
            9,
            904,
            2,
            911,
            6,
            914,
            6,
            921,
            13,
            922,
            13,
            923,
            13,
            924,
            4,
            930,
            2,
            931,
            2,
            932,
            2,
            936,
            14,
            937,
            15,
            938,
            14,
            939,
            14,
            940,
            15,
            963,
            24,
            964,
            24,
            965,
            17,
            979,
            17,
            983,
            25,
            984,
            25,
            985,
            25,
            986,
            3,
            1000,
            1,
            1002,
            1,
            1023,
            3,
            1029,
            2,
            1030,
            8,
            1035,
            8,
            1061,
            12,
            1062,
            12,
            1063,
            12,
            1064,
            12,
            1065,
            12,
            1066,
            12,
            1067,
            12,
            1068,
            12,
            1069,
            12,
            1070,
            12,
            1071,
            12,
            1072,
            12,
            1073,
            12,
            1074,
            12,
            1075,
            12,
            1113,
            1,
            1116,
            1,
            1132,
            2,
            1137,
            10,
            1138,
            10,
            1139,
            10,
            1140,
            8,
            1141,
            3,
            1146,
            3,
            1187,
            2,
            1188,
            1,
            1208,
            1,
            1222,
            1,
            1224,
            3,
            1227,
            5,
            1238,
            3,
            1239,
            2,
            1306,
            3,
            1370,
            1,
            1391,
            3,
            1395,
            8,
            1398,
            8,
            1399,
            1,
            1406,
            2,
            1451,
            1,
            1452,
            1,
            1453,
            1,
            1454,
            3,
            1475,
            1,
            1477,
            2,
            1497,
            1,
            1505,
            2,
            1515,
            13,
            1516,
            2,
            1540,
            2,
            1546,
            4,
            1550,
            1,
            1557,
            1,
            1577,
            1,
            1597,
            8,
            1615,
            1,
            1626,
            2,
            1633,
            2,
            1634,
            2,
            1644,
            2,
            1666,
            18,
            1667,
            14,
            1668,
            14,
            1669,
            3,
            1673,
            3,
            1682,
            2,
            1701,
            1,
            1702,
            4,
            1708,
            16,
            1709,
            16,
            1710,
            16,
            1711,
            16,
            1712,
            17,
            1713,
            16,
            1716,
            1,
            1719,
            10,
            1802,
            2,
            1811,
            1,
            1819,
            1,
            1821,
            1,
            1824,
            1,
            1831,
            1,
            1836,
            1,
            1851,
            2,
            1918,
            1,
            1922,
            3,
            1959,
            1,
            1969,
            1,
            1995,
            5,
            2001,
            2,
            2105,
            4,
            2118,
            1,
            2138,
            5,
            2157,
            2,
            2165,
            1,
            2178,
            2,
            2185,
            1,
            2192,
            1,
            2193,
            1,
            2194,
            1,
            2206,
            2,
            2217,
            2,
            2226,
            1,
            2241,
            2,
            2253,
            1,
            2257,
            1,
            2262,
            2,
            2263,
            2,
            2264,
            2,
            2274,
            2,
            2275,
            2,
            2306,
            1,
            2307,
            1,
            2312,
            2,
            2325,
            2,
            2329,
            1,
            2348,
            3,
            2350,
            1,
            2367,
            1,
            2388,
            2,
            2427,
            2,
            2437,
            3,
            2438,
            3,
            2457,
            2,
            2460,
            1,
            2490,
            3,
            2492,
            1,
            2493,
            1,
            2524,
            1,
            2525,
            2,
            2537,
            2
        },
        {
            0,
            20,
            1,
            304,
            5,
            2,
            6,
            26,
            7,
            20,
            13,
            50,
            15,
            50,
            16,
            28,
            18,
            18,
            19,
            29,
            21,
            15,
            24,
            20,
            25,
            100,
            29,
            19,
            30,
            100,
            36,
            16,
            38,
            22,
            40,
            16,
            41,
            16,
            51,
            21,
            52,
            21,
            53,
            47,
            54,
            56,
            55,
            26,
            56,
            56,
            57,
            21,
            58,
            20,
            59,
            47,
            60,
            28,
            61,
            26,
            62,
            26,
            64,
            68,
            78,
            104,
            85,
            26,
            86,
            26,
            87,
            48,
            88,
            73,
            89,
            75,
            90,
            33,
            91,
            26,
            92,
            24,
            93,
            48,
            94,
            17,
            95,
            5,
            96,
            36,
            97,
            33,
            98,
            25,
            99,
            25,
            100,
            70,
            101,
            62,
            102,
            22,
            103,
            25,
            104,
            25,
            105,
            66,
            106,
            42,
            107,
            6,
            108,
            36,
            109,
            20,
            111,
            1,
            116,
            20,
            117,
            20,
            118,
            20,
            126,
            1,
            140,
            30,
            141,
            27,
            147,
            27,
            169,
            20,
            170,
            20,
            174,
            30,
            175,
            20,
            176,
            19,
            188,
            49,
            189,
            35,
            191,
            49,
            192,
            15,
            202,
            37,
            203,
            34,
            208,
            35,
            209,
            35,
            210,
            34,
            260,
            2,
            275,
            2,
            330,
            14,
            331,
            14,
            332,
            14,
            333,
            16,
            336,
            3,
            392,
            1,
            411,
            1,
            425,
            4,
            426,
            2,
            431,
            2,
            458,
            17,
            459,
            6,
            484,
            17,
            485,
            17,
            486,
            17,
            487,
            20,
            494,
            1,
            499,
            1,
            548,
            4,
            553,
            4,
            554,
            4,
            585,
            15,
            586,
            2,
            587,
            15,
            596,
            2,
            599,
            1,
            696,
            4,
            698,
            4,
            705,
            15,
            706,
            13,
            707,
            15,
            708,
            13,
            712,
            1,
            760,
            1,
            807,
            2,
            811,
            2,
            813,
            3,
            838,
            12,
            839,
            12,
            840,
            12,
            841,
            12,
            842,
            12,
            843,
            12,
            853,
            41,
            854,
            24,
            855,
            9,
            886,
            1,
            894,
            2,
            920,
            2,
            997,
            4,
            1038,
            1,
            1040,
            1,
            1041,
            3,
            1042,
            4,
            1045,
            3,
            1149,
            1,
            1151,
            1,
            1193,
            2,
            1194,
            2,
            1195,
            2,
            1196,
            2,
            1229,
            1,
            1264,
            1,
            1266,
            1,
            1306,
            1,
            1358,
            2,
            1359,
            2,
            1392,
            10,
            1403,
            9,
            1404,
            2,
            1405,
            2,
            1424,
            6,
            1436,
            21,
            1437,
            22,
            1438,
            22,
            1439,
            21,
            1440,
            21,
            1441,
            22,
            1442,
            22,
            1488,
            20,
            1489,
            20,
            1490,
            18,
            1491,
            3,
            1492,
            2,
            1545,
            5,
            1551,
            5,
            1558,
            27,
            1559,
            27,
            1560,
            27,
            1561,
            27,
            1562,
            27,
            1573,
            4,
            1592,
            8,
            1659,
            14,
            1660,
            4,
            1690,
            12,
            1691,
            12,
            1692,
            13,
            1693,
            12,
            1694,
            2,
            1717,
            2,
            1728,
            2,
            1729,
            2,
            1730,
            2,
            1791,
            1,
            1792,
            1,
            1800,
            4,
            1801,
            2,
            1816,
            2,
            1828,
            3,
            1914,
            3,
            1915,
            3,
            1949,
            2,
            1960,
            2,
            1967,
            3,
            1968,
            3,
            1984,
            1,
            1985,
            1,
            1987,
            3,
            2075,
            1,
            2093,
            4,
            2096,
            1,
            2107,
            1,
            2108,
            3,
            2150,
            2,
            2153,
            2,
            2154,
            2,
            2158,
            6,
            2177,
            5,
            2191,
            4,
            2192,
            2,
            2193,
            2,
            2194,
            2,
            2224,
            2,
            2265,
            1,
            2266,
            1,
            2319,
            1,
            2342,
            1,
            2343,
            1,
            2406,
            4,
            2408,
            2,
            2409,
            2,
            2454,
            1,
            2468,
            2,
            2469,
            2,
            2470,
            2,
            2489,
            2
        },
        {
            0,
            19,
            1,
            226,
            2,
            23,
            6,
            46,
            7,
            14,
            8,
            23,
            13,
            24,
            15,
            24,
            16,
            18,
            18,
            18,
            19,
            37,
            21,
            13,
            24,
            24,
            27,
            21,
            28,
            1,
            29,
            17,
            33,
            1,
            36,
            19,
            40,
            19,
            41,
            14,
            45,
            47,
            46,
            23,
            47,
            16,
            48,
            23,
            49,
            22,
            50,
            3,
            51,
            31,
            52,
            31,
            57,
            31,
            58,
            23,
            64,
            26,
            70,
            28,
            76,
            43,
            77,
            9,
            78,
            172,
            79,
            8,
            83,
            9,
            84,
            8,
            85,
            52,
            86,
            26,
            89,
            70,
            90,
            39,
            91,
            15,
            92,
            10,
            96,
            41,
            97,
            39,
            98,
            24,
            100,
            4,
            102,
            13,
            108,
            44,
            109,
            16,
            111,
            26,
            114,
            2,
            115,
            1,
            116,
            16,
            117,
            16,
            118,
            16,
            124,
            1,
            129,
            7,
            140,
            28,
            141,
            25,
            147,
            25,
            149,
            13,
            150,
            13,
            151,
            1,
            152,
            13,
            154,
            2,
            155,
            1,
            157,
            26,
            158,
            6,
            159,
            43,
            160,
            8,
            161,
            8,
            162,
            9,
            163,
            26,
            164,
            6,
            165,
            8,
            166,
            2,
            167,
            8,
            168,
            3,
            169,
            20,
            170,
            20,
            172,
            10,
            174,
            17,
            175,
            20,
            176,
            10,
            189,
            31,
            190,
            11,
            194,
            17,
            195,
            17,
            196,
            17,
            197,
            17,
            198,
            1,
            199,
            12,
            202,
            53,
            203,
            29,
            208,
            29,
            209,
            29,
            210,
            29,
            230,
            2,
            232,
            2,
            233,
            19,
            234,
            17,
            235,
            170,
            236,
            7,
            237,
            23,
            238,
            22,
            239,
            2,
            240,
            17,
            241,
            5,
            242,
            2,
            243,
            2,
            244,
            23,
            245,
            22,
            246,
            4,
            278,
            8,
            289,
            1,
            294,
            1,
            301,
            5,
            314,
            27,
            320,
            2,
            336,
            1,
            353,
            27,
            372,
            1,
            376,
            1,
            387,
            11,
            392,
            3,
            395,
            24,
            396,
            23,
            397,
            23,
            398,
            12,
            399,
            7,
            400,
            6,
            401,
            24,
            402,
            24,
            403,
            23,
            404,
            22,
            405,
            23,
            406,
            5,
            407,
            11,
            408,
            6,
            409,
            2,
            410,
            6,
            411,
            4,
            414,
            2,
            433,
            47,
            434,
            47,
            435,
            7,
            436,
            1,
            438,
            10,
            451,
            10,
            452,
            11,
            453,
            10,
            454,
            1,
            480,
            4,
            481,
            3,
            483,
            3,
            489,
            1,
            491,
            1,
            497,
            1,
            500,
            9,
            501,
            9,
            502,
            9,
            503,
            7,
            504,
            7,
            505,
            9,
            519,
            20,
            520,
            3,
            521,
            2,
            534,
            9,
            538,
            7,
            546,
            8,
            547,
            9,
            549,
            8,
            550,
            9,
            551,
            1,
            569,
            12,
            570,
            1,
            571,
            12,
            572,
            11,
            574,
            1,
            578,
            1,
            586,
            3,
            663,
            2,
            690,
            2,
            694,
            2,
            712,
            1,
            715,
            1,
            726,
            1,
            727,
            13,
            728,
            15,
            729,
            13,
            730,
            15,
            761,
            1,
            772,
            2,
            779,
            7,
            783,
            18,
            784,
            28,
            785,
            6,
            786,
            18,
            787,
            17,
            794,
            1,
            795,
            1,
            812,
            9,
            813,
            1,
            814,
            2,
            839,
            1,
            842,
            1,
            844,
            5,
            845,
            4,
            846,
            4,
            877,
            5,
            915,
            26,
            916,
            4,
            917,
            4,
            924,
            1,
            941,
            40,
            942,
            19,
            943,
            40,
            944,
            23,
            945,
            7,
            946,
            9,
            947,
            25,
            948,
            7,
            951,
            13,
            956,
            49,
            957,
            25,
            958,
            24,
            959,
            49,
            960,
            24,
            961,
            25,
            962,
            24,
            972,
            11,
            988,
            13,
            993,
            1,
            1010,
            11,
            1011,
            11,
            1012,
            11,
            1013,
            4,
            1014,
            4,
            1017,
            12,
            1021,
            9,
            1022,
            2,
            1023,
            4,
            1024,
            10,
            1025,
            9,
            1030,
            1,
            1034,
            4,
            1035,
            1,
            1038,
            11,
            1048,
            10,
            1064,
            10,
            1076,
            5,
            1077,
            2,
            1078,
            5,
            1079,
            5,
            1101,
            10,
            1102,
            10,
            1103,
            2,
            1123,
            14,
            1124,
            13,
            1125,
            1,
            1126,
            14,
            1127,
            13,
            1128,
            3,
            1129,
            3,
            1130,
            1,
            1142,
            4,
            1171,
            27,
            1172,
            29,
            1173,
            27,
            1174,
            15,
            1175,
            4,
            1183,
            3,
            1184,
            3,
            1186,
            3,
            1202,
            15,
            1233,
            2,
            1248,
            12,
            1249,
            3,
            1250,
            3,
            1251,
            2,
            1252,
            2,
            1253,
            10,
            1257,
            7,
            1258,
            5,
            1259,
            7,
            1260,
            7,
            1261,
            3,
            1262,
            3,
            1263,
            5,
            1273,
            1,
            1278,
            1,
            1284,
            10,
            1285,
            1,
            1286,
            2,
            1287,
            4,
            1288,
            10,
            1289,
            11,
            1290,
            1,
            1291,
            1,
            1299,
            2,
            1300,
            3,
            1326,
            11,
            1327,
            2,
            1328,
            11,
            1343,
            4,
            1344,
            6,
            1345,
            4,
            1346,
            4,
            1381,
            4,
            1382,
            5,
            1383,
            4,
            1391,
            1,
            1410,
            2,
            1411,
            2,
            1412,
            2,
            1421,
            1,
            1429,
            2,
            1430,
            2,
            1448,
            5,
            1449,
            2,
            1465,
            2,
            1466,
            2,
            1476,
            3,
            1508,
            2,
            1535,
            8,
            1536,
            9,
            1577,
            1,
            1579,
            3,
            1580,
            13,
            1581,
            13,
            1582,
            3,
            1583,
            1,
            1598,
            2,
            1599,
            1,
            1600,
            2,
            1601,
            11,
            1612,
            4,
            1613,
            3,
            1615,
            1,
            1647,
            3,
            1648,
            12,
            1649,
            2,
            1650,
            12,
            1651,
            1,
            1658,
            2,
            1661,
            10,
            1662,
            10,
            1663,
            6,
            1664,
            3,
            1665,
            10,
            1689,
            1,
            1698,
            1,
            1699,
            5,
            1707,
            4,
            1714,
            3,
            1718,
            3,
            1731,
            2,
            1732,
            3,
            1738,
            1,
            1739,
            1,
            1746,
            3,
            1747,
            21,
            1748,
            15,
            1749,
            21,
            1750,
            5,
            1751,
            3,
            1752,
            1,
            1756,
            18,
            1757,
            6,
            1768,
            7,
            1769,
            2,
            1770,
            7,
            1771,
            4,
            1778,
            3,
            1779,
            2,
            1786,
            3,
            1787,
            2,
            1788,
            2,
            1790,
            4,
            1793,
            2,
            1812,
            1,
            1822,
            1,
            1833,
            4,
            1834,
            3,
            1844,
            2,
            1845,
            2,
            1846,
            12,
            1847,
            11,
            1849,
            5,
            1851,
            1,
            1881,
            4,
            1891,
            8,
            1892,
            8,
            1893,
            8,
            1894,
            8,
            1895,
            9,
            1896,
            1,
            1897,
            5,
            1908,
            1,
            1910,
            6,
            1911,
            2,
            1912,
            3,
            1916,
            2,
            1917,
            1,
            1932,
            1,
            1951,
            2,
            1952,
            3,
            1959,
            1,
            1961,
            2,
            1962,
            3,
            1965,
            3,
            1971,
            3,
            1972,
            5,
            1973,
            2,
            1974,
            2,
            1975,
            1,
            1976,
            3,
            1978,
            3,
            1981,
            1,
            1996,
            2,
            2011,
            4,
            2015,
            1,
            2016,
            2,
            2017,
            2,
            2027,
            2,
            2028,
            3,
            2029,
            2,
            2032,
            9,
            2033,
            9,
            2034,
            3,
            2048,
            4,
            2049,
            2,
            2050,
            1,
            2053,
            2,
            2057,
            2,
            2067,
            3,
            2068,
            3,
            2074,
            2,
            2077,
            1,
            2078,
            1,
            2079,
            2,
            2080,
            2,
            2083,
            1,
            2085,
            3,
            2086,
            2,
            2100,
            2,
            2101,
            3,
            2102,
            3,
            2103,
            2,
            2112,
            5,
            2121,
            1,
            2123,
            1,
            2126,
            2,
            2127,
            3,
            2128,
            4,
            2130,
            3,
            2159,
            2,
            2160,
            2,
            2161,
            5,
            2171,
            14,
            2172,
            5,
            2173,
            14,
            2174,
            1,
            2189,
            1,
            2195,
            2,
            2196,
            2,
            2197,
            2,
            2200,
            3,
            2201,
            3,
            2203,
            1,
            2204,
            1,
            2206,
            1,
            2210,
            4,
            2213,
            2,
            2214,
            2,
            2215,
            2,
            2216,
            2,
            2225,
            1,
            2230,
            2,
            2231,
            3,
            2232,
            2,
            2235,
            2,
            2237,
            2,
            2259,
            2,
            2270,
            4,
            2271,
            4,
            2272,
            1,
            2273,
            1,
            2285,
            1,
            2287,
            2,
            2288,
            4,
            2290,
            2,
            2291,
            2,
            2292,
            5,
            2294,
            3,
            2295,
            4,
            2296,
            3,
            2301,
            1,
            2313,
            1,
            2314,
            3,
            2315,
            1,
            2322,
            2,
            2330,
            2,
            2331,
            1,
            2332,
            1,
            2333,
            1,
            2337,
            2,
            2339,
            2,
            2342,
            1,
            2343,
            1,
            2353,
            3,
            2363,
            2,
            2368,
            2,
            2377,
            2,
            2379,
            1,
            2390,
            2,
            2391,
            2,
            2394,
            3,
            2395,
            2,
            2396,
            2,
            2412,
            2,
            2413,
            2,
            2420,
            2,
            2428,
            2,
            2435,
            2,
            2436,
            2,
            2443,
            2,
            2444,
            1,
            2448,
            1,
            2449,
            1,
            2450,
            1,
            2451,
            2,
            2453,
            1,
            2461,
            1,
            2462,
            2,
            2467,
            2,
            2472,
            2,
            2473,
            2,
            2474,
            1,
            2475,
            1,
            2477,
            2,
            2478,
            2,
            2479,
            2,
            2491,
            2,
            2499,
            2,
            2509,
            1,
            2513,
            2,
            2522,
            2,
            2527,
            2,
            2539,
            2,
            2540,
            2,
            2541,
            2,
            2546,
            2,
            2555,
            2,
            2556,
            2,
            2560,
            1,
            2561,
            1,
            2563,
            1,
            2564,
            1,
            2566,
            2
        },
        {
            0,
            15,
            1,
            172,
            6,
            25,
            7,
            8,
            13,
            15,
            15,
            15,
            16,
            9,
            18,
            23,
            19,
            68,
            21,
            10,
            24,
            27,
            28,
            26,
            29,
            12,
            36,
            28,
            40,
            28,
            41,
            11,
            51,
            28,
            52,
            28,
            57,
            28,
            58,
            15,
            70,
            5,
            71,
            25,
            73,
            5,
            74,
            5,
            78,
            106,
            85,
            29,
            86,
            29,
            89,
            68,
            90,
            39,
            91,
            29,
            92,
            15,
            96,
            40,
            97,
            39,
            98,
            22,
            100,
            46,
            102,
            12,
            108,
            99,
            109,
            19,
            111,
            8,
            114,
            7,
            115,
            3,
            116,
            19,
            117,
            19,
            118,
            10,
            124,
            3,
            133,
            35,
            140,
            31,
            141,
            29,
            147,
            29,
            151,
            2,
            155,
            2,
            156,
            1,
            169,
            17,
            170,
            17,
            174,
            46,
            175,
            17,
            176,
            9,
            182,
            6,
            185,
            6,
            186,
            1,
            201,
            5,
            202,
            31,
            203,
            29,
            206,
            5,
            208,
            28,
            209,
            28,
            210,
            29,
            212,
            34,
            230,
            3,
            232,
            3,
            250,
            1,
            260,
            8,
            263,
            4,
            266,
            1,
            276,
            13,
            277,
            13,
            289,
            4,
            295,
            22,
            296,
            22,
            297,
            15,
            298,
            1,
            323,
            5,
            336,
            3,
            372,
            2,
            376,
            2,
            392,
            5,
            411,
            5,
            414,
            3,
            481,
            8,
            483,
            6,
            489,
            3,
            491,
            3,
            492,
            18,
            510,
            1,
            512,
            1,
            513,
            1,
            545,
            1,
            570,
            2,
            574,
            2,
            575,
            1,
            578,
            7,
            586,
            9,
            589,
            20,
            598,
            21,
            621,
            5,
            632,
            2,
            639,
            2,
            642,
            2,
            644,
            39,
            645,
            39,
            646,
            19,
            648,
            88,
            660,
            16,
            661,
            16,
            662,
            3,
            663,
            3,
            664,
            1,
            690,
            7,
            694,
            7,
            695,
            1,
            712,
            9,
            715,
            7,
            718,
            47,
            719,
            32,
            720,
            80,
            721,
            31,
            722,
            32,
            723,
            65,
            724,
            10,
            737,
            32,
            738,
            13,
            739,
            14,
            740,
            14,
            741,
            14,
            742,
            13,
            743,
            13,
            744,
            3,
            753,
            5,
            754,
            5,
            756,
            5,
            757,
            5,
            766,
            20,
            767,
            20,
            768,
            21,
            769,
            21,
            770,
            21,
            771,
            18,
            791,
            2,
            794,
            10,
            795,
            10,
            813,
            8,
            824,
            32,
            825,
            32,
            826,
            32,
            839,
            3,
            842,
            3,
            878,
            7,
            900,
            2,
            901,
            10,
            905,
            2,
            910,
            17,
            911,
            4,
            912,
            17,
            913,
            14,
            914,
            4,
            1000,
            1,
            1001,
            3,
            1002,
            1,
            1004,
            14,
            1023,
            4,
            1030,
            7,
            1035,
            7,
            1036,
            20,
            1141,
            1,
            1187,
            1,
            1208,
            1,
            1222,
            1,
            1238,
            1,
            1267,
            16,
            1268,
            16,
            1269,
            16,
            1312,
            15,
            1313,
            34,
            1314,
            15,
            1315,
            15,
            1316,
            14,
            1317,
            3,
            1320,
            1,
            1323,
            1,
            1324,
            1,
            1369,
            1,
            1370,
            3,
            1385,
            1,
            1391,
            2,
            1394,
            22,
            1395,
            4,
            1396,
            22,
            1397,
            11,
            1398,
            4,
            1399,
            1,
            1420,
            1,
            1468,
            2,
            1469,
            2,
            1470,
            4,
            1482,
            14,
            1483,
            14,
            1514,
            2,
            1518,
            1,
            1557,
            1,
            1591,
            2,
            1593,
            7,
            1598,
            1,
            1599,
            1,
            1600,
            1,
            1603,
            5,
            1604,
            16,
            1605,
            18,
            1606,
            15,
            1608,
            21,
            1609,
            21,
            1611,
            10,
            1623,
            3,
            1626,
            1,
            1634,
            1,
            1642,
            3,
            1644,
            3,
            1676,
            3,
            1679,
            1,
            1680,
            1,
            1681,
            13,
            1682,
            1,
            1700,
            1,
            1716,
            2,
            1760,
            1,
            1764,
            1,
            1777,
            13,
            1811,
            1,
            1817,
            16,
            1818,
            16,
            1819,
            1,
            1821,
            1,
            1823,
            2,
            1824,
            1,
            1851,
            1,
            1866,
            2,
            1875,
            1,
            1890,
            2,
            1898,
            1,
            1899,
            1,
            1900,
            1,
            1925,
            2,
            1940,
            1,
            1941,
            1,
            1942,
            1,
            1982,
            4,
            2087,
            3,
            2134,
            5,
            2139,
            2,
            2140,
            1,
            2141,
            1,
            2147,
            5,
            2169,
            3,
            2182,
            2,
            2207,
            3,
            2262,
            1,
            2299,
            6,
            2302,
            2,
            2306,
            1,
            2307,
            1,
            2317,
            4,
            2323,
            2,
            2324,
            2,
            2329,
            1,
            2345,
            2,
            2358,
            2,
            2366,
            2,
            2374,
            2,
            2382,
            1,
            2383,
            1,
            2388,
            1,
            2392,
            2,
            2397,
            3,
            2438,
            1,
            2440,
            4,
            2458,
            2,
            2460,
            1,
            2483,
            1,
            2492,
            1,
            2496,
            2,
            2500,
            2,
            2505,
            2,
            2506,
            1,
            2523,
            1,
            2528,
            2,
            2530,
            2,
            2533,
            2,
            2565,
            2
        },
        {
            0,
            23,
            1,
            220,
            2,
            29,
            6,
            41,
            7,
            17,
            8,
            29,
            13,
            23,
            14,
            26,
            15,
            23,
            16,
            14,
            17,
            26,
            18,
            27,
            19,
            55,
            21,
            17,
            24,
            17,
            25,
            47,
            27,
            25,
            29,
            10,
            36,
            21,
            38,
            101,
            40,
            21,
            41,
            12,
            51,
            24,
            52,
            24,
            57,
            24,
            58,
            13,
            78,
            86,
            85,
            16,
            86,
            16,
            89,
            88,
            90,
            28,
            91,
            16,
            92,
            9,
            96,
            34,
            97,
            28,
            98,
            22,
            100,
            4,
            102,
            15,
            108,
            72,
            109,
            28,
            114,
            12,
            115,
            6,
            116,
            28,
            117,
            28,
            118,
            25,
            124,
            6,
            140,
            32,
            141,
            30,
            147,
            30,
            151,
            2,
            155,
            2,
            169,
            22,
            170,
            22,
            174,
            30,
            175,
            22,
            176,
            13,
            182,
            2,
            185,
            2,
            201,
            2,
            202,
            25,
            203,
            22,
            206,
            2,
            208,
            24,
            209,
            24,
            210,
            22,
            217,
            72,
            230,
            3,
            232,
            3,
            247,
            65,
            248,
            65,
            249,
            20,
            250,
            1,
            260,
            1,
            263,
            3,
            298,
            1,
            336,
            3,
            341,
            45,
            342,
            47,
            343,
            47,
            344,
            43,
            345,
            76,
            346,
            45,
            347,
            45,
            348,
            47,
            349,
            47,
            350,
            47,
            351,
            43,
            392,
            2,
            411,
            5,
            412,
            24,
            413,
            66,
            414,
            25,
            415,
            25,
            416,
            24,
            417,
            24,
            418,
            25,
            419,
            25,
            420,
            24,
            421,
            24,
            422,
            25,
            423,
            2,
            481,
            4,
            483,
            1,
            494,
            1,
            499,
            1,
            509,
            26,
            510,
            1,
            511,
            26,
            512,
            1,
            513,
            1,
            544,
            3,
            548,
            29,
            553,
            35,
            554,
            29,
            555,
            3,
            556,
            8,
            586,
            3,
            631,
            10,
            632,
            3,
            639,
            2,
            642,
            2,
            663,
            1,
            690,
            2,
            694,
            2,
            712,
            3,
            736,
            4,
            753,
            1,
            754,
            1,
            756,
            1,
            757,
            1,
            779,
            27,
            780,
            4,
            781,
            4,
            794,
            1,
            795,
            1,
            799,
            44,
            800,
            40,
            801,
            41,
            802,
            41,
            803,
            40,
            804,
            3,
            813,
            4,
            836,
            1,
            837,
            1,
            839,
            2,
            842,
            2,
            878,
            2,
            895,
            3,
            896,
            1,
            898,
            1,
            906,
            31,
            907,
            2,
            908,
            2,
            909,
            2,
            911,
            1,
            914,
            1,
            1023,
            4,
            1030,
            3,
            1035,
            3,
            1113,
            1,
            1116,
            1,
            1147,
            2,
            1149,
            2,
            1151,
            2,
            1152,
            43,
            1153,
            45,
            1154,
            43,
            1155,
            3,
            1156,
            43,
            1157,
            43,
            1224,
            1,
            1240,
            3,
            1241,
            3,
            1279,
            2,
            1298,
            2,
            1302,
            4,
            1347,
            2,
            1372,
            2,
            1378,
            6,
            1380,
            3,
            1395,
            3,
            1398,
            3,
            1399,
            1,
            1457,
            3,
            1475,
            1,
            1487,
            1,
            1519,
            3,
            1528,
            4,
            1529,
            5,
            1539,
            5,
            1566,
            3,
            1575,
            2,
            1576,
            2,
            1577,
            1,
            1584,
            5,
            1625,
            2,
            1701,
            2,
            1780,
            5,
            1781,
            3,
            1819,
            1,
            1820,
            3,
            1821,
            1,
            1842,
            3,
            1843,
            2,
            1859,
            1,
            1885,
            4,
            1898,
            1,
            1899,
            1,
            1900,
            1,
            1908,
            2,
            1939,
            3,
            1948,
            2,
            1953,
            8,
            1977,
            5,
            1989,
            4,
            1990,
            2,
            1992,
            2,
            1995,
            1,
            1998,
            4,
            2002,
            2,
            2060,
            6,
            2110,
            2,
            2118,
            2,
            2121,
            1,
            2123,
            1,
            2137,
            2,
            2151,
            1,
            2152,
            1,
            2156,
            1,
            2170,
            4,
            2227,
            3,
            2272,
            1,
            2273,
            1,
            2276,
            2,
            2334,
            1,
            2335,
            1,
            2336,
            1,
            2367,
            1,
            2399,
            2,
            2400,
            2,
            2403,
            2,
            2404,
            2,
            2410,
            1,
            2411,
            1,
            2424,
            2,
            2441,
            3,
            2448,
            1,
            2463,
            3,
            2483,
            1,
            2484,
            2,
            2485,
            2,
            2515,
            2,
            2519,
            2
        },
        {
            0,
            22,
            1,
            140,
            2,
            32,
            3,
            31,
            4,
            104,
            5,
            29,
            6,
            37,
            7,
            7,
            8,
            32,
            9,
            31,
            10,
            31,
            11,
            29,
            12,
            5,
            13,
            23,
            15,
            23,
            16,
            7,
            18,
            21,
            21,
            9,
            24,
            21,
            29,
            9,
            36,
            22,
            40,
            22,
            41,
            8,
            45,
            117,
            51,
            21,
            52,
            21,
            57,
            21,
            58,
            6,
            64,
            33,
            78,
            96,
            85,
            22,
            86,
            22,
            89,
            74,
            90,
            42,
            91,
            22,
            92,
            8,
            96,
            47,
            97,
            42,
            98,
            20,
            100,
            32,
            102,
            6,
            105,
            32,
            108,
            196,
            109,
            32,
            116,
            32,
            117,
            32,
            118,
            14,
            140,
            32,
            141,
            31,
            147,
            31,
            169,
            35,
            170,
            35,
            172,
            36,
            174,
            33,
            175,
            35,
            176,
            9,
            202,
            27,
            203,
            23,
            208,
            27,
            209,
            27,
            210,
            23,
            229,
            1,
            260,
            15,
            263,
            14,
            321,
            59,
            322,
            32,
            323,
            33,
            324,
            59,
            325,
            30,
            326,
            32,
            327,
            32,
            328,
            33,
            329,
            3,
            334,
            108,
            335,
            37,
            336,
            12,
            337,
            108,
            338,
            39,
            339,
            37,
            340,
            3,
            392,
            13,
            411,
            23,
            425,
            32,
            494,
            1,
            499,
            1,
            500,
            1,
            578,
            33,
            579,
            34,
            580,
            33,
            586,
            11,
            699,
            32,
            700,
            35,
            701,
            32,
            702,
            4,
            712,
            12,
            765,
            2,
            796,
            29,
            797,
            3,
            798,
            4,
            813,
            8,
            878,
            13,
            971,
            43,
            972,
            39,
            973,
            43,
            974,
            43,
            975,
            39,
            976,
            5,
            987,
            32,
            988,
            35,
            989,
            32,
            990,
            32,
            991,
            35,
            992,
            5,
            993,
            4,
            1023,
            14,
            1055,
            5,
            1080,
            4,
            1082,
            7,
            1113,
            2,
            1114,
            2,
            1115,
            4,
            1116,
            2,
            1170,
            4,
            1254,
            29,
            1321,
            1,
            1325,
            1,
            1358,
            3,
            1359,
            3,
            1376,
            3,
            1385,
            8,
            1391,
            1,
            1400,
            1,
            1401,
            1,
            1406,
            5,
            1420,
            6,
            1445,
            28,
            1446,
            28,
            1447,
            4,
            1456,
            5,
            1463,
            2,
            1464,
            2,
            1493,
            2,
            1501,
            2,
            1511,
            3,
            1537,
            2,
            1563,
            4,
            1618,
            3,
            1626,
            1,
            1646,
            5,
            1652,
            4,
            1706,
            4,
            1810,
            7,
            1829,
            1,
            1830,
            1,
            1837,
            7,
            1858,
            2,
            1876,
            3,
            1886,
            5,
            1943,
            1,
            1945,
            1,
            1984,
            1,
            1985,
            1,
            2059,
            2,
            2132,
            2,
            2252,
            3,
            2258,
            2,
            2262,
            6,
            2267,
            4,
            2303,
            2,
            2304,
            2,
            2357,
            2,
            2361,
            2,
            2364,
            2,
            2365,
            2,
            2386,
            2,
            2387,
            2,
            2389,
            2,
            2402,
            2,
            2430,
            2,
            2431,
            2,
            2432,
            2,
            2450,
            1,
            2501,
            4,
            2502,
            2,
            2547,
            2
        }
    }
}
 end,
}
local ____entry = require("src.moteur.roblox", ...)
return ____entry
