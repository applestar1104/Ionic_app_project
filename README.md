# Dave Robbins Notes
- Dec 12 2019 ionic cordova run ios  --external
- Dec 12 2019 ionic cordova run ios  -l --external
- ionic cordova emulate ios
- ionic cordova run browser -l
-
- ionic cordova platform add browser
- ionic cordova run browser
- Aug 13 2019 The "swipe" event cannot be bound because Hammer.JS is not loaded and no custom loader has been specified.

## Environment Setup
- Node version: 10.15.3
- GLOBAL Dependencies:
  - npm i -g ionic
  - npm i -g cordova
  - npm i -g native-run
  - npm i -g ios-deploy
  - npm i -g ios-sim

## Command Shortcuts
- ionic cordova run ios : will run the app on a device if connected, otherwise in simulator- 
  - add : '--target="xxxx"' : will target specific device/simulator
  - add : '-l' : will live-reload changes while running
  - add : '--prod' : will perform a production build before running
- npm start : will open run app locally and open in browser
- npm run lint : will lint app
  - add : '-- --fix' : will auto-fix some errors
- npm run build - will perform a production build
- npm run deploy:ios : will deploy a production/release xcode project for ios
- npm run deploy:android : will deploy a production/release studio project for android

## Deploy to USB iOS device
- First time only:
  - Command: ionic cordova build ios
  - Open newly created XCode project
  - Check "Automatically Manage Signing"
  - Select "COBE Construction, Inc." as Team
- Plug in USB device
- Command: ionic cordova run ios

## Deploy to USB Android device
- First time only:
  - Device: Settings > System > Developer Options > USB Debugging > On
- Plug in USB device
- Command: ionic cordova run android

## Deploy to getAlpha/getBeta Buckets
- CHANGE TO CORRECT BRANCH (alpha/beta)
- Update config.xml
  - Change version
  - Change android-versionCode (CHECK BETA BRANCH)

### iOS Instructions
- Command: npm run deploy:ios
- Open Xcode project
- In project window change target to "Generic iOS Device"
- In toolbar go to Product > Archive
- Distribute App > Enterprise > No Thinning > Manually Manage Signing > Distribution: default, App: prod > Export
- Create a backup of the previous version in WebFolder/bcapp/ios archives/BuildCenter#.#.#.ipa
- Copy exported app files into getAlpha/getBeta s3 bucket (overwrite existing files)

### Android Instructions
- Command: npm run deploy:android
- Go to play store console, create a new alpha track release, upload apk and submit for review
- Wait for email notification that update is live

### Go Live
- Update [setting]app_version in alpha/beta db to match new version #