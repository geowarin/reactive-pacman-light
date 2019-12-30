mkdir -p ./generated/javascript

protoc --proto_path=node_modules/rsocket-rpc-protobuf/proto \
  --proto_path=../proto \
  --js_out=import_style=commonjs,binary:./generated/javascript \
  --rsocket_rpc_out=./generated/javascript \
  --plugin=protoc-gen-rsocket_rpc=node_modules/.bin/rsocket_rpc_js_protoc_plugin \
  ../proto/*.proto \
  node_modules/rsocket-rpc-protobuf/proto/rsocket/*.proto

protoc --proto_path=../proto --proto_path=./node_modules/rsocket-rpc-protobuf/proto \
  --proto_path=./node_modules/rsocket-rpc-protobuf/proto/rsocket \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./generated/javascript \
  ./node_modules/rsocket-rpc-protobuf/proto/rsocket/*.proto \
  ../proto/*.proto
