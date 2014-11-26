var Lua = function() {
    var isInitialized = false;
    var tmp_id = 0;
    var default_source_name = 'stdin';

    this.initialize = function (source_name, stdout, stderr) {
        if (this.isInitialized) throw new Error('Lua already initialized');
        this.default_source_name = source_name || this.default_source_name;
        this.stdout = stdout || this.stdout;
        this.stderr = stderr || this.stderr;
        this._lua_initialize();
        this.isInitialized = true;
    };
    this.destroy = function() {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        this._lua_close();
        this.isInitialized = false;
    };
    this.stdout = function (str) {console.log("stdout: " +str)};
    this.stderr = function (str) {console.log("stderr: " +str)};
    this.eval = function (successCallback, errorCallback, command, source_name, source) {
        source_name = source_name || this.default_source_name;
        source      = source      || command;
        this.exec(successCallback, errorCallback, "return " + command, source_name, source);
    };
    this.exec = function (successCallback, errorCallback, command, source_name, source) {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        this._lua_exec(successCallback, errorCallback, command, source_name, source);
    };
    this.anon_lua_object = function (object) {
        // Create anonymous Lua object or literal from JS object
        if (object == undefined || object == null) {
            return "nil";
        }
        switch (typeof object) {
            case "string":
                return '"' + object.replace('"','\\"') + '"';
            case "function":
            case "object":
                return this.inject(object);
            default:
                return object.toString();
        }
    };
    this.inject = function (object, name, final_location, metatable) {
        name = name || this.get_tmp_name();
        this._lua_inject(object, name, metatable);
        if (final_location) {
            this.exec(final_location + " = " + name + "\n" + name + " = nil");
        }
        return (final_location || name);
    };
    this.cache = function (evalstring) {
        if (!(evalstring in this.cache['items'])) {
            this.cache['items'][evalstring] = this.eval(evalstring)
        }
        return this.cache['items'][evalstring];
    };
    this.get_tmp_name = function() { return "_weblua_tmp_" + this.tmp_id++; };
    function _lua_initialize() {
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
    function _lua_close() {
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
    function _lua_exec(successCallback, errorCallback, command, source_name, source) {
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
    function _lua_inject(object, name, metatable) {
        cordova.exec(
            function() {}, // success callback function
            function() {}, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_inject', // with this action name
            [{                  // and this array of custom arguments to create our entry
                "object": object,
                "name": name,
                "metatable": metatable
            }]
        );
        return null;
    };
}

Lua.cache['items'] = {};
Lua.cache['clear'] = function (evalstring) { delete Lua.cache['items'][evalstring] };

module.exports = Lua;