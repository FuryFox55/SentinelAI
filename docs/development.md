# Development & Engineering Workflow Guide

## Local Setup Instructions

1. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Execute Verification Checks**:
   ```bash
   # Type check
   npx tsc --noEmit

   # Lint check
   npm run lint

   # Run tests
   npm test
   ```

4. **Production Build Simulation**:
   ```bash
   npm run build
   npm run start
   ```
