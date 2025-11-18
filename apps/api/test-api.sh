#!/bin/bash

# APIテストスクリプト
# バックエンドAPIエンドポイントの動作確認

set -e

BASE_URL="http://localhost:8000/api"

echo "========================================="
echo "バックエンドAPIテスト開始"
echo "========================================="
echo ""

# ヘルスチェック
echo "1. ヘルスチェック"
echo "GET /health"
curl -s http://localhost:8000/health | jq .
echo ""

# ニュースAPI
echo "========================================="
echo "2. ニュースAPI"
echo "========================================="

echo "GET ${BASE_URL}/news"
curl -s "${BASE_URL}/news" | jq '.success, .data.total, .data.limit'
echo ""

echo "GET ${BASE_URL}/news?limit=5&offset=0"
curl -s "${BASE_URL}/news?limit=5&offset=0" | jq '.data | {total, limit, offset, news_count: (.news | length)}'
echo ""

# 動物API
echo "========================================="
echo "3. 動物API"
echo "========================================="

echo "GET ${BASE_URL}/animals"
curl -s "${BASE_URL}/animals" | jq '.success, .data.total, .data.limit'
echo ""

echo "GET ${BASE_URL}/animals?status=active&limit=10"
curl -s "${BASE_URL}/animals?status=active&limit=10" | jq '.data | {total, limit, animals_count: (.animals | length)}'
echo ""

# 天気API
echo "========================================="
echo "4. 天気API"
echo "========================================="

echo "GET ${BASE_URL}/weather?lat=35.9447&lon=136.1847 (福井県鯖江市)"
curl -s "${BASE_URL}/weather?lat=35.9447&lon=136.1847" | jq '{temp, description, humidity}'
echo ""

# テーマAPI
echo "========================================="
echo "5. テーマAPI"
echo "========================================="

echo "GET ${BASE_URL}/themes"
curl -s "${BASE_URL}/themes" | jq '.data.themes | length'
echo ""

echo "========================================="
echo "テスト完了"
echo "========================================="
