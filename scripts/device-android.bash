#! /bin/bash

set -e

# Variables
stage=$1
region=$2

bash ./scripts/config-api.bash $stage $region

echo "Performing a development build (connected Android device)"

ionic cordova run android --device