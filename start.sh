#!/bin/bash

npm run server &
SERVER_PID=$!

sleep 5

npm run dev &
VITE_PID=$!

trap "echo 'Shutting down...'; kill $SERVER_PID $VITE_PID; exit 0" INT TERM

echo "servers running. Press Ctrl+C to stop."
tail -f /dev/null