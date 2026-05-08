import { LegalPage } from '@/components/legal/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use | Verify Docs',
    description:
        'Terms of use of Verify Docs for using the platform for verification and storage of PDF files.',
};

export default function TermsOfUsePage() {
    return (
        <LegalPage title="Terms of Use" updatedAt="May 8, 2026">
            <h2>1. Subject Matter and Scope</h2>
            <p>
                These Terms of Use regulate access to and use of the Verify Docs platform,
                intended for analysis, verification, processing, and storage of PDF documents,
                as well as use of complementary functionalities made available in the
                environment.
            </p>

            <h2>2. Acceptance</h2>
            <p>
                By accessing or using the platform, the user declares that they have read,
                understood, and agree with these terms and with the Privacy Policy.
            </p>

            <h2>3. Conditions of Use and User Declarations</h2>
            <p>
                The user commits to using the platform only for lawful, legitimate purposes
                and compatible with its functional destination.
            </p>
            <ul>
                <li>submit only documents whose possession and processing are lawful;</li>
                <li>not violate rights of third parties;</li>
                <li>not attempt to bypass security controls;</li>
                <li>not use the service for fraud, abuse, or unlawful activity.</li>
            </ul>

            <h2>4. Responsibility for Submitted Content</h2>
            <p>
                The user is wholly responsible for PDF files submitted, including their
                content, origin, lawfulness, and legal basis for processing.
            </p>
            <p>
                The platform may store files and processing results for operational,
                historical, audit, fraud prevention, support, and legal compliance purposes.
            </p>

            <h2>5. Availability, Performance and Limitations</h2>
            <p>
                We employ reasonable efforts to keep the service available, but we do not
                guarantee uninterrupted operation, absence of failures, or unrestricted
                compatibility with any format or content.
            </p>
            <p>
                The user acknowledges that verification and processing results depend,
                when applicable, on the quality of the submitted file, availability of
                integrations, external technical factors, and operational configuration
                of the environment.
            </p>

            <h2>6. Suspension and Blocking</h2>
            <p>
                We may suspend or restrict access in case of indication of misuse, violation
                of these terms, security risk, legal requirement, or technical necessity.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
                Software, trademarks, interface, visual organization, and other elements
                of the platform belong to their respective owners and are not transferred
                to the user, except for limited use as provided in these terms.
            </p>

            <h2>8. Privacy and Data Protection</h2>
            <p>
                Processing of personal data and documents submitted is subject to the
                platform's Privacy Policy, which is integrated into these terms for
                all purposes.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
                The platform is not responsible for misuse by the user, unlawful content
                submitted, decisions made solely based on system results, or damages
                resulting from external factors, third-party unavailability, and integrations.
            </p>
            <p>
                Without prejudice to legal liability scenarios, Verify Docs does not
                guarantee suitability of the service for specific purpose not disclosed,
                nor is it responsible for incorrect, incomplete, or unlawful data
                submitted by the user or third parties under their control.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
                These terms may be altered at any time, with the version published on
                this page becoming immediately effective.
            </p>

            <h2>11. Contact Channel</h2>
            <p>
                Communications related to these terms, privacy, or exercise of rights
                may be sent to suportedouglaspostopratico@gmail.com.
            </p>

            <h2>12. Applicable Law</h2>
            <p>
                These terms will be governed by applicable law, without prejudice to
                other applicable norms.
            </p>
        </LegalPage>
    );
}
