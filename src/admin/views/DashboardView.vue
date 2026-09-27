<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/EmptyState.vue'
import DashCard from '../components/DashCard.vue'
import StatTile from '../components/charts/StatTile.vue'
import TrendChart from '../components/charts/TrendChart.vue'
import BarList from '../components/charts/BarList.vue'
import {
    PRESETS, rangeFor, todayInPontianak, fetchDashboard, dashboardErrorMessage,
    formatNumber, formatPercent, formatLongDay,
    CHANNEL_LABELS, LANGUAGE_LABELS, DEVICE_LABELS, PAGE_LABELS, SECTIONS,
} from '../lib/analytics'

const RANGE_KEY = 'kreassi-admin-range'
const savedRange = (() => { try { return localStorage.getItem(RANGE_KEY) } catch { return null } })()

const preset = ref(PRESETS.find((p) => p.key === savedRange) ?? PRESETS[2])
const range = ref(rangeFor(preset.value))
const data = ref(null)
const loading = ref(false)
const error = ref('')
const metricKey = ref('visitors')

const load = async () => {
    loading.value = true
    error.value = ''
    range.value = rangeFor(preset.value)
    try {
        data.value = await fetchDashboard(range.value)
    } catch (e) {
        error.value = dashboardErrorMessage(e)
    } finally {
        loading.value = false
    }
}
const choose = (p) => {
    preset.value = p
    try { localStorage.setItem(RANGE_KEY, p.key) } catch { /* ignore */ }
    load()
}
onMounted(load)

// ---- KPIs --------------------------------------------------------------
const conversion = (s) => (s?.visitors ? s.converting_visitors / s.visitors : 0)
const METRICS = [
    { key: 'visitors', label: 'Visitors', hint: 'Unique visitors per day, added up over the period', value: (s) => s.visitors, series: (d) => d.visitors, format: formatNumber, integer: true },
    { key: 'pageviews', label: 'Page views', hint: 'Pages opened', value: (s) => s.pageviews, series: (d) => d.pageviews, format: formatNumber, integer: true },
    { key: 'contact_clicks', label: 'Contact clicks', hint: 'Clicks on WhatsApp, Instagram, email or phone links', value: (s) => s.contact_clicks, series: (d) => d.contact_clicks, format: formatNumber, integer: true },
    { key: 'conversion', label: 'Conversion rate', hint: 'Share of visitors who clicked a contact link', value: conversion, series: (d) => conversion(d), format: formatPercent, integer: false, points: true },
]

const deltaFor = (metric) => {
    const cur = metric.value(data.value.summary)
    const prev = metric.value(data.value.previous)
    if (metric.points) {
        const diff = (cur - prev) * 100
        if (Math.abs(diff) < 0.05) return { text: '0 pts', direction: 'flat' }
        return { text: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pts`, direction: diff > 0 ? 'up' : 'down' }
    }
    if (!prev) return cur ? { text: 'New', direction: 'new' } : { text: 'No change', direction: 'flat' }
    const pct = ((cur - prev) / prev) * 100
    if (Math.abs(pct) < 0.5) return { text: '0%', direction: 'flat' }
    return { text: `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`, direction: pct > 0 ? 'up' : 'down' }
}

const tiles = computed(() => METRICS.map((m) => ({
    ...m,
    display: m.format(m.value(data.value.summary)),
    delta: deltaFor(m),
})))
const activeMetric = computed(() => METRICS.find((m) => m.key === metricKey.value))
const trendPoints = computed(() => data.value.timeseries.map((d) => ({ day: d.day, value: activeMetric.value.series(d) })))

// ---- Breakdowns -----------------------------------------------------------
const rowsOf = (list, { labels, value = 'visitors', sub } = {}) => (list ?? []).map((r) => ({
    key: r.label,
    label: labels?.[r.label] ?? r.label,
    value: r[value],
    display: formatNumber(r[value]),
    sub: sub?.(r),
}))

const sources = computed(() => rowsOf(data.value.sources))
const leads = computed(() => rowsOf(data.value.leads_by_source, { sub: (r) => (r.clicks !== r.visitors ? `${r.clicks} clicks` : '') }))
const channels = computed(() => rowsOf(data.value.contact_channels, { labels: CHANNEL_LABELS, value: 'clicks' }))
const services = computed(() => rowsOf(data.value.services))
const cities = computed(() => rowsOf(data.value.cities))
const countries = computed(() => rowsOf(data.value.countries))
const devices = computed(() => rowsOf(data.value.devices, { labels: DEVICE_LABELS }))
const languages = computed(() => rowsOf(data.value.languages, { labels: LANGUAGE_LABELS }))
const pages = computed(() => rowsOf(data.value.pages, { labels: PAGE_LABELS, value: 'pageviews', sub: (r) => (r.visitors !== r.pageviews ? `${formatNumber(r.visitors)} visitors` : '') }))
const campaigns = computed(() => rowsOf(data.value.campaigns, { sub: (r) => (r.contact_clicks ? `${r.contact_clicks} leads` : '') }))

// Share of homepage visitors who reached each section / scroll milestone.
const reachRows = (entries, homeVisitors) => entries.map(([key, label, visitors]) => ({
    key,
    label,
    value: homeVisitors ? visitors / homeVisitors : 0,
    display: formatPercent(homeVisitors ? visitors / homeVisitors : 0),
    sub: `${formatNumber(visitors)}`,
}))
const sections = computed(() => {
    const seen = Object.fromEntries((data.value.sections ?? []).map((s) => [s.label, s.visitors]))
    return reachRows(SECTIONS.map(([key, label]) => [key, label, seen[key] ?? 0]), data.value.home_visitors)
})
const scroll = computed(() => {
    const seen = Object.fromEntries((data.value.scroll ?? []).map((s) => [s.depth, s.visitors]))
    return reachRows([25, 50, 75, 100].map((d) => [d, `${d}% of the page`, seen[d] ?? 0]), data.value.home_visitors)
})

const hasVisits = computed(() => (data.value?.summary.visitors ?? 0) > 0)
const rangeText = computed(() => (range.value.from === range.value.to
    ? formatLongDay(range.value.to)
    : `${formatLongDay(range.value.from)} – ${formatLongDay(range.value.to)}`))
</script>

<template>
    <div class="space-y-6">
        <!-- Filters: one row, scoping everything below -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div class="flex max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Date range">
                <button v-for="p in PRESETS" :key="p.key" type="button" :aria-pressed="p.key === preset.key"
                    :class="['whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        p.key === preset.key ? 'bg-darkPurple text-white' : 'text-gray-600 hover:bg-gray-100']"
                    @click="choose(p)">
                    {{ p.label }}
                </button>
            </div>
            <span class="text-sm text-gray-500">{{ rangeText }} <span class="text-gray-400">· Pontianak time</span></span>
            <span class="flex items-center gap-4 sm:ml-auto">
                <span v-if="data" class="inline-flex items-center gap-2 text-sm text-gray-600" title="Visitors active in the last 30 minutes">
                    <span class="relative flex h-2 w-2" aria-hidden="true">
                        <span v-if="data.live_visitors" class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 motion-safe:animate-ping"></span>
                        <span :class="['relative inline-flex h-2 w-2 rounded-full', data.live_visitors ? 'bg-green-500' : 'bg-gray-300']"></span>
                    </span>
                    {{ data.live_visitors }} online now
                </span>
                <button type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="loading" @click="load">
                    <Icon icon="mdi:refresh" :class="['h-4 w-4', loading ? 'motion-safe:animate-spin' : '']" />
                    Refresh
                </button>
            </span>
        </div>

        <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

        <p v-if="!data && loading" class="py-16 text-center text-sm text-gray-500">Loading analytics…</p>

        <!-- Refetch keeps the frame: previous numbers stay, dimmed, while loading -->
        <div v-if="data" :class="['space-y-6 transition-opacity', loading ? 'opacity-60' : '']" :aria-busy="loading">
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile v-for="t in tiles" :key="t.key" :label="t.label" :value="t.display" :delta="t.delta"
                    :hint="t.hint" :active="t.key === metricKey" @select="metricKey = t.key" />
            </div>

            <EmptyState v-if="!hasVisits" icon="mdi:chart-timeline-variant" title="No visits in this period yet"
                text="Visits to kreassiteam.com appear here within a minute. Local previews and this browser (you're signed in as an admin) are never counted." />

            <template v-else>
                <DashCard :title="`${activeMetric.label} per day`" :subtitle="activeMetric.hint">
                    <TrendChart :points="trendPoints" :format="activeMetric.format" :integer="activeMetric.integer" :label="activeMetric.label"
                        :partial-day="todayInPontianak()" />
                </DashCard>

                <div class="grid gap-4 md:grid-cols-2">
                    <DashCard title="Where visitors come from" subtitle="Visitors by source">
                        <BarList :rows="sources" />
                    </DashCard>
                    <DashCard title="Where leads come from" subtitle="Visitors who clicked a contact link, by source">
                        <BarList :rows="leads" empty="No contact clicks in this period yet." />
                    </DashCard>

                    <DashCard title="How people contact you" subtitle="Contact link clicks by channel">
                        <BarList :rows="channels" empty="No contact clicks in this period yet." />
                    </DashCard>
                    <DashCard title="Service interest" subtitle="Visitors who opened each tab in Services (the first tab shows by default)">
                        <BarList :rows="services" empty="No service tabs opened in this period yet." />
                    </DashCard>

                    <DashCard title="How far visitors get" :subtitle="`Share of ${formatNumber(data.home_visitors)} homepage visitors who reached each section`">
                        <BarList :rows="sections" :max="1" />
                    </DashCard>
                    <DashCard title="Scroll depth" subtitle="Share of homepage visitors who scrolled at least this far">
                        <BarList :rows="scroll" :max="1" />

                        <h3 class="mb-3 mt-6 text-sm font-semibold text-gray-900">Engagement</h3>
                        <dl class="grid grid-cols-3 gap-3 text-center">
                            <div class="rounded-xl bg-gray-50 px-2 py-3">
                                <dt class="text-xs text-gray-500">Unmuted hero video</dt>
                                <dd class="mt-1 text-lg font-semibold text-gray-900">{{ formatNumber(data.engagement.video_unmute_visitors) }}</dd>
                            </div>
                            <div class="rounded-xl bg-gray-50 px-2 py-3">
                                <dt class="text-xs text-gray-500">Switched language</dt>
                                <dd class="mt-1 text-lg font-semibold text-gray-900">{{ formatNumber(data.engagement.language_switch_visitors) }}</dd>
                            </div>
                            <div class="rounded-xl bg-gray-50 px-2 py-3">
                                <dt class="text-xs text-gray-500">Other links clicked</dt>
                                <dd class="mt-1 text-lg font-semibold text-gray-900">{{ formatNumber(data.engagement.outbound_clicks) }}</dd>
                            </div>
                        </dl>
                    </DashCard>

                    <DashCard title="Top cities" subtitle="Visitors by city (approximate, from network location)">
                        <BarList :rows="cities" empty="No city data in this period yet." />
                    </DashCard>
                    <DashCard title="Countries" subtitle="Visitors by country">
                        <BarList :rows="countries" />
                    </DashCard>

                    <DashCard title="Devices" subtitle="Visitors by device type">
                        <BarList :rows="devices" />
                    </DashCard>
                    <DashCard title="Language" subtitle="Visitors by homepage language">
                        <BarList :rows="languages" />
                    </DashCard>

                    <DashCard title="Top pages" subtitle="Page views (blog posts will appear here too)">
                        <BarList :rows="pages" />
                    </DashCard>
                    <DashCard title="Campaigns" subtitle="Visitors from links tagged with ?utm_campaign=…">
                        <BarList :rows="campaigns"
                            empty="Add ?utm_campaign=your-campaign-name to links you share (e.g. in Instagram bio or ads) to see them here." />
                    </DashCard>
                </div>
            </template>

            <p class="text-xs text-gray-400">
                Cookieless, anonymous analytics: no personal data is stored, and visitors are counted once per day.
                Visits from this browser aren't counted because you're signed in as an admin.
            </p>
        </div>
    </div>
</template>
