/* Registry for opt-in preview modules. Deferred modules remain explicit stubs. */
(function (root) {
  'use strict';
  const registry = Object.create(null);
  root.StitchStudioScaffold = {
    status: 'preview-beta',
    version: '0.2-textile-preview-beta',
    latestLegacySnapshot: null,
    register(name, descriptor) {
      // TODO SH-001: enforce versioned module contracts when implementations exist.
      if (registry[name]) throw new Error('Duplicate scaffold module: ' + name);
      registry[name] = descriptor;
    },
    describe() {
      return Object.keys(registry).map(function (name) {
        return { name: name, status: registry[name].status };
      });
    },
    get(name) { return registry[name] || null; }
  };
})(window);
