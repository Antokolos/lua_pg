package com.nlbhub.phonegap.lua;
 
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Intent;
import org.luaj.vm2.Globals;
import org.luaj.vm2.LuaValue;
import org.luaj.vm2.Varargs;
import org.luaj.vm2.lib.jse.JsePlatform;

import java.io.StringReader;

public class PhoneGapLua extends CordovaPlugin {
    public static final String ACTION_INITIALIZE = "_lua_initialize";
    public static final String ACTION_CLOSE = "_lua_close";
    public static final String ACTION_EXEC = "_lua_exec";
    public static final String ACTION_INJECT = "_lua_inject";
    private static final PhoneGapLua SINGLETON = new PhoneGapLua();
    private Globals m_globals = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
	    JSONObject arg_object = args.getJSONObject(0);
            if (ACTION_INITIALIZE.equals(action)) {
                
                /*Intent calIntent = new Intent(Intent.ACTION_EDIT)
                    .setType("vnd.android.cursor.item/event")
                    .putExtra("beginTime", arg_object.getLong("startTimeMillis"))
                    .putExtra("endTime", arg_object.getLong("endTimeMillis"))
                    .putExtra("title", arg_object.getString("title"))
                    .putExtra("description", arg_object.getString("description"))
                    .putExtra("eventLocation", arg_object.getString("eventLocation"));
             
               this.cordova.getActivity().startActivity(calIntent);*/
                ///SINGLETON.initialize();
                callbackContext.success();
                return true;
            } else if (ACTION_CLOSE.equals(action)) {
                ///SINGLETON.close();
                callbackContext.success();
                return true;
            } else if (ACTION_INJECT.equals(action)) {
                callbackContext.success();
                return true;
            } else if (ACTION_EXEC.equals(action)) {
                String command = arg_object.getString("command");
                String source_name = arg_object.getString("source_name");
                /*LuaValue chunk = m_globals.load(new StringReader(command), source_name);
                Varargs varargs = chunk.invoke();
                JSONArray result = new JSONArray();
                int nargs = varargs.narg();
                for (int i = 1; i <= nargs; i++) {
                    result.put(i - 1, varargs.arg(i).toString());
                }*/
                callbackContext.success(source_name);
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

    private void close() {
        // TODO: implement ???
    }

    private void initialize() {
        m_globals = JsePlatform.standardGlobals();
    }
}