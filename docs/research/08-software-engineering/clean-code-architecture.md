# Clean Code & Architecture — Complete Reference

> Code is written once and read a thousand times. Clean code is not about style — it's about communication.

---

## Clean Code Principles

### Names Matter More Than Anything
```python
# Bad
def calc(a, b, c):
    return (a * b) / c

# Good
def calculate_monthly_payment(principal, annual_rate, months):
    monthly_rate = annual_rate / 12
    return (principal * monthly_rate) / (1 - (1 + monthly_rate) ** -months)

# Bad variable names
d = 86400  # what is d?
for i in range(len(lst)):  # what is lst? what is i?

# Good
SECONDS_PER_DAY = 86400
for user in active_users:
    send_reminder_email(user)

# Booleans should read like questions
is_authenticated = True
has_permission = False
should_retry = True

# Collections should be plural
users = [...]
order_items = [...]

# Functions should be verbs
get_user(id)
create_order(items)
send_notification(user, message)
is_valid_email(email)
```

### Functions: Small, Single Responsibility
```python
# Bad: one function doing everything
def process_order(order_id, user_id, payment_info):
    # Fetch order
    conn = get_db_connection()
    order = conn.execute(f"SELECT * FROM orders WHERE id={order_id}").fetchone()

    # Validate
    if order['total'] <= 0:
        raise ValueError("Order total must be positive")

    # Process payment
    result = requests.post('https://payment.api/charge', json={
        'amount': order['total'],
        'card': payment_info['card_number'],
        'cvv': payment_info['cvv']
    })

    # Update order
    conn.execute(f"UPDATE orders SET status='paid' WHERE id={order_id}")

    # Send email
    user = conn.execute(f"SELECT email FROM users WHERE id={user_id}").fetchone()
    send_email(user['email'], 'Order Confirmed', f'Order {order_id} confirmed')

    return {'status': 'success'}

# Good: small functions, each does one thing
def process_order(order_id: str, user_id: str, payment_info: PaymentInfo):
    order = get_order(order_id)
    validate_order(order)
    charge_result = charge_payment(order.total, payment_info)
    confirm_order(order_id, charge_result.transaction_id)
    notify_user_of_confirmation(user_id, order_id)
    return OrderConfirmation(order_id=order_id, transaction_id=charge_result.transaction_id)

# Each function is:
# - Testable independently
# - Replaceable (change payment provider? change charge_payment only)
# - Readable (function reads like a story)
```

### Comments: Explain Why, Not What
```python
# Bad comments
x = x + 1  # Increment x by 1

# Get user from database
user = db.get(user_id)

# Good comments: explain WHY
# Increment because the API is 1-indexed but our list is 0-indexed
api_page = internal_page + 1

# Cache for 5 minutes — this query is expensive (full table scan)
# and user preferences rarely change
@cache(ttl=300)
def get_user_preferences(user_id):
    ...

# HACK: The payment provider returns 200 even on errors.
# Check the response body for the actual status.
response = payment_api.charge(...)
if response.status_code == 200 and response.json().get('error'):
    raise PaymentError(response.json()['error'])

# TODO: Replace with async event emission once Event Bus is ready (ticket #1234)
notification_service.send_synchronously(notification)
```

### Error Handling
```python
# Bad: catch everything, lose information
try:
    result = process(data)
except Exception as e:
    print(f"Error: {e}")
    return None

# Good: catch specific exceptions, handle appropriately
def get_user(user_id: str) -> User:
    try:
        return db.users.get(user_id)
    except DatabaseConnectionError as e:
        logger.error("Database unreachable", exc_info=e, extra={"user_id": user_id})
        raise ServiceUnavailableError("Database temporarily unavailable") from e
    except RecordNotFoundError:
        raise UserNotFoundError(f"User {user_id} not found")

# Don't use exceptions for control flow
# Bad
def get_discount(user_id):
    try:
        return premium_discounts[user_id]
    except KeyError:
        return 0

# Good
def get_discount(user_id):
    return premium_discounts.get(user_id, 0)
```

---

## SOLID Principles

### Single Responsibility Principle
```python
# Violation: class responsible for data AND formatting AND persistence
class UserReport:
    def __init__(self, users):
        self.users = users

    def calculate_stats(self):
        return {'total': len(self.users), 'active': sum(1 for u in self.users if u.active)}

    def format_as_csv(self):
        return '\n'.join(f"{u.id},{u.name},{u.email}" for u in self.users)

    def save_to_file(self, path):
        with open(path, 'w') as f:
            f.write(self.format_as_csv())

    def send_by_email(self, to):
        # Send email with report...
        pass

# Better: each class has one reason to change
class UserStatsCalculator:
    def calculate(self, users: list[User]) -> UserStats:
        return UserStats(total=len(users), active=sum(1 for u in users if u.active))

class UserReportFormatter:
    def as_csv(self, users: list[User]) -> str:
        return '\n'.join(f"{u.id},{u.name},{u.email}" for u in users)

class ReportExporter:
    def to_file(self, content: str, path: str) -> None:
        Path(path).write_text(content)

    def by_email(self, content: str, to: str, subject: str) -> None:
        email_service.send(to=to, subject=subject, body=content)
```

### Open/Closed Principle
```python
# Violation: modify class every time you add a new discount type
class OrderCalculator:
    def calculate_discount(self, order: Order, user: User) -> Decimal:
        if user.type == "premium":
            return order.total * Decimal("0.20")
        elif user.type == "student":
            return order.total * Decimal("0.10")
        elif user.type == "employee":
            return order.total * Decimal("0.30")
        return Decimal("0")

# Better: open for extension, closed for modification
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, order: Order, user: User) -> Decimal:
        ...

class PremiumDiscount(DiscountStrategy):
    def calculate(self, order: Order, user: User) -> Decimal:
        return order.total * Decimal("0.20")

class StudentDiscount(DiscountStrategy):
    def calculate(self, order: Order, user: User) -> Decimal:
        return order.total * Decimal("0.10")

class OrderCalculator:
    def __init__(self, strategies: dict[str, DiscountStrategy]):
        self._strategies = strategies

    def calculate_discount(self, order: Order, user: User) -> Decimal:
        strategy = self._strategies.get(user.type, NoDiscount())
        return strategy.calculate(order, user)
# New discount type → just add new class, no modification
```

### Dependency Inversion Principle
```python
# Violation: high-level module depends on low-level detail
class UserService:
    def __init__(self):
        self.db = PostgresDatabase()  # Concrete dependency!
        self.emailer = SMTPEmailer()  # Concrete dependency!

    def register(self, email, password):
        self.db.insert("users", {"email": email, "password": hash(password)})
        self.emailer.send(email, "Welcome!")

# Better: depend on abstractions
from typing import Protocol

class UserRepository(Protocol):
    def save(self, user: User) -> None: ...
    def find_by_email(self, email: str) -> User | None: ...

class EmailService(Protocol):
    def send_welcome(self, email: str) -> None: ...

class UserService:
    def __init__(self, users: UserRepository, emailer: EmailService):
        self._users = users    # Abstractions, not concretions
        self._emailer = emailer

    def register(self, email: str, password: str) -> User:
        if self._users.find_by_email(email):
            raise EmailAlreadyExists(email)
        user = User(email=email, password_hash=hash_password(password))
        self._users.save(user)
        self._emailer.send_welcome(email)
        return user

# Now you can inject PostgresRepository in prod, InMemoryRepository in tests
```

---

## Software Architecture

### Layered Architecture
```
Presentation Layer:    HTTP handlers, CLI commands, GraphQL resolvers
    ↓ calls
Application Layer:     Use cases, orchestration, transactions
    ↓ calls
Domain Layer:          Business logic, entities, value objects, domain events
    ↑ uses (via interfaces)
Infrastructure Layer:  Databases, email, file storage, external APIs
```

```python
# Domain layer: pure business logic, no I/O
class Order:
    def __init__(self, id: str, items: list[OrderItem], status: OrderStatus):
        self.id = id
        self.items = items
        self.status = status
        self._events: list[DomainEvent] = []

    def place(self) -> None:
        if not self.items:
            raise EmptyOrderError("Cannot place empty order")
        if self.status != OrderStatus.DRAFT:
            raise InvalidOrderStateError(f"Cannot place order in {self.status} state")
        self.status = OrderStatus.PLACED
        self._events.append(OrderPlaced(order_id=self.id, total=self.total))

    @property
    def total(self) -> Decimal:
        return sum(item.price * item.quantity for item in self.items)

    def take_events(self) -> list[DomainEvent]:
        events = self._events.copy()
        self._events.clear()
        return events

# Application layer: orchestration
class PlaceOrderUseCase:
    def __init__(self, orders: OrderRepository, events: EventBus):
        self._orders = orders
        self._events = events

    def execute(self, order_id: str) -> None:
        order = self._orders.get(order_id)
        if not order:
            raise OrderNotFoundError(order_id)

        order.place()  # Domain logic here
        self._orders.save(order)

        for event in order.take_events():
            self._events.publish(event)  # Other services react to this

# Infrastructure layer: concrete implementations
class PostgresOrderRepository(OrderRepository):
    def get(self, order_id: str) -> Order | None:
        row = self._db.query("SELECT * FROM orders WHERE id = %s", [order_id])
        if not row:
            return None
        return self._deserialize(row)

    def save(self, order: Order) -> None:
        self._db.upsert("orders", self._serialize(order))
```

### Hexagonal Architecture (Ports and Adapters)
```
Core (Domain + Application) — no framework dependencies
    ↑ implements          ↑ implements
Ports (interfaces)      Input Ports (use cases)
    ↑ implements
Adapters (HTTP, DB, Queue, CLI, etc.)

Input Adapters (drive the application):
  HTTP Controller → PlaceOrderUseCase
  CLI Command → PlaceOrderUseCase
  Message Consumer → PlaceOrderUseCase

Output Adapters (driven by the application):
  OrderRepository → PostgresOrderRepository
  EventBus → KafkaEventBus
  EmailService → SMTPEmailService

Rule: The core knows nothing about adapters.
      Adapters depend on core, never the reverse.
```

### Clean Architecture (Uncle Bob)
```
Entities (innermost): Enterprise business rules
Use Cases:            Application business rules
Interface Adapters:   Presenters, Controllers, Gateways
Frameworks & Drivers: Web, DB, UI (outermost)

Dependency Rule: Always point INWARD.
Inner circles know nothing about outer circles.
```

---

## Design Smells and Refactoring

### Code Smells
```python
# Smell: Long method — break into smaller functions

# Smell: Large class — split responsibilities

# Smell: Feature Envy — method uses another class's data too much
class Order:
    def calculate_discount(self, customer):
        if customer.membership_years > 5:    # Accessing Customer too much
            return self.total * 0.2
        elif customer.membership_years > 2:
            return self.total * 0.1
        return 0
# Fix: move to Customer
class Customer:
    def get_discount_rate(self) -> Decimal:
        if self.membership_years > 5: return Decimal("0.2")
        if self.membership_years > 2: return Decimal("0.1")
        return Decimal("0")

# Smell: Primitive Obsession — use value objects
def create_user(email: str, age: int):  # What's a valid email? What's valid age?
    if not "@" in email: raise ValueError("...")
    if age < 0 or age > 150: raise ValueError("...")
    ...

class Email:
    def __init__(self, value: str):
        if not self._is_valid(value):
            raise ValueError(f"Invalid email: {value}")
        self.value = value

    def _is_valid(self, email: str) -> bool:
        return bool(re.match(r'^[^@]+@[^@]+\.[^@]+$', email))

class Age:
    def __init__(self, value: int):
        if not 0 <= value <= 150:
            raise ValueError(f"Invalid age: {value}")
        self.value = value

# Smell: Data Clumps — groups of data that appear together
def calculate_distance(x1, y1, x2, y2):  # These always go together
    ...

@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance_to(self, other: 'Point') -> float:
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)

# Smell: Shotgun Surgery — one change requires many small changes
# Fix: consolidate related behavior

# Smell: Divergent Change — class changes for different reasons
# Fix: split the class
```

---

## Documentation as Code

### Architecture Decision Records (ADR)
```markdown
# ADR 001: Use PostgreSQL as primary database

## Status
Accepted — 2024-01-15

## Context
We need a primary data store for the application. Requirements:
- ACID transactions
- Complex queries (reporting, analytics)
- Team familiarity

## Decision
Use PostgreSQL 15 as the primary database.

## Consequences
+ Full ACID compliance
+ Rich query capabilities (window functions, CTEs, JSON)
+ Mature ecosystem
- Single point of failure until replication is set up
- Requires migration management (Alembic)

## Alternatives Considered
- MySQL: Similar capabilities but less standard SQL compliance
- MongoDB: Flexible schema but no joins needed in our case
- SQLite: Not suitable for production concurrency
```

---

*Clean code is an act of respect — for your teammates, your future self, and the craft. Every line you write is a communication, not just an instruction to a machine.*
