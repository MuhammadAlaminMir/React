

#  Reusing Logic with Custom Hooks

## 1. The Core Problem: Code Duplication and Logic Scattered

As your React application grows, you'll often find yourself writing the same logic in multiple places. This is a classic software development problem that leads to:

*   **Code Duplication**: The same data-fetching or connection logic is copied and pasted into several components.
*   **Maintenance Burden**: If the logic needs to change, you have to hunt down and update it in every single component that uses it.
*   **Inconsistency**: One component might have a slightly different implementation of the same logic, leading to unpredictable behavior and bugs.
*   **Testing Difficulty**: When logic is scattered, it's harder to test in isolation.

### The Anti-Pattern: Duplicated Logic in Multiple Components

Imagine you're building a chat application. You have a `UserProfile` component that fetches user data and a `ChatWindow` component that connects to the chat server. Both need to know if the user is online.

```jsx
// ❌ ANTI-PATTERN: Duplicated logic in UserProfile
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchUser(userId)
      .then(userData => {
        setUser(userData);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]); // Fetches user data

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {user && <h1>Welcome, {user.name}</h1>}
    </div>
  );
}

// ❌ ANTI-PATTERN: Duplicated logic in ChatWindow
function ChatWindow({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Duplicated connection logic
    const socket = createConnection(`room-${roomId}`);
    socket.connect();
    socketRef.current = socket;
    
    socket.on('message', (msg) => {
      setMessages(m => [...m, msg]);
    });
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]); // Connects to chat

  return (
    <div>
      <h1>Chat Room: {roomId}</h1>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <ul>
        {messages.map(msg => <li key={msg.id}>{msg.text}</li>)}
      </ul>
    </div>
  );
}
```

**Why this is problematic:**

1.  **Duplication**: Both components have their own version of the connection and message handling logic.
2.  **Maintenance**: If you improve the connection logic (e.g., add auto-reconnect), you must update it in two places.
3.  **Inconsistency**: `UserProfile` might show "Online" while `ChatWindow` shows "Disconnected" because they have slightly different connection states.

---

## 2. The Solution: Custom Hooks for Logic Reusability

The solution is to extract the shared logic into a custom hook that can be reused by any component that needs it. This follows React's core principle of **composition over inheritance**.

### The Mental Model: "Provider" and "Consumer"

Think of a custom hook as a **service provider**. It encapsulates the complex logic and provides a simple API (a set of functions) to any component that wants to use it.

```jsx
// The "Provider" Hook (where the logic lives)
import { useState, useEffect } from 'react';

// This hook provides user data and connection status
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // This effect fetches user data when the userId changes
    setIsLoading(true);
    fetchUser(userId)
      .then(userData => {
        setUser(userData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]); // Dependency on userId

  useEffect(() => {
    // This effect subscribes to browser's online/offline status
    const handleOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOnline);
    };
  }, []); // No dependencies, runs once on mount

  // Return an object with the data and functions components need
  return { user, isLoading, isOnline };
}
```

### The "Consumer" Components

Now, your components can consume this shared logic simply by calling the custom hook.

```jsx
// ✅ THE REACT WAY: Components consuming the shared hook
function UserProfile() {
  // Consume the shared auth logic
  const { user, isLoading, isOnline } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <h1>Welcome, {user.name}</h1>;

  return <div>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</div>;
}

function ChatWindow({ roomId }) {
  // Consume the shared auth logic
  const { user } = useAuth(); // We only need the user object

  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Consume the shared connection logic
    const { user } = useAuth();
    const socket = createConnection(`room-${roomId}`, user.id);
    socket.connect();
    socketRef.current = socket;
    
    socket.on('message', (msg) => {
      setMessages(m => [...m, msg]);
    });
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]); // Dependency on roomId

  return (
    <div>
      <h1>Chat Room: {roomId}</h1>
      <div>Status: Connected</div>
      <ul>
        {messages.map(msg => <li key={msg.id}>{msg.text}</li>)}
      </ul>
    </div>
  );
}
```

**Why this is superior:**

1.  **No Duplication**: The logic for fetching user data and managing connection status lives in exactly one place: the `useAuth` hook.
2.  **Single Source of Truth**: Any component that needs user data or connection status gets it from the same, reliable source.
3.  **Easy Maintenance**: To update the connection logic, you only need to modify it in the `useAuth` hook. All consuming components get the update automatically.
4.  **Consistency**: All components behave identically because they consume the exact same logic.

---

## 3. Creating Custom Hooks: A Step-by-Step Guide

Let's break down how to create the `useAuth` hook.

### Step 1: Identify Shared Logic and State

First, analyze what state and what side effects are shared.

*   **State**: `user` (object), `isLoading` (boolean), `isOnline` (boolean)
*   **Side Effects**: Fetching user data, subscribing to browser online/offline events.

### Step 2: Create the Hook Function

Declare a function that starts with `use` and encapsulates all the logic.

```jsx
// auth-hook.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ... (logic will go here)
}
```

### Step 3: Implement the Side Effects

Use `useEffect` inside your custom hook to manage the side effects.

```jsx
// auth-hook.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Effect for fetching user data
  useEffect(() => {
    setIsLoading(true);
    fetchUser(userId)
      .then(userData => {
        setUser(userData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  // Effect for managing online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOnline);
    };
  }, []); // Runs once on mount

  // Return the state and any necessary functions
  return { user, isLoading, isOnline };
}
```

### Step 4: Return the State and API

The hook should return an object containing the state and any functions components might need to call (though in this simple case, we don't have any).

---

## 4. Advanced Custom Hook Patterns

### Pattern 1: Stateful Hooks

For hooks that manage more complex state, you might need to return more than just the raw state.

```jsx
// use-cart.js
import { useState } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
    setTotal(prev => prev + item.price);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTotal(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      return prev - (itemToRemove?.price || 0);
    });
  };

  // Return state and actions
  return {
    items,
    total,
    addItem,
    removeItem,
  };
}
```

### Pattern 2: Hooks with Dependencies

Sometimes your custom hook needs to accept arguments.

```jsx
// use-api.js
import { useState, useEffect } from 'react';

export function useApi(apiKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    
    fetch(`https://api.example.com/${apiKey}`)
      .then(response => response.json())
      .then(result => {
        setData(result);
      })
      .catch(err => {
        setError(err);
      });
  }, [apiKey]); // Re-fetch when API key changes

  return { data, error };
}
```

---

## 5. Best Practices for Custom Hooks

1.  **Start with `use`**: Always begin your custom hook name with `use`.
2.  **Descriptive Naming**: Use clear names like `useAuth`, `useCart`, `useApi`.
3.  **Document Your API**: Clearly document what the hook accepts, what it returns, and how to use it.
4.  **Keep Hooks Focused**: Each hook should have a single, clear responsibility.
5.  **Composition**: Build complex hooks by composing simpler ones.
6.  **Test in Isolation**: Because hooks are just functions, they are easy to test independently.

---

## 6. Summary and Key Takeaways

1.  **Extract to Reuse**: Custom hooks are the perfect solution for sharing logic between components without prop drilling.
2.  **Provider/Consumer Model**: Think of custom hooks as providing a "service" that components can consume.
3.  **Composition**: Build complex hooks by combining simpler, focused ones.
4.  **Encapsulation**: Custom hooks hide implementation details and provide a clean API.
5.  **Maintainability**: Applications with well-structured custom hooks are far easier to maintain and scale.

By mastering the art of creating custom hooks, you can build highly reusable, maintainable, and scalable React applications.