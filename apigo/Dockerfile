# cache dependencies
FROM golang:1.14-alpine as cache

RUN adduser -D -g '' no-one
RUN apk update && apk add --no-cache git

WORKDIR /api

COPY go.mod .
COPY go.sum .

RUN go mod download

# build go binary
FROM cache as builder

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /go/bin/api

# final image
FROM scratch

COPY --from=builder /api/websockets.html /websockets.html
COPY --from=builder /go/bin/api /go/bin/api

ENTRYPOINT ["/go/bin/api"]