const { LazyCacheObject } = require('../dist/index');

describe('LazyCacheObject', () => {

    it('can be instantiated', () => {
        expect(() => new LazyCacheObject()).not.toThrow();
    });

    it('main concept', next => {
        const lazyCacheObject = new LazyCacheObject({
            initKey(key) {
                return 'OK ' + key;
            }
        });

        lazyCacheObject.get('key').then(result => {
            expect(result).toBe('OK key');
            next();
        });
    })

    it('invalidates cache after TTL', next => {
        let nofCalls = 0;
        const lazyCacheObject = new LazyCacheObject({
            initKey(key) {
                nofCalls += 1;
                return 'OK ' + key;
            }
        });
        lazyCacheObject.startCacheInvalidationTimer(100);
        lazyCacheObject.get('key')
            .then(result => {
                expect(result).toBe('OK key');
                return wait(200);
            })
            .then(() => lazyCacheObject.get('key'))
            .then(result => {
                expect(result).toBe('OK key');
                expect(nofCalls).toBe(2);
                lazyCacheObject.stopCacheInvalidationTimer();
                return wait(200);
            })
            .then(() => lazyCacheObject.get('key'))
            .then(result => {
                expect(result).toBe('OK key');
                expect(nofCalls).toBe(2);
                next();
            });
    });

    it('has conditional invalidation feature', next => {
        let callsPerCall = {
            key1: 0,
            key2: 0
        };
        const lazyCacheObject = new LazyCacheObject({
            initKey(key) {
                callsPerCall[key] += 1;
                return 'OK ' + key;
            },
            shouldInvalidate(key, value) {
                return value === 'OK key1';
            },
            onShouldInvalidateError(err) {
                console.error('LazyCacheObject error', err);
            }
        });

        lazyCacheObject.startCacheInvalidationTimer(100);
        return Promise.all([
                lazyCacheObject.get('key1'),
                lazyCacheObject.get('key2'),
            ])
            .then(([r1, r2]) => {
                expect(r1).toBe('OK key1');
                expect(r2).toBe('OK key2');
                return wait(200);
            })
            .then(() => Promise.all([
                lazyCacheObject.get('key1'),
                lazyCacheObject.get('key2')
            ]))
            .then(([r1, r2]) => {
                expect(callsPerCall.key1).toBe(2);
                expect(callsPerCall.key2).toBe(1);
                lazyCacheObject.stopCacheInvalidationTimer();
                next();
            });
    });

    it('does invalide without problems', next => {
        const lazyCacheObject = new LazyCacheObject({
            initKey(key) {
                return 'OK ' + key;
            },
            shouldInvalidate(key, value) {
                return true;
            },
            onShouldInvalidateError(err) {
                console.error('LazyCacheObject error', err);
            }
        });

        lazyCacheObject.startCacheInvalidationTimer(10);

        function createSome(num) {

            let promises = [];
            for (let i = 0; i < 2000; i += 1) {
                promises.push(lazyCacheObject.get(i));
            }

            return Promise.all(promises);
        }

        const errSpy = createSpy();

        return createSome(2000)
            .then(() => wait(100))
            .then(() => createSome(2000))
            .then(() => wait(50))
             .then(() => createSome(5000))
            .then(() => wait(200))
            .catch(err => {
                console.log('error', err);
                errSpy();
            })
            .then(() => {
                lazyCacheObject.stopCacheInvalidationTimer();
                expect(errSpy).not.toHaveBeenCalled();
                next();
            });
    });

});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}