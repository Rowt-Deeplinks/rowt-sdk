module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        manifestPath: './android/src/main/AndroidManifest.xml',
        packageImportPath: 'import com.rowt.deeplink.DeepLinkPackage;',
      },
      ios: {
        podspecPath: './ios/RowtDeepLink.podspec',
      },
    },
  },
};