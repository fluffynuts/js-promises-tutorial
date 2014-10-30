(function() {
        function Promise() {
            this._chain = [];
            this._failChain = [];
            this._alwaysChain = [];
        }
        Promise.prototype = {
            then: function(fn) {
                this._chain.push(fn);
                if (this._deferredData !== undefined) {
                    var data = this._deferredData;
                    this._deferredData = undefined;
                    this._runChainWith(data);
                }
                return this;
            },
            _runChainWith: function(data) {
                this._deferredData = data;
                while (true) {
                  var thisThen = this._chain.shift();
                  if (thisThen === undefined) {
                    break;
                  }
                  try {
                    var result = thisThen(this._deferredData);
                    if (result !== undefined && typeof(result["then"]) === "function") {
                      var self = this;
                      result.then(function(data) {
                        self._runChainWith(data);
                      });
                      return;
                    } else {
                      this._deferredData = result;
                    }
                  } catch (e) {
                    this._failWith(e);
                  }
                }
                this._runAlwaysChain();
            },
            _runAlwaysChain: function(data) {
                this._alwaysChain.forEach(function(fn) {
                    try {
                        fn.call(window);
                    } catch (e) {}
                });
            },
            fail: function(fn) {
                this._failChain.push(fn);
                if (this._failData !== undefined) {
                    this._failWith(this._failData);
                }
                return this;
            },
            always: function(fn) {
                this._alwaysChain.push(fn);
                return this;
            },
            _failWith: function(data) {
                if (this._failChain.length) {
                    for (var i = 0; i < this._failChain.length; i++) {
                        try {
                            var result = this._failChain[i].call(window, data);
                            if (result === false) {
                                return;
                            }
                        } catch(e) {
                        }
                    }
                } else {
                    this._failData = data;
                }
            },
            _resolve: function(data) {
                if (this._chain.length) {
                    this._runChainWith(data);
                } else {
                    this._deferredData = data;
                }
            },
        };
        function Deferred() {
            this._promise = new Promise();
            this._state = "unresolved";
        }
        Deferred.prototype = {
            get state() {
                return this._state;
            },
            promise: function() {
                return this._promise;
            },
            resolve: function(data) {
                if (this._alreadyCompleted()) {
                    return;
                }
                this._state = "resolved";
                this._promise._resolve(data);
            },
            _alreadyCompleted: function() {
                return (this.state === "resolved" || this._state === "rejected");
            },
            reject: function(data) {
                if (this._alreadyCompleted()) {
                    return;
                }
                this._state = "rejected";
                this._promise._failWith(data);
            }
        };
        window.Deferred = Deferred;
})();
