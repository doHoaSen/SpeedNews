# -- 1단계 빌드
FROM gradle:8.9-jdk17 AS build
WORKDIR /workspace
COPY build.gradle* settings.gradle* ./
COPY src ./src
RUN gradle bootJar --no-daemon


# ── 2단계: 실행 (JRE만)
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java","-jar","/app/app.jar"]