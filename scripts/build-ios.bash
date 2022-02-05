#! /bin/bash

set -e

# Variables
stage=$1
region=$2

# Configure which API to use
bash ./scripts/config-api.bash $stage $region

echo "Performing a production build (iOS)"

ionic cordova build ios --release --prod