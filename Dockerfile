# Use a lightweight OpenJDK 21 base image
FROM openjdk:21-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy the built Spring Boot JAR file from your local target directory
# IMPORTANT: Adjust 'cyclomatic-complexity-analyzer-0.0.1-SNAPSHOT.jar' to your actual JAR name
COPY target/cyclomatic-complexity-analyzer-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot application listens on (default is 8080)
EXPOSE 8080

# Command to run your Spring Boot application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]