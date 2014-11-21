var Lua = {
    isRun: false,
    isInitialized: false,
    state: null,
    tmp_id: 0,
    default_source_name: 'stdin',
    preallocated_strings: {
        '__handle': null,
        '__index': null,
    },
    initialize: function (source_name, stdout, stderr) {
        if (this.isInitialized) throw new Error('Lua already initialized');
        this.default_source_name = source_name || this.default_source_name;
        this.stdout = stdout || this.stdout;
        this.stderr = stderr || this.stderr;

        if (!this.isRun) {
            run();
            this.isRun = true;
        }
        this.state = _luaL_newstate();
        _luaL_openlibs(this.state);
        for (var key in this.preallocated_strings) {
            this.preallocated_strings[key] = this.allocate_string(key);
        }
        this.isInitialized = true;
    },
    destroy: function() {
        if (!this.isInitialized) throw new Error('Lua is not initialized');
        _lua_close(this.state);

        /*for (var i = 0; i < Runtime.functionPointers.length; i++) {
            Runtime.functionPointers[i] = null;
        }*/

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
        // TODO: add implementation
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
        this.pushStack(object);
        if (metatable) {
            this.pushStack(metatable);
            _lua_setmetatable(this.state, -2);
        }
        var strptr = this.allocate_string(name);
        _lua_setglobal(this.state, strptr);
        _free(strptr);
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
    }/*,
    createEvent: function(title, location, notes, startDate, endDate, successCallback, errorCallback) {
        cordova.exec(
            successCallback, // success callback function
            errorCallback, // error callback function
            'Calendar', // mapped to our native Java class called "CalendarPlugin"
            'addCalendarEntry', // with this action name
            [{                  // and this array of custom arguments to create our entry
                "title": title,
                "description": notes,
                "eventLocation": location,
                "startTimeMillis": startDate.getTime(),
                "endTimeMillis": endDate.getTime()
            }]
        ); 
    }*/
}

Lua.cache['items'] = {};
Lua.cache['clear'] = function (evalstring) { delete Lua.cache['items'][evalstring] };
Lua.get_tmp_name = function() { return "_weblua_tmp_" + this.tmp_id++; };
Lua.pushStack = pushStack: function(object) {
    if (object === null) {
        object = undefined;
    }
    switch(typeof object) {
        case "undefined" :
            _lua_pushnil(this.state);
            return 1;
        case "boolean" :
            _lua_pushboolean(this.state, object);
            return 1;
        case "number" :
            _lua_pushnumber(this.state, object);
            return 1;
        case "string" :
            var strptr = this.allocate_string(object);
            _lua_pushstring(this.state, strptr);
            _free(strptr);
            return 1;
        case "function" :
            var self = this;
            var wrapper = function (state) {
                var result = object.apply(self, self.get_stack_args());
                if (result == undefined || result == null) {
                    result = [];
                }
                if (!( typeof result == 'object' && typeof result.length == "number")) {
                    throw new Error("Expected array return type from JS function");
                }
                for (var i = 0; i < result.length; i++) {
                    self.pushStack(result[i]);
                }
                return result.length;
            }
            wrapper.unwrapped = object;
            var pointer = Runtime.addFunction(wrapper);
            _lua_pushcclosure(this.state, pointer, 0);
            return 1;
        case "object" :
            if (object.length === undefined) {
                // Object
                _lua_createtable(this.state, 0, 0);
                if (object['__handle']) {
                    // Handled object
                    var source = object;
                    var metatable = {
                        '__index': function (table, key) {
                            return [source[key]];
                        },
                        '__newindex': function (table, key, value) {
                            source[key] = value;
                            return [];
                        },
                    }
                    metatable['__index'].source = source;

                    this.pushStack(metatable);
                    _lua_setmetatable(this.state, -2);

                    object = {'__handle': object.toString()};
                }
                for (var k in object) {
                    this.pushStack(k);
                    this.pushStack(object[k]);
                    _lua_rawset(this.state, -3);
                }
            } else {
                // Array
                _lua_createtable(this.state, object.length, 0);
                for (var k in object) {
                    k = 1*k;
                    this.pushStack(k+1)
                    this.pushStack(object[k]);
                    _lua_rawset(this.state, -3);
                }
            }
            return 1;
        default:
            throw new Error("Cannot push object to stack: " + object);
    }
};
Lua.allocate_string = function(str) {
    // TODO: Add implementation
    return null;
    //var arr = intArrayFromString(str);
    //return allocate(arr, 'i8', 0);  // ALLOC_NORMAL
};
Lua.run = function() {
    cordova.exec(
        function() {}, // success callback function
        function() {}, // error callback function
        'PhoneGapLua', // mapped to our native Java class called "CalendarPlugin"
        'run', // with this action name
        [{                  // and this array of custom arguments to create our entry

        }]
    );
};
Lua._luaL_newstate = function() {
    // TODO: Add implementation
    return null;
};
Lua._luaL_openlibs = function(state) {};
Lua._lua_close = function(state) {};
Lua._lua_setmetatable = function(state, n) {};
Lua._lua_setglobal= function(state, n) {};
Lua,_free = function(strptr) {};
Lua._lua_pushnil = function(state) {};
Lua._lua_pushboolean = function(state, object) {};
Lua._lua_pushnumber = function(state, object) {};
Lua._lua_pushstring = function(state, strptr) {};
Lua._lua_pushcclosure = function(state, pointer, n) {};
Lua._lua_createtable = function(state, n, m) {};
Lua._lua_rawset = function(state, n) {};

module.exports = Lua;