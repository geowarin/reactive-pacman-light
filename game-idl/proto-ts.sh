set -e

rm -rf ./generated/javascript
mkdir -p ./generated/javascript

proto_dir="./src/main/proto"

protoc --proto_path=node_modules/rsocket-rpc-protobuf/proto \
  --proto_path="$proto_dir"\
  --rsocket_rpc_out=./generated/javascript \
  --plugin=protoc-gen-rsocket_rpc=node_modules/.bin/rsocket_rpc_js_protoc_plugin \
  --js_out=import_style=commonjs,binary:./generated/javascript \
  node_modules/rsocket-rpc-protobuf/proto/rsocket/*.proto \
  "$proto_dir"/*.proto

protoc --proto_path="$proto_dir" \
  --proto_path=./node_modules/rsocket-rpc-protobuf/proto \
  --proto_path=./node_modules/rsocket-rpc-protobuf/proto/rsocket \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./generated/javascript \
  ./node_modules/rsocket-rpc-protobuf/proto/rsocket/*.proto \
  "$proto_dir"/*.proto
