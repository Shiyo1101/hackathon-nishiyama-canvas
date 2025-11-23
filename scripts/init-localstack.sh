#!/bin/bash
# LocalStack S3バケット初期化スクリプト

LOCALSTACK_ENDPOINT="http://localhost:4566"
BUCKET_NAME="nishiyama-canvas-images"
REGION="ap-northeast-1"

echo "Waiting for LocalStack to be ready..."
until curl -f "$LOCALSTACK_ENDPOINT/_localstack/health" > /dev/null 2>&1; do
  sleep 1
done

echo "Creating S3 bucket: $BUCKET_NAME"
aws --endpoint-url=$LOCALSTACK_ENDPOINT \
    s3 mb s3://$BUCKET_NAME \
    --region $REGION \
    2>/dev/null || echo "Bucket may already exist"

echo "Setting bucket CORS configuration..."
aws --endpoint-url=$LOCALSTACK_ENDPOINT \
    s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file://scripts/s3-cors.json \
    2>/dev/null || echo "CORS configuration may already be set"

echo "LocalStack S3 initialized successfully!"
