package com.rowt.deeplink;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class DeepLinkModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private static final String MODULE_NAME = "RowtDeepLink";
    private static final String DEEP_LINK_EVENT = "onRowtDeepLinkReceived";
    
    private String initialDeepLink = null;
    private static DeepLinkModule instance = null;

    public DeepLinkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        instance = this;
    }

    @Override
    @NonNull
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getInitialDeepLink(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            String deepLink = null;
            
            if (currentActivity != null) {
                Intent intent = currentActivity.getIntent();
                if (intent != null && intent.getData() != null) {
                    deepLink = intent.getData().toString();
                }
            }
            
            if (deepLink == null && initialDeepLink != null) {
                deepLink = initialDeepLink;
                initialDeepLink = null;
            }
            
            promise.resolve(deepLink);
        } catch (Exception e) {
            promise.reject("DEEPLINK_ERROR", "Failed to get initial deep link", e);
        }
    }

    public void setDeepLink(String url) {
        if (url != null) {
            if (reactContext.hasActiveReactInstance()) {
                sendEvent(url);
            } else {
                initialDeepLink = url;
            }
        }
    }

    private void sendEvent(String url) {
        WritableMap params = Arguments.createMap();
        params.putString("url", url);
        
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(DEEP_LINK_EVENT, params);
        }
    }

    public static void handleNewIntent(Intent intent) {
        if (instance != null && intent != null && intent.getData() != null) {
            instance.setDeepLink(intent.getData().toString());
        }
    }

    public static void handleInitialIntent(Intent intent) {
        if (intent != null && intent.getData() != null) {
            String url = intent.getData().toString();
            if (instance != null) {
                instance.setDeepLink(url);
            } else {
                // Store for later if module not initialized yet
                initialDeepLink = url;
            }
        }
    }
}