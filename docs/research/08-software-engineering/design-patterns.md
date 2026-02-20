# Design Patterns — Complete Reference

> Patterns are vocabulary for solutions. Knowing them lets you communicate architecture in one word and recognize solutions you've seen before.

---

## Creational Patterns

### Singleton
Ensure only one instance of a class exists.

```python
class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:  # Double-checked locking
                    cls._instance = super().__new__(cls)
        return cls._instance

# Better in Python: module-level state IS singleton
# config.py
_config = {}
def get():   return _config
def set(k, v): _config[k] = v
```

**When to use:** Database connections, config managers, logging.
**When NOT to use:** Makes testing harder, global state is often a code smell.

### Factory Method
Define interface for creating objects; let subclasses decide what to create.

```python
from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...

class WindowsButton(Button):
    def render(self): return "<windows-button>"

class MacButton(Button):
    def render(self): return "<mac-button>"

class Dialog(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...  # Factory Method

    def render(self):
        button = self.create_button()
        return f"Dialog: {button.render()}"

class WindowsDialog(Dialog):
    def create_button(self): return WindowsButton()

class MacDialog(Dialog):
    def create_button(self): return MacButton()
```

### Abstract Factory
Create families of related objects without specifying concrete classes.

```python
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...
    @abstractmethod
    def create_checkbox(self) -> Checkbox: ...

class WindowsFactory(UIFactory):
    def create_button(self): return WindowsButton()
    def create_checkbox(self): return WindowsCheckbox()

class MacFactory(UIFactory):
    def create_button(self): return MacButton()
    def create_checkbox(self): return MacCheckbox()

# Client code works with factory, not concrete classes
def build_ui(factory: UIFactory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    button.render()
    checkbox.render()
```

### Builder
Construct complex objects step by step.

```python
from dataclasses import dataclass

@dataclass
class QueryBuilder:
    _table: str = ""
    _conditions: list = None
    _columns: list = None
    _limit: int = None
    _offset: int = None

    def __post_init__(self):
        self._conditions = []
        self._columns = []

    def from_table(self, table: str) -> 'QueryBuilder':
        self._table = table
        return self  # Return self for chaining

    def select(self, *columns) -> 'QueryBuilder':
        self._columns.extend(columns)
        return self

    def where(self, condition: str) -> 'QueryBuilder':
        self._conditions.append(condition)
        return self

    def limit(self, n: int) -> 'QueryBuilder':
        self._limit = n
        return self

    def build(self) -> str:
        cols = ", ".join(self._columns) if self._columns else "*"
        sql = f"SELECT {cols} FROM {self._table}"
        if self._conditions:
            sql += " WHERE " + " AND ".join(self._conditions)
        if self._limit:
            sql += f" LIMIT {self._limit}"
        return sql

# Fluent interface (method chaining)
query = (QueryBuilder()
    .from_table("users")
    .select("id", "name", "email")
    .where("is_active = true")
    .where("age >= 18")
    .limit(10)
    .build())
```

### Prototype
Clone existing objects without coupling to their classes.

```python
import copy

class Shape:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def clone(self):
        return copy.deepcopy(self)

circle = Circle(0, 0, radius=5)
circle_copy = circle.clone()
```

---

## Structural Patterns

### Adapter
Make incompatible interfaces work together.

```python
class OldAPI:
    def get_json_data(self) -> str:
        return '{"key": "value"}'

class NewAPI:
    def get_data(self) -> dict: ...  # Expected interface

class APIAdapter(NewAPI):
    def __init__(self, old_api: OldAPI):
        self.old_api = old_api

    def get_data(self) -> dict:
        json_str = self.old_api.get_json_data()
        return json.loads(json_str)

# Use old API with new interface
client = APIAdapter(OldAPI())
data = client.get_data()  # dict
```

### Decorator
Attach additional behaviors to objects dynamically (NOT the Python decorator syntax — different concept).

```python
class Coffee:
    def cost(self): return 5
    def description(self): return "Coffee"

class MilkDecorator:
    def __init__(self, coffee):
        self._coffee = coffee
    def cost(self): return self._coffee.cost() + 2
    def description(self): return self._coffee.description() + ", Milk"

class SugarDecorator:
    def __init__(self, coffee):
        self._coffee = coffee
    def cost(self): return self._coffee.cost() + 1
    def description(self): return self._coffee.description() + ", Sugar"

# Compose
fancy_coffee = SugarDecorator(MilkDecorator(Coffee()))
fancy_coffee.cost()         # 8
fancy_coffee.description()  # "Coffee, Milk, Sugar"
```

### Facade
Provide simplified interface to complex subsystem.

```python
class OrderFacade:
    """Simplifies complex order processing behind a single interface."""

    def __init__(self):
        self.inventory = InventoryService()
        self.payment = PaymentService()
        self.shipping = ShippingService()
        self.email = EmailService()

    def place_order(self, user_id: int, items: list, payment_info: dict) -> Order:
        # Complex orchestration hidden from client
        reserved = self.inventory.reserve(items)
        try:
            payment = self.payment.charge(user_id, payment_info, reserved.total)
            shipment = self.shipping.schedule(user_id, reserved)
            order = Order(reserved, payment, shipment)
            self.email.send_confirmation(user_id, order)
            return order
        except Exception:
            self.inventory.release(reserved)
            raise
```

### Proxy
Provide a surrogate or placeholder for another object.

```python
class ExpensiveObject:
    def operation(self):
        # Very expensive initialization
        return "result"

class LazyProxy:
    """Lazy initialization proxy."""
    def __init__(self):
        self._real = None

    def operation(self):
        if self._real is None:
            self._real = ExpensiveObject()  # Create only when needed
        return self._real.operation()

class LoggingProxy:
    """Logging proxy."""
    def __init__(self, real):
        self._real = real

    def operation(self):
        logging.info(f"Calling operation on {type(self._real).__name__}")
        result = self._real.operation()
        logging.info(f"operation returned {result!r}")
        return result

class CachingProxy:
    """Caching proxy."""
    def __init__(self, real):
        self._real = real
        self._cache = {}

    def get(self, key: str):
        if key not in self._cache:
            self._cache[key] = self._real.get(key)
        return self._cache[key]
```

### Composite
Treat individual objects and compositions uniformly.

```python
from abc import ABC, abstractmethod

class FileSystemItem(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def size(self) -> int: ...

class File(FileSystemItem):
    def __init__(self, name: str, size: int):
        super().__init__(name)
        self._size = size

    def size(self) -> int:
        return self._size

class Directory(FileSystemItem):
    def __init__(self, name: str):
        super().__init__(name)
        self._children: list[FileSystemItem] = []

    def add(self, item: FileSystemItem):
        self._children.append(item)

    def size(self) -> int:
        return sum(child.size() for child in self._children)

# Build tree
root = Directory("root")
docs = Directory("docs")
docs.add(File("readme.md", 1024))
docs.add(File("guide.pdf", 5120))
root.add(docs)
root.add(File("config.json", 256))
root.size()  # 1024 + 5120 + 256 = 6400
```

---

## Behavioral Patterns

### Observer (Event System)
Define one-to-many dependency so when one object changes state, all dependents are notified.

```python
from typing import Callable, Any

class EventEmitter:
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = {}

    def on(self, event: str, handler: Callable) -> None:
        self._handlers.setdefault(event, []).append(handler)

    def off(self, event: str, handler: Callable) -> None:
        if event in self._handlers:
            self._handlers[event].remove(handler)

    def emit(self, event: str, *args, **kwargs) -> None:
        for handler in self._handlers.get(event, []):
            handler(*args, **kwargs)

# Usage
store = EventEmitter()
store.on("change", lambda data: print(f"Data changed: {data}"))
store.on("error", lambda err: logging.error(err))
store.emit("change", {"user": "alice", "field": "email"})
```

### Strategy
Define a family of algorithms, encapsulate each, and make them interchangeable.

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list: ...

class QuickSort(SortStrategy):
    def sort(self, data: list) -> list:
        if len(data) <= 1: return data
        pivot = data[len(data)//2]
        left = [x for x in data if x < pivot]
        mid = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + mid + self.sort(right)

class MergeSort(SortStrategy):
    def sort(self, data: list) -> list:
        if len(data) <= 1: return data
        mid = len(data) // 2
        left = self.sort(data[:mid])
        right = self.sort(data[mid:])
        return self._merge(left, right)

    def _merge(self, left, right):
        result = []
        while left and right:
            if left[0] <= right[0]: result.append(left.pop(0))
            else: result.append(right.pop(0))
        return result + left + right

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy):
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)
```

### Command
Encapsulate a request as an object (enables queuing, undo/redo).

```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self): ...
    @abstractmethod
    def undo(self): ...

class TextEditor:
    def __init__(self):
        self.text = ""
        self._history: list[Command] = []

    def execute(self, command: Command):
        command.execute()
        self._history.append(command)

    def undo(self):
        if self._history:
            self._history.pop().undo()

class InsertCommand(Command):
    def __init__(self, editor: TextEditor, text: str, position: int):
        self.editor = editor
        self.text = text
        self.position = position

    def execute(self):
        t = self.editor.text
        self.editor.text = t[:self.position] + self.text + t[self.position:]

    def undo(self):
        t = self.editor.text
        end = self.position + len(self.text)
        self.editor.text = t[:self.position] + t[end:]
```

### Template Method
Define skeleton of algorithm in base class; let subclasses fill in steps.

```python
class DataProcessor(ABC):
    def process(self, data):  # Template method
        data = self.read_data(data)
        data = self.validate(data)
        data = self.transform(data)
        self.write_output(data)

    @abstractmethod
    def read_data(self, source): ...

    def validate(self, data):  # Hook with default implementation
        return data  # Subclasses can override

    @abstractmethod
    def transform(self, data): ...

    @abstractmethod
    def write_output(self, data): ...

class CSVProcessor(DataProcessor):
    def read_data(self, source):
        return pd.read_csv(source)

    def transform(self, data):
        return data.dropna().reset_index(drop=True)

    def write_output(self, data):
        data.to_parquet("output.parquet")
```

### State
Allow object to alter its behavior when its internal state changes.

```python
class OrderState(ABC):
    @abstractmethod
    def cancel(self, order: 'Order'): ...
    @abstractmethod
    def ship(self, order: 'Order'): ...
    @abstractmethod
    def deliver(self, order: 'Order'): ...

class PendingState(OrderState):
    def cancel(self, order):
        order.state = CancelledState()
    def ship(self, order):
        order.state = ShippedState()
    def deliver(self, order):
        raise ValueError("Can't deliver pending order")

class ShippedState(OrderState):
    def cancel(self, order):
        raise ValueError("Can't cancel shipped order")
    def ship(self, order):
        raise ValueError("Already shipped")
    def deliver(self, order):
        order.state = DeliveredState()

class Order:
    def __init__(self):
        self.state: OrderState = PendingState()

    def cancel(self): self.state.cancel(self)
    def ship(self):   self.state.ship(self)
    def deliver(self): self.state.deliver(self)
```

### Chain of Responsibility
Pass request along chain of handlers until one handles it.

```python
class Handler(ABC):
    def __init__(self, successor=None):
        self._successor = successor

    @abstractmethod
    def handle(self, request): ...

class AuthHandler(Handler):
    def handle(self, request):
        if not request.is_authenticated:
            return Response(401, "Unauthorized")
        return self._successor.handle(request) if self._successor else None

class RateLimitHandler(Handler):
    def handle(self, request):
        if self.is_rate_limited(request.user_id):
            return Response(429, "Too Many Requests")
        return self._successor.handle(request) if self._successor else None

class RequestHandler(Handler):
    def handle(self, request):
        return process_request(request)

# Build chain
chain = AuthHandler(RateLimitHandler(RequestHandler()))
response = chain.handle(request)
```

---

## Architectural Patterns

### Repository
Abstract data access behind a consistent interface.

```python
from abc import ABC, abstractmethod

class UserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]: ...
    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]: ...
    @abstractmethod
    def save(self, user: User) -> User: ...
    @abstractmethod
    def delete(self, user_id: int) -> None: ...

class PostgresUserRepository(UserRepository):
    def __init__(self, db):
        self.db = db

    def find_by_id(self, user_id: int) -> Optional[User]:
        row = self.db.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        return User.from_row(row) if row else None

    def find_by_email(self, email: str) -> Optional[User]:
        ...

class InMemoryUserRepository(UserRepository):
    """For testing."""
    def __init__(self):
        self._users: dict[int, User] = {}

    def find_by_id(self, user_id: int) -> Optional[User]:
        return self._users.get(user_id)

    def save(self, user: User) -> User:
        self._users[user.id] = user
        return user
```

### CQRS (Command Query Responsibility Segregation)
Separate read (query) and write (command) operations.

```
Commands: CreateUser, UpdateEmail, DeleteAccount
  → Writes to write model (normalized, relational)
  → Emits events

Queries: GetUser, ListUsers, UserStats
  → Reads from read model (denormalized, optimized for reads)
  → Updated by event handlers from commands

Benefits:
- Scale reads and writes independently
- Optimize read model for each query type
- Event sourcing natural fit

Trade-offs:
- Eventual consistency (read model lags)
- More complex infrastructure
```

### Event Sourcing
Store state as sequence of events rather than current state.

```python
@dataclass
class Event:
    id: str
    aggregate_id: str
    event_type: str
    data: dict
    timestamp: datetime

class OrderAggregate:
    def __init__(self, order_id: str):
        self.id = order_id
        self.status = "new"
        self.items = []
        self._events: list[Event] = []

    def add_item(self, product_id: str, quantity: int):
        event = Event(
            id=uuid4(),
            aggregate_id=self.id,
            event_type="item_added",
            data={"product_id": product_id, "quantity": quantity},
            timestamp=datetime.now()
        )
        self._apply(event)
        self._events.append(event)

    def _apply(self, event: Event):
        if event.event_type == "item_added":
            self.items.append(event.data)
        elif event.event_type == "order_placed":
            self.status = "placed"
        elif event.event_type == "order_shipped":
            self.status = "shipped"

    @classmethod
    def from_events(cls, order_id: str, events: list[Event]) -> 'OrderAggregate':
        order = cls(order_id)
        for event in events:
            order._apply(event)
        return order

    def uncommitted_events(self) -> list[Event]:
        return self._events
```

---

*Patterns are not rigid formulas — they're starting points for conversations about design. Know when to apply them and when not to.*
