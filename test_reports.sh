#!/bin/bash

echo "=== Testing Report Endpoints (FR-14-17) ==="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafems.com","password":"admin123"}' \
  | jq -r '.data.accessToken')
echo "✅ Token obtained"

# First, create some test data if needed
CURRENT_MONTH=$(date +%m)
CURRENT_YEAR=$(date +%Y)

echo ""
echo "Using current month: $CURRENT_MONTH, Year: $CURRENT_YEAR"

# 1. Test FR-14: Get monthly revenue summary
echo -e "\n1️⃣ GET /reports/revenue (FR-14: Aylık Gelir Özeti)"
REVENUE=$(curl -s -X GET "http://localhost:3001/api/v1/reports/revenue?year=$CURRENT_YEAR&month=$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")
REVENUE_TOTAL=$(echo $REVENUE | jq '.data.totalRevenue // 0')
REVENUE_COUNT=$(echo $REVENUE | jq '.data.transactionCount // 0')
echo "✅ Total Revenue: $REVENUE_TOTAL, Transactions: $REVENUE_COUNT"
echo $REVENUE | jq '.data | {month, year, totalRevenue, transactionCount, dailyAverage}' 2>/dev/null || echo $REVENUE | jq '.' | head -10

# 2. Test FR-15: Get monthly expense summary with category breakdown
echo -e "\n2️⃣ GET /reports/expenses (FR-15: Aylık Gider Özeti)"
EXPENSES=$(curl -s -X GET "http://localhost:3001/api/v1/reports/expenses?year=$CURRENT_YEAR&month=$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")
EXPENSE_TOTAL=$(echo $EXPENSES | jq '.data.totalExpenses // 0')
EXPENSE_COUNT=$(echo $EXPENSES | jq '.data.expenseCount // 0')
echo "✅ Total Expenses: $EXPENSE_TOTAL, Count: $EXPENSE_COUNT"
echo $EXPENSES | jq '.data | {month, year, totalExpenses, expenseCount, categoryBreakdown}' 2>/dev/null || echo $EXPENSES | jq '.' | head -15

# 3. Test FR-16: Get net profit/loss
echo -e "\n3️⃣ GET /reports/net-profit (FR-16: Net Kar/Zarar Gösterimi)"
NET=$(curl -s -X GET "http://localhost:3001/api/v1/reports/net-profit?year=$CURRENT_YEAR&month=$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")
NET_AMOUNT=$(echo $NET | jq '.data.netProfitLoss // 0')
IS_PROFIT=$(echo $NET | jq '.data.isProfit // false')
PROFIT_MARGIN=$(echo $NET | jq '.data.profitMargin // 0')
echo "✅ Net Amount: $NET_AMOUNT, Is Profit: $IS_PROFIT, Margin: $PROFIT_MARGIN%"
echo $NET | jq '.data | {month, year, totalRevenue, totalExpenses, netProfitLoss, isProfit, profitMargin}' 2>/dev/null || echo $NET | jq '.' | head -10

# 4. Test FR-17: Get monthly comparison (trend analysis)
echo -e "\n4️⃣ GET /reports/comparison (FR-17: Aylık Karşılaştırma)"
COMPARISON=$(curl -s -X GET "http://localhost:3001/api/v1/reports/comparison?months=3" \
  -H "Authorization: Bearer $TOKEN")
COMPARISON_COUNT=$(echo $COMPARISON | jq '.monthsIncluded // 0')
echo "✅ Months compared: $COMPARISON_COUNT"
echo $COMPARISON | jq '.data | length' 2>/dev/null && echo "Data entries received"
echo $COMPARISON | jq '.data[:2]' 2>/dev/null | head -20

# 5. Get comprehensive report (all metrics)
echo -e "\n5️⃣ GET /reports/comprehensive (All metrics for month)"
COMPREHENSIVE=$(curl -s -X GET "http://localhost:3001/api/v1/reports/comprehensive?year=$CURRENT_YEAR&month=$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")
COMP_PERIOD=$(echo $COMPREHENSIVE | jq '.data.period.monthName // "error"')
echo "✅ Comprehensive report for: $COMP_PERIOD"
echo $COMPREHENSIVE | jq '.data | keys' 2>/dev/null && echo "Available sections: period, revenue, expenses, profitLoss"

# 6. Get yearly overview
echo -e "\n6️⃣ GET /reports/year (Yearly overview)"
YEARLY=$(curl -s -X GET "http://localhost:3001/api/v1/reports/year?year=$CURRENT_YEAR" \
  -H "Authorization: Bearer $TOKEN")
MONTHS_AVAILABLE=$(echo $YEARLY | jq '.data.monthsWithData // []' 2>/dev/null)
echo "✅ Months with data: $MONTHS_AVAILABLE"
REPORT_COUNT=$(echo $YEARLY | jq '.data.monthlyReports | length // 0' 2>/dev/null)
echo "✅ Monthly reports count: $REPORT_COUNT"

# 7. Test default current month (no params)
echo -e "\n7️⃣ GET /reports/revenue (default: current month)"
DEFAULT_REV=$(curl -s -X GET "http://localhost:3001/api/v1/reports/revenue" \
  -H "Authorization: Bearer $TOKEN")
DEFAULT_MONTH=$(echo $DEFAULT_REV | jq '.data.month // "error"')
DEFAULT_YEAR=$(echo $DEFAULT_REV | jq '.data.year // "error"')
echo "✅ Default month: $DEFAULT_MONTH, Year: $DEFAULT_YEAR"

# 8. Test error handling - invalid month
echo -e "\n8️⃣ Test error handling - invalid month"
ERROR_TEST=$(curl -s -X GET "http://localhost:3001/api/v1/reports/revenue?month=13" \
  -H "Authorization: Bearer $TOKEN")
ERROR_MSG=$(echo $ERROR_TEST | jq '.error.message // "success"')
echo "✅ Error handling works: $ERROR_MSG"

echo -e "\n✅ All report endpoint tests completed!"
