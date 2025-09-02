# backend/Dockerfile

# 1. ベースとなるPython環境を選択
FROM python:3.12-slim

# 2. ODBCドライバのインストール (これで環境依存の問題が解決します)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    unixodbc-dev \
 && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
 && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list > /dev/null \
 && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. アプリケーションのコードを配置するディレクトリを作成
WORKDIR /app

# 4. 必要なPythonライブラリをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. アプリケーションのコードをコピー
COPY . .

# 6. アプリケーションが使用するポートを公開
EXPOSE 8000

# 7. コンテナ起動時に実行するコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]