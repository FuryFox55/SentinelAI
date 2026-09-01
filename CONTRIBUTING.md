# Contributing to SentinelAI

Thank you for your interest in contributing to **SentinelAI**! We welcome contributions to improve threat detection algorithms, UI components, documentation, and performance.

## Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/FuryFox55/SentinelAI.git
   cd SentinelAI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Validation Suite**:
   ```bash
   # Type check
   npx tsc --noEmit

   # Lint check
   npm run lint

   # Unit tests
   npm test
   ```

## Commit Conventions

We follow Conventional Commits:
* `feat:` New feature or analysis module
* `fix:` Bug fix or security hardening
* `docs:` Documentation improvements
* `style:` Formatting or UI polish
* `refactor:` Code refactoring without behavioral change
* `test:` Adding or updating tests

## Pull Request Checklist
- [ ] Code compiles cleanly with `npx tsc --noEmit`
- [ ] Linter passes with `npm run lint`
- [ ] All unit tests pass with `npm test`
- [ ] PR title follows Conventional Commits format
