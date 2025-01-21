# Theme Rules

## 1. Color System

### 1.1 Base Colors
```typescript
const colors = {
  // Primary colors
  primary: {
    50: '#E6F1FE',
    100: '#CCE4FD',
    200: '#99C9FB',
    300: '#66AEF9',
    400: '#3393F7',
    500: '#0078F5', // Primary brand color
    600: '#0060C4',
    700: '#004893',
    800: '#003062',
    900: '#001831',
  },
  
  // Dark mode background scale
  background: {
    DEFAULT: '#0A0A0B', // Main background
    subtle: '#121214', // Subtle backgrounds
    muted: '#1A1A1F', // Muted containers
    emphasis: '#242429', // Emphasized containers
  },
  
  // Dark mode surface colors
  surface: {
    DEFAULT: '#18181B', // Cards, modals
    hover: '#242429', // Hover states
    active: '#2A2A2F', // Active states
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#71717A',
    disabled: '#52525B',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
}
```

### 1.2 Color Usage
- Use dark backgrounds by default
- Maintain proper contrast ratios
- Use semantic colors consistently
- Implement color-blind safe palettes
- Support high contrast mode

## 2. Typography System

### 2.1 Font Scale
```typescript
const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}
```

### 2.2 Font Usage
- Use system font stack
- Implement proper type scale
- Maintain consistent line heights
- Use appropriate font weights
- Ensure readability

## 3. Spacing System

### 3.1 Space Scale
```typescript
const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
}
```

### 3.2 Spacing Usage
- Use consistent spacing units
- Implement proper vertical rhythm
- Maintain consistent padding
- Use appropriate margins
- Follow grid system

## 4. Shadow System

### 4.1 Elevation Scale
```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}
```

### 4.2 Shadow Usage
- Use shadows for elevation
- Maintain consistent depth
- Implement proper hierarchy
- Use appropriate contrast
- Support dark mode shadows

## 5. Border System

### 5.1 Border Scale
```typescript
const borders = {
  radii: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  widths: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  }
}
```

### 5.2 Border Usage
- Use consistent border radii
- Implement proper border colors
- Maintain consistent widths
- Use appropriate styles
- Support dark mode borders

## 6. Animation System

### 6.1 Transition Scale
```typescript
const animation = {
  durations: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  timingFunctions: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
}
```

### 6.2 Animation Usage
- Use consistent timing
- Implement proper easing
- Maintain smooth transitions
- Use appropriate durations
- Support reduced motion

## 7. Dark Mode Implementation

### 7.1 Dark Mode Classes
```typescript
// Tailwind dark mode configuration
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      backgroundColor: {
        dark: {
          DEFAULT: '#0A0A0B',
          subtle: '#121214',
          muted: '#1A1A1F',
          emphasis: '#242429',
        }
      },
      textColor: {
        dark: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        }
      }
    }
  }
}
```

### 7.2 Dark Mode Usage
- Default to dark mode
- Maintain proper contrast
- Use appropriate colors
- Support system preferences
- Implement smooth transitions

## 8. Theme Configuration

### 8.1 Theme Setup
```typescript
// Theme provider configuration
const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  animation,
  // Additional theme values
}

export type Theme = typeof theme
export default theme
```

### 8.2 Theme Usage
- Use theme provider
- Implement proper typing
- Maintain consistency
- Support customization
- Document theme usage

## 9. Component Theming

### 9.1 Component Variants
```typescript
// Button variants example
const buttonVariants = {
  solid: {
    base: 'bg-primary-500 text-white',
    hover: 'hover:bg-primary-600',
    active: 'active:bg-primary-700',
    disabled: 'disabled:bg-primary-300',
  },
  outline: {
    base: 'border-2 border-primary-500 text-primary-500',
    hover: 'hover:bg-primary-50',
    active: 'active:bg-primary-100',
    disabled: 'disabled:border-primary-300',
  },
  ghost: {
    base: 'text-primary-500',
    hover: 'hover:bg-primary-50',
    active: 'active:bg-primary-100',
    disabled: 'disabled:text-primary-300',
  },
}
```

### 9.2 Component Theme Usage
- Use consistent variants
- Implement proper states
- Maintain theme compatibility
- Support customization
- Document variants 