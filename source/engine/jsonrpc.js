define([
    'backbone'
] , function (
    Backbone
) {

    var CONFIG = [
        { name: 'client' }, 
        { name: 'map' },
        { name: 'formater', default: {
            default: function (model) { return { id: model.get('id') }; },
            create:  'toJSON',
            update:  'toJSON',
            patch:   'toJSON'
        }},
        { name: 'method_elector', default: null}
    ];

    function _isEmpty(value) {
        if (!value) {
            return true;
        }

        if (value.constructor === Array || value.constructor === 'String') {
            return value.length === 0;
        }

        if (typeof value === 'object') {
            if (Object.keys) {
                return Object.keys(value).length === 0;
            }

            var prop;
            for(prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    return function(method, model, options) {
        var
            i, formater, methodElector, configData,
            params       = options.params || null,
            globalConfig = Backbone.persistence.jsonrpc,
            modelConfig  = model.persistence,
            config       = {},
            success      = options.success,
            error        = options.error;

        for (i=0; i<CONFIG.length; i++) {
            configData = CONFIG[i];

            config[configData.name] = modelConfig[configData.name] || globalConfig[configData.name];

            if (!config[configData.name]) {
                if (configData.default !== undefined) {
                    config[configData.name] = configData.default;
                } else {
                    throw new Error('Configuration "' + config[configKeys[i]] + '" is missing!');
                }
            }
        }

        methodElector = config.method_elector;
        if (methodElector) {
            if (typeof methodElector === 'function') {
                method = methodElector(method);
            } else if (typeof model[methodElector] === 'function') {
                method = model[methodElector](method);
            } else {
                throw new Error('Invalid methodElector!');
            }
        }

        if (!config.map[method]) {
            throw new Error('Method "' + method + '" is not allowed!');
        }

        if (_isEmpty(params)) {
            formater = config.formater[method] || config.formater['default'] || null;
            if (!formater) {
                throw new Error('No formater found for the method "' + method + '"!');
            }

            if (typeof formater === 'function') {
                params = formater(model);
            } else if (typeof model[formater] === 'function') {
                params = model[formater](method);
            } else {
                throw new Error('Invalid formater for the method "' + method + '"!');
            }
        }

        return config.client
            .ask(config.map[method], params)
            .then(function(response) {
                try {
                    if (success) {
                        success.call(undefined, response.result, response);
                    }
                } catch (err) {
                    if (window.console) {
                        window.console.error && window.console.error(err.toString());
                        window.console.debug && window.console.debug(err.stack);
                    }
                }
            })
            .catch(function(response) {
                try {
                    if (error) {
                        error.call(undefined, response.error, response);
                    }
                } catch (err) {
                    if (window.console) {
                        window.console.error && window.console.error(err.toString());
                        window.console.debug && window.console.debug(err.stack);
                    }
                }
            });
    };

});
