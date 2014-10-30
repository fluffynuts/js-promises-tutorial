describe("Deferred", function() {
    beforeEach(function() {
        expect(FunctionMatchers.Matchers).toBeDefined();
        this.addMatchers(FunctionMatchers.Matchers);
    });
    it("should exist as a function in the global scope", function() {
        var e = expect(window.Deferred).toBeDefinedFunction();
    });
    function create() {
        return new Deferred();
    }
    it("should have a promise() function", function() {
        expect(Deferred.prototype.promise).toBeDefinedFunction();
    });

    describe("promise", function() {
        it("should return an object with a then function", function() {
            var d = create();
            var result = d.promise();
            expect(result.then).toBeDefinedFunction();
        });
        it("should return an object with a fail function", function() {
            var d = create();
            var result = d.promise();
            expect(result.fail).toBeDefinedFunction();  
        });
        it("should always return the same object", function() {
            var d = create();
            expect(d.promise()).toBe(d.promise());
        });
        describe("then", function() {
            it("should return the promise", function() {
                var d = create();
                var promise = d.promise();
                var result = promise.then(function() {});
                expect(result).toBe(promise);
            });
            it("should call into the fail if a then function throws, passing in the error", function() {
                var d = create();
                var result = null;
                d.promise().then(function(data) {
                    return "first promise";
                }).then(function(data) {
                    if (data === "first promise") {
                        throw "some error";
                    }
                }).fail(function(data) {
                    result = data;
                });
                d.resolve("some data");
                expect(result).toBe("some error");
            });
            it("should resolve chained promises asynchronously", function() {
              var d = create();
              var promise = d.promise();
              var callInfo = [];
              var resolveData = { resolved: false };
              promise.then(function() {
                callInfo.push('first');
                var inner = create();
                window.setTimeout(function() {
                  callInfo.push('second');
                  inner.resolve();
                }, 100);
                return inner.promise();
              }).then(function() {
                callInfo.push('third'); 
                console.log('third resolution');
                resolveData.resolved = true;
              });
              d.resolve(); 
              window.setTimeout(function() {
                expect(callInfo.length).toBe(3); 
                expect(callInfo[0]).toBe('first');
                expect(callInfo[1]).toBe('second');
                expect(callInfo[2]).toBe('third');
              }, 1000);
            });
        });
        it("should be able to chain thens", function() {
            var d = create();
            var firstData = null;
            var secondData = null;
            d.promise().then(function(data) {
                firstData = data;
                return "second data";
            }).then(function(data) {
                secondData = data;
            });
            d.resolve("first data");
            expect(firstData).toBe("first data");
            expect(secondData).toBe("second data");
        });
        describe("fail", function() {
            it("should return the promise object", function() {
                var d = create();
                var result = d.promise().fail(function() {});
                expect(result).toBe(d.promise());
            });
        });

        describe("always", function() {
            it("should exist on the returned promise as a function", function() {
                var d = create();
                var result = d.promise().always;
                expect(result).toBeDefinedFunction();
            });
            it("should run the provided function after all then's succeed", function() {
                var d = create();
                var calls = [];
                d.promise().then(function() {
                    calls.push("then 1");
                }).then(function() {
                    calls.push("then 2");
                }).always(function() {
                    calls.push("always");
                });
                d.resolve();
                expect(calls.length).toBe(3);
                expect(calls[0]).toBe("then 1");
                expect(calls[1]).toBe("then 2");
                expect(calls[2]).toBe("always");
            });
            it("should return the promise object", function() {
                var d = create();
                var promise = d.promise();
                var result = promise.always(function() {});
                expect(result).toBe(promise);
            });
            it("should run the provided function after all then's succeed, even if provided out of sequence", function() {
                var d = create();
                var calls = [];
                d.promise().then(function() {
                    calls.push("then 1");
                }).always(function() {
                    calls.push("always");
                }).then(function() {
                    calls.push("then 2");
                });
                d.resolve();
                expect(calls.length).toBe(3);
                expect(calls[0]).toBe("then 1");
                expect(calls[1]).toBe("then 2");
                expect(calls[2]).toBe("always");
            });
            it("should run all always functions even it they throw exceptions", function() {
                var d = create();
                var calls = [];
                d.promise().then(function() {
                }).always(function() {
                    calls.push("always 1");
                    throw "WAT";
                }).always(function() {
                    calls.push("always 2");
                });
                d.resolve();
                expect(calls.length).toBe(2);
                expect(calls[0]).toBe("always 1");
                expect(calls[1]).toBe("always 2");
            });
            it("should not run the always function if there are no then's", function() {
                var d = create();
                var called = false;
                d.promise().always(function() {
                    called = true;
                });
                d.resolve();
                expect(called).toBe(false);
            });
        });
    });

    describe("resolve", function() {
        it("should exist on the prototype as a function", function() {
            expect(Deferred.prototype.resolve).toBeDefinedFunction();
        });
        it("should call into the first then of the promise when resolving, with data", function() {
            var d = create();
            var promise = d.promise();
            var result = null;
            promise.then(function(data) {
                result = data;
            })
            d.resolve("some data");
            expect(result).toBe("some data");
        });
        it("should be able to call into the first then if resolved before the promise is given a then function", function() {
            var d = create();
            d.resolve("some data");
            var result = null;
            var promise = d.promise().then(function(data) {
                result = data;
            });
            expect(result).toBe("some data");
        });
        it("should call into all thens even if they surround the resolution", function() {
            var d = create(),
                result = null;
            d.promise().then(function(data) {
                return "first promise";
            });
            d.resolve("foo");
            d.promise().then(function(data) {
                result = data;
            });
            expect(result).toBe("first promise");
        });
        it("should only resolve once", function() {
            var d = create(),
                result = null;
            d.promise().then(function(data) {
                result = data;
            });
            d.resolve("first resolution");
            d.resolve("second resolution");
            expect(result).toBe("first resolution");
        });
        it("should not resolve after failure", function() {
            var d = create(),
                result = null;
            d.promise().then(function(data) {
                result = data;
            });
            d.reject("some error");
            d.resolve("some data");
            expect(result).toBe(null);
        });
    });
    describe("reject", function() {
        it("should exist on the prototype as a function", function() {
            expect(Deferred.prototype.reject).toBeDefinedFunction();
        });
        it("should call into the fail of the promise if resolved late", function() {
            var d = create();
            var result = null;
            d.promise().then(function(data) {
                result = "no error";
            }).fail(function(data) {
                result = data;
            });
            d.reject("error");
            expect(result).toBe("error");
        });

        it("should call into the fail of the promise if resolved early", function() {
            var d = create();
            var result = null;
            d.reject("error");
            d.promise().then(function(data) {
                result = "no error";
            }).fail(function(data) {
                result = data;
            });
            expect(result).toBe("error");
        });

        it("should only work once", function() {
            var d = create();
                result = null;
            d.promise().then(function(data) {
                result = "didn't fail";
            }).fail(function(data) {
                result = data;
            });

            d.reject("first rejection");
            d.reject("second rejection");
            expect(result).toBe("first rejection");
        });

        it("should call all fail handlers which don't return false", function() {
            var d = create();
            var firstFailData = null,
                secondFailData = null;
            d.promise().then(function() {
                throw "err";
            }).fail(function(e) {
                firstFailData = e;
            }).fail(function(e) {
                secondFailData = e;
            });
            d.resolve();
            expect(firstFailData).toBe("err");
            expect(secondFailData).toBe("err");
        });

        it("should call all fail handlers unless one returns exactly false, in which case, it stops", function() {
            var d = create();
            var firstFailData = null,
                secondFailData = null;
            d.promise().then(function() {
                throw "err";
            }).fail(function(e) {
                firstFailData = e;
                return false;
            }).fail(function(e) {
                secondFailData = e;
            });
            d.resolve();
            expect(firstFailData).toBe("err");
            expect(secondFailData).toBe(null);
        });

    });
});
