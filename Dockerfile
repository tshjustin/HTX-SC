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

EXPOSE 5173 3101

CMD ["bash"]

# docker build -t htx-app .
# docker run -it --name htx-app --network host htxsc