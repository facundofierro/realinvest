import { BrandLogo } from "@/components/brand-logo";
import { contactEnv, finalCta, footer } from "@/content/es";

const linkClass = "text-sm text-dark-text transition-colors hover:text-white";

export function SiteFooter() {
  const { whatsappUrl, email, legalEntity, privacyUrl, termsUrl } = contactEnv;
  const hasLegal = Boolean(termsUrl || privacyUrl);
  const hasContact = Boolean(email || whatsappUrl);

  return (
    <footer className="border-t border-[#3A2548] bg-dark-band pb-10 pt-14 text-white">
      <div className="mx-auto w-full max-w-[1180px] px-6">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="max-w-[380px]">
            <BrandLogo white className="mb-3" />
            <p className="text-[15px] text-dark-text">{footer.tagline}</p>
          </div>
          <nav aria-label="Pie de página" className="grid content-start gap-2.5">
            {footer.links.map((link) => (
              <a key={link.href + link.label} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
          </nav>
          {(hasLegal || hasContact) && (
            <div className="grid content-start gap-2.5">
              {termsUrl && (
                <a href={termsUrl} className={linkClass}>
                  {footer.legal.terms}
                </a>
              )}
              {privacyUrl && (
                <a href={privacyUrl} className={linkClass}>
                  {footer.legal.privacy}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className={linkClass}>
                  {email}
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {finalCta.whatsappCta.label}
                </a>
              )}
            </div>
          )}
        </div>
        <p className="mt-10 max-w-[90ch] border-t border-[#3A2548] pt-6 text-[13px] text-[#B5A2C0]">
          {footer.disclaimer}
        </p>
        <p className="mt-3 text-[13px] text-[#B5A2C0]">
          {footer.copyright}
          {legalEntity ? ` · ${legalEntity}` : ""}
        </p>
      </div>
    </footer>
  );
}
