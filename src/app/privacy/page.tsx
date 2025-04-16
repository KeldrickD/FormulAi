import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            FormulAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
          <p>
            By accessing or using FormulAI, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information in the following ways:</p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Information You Provide to Us</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Account information: When you create an account, we collect your name and email address.</li>
            <li>Content: Information you provide when using our services, such as spreadsheet data, queries, and settings preferences.</li>
            <li>Communications: When you communicate with us, we may collect your contact information and the contents of your messages.</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usage information: We collect information about how you use our service, including features you use and time spent on the application.</li>
            <li>Device information: We collect information about the device you use to access our service, including hardware model, operating system, and browser type.</li>
            <li>Log information: We automatically collect log information, including IP address, browser type, pages viewed, and the date and time of your visit.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, maintain, and improve our services.</li>
            <li>To process and complete transactions, and send related information including confirmations.</li>
            <li>To respond to your comments, questions, and requests, and provide customer service.</li>
            <li>To analyze how you use our services to better improve them.</li>
            <li>To send technical notices, updates, security alerts, and support messages.</li>
            <li>To personalize your experience by delivering content and suggestions tailored to your interests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Google API Services User Data Policy</h2>
          <p className="mb-4">
            Our application uses Google API Services. By using our service, you acknowledge and agree that FormulAI adheres to the
            <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline"> Google API Services User Data Policy</a>.
          </p>
          <p className="mb-4">
            When you connect your Google account:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We request access to your Google Sheets data to provide analysis and transformation services.</li>
            <li>We do not store your Google Sheets data permanently unless explicitly requested by you.</li>
            <li>We use temporary access tokens to access your Google Sheets data, which expire after a short period.</li>
            <li>You can revoke our access to your Google account at any time through your <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:underline">Google Account settings</a>.</li>
            <li>We only access the specific data required to provide our services.</li>
            <li>We do not sell your Google account data or use it for advertising purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Information Sharing and Disclosure</h2>
          <p className="mb-4">We do not share your personal information with third parties except in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With your consent or at your direction.</li>
            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
            <li>In response to a legal request if we believe disclosure is required by law.</li>
            <li>To protect the rights, property, and safety of FormulAI, our users, or others.</li>
            <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access: You can request a copy of the personal information we hold about you.</li>
            <li>Correction: You can ask us to correct inaccurate or incomplete information.</li>
            <li>Deletion: You can ask us to delete your personal information in certain circumstances.</li>
            <li>Restriction: You can ask us to restrict the processing of your information in certain circumstances.</li>
            <li>Objection: You can object to our processing of your personal information in certain circumstances.</li>
            <li>Data Portability: You can ask us to transfer your information to another organization or to you.</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookies and Similar Technologies</h2>
          <p className="mb-4">
            We use cookies and similar technologies to collect information and provide our services. A cookie is a small file placed on your device that enables certain features and functionality.
          </p>
          <p className="mb-4">
            You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of our service may be inaccessible or not function properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly delete that information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
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