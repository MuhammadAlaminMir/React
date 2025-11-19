### The Core Problem: The Inconvenience of Prop Drilling

You've correctly identified the primary issue that Context solves.

> "Passing props can become verbose and inconvenient when you need to pass them through many components in the middle, or if many components in your app need the same information."
> 

This is often called **"prop drilling."** You have a piece of data (e.g., the current theme) that a deeply nested child component needs. To get it there, you must pass it through every single component in the path, even if those intermediate components don't use the data themselves.

**Example of Prop Drilling:**

```jsx
// App has the theme
function App() {
  const [theme, setTheme] = useState('light');
  return <Layout theme={theme} />;
}

// Layout doesn't use theme, must pass it through
function Layout({ theme }) {
  return <Header theme={theme} />;
}

// Header finally uses it
function Header({ theme }) {
  return <h1 style={{ color: theme === 'dark' ? 'white' : 'black' }}>My App</h1>;
}

```

Here, `Layout` is just a "middleman" for the `theme` prop. If the tree gets deeper, this problem gets exponentially worse.

---

### The Solution: Introducing React Context

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

> "Context lets a parent component make some information available to any component in the tree below it—no matter how deep—without passing it explicitly through props."
> 

It creates a "channel" or a "tunnel" in your component tree that a component at the top can provide a value into, and any child component, no matter how deep, can "tap into" to read that value.

---

### The 3-Step Context API Workflow

You've outlined the three core steps perfectly. Let's detail them with code.

### **Step 1: Create a Context**

You start by creating a context object using the `createContext` function. It's common to create this in a separate file to be reusable.

```jsx
// LevelContext.js
import { createContext } from 'react';

// Create a context object. The default value is only used
// if a component tries to read this context without a Provider above it.
export const LevelContext = createContext(1);

```

### **Step 2: Use the Context in a Child Component**

Any component that needs the data from the context uses the `useContext` Hook.

```jsx
// Heading.jsx
import { useContext } from 'react';
import { LevelContext } from './LevelContext';

export default function Heading() {
  // The useContext Hook reads the current value of LevelContext
  // from the nearest Provider above this component in the tree.
  const level = useContext(LevelContext);

  return (
    <h1 className={`level-${level}`}>
      {/* This heading will now be styled based on the context value */}
      Section Title
    </h1>
  );
}

```

### **Step 3: Provide the Context from a Parent Component**

The component that "owns" the data uses the `Context.Provider` component to make it available to its children.

```jsx
// Section.jsx
import { useState } from 'react';
import { LevelContext } from './LevelContext';
import Heading from './Heading';

export default function Section({ level, children }) {
  // The Provider component makes the `level` value available to all
  // children components inside it.
  return (
    <LevelContext.Provider value={level}>
      {/* All components inside here can now read the `level` value */}
      {children}
    </LevelContext.Provider>
  );
}

```

Now, you can use them together without prop drilling:

```jsx
// App.jsx
import Section from './Section';
import Heading from './Heading';

function App() {
  return (
    <Section level={1}>
      <Heading /> {/* Reads level 1 from context */}
      <Section level={2}>
        <Heading /> {/* Reads level 2 from context */}
        <Section level={3}>
          <Heading /> {/* Reads level 3 from context */}
        </Section>
      </Section>
    </Section>
  );
}

```

---

### Key Feature: Context is Not Static

Context is not just for setting a value once. It's dynamic.

> "Context is not limited to static values. If you pass a different value on the next render, React will update all the components reading it."
> 

The `value` prop of `Context.Provider` can be any JavaScript value: a string, a number, an object, or even a function. When this `value` changes, React will automatically re-render all the components that are using (`useContext`) that context.

**Example: A Dynamic Theme Context**

```jsx
// App.jsx
import { useState } from 'react';
import { ThemeContext } from './ThemeContext';
import Button from './Button';

export default function MyApp() {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  // The `value` is tied to the `theme` state variable.
  // When `theme` changes, the context value changes, and Button will re-render.
  return (
    <ThemeContext.Provider value={theme}>
      <Button onClick={toggleTheme}>
        Current Theme: {theme}
      </Button>
    </ThemeContext.Provider>
  );
}

```

---

### Best Practices: When to (and When Not to) Use Context

Context is a powerful tool, but it can be overused, leading to less transparent code.

### **Consider Alternatives First**

1. **Start by Passing Props:** Don't reach for Context immediately. If you only need to pass props through one or two layers, props are often clearer and more explicit.
2. **Extract Components and Pass `children`:** If you are passing data through many layers that don't use it, you might have a component abstraction issue.
    
    ```jsx
    // AVOID THIS
    <Layout posts={posts} user={user} />
    
    // CONSIDER THIS
    <Layout>
      <Posts posts={posts} />
      <Profile user={user} />
    </Layout>
    
    ```
    
    Here, `Layout` doesn't need to know about `posts` or `user`. It just needs to be a container.
    

### **Good Use Cases for Context**

> "If some information is needed by distant components in different parts of the tree, it’s a good indication that context will help you."
> 
- **Theming:** Providing the current color theme (`'light'` or `'dark'`) to the entire app.
- **Current Account:** Providing the currently logged-in user object to many components.
- **Routing:** Routing libraries use context internally to make the current route available to components like `Link` or `NavLink`.
- **Managing Global State:** Combining Context with a `useReducer` to manage a complex piece of global state that many components need to read or update.

Context is your tool for making data "ambient" and available throughout a part of your UI tree, but it should be used judiciously to keep your data flow understandable.