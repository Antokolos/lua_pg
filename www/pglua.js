var Lua = {
    isInitialized: false,
    tmp_id: 0,
    default_source_name: 'stdin',
    initialize: function (source_name, stdout, stderr) {
        if (this.isInitialized) throw new Error('Lua already initialized');
        this.default_source_name = source_name || this.default_source_name;
        this.stdout = stdout || this.stdout;
        this.stderr = stderr || this.stderr;
        this._lua_initialize();
        this.isInitialized = true;
    },
    destroy: function() {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        this._lua_close();
        this.isInitialized = false;
    },
    stdout: function (str) {console.log("stdout: " +str)},
    stderr: function (str) {console.log("stderr: " +str)},
    eval: function (successCallback, errorCallback, command, source_name, source) {
        source_name = source_name || this.default_source_name;
        source      = source      || command;
        return this.exec(successCallback, errorCallback, "return " + command, source_name, source);
    },
    exec: function (successCallback, errorCallback, command, source_name, source) {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        _lua_exec(successCallback, errorCallback, command, source_name, source);
    },
    anon_lua_object: function (object) {
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
    },
    inject: function (object, name, final_location, metatable) {
        name = name || this.get_tmp_name();
        this._lua_inject(object, name, metatable);
        if (final_location) {
            this.exec(final_location + " = " + name + "\n" + name + " = nil");
        }
        return (final_location || name);
    },
    cache: function (evalstring) {
        if (!(evalstring in this.cache['items'])) {
            this.cache['items'][evalstring] = this.eval(evalstring)
        }
        return this.cache['items'][evalstring];
    },
    get_tmp_name: function() { return "_weblua_tmp_" + this.tmp_id++; },
    _lua_initialize: function() {
        cordova.exec(
            function() {}, // success callback function
            function() {}, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_initialize', // with this action name
            [{                  // and this array of custom arguments to create our entry

            }]
        );
        return null;
    },
    _lua_close: function() {
        cordova.exec(
            function() {}, // success callback function
            function() {}, // error callback function
            'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
            '_lua_close', // with this action name
            [{                  // and this array of custom arguments to create our entry

            }]
        );
        return null;
    },
    _lua_exec: function(successCallback, errorCallback, command, source_name, source) {
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
    },
    _lua_inject: function(object, name, metatable) {
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
    }
}

Lua.cache['items'] = {};
Lua.cache['clear'] = function (evalstring) { delete Lua.cache['items'][evalstring] };

module.exports = Lua;