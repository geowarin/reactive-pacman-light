set -e

proto_dir="./src/main/proto"
output_dir="./generated/javascript"

rm -rf "$output_dir"
mkdir -p "$output_dir"

protoc --proto_path="$proto_dir" \
  --proto_path=./node_modules/rsocket-rpc-protobuf/proto \
  --proto_path=./node_modules/rsocket-rpc-protobuf/proto/rsocket \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-rsocket_rpc=node_modules/.bin/rsocket_rpc_js_protoc_plugin \
  --ts_out=./generated/javascript \
  --rsocket_rpc_out=./generated/javascript \
  --js_out=import_style=commonjs,binary:./generated/javascript \
  ./node_modules/rsocket-rpc-protobuf/proto/rsocket/*.proto \
  "$proto_dir"/*.proto

cp service_rsocket_pb.d.ts.template "$output_dir/service_rsocket_pb.d.ts"

rm "$output_dir/service_grpc_pb.d.ts"