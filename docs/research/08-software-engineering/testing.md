# Testing — Complete Reference

> Tests are your safety net, your documentation, and your design feedback loop. Code without tests is legacy code the moment it's written.

---

## Testing Philosophy

### The Testing Pyramid
```
         /\
        /E2E\           Few: slow, brittle, expensive
       /------\         but give highest confidence
      / Integr-\
     / ation    \       Medium: test real integrations
    /------------\      databases, HTTP, queues
   / Unit Tests   \
  /----------------\    Many: fast, cheap, reliable
                         pure logic, algorithms, transforms

Rule of thumb:
  70% unit, 20% integration, 10% E2E

Test types:
  Unit:        Test one function/class in isolation (mock dependencies)
  Integration: Test real interactions (DB, HTTP, filesystem)
  Contract:    Verify service interfaces match expectations (Pact)
  E2E:         Full user journey through real browser/system
  Performance: Load, stress, spike testing
  Mutation:    Verify tests actually catch bugs (mutmut, Stryker)
```

### Good Tests
```
FIRST principles:
  Fast:        Run in milliseconds
  Independent: No shared state between tests
  Repeatable:  Same result every time, every environment
  Self-validating: Clear pass/fail, no manual inspection
  Timely:      Written before or alongside code

AAA pattern:
  Arrange: Set up test data and mocks
  Act:     Call the function under test
  Assert:  Verify expected outcome

One assertion per test (or at least one concept per test)
Descriptive names: "should return 404 when user not found"
Don't test implementation details — test behavior
```

---

## Python Testing (pytest)

### Unit Tests
```python
# test_calculator.py
import pytest
from calculator import Calculator, DivisionByZeroError

class TestCalculator:
    def setup_method(self):
        """Run before each test method."""
        self.calc = Calculator()

    def test_add_positive_numbers(self):
        result = self.calc.add(3, 5)
        assert result == 8

    def test_add_negative_numbers(self):
        result = self.calc.add(-3, -5)
        assert result == -8

    def test_add_zero(self):
        assert self.calc.add(0, 5) == 5
        assert self.calc.add(5, 0) == 5

    def test_divide_raises_on_zero(self):
        with pytest.raises(DivisionByZeroError, match="Cannot divide by zero"):
            self.calc.divide(10, 0)

    def test_divide_returns_float(self):
        result = self.calc.divide(7, 2)
        assert result == pytest.approx(3.5)

# Parametrize: run same test with multiple inputs
@pytest.mark.parametrize("a,b,expected", [
    (3, 5, 8),
    (-3, -5, -8),
    (0, 0, 0),
    (100, -50, 50),
    (1.5, 2.5, 4.0),
])
def test_add_parametrized(a, b, expected):
    calc = Calculator()
    assert calc.add(a, b) == expected

# Fixtures
@pytest.fixture
def sample_user():
    return {"id": "usr_123", "name": "Alice", "email": "alice@example.com"}

@pytest.fixture
def authenticated_client(sample_user):
    """Fixture can depend on other fixtures."""
    client = TestClient(app)
    token = create_test_token(sample_user["id"])
    client.headers["Authorization"] = f"Bearer {token}"
    return client

# Scope: function (default), class, module, session
@pytest.fixture(scope="module")
def db_connection():
    conn = create_db_connection()
    yield conn  # Teardown runs after 'yield'
    conn.close()

# Skip and xfail
@pytest.mark.skip(reason="Feature not implemented yet")
def test_future_feature():
    pass

@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug():
    assert some_broken_function() == "expected"

@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_feature():
    pass
```

### Mocking
```python
from unittest.mock import Mock, MagicMock, patch, AsyncMock, call

# Basic mock
def test_send_email():
    email_service = Mock()
    user_service = UserService(email_service=email_service)

    user_service.register(email="alice@example.com", name="Alice")

    # Verify call
    email_service.send_welcome_email.assert_called_once_with(
        to="alice@example.com",
        name="Alice"
    )

# patch decorator
@patch('mymodule.requests.get')
def test_fetch_user(mock_get):
    mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}
    mock_get.return_value.status_code = 200

    result = fetch_user(1)
    assert result["name"] == "Alice"
    mock_get.assert_called_once_with("https://api.example.com/users/1")

# Context manager patch
def test_file_processing():
    mock_content = "line1\nline2\nline3"
    with patch("builtins.open", mock_open(read_data=mock_content)):
        result = count_lines("anyfile.txt")
    assert result == 3

# Async mock
@pytest.mark.asyncio
async def test_async_function():
    mock_client = AsyncMock()
    mock_client.get.return_value = {"status": "ok"}

    result = await process_with_client(mock_client)
    assert result == "ok"

# Side effects
def test_retry_on_failure():
    service = Mock()
    service.call.side_effect = [
        ConnectionError("timeout"),  # First call fails
        ConnectionError("timeout"),  # Second call fails
        {"data": "success"},         # Third call succeeds
    ]

    result = retry(service.call, max_attempts=3)
    assert result == {"data": "success"}
    assert service.call.call_count == 3

# Spy (real implementation + tracking)
from unittest.mock import spy_open
# Or use MagicMock wrapping the real class
class TestWithSpy:
    def test_calls_real_method(self):
        real_service = RealService()
        with patch.object(real_service, 'method', wraps=real_service.method) as spy:
            real_service.method(42)
            spy.assert_called_once_with(42)
```

### Integration Tests
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database integration tests
@pytest.fixture(scope="session")
def engine():
    return create_engine("postgresql://test:test@localhost/testdb")

@pytest.fixture(scope="function")
def db_session(engine):
    """Fresh transaction per test, rolled back at end."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()  # Clean up — no test data persists
    connection.close()

def test_create_user(db_session):
    user = User(name="Alice", email="alice@example.com")
    db_session.add(user)
    db_session.flush()  # Write to DB in transaction

    fetched = db_session.query(User).filter_by(email="alice@example.com").first()
    assert fetched is not None
    assert fetched.name == "Alice"

# HTTP integration tests (FastAPI)
from fastapi.testclient import TestClient

@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

def test_create_user_api(client):
    response = client.post("/v1/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "Alice"
    assert "id" in data["data"]

def test_get_nonexistent_user(client):
    response = client.get("/v1/users/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
```

---

## JavaScript/TypeScript Testing (Vitest/Jest)

### Unit Tests
```typescript
// calculator.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calculator } from './calculator';

describe('Calculator', () => {
    let calc: Calculator;

    beforeEach(() => {
        calc = new Calculator();
    });

    describe('add', () => {
        it('adds two positive numbers', () => {
            expect(calc.add(3, 5)).toBe(8);
        });

        it('handles negative numbers', () => {
            expect(calc.add(-3, -5)).toBe(-8);
        });
    });

    describe('divide', () => {
        it('throws on division by zero', () => {
            expect(() => calc.divide(10, 0)).toThrow('Division by zero');
        });

        it('returns correct result', () => {
            expect(calc.divide(10, 4)).toBeCloseTo(2.5);
        });
    });
});

// Test table with it.each
it.each([
    [3, 5, 8],
    [-3, -5, -8],
    [0, 0, 0],
] as const)('add(%i, %i) = %i', (a, b, expected) => {
    expect(new Calculator().add(a, b)).toBe(expected);
});
```

### Mocking in Vitest/Jest
```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock module
vi.mock('./emailService', () => ({
    sendEmail: vi.fn().mockResolvedValue({ success: true })
}));

import { sendEmail } from './emailService';
import { registerUser } from './userService';

describe('registerUser', () => {
    it('sends welcome email on registration', async () => {
        await registerUser({ name: 'Alice', email: 'alice@example.com' });

        expect(sendEmail).toHaveBeenCalledWith({
            to: 'alice@example.com',
            subject: 'Welcome to our app!',
            template: 'welcome',
            data: { name: 'Alice' }
        });
    });

    afterEach(() => vi.clearAllMocks());
});

// Spy on object method
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Timer mocks
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-15'));
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.useRealTimers();

// Fetch mock
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Alice' })
});
```

### React Testing Library
```typescript
import { render, screen, fireEvent, waitFor, userEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
    const mockOnLogin = vi.fn();

    beforeEach(() => {
        render(
            <MemoryRouter>
                <LoginForm onLogin={mockOnLogin} />
            </MemoryRouter>
        );
    });

    it('renders email and password fields', () => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('shows error for empty submission', async () => {
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    });

    it('calls onLogin with credentials on valid submission', async () => {
        const user = userEvent.setup();
        await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockOnLogin).toHaveBeenCalledWith({
                email: 'alice@example.com',
                password: 'password123'
            });
        });
    });

    it('disables submit button during loading', async () => {
        mockOnLogin.mockImplementation(() => new Promise(() => {})); // Never resolves
        const user = userEvent.setup();
        await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
        await user.type(screen.getByLabelText(/password/i), 'pass');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
});
```

---

## Go Testing

```go
package calculator_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/stretchr/testify/mock"
)

// Table-driven tests (idiomatic Go)
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 3, 5, 8},
        {"negative numbers", -3, -5, -8},
        {"zeros", 0, 0, 0},
        {"mixed signs", 10, -3, 7},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            assert.Equal(t, tt.expected, result)
        })
    }
}

// Mock interface with testify/mock
type MockEmailService struct {
    mock.Mock
}

func (m *MockEmailService) SendWelcomeEmail(to, name string) error {
    args := m.Called(to, name)
    return args.Error(0)
}

func TestRegisterUser(t *testing.T) {
    emailSvc := new(MockEmailService)
    emailSvc.On("SendWelcomeEmail", "alice@example.com", "Alice").Return(nil)

    svc := NewUserService(emailSvc)
    err := svc.Register("alice@example.com", "Alice")

    require.NoError(t, err)
    emailSvc.AssertExpectations(t)
}

// Benchmarks
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(3, 5)
    }
}

// Race detection
// go test -race ./...
```

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle
```
1. RED: Write a failing test
   → Test describes desired behavior
   → Must fail (proves test works)

2. GREEN: Write minimum code to pass
   → Don't over-engineer
   → Just make the test pass

3. REFACTOR: Clean up
   → Improve code quality
   → Tests still pass

Repeat for each small behavior increment
```

### TDD Example
```python
# Step 1: Write failing test
def test_password_strength():
    checker = PasswordChecker()
    assert checker.is_strong("abc") == False  # Too short

# Step 2: Write minimum code
class PasswordChecker:
    def is_strong(self, password: str) -> bool:
        return len(password) >= 8

# Step 3: More tests
def test_password_needs_uppercase():
    checker = PasswordChecker()
    assert checker.is_strong("alllower1") == False
    assert checker.is_strong("HasUpper1") == True

# Step 4: Extend implementation
class PasswordChecker:
    def is_strong(self, password: str) -> bool:
        if len(password) < 8: return False
        if not any(c.isupper() for c in password): return False
        return True

# Repeat for numbers, special chars, etc.
```

---

## E2E Testing (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
    test('successful registration flow', async ({ page }) => {
        await page.goto('/register');

        // Fill form
        await page.fill('[name="name"]', 'Alice');
        await page.fill('[name="email"]', 'alice@test.com');
        await page.fill('[name="password"]', 'SecurePass123!');
        await page.fill('[name="confirmPassword"]', 'SecurePass123!');

        // Submit
        await page.click('button[type="submit"]');

        // Verify redirect and success
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('.welcome-message')).toContainText('Welcome, Alice');
    });

    test('shows error for existing email', async ({ page }) => {
        await page.goto('/register');
        await page.fill('[name="email"]', 'existing@test.com');
        await page.fill('[name="password"]', 'pass');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('Email already taken');
    });

    // API mocking
    test('handles server error gracefully', async ({ page }) => {
        await page.route('**/api/register', route => {
            route.fulfill({ status: 500, body: '{"error": "Internal error"}' });
        });

        await page.goto('/register');
        await page.fill('[name="email"]', 'alice@test.com');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-toast')).toBeVisible();
    });
});
```

---

## CI Test Configuration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: --health-cmd pg_isready
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - run: pip install -r requirements.txt -r requirements-dev.txt

      - name: Unit tests
        run: pytest tests/unit -n auto --tb=short

      - name: Integration tests
        run: pytest tests/integration -x
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/testdb

      - name: Coverage
        run: pytest --cov=src --cov-report=xml --cov-fail-under=80

      - uses: codecov/codecov-action@v4
```

---

*Tests aren't overhead — they're the engineering artifact that lets you change code confidently. The time you spend writing tests you get back tenfold in debugging time saved.*
