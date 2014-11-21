package com.nlbhub.phonegap.lua;
 
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Intent;

public class PhoneGapLua extends CordovaPlugin {
    public static final String ACTION_RUN = "run";
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
	    JSONObject arg_object = args.getJSONObject(0);
            if (ACTION_RUN.equals(action)) {
                
                /*Intent calIntent = new Intent(Intent.ACTION_EDIT)
                    .setType("vnd.android.cursor.item/event")
                    .putExtra("beginTime", arg_object.getLong("startTimeMillis"))
                    .putExtra("endTime", arg_object.getLong("endTimeMillis"))
                    .putExtra("title", arg_object.getString("title"))
                    .putExtra("description", arg_object.getString("description"))
                    .putExtra("eventLocation", arg_object.getString("eventLocation"));
             
               this.cordova.getActivity().startActivity(calIntent);*/
               callbackContext.success();
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
}