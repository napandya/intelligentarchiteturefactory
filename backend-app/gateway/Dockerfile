FROM golang:1.21-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o /gateway ./cmd/gateway

FROM alpine:3.20
RUN adduser -D app
USER app
COPY --from=build /gateway /gateway
EXPOSE 8090
ENTRYPOINT ["/gateway"]
