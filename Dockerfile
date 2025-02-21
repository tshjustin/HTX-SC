FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# for the sake of simplicity, only the frontend of the container is exposed 
EXPOSE 5713 

RUN echo '#!/bin/bash\nnpm run server & npm run dev\ntail -f /dev/null' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]