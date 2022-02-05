#! /bin/bash

set -e

# Variables
stage=$1
region=$2

bash ./scripts/config-api.bash $stage $region

echo "Performing a development build (browser)"

ionic cordova run browser -l