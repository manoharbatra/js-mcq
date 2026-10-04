const topicClosure = [
  {
    title: 'What will be logged when `makeCounter` is called?',
    type: 'code',
    label: 'OUTPUT BASED',
    code: `function makeCounter() {
  let count = 0;
  return () => ++count;
}

const counter = makeCounter();
console.log(counter());
console.log(counter());`,
    answer: '1 then 2. The returned function closes over the same `count` binding, so it keeps its value between calls.',
  },
  {
    title: 'In your own words, what is a closure?',
    type: 'text',
    label: 'CONCEPT',
    prompt: 'Describe what a function remembers from the place where it was created, even after that outer function has finished running.',
    answer: 'A closure is a function bundled with references to the variables in its surrounding lexical scope. It can still access those variables after the outer function has returned.',
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
    answer: 'It prints `4` three times. `var` creates one function-scoped binding shared by every callback; the callbacks run after the loop has finished.',
  },
  {
    title: 'Which declaration gives each callback its own loop value?',
    type: 'json',
    label: 'CHOOSE ONE',
    data: {
      question: 'Pick the declaration that creates a fresh binding for each iteration.',
      choices: ['A. var index = 0', 'B. let index = 0', 'C. const index = 0'],
    },
    answer: '`B. let index = 0`. A `let` declaration in the loop header creates a per-iteration binding captured by each callback.',
  },
  {
    title: 'Can you make a private score with a closure?',
    type: 'text',
    label: 'WRITE A FUNCTION',
    prompt: 'Write a `createScore` function that starts at zero and returns an object with `add` and `value` methods. The score should not be directly accessible from outside.',
    answer: 'Keep `score` inside `createScore`, then return methods that close over it: `function createScore() { let score = 0; return { add() { score += 1; }, value() { return score; } }; }`',
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

export const questionSets = { Closures: topicClosure, Map: topicMap }
export const topics = Object.keys(questionSets)