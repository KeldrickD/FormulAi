import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            Welcome to FormulAI. These Terms of Service ("Terms") govern your access to and use of the FormulAI website, services, and applications (collectively, the "Service"). By using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p>
            Please read these Terms carefully before using our Service. If you are using the Service on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            FormulAI provides tools for data analysis, visualization, and transformation of spreadsheet data. Our Service may include integration with third-party services such as Google Sheets. The specific features and functionality of the Service may change over time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
          <p className="mb-4">
            To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mb-4">
            You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="mb-4">
            Our Service allows you to upload, submit, store, send, or receive content, including spreadsheet data, text, images, and other materials ("User Content"). You retain ownership of any intellectual property rights that you hold in that User Content.
          </p>
          <p className="mb-4">
            When you upload, submit, store, send, or receive User Content to or through our Service, you give FormulAI a license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display, and distribute such User Content solely for the purpose of providing and improving the Service.
          </p>
          <p className="mb-4">
            You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You own or have the necessary rights to use and authorize FormulAI to use your User Content as described in these Terms.</li>
            <li>Your User Content does not violate the law or infringe or violate the rights of any third party.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services and Content</h2>
          <p className="mb-4">
            Our Service may contain links to third-party websites or services that are not owned or controlled by FormulAI. FormulAI has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
          <p className="mb-4">
            By using our Service, you acknowledge and agree that FormulAI shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
          </p>
          <p className="mb-4">
            Your use of Google services through our application is subject to Google's Terms of Service and Privacy Policy. FormulAI adheres to the Google API Services User Data Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Prohibited Conduct</h2>
          <p className="mb-4">
            You agree not to misuse the Service or help anyone else do so. For example, you must not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose or in violation of any laws or regulations.</li>
            <li>Violate or infringe other people's intellectual property, privacy, or other rights.</li>
            <li>Upload or transmit viruses, malware, or other types of malicious software.</li>
            <li>Attempt to gain unauthorized access to the Service or related systems or networks.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Collect or harvest any information from the Service unless expressly authorized by FormulAI.</li>
            <li>Use the Service in any manner that could disable, overburden, damage, or impair the system.</li>
            <li>Use any robot, spider, or other automatic device, process, or means to access the Service for any purpose.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
          <p className="mb-4">
            The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of FormulAI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>
          <p className="mb-4">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FormulAI.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your access to all or part of the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
          </p>
          <p className="mb-4">
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
          <p className="mb-4">
            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
          </p>
          <p className="mb-4">
            FormulAI and its suppliers and licensors do not warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Service will function uninterrupted, secure, or available at any particular time or location.</li>
            <li>Any errors or defects will be corrected.</li>
            <li>The Service is free of viruses or other harmful components.</li>
            <li>The results of using the Service will meet your requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall FormulAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service.</li>
            <li>Any conduct or content of any third party on the Service.</li>
            <li>Any content obtained from the Service.</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p className="mb-4">
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
          </p>
          <p className="mb-4">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <address className="not-italic">
            Email: support@getformulai.com<br />
            FormulAI<br />
            123 AI Boulevard<br />
            San Francisco, CA 94105<br />
            United States
          </address>
        </section>
      </div>
      
      <div className="mt-12 mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
} 