#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RowtDeepLinkModule : RCTEventEmitter <RCTBridgeModule>

+ (void)setDeepLink:(NSString *)url;
+ (void)setInitialDeepLink:(NSString *)url;

@end