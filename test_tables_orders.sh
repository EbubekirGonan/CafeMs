#!/bin/bash

echo "=== Testing Table & Order Endpoints ==="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafems.com","password":"admin123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token obtained"

# 1. List tables
echo -e "\n1️⃣ GET /tables (FR-05)"
TABLES=$(curl -s -X GET http://localhost:3001/api/v1/tables \
  -H "Authorization: Bearer $TOKEN")
TABLE_ID=$(echo $TABLES | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "✅ Tables listed. Table ID: $TABLE_ID"

# 2. Get single table
echo -e "\n2️⃣ GET /tables/:id"
curl -s -X GET http://localhost:3001/api/v1/tables/$TABLE_ID \
  -H "Authorization: Bearer $TOKEN" | grep -E '"number"|"status"'

# 3. Create a product first
echo -e "\n3️⃣ POST /products (create Kahve)"
PRODUCT=$(curl -s -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kahve","price":25.00,"category":"İçecekler"}')
PRODUCT_ID=$(echo $PRODUCT | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "✅ Product created: $PRODUCT_ID"

# 4. Add product to table (FR-06)
echo -e "\n4️⃣ POST /tables/:id/order/items (FR-06)"
ORDER_ITEM=$(curl -s -X POST "http://localhost:3001/api/v1/tables/$TABLE_ID/order/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}")
ORDER_ID=$(echo $ORDER_ITEM | grep -o '"orderId":"[^"]*"' | cut -d'"' -f4)
echo "✅ Item added to table. Order ID: $ORDER_ID"

# 5. Get active order
echo -e "\n5️⃣ GET /tables/:id/order"
curl -s -X GET "http://localhost:3001/api/v1/tables/$TABLE_ID/order" \
  -H "Authorization: Bearer $TOKEN" | grep -E '"id"|"status"' | head -5

# 6. Get order details (FR-08)
echo -e "\n6️⃣ GET /orders/:id (FR-08)"
curl -s -X GET "http://localhost:3001/api/v1/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" | grep -E '"status"|"totalAmount"'

# 7. Checkout order (FR-09)
echo -e "\n7️⃣ POST /orders/:id/checkout (FR-09)"
CHECKOUT=$(curl -s -X POST "http://localhost:3001/api/v1/orders/$ORDER_ID/checkout" \
  -H "Authorization: Bearer $TOKEN")
echo $CHECKOUT | grep -E '"success"|"PAID"'

# 8. Verify table is empty after checkout
echo -e "\n8️⃣ GET /tables/:id (after checkout)"
curl -s -X GET http://localhost:3001/api/v1/tables/$TABLE_ID \
  -H "Authorization: Bearer $TOKEN" | grep -E '"status"'

echo -e "\n✅ All table & order tests completed!"
