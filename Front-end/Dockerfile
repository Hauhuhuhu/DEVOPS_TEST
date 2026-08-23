# Bước 1: Build mã nguồn React Vite
FROM node:22-alpine AS build
WORKDIR /app

# Copy cấu hình package và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code và tiến hành build (Vite sẽ tạo ra thư mục 'dist')
COPY . .
RUN npm run build

# Bước 2: Phục vụ file tĩnh bằng Nginx
FROM nginx:alpine

# Xóa trang web mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy thư mục 'dist' từ bước build sang thư mục chạy web của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở port 80
EXPOSE 5173

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]