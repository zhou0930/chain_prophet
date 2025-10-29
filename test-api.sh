#!/bin/bash

echo "🧪 测试 Chain Prophet API..."

# 测试健康检查
echo "1. 测试健康检查..."
curl -s http://localhost:3000/api/health | jq '.' || echo "健康检查失败"

echo -e "\n2. 测试获取 Agent 列表..."
curl -s http://localhost:3000/api/agents | jq '.'

echo -e "\n3. 测试创建会话..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/messaging/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentId":"51313af0-f433-02b3-81a6-f01b84929d4e","userId":"550e8400-e29b-41d4-a716-446655440000"}')

echo "$SESSION_RESPONSE" | jq '.'

# 提取会话 ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.sessionId')

if [ "$SESSION_ID" != "null" ] && [ "$SESSION_ID" != "" ]; then
  echo -e "\n4. 测试发送消息..."
  curl -s -X POST "http://localhost:3000/api/messaging/sessions/$SESSION_ID/messages" \
    -H "Content-Type: application/json" \
    -d '{"content":"你好，请介绍一下你的功能"}' | jq '.'
  
  echo -e "\n5. 测试获取消息历史..."
  curl -s "http://localhost:3000/api/messaging/sessions/$SESSION_ID/messages" | jq '.'
else
  echo "❌ 无法创建会话，跳过消息测试"
fi

echo -e "\n✅ API 测试完成！"
