### Principle 1: Reducers Must Be Pure

This is the most important rule of writing reducers. It's a non-negotiable part of the pattern.

> "Reducers must be pure. Similar to state updater functions, reducers run during rendering!"

#### **What "Pure" Means for a Reducer**

A pure function is one that:

1.  **Always returns the same output for the same input.** Given the same `state` and `action`, it must always return the same `nextState`.
2.  **Has no side effects.** It does not interact with the "outside world."

#### **Why Purity is Crucial**

You correctly noted that reducers run during the render phase. Actions are _queued_ by event handlers, but the reducer itself is executed by React when it's time to calculate the next state.

- **No External Interactions:** Because reducers run during rendering, they **must not** perform side effects like:
  - Making network requests (`fetch`).
  - Scheduling timeouts (`setTimeout`).
  - Directly manipulating the DOM.
- **No Mutations:** They must not mutate the `state` argument they receive. They must always return a new state object or array.

```jsx
// AVOID THIS: Impure Reducer
function tasksReducer(tasks, action) {
  if (action.type === "added") {
    // WRONG: This mutates the original state array.
    tasks.push({ id: action.id, text: action.text });
    return tasks;
  }
}

// DO THIS: Pure Reducer
function tasksReducer(tasks, action) {
  if (action.type === "added") {
    // CORRECT: This returns a new array with the new item.
    return [...tasks, { id: action.id, text: action.text }];
  }
}
```

---

### Principle 2: One Action Per Interaction

The structure of your actions is just as important as the structure of your reducer.

> "Each action describes a single user interaction, even if that leads to multiple changes in the data."

#### **The "Why" Behind Coherent Actions**

When you log actions or debug your state changes, you want to see a clear story of what the user did. If a single user interaction (like clicking a "Reset" button) dispatches five different actions, your log becomes noisy and hard to follow.

#### **Good vs. Bad Action Design**

Imagine a form with five fields that needs to be reset.

```jsx
// AVOID THIS: Many actions for one intent
function handleResetClick() {
  dispatch({ type: "clear_name" });
  dispatch({ type: "clear_email" });
  dispatch({ type: "clear_password" });
  dispatch({ type: "clear_address" });
  dispatch({ type: "clear_phone" });
}
```

```jsx
// DO THIS: One action for one intent
function handleResetClick() {
  // This single action clearly describes the user's intent.
  dispatch({ type: "reset_form" });
}
```

Now, your reducer handles the logic for that single, coherent action.

```jsx
function formReducer(state, action) {
  switch (action.type) {
    case "reset_form":
      // One clear block of logic for one user action.
      return {
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
      };
    // ... other cases
  }
}
```

This makes your reducer's logic cleaner and your application's behavior much easier to trace and debug.

---

### Principle 3: Writing Concise Reducers with Immer

Even with pure reducers, writing immutable updates for complex or nested state can be verbose and error-prone. This is where the `immer` library shines.

> "Just like with updating objects and arrays in regular state, you can use Immer library to make reducers more concise."

#### **The Problem Immer Solves**

Recall the nested update example from a previous lesson. Without Immer, it's a mess of spreads.

```jsx
// WITHOUT Immer: Verbose and fragile
function userReducer(user, action) {
  if (action.type === "toggle_notifications") {
    return {
      ...user,
      profile: {
        ...user.profile,
        settings: {
          ...user.profile.settings,
          notifications: {
            ...user.profile.settings.notifications,
            sms: !user.profile.settings.notifications.sms,
          },
        },
      },
    };
  }
}
```

#### **The Immer Solution: The `draft` Object**

Immer provides you with a special `draft` object. You can treat this `draft` as if it were mutable, and Immer will take care of producing the correct, immutable next state for you behind the scenes.

```jsx
import { produce } from "immer";

// WITH Immer: Clean and readable
function userReducer(user, action) {
  return produce(user, (draft) => {
    if (action.type === "toggle_notifications") {
      // This looks like a mutation, but it's safe!
      // Immer handles all the deep copying.
      draft.profile.settings.notifications.sms =
        !draft.profile.settings.notifications.sms;
    }
  });
}
```

#### **The Ultimate Shortcut: `useImmerReducer`**

The `immer` library provides a custom Hook that combines `useReducer` and `produce` into a single, convenient function.

```jsx
import { useImmerReducer } from "use-immer";

// In your component:
const [user, dispatch] = useImmerReducer(userReducer, initialState);
```

When you use `useImmerReducer`, your reducer function receives the `draft` as its first argument, and you **don't even need to return the next state.** Immer assumes you want to return the mutated draft.

```jsx
// The final, most concise form
function userReducer(draft, action) {
  switch (action.type) {
    case "toggle_notifications":
      // No return statement needed! Just mutate the draft.
      draft.profile.settings.notifications.sms =
        !draft.profile.settings.notifications.sms;
      break;
  }
}
```

By following these three principles—purity, coherent actions, and using tools like Immer—you can write reducers that are powerful, predictable, and a pleasure to maintain.
