/**
 * Single source of truth for site-wide data.
 * Update contact details, social links, and external data sources here.
 */
export const SITE_URL = 'https://kreassiteam.com'

export const CONTACT = {
    email: 'admin@kreassiteam.com',
    inquiries: [
        { number: '+62 8115700777', label: 'Indonesia' },
        { number: '+61 416487177', label: 'Australia' },
    ],
}

export const SOCIALS = [
    { name: 'Instagram', href: 'https://instagram.com/kreassiteam', icon: 'mdi:instagram' },
    { name: 'WhatsApp', href: 'https://wa.me/628115700777', icon: 'mdi:whatsapp' },
    { name: 'Email', href: 'mailto:admin@kreassiteam.com', icon: 'heroicons-outline:envelope' },
]

/**
 * Published Google Sheet that holds client testimonials.
 * Expected columns: id, customer_name, comment, rating, company_name, logo_file,
 * and optionally sort_order / visible.
 */
export const TESTIMONIALS_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1si6NiseBOoa5k9u4UALdJDH9QGmr_yODgCFhx-wmGj0/gviz/tq?tqx=out:csv'
