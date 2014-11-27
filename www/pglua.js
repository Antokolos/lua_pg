var LuaVM = function() {
    // private properties
    var self = this;
    var isInitialized = false;
    var tmp_id = 0;
    var default_source_name = 'stdin';

    // private methods
    var _get_tmp_name = function() { return "_weblua_tmp_" + self.tmp_id++; };
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
    var _lua_inject = function(object, name, metatable) {
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

    // public methods
    this.initialize = function (source_name, stdout, stderr) {
        if (self.isInitialized) throw new Error('Lua already initialized');
        self.default_source_name = source_name || self.default_source_name;
        self.stdout = stdout || self.stdout;
        self.stderr = stderr || self.stderr;
        self._lua_initialize();
        self.isInitialized = true;
    };
    this.destroy = function() {
        if (!self.isInitialized) throw new Error('Lua is not initialized');
        self._lua_close();
        self.isInitialized = false;
    };
    this.stdout = function (str) {console.log("stdout: " +str)};
    this.stderr = function (str) {console.log("stderr: " +str)};
    this.eval = function (successCallback, errorCallback, command, source_name, source) {
        source_name = source_name || self.default_source_name;
        source      = source      || command;
        self.exec(successCallback, errorCallback, "return " + command, source_name, source);
    };
    this.exec = function (successCallback, errorCallback, command, source_name, source) {
        if (!self.isInitialized) throw new Error('Lua is not initialized');
        self._lua_exec(successCallback, errorCallback, command, source_name, source);
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
                return self.inject(object);
            default:
                return object.toString();
        }
    };
    this.inject = function (object, name, final_location, metatable) {
        name = name || self._get_tmp_name();
        self._lua_inject(object, name, metatable);
        if (final_location) {
            self.exec(final_location + " = " + name + "\n" + name + " = nil");
        }
        return (final_location || name);
    };
    this.cache = function (evalstring) {
        if (!(evalstring in self.cache['items'])) {
            self.cache['items'][evalstring] = self.eval(evalstring)
        }
        return self.cache['items'][evalstring];
    };

    this.cache['items'] = {};
    this.cache['clear'] = function (evalstring) { delete Lua.cache['items'][evalstring] };
};

var Lua = new LuaVM();
module.exports = Lua;