import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Placeholder } from '@tiptap/extensions'
import { InstagramCard } from './InstagramCard'

/**
 * The blog's document schema — shared by the editor and every renderer, so a
 * post always means the same thing everywhere. H1 is the post title, so the
 * body only gets H2/H3.
 */
export const createExtensions = ({ placeholder } = {}) => [
    StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false, // underlined text looks like a link on the web
        link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: 'https',
            HTMLAttributes: { target: null, rel: null }, // decided when rendering (external → new tab)
        },
    }),
    Image.configure({ allowBase64: false }),
    Youtube.configure({ nocookie: true, controls: true, width: 640, height: 360 }),
    InstagramCard,
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
]
