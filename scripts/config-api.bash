#! /bin/bash

set -e

# Variables
service="bc"
stage=$1
region=$2
profile="buildcenter"
file_path="src/api-config.ts"

echo "Retrieving ApiId"

# Default stage if not passed
if [[ -z $stage ]];
then
    echo "No stage provided, using default: dev"
    stage="dev"
fi

# Default region if not passed
if [[ -z $region ]];
then
    echo "No region provided, using default: us-west-1"
    region="us-west-1"
fi

if [[ $stage == "dev" ]]
then
  api_id="duzrmzcg93"
else
  # Get the api_id from the AWS Cloudformation Output
  api_id=$(aws cloudformation list-exports --query "Exports[?Name==\`$service:$stage:ApiId\`].Value" --no-paginate --output text --region $region --profile $profile)
fi

# Verify ApiId retrieved
if [[ -z $api_id ]];
then
    echo "Unable to retrieve ApiId"
    exit 1
fi

# Export API info into a file to be used by the app
cat > $file_path <<EOL
export default {
    "region": "${region}",
    "api": {
        "name": "bc-${stage}-api",
        "id": "${api_id}"
    },
    "stage": "${stage}"
}
EOL

echo "Using API in $stage & $region: https://${api_id}.execute-api.${region}.amazonaws.com/${stage}/"