package com.flipzokart.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        optimizeWebView();
    }

    private void optimizeWebView() {
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        WebSettings settings = webView.getSettings();

        // ── Rendering / FPS ──────────────────────────────────────────────────
        // Force GPU compositing (hardware layer)
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Smooth scrolling
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // ── High Refresh Rate (90/120 Hz displays) ────────────────────────────
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Request the display's native refresh rate
            getWindow().getAttributes().preferredDisplayModeId = 0; // let system pick best mode
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // On Android 11+ explicitly request highest available refresh rate
            getWindow().getAttributes().preferredRefreshRate = 0; // 0 = maximum available
        }

        // ── WebView Performance Flags ─────────────────────────────────────────
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Disable unnecessary features that hurt performance
        settings.setSaveFormData(false);
        settings.setSavePassword(false);
    }
}
