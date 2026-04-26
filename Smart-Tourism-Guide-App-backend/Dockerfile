FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
# Build the jar
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
# Copy correct jar file
COPY --from=build /app/target/Smart-Tourism-Guide-App-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]