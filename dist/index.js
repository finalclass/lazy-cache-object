"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var single_init_1 = require("single-init");
var LazyCacheObject = /** @class */ (function () {
    function LazyCacheObject(callbacks) {
        this.callbacks = callbacks;
        this.data = {};
        this.ttl = 0;
    }
    LazyCacheObject.prototype.startCacheInvalidationTimer = function (timeToLiveInMilliseconds) {
        this.ttl = timeToLiveInMilliseconds;
        var interval = Math.round(this.ttl / 4);
        this.invalidateInterval = setInterval(this.invalidate.bind(this), interval);
    };
    LazyCacheObject.prototype.stopCacheInvalidationTimer = function () {
        this.ttl = 0;
        clearInterval(this.invalidateInterval);
    };
    LazyCacheObject.prototype.invalidate = function (keys) {
        if (keys === void 0) { keys = Object.keys(this.data); }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var now, key, otherKeys, cacheItem, cacheItemValue, shouldInvalidate, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (keys.length === 0) {
                            return [2 /*return*/];
                        }
                        now = Date.now();
                        key = keys[0], otherKeys = keys.slice(1);
                        cacheItem = this.data[key];
                        if (!cacheItem) {
                            return [2 /*return*/, setTimeout(function () { return _this.invalidate(otherKeys); })];
                        }
                        if (now - cacheItem.createdAt < this.ttl) {
                            return [2 /*return*/, setTimeout(function () { return _this.invalidate(otherKeys); })];
                        }
                        if (!this.callbacks.shouldInvalidate) {
                            delete this.data[key];
                            return [2 /*return*/, setTimeout(function () { return _this.invalidate(otherKeys); })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, cacheItem.singleInit.get()];
                    case 2:
                        cacheItemValue = _a.sent();
                        return [4 /*yield*/, Promise.resolve(this.callbacks.shouldInvalidate(key, cacheItemValue))];
                    case 3:
                        shouldInvalidate = _a.sent();
                        if (shouldInvalidate) {
                            delete this.data[key];
                        }
                        else {
                            // to prevent running shouldInvalidate all the time
                            this.data[key].createdAt = Date.now();
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        delete this.data[key];
                        if (this.callbacks.onShouldInvalidateError) {
                            this.callbacks.onShouldInvalidateError(err_1);
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, this.invalidate(otherKeys)];
                }
            });
        });
    };
    LazyCacheObject.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.data[key]) {
                    this.data[key] = {
                        createdAt: Date.now(),
                        singleInit: new single_init_1.default(function (done) { return Promise.resolve(_this.callbacks.initKey(key))
                            .then(function (result) { return done(null, result); })
                            .catch(done); })
                    };
                }
                return [2 /*return*/, this.data[key].singleInit.get()];
            });
        });
    };
    return LazyCacheObject;
}());
exports.LazyCacheObject = LazyCacheObject;
//# sourceMappingURL=index.js.map