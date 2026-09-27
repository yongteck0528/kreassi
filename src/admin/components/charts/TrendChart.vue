<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatDay, formatLongDay } from '../../lib/analytics'

// Single-series trend: 2px line over a 10% area wash, hairline grid, a
// crosshair that snaps to the nearest day (pointer or arrow keys), and a
// table view with the same numbers.
const props = defineProps({
    points: { type: Array, required: true }, // [{ day: 'YYYY-MM-DD', value: number }]
    format: { type: Function, required: true },
    integer: { type: Boolean, default: true },
    label: { type: String, required: true },
    partialDay: { type: String, default: '' }, // today: still in progress, so it reads low
})

const SERIES = '#7C3DB0' // brand purple — validated for marks on the white card
const HEIGHT = 240 // includes the x-axis band, so the card never scrolls
const PAD = { top: 16, right: 16, bottom: 28, left: 44 }

const wrap = ref(null)
const width = ref(640)
let observer
onMounted(() => {
    observer = new ResizeObserver(([entry]) => { width.value = Math.max(280, Math.floor(entry.contentRect.width)) })
    observer.observe(wrap.value)
})
onBeforeUnmount(() => observer?.disconnect())

const showTable = ref(false)
const plotW = computed(() => width.value - PAD.left - PAD.right)
const plotH = HEIGHT - PAD.top - PAD.bottom
const baseline = PAD.top + plotH

// Clean ticks: 4 even steps of 1 / 2 / 2.5 / 5 × 10ⁿ (whole numbers for counts).
const niceStep = (raw) => {
    const exp = 10 ** Math.floor(Math.log10(raw))
    return [1, 2, 2.5, 5, 10].find((n) => n >= raw / exp - 1e-9) * exp
}
const yScale = computed(() => {
    const max = Math.max(0, ...props.points.map((p) => p.value))
    let step = niceStep(max > 0 ? max / 4 : props.integer ? 0.25 : 0.0025)
    if (props.integer) step = Math.max(1, Math.ceil(step))
    return { step, max: step * 4 }
})

const x = (i) => PAD.left + (props.points.length === 1 ? plotW.value / 2 : (i * plotW.value) / (props.points.length - 1))
const y = (v) => PAD.top + plotH - (v / yScale.value.max) * plotH

const linePath = computed(() => props.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(''))
const areaPath = computed(() => (props.points.length > 1
    ? `${linePath.value}L${x(props.points.length - 1).toFixed(1)},${baseline}L${x(0).toFixed(1)},${baseline}Z`
    : ''))
const yTicks = computed(() => [0, 1, 2, 3, 4].map((k) => k * yScale.value.step))
const xTicks = computed(() => {
    const n = props.points.length
    const count = Math.min(n, width.value < 520 ? 4 : 7)
    if (count <= 1) return n ? [0] : []
    return [...new Set(Array.from({ length: count }, (_, k) => Math.round((k * (n - 1)) / (count - 1))))]
})
const anchorFor = (i) => (props.points.length === 1 ? 'middle' : i === 0 ? 'start' : i === props.points.length - 1 ? 'end' : 'middle')

// Hover / keyboard focus
const active = ref(null)
const onPointerMove = (event) => {
    const n = props.points.length
    if (!n) return
    const px = event.clientX - event.currentTarget.getBoundingClientRect().left
    const i = n === 1 ? 0 : Math.round(((px - PAD.left) / plotW.value) * (n - 1))
    active.value = Math.min(n - 1, Math.max(0, i))
}
const onKeydown = (event) => {
    const n = props.points.length
    if (!n) return
    const moves = { ArrowRight: 1, ArrowLeft: -1 }
    if (event.key in moves) active.value = Math.min(n - 1, Math.max(0, (active.value ?? n - 1) + moves[event.key]))
    else if (event.key === 'Home') active.value = 0
    else if (event.key === 'End') active.value = n - 1
    else if (event.key === 'Escape') active.value = null
    else return
    event.preventDefault()
}
const tip = computed(() => {
    if (active.value == null || !props.points[active.value]) return null
    const p = props.points[active.value]
    return {
        cx: x(active.value),
        cy: y(p.value),
        left: Math.min(width.value - 80, Math.max(80, x(active.value))),
        value: props.format(p.value),
        day: formatLongDay(p.day) + (p.day === props.partialDay ? ' · today so far' : ''),
    }
})
const summary = computed(() => {
    const pts = props.points
    if (!pts.length) return `${props.label}: no data`
    const peak = pts.reduce((a, b) => (b.value > a.value ? b : a))
    return `${props.label} from ${formatDay(pts[0].day)} to ${formatDay(pts[pts.length - 1].day)}. Highest: ${props.format(peak.value)} on ${formatDay(peak.day)}.`
})
</script>

<template>
    <div>
        <div class="mb-2 flex justify-end">
            <button type="button" class="text-xs font-medium text-purple-5 hover:underline" @click="showTable = !showTable">
                {{ showTable ? 'Show chart' : 'Show as table' }}
            </button>
        </div>

        <div v-show="!showTable" ref="wrap" class="relative">
            <svg :width="width" :height="HEIGHT" :viewBox="`0 0 ${width} ${HEIGHT}`" class="block touch-pan-y outline-none"
                role="img" :aria-label="summary" tabindex="0"
                @pointermove="onPointerMove" @pointerleave="active = null" @keydown="onKeydown" @blur="active = null">
                <!-- Hairline grid + y ticks -->
                <g v-for="t in yTicks" :key="t">
                    <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(t)" :y2="y(t)"
                        :stroke="t === 0 ? '#d1d5db' : '#eceef1'" stroke-width="1" shape-rendering="crispEdges" />
                    <text :x="PAD.left - 8" :y="y(t)" dy="0.32em" text-anchor="end" font-size="11" fill="#898781"
                        style="font-variant-numeric: tabular-nums">{{ format(t) }}</text>
                </g>
                <!-- X ticks -->
                <text v-for="i in xTicks" :key="`x${i}`" :x="x(i)" :y="HEIGHT - 8" :text-anchor="anchorFor(i)"
                    font-size="11" fill="#898781">{{ formatDay(points[i].day) }}</text>

                <!-- Series -->
                <path v-if="areaPath" :d="areaPath" :fill="SERIES" fill-opacity="0.1" />
                <path v-if="points.length > 1" :d="linePath" fill="none" :stroke="SERIES" stroke-width="2"
                    stroke-linejoin="round" stroke-linecap="round" />
                <circle v-if="points.length === 1" :cx="x(0)" :cy="y(points[0].value)" r="4" :fill="SERIES" stroke="#fff" stroke-width="2" />

                <!-- Crosshair -->
                <g v-if="tip" pointer-events="none">
                    <line :x1="tip.cx" :x2="tip.cx" :y1="PAD.top" :y2="baseline" stroke="#9ca3af" stroke-width="1" shape-rendering="crispEdges" />
                    <circle :cx="tip.cx" :cy="tip.cy" r="4.5" :fill="SERIES" stroke="#fff" stroke-width="2" />
                </g>
            </svg>

            <div v-if="tip" class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
                :style="{ left: `${tip.left}px`, top: `${Math.max(0, tip.cy - 64)}px` }" role="status">
                <div class="flex items-center gap-2">
                    <span class="h-0.5 w-3 rounded" :style="{ background: SERIES }" aria-hidden="true"></span>
                    <span class="text-sm font-semibold text-gray-900">{{ tip.value }}</span>
                </div>
                <div class="mt-0.5 whitespace-nowrap text-xs text-gray-500">{{ tip.day }}</div>
            </div>
        </div>

        <div v-if="showTable" class="max-h-80 overflow-auto rounded-lg border border-gray-100">
            <table class="w-full text-left text-sm">
                <caption class="sr-only">{{ label }} per day</caption>
                <thead class="sticky top-0 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr><th class="px-4 py-2 font-medium">Day</th><th class="px-4 py-2 text-right font-medium">{{ label }}</th></tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="p in [...points].reverse()" :key="p.day">
                        <td class="px-4 py-1.5 text-gray-700">{{ formatLongDay(p.day) }}</td>
                        <td class="px-4 py-1.5 text-right tabular-nums text-gray-900">{{ format(p.value) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
