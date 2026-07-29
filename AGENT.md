# AGENTS.md

## Project

This repository contains the backend of a real-time multiplayer mobile party game.

Technology stack:

- Node.js
- Express
- MongoDB
- Mongoose
- Redis
- Socket.IO
- ES Modules

The backend is authoritative. Never trust the client for gameplay decisions.

---

# Before Coding

Before implementing any feature:

1. Inspect the existing implementation.
2. Find the closest existing module.
3. Follow the project's existing style.
4. Do not introduce a new architecture unless explicitly requested.

When uncertain, prefer consistency over creativity.

---

# General Rules

Make the **smallest correct change**.

Do not:

- refactor unrelated files
- rename existing APIs
- move files unnecessarily
- introduce new libraries without approval
- change project architecture without approval

Only modify files that are necessary for the requested task.

---

# Coding Style

Use:

- async / await
- try / catch
- next(err) for error handling

Every controller should validate requests using:

```js
expressValidatorHandler(validationResult(req));
```

Successful responses should use:

```js
{
    code: 0,
    data: ...
}
```

Use:

- 201 for successful creation
- 200 for successful read/update/delete
- 404 when a requested document does not exist

---

# Update Pattern

Do not write:

```js
if(req.body.field){
    ...
}
```

Use:

```js
Object.prototype.hasOwnProperty.call(req.body, "field");
```

This project intentionally allows values like:

- 0
- false
- empty string
- empty array

to be updated.

---

# Mongoose

Prefer:

```js
const document = await Model.findById(id);

...

await document.save();
```

instead of:

```js
findByIdAndUpdate();
```

unless explicitly requested.

Use timestamps.

Add indexes only when they have a clear purpose.

Populate only the fields actually needed.

---

# Validation

Use express-validator.

Separate:

- create validation
- update validation

Update validation should normally use `.optional()`.

---

# Naming

Use existing project naming conventions.

Example for Question:

Controller:

- getQuestions
- getQuestionDetails
- postQuestion
- putQuestion
- deleteQuestion

Files:

- question.js
- question-controller.js
- question-validator.js
- question-routes.js

---

# Existing Code Is The Source Of Truth

If this document conflicts with the existing implementation,

follow the existing implementation.

Do not "fix" code simply because it differs from this document.

---

# Gameplay Rules

Do not invent gameplay mechanics.

Do not hardcode values that are not clearly defined.

If a gameplay rule is missing:

- inspect the existing implementation
- inspect related models/services
- ask for clarification only if necessary

Never assume game design decisions.

---

# Safety

Never:

- modify .env
- expose secrets
- delete production data
- change database structure unless requested

---

# Output

After completing a task, provide:

- summary of changes
- files modified
- assumptions made
- anything that could not be verified

Never claim tests passed unless they were actually executed.

---

# Philosophy

This repository values:

1. Correctness
2. Consistency
3. Readability
4. Maintainability

over clever code.

When in doubt, write code that looks like the rest of the project.
