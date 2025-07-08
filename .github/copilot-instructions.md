# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is an Angular Schematics project that creates a code transformation tool using ts-morph to automatically implement the takeUntil pattern for RxJS subscription management in Angular applications.

## Key Technologies
- **Angular Schematics**: Framework for code generation and transformation
- **ts-morph**: TypeScript compiler API wrapper for AST manipulation
- **RxJS**: Reactive programming library used in Angular applications

## Project Goals
- Automatically detect Angular classes with RxJS subscriptions
- Add the destroy$ Subject pattern to prevent memory leaks
- Implement takeUntil operator in subscription pipes
- Maintain code style and formatting during transformations

## Code Style Guidelines
- Use TypeScript strict mode
- Follow Angular coding conventions
- Preserve existing code formatting and indentation
- Use arrow functions for inline callbacks
- Prefer const over let when possible

## Important Patterns
- Always check if imports already exist before adding new ones
- Verify existing code patterns before making modifications
- Use ts-morph for safe AST manipulation instead of string replacement
- Handle edge cases like existing ngOnDestroy methods and pipe operators
