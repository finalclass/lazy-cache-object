Lazy Cache Object
=================

- It's an object with lazy initialization feature and conditional cache invalidation mechanism.
- It uses **Promises** for async stuff so you can use it with **async/await** easily.
- Also this package provides **TypeScript's .d.ts** declaration files if you wish to use it with TS.

## API

### Constructor

```js
const lazyCacheObject = new LazyCacheObject({
    initKey(key) {
        // do some ASYNC work and return a Promise
        // this function will be called every time there will be request for the key
        // and cache will be empty
        return asyncPromiseReturn()
    },
    shouldInvalidate(key, value) {
        // this is optional
        // you can decide if you want the cache to be invalidated after TTL
        // you should return a boolean or a promise for a boolean
        // this function will be called every time LazyCacheObject will try
        // to invalidate the key.
        return true;
    },
    onError(err) {
        // this one is optional as well
        // it's called anytime any of your promises returns an error
        console.error('an error ocured', err);
    }
});
```

### Basic usage

```js
// to get a key from the cache just call `get` it will return a promise for the value
lazyCacheObject.get('some-key').then(value => {
    // here you have your value.
});
```

### Cache invalidation timer

You have to manually strt/stop invalidation timer:

```js
lazyCacheObject.startCacheInvalidationTimer(60000);
// takes one argument: timeToLiveInMilliseconds
// the above method will make LazyCacheObject invalidate old keys every minute
// it will not invalidate a key if `shouldInvalidate()` method has returned false for that key
// it will run a function to check if any of the keys are to be dropped every timeToLiveInMilliseconds / 4 milliseconds
// so your item can live in the cache for a maximum of 5/4 * timeToLiveInMilliseconds milliseconds
```

**REMEMBER** to stop the invalidation timer manually:

```js
lazyCacheObject.stopCacheInvalidationTimer();
// from now on, no invalidation will happen - internal `setInterval` method is cleared.
```

## License: MIT

See the LICENSE file