#!/bin/bash

# Restart both frontend and refresh backend connection
# Usage: ./restart_all.sh

echo "🚀 Restarting Habit Tracker..."
echo "================================"
echo ""

# Run backend refresh first
echo "1️⃣  Refreshing backend connection..."
./restart_backend.sh

echo ""
echo "2️⃣  Restarting frontend..."
./restart_frontend.sh


