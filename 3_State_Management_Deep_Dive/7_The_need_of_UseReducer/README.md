### The Problem: When State Logic Becomes Overwhelming

As your components grow, you often find that many different event handlers need to update the state in similar ways.

> "Components with many state updates spread across many event handlers can get overwhelming."
> 

The logic for how the state can change becomes scattered across your component. This makes it difficult to:

- **See at a glance** all the possible ways your state can change.
- **Debug** when a state update goes wrong, as you have to hunt through multiple handlers.
- **Maintain** the code, as a change in logic might require updates in several places.

---

### The Solution: Consolidate Logic in a Reducer

The solution is to extract all of that state update logic into a single, pure function called a **reducer**.

> "You can consolidate all of the state update logic outside your component in a single function, called a reducer."
> 

This function consolidates *how* state changes in response to *what* happened. Your component's job becomes much simpler: it just needs to say *what* happened, and the reducer figures out the rest.

---

### The 3-Step Migration from `useState` to `useReducer`

Refactoring a component to use a reducer is a clear, three-step process.

### **Step 1: Move from Setting State to Dispatching Actions**

Instead of calling state setters directly (e.g., `setTasks(...)`), your event handlers will now call a `dispatch` function with an **action object**.

- **What is an Action?** An action is a plain JavaScript object that describes what happened. It's a "report" of an event.
- **The `type` Property:** By convention, every action has a `type` property (a string) that describes the event. The specific name is up to you, as long as it's descriptive within your component.

```jsx
// BEFORE (useState)
function handleAddTask(text) {
  setTasks([...tasks, { id: nextId++, text: text, done: false }]);
}

// AFTER (useReducer)
function handleAddTask(text) {
  // We are no longer setting state. We are "dispatching" an action.
  // We are telling the reducer: "Hey, an 'added' action happened, and here's the data."
  dispatch({
    type: 'added', // Describes what happened
    id: nextId++,   // Additional info needed for the update
    text: text
  });
}

```

### **Step 2: Write the Reducer Function**

The reducer is the heart of the logic. It's a function that takes two arguments: the **current state** and the **action** that was just dispatched. It must return the **next state**.

> "A reducer is a different way to handle state."
> 

Your reducer contains all the logic for how the state can change.

```jsx
// tasksReducer.js

export function tasksReducer(tasks, action) {
  // Use a switch statement to handle different action types
  switch (action.type) {
    case 'added': {
      // Return a NEW array with the new task
      return [...tasks, {
        id: action.id,
        text: action.text,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id);
    }
    default: {
      // If no action matches, return the original state unchanged
      throw Error('Unknown action: ' + action.type);
    }
  }
}

```

**Key Rules for Reducers:**

- They must be **pure**. They shouldn't have side effects (like API calls) or modify their arguments.
- They must **not mutate** the original `state` object. Always return a new state.

### **Step 3: Use the `useReducer` Hook in Your Component**

Now, replace `useState` with the `useReducer` hook in your component.

> "The useReducer Hook is similar to useState..."
> 

`useReducer` takes two arguments: your reducer function and the initial state. It returns two things: the current state, and the `dispatch` function.

```jsx
import { useReducer } from 'react';
import { tasksReducer } from './tasksReducer';

function TaskApp() {
  // 1. Pass the reducer and the initial state
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  // 2. Event handlers now just dispatch actions
  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text
    });
  }

  // ... your component's JSX remains the same!
  return (
    // ...
  );
}

```

---

### Comparing `useState` and `useReducer`

They are not competitors; they are tools for different jobs. Here’s how to decide which one to use.

| Feature | `useState` | `useReducer` |
| --- | --- | --- |
| **Code Size** | Less boilerplate for simple state. | More upfront code (reducer, actions, dispatch). |
| **Readability** | Very easy for simple state updates. | **Better for complex state.** Separates the "how" (reducer) from the "what" (event handlers). |
| **Debugging** | Can be hard to trace where state changed. | **Easier to debug.** You can `console.log` every action and state change in one place (the reducer). |
| **Testing** | Harder to test state logic in isolation. | **Easy to test.** Reducers are pure functions, so you can export and test them separately. |

---

### When to Use a Reducer

> "We recommend using a reducer if you often encounter bugs due to incorrect state updates in some component, and want to introduce more structure to its code."
> 

You don't need to use `useReducer` for everything. A good rule of thumb is:

- **Use `useState` when:**
    - You have a few independent pieces of state.
    - Your state logic is simple (e.g., setting a boolean, updating a single value).
- **Consider `useReducer` when:**
    - You have complex state logic, especially when a state update depends on the previous state.
    - Multiple event handlers modify the same piece of state in similar ways.
    - The component itself is becoming complex and hard to reason about.

Ultimately, it's a matter of preference and code organization. You can even mix and match them in the same component. The goal is to write code that is clear, predictable, and easy to maintain.