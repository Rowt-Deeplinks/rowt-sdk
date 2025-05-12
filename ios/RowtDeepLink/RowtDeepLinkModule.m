#import "RowtDeepLinkModule.h"
#import <React/RCTBridge.h>
#import <React/RCTLog.h>

@implementation RowtDeepLinkModule
{
    NSString *_initialDeepLink;
    BOOL _hasListeners;
}

static RowtDeepLinkModule *_sharedInstance = nil;

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[self alloc] init];
    });
    return _sharedInstance;
}

RCT_EXPORT_MODULE(RowtDeepLink);

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    if (self = [super init]) {
        _sharedInstance = self;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onRowtDeepLinkReceived"];
}

- (void)startObserving {
    _hasListeners = YES;
    
    // Send any pending deep link
    if (_initialDeepLink) {
        [self sendEventWithName:@"onRowtDeepLinkReceived" body:@{@"url": _initialDeepLink}];
        _initialDeepLink = nil;
    }
}

- (void)stopObserving {
    _hasListeners = NO;
}

+ (void)setDeepLink:(NSString *)url {
    [[RowtDeepLinkModule sharedInstance] handleDeepLink:url];
}

+ (void)setInitialDeepLink:(NSString *)url {
    if (_sharedInstance) {
        [_sharedInstance handleDeepLink:url];
    } else {
        // Store for when module initializes
        [[RowtDeepLinkModule sharedInstance] storeInitialDeepLink:url];
    }
}

- (void)storeInitialDeepLink:(NSString *)url {
    _initialDeepLink = url;
}

- (void)handleDeepLink:(NSString *)url {
    if (_hasListeners) {
        [self sendEventWithName:@"onRowtDeepLinkReceived" body:@{@"url": url}];
    } else {
        _initialDeepLink = url;
    }
}

RCT_EXPORT_METHOD(getInitialDeepLink:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        resolve(_initialDeepLink);
        _initialDeepLink = nil;
    } @catch (NSException *exception) {
        reject(@"DEEPLINK_ERROR", @"Failed to get initial deep link", nil);
    }
}

@end