import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
  id("org.springframework.boot") version "2.2.2.RELEASE"
  id("io.spring.dependency-management") version "1.0.8.RELEASE"
  kotlin("jvm") version "1.3.61"
  kotlin("plugin.spring") version "1.3.61"
}

group = "com.geowarin"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

val developmentOnly by configurations.creating
configurations {
  runtimeClasspath {
    extendsFrom(developmentOnly)
  }
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  // for io.rsocket.rpc:rsocket-rpc-core:0.3.0-SNAPSHOT
  maven("https://oss.jfrog.org/oss-snapshot-local")
}

dependencies {
  implementation(project(":game-idl"))
  implementation("org.springframework.boot:spring-boot-starter-webflux")

  implementation("org.springframework.boot:spring-boot-starter-rsocket")
  implementation("org.roaringbitmap:RoaringBitmap:0.8.11")
  implementation("org.jctools:jctools-core:2.1.2")
  implementation("com.google.protobuf:protobuf-java:3.10.0")
  implementation("io.rsocket.rpc:rsocket-rpc-core:0.3.0-SNAPSHOT")

  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("org.jetbrains.kotlin:kotlin-reflect")
  implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

  developmentOnly("org.springframework.boot:spring-boot-devtools")
  annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
  testImplementation("org.springframework.boot:spring-boot-starter-test") {
    exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
  }
  testImplementation("io.projectreactor:reactor-test")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
  testImplementation("io.projectreactor:reactor-tools")
}

tasks.withType<Test> {
  useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
  kotlinOptions {
    freeCompilerArgs = listOf("-Xjsr305=strict")
    jvmTarget = "1.8"
  }
}
