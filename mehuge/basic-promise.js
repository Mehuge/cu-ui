if (!Promise) {
    function Promise(fn) {
        var then, rejected, context,
            self = this,
            fulfill = function () {
                if (then) {
                    then.apply(context, arguments);
                }
            },
            reject = function () {
                if (rejected) {
                    rejected.apply(context, arguments);
                }
            };
        setTimeout(function () { context = fn(fulfill, reject) || this; }, 0);
        return {
            then: function (success, fail) {
                then = success;
                rejected = fail;
            },
            resolve: function () {
                fulfill.apply(self, arguments);
            },
            reject: function () {
                reject.apply(self, arguments);
            }
        };
    }
}