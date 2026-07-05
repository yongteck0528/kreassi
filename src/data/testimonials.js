import { resolveLogo } from '../utils/partnerLogos'

/**
 * Fallback testimonials shown when the Google Sheet
 * (see TESTIMONIALS_CSV_URL in src/config/site.js) cannot be reached.
 */
export const fallbackTestimonials = [
    {
        id: 1,
        customer_name: 'Andrew',
        comment: 'Hasil yang diberikan sudah sangat baik terutama dari segi design, kecepatan respon, dan waktu pengerjaannya yang terbilang cepat',
        rating: 5,
        company: { name: 'Mahasiswa', logo: '' },
    },
    {
        id: 2,
        customer_name: 'Miranda',
        comment: 'Thank you Kreassi tim udah do their best untuk bantu kami mulai dari segi sosmed, design web, hingga design packaging. Semuanya dilakukan secara komunikatif dan kooperatif. All the best for Kreassi Team!',
        rating: 5,
        company: { name: 'Natrindo', logo: resolveLogo('Natrindo USrya Prima ') },
    },
    {
        id: 3,
        customer_name: 'Hansen',
        comment: 'Semuanya sangat baikk, memberikan solusi dan inisiatif kepada client. ',
        rating: 5,
        company: { name: 'Otopia', logo: resolveLogo('Otopia Coating & Detailing ') },
    },
    {
        id: 4,
        customer_name: 'Marco',
        comment: 'Fast response, product photography yang menarik',
        rating: 5,
        company: { name: '2 Points Coffee', logo: resolveLogo('2 Points Coffee ') },
    },
    {
        id: 5,
        customer_name: 'Klemens',
        comment: 'Terima kasih Kreassi Team yang sudah membantu kami selama beberapa bulan terakhir. Semua design request dikerjakan dengan baik dan sangat membantu kebutuhan brand kami. Prosesnya juga lancar dan responsif. Sukses selalu untuk Kreassi Team!',
        rating: 5,
        company: { name: 'Pesona Pack', logo: resolveLogo('Pesona Pack ') },
    },
    {
        id: 6,
        customer_name: 'Bangun Gesang',
        comment: 'Pekerjaan dilakukan dengan sangat cepat dan respon tim yang sangat kooperatif',
        rating: 5,
        company: { name: 'Lamtara', logo: resolveLogo('Lamtara ') },
    },
]
