export default {
  '*.{ts,tsx,js,jsx,mjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,css,md,yml,yaml}': ['prettier --write'],
}
