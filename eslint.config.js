import js from '@eslint/js'
import vue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      globals: {
        Blob: 'readonly',
        URL: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
]
