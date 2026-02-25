Contributing to Promise Protocol

# Welcome to the team. This document outlines everything you need to know to contribute to the Promise Protocol web app effectively and consistently.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Testing Expectations](#testing-expectations)
- [Definition of Done](#definition-of-done)

---

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/A-Fujihara/PromiseProtocol_WebApp.git
   cd PromiseProtocol_WebApp
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Copy the environment variables template and fill in your local values

   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

If you run into any setup issues, reach out in Discord before spending too much time debugging alone.

---

## Branch Naming Convention

All branches must follow this format:

```
type/PP-XXX-short-description
```

**Types:**

- `feature/` — new functionality
- `fix/` — bug fix
- `chore/` — maintenance, dependencies, config
- `docs/` — documentation only changes
- `test/` — adding or updating tests only

**Examples:**

```
feature/PP-008-create-promise-screen
fix/PP-012-assessment-submission-bug
chore/PP-001-react-setup
docs/PP-001-update-readme
test/PP-007-dashboard-component-tests
```

**Rules:**

- Always branch off of `main`
- Never commit directly to `main`
- Keep branch names lowercase with hyphens, no spaces or special characters
- Always include the PP-XXX issue ID so the branch is traceable to the backlog

---

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

**Format:**

```
type: short description in present tense
```

**Types:**

- `feat:` — a new feature
- `fix:` — a bug fix
- `chore:` — maintenance or config change
- `docs:` — documentation changes
- `test:` — adding or updating tests
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `style:` — formatting, whitespace, no logic change

**Examples:**

```
feat: add stake type toggle to create promise form
fix: resolve reputation score not updating after assessment
chore: install and configure React Router
docs: add setup instructions to README
test: add unit tests for createPromise API endpoint
refactor: extract promise card into reusable component
```

**Rules:**

- Keep the description short — under 72 characters
- Use present tense ("add feature" not "added feature")
- No period at the end
- Reference the issue ID in the commit body if helpful:

  ```
  feat: add dashboard reputation score ring

  Closes #7 (PP-007)
  ```

---

## Pull Request Process

1. **Create a PR from your feature branch into `main`**
2. **Fill out the PR template** — it will appear automatically when you open a PR
3. **Link the related issue** — reference the PP-XXX issue number in the PR description (e.g. `Closes #8`)
4. **Request a review** — assign at least one team member as a reviewer
5. **Wait for approval** — PRs require at least **1 approving review** before merging
6. **Do not merge your own PR** without approval unless explicitly agreed on by the team
7. **Resolve all comments** before merging — if you disagree with a comment, discuss it, don't just dismiss it
8. **Squash and merge** is preferred to keep the commit history clean

**PR titles should follow the same format as commit messages:**

```
feat: build create promise screen (PP-008)
```

---

## Code Review Guidelines

**For reviewers:**

- Review within 48 hours of being assigned where possible — we know everyone has other commitments
- Focus on correctness, clarity, and consistency with the rest of the codebase
- Be specific and constructive — "this could be clearer" is less helpful than "consider renaming this variable to `promiseeType` for consistency with the data model"
- Approve when you're satisfied, even if you have minor suggestions — use "Approve with comments" for nitpicks

**For authors:**

- Keep PRs small and focused — one issue per PR
- Add context in the PR description so the reviewer understands what changed and why
- Don't take feedback personally — reviews are about the code, not the person
- Respond to all comments before merging, even just to acknowledge them

---

## Testing Expectations

Every PR that adds or changes functionality must include tests. Refer to the acceptance criteria in the linked issue for specific test requirements.

**General rules:**

- Write tests alongside the code, not after
- Tests must pass before requesting a review
- Do not merge if any tests are failing
- Use mocked data for unit and component tests — do not rely on live API calls in tests
- Name your test files to match the file they test: `Dashboard.test.jsx`, `api.test.js`

**Run tests locally before pushing:**

```bash
npm run test
```

---

## Definition of Done

A task is only considered complete when all of the following are true:

- [ ] All acceptance criteria from the linked GitHub issue are met
- [ ] Code is reviewed and approved by at least one team member
- [ ] All tests pass locally and in CI (once configured)
- [ ] No console errors or warnings introduced
- [ ] PR is linked to the correct issue and closes it on merge
- [ ] Code follows existing conventions — naming, structure, formatting

---

If you have questions about anything in this document, ask in Discord. This is a living document and will be updated as the team's workflow evolves.
