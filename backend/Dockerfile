# Multi-stage Dockerfile for OpsMind Backend
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add non-root user for security best practices
RUN addgroup -S opsmind && adduser -S opsmind -G opsmind
USER opsmind

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep UP || exit 1

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
