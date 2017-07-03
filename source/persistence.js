define([
    'backbone'
] , function (
    Backbone
) {

    // override Backbone persistence engine
    Backbone.persistence = (function() {
        var
            defaultEngine = null,
            engines       = {};

        return {
            register: function(name, engine, asDefault) {
                engines[name] = engine;
                if (asDefault === true) {
                    defaultEngine = name;
                }
                return this;
            },
            unregister: function(name) {
                delete engines[name];
                return this;
            },
            unregisterAll: function(name) {
                engines = {};
                return this;
            },
            get: function(model) {
                if (model.persistence && model.persistence.engine) {
                    return engines[model.persistence.engine];
                } else if (model.collection && model.collection.persistence && model.collection.persistence.engine) {
                    return engines[model.collection.persistence.engine];
                } else if(defaultEngine && engines[defaultEngine]) {
                    return engines[defaultEngine];
                } else {
                    throw new Error('No persistence engine sets.');
                }
            }
        };
    })();
    Backbone.persistence.register('ajax', Backbone.sync, true);
    Backbone.sync = function(method, model, options) {
        var engine = Backbone.persistence.get(model);
        return engine.call(this, method, model, options);
    };

    return Backbone.persistence;
});