import Link from "next/link";
import { ChangeCountryButton } from "@/components/change-country-button";

export function SiteFooter({
  brandName,
  email,
  whatsapp,
}: {
  brandName: string;
  email?: string;
  whatsapp?: string;
}) {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-teal text-cream dark:bg-[#061012]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{brandName}</p>
          <p className="mt-3 max-w-sm text-sm text-cream/75">
            Faith-guided education and modern IT — Holy Quran tutors, online tuition, and technology services worldwide.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li><Link href="/services/quran" className="hover:text-white">Holy Quran Tutors</Link></li>
            <li><Link href="/services/tuition" className="hover:text-white">Online Tuition</Link></li>
            <li><Link href="/services/it" className="hover:text-white">IT Services</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {email && <li><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            )}
            <li>
              <ChangeCountryButton label="Change country" variant="footer" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} {brandName}. All rights reserved.
      </div>
    </footer>
  );
}
