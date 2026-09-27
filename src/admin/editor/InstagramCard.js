import { Node } from '@tiptap/vue-3'

export const INSTAGRAM_URL_RE = /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?(\?[^\s]*)?$/

/**
 * An Instagram post shown as a lightweight link card — no Instagram embed
 * script (which is heavy and slows pages down).
 */
export const InstagramCard = Node.create({
    name: 'instagramCard',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            url: { default: null },
            caption: { default: '' },
        }
    },

    parseHTML() {
        return [{
            tag: 'div[data-instagram-card]',
            getAttrs: (el) => ({ url: el.getAttribute('data-url'), caption: el.getAttribute('data-caption') || '' }),
        }]
    },

    renderHTML({ node }) {
        const { url, caption } = node.attrs
        return ['div', { 'data-instagram-card': '', 'data-url': url, 'data-caption': caption, class: 'ig-card' },
            ['span', { class: 'ig-card__label' }, 'Instagram'],
            ['a', { href: url, class: 'ig-card__link' }, caption || 'View this post on Instagram'],
        ]
    },

    addCommands() {
        return {
            setInstagramCard: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
        }
    },
})
