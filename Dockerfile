# Stage 1: Build frontend
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend (Java + Gradle)
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app/backend
COPY backend/gradlew backend/gradlew.bat ./
COPY backend/gradle ./gradle
COPY backend/build.gradle.kts backend/settings.gradle.kts ./
RUN chmod +x gradlew && ./gradlew dependencies -q --no-daemon || true
COPY backend/src ./src
# Copy built frontend into Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN ./gradlew bootJar -x test --no-daemon -q

# Stage 3: Production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/build/libs/*.jar app.jar
ENV PORT=8080
EXPOSE $PORT
CMD ["sh", "-c", "java -jar app.jar --server.port=$PORT"]
