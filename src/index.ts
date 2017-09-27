import SingleInit from 'single-init';

export class LazyCacheObject<T> {

    private data: {
        [key: string]: {
            singleInit: SingleInit<T>;
            createdAt: number;
        }
    } = {};
    private ttl = 0;
    private invalidateInterval

    constructor(
        private callbacks: {
            initKey: (key: string) => Promise<T>;
            shouldInvalidate?: (key: string, value: T) => Promise<boolean>;
            onShouldInvalidateError?: (err) => void;
        }
    ) {

    }

    public startCacheInvalidationTimer(timeToLiveInMilliseconds: number) {
        this.ttl = timeToLiveInMilliseconds;
        const interval = Math.round(this.ttl / 4);
        this.invalidateInterval = setInterval(this.invalidate.bind(this), interval);
    }

    public stopCacheInvalidationTimer() {
        this.ttl = 0;
        clearInterval(this.invalidateInterval);
    }

    private async invalidate(keys = Object.keys(this.data)) {
        if (keys.length === 0) {
            return;
        }

        const now = Date.now();
        const key = keys.pop();
        const cacheItem = this.data[key];

        if (!cacheItem) {
            return setTimeout(() => this.invalidate(keys));

        }
        if (now - cacheItem.createdAt < this.ttl) {
            return setTimeout(() => this.invalidate(keys));
        }

        if (!this.callbacks.shouldInvalidate) {
            delete this.data[key];
            return setTimeout(() => this.invalidate(keys));
        }

        return cacheItem.singleInit.get()
            .then(cacheItemValue => {
                return Promise.resolve(this.callbacks.shouldInvalidate(key, cacheItemValue))
            })
            .then(shouldInvalidate => {
                if (shouldInvalidate) {
                    delete this.data[key];
                } else {
                    // to prevent running shouldInvalidate all the time
                    this.data[key].createdAt = Date.now();
                }
            })
            .catch(err => {
                delete this.data[key];
                if (this.callbacks.onShouldInvalidateError) {
                    this.callbacks.onShouldInvalidateError(err);
                }
            })
            .then(() => this.invalidate(keys));
    }

    public async get(key) {
        if (!this.data[key]) {
            this.data[key] = {
                createdAt: Date.now(),
                singleInit: new SingleInit(done => Promise.resolve(this.callbacks.initKey(key))
                    .then(result => done(null, result))
                    .catch(done))
            };
        }
        return this.data[key].singleInit.get();
    }


}