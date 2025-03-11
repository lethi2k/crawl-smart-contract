#!/bin/bash

set -e

echo "🚀 Starting Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for Kafka to be ready..."
sleep 10  # Wait for services to initialize

echo "📌 Creating test Kafka topic..."
docker exec -it kafka kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 1 --replication-factor 1 || true

echo "📩 Sending a test message..."
echo "Hello, Kafka!" | docker exec -i kafka kafka-console-producer --broker-list kafka:9092 --topic test-topic

echo "👀 Reading messages from test-topic..."
docker exec -it kafka kafka-console-consumer --bootstrap-server kafka:9092 --topic test-topic --from-beginning
