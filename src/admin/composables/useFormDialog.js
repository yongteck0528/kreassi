import { shallowRef } from 'vue'

/**
 * Promise-based dialogs: `const values = await ask({ title, fields, confirmLabel })`
 * resolves with the entered values, or null if cancelled. Render the returned
 * `dialog` with <FormDialog v-if="dialog" :config="dialog" @close="close" />.
 */
export function useFormDialog() {
    const dialog = shallowRef(null)
    const ask = (config) => new Promise((resolve) => { dialog.value = { ...config, resolve } })
    const close = (values) => {
        dialog.value?.resolve(values ?? null)
        dialog.value = null
    }
    return { dialog, ask, close }
}
