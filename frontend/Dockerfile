# frontend/Dockerfile

# --- ステージ1: ビルド環境 ---
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- ステージ2: 本番環境 ---
# Nginxという軽量なWebサーバーをベースにする
FROM nginx:stable-alpine
# ビルドステージから、ビルドされた静的ファイルだけをコピー
COPY --from=build /app/dist /usr/share/nginx/html
# Nginxが80番ポートでリクエストを待つように設定
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]