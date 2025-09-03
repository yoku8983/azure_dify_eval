# frontend/Dockerfile

# --- ステージ1: ビルド環境 ---
FROM node:20-alpine as build

# ビルド時に外部からVITE_API_URLという変数を受け取ることを宣言
ARG VITE_API_URL
# 受け取った変数を、npm run buildが参照できる環境変数として設定
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# ここで npm run build が実行される際に、上記のENVが使われる
RUN npm run build

# --- ステージ2: 本番環境 ---
FROM nginx:stable-alpine AS stage-1
COPY --from=build /app/dist /usr/share/nginx/html

# --- 追加: Nginxテンプレート機能を使って起動時に環境変数を展開 ---
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]