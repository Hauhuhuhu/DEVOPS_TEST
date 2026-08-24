# Bước 1: Build ứng dụng với Maven 4 và Java 25
FROM maven:3.9-eclipse-temurin-25-alpine AS build
WORKDIR /app

# Copy file cấu hình thư viện và tải về trước (tận dụng Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code và build ra file .jar
COPY src ./src
RUN mvn clean package -DskipTests
RUN rm -f target/*-plain.jar

# Bước 2: Chạy ứng dụng (Chỉ sử dụng môi trường JRE Java 25)
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copy file .jar đã được build từ bước trên
COPY --from=build /app/target/*.jar app.jar

# Mở port 8080 (hoặc port bạn dùng trong Spring Boot)
EXPOSE 8080

# Chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]