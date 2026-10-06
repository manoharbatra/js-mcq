const topicClosure = [
  {
    title: 'What is logged when `counter()` is called three times?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `function outer() {
  let count = 0;

  return function inner() {
    count++;
    console.log(count);
  };
}

const counter = outer();

counter();
counter();
counter();`,
    answer: 'The correct answer is B) `1 2 3`.\n\nWhy? The inner function forms a closure over the `count` variable in `outer()`. Even after `outer()` finishes executing, `inner()` retains access to that same variable. Each call increments it by one.\n\n💡 Interview tip: A closure preserves access to variables from its lexical scope, not just their values at the time the function was created.',
  },
  {
    title: 'What is the value of `readSecret()`?',
    type: 'mixed',
    label: 'OUTPUT BASED',
    parts: [
      { kind: 'text', value: 'Read the object below, then follow the returned function. What does the final call produce?' },
      { kind: 'json', value: '{\n  "createReader": "returns a function",\n  "secret": 42,\n  "readSecret": "createReader()"\n}' },
      { kind: 'code', value: 'function createReader() {\n  const secret = 42;\n  return function readSecret() {\n    return secret;\n  };\n}\n\nconst readSecret = createReader();\nreadSecret();' },
    ],
    answer: '`42`. `readSecret` retains access to `secret` through its closure.',
  },
  {
    title: 'Why does this loop print the same number each time?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    answer: `4\n4\n4\n\nClosure concept: Each callback passed to setTimeout accesses the variable i from its surrounding lexical environment. Because var creates a single function-scoped binding, all three callbacks reference the same variable.

  Execution flow:

  1. The loop starts with i = 1.
  2. Three callbacks are scheduled.
  3. The loop finishes when i becomes 4.
  4. The callbacks execute and each reads the current value of i, which is 4.`,
  },
  {
    title: 'What will be the output of this code?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `function outer() {
  let x = 10;

  return function inner() {
    let x = 20;

    return function () {
      console.log(x);
    };
  };
}

const fn = outer();
const result = fn();

result();`,
    answer: `Answer: 20

1. \`outer()\` executes and declares \`x = 10\`.
2. \`fn()\` executes the \`inner()\` function, which declares its own local variable \`x = 20\`.
3. \`inner()\` returns another function. That function is lexically defined inside \`inner()\`, so it retains access to \`inner()\`'s scope.
4. \`result()\` looks for \`x\` in its own scope first, then in the enclosing lexical scope. It finds \`x = 20\`.

Key concept: Lexical scope

JavaScript resolves variables based on where a function is defined, not where it is called. Since the innermost function is defined inside \`inner()\`, it accesses \`inner()\`'s \`x\`, not \`outer()\`'s \`x\`.`,
  },
  {
    eyebrow: 'Closures + shared state 🔥',
    title: 'What will be the output?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `function createCounter() {
  let count = 0;

  return {
    increment: function () {
      count++;
      console.log(count);
    },
    decrement: function () {
      count--;
      console.log(count);
    }
  };
}

const counter1 = createCounter();

counter1.increment();
counter1.increment();
counter1.decrement();
counter1.increment();`,
    answer: 'The correct answer is `1, 2, 1, 2`.\n\nBoth `increment` and `decrement` are created inside the same `createCounter()` invocation. They close over the same `count` variable, rather than creating separate copies.',
  },
  {
    eyebrow: 'Closures + `var` + asynchronous callbacks 🔥',
    title: 'What will be printed, and in what order?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `function createFunctions() {
  var callbacks = [];

  for (var i = 0; i < 3; i++) {
    callbacks.push(function () {
      console.log(i);
    });
  }

  return callbacks;
}

const functions = createFunctions();

functions[0]();
functions[1]();
functions[2]();`,
    answer: `\`3, 3, 3\`.

This is one of the most frequently asked JavaScript closure questions in frontend interviews.

Why is the output \`3, 3, 3\`?

Step 1: Understand \`var\` scope
The variable \`i\` is declared with \`var\`, which is function-scoped, not block-scoped. All three callbacks refer to the same \`i\` variable.

Step 2: The loop finishes
The loop increments \`i\` until it reaches \`3\`, at which point \`i < 3\` is false. The loop terminates with \`i === 3\`.

Step 3: Call the callbacks
Each callback accesses the same variable, whose value is now \`3\`.

How would you fix it?
Using \`let\` creates a new loop binding for each iteration:

for (let i = 0; i < 3; i++) {
  callbacks.push(function () {
    console.log(i);
  });
}

Now the output is \`0, 1, 2\`.

Interview tip: A closure captures access to a variable binding, not a frozen snapshot of its value. With \`var\`, all three callbacks share one binding; with \`let\` in a \`for\` loop, each iteration gets its own binding.`,
  },
]

const topicMap = [
  {
    title: 'What does this `map()` expression return?',
    type: 'mixed',
    label: 'OUTPUT BASED',
    parts: [
      { kind: 'text', value: '' },
      {
        kind: 'json',
        value: {
          id: 101,
          name: 'AI Project',
          description: 'Sample project for testing',
          technology: ['React', 'TypeScript', 'Node.js'],
          status: 'active',
          owner: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      },
      {
        kind: 'code',
        value: `const names = project.technology.map((technology) => technology.toUpperCase());
console.log(names);`,
      },
    ],
    answer: '["REACT", "TYPESCRIPT", "NODE.JS"].\n map() calls the callback for each item in `project.technology` and returns a new array of the transformed values.',
  },
]

export const questionSets = [
  {
    topic: 'Closures',
    questions: topicClosure,
    mediumLink: 'https://medium.com/@contactmanoharbatra/closures-22ca6f136e88?sk=3ffc9df2e4c17a974ed074cb0f85e8d4',
  },
  {
    topic: 'Map',
    questions: topicMap,
    mediumLink: 'https://medium.com/@contactmanoharbatra/a-map-0512030090ed',
  },
]