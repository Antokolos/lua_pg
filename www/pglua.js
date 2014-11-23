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
    eval: function (command, source_name, source) {
        source_name = source_name || this.default_source_name;
        source      = source      || command;
        return this.exec("return " + command, source_name, source);
    },
    exec: function (command, source_name, source) {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        return this._lua_exec(command, source_name, source);
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
    }
}

Lua.cache['items'] = {};
Lua.cache['clear'] = function (evalstring) { delete Lua.cache['items'][evalstring] };
Lua.get_tmp_name = function() { return "_weblua_tmp_" + this.tmp_id++; };
Lua._lua_initialize = function() {
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
Lua._lua_close = function() {
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
Lua._lua_exec = function(command, source_name, source) {
    var result = null;
    cordova.exec(
        function(stackArgs) { result = stackArgs; }, // success callback function
        function() {}, // error callback function
        'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
        '_lua_exec', // with this action name
        [{                  // and this array of custom arguments to create our entry
            "command": command,
            "source_name": source_name,
            "source": source
        }]
    );
    return result;
};
Lua._lua_inject = function(object, name, metatable) {
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

module.exports = Lua;