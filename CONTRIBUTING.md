# Contributing to SaaS App Template

Thank you for your interest in contributing to the SaaS App Template! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Types of Contributions

We welcome the following types of contributions:

1. **🐛 Bug Reports** - Help us identify and fix issues
2. **✨ Feature Requests** - Suggest new features or improvements
3. **📖 Documentation** - Improve documentation and examples
4. **🔧 Code Contributions** - Submit bug fixes and new features
5. **🧪 Testing** - Help test new features and report issues

### Getting Started

1. **Fork the Repository**
   ```bash
   gh repo fork vbonk/saas-app-template
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/saas-app-template.git
   cd saas-app-template
   ```

3. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

4. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📋 Pull Request Process

### Before Submitting

1. **Run Quality Checks**
   ```bash
   npm run lint          # Check code style
   npm run type-check     # Verify TypeScript
   npm run test          # Run unit tests
   npm run test:e2e      # Run E2E tests
   npm run docs:validate # Validate documentation
   ```

2. **Update Documentation**
   - Update relevant documentation files
   - Run `npm run docs:generate` to auto-update docs
   - Ensure all changes are documented

3. **Test Your Changes**
   - Test manually in development environment
   - Ensure all existing tests pass
   - Add new tests for new functionality

### PR Requirements

Your pull request must:

- [ ] **Pass all CI checks** (tests, linting, type checking)
- [ ] **Include tests** for new functionality
- [ ] **Update documentation** if needed
- [ ] **Follow the existing code style**
- [ ] **Have a clear description** of what it does
- [ ] **Reference related issues** (if any)
- [ ] **Be up to date** with the main branch

### PR Template

When creating a PR, please use this template:

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Documentation updated

## Screenshots (if applicable)
Add screenshots or GIFs for UI changes.

## Checklist
- [ ] Code follows the existing style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as breaking)
- [ ] Tests added and passing
```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional programming patterns

```typescript
// Good
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Implementation
};

// Avoid
const data = await getUser(id);
```

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Implement proper error boundaries

```tsx
// Good
interface UserCardProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Component content */}
    </div>
  );
};
```

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the design system patterns
- Use semantic color names
- Ensure responsive design

### API Routes

- Follow RESTful conventions
- Implement proper error handling
- Use middleware for common functionality
- Add input validation with Zod

```typescript
// Good
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);
    
    // Implementation
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

## 📖 Documentation Standards

### Code Documentation

- Add JSDoc comments for all public functions
- Document complex algorithms or business logic
- Include examples in documentation
- Keep comments up-to-date with code changes

### README and Docs

- Use clear, concise language
- Include code examples
- Update relevant documentation when making changes
- Test all code examples to ensure they work

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding missing tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add social login with Google
fix(api): resolve user profile update issue
docs(readme): update installation instructions
```

## 🧪 Testing Guidelines

### Unit Tests

- Test all business logic
- Mock external dependencies
- Aim for high test coverage
- Use descriptive test names

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Test implementation
    });

    it('should throw error for invalid email', async () => {
      // Test implementation
    });
  });
});
```

### E2E Tests

- Test critical user journeys
- Use Page Object Model pattern
- Ensure tests are reliable and fast
- Include accessibility testing

### Manual Testing

- Test in different browsers
- Verify mobile responsiveness
- Test with different user roles
- Validate error scenarios

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Changelog

- Update CHANGELOG.md for significant changes
- Follow Keep a Changelog format
- Include migration notes for breaking changes

## 🆘 Getting Help

### Questions and Discussion

- **GitHub Discussions**: For general questions and ideas
- **Issues**: For bug reports and feature requests
- **Discord/Slack**: [Add community links if available]

### Code Review Process

1. All PRs require review from a maintainer
2. Address feedback promptly
3. Resolve merge conflicts
4. Ensure CI passes before merge

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes for significant contributions
- Invited to join the maintainers team for ongoing contributors

---

**Thank you for contributing to the SaaS App Template!** 🚀

*This document is living and will evolve with the project. Please suggest improvements!*