import { supabase } from './supabase'
import { SUPABASE_URL } from '../../config/supabase'

export const BUCKET = 'blog-images'
const MAX_INPUT_BYTES = 20 * 1024 * 1024

export const publicUrl = (path) => (path ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` : '')

/**
 * Shrink an image in the browser before upload: max `maxWidth` px wide,
 * WebP (JPEG where the browser can't encode WebP). Phone photos of 5–10 MB
 * typically end up at 150–400 KB.
 */
export async function prepareImage(file, { maxWidth = 1600 } = {}) {
    if (!file?.type?.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG, WebP).')
    if (file.size > MAX_INPUT_BYTES) throw new Error('That image is over 20 MB. Please choose a smaller one.')

    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxWidth / bitmap.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()

    const toBlob = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))
    let blob = await toBlob('image/webp', 0.82)
    if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.85)
    if (!blob) throw new Error('Could not process this image. Please try another one.')
    return { blob, width: canvas.width, height: canvas.height, ext: blob.type === 'image/webp' ? 'webp' : 'jpg' }
}

/** Resize + upload to the blog-images bucket. Returns the storage path and public URL. */
export async function uploadImage(file, postId, options) {
    const image = await prepareImage(file, options)
    const path = `posts/${postId}/${crypto.randomUUID()}.${image.ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, image.blob, {
        contentType: image.blob.type,
        cacheControl: '31536000', // file names are unique, so they can be cached forever
        upsert: false,
    })
    if (error) throw new Error('Upload failed. Please check your connection and try again.')
    return { path, url: publicUrl(path), width: image.width, height: image.height }
}
