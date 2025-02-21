#!/bin/bash

echo "start express port 3101"
npm run server &
SERVER_PID=$!

sleep 5

echo "start vite port 5173..."
npm run dev &
VITE_PID=$!

trap "echo 'Shutting down...'; kill $SERVER_PID $VITE_PID; exit 0" INT TERM

echo "servers running. Press Ctrl+C to stop."
tail -f /dev/null