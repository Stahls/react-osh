import { useState, useCallback, useMemo, useEffect } from 'react';
import { observe, unobserve, isObservable, observable } from '@nx-js/observer-util';

function view(Comp) {
    var ReactiveComp = function (props) {
        var _a = useState(), setState = _a[1];
        var forceUpdate = useCallback(function () { return setState({}); }, []);
        var render = useMemo(function () {
            return observe(Comp, {
                scheduler: forceUpdate,
                lazy: true
            });
        }, [Comp]);
        useEffect(function () { return function () { return unobserve(render); }; }, []);
        return render(props);
    };
    ReactiveComp.displayName = Comp.displayName || Comp.name;
    return ReactiveComp;
}

var computedPlaceHolder = {};
function computed(provider) {
    var value = computedPlaceHolder;
    var reaction = observe(provider, {
        lazy: true,
        scheduler: function (r) {
            value = r();
        }
    });
    return function computedValueGetter() {
        if (value === computedPlaceHolder)
            value = reaction();
        return value;
    };
}

function createStore(obj, wrapGetterToComputed) {
    if (wrapGetterToComputed === void 0) { wrapGetterToComputed = true; }
    if (isObservable(obj))
        return obj;
    if (wrapGetterToComputed) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                var d = Object.getOwnPropertyDescriptor(obj, k);
                if (d === undefined)
                    continue;
                var getter = d.get;
                var setter = d.set;
                if (getter) {
                    Object.defineProperty(obj, k, {
                        get: computed(getter),
                        set: setter
                    });
                }
            }
        }
    }
    return observable(obj);
}
function useLocalStore(obj, wrapGetterToComputed) {
    if (wrapGetterToComputed === void 0) { wrapGetterToComputed = true; }
    return useMemo(function () { return createStore(obj, wrapGetterToComputed); }, []);
}

export { computed, createStore, useLocalStore, view };
//# sourceMappingURL=main.esm.js.map
