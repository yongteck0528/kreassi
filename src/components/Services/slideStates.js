/**
 * Loading / error / crash states for the async service slides.
 * Kept as render-function components so they stay tiny and dependency-free.
 */
import { ref, defineComponent, defineAsyncComponent, onErrorCaptured, h } from 'vue'
import { useI18n } from 'vue-i18n'

export const LoadingView = defineComponent({
    name: 'ServicesLoadingView',
    setup() {
        const { t } = useI18n()
        return () => h('div', { class: 'h-full grid place-items-center text-white/80 text-sm md:text-base' }, t('services.loading'))
    },
})

export const ErrorView = defineComponent({
    name: 'ServicesErrorView',
    props: { error: { type: Object, default: null } },
    setup(props) {
        const { t } = useI18n()
        return () =>
            h('div', { class: 'h-full grid place-items-center text-red-300 text-sm md:text-base px-4 text-center' }, [
                h('div', [
                    h('p', { class: 'font-semibold' }, t('services.errorTitle')),
                    h('p', { class: 'opacity-80 mt-1' }, t('services.errorHint')),
                    props.error?.message ? h('pre', { class: 'opacity-60 mt-2 text-xs' }, props.error.message) : null,
                ]),
            ])
    },
})

export const ErrorBoundary = defineComponent({
    name: 'ErrorBoundary',
    setup(_, { slots }) {
        const err = ref(null)
        const { t } = useI18n()
        onErrorCaptured((error) => {
            err.value = error
            return false
        })
        return () => {
            if (err.value) {
                return h('div', { class: 'h-full grid place-items-center text-red-300 text-sm md:text-base px-4 text-center' }, [
                    h('div', [
                        h('p', { class: 'font-semibold' }, t('services.crashedTitle')),
                        h('p', { class: 'opacity-80 mt-1' }, t('services.crashedHint')),
                    ]),
                ])
            }
            return slots.default?.()
        }
    },
})

/** Wrap a lazy import with the shared loading/error components. */
export const loadSlide = (loader) => defineAsyncComponent({
    loader,
    loadingComponent: LoadingView,
    errorComponent: ErrorView,
    delay: 150,
    timeout: 30000,
})
