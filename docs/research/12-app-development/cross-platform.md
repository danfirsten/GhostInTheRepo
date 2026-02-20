# Cross-Platform Development — Complete Reference

> Write once, run everywhere has always been the dream. Today's tools make it closer to reality than ever — with real trade-offs.

---

## React Native

### Architecture
```
JS Thread (your code) ←→ Bridge ←→ Native Thread (UI rendering)

New Architecture (Fabric + JSI):
  - JSI: JavaScript Interface (direct C++ access, no serialization)
  - Fabric: New rendering system (synchronous, concurrent)
  - TurboModules: Lazy-loaded native modules

React Native vs React:
  - No DOM — uses native components (View, Text, Image, ScrollView)
  - Styling via StyleSheet.create (subset of CSS, no inheritance)
  - Navigation via React Navigation (not browser history)
  - Different set of APIs (no localStorage, no window)
```

### Core Components
```jsx
import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, FlatList, Image, StyleSheet,
    Platform, Dimensions, Keyboard, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Styles (must be explicit — no CSS inheritance)
const styles = StyleSheet.create({
    container: {
        flex: 1,                          // Equivalent to flex: 1 in CSS
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        // Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow (Android)
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    // Platform-specific
    header: {
        paddingTop: Platform.select({ ios: 0, android: 8 }),
        ...Platform.select({
            ios: { backgroundColor: '#fff' },
            android: { backgroundColor: '#f0f0f0' }
        })
    }
});

// FlatList: efficient for long lists (virtualized)
function UserList({ users, onSelect }) {
    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.title}>{item.name}</Text>
            <Text>{item.email}</Text>
        </TouchableOpacity>
    ), [onSelect]);

    const keyExtractor = useCallback((item) => item.id, []);

    return (
        <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={false}
            onRefresh={() => {}} // Pull to refresh
            ListEmptyComponent={<Text>No users found</Text>}
            ListHeaderComponent={<Text style={styles.title}>Users</Text>}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
        />
    );
}

// Form with keyboard handling
function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flex: 1, padding: 24 }}
        >
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={() => {
                    Keyboard.dismiss();
                    onSubmit(email, password);
                }}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => onSubmit(email, password)}
            >
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
```

### Navigation (React Navigation)
```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return <Icon name={icons[route.name]} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Stack + Tabs
function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="UserDetail"
                    component={UserDetailScreen}
                    options={{ title: 'User Details' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Navigation in component
function HomeScreen({ navigation }) {
    return (
        <View>
            <Button
                title="View Details"
                onPress={() => navigation.navigate('UserDetail', { userId: '123' })}
            />
        </View>
    );
}

function UserDetailScreen({ route }) {
    const { userId } = route.params;
    // ...
}
```

### State Management (Zustand)
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { user, token } = await authApi.login(email, password);
                    set({ user, token, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Usage
const { user, login, logout } = useAuthStore();
```

---

## Flutter

### Architecture
```
Dart code → Flutter Engine (Skia/Impeller) → Platform canvas
                                ↓
                    Renders its own widgets (not native components)

Key concepts:
  Everything is a widget
  Widget tree → Element tree → RenderObject tree
  setState triggers rebuild of subtree
  const widgets: compile-time constant, not rebuilt
```

### Core Widgets
```dart
import 'package:flutter/material.dart';

void main() {
    runApp(const MyApp());
}

class MyApp extends StatelessWidget {
    const MyApp({super.key});

    @override
    Widget build(BuildContext context) {
        return MaterialApp(
            title: 'My App',
            theme: ThemeData(
                colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
                useMaterial3: true,
            ),
            home: const UserListPage(),
        );
    }
}

// Stateless widget
class UserCard extends StatelessWidget {
    final User user;
    final VoidCallback onTap;

    const UserCard({super.key, required this.user, required this.onTap});

    @override
    Widget build(BuildContext context) {
        return Card(
            child: ListTile(
                leading: CircleAvatar(
                    backgroundImage: NetworkImage(user.avatarUrl),
                ),
                title: Text(user.name),
                subtitle: Text(user.email),
                trailing: const Icon(Icons.chevron_right),
                onTap: onTap,
            ),
        );
    }
}

// Stateful widget
class UserListPage extends StatefulWidget {
    const UserListPage({super.key});
    @override
    State<UserListPage> createState() => _UserListPageState();
}

class _UserListPageState extends State<UserListPage> {
    List<User> _users = [];
    bool _loading = true;
    String? _error;

    @override
    void initState() {
        super.initState();
        _loadUsers();
    }

    Future<void> _loadUsers() async {
        setState(() { _loading = true; _error = null; });
        try {
            final users = await UserRepository().getUsers();
            setState(() { _users = users; _loading = false; });
        } catch (e) {
            setState(() { _error = e.toString(); _loading = false; });
        }
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Users')),
            body: _buildBody(),
        );
    }

    Widget _buildBody() {
        if (_loading) return const Center(child: CircularProgressIndicator());
        if (_error != null) {
            return Center(child: Column(children: [
                Text(_error!),
                ElevatedButton(
                    onPressed: _loadUsers,
                    child: const Text('Retry')
                ),
            ]));
        }
        return RefreshIndicator(
            onRefresh: _loadUsers,
            child: ListView.builder(
                itemCount: _users.length,
                itemBuilder: (context, index) {
                    final user = _users[index];
                    return UserCard(
                        user: user,
                        onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => UserDetailPage(userId: user.id)
                            )
                        ),
                    );
                },
            ),
        );
    }
}
```

### State Management (Riverpod)
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Provider
final usersProvider = AsyncNotifierProvider<UsersNotifier, List<User>>(() {
    return UsersNotifier();
});

class UsersNotifier extends AsyncNotifier<List<User>> {
    @override
    Future<List<User>> build() async {
        return ref.watch(userRepositoryProvider).getUsers();
    }

    Future<void> refresh() async {
        state = const AsyncLoading();
        state = await AsyncValue.guard(() =>
            ref.read(userRepositoryProvider).getUsers()
        );
    }
}

// Consumer widget
class UserListPage extends ConsumerWidget {
    const UserListPage({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final usersAsync = ref.watch(usersProvider);

        return usersAsync.when(
            loading: () => const CircularProgressIndicator(),
            error: (error, stack) => Text('Error: $error'),
            data: (users) => ListView.builder(
                itemCount: users.length,
                itemBuilder: (context, i) => UserCard(user: users[i]),
            ),
        );
    }
}
```

---

## Choosing a Approach

```
Native (Swift/Kotlin):
  ✓ Best performance
  ✓ Full platform API access
  ✓ Best platform-specific UX
  ✗ Double the codebase
  ✗ Need two sets of engineers
  Best for: performance-critical apps, complex native features

React Native:
  ✓ Share logic (80-90%), some UI
  ✓ Web developers can contribute
  ✓ OTA updates possible (Expo)
  ✓ Large ecosystem
  ✗ Bridge overhead (improving with new arch)
  ✗ Complex native features require native modules
  Best for: content apps, social, e-commerce, startups

Flutter:
  ✓ Consistent UI across platforms (including Web, Desktop)
  ✓ Excellent performance (Skia/Impeller)
  ✓ Strong type system (Dart)
  ✗ Custom UI (not native look by default)
  ✗ Dart ecosystem smaller than JS
  ✗ App size larger
  Best for: custom design systems, Google ecosystem, cross-platform including web/desktop
```

---

*The best cross-platform app is one that feels native on every platform. That takes effort regardless of the framework you choose.*
