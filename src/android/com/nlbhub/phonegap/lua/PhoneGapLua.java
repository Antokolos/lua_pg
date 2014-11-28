package com.nlbhub.phonegap.lua;
 
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import org.luaj.vm2.*;
import org.luaj.vm2.lib.jse.JsePlatform;

import java.io.StringReader;

public class PhoneGapLua extends CordovaPlugin {
    public static final String ACTION_INITIALIZE = "_lua_initialize";
    public static final String ACTION_CLOSE = "_lua_close";
    public static final String ACTION_EXEC = "_lua_exec";
    public static final String ACTION_INJECT = "_lua_inject";
    private static final PhoneGapLua SINGLETON = new PhoneGapLua();
    private Globals m_globals = null;
    private CallbackContext m_injectCallbackContext = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
	    JSONObject arg_object = args.getJSONObject(0);
            if (ACTION_INITIALIZE.equals(action)) {
                SINGLETON.initialize();
                callbackContext.success();
                return true;
            } else if (ACTION_CLOSE.equals(action)) {
                SINGLETON.close();
                callbackContext.success();
                return true;
            } else if (ACTION_INJECT.equals(action)) {
                String object = arg_object.getString("object");
                String name = arg_object.getString("name");
                PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
                pluginResult.setKeepCallback(true);
                callbackContext.sendPluginResult(pluginResult);
                SINGLETON.inject(callbackContext);
                SINGLETON.getGlobals().get("require").call(LuaValue.valueOf("caller"));
                return true;
            } else if (ACTION_EXEC.equals(action)) {
                String command = arg_object.getString("command");
                String source_name = arg_object.getString("source_name");
                LuaValue chunk = SINGLETON.getGlobals().load(new StringReader(command), source_name);
                Varargs varargs = chunk.invoke();
                JSONArray result = new JSONArray();
                int nargs = varargs.narg();
                for (int i = 1; i <= nargs; i++) {
                    result.put(i - 1, varargs.arg(i).toString());
                }
                callbackContext.success(result);
                return true;
            }
            callbackContext.error("Invalid action");
            return false;
        } catch(Exception e) {
            System.err.println("Exception: " + e.getMessage());
            callbackContext.error(e.getMessage());
            return false;
        } 
    }

    public static PhoneGapLua getSingleton() {
        return SINGLETON;
    }

    private void close() {
        // TODO: implement ???
    }

    private void initialize() {
        m_globals = JsePlatform.standardGlobals();
    }

    private void inject(CallbackContext callbackContext) {
        m_injectCallbackContext = callbackContext;
    }

    private Globals getGlobals() {
        return m_globals;
    }

    CallbackContext getInjectCallbackContext() {
        return m_injectCallbackContext;
    }
}