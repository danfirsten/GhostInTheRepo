# APIs — Complete Reference

> APIs are the contracts between systems. Design them well and your system can evolve. Design them poorly and you inherit technical debt forever.

---

## REST API Design

### Principles
```
REST (Representational State Transfer) constraints:
1. Client-Server: separation of concerns
2. Stateless: no client state on server (JWT, not sessions)
3. Cacheable: responses should indicate cacheability
4. Uniform Interface: consistent resource naming and operations
5. Layered System: client doesn't know about intermediaries
6. Code on Demand (optional): server can send executable code

Resource-based URLs (nouns, not verbs):
  GET    /users           → list users
  POST   /users           → create user
  GET    /users/123       → get user 123
  PUT    /users/123       → replace user 123 completely
  PATCH  /users/123       → partial update user 123
  DELETE /users/123       → delete user 123

  GET    /users/123/orders       → user's orders
  POST   /users/123/orders       → create order for user 123
  GET    /users/123/orders/456   → specific order

Relationships:
  GET /users/123/followers       → users who follow user 123
  POST /users/123/follow         → follow user 123
  DELETE /users/123/follow       → unfollow user 123
```

### Response Design
```json
// Success (list)
{
  "data": [
    { "id": "usr_123", "name": "Alice", "email": "alice@example.com" }
  ],
  "meta": {
    "total": 1547,
    "page": 1,
    "per_page": 20,
    "pages": 78
  },
  "links": {
    "self": "https://api.example.com/users?page=1",
    "next": "https://api.example.com/users?page=2",
    "last": "https://api.example.com/users?page=78"
  }
}

// Success (single resource)
{
  "data": {
    "id": "usr_123",
    "type": "user",
    "attributes": {
      "name": "Alice",
      "email": "alice@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "organization": { "data": { "type": "organization", "id": "org_456" } }
    }
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "age", "message": "Must be at least 18" }
    ],
    "request_id": "req_abc123",
    "docs_url": "https://docs.example.com/errors/VALIDATION_ERROR"
  }
}
```

### HTTP Status Codes for APIs
```
2xx Success:
  200 OK              — GET, PUT, PATCH success
  201 Created         — POST success (include Location header)
  204 No Content      — DELETE success, or update with no response body
  206 Partial Content — Paginated or range response

3xx Redirection:
  301 Moved Permanently  — Permanent redirect (update bookmarks)
  302 Found              — Temporary redirect
  304 Not Modified       — Cached response is still valid (ETag/Last-Modified)

4xx Client Errors:
  400 Bad Request      — Malformed request, validation errors
  401 Unauthorized     — Authentication required/failed
  403 Forbidden        — Authenticated but not authorized
  404 Not Found        — Resource doesn't exist
  405 Method Not Allowed
  409 Conflict         — Resource state conflict (duplicate, version mismatch)
  410 Gone             — Resource permanently deleted
  422 Unprocessable    — Request valid but business logic rejection
  429 Too Many Requests — Rate limited

5xx Server Errors:
  500 Internal Server Error — Unexpected server failure
  502 Bad Gateway           — Upstream service error
  503 Service Unavailable   — Down for maintenance or overloaded
  504 Gateway Timeout       — Upstream service timed out
```

### Versioning Strategies
```
URL versioning (most common, very explicit):
  https://api.example.com/v1/users
  https://api.example.com/v2/users

Header versioning (cleaner URLs):
  Accept: application/vnd.example.v2+json

Query parameter (least preferred):
  https://api.example.com/users?version=2

Deprecation process:
  1. Announce deprecation with timeline
  2. Add Deprecation header: Deprecation: Sat, 1 Jan 2025 00:00:00 GMT
  3. Add Sunset header: Sunset: Sat, 1 Jan 2025 00:00:00 GMT
  4. Add Link header pointing to newer version
  5. After sunset date: 410 Gone
```

---

## REST API with FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends, Query, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

app = FastAPI(
    title="My API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    age: Optional[int] = Field(None, ge=18, le=120)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedUsers(BaseModel):
    data: List[UserResponse]
    total: int
    page: int
    per_page: int

# Routes
@app.get("/v1/users", response_model=PaginatedUsers)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db=Depends(get_db)
):
    offset = (page - 1) * per_page
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    total = query.count()
    users = query.offset(offset).limit(per_page).all()
    return PaginatedUsers(data=users, total=total, page=page, per_page=per_page)

@app.post("/v1/users", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    db=Depends(get_db)
):
    # Check duplicate
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(id=str(uuid.uuid4()), **user_data.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.get("/v1/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str = Path(..., description="User ID"),
    db=Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.patch("/v1/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    db=Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@app.delete("/v1/users/{user_id}", status_code=204)
async def delete_user(user_id: str, db=Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
```

---

## GraphQL

### Core Concepts
```graphql
# Schema definition
type Query {
    user(id: ID!): User
    users(filter: UserFilter, first: Int, after: String): UserConnection!
    posts(authorId: ID): [Post!]!
}

type Mutation {
    createUser(input: CreateUserInput!): CreateUserPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
}

type Subscription {
    messageAdded(chatId: ID!): Message!
}

type User {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
    posts(first: Int, after: String): PostConnection!
    followers: [User!]!
}

type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
    tags: [String!]!
    createdAt: DateTime!
}

# Pagination (Relay-style)
type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
}
type UserEdge {
    node: User!
    cursor: String!
}
type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
}

input CreateUserInput {
    name: String!
    email: String!
}

type CreateUserPayload {
    user: User
    errors: [UserError!]!
}

type UserError {
    field: String!
    message: String!
}
```

### GraphQL Queries
```graphql
# Query with variables
query GetUser($id: ID!, $postsFirst: Int = 10) {
    user(id: $id) {
        id
        name
        email
        posts(first: $postsFirst) {
            edges {
                node {
                    id
                    title
                    createdAt
                }
                cursor
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
}

# Variables:
# { "id": "usr_123", "postsFirst": 5 }

# Fragments (reusable field sets)
fragment UserBasicInfo on User {
    id
    name
    email
}

query GetUsers {
    alice: user(id: "1") { ...UserBasicInfo }
    bob: user(id: "2") { ...UserBasicInfo }
}

# Mutation
mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
        post {
            id
            title
        }
        errors {
            field
            message
        }
    }
}
```

### The N+1 Problem and DataLoader
```javascript
// Problem: for each user, query their posts → N+1 database queries
// Query: list 100 users → 100 separate "get posts for user X" queries

// Solution: DataLoader (batching + caching)
const DataLoader = require('dataloader');

// Batch function: receive array of keys, return array of values (same order)
const userLoader = new DataLoader(async (userIds) => {
    const users = await db.query(
        'SELECT * FROM users WHERE id = ANY($1)',
        [userIds]
    );
    // Map back to same order as input keys
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return userIds.map(id => userMap[id] || null);
});

// In resolver:
async function postAuthor(post) {
    return userLoader.load(post.author_id);  // Batched automatically!
}

// DataLoader batches all loads that happen in same tick:
// 100 calls to userLoader.load(id) → 1 SQL query with all 100 IDs
```

---

## gRPC

### Protocol Buffers (protobuf)
```protobuf
// user.proto
syntax = "proto3";
package user;
option go_package = "./proto/user";

import "google/protobuf/timestamp.proto";

service UserService {
    rpc GetUser(GetUserRequest) returns (User);
    rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
    rpc CreateUser(CreateUserRequest) returns (User);
    rpc UpdateUser(UpdateUserRequest) returns (User);
    rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);

    // Server streaming (server sends multiple responses)
    rpc WatchUsers(WatchUsersRequest) returns (stream User);

    // Client streaming (client sends multiple requests)
    rpc BatchCreateUsers(stream CreateUserRequest) returns (BatchCreateResponse);

    // Bidirectional streaming
    rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message User {
    string id = 1;
    string name = 2;
    string email = 3;
    google.protobuf.Timestamp created_at = 4;
    UserStatus status = 5;
    repeated string tags = 6;   // Repeated = array
}

enum UserStatus {
    USER_STATUS_UNSPECIFIED = 0;
    USER_STATUS_ACTIVE = 1;
    USER_STATUS_INACTIVE = 2;
}

message GetUserRequest {
    string user_id = 1;
}

message ListUsersRequest {
    int32 page = 1;
    int32 page_size = 2;
    string search_query = 3;
}
```

### gRPC Server (Go)
```go
package main

import (
    "context"
    "net"
    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
    pb "myapp/proto/user"
)

type UserServer struct {
    pb.UnimplementedUserServiceServer
    db *DB
}

func (s *UserServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.GetUser(ctx, req.UserId)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            return nil, status.Errorf(codes.NotFound, "user %s not found", req.UserId)
        }
        return nil, status.Errorf(codes.Internal, "internal error: %v", err)
    }
    return userToProto(user), nil
}

func main() {
    lis, _ := net.Listen("tcp", ":50051")
    s := grpc.NewServer(
        grpc.UnaryInterceptor(loggingInterceptor),
    )
    pb.RegisterUserServiceServer(s, &UserServer{})
    s.Serve(lis)
}

// Interceptor (middleware)
func loggingInterceptor(ctx context.Context, req interface{},
    info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {

    start := time.Now()
    resp, err := handler(ctx, req)
    log.Printf("%s took %v err=%v", info.FullMethod, time.Since(start), err)
    return resp, err
}
```

### When to Use Each
```
REST:
  ✓ Public APIs (widely understood)
  ✓ Simple CRUD operations
  ✓ Browser clients
  ✓ Caching is important (HTTP cache headers work)

GraphQL:
  ✓ Flexible data requirements (mobile + web + 3rd party)
  ✓ Aggregating data from multiple services
  ✓ Rapid frontend iteration (add fields without backend changes)
  ✗ Caching is harder
  ✗ File uploads are awkward
  ✗ N+1 problem requires careful attention

gRPC:
  ✓ Internal microservice communication
  ✓ High performance (binary protocol, HTTP/2)
  ✓ Streaming (bidirectional)
  ✓ Strong contracts (protobuf)
  ✓ Polyglot services (generate clients in any language)
  ✗ No browser support without grpc-web proxy
  ✗ Less human-readable (binary)
```

---

## API Security

### Authentication
```python
# JWT Bearer token
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-256-bit-secret"

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# API key authentication
async def verify_api_key(api_key: str = Header(..., alias="X-API-Key")):
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    if not await db.api_keys.find_one({"hash": key_hash}):
        raise HTTPException(401, "Invalid API key")
```

### Rate Limiting
```python
from fastapi import Request
import redis.asyncio as redis

class RateLimiter:
    def __init__(self, redis_client, limit: int, window: int):
        self.redis = redis_client
        self.limit = limit     # Max requests
        self.window = window   # Window in seconds

    async def is_allowed(self, key: str) -> tuple[bool, dict]:
        pipe = self.redis.pipeline()
        now = time.time()
        window_start = now - self.window

        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, self.window)
        _, _, count, _ = await pipe.execute()

        remaining = max(0, self.limit - count)
        allowed = count <= self.limit
        return allowed, {
            "X-RateLimit-Limit": self.limit,
            "X-RateLimit-Remaining": remaining,
            "X-RateLimit-Reset": int(now + self.window)
        }
```

---

*APIs are the public face of your system. A well-designed API is a delight to use. A poorly designed API is a burden that outlasts all the original engineers.*
