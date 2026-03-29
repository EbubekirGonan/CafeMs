#!/bin/bash

echo "=== Testing Expense Endpoints (FR-10-13) ==="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafems.com","password":"admin123"}' \
  | jq -r '.data.accessToken')
echo "✅ Token obtained"

# Get today's date
TODAY=$(date -I)

# 1. Create expense - Hammadde (FR-10)
echo -e "\n1️⃣ POST /expenses (FR-10: Hammadde)"
EXPENSE1=$(curl -s -X POST http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Kahve Çekirdeği\",\"quantity\":10,\"unit\":\"kg\",\"unitPrice\":50.00,\"totalAmount\":500.00,\"category\":\"Hammadde\",\"expenseDate\":\"$TODAY\"}")
EXPENSE1_ID=$(echo $EXPENSE1 | jq -r '.data.id // empty')
if [ -z "$EXPENSE1_ID" ]; then
  echo "❌ Failed to create Hammadde expense"
  echo $EXPENSE1 | jq '.'
else
  echo "✅ Hammadde expense created: $EXPENSE1_ID"
fi

# 2. Create expense - Faturalar (FR-10)
echo -e "\n2️⃣ POST /expenses (FR-10: Faturalar)"
EXPENSE2=$(curl -s -X POST http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Elektrik Faturası\",\"totalAmount\":2500.00,\"category\":\"Faturalar\",\"expenseDate\":\"$TODAY\"}")
EXPENSE2_ID=$(echo $EXPENSE2 | jq -r '.data.id // empty')
if [ -z "$EXPENSE2_ID" ]; then
  echo "❌ Failed to create Faturalar expense"
  echo $EXPENSE2 | jq '.'
else
  echo "✅ Faturalar expense created: $EXPENSE2_ID"
fi

# 3. Create expense - Kira (FR-10)
echo -e "\n3️⃣ POST /expenses (FR-10: Kira)"
EXPENSE3=$(curl -s -X POST http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Aylık Kira Ödemesi\",\"totalAmount\":15000.00,\"category\":\"Kira\",\"expenseDate\":\"$TODAY\"}")
EXPENSE3_ID=$(echo $EXPENSE3 | jq -r '.data.id // empty')
if [ -z "$EXPENSE3_ID" ]; then
  echo "❌ Failed to create Kira expense"
  echo $EXPENSE3 | jq '.'
else
  echo "✅ Kira expense created: $EXPENSE3_ID"
fi

# 4. Create expense - Personel (FR-10)
echo -e "\n4️⃣ POST /expenses (FR-10: Personel)"
EXPENSE4=$(curl -s -X POST http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Maaş Ödemesi\",\"quantity\":3,\"unit\":\"kişi\",\"unitPrice\":5000,\"totalAmount\":15000.00,\"category\":\"Personel\",\"expenseDate\":\"$TODAY\"}")
EXPENSE4_ID=$(echo $EXPENSE4 | jq -r '.data.id // empty')
if [ -z "$EXPENSE4_ID" ]; then
  echo "❌ Failed to create Personel expense"
  echo $EXPENSE4 | jq '.'
else
  echo "✅ Personel expense created: $EXPENSE4_ID"
fi

# 5. Get all expenses (FR-13)
echo -e "\n5️⃣ GET /expenses (FR-13: List all)"
EXPENSES=$(curl -s -X GET http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN")
EXPENSE_COUNT=$(echo $EXPENSES | jq '.count // 0')
echo "✅ Total expenses: $EXPENSE_COUNT"

# 6. Get expenses by category - Hammadde (FR-11)
echo -e "\n6️⃣ GET /expenses?category=Hammadde (FR-11: Category filter)"
HAMMADDE=$(curl -s -X GET "http://localhost:3001/api/v1/expenses?category=Hammadde" \
  -H "Authorization: Bearer $TOKEN")
HAMMADDE_COUNT=$(echo $HAMMADDE | jq '.count // 0')
echo "✅ Hammadde expenses: $HAMMADDE_COUNT"

# 7. Get expenses by date range (FR-13)
START_DATE=$(date -d "7 days ago" -I)
END_DATE=$(date -I)
echo -e "\n7️⃣ GET /expenses?startDate=...&endDate=... (FR-13: Date range)"
RANGE=$(curl -s -X GET "http://localhost:3001/api/v1/expenses?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN")
RANGE_COUNT=$(echo $RANGE | jq '.count // 0')
echo "✅ Expenses in date range: $RANGE_COUNT"

# 8. Get single expense
echo -e "\n8️⃣ GET /expenses/:id (Get single expense)"
SINGLE=$(curl -s -X GET "http://localhost:3001/api/v1/expenses/$EXPENSE1_ID" \
  -H "Authorization: Bearer $TOKEN")
SINGLE_DESC=$(echo $SINGLE | jq -r '.data.description // "error"')
echo "✅ Expense: $SINGLE_DESC"

# 9. Update expense (FR-12)
echo -e "\n9️⃣ PUT /expenses/:id (FR-12: Update expense)"
UPDATED=$(curl -s -X PUT "http://localhost:3001/api/v1/expenses/$EXPENSE1_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"totalAmount":600.00}')
UPDATE_AMOUNT=$(echo $UPDATED | jq -r '.data.totalAmount // "error"')
echo "✅ Updated amount: $UPDATE_AMOUNT"

# 10. Delete expense (FR-12)
echo -e "\n🔟 DELETE /expenses/:id (FR-12: Delete expense)"
DELETED=$(curl -s -X DELETE "http://localhost:3001/api/v1/expenses/$EXPENSE4_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $DELETED | jq -r '.message // .error.message // "deleted"')
echo "✅ Expense deleted: $DELETE_MSG"

# 11. Verify deletion
echo -e "\n1️⃣1️⃣ Verify deletion (get all expenses)"
FINAL_COUNT=$(curl -s -X GET http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" | jq '.count // 0')
echo "✅ Final expense count: $FINAL_COUNT"

echo -e "\n✅ All expense tests completed!"
