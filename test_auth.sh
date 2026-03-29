#!/bin/bash

echo "=== Testing Auth Endpoints ==="

# 1. Login and get tokens
echo -e "\n1️⃣ POST /auth/login"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafems.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ Access Token: ${ACCESS_TOKEN:0:50}..."

# 2. Get current user
echo -e "\n2️⃣ GET /auth/me (with token)"
curl -s -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'

# 3. Test logout
echo -e "\n3️⃣ POST /auth/logout (with token)"
curl -s -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 4. Try /me after logout (should fail)
echo -e "\n4️⃣ GET /auth/me (after logout) - Should still work with same token"
curl -s -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'

echo -e "\n✅ All tests completed!"
