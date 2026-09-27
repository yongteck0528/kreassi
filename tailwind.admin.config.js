import base from './tailwind.config.js'

/** Admin build: same brand theme as the public site, but scans only admin files. */
export default {
  ...base,
  // Also the blog templates: the post preview renders the public article markup.
  content: ['./admin/index.html', './src/admin/**/*.{vue,js,ts}', './src/blog/templates.js'],
}
