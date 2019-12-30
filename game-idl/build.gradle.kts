import com.google.protobuf.gradle.*
import org.gradle.kotlin.dsl.provider.gradleKotlinDslOf

plugins {
  java
  idea
  id("com.google.protobuf") version "0.8.11"
}

//sourceSets{
//  create("protobuf"){
//    proto {
//      srcDir("src/sample/protobuf")
//    }
//  }
//}

repositories {
  maven("https://oss.jfrog.org/oss-snapshot-local")
//  maven("https://oss.sonatype.org/content/repositories/snapshots")
}

dependencies {
  implementation("com.google.protobuf:protobuf-java:3.6.1")
  implementation("io.grpc:grpc-stub:1.15.1")
  implementation("io.grpc:grpc-protobuf:1.15.1")
  implementation("io.rsocket.rpc:rsocket-rpc-core:0.3.0-SNAPSHOT")

  protobuf("io.rsocket.rpc:rsocket-rpc-protobuf-idl:0.3.0-SNAPSHOT")
  // Extra proto source files besides the ones residing under
  // "src/main".
//  protobuf(files("lib/protos.tar.gz"))
//  protobuf(files("ext/"))
//
//   Adding dependency for configuration from custom sourceSet
//  "sampleProtobuf"(files("ext/"))
}

protobuf {
  protoc {
    // The artifact spec for the Protobuf Compiler
    artifact = "com.google.protobuf:protoc:3.6.1"
  }
  plugins {
//    id("grpc") {
//      artifact = "io.grpc:protoc-gen-grpc-java:1.15.1"
//    }
//    id("reactorGRpc") {
//      artifact = "com.salesforce.servicelibs:reactor-grpc:0.10.0-RC1:jdk8@jar"
//    }
    id("rsocketRpc") {
      artifact = "io.rsocket.rpc:rsocket-rpc-protobuf:0.3.0-SNAPSHOT"
    }
  }
  generateProtoTasks {
    ofSourceSet("main").forEach {
      it.plugins {
        id("rsocketRpc")
      }
    }
  }
}
