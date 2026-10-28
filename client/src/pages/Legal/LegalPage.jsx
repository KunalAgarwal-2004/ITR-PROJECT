import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';

const SECTIONS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    paragraphs: [
      'WorkBridge connects clients who post projects with independent freelancers who bid on them. Accepting a proposal creates a contract between the client and the freelancer for the agreed scope and amount.',
      'All deliverables, code, designs, and work products transfer to client ownership upon full milestone payment settlement.',
      'In the event of milestone disagreements, our mediation team reviews project scopes, messages, and work history to ensure fair adjudication.'
    ]
  },
  {
    id: 'escrow',
    title: 'Escrow Standards & Payment Protection',
    paragraphs: [
      'Project funds are held in escrow when a contract starts and are only released when the client approves a submitted milestone deliverable.',
      'Prices are shown in Indian Rupees (₹). Amounts are converted from the platform base currency at a fixed reference rate, so the final charged amount may differ slightly.'
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    paragraphs: [
      'We store the account details you provide (name, email, role, profile information) to operate the marketplace. Your email address is never shown on public profiles.',
      'Sessions use an HTTP-only cookie that is cleared when you sign out. We do not sell your personal data.'
    ]
  }
];

export const LegalPage = () => {
  const { hash } = useLocation();

  // Scroll to the section named in the URL hash (e.g. /legal#privacy)
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <PageContainer
      title="Policies & Terms"
      subtitle="A summary of how WorkBridge contracts, payments, and personal data work."
    >
      <div className="max-w-3xl space-y-6">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 bg-surface-white border border-border rounded-md p-6 shadow-card"
          >
            <h2 className="text-lg font-bold text-content-primary mb-3">{section.title}</h2>
            <div className="space-y-3 text-sm text-content-muted leading-relaxed">
              {section.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
};

export default LegalPage;
