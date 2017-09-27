export declare class LazyCacheObject<T> {
    private callbacks;
    private data;
    private ttl;
    private invalidateInterval;
    constructor(callbacks: {
        initKey: (key: string) => Promise<T>;
        shouldInvalidate?: (key: string, value: T) => Promise<boolean>;
        onShouldInvalidateError?: (err) => void;
    });
    startCacheInvalidationTimer(timeToLiveInMilliseconds: number): void;
    stopCacheInvalidationTimer(): void;
    private invalidate(keys?);
    get(key: any): Promise<T>;
}
