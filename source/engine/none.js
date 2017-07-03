define([] , function () {

    return function(method, model, options) {
        var
            success = options.success,
            promise = new Promise(function(resolve, reject) {
                success.call(undefined);
            });

        return promise;
    };

});
