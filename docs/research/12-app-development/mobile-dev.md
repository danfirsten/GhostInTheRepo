# Mobile Development — Complete Reference

> Mobile is where users live. Build for the constraints: limited CPU, battery, network, and screen — and you'll build better software everywhere.

---

## iOS Development (Swift/SwiftUI)

### Swift Fundamentals
```swift
// Variables and constants
var mutableValue = 42
let immutableValue = "hello"  // Prefer let — compiler enforces immutability

// Optionals: the safe way to handle nil
var name: String? = nil
name = "Alice"

// Unwrapping
if let n = name {
    print("Name: \(n)")
}

// Guard (early return)
func process(name: String?) {
    guard let name = name else { return }
    print("Processing \(name)")
}

// Optional chaining
let length = name?.count ?? 0  // 0 if nil

// Force unwrap (avoid unless certain)
let definitelyNotNil = name!

// Closures
let double = { (x: Int) -> Int in x * 2 }
let numbers = [1, 2, 3, 4, 5]
let doubled = numbers.map { $0 * 2 }
let evens = numbers.filter { $0.isMultiple(of: 2) }
let sum = numbers.reduce(0, +)

// Async/await
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw APIError.badResponse
    }
    return try JSONDecoder().decode(User.self, from: data)
}

// Usage
Task {
    do {
        let user = try await fetchUser(id: "123")
        print(user.name)
    } catch {
        print("Error: \(error)")
    }
}
```

### SwiftUI
```swift
import SwiftUI
import Combine

// ViewModel (ObservableObject)
@MainActor
class UserListViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: String?

    private let repository: UserRepository

    init(repository: UserRepository = UserRepositoryImpl()) {
        self.repository = repository
    }

    func loadUsers() async {
        isLoading = true
        error = nil
        do {
            users = try await repository.fetchUsers()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// View
struct UserListView: View {
    @StateObject private var viewModel = UserListViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = viewModel.error {
                    ErrorView(message: error) {
                        Task { await viewModel.loadUsers() }
                    }
                } else {
                    List(viewModel.users) { user in
                        NavigationLink(destination: UserDetailView(user: user)) {
                            UserRowView(user: user)
                        }
                    }
                    .refreshable {
                        await viewModel.loadUsers()
                    }
                }
            }
            .navigationTitle("Users")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { Task { await viewModel.loadUsers() } }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
        .task {
            await viewModel.loadUsers()  // Called when view appears
        }
    }
}

struct UserRowView: View {
    let user: User

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: user.avatarURL) { image in
                image.resizable()
            } placeholder: {
                Color.gray.opacity(0.2)
            }
            .frame(width: 48, height: 48)
            .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(user.name)
                    .font(.headline)
                Text(user.email)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// Custom modifiers
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.background)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 2)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}
```

### Core Data and Persistence
```swift
import SwiftData

// SwiftData model (iOS 17+, recommended for new apps)
@Model
class User {
    @Attribute(.unique) var id: String
    var name: String
    var email: String
    var createdAt: Date

    @Relationship(deleteRule: .cascade)
    var orders: [Order] = []

    init(id: String, name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
        self.createdAt = .now
    }
}

// In view
struct ContentView: View {
    @Query(sort: \User.name) private var users: [User]
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        List(users) { user in
            Text(user.name)
        }
        .onTapGesture {
            let user = User(id: UUID().uuidString, name: "New", email: "new@example.com")
            modelContext.insert(user)
        }
    }
}

// App entry point
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [User.self, Order.self])
    }
}
```

---

## Android Development (Kotlin/Jetpack Compose)

### Kotlin Essentials
```kotlin
// Null safety
var nullable: String? = null
val nonNull: String = "hello"
val length = nullable?.length ?: 0

// Data classes
data class User(
    val id: String,
    val name: String,
    val email: String,
    val createdAt: Instant = Instant.now()
)
val user = User("1", "Alice", "alice@example.com")
val updated = user.copy(name = "Alice Smith")  // Immutable update

// Coroutines
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun fetchUser(id: String): User {
    return withContext(Dispatchers.IO) {
        api.getUser(id)  // Network call on IO dispatcher
    }
}

// Flow (reactive streams)
fun observeUsers(): Flow<List<User>> = flow {
    while (true) {
        emit(api.getUsers())
        delay(30_000)  // Refresh every 30s
    }
}.flowOn(Dispatchers.IO)

// Extension functions
fun String.toTitleCase(): String =
    split(" ").joinToString(" ") { word ->
        word.replaceFirstChar { it.uppercase() }
    }

// Sealed classes (sum types)
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

### Jetpack Compose
```kotlin
// ViewModel with StateFlow
@HiltViewModel
class UserListViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<List<User>>>(UiState.Loading)
    val uiState: StateFlow<UiState<List<User>>> = _uiState.asStateFlow()

    init { loadUsers() }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val users = userRepository.getUsers()
                _uiState.value = UiState.Success(users)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

// Composable screen
@Composable
fun UserListScreen(
    viewModel: UserListViewModel = hiltViewModel(),
    onUserClick: (User) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is UiState.Loading -> {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is UiState.Error -> {
            ErrorContent(message = state.message, onRetry = viewModel::loadUsers)
        }
        is UiState.Success -> {
            UserList(users = state.data, onUserClick = onUserClick)
        }
    }
}

@Composable
fun UserList(users: List<User>, onUserClick: (User) -> Unit) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(users, key = { it.id }) { user ->
            UserCard(user = user, onClick = { onUserClick(user) })
        }
    }
}

@Composable
fun UserCard(user: User, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = user.avatarUrl,
                contentDescription = "Avatar",
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
            )
            Column {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
```

---

## Performance Considerations

### iOS Performance
```swift
// Images: use AsyncImage for network, but cache manually for control
// Never load large images on main thread

// Main thread rule: UI updates ONLY on main thread
// await MainActor.run { ... } or @MainActor annotation

// Memory: watch for retain cycles in closures
class ViewController {
    func startTimer() {
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.updateUI()  // [weak self] prevents retain cycle
        }
    }
}

// Lazy loading
lazy var expensiveObject = HeavyObject()

// Background tasks
func processLargeDataset(_ data: [Item]) async -> [Result] {
    // Process on background thread, return to main
    return await withCheckedContinuation { continuation in
        DispatchQueue.global(qos: .userInitiated).async {
            let results = data.map { processItem($0) }
            continuation.resume(returning: results)
        }
    }
}
```

### Android Performance
```kotlin
// RecyclerView vs LazyColumn: LazyColumn for Compose, RecyclerView is legacy

// Avoid work on main thread
// Use viewModelScope.launch for coroutines
// Use Dispatchers.IO for network/disk

// Room database (type-safe SQLite)
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String
)

@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY name")
    fun observeAll(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(user: UserEntity)

    @Delete
    suspend fun delete(user: UserEntity)
}

// Paging 3 for large datasets
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {
    val users = Pager(
        config = PagingConfig(pageSize = 20),
        pagingSourceFactory = { repository.getUsersPagingSource() }
    ).flow.cachedIn(viewModelScope)
}
```

---

## App Store Deployment

### iOS (App Store Connect)
```
1. Certificates and profiles (Xcode → Signing & Capabilities)
   - Development certificate: for testing on device
   - Distribution certificate: for App Store submission
   - App ID: unique bundle identifier (com.company.appname)
   - Provisioning profile: ties App ID + devices + certificate

2. Build and archive
   Product → Archive → Validate → Distribute

3. App Store Connect:
   - App information (name, subtitle, description)
   - Screenshots (required sizes: 6.7", 6.5", 5.5" for iPhone)
   - Privacy policy URL (required)
   - Review information

4. TestFlight: beta testing before App Store
   - Internal testing: up to 100 testers, no review
   - External testing: up to 10,000 testers, requires beta review

5. App Review: usually 24-48 hours
```

### Android (Google Play)
```bash
# Generate signed APK/AAB
# keytool -genkey -v -keystore my-release-key.jks -keyAlias my-key-alias
# -keyalg RSA -keysize 2048 -validity 10000

# Build release AAB (Android App Bundle — preferred over APK)
./gradlew bundleRelease

# Sign with zipalign + apksigner
# Or use Play App Signing (recommended — Google manages key)

# Publish tracks:
#   Internal testing: immediate access for testers
#   Closed testing (Alpha): specific groups
#   Open testing (Beta): public opt-in
#   Production: full rollout (staged %)

# Staged rollout: 1% → 5% → 10% → 50% → 100%
# Watch crash rate and ANR rate before increasing
```

---

*Mobile apps live in a hostile environment: low battery, flaky networks, tiny screens, users with 10 apps open. Design defensively and the platform will reward you.*
