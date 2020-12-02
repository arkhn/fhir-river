# cache dependencies
FROM golang:1.15-buster as cache

WORKDIR /build

COPY ./api/go.mod .
COPY ./api/go.sum .

RUN go mod download

# build go binary
FROM cache as builder

COPY ./api .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build  -o /go/bin/api

WORKDIR /dist
RUN cp /go/bin/api ./api
RUN cp /build/routes/websockets/websockets.html ./websockets.html

# final image
FROM scratch

# we need this since the binary has a dependency to C libraries (librdkafka)
COPY --from=builder /lib /lib
COPY --from=builder /lib64 /lib64

COPY --from=builder /build/routes/websockets/websockets.html /websockets.html
COPY --from=builder /go/bin/api /go/bin/api

ENTRYPOINT ["/go/bin/api"]
