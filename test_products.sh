#!/bin/bash

echo "=== Testing Product Endpoints ==="

# 1. Login
echo -e "\n1️⃣ Login to get access token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafems.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token obtained"

# 2. List products (should be empty)
echo -e "\n2️⃣ GET /products (empty list)"
curl -s -X GET http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""

# 3. Create product 1
echo -e "\n3️⃣ POST /products (create Kahve)"
PRODUCT_1=$(curl -s -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kahve","price":25.00,"category":"İçecekler"}')

PRODUCT_1_ID=$(echo $PRODUCT_1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "✅ Product 1 created: $PRODUCT_1_ID"

# 4. Create product 2
echo -e "\n4️⃣ POST /products (create Çay)"
PRODUCT_2=$(curl -s -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Çay","price":15.00,"category":"İçecekler"}')

PRODUCT_2_ID=$(echo $PRODUCT_2 | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "✅ Product 2 created: $PRODUCT_2_ID"

# 5. List products again
echo -e "\n5️⃣ GET /products (should have 2 products)"
curl -s -X GET http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*"'

# 6. Get single product
echo -e "\n6️⃣ GET /products/:id"
curl -s -X GET http://localhost:3001/api/v1/products/$PRODUCT_1_ID \
  -H "Authorization: Bearer $TOKEN" | grep -E '"name"|"price"'

# 7. Update product
echo -e "\n7️⃣ PUT /products/:id (update price to 30)"
curl -s -X PUT http://localhost:3001/api/v1/products/$PRODUCT_1_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":30.00}' | grep -E '"name"|"price"'

# 8. Delete product (should work - no active orders)
echo -e "\n8️⃣ DELETE /products/:id"
curl -s -X DELETE http://localhost:3001/api/v1/products/$PRODUCT_2_ID \
  -H "Authorization: Bearer $TOKEN" | grep '"success"'

# 9. List products (should have 1 - active only)
echo -e "\n9️⃣ GET /products (should have 1 active product)"
curl -s -X GET http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*"'

echo -e "\n✅ All product tests completed!"
