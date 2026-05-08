import { LegalPage } from '@/components/legal/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Verify Docs',
  description:
    'Privacy policy of Verify Docs regarding verification, processing and storage of PDF files.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="May 8, 2026">
      <h2>1. Scope and Application</h2>
      <p>
        This Privacy Policy establishes the criteria applicable to the processing of
        data carried out by Verify Docs in the context of providing the platform,
        including collection, use, consultation, storage, organization, retention,
        sharing, protection and deletion of information related to the use of the
        service.
      </p>
      <p>
        This policy applies to data processed during navigation, authentication,
        use of system functionalities, and submission of PDF files for analysis,
        verification, validation, storage, and operational traceability.
      </p>

      <h2>2. Categories of Data Processed</h2>
      <p>We may process the following categories of data:</p>
      <ul>
        <li>user registration and authentication data;</li>
        <li>technical access data, such as IP address, browser, device, and logs;</li>
        <li>PDF files submitted for verification;</li>
        <li>data contained in PDFs when necessary for analysis purposes;</li>
        <li>metadata related to processing, query history, and results.</li>
      </ul>

      <h2>3. Purposes of Processing</h2>
      <p>Data may be processed, according to the nature of operation, for:</p>
      <ul>
        <li>performing verification, analysis, and validation of PDF documents;</li>
        <li>storing documents and results for operational history and audit purposes;</li>
        <li>preventing fraud, platform abuse, and misuse;</li>
        <li>fulfilling legal, regulatory, and security obligations;</li>
        <li>improving stability, traceability, and service performance.</li>
      </ul>

      <h2>4. Processing, Storage and Retention of PDFs</h2>
      <p>
        Upon submitting a PDF file to the platform, the user declares, under their
        sole responsibility, that they possess legitimacy, permission, and adequate
        legal basis for processing the document and data contained therein.
      </p>
      <p>
        PDF files may be stored temporarily or persistently, according to the
        operational configuration of the platform and legitimate service needs,
        including reprocessing, verification history, traceability, technical
        support, information security, fraud prevention, audit, and exercise of
        regular rights.
      </p>
      <p>
        Whenever feasible, technical and administrative measures will be adopted
        to limit access, reduce unnecessary exposure, and protect stored content
        against unauthorized access, destruction, loss, alteration, or unlawful
        disclosure.
      </p>

      <h2>5. Legal Bases</h2>
      <p>
        Processing of personal data may occur based on contract execution, legitimate
        interest, compliance with legal or regulatory obligation, regular exercise
        of rights, and, where applicable, consent.
      </p>

      <h2>6. Sharing and Processing Operators</h2>
      <p>Data may be shared with:</p>
      <ul>
        <li>infrastructure, hosting, database, and storage providers;</li>
        <li>vendors necessary for technical service processing;</li>
        <li>public authorities when there is legal obligation or valid order;</li>
        <li>partners strictly necessary for fraud prevention and support.</li>
      </ul>
      <p>
        Such agents will act, when applicable, in the capacity of processors or
        sub-processors, observing contractual, legal, and operational limits
        compatible with the service purpose.
      </p>

      <h2>7. Retention, Blocking and Deletion</h2>
      <p>
        Data and PDF files will be retained for the period necessary to fulfill
        the purposes outlined in this policy, including for audit, security,
        compliance with legal obligations, defense in administrative, arbitral
        or judicial proceedings, fraud prevention, and preservation of service
        operational integrity.
      </p>
      <p>
        Once processing need is concluded, data may be deleted, anonymized, or
        kept under blocking when there is legal basis or legitimate interest
        capable of justifying its retention.
      </p>

      <h2>8. Information Security</h2>
      <p>We adopt reasonable security measures, proportional to risk, including:</p>
      <ul>
        <li>access control to systems and data;</li>
        <li>protection of credentials and permission segregation;</li>
        <li>event logging and operational monitoring;</li>
        <li>protection mechanisms for data storage and transmission.</li>
      </ul>
      <p>
        No structure is completely immune to incidents, which is why adopted
        controls are continuously evaluated according to service nature and
        profile of data processed.
      </p>

      <h2>9. Data Subject Rights</h2>
      <p>
        Under applicable data protection laws, the data subject may request
        confirmation of processing, access, correction, anonymization, blocking,
        deletion, portability, information about sharing, and review of decisions,
        where applicable.
      </p>
      <p>
        Requests will be analyzed according to applicable legislation, nature of
        relationship with the requester, and technical, legal, and operational
        limits of the service.
      </p>

      <h2>10. User Responsibilities</h2>
      <p>The user is responsible for:</p>
      <ul>
        <li>submitting only documents for which they have authorization and legal basis;</li>
        <li>not using the platform for unlawful or abusive data processing;</li>
        <li>ensuring truthfulness and lawfulness of submitted information;</li>
        <li>exercising care with credentials and account access.</li>
      </ul>

      <h2>11. Policy Changes</h2>
      <p>
        This policy may be updated periodically. The current version will always
        be the one published on this page.
      </p>

      <h2>12. Contact Channel</h2>
      <p>
        For requests related to privacy, data protection, exercise of rights
        or clarifications about this policy, the user may contact us at
        suportedouglaspostopratico@gmail.com.
      </p>
    </LegalPage>
  );
}
