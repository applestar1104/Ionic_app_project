#!/bin/bash

# Variables
stage=$1

if [[ -z $stage ]]
then
    echo "Please provide a release environment (dev, alpha, beta)"
    exit 1
fi

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" != "$stage" ]]
then
  echo "Current branch ($branch) does not mach provided environment ($stage)"
  exit 1
fi

# build unsigned apk
echo "Preparing to build unsigned APK"
if [ -f platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ]
then
  echo "Deleting existing APK in Android project folder" 
  rm platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
fi
bash ./scripts/build-android.bash $stage $region

# copy unsigned apk to downloads folder
echo "Preparing to move unsigned APK to ~/Downloads"
if [ ! -f platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ]
then
  echo ERROR: "Could not find APK in Android project folder"
  exit 1
else
  version=`node -pe 'JSON.parse(process.argv[1])[0].apkInfo.versionName' "$(cat platforms/android/app/build/outputs/apk/release/output.json)"`
  echo "Version #: $version"
fi
if [ -f ~/Downloads/app-release-unsigned.apk ]
then
  echo "Deleting existing app-release-unsigned.apk in ~/Downloads" 
  rm ~/Downloads/app-release-unsigned.apk
fi
cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ~/Downloads

# sign apk
echo "Preparing to sign APK"
if [ ! -f ~/Downloads/app-release-unsigned.apk ]
then
  echo ERROR: "Could not find app-release-unsigned.apk in ~/Downloads"
  exit 1
fi
if [ -f ~/Downloads/app-release-signed.apk ]
then
  echo "Deleting existing app-release-signed.apk in ~/Downloads"
  rm ~/Downloads/app-release-signed.apk
fi
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/git/bcapp-android.keystore ~/Downloads/app-release-unsigned.apk -signedjar ~/Downloads/app-release-signed.apk bcapp-android

# zipalign signed apk for uploading
echo "Preparing to zipalign signed APK"
if [ ! -f ~/Downloads/app-release-signed.apk ]
then
  echo ERROR: "Could not find app-release-signed.apk in ~/Downloads"
  exit 1
fi
if [ -f ~/Downloads/BuildCenter-$stage-$version.apk ]
then
  echo "Deleting existing BuildCenter-$stage-$version.apk" 
  rm ~/Downloads/BuildCenter-$stage-$version.apk
fi
zipalign -v 4 ~/Downloads/app-release-signed.apk ~/Downloads/BuildCenter-$stage-$version.apk

echo "APK is ready to be uploaded to Android Console (Buildcenter-$stage-$version)"
