import com.google.protobuf.gradle.*

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
    id("rsocketRpc") {
      artifact = "io.rsocket.rpc:rsocket-rpc-protobuf:0.3.0-SNAPSHOT"
    }
    id("ts") {
      path = "node_modules/.bin/rsocket_rpc_js_protoc_plugin"
    }
  }
  generateProtoTasks {
    ofSourceSet("main").forEach {
      it.plugins {
        id("rsocketRpc")
//        id("ts")
      }
    }
  }
}
