# Snake Game Images

Place your images here:

- `snake-head.png` (or `.jpg`) - Image of your girlfriend's head (used for the snake body)
- `apple-head.png` (or `.jpg`) - Image of your head (used for the apples)

**Note:** The image paths are defined in `app/snake/page.tsx`. Update these paths if you use different filenames:

```typescript
const SNAKE_HEAD_IMAGE = "/images/snake-head.png"; // Girlfriend's head
const APPLE_IMAGE = "/images/apple-head.png"; // Your head
```

If the images fail to load, the game will show colored squares as fallbacks.
