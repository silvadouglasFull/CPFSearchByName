import { LegalPage } from '@/components/legal/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact | Verify Docs',
    description:
        'Official contact channel of Verify Docs for support, privacy, and requests related to PDF document processing.',
};

export default function ContactPage() {
    return (
        <LegalPage eyebrow="Official Channel" title="Contact" updatedAt="May 8, 2026">
            <p>
                This is the official channel for assistance related to operational support,
                platform clarifications, privacy, data protection, and requests related
                to PDF document processing submitted to the system.
            </p>

            <h2>1. Contact Email</h2>
            <p>
                All communications should be sent to{' '}
                <a
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href="mailto:suportedouglaspostopratico@gmail.com"
                >
                    suportedouglaspostopratico@gmail.com
                </a>
                .
            </p>

            <h2>2. Channel Purposes</h2>
            <ul>
                <li>support requests related to platform use;</li>
                <li>questions about the Privacy Policy and Terms of Use;</li>
                <li>requests related to personal data and exercise of data protection rights;</li>
                <li>inquiries about verification, storage, and processing of PDF files.</li>
            </ul>

            <h2>3. Best Practices When Contacting</h2>
            <p>
                To expedite our analysis, please inform the context of your request objectively,
                identify the functionality involved, and avoid submitting excessive or
                unnecessary data in the message body.
            </p>
        </LegalPage>
    );
}
