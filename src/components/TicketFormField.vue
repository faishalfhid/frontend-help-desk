<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, null], default: null },
  type: { type: String, default: 'input' },
  inputType: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  helper: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue'])
const describedBy = computed(() => props.error ? `${props.id}-error` : props.helper ? `${props.id}-helper` : undefined)

function updateValue(event) {
  emit('update:modelValue', event.target.value || null)
}
</script>

<template>
  <div class="form-field">
    <label :for="id">{{ label }}<span
      v-if="required"
      aria-hidden="true"
    > *</span></label>
    <select
      v-if="type === 'select'"
      :id="id"
      :value="modelValue ?? ''"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(error)"
      :required="required"
      @change="updateValue"
    >
      <option
        value=""
        disabled
      >
        Pilih {{ label.toLowerCase() }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <textarea
      v-else-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(error)"
      :required="required"
      rows="4"
      @input="updateValue"
    />
    <input
      v-else
      :id="id"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(error)"
      :required="required"
      @input="updateValue"
    >
    <p
      v-if="error"
      :id="`${id}-error`"
      class="form-field__error"
    >
      {{ error }}
    </p>
    <p
      v-else-if="helper"
      :id="`${id}-helper`"
      class="form-field__helper"
    >
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.form-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.form-field label { color: var(--color-text-primary); font-size: 14px; font-weight: 600; line-height: 20px; }
.form-field input, .form-field select, .form-field textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 14px;
  background: var(--color-surface);
}
.form-field textarea { min-height: 104px; resize: vertical; line-height: 20px; }
.form-field input::placeholder, .form-field textarea::placeholder { color: var(--color-text-muted); opacity: 1; }
.form-field input:hover, .form-field select:hover, .form-field textarea:hover { border-color: var(--color-border-strong, #bcc9c1); }
.form-field input:focus, .form-field select:focus, .form-field textarea:focus {
  border-color: var(--color-primary-600);
  outline: 0;
  box-shadow: 0 0 0 3px rgba(36, 122, 89, .2);
}
.form-field [aria-invalid="true"] { border-color: var(--color-danger); }
.form-field__helper, .form-field__error { margin: 0; font-size: 12px; line-height: 18px; }
.form-field__helper { color: var(--color-text-muted); }
.form-field__error { color: var(--color-danger); }
</style>
