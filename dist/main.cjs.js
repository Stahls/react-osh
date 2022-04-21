(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('@nx-js/observer-util')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', '@nx-js/observer-util'], factory) :
  (global = global || self, factory(global.main = {}, global.React, global.observerUtil));
}(this, (function (exports, react, observerUtil) { 'use strict';

  function view(Comp) {
      var ReactiveComp = function (props) {
          var _a = react.useState(), setState = _a[1];
          var forceUpdate = react.useCallback(function () { return setState({}); }, []);
          var render = react.useMemo(function () {
              return observerUtil.observe(Comp, {
                  scheduler: forceUpdate,
                  lazy: true
              });
          }, [Comp]);
          react.useEffect(function () { return function () { return observerUtil.unobserve(render); }; }, []);
          return render(props);
      };
      ReactiveComp.displayName = Comp.displayName || Comp.name;
      return ReactiveComp;
  }

  var computedPlaceHolder = {};
  function computed(provider) {
      var value = computedPlaceHolder;
      var reaction = observerUtil.observe(provider, {
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
      if (observerUtil.isObservable(obj))
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
      return observerUtil.observable(obj);
  }
  function useLocalStore(obj, wrapGetterToComputed) {
      if (wrapGetterToComputed === void 0) { wrapGetterToComputed = true; }
      return react.useMemo(function () { return createStore(obj, wrapGetterToComputed); }, []);
  }

  exports.computed = computed;
  exports.createStore = createStore;
  exports.useLocalStore = useLocalStore;
  exports.view = view;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=main.cjs.js.map
