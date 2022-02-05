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

# build Xcode project
echo "Preparing to build Xcode project"
bash ./scripts/build-ios.bash $stage $region

uploadLocation="the App Store"
if [[ "$stage" == "alpha" ]]
then
  uploadLocation="S3"
fi

echo "Open Xcode to archive the IPA and upload to $uploadLocation ($stage)"