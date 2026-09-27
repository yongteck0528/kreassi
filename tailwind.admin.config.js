import base from './tailwind.config.js'

/** Admin build: same brand theme as the public site, but scans only admin files. */
export default {
  ...base,
  content: ['./admin/index.html', './src/admin/**/*.{vue,js,ts}'],
}
