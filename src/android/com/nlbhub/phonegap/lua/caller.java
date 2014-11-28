package com.nlbhub.phonegap.lua;

import org.luaj.vm2.LuaValue;
import org.luaj.vm2.lib.OneArgFunction;

/**
 * @author Anton P. Kolosov
 */
public class caller extends OneArgFunction {

    public caller() {}

    public LuaValue call(LuaValue libname) {
        PhoneGapLua.getSingleton().getInjectCallbackContext().success("It works!");
        return NIL;
    }
}