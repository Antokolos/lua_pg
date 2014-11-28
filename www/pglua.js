var LuaVM = function() {
    // private properties
    var self = this;
    var isInitialized = false;
    var tmp_id = 0;
    var default_source_name = 'stdin';

    // private methods
    var _get_tmp_name = function() { return "_weblua_tmp_" + tmp_id++; };

    var _lua_initialize = function() {
        cordova.exec(
            function() {}, // success callback function
            function() {}, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_initialize', // with this action name
            [{                  // and this array of custom arguments to create our entry

            }]
        );
        return null;
    };

    var _lua_close = function() {
        cordova.exec(
            function() {}, // success callback function
            function() {}, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_close', // with this action name
            [{                  // and this array of custom arguments to create our entry

            }]
        );
        return null;
    };

    var _lua_exec = function(successCallback, errorCallback, command, source_name, source) {
        cordova.exec(
            successCallback, // success callback function
            errorCallback, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_exec', // with this action name
            [{                  // and this array of custom arguments to create our entry
                "command": command,
                "source_name": source_name,
                "source": source
            }]
        );
        return null;
    };

    // public methods
    /**
     * Initialize Lua.
     *
     * @param source_name default source file name to be used in eval/exec calls
     */
    this.initialize = function (source_name) {
        if (isInitialized) throw new Error('Lua already initialized');
        default_source_name = source_name || default_source_name;
        _lua_initialize();
        isInitialized = true;
    };

    this.destroy = function() {
        if (!isInitialized) throw new Error('Lua is not initialized');
        _lua_close();
        isInitialized = false;
    };

    this.eval = function (successCallback, errorCallback, command, source_name, source) {
        source_name = source_name || default_source_name;
        source      = source      || command;
        self.exec(successCallback, errorCallback, "return " + command, source_name, source);
    };

    this.exec = function (successCallback, errorCallback, command, source_name, source) {
        if (!isInitialized) throw new Error('Lua is not initialized');
        _lua_exec(successCallback, errorCallback, command, source_name, source);
    };

    this.cache = function (evalstring) {
        if (!(evalstring in self.cache['items'])) {
            self.eval(
                function(result) { self.cache['items'][evalstring] = evalstring; },
                function(error) { console.log(error); },
                evalstring
            );
        }
        return self.cache['items'][evalstring];
    };

    this.cache['items'] = {};
    this.cache['clear'] = function (evalstring) { delete self.cache['items'][evalstring] };
};

var Lua = new LuaVM();
module.exports = Lua;