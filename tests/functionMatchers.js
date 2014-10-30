var FunctionMatchers = FunctionMatchers || {};
(function(ns) {
    ns.Matchers = {
        toHaveClass: function () {
            var failMessage = [];
            this.message = function () {
                return failMessage.join("\n");
            };
            try {
                if (arguments.length !== 1) {
                    throw "Require exactly 1 argument to toHaveClass; got " + arguments.length;
                }
                if ($ === undefined) {
                    throw "toHaveClass requires jQuery with $ in the global scope";
                }
                var el = $(this.actual);
                if (!el.hasClass(arguments[0])) {
                    throw "Expected to find class '" + arguments[1] + "', but didn't";
                }
            } catch (e) {
                failMessage.push(e);
            }
            return failMessage.length === 0;
        },
        toBeDefinedFunction: function() {
            var failMessage = null;
            this.message = function() {
                return failMessage;
            };
            var actualType = typeof(this.actual);
            if (actualType === "undefined")
                failMessage = "Expected a function but got undefined";
            else if (actualType !== "function")
                failMessage = "Expected a function but got an object of type: '" + actualType + "'";
            return (failMessage === null);
        },
        toCall: function() {
            var failMessage = [];
            this.message = function() {
                return failMessage.join("\n");
            };
            if (arguments.length !== 1) {
                failMessage.push("No arguments supplied to toCall");
            } else {
                try {
                    var functionToCall = arguments[0];
                    if (typeof(functionToCall) !== "function") {
                        if (typeof(functionToCall) !== "string") {
                            throw "Argument supplied to toCall is not a function (" + typeof(functionToCall) + ")";
                        }
                        var fn = eval(functionToCall);
                        if (typeof(fn) !== "function") {
                            throw functionToCall + " is not a function";
                        }
                        if ((typeof(fn.isSpy) !== "boolean") || (!fn.isSpy)) {
                            // auto-spy!
                            var parts = functionToCall.split(".");
                            var namespace;
                            if (parts.length == 1) {
                                namespace = window;
                            } else {

                                var namespaceName = parts.slice(0, parts.length - 1).join(".");
                                namespace = eval(namespaceName);
                                if (typeof(namespace) === "undefined") {
                                    throw "Unable to find parent object " + namespaceName;
                                }
                                // finally, actually spy!
                            }
                            spyOn(namespace, parts[parts.length - 1]);
                            functionToCall = eval(functionToCall);
                        }
                    }
                    if ((typeof(functionToCall.isSpy) !== "boolean") || (!functionToCall.isSpy)) {
                        throw "Argument supplied to toCall is not a spy";
                    }
                    if (typeof(this.actual) !== "function") {
                        throw "Argument supplied to expect() call is not a function";
                    }
                    if (functionToCall.callCount > 0) {
                        throw "function was called before test began";
                    }
                    try {
                        this.actual();
                    } catch(e) {
                        throw "item under test failed to run: " + e;
                    }
                    if (functionToCall.callCount == 0) {
                        throw "expected function not called: " + functionToCall.identity;
                    }
                } catch (e) {
                    failMessage.push(e);
                }
            }
            return failMessage.length == 0;
        }
    };
})(FunctionMatchers);


