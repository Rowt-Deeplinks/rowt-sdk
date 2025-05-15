⚠️ Native linking support is currently limited to Expo. Native iOS/Android support is in progress.


# Rowt SDK Integration Guide

## Overview

The Rowt SDK provides deep linking capabilities and smooth integration with the [create-rowt-server](https://npmjs.com/create-rowt-server) API for React Native applications, supporting both Expo and pure React Native implementations. This guide will walk you through integrating the SDK into your project.

## Installation

```bash
npm install rowt-sdk
```

## Initialization

Initialize the SDK at the root of your application:

```typescript
import { Rowt } from 'rowt-sdk';

// Initialize with your configuration
Rowt.initialize({
  debug: true // Enable debug logging
});
```

## Basic Usage

### Get Initial Deep Link

```typescript
const initialUrl = await Rowt.getInitialDeepLink();
if (initialUrl) {
  console.log('App opened with deep link:', initialUrl);
}
```

### Listen for Deep Links

```typescript
const subscription = Rowt.addDeepLinkListener((url) => {
  console.log('Received deep link:', url);
  // Handle the deep link
});

// Don't forget to remove the listener when done
subscription.remove();
```

### Parse Deep Links

```typescript
const parsed = Rowt.parseDeepLink('myapp://products/123?promo=summer');
console.log(parsed);
// {
//   scheme: 'myapp',
//   host: 'products',
//   path: '/123',
//   segments: ['123'],
//   params: { promo: 'summer' },
//   originalUrl: 'myapp://products/123?promo=summer'
// }
```

### Using the Deep Link Hook

```typescript
import { useDeepLink } from 'rowt-sdk';

function App() {
  useDeepLink((url) => {
    console.log('Deep link received:', url);
    // Navigate based on the URL
  });

  return <YourApp />;
}
```

## Expo Integration Guide

### 1. Configuration

For Expo projects, the SDK automatically detects and uses Expo's Linking module. No additional native configuration is required.

### 2. App Configuration

Update your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "scheme": "myapp",
    // ... other config
  }
}
```

### 3. Create Deep Links

```typescript
// This method is only available in Expo
const deepLink = new RowtLink(
        {
          serverUrl: 'https://rowt.app', // or your custom rowt instance url
          apiKey: 'your-secret-api-key',
          projectId: 'project-uuid',
        },
        {
          url: `/products/${item.id}`,
          title: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
        })
console.log(deepLink); 
// generates shortlink
// ex: https://rowt.app/d8kj8eo8s03 
// opens myapp://products/123
```

### 4. Complete Expo Example

```typescript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Rowt, useDeepLink } from 'rowt-sdk';

export default function App() {
  useEffect(() => {
    // Initialize the SDK
    Rowt.initialize({
      apiKey: 'your-api-key',
      debug: true
    });

    // Check if app was opened with a deep link
    Rowt.getInitialDeepLink().then(url => {
      if (url) {
        console.log('Initial deep link:', url);
      }
    });
  }, []);

  // Use the hook to listen for deep links
  useDeepLink((url) => {
    const parsed = Rowt.parseDeepLink(url);
    console.log('Deep link received:', parsed);
    // Handle navigation based on parsed data
  });

  return (
    <View>
      <Text>My App</Text>
    </View>
  );
}
```

## React Native CLI Integration Guide

### iOS Setup

#### 1. Install Native Dependencies

After installing the npm package, run:

```bash
cd ios && pod install
```

#### 2. Configure URL Schemes

Add URL schemes to your `ios/[YourApp]/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

#### 3. Update AppDelegate

In your `AppDelegate.m` or `AppDelegate.mm`, add the following imports:

```objc
#import <React/RCTLinkingManager.h>
#import <RowtDeepLink/RowtDeepLinkModule.h>
```

Add these methods to handle deep links:

```objc
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  // Handle deep link
  [RowtDeepLinkModule setDeepLink:url.absoluteString];
  
  // Also handle with React Native's linking
  return [RCTLinkingManager application:application openURL:url options:options];
}

// For iOS < 9.0
- (BOOL)application:(UIApplication *)application 
            openURL:(NSURL *)url 
  sourceApplication:(NSString *)sourceApplication 
         annotation:(id)annotation
{
  [RowtDeepLinkModule setDeepLink:url.absoluteString];
  return [RCTLinkingManager application:application openURL:url 
                      sourceApplication:sourceApplication annotation:annotation];
}

// Handle universal links
- (BOOL)application:(UIApplication *)application 
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    [RowtDeepLinkModule setDeepLink:userActivity.webpageURL.absoluteString];
  }
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

// Handle initial deep link when app launches
- (BOOL)application:(UIApplication *)application 
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // ... existing code ...
  
  // Check for initial deep link
  NSURL *initialUrl = launchOptions[UIApplicationLaunchOptionsURLKey];
  if (initialUrl) {
    [RowtDeepLinkModule setInitialDeepLink:initialUrl.absoluteString];
  }
  
  return YES;
}
```

### Android Setup

#### 1. Configure Deep Link Handling

In your `android/app/src/main/AndroidManifest.xml`, add intent filters to your main activity:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  
  <!-- Deep link intent filter -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" />
  </intent-filter>
  
  <!-- App links (for HTTPS URLs) -->
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" 
          android:host="yourapp.com" />
  </intent-filter>
</activity>
```

#### 2. Update MainActivity

In your `MainActivity.java` (or `.kt` for Kotlin), add:

```java
import android.content.Intent;
import com.rowt.deeplink.DeepLinkModule;

public class MainActivity extends ReactActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Handle initial intent
        Intent intent = getIntent();
        DeepLinkModule.handleInitialIntent(intent);
    }
    
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        DeepLinkModule.handleNewIntent(intent);
    }
}
```

#### 3. Register the Package

The module should auto-link, but if not, add to `MainApplication.java`:

```java
import com.rowt.deeplink.DeepLinkPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new DeepLinkPackage() // Add this line
    );
}
```

### Complete React Native Example

```typescript
import React, { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { Rowt, useDeepLink } from 'rowt-sdk';

export default function App() {
  useEffect(() => {
    // Initialize the SDK
    Rowt.initialize({
      apiKey: 'your-api-key',
      debug: true
    });

    // Get initial deep link
    Rowt.getInitialDeepLink().then(url => {
      if (url) {
        console.log('App opened with:', url);
        handleDeepLink(url);
      }
    });
  }, []);

  // Listen for deep links while app is running
  useDeepLink((url) => {
    handleDeepLink(url);
  });

  const handleDeepLink = (url: string) => {
    const parsed = Rowt.parseDeepLink(url);
    console.log('Parsed deep link:', parsed);
    
    // Navigate based on the parsed data
    if (parsed.host === 'products' && parsed.segments[0]) {
      // Navigate to product with ID: parsed.segments[0]
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>My React Native App</Text>
    </View>
  );
}
```

## Creating Dynamic Links

The SDK also provides functionality to create shortened links:

```typescript
import { RowtLink } from 'rowt-sdk';

const config = {
  serverUrl: 'https://your-server.com',
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
};

const linkOptions = {
  url: 'myapp://products/123',
  title: 'Check out this product!',
  description: 'Amazing product on sale',
  imageUrl: 'https://example.com/product.jpg',
  expiration: new Date('2025-12-31'),
  metadata: {
    campaign: 'summer-sale'
  }
};

const rowtLink = new RowtLink(config, linkOptions);

// Create the link
const shortLink = await rowtLink.createLink();
console.log('Short link:', shortLink);
console.log('Shortcode:', rowtLink.getShortcode());
```



> [IMPORTANT]
> This is especially important for generating deep links.  
> If you want the preview to show the content from your app, you must overwrite the data. Otherwise, it will attempt to load metadata from your fallback URL.

In the case of web links, the original link's preview metadata will be used by default unless overwritten.


## Platform Detection

You can check which platform you're on:

```typescript
import { isExpoEnvironment } from 'rowt-sdk';

if (isExpoEnvironment()) {
  console.log('Running in Expo');
} else {
  console.log('Running in React Native CLI');
}
```

## Testing Deep Links

### iOS Simulator
```bash
xcrun simctl openurl booted "myapp://products/123"
```

### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "myapp://products/123" com.yourapp
```

### Physical Devices
- Create a simple HTML page with a link to your deep link
- Send the link via email/message
- Or use the Safari/Chrome address bar


## Custom Metadata

When creating dynamic links with the Rowt SDK, you can include custom metadata using the `additionalMetadata` field. This field accepts any JSON object and is stored as a PostgreSQL JSONB column on the backend.

### How to Use Additional Metadata

The `additionalMetadata` field is a flexible key-value store that can contain any JSON-serializable data you need to associate with your link:

```typescript
import { RowtLink } from 'rowt-sdk';

const config = {
  serverUrl: 'https://your-server.com',
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
};

const linkOptions = {
  url: 'myapp://products/123',
  title: 'Summer Sale Product',
  // Include any custom JSON data in additionalMetadata
  additionalMetadata: {
    campaign: {
      name: 'summer-2024',
      channel: 'email',
      variant: 'A'
    },
    analytics: {
      source: 'newsletter',
      medium: 'email', 
      content: 'hero-banner'
    },
    product: {
      sku: 'PROD-123',
      category: 'electronics',
      price: 299.99,
      currency: 'USD'
    },
    user: {
      segmentId: 'high-value',
      cohort: '2024-Q2'
    },
    // Arrays are supported
    tags: ['featured', 'sale', 'limited-time'],
    // Nested objects are supported
    customData: {
      experimentId: 'exp-456',
      metadata: {
        version: 'v2',
        timestamp: new Date().toISOString()
      }
    }
  }
};

const rowtLink = new RowtLink(config, linkOptions);
const shortLink = await rowtLink.createLink();
```

### Common Use Cases for Additional Metadata

#### 1. Analytics Tracking

```typescript
additionalMetadata: {
  utm_source: 'facebook',
  utm_medium: 'social',
  utm_campaign: 'summer-sale-2024',
  utm_content: 'carousel-ad-1',
  utm_term: 'discount-electronics'
}
```

#### 2. A/B Testing

```typescript
additionalMetadata: {
  experiment: {
    id: 'pricing-test-001',
    variant: 'B',
    group: 'treatment'
  }
}
```

#### 3. User Attribution

```typescript
additionalMetadata: {
  referrer: {
    userId: 'user-789',
    referralCode: 'FRIEND2024',
    tier: 'gold'
  },
  attribution: {
    firstTouch: 'google-ads',
    lastTouch: 'email'
  }
}
```

#### 4. Content Metadata

```typescript
additionalMetadata: {
  content: {
    type: 'video',
    duration: 180,
    format: 'mp4',
    thumbnail: 'https://example.com/thumb.jpg'
  },
  localization: {
    language: 'en-US',
    region: 'north-america'
  }
}
```

#### 5. Business Logic

```typescript
additionalMetadata: {
  promotion: {
    code: 'SAVE20',
    validUntil: '2024-12-31',
    minimumPurchase: 50
  },
  inventory: {
    stock: 145,
    warehouse: 'east-coast',
    reserved: 12
  }
}
```

### Important Notes

- The `additionalMetadata` field is stored as PostgreSQL JSONB, which provides efficient querying and indexing capabilities
- The field accepts any valid JSON structure (objects, arrays, strings, numbers, booleans, null)
- There's no strict schema enforcement, giving you flexibility to include whatever data you need
- The default value is an empty object `{}` if no metadata is provided
- All metadata is preserved exactly as provided and can be retrieved later through your backend API

### TypeORM Schema

The backend enforces this structure using TypeORM:

```typescript
@Column({ type: 'jsonb', default: {} }) // JSONB with default value
additionalMetadata?: Record<string, any>;
```

## Best Practices

1. **Keep it structured**: While the field is flexible, maintain consistent structure for similar link types
2. **Use meaningful keys**: Choose descriptive key names that clearly indicate the data's purpose
3. **Avoid sensitive data**: Don't include passwords, API keys, or other sensitive information
4. **Consider size**: While JSONB can handle large objects, keep metadata reasonably sized for performance
5. **Document your schema**: Even though it's flexible, document what metadata fields your application uses

## Example: Complete Link Creation with Rich Metadata

```typescript
import { RowtLink } from 'rowt-sdk';

async function createRichLink() {
  const config = {
    serverUrl: 'https://api.rowt.io',
    apiKey: 'your-api-key',
    projectId: 'your-project-id'
  };
  
  const linkOptions = {
    url: 'myapp://special-offer',
    title: 'Exclusive Black Friday Deal',
    description: 'Save 50% on all electronics',
    imageUrl: 'https://cdn.example.com/black-friday.jpg',
    expiration: new Date('2024-11-30'),
    additionalMetadata: {
      // Campaign tracking
      campaign: {
        id: 'bf-2024',
        type: 'seasonal',
        budget: 50000,
        department: 'marketing'
      },
      // Target audience
      targeting: {
        segments: ['high-value', 'electronics-interested'],
        geoTargets: ['US', 'CA'],
        ageRange: { min: 25, max: 54 }
      },
      // Performance tracking
      performance: {
        expectedCTR: 0.05,
        conversionGoal: 1000,
        revenueTarget: 150000
      },
      // Feature flags
      features: {
        showCountdown: true,
        enableChat: false,
        personalizedOffers: true
      },
      // Timestamps and versioning
      metadata: {
        createdBy: 'marketing-team',
        createdAt: new Date().toISOString(),
        version: '2.1',
        environment: 'production'
      }
    },
    // Regular properties (non-metadata)
    properties: {
      source: 'email-campaign'
    }
  };
  
  const rowtLink = new RowtLink(config, linkOptions);
  const shortLink = await rowtLink.createLink();
  
  console.log('Created link:', shortLink);
  console.log('Link shortcode:', rowtLink.getShortcode());
  
  return rowtLink;
}
```

This flexible metadata system allows you to attach any contextual information to your links, making them powerful tools for tracking, analytics, personalization, and business logic.

## Troubleshooting

### Common Issues

1. **Native module not found**
   - Ensure you've run `pod install` for iOS
   - Try cleaning and rebuilding: `cd android && ./gradlew clean`
   - Reset Metro cache: `npx react-native start --reset-cache`

2. **Deep links not working on iOS**
   - Verify URL scheme is correctly added to Info.plist
   - Ensure AppDelegate methods are implemented correctly
   - Check that the module is properly linked

3. **Deep links not working on Android**
   - Verify intent filters in AndroidManifest.xml
   - Ensure MainActivity handles intents correctly
   - Check `android:launchMode="singleTask"` is set

4. **Expo-specific issues**
   - Ensure scheme is defined in app.json
   - Verify you're using the correct Expo SDK version

## Best Practices

1. **Initialize Early**: Initialize the SDK as early as possible in your app lifecycle
2. **Handle Errors**: Always handle potential errors when working with deep links
3. **Parse Safely**: Validate parsed deep link data before using it
4. **Clean Up**: Remove listeners when components unmount
5. **Test Thoroughly**: Test deep links on both platforms and various scenarios

## Additional Resources

- [React Native Linking Guide](https://reactnative.dev/docs/linking)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Universal Links (iOS)](https://developer.apple.com/ios/universal-links/)
- [App Links (Android)](https://developer.android.com/training/app-links)