import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CountrySelector } from "@/components/country-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { COUNTRY_COOKIE } from "@/lib/constants";
import { getActiveCountries, getSettingsMap } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function CountryGatePage() {
  const jar = await cookies();
  if (jar.get(COUNTRY_COOKIE)?.value) {
    redirect("/home");
  }

  const [countries, settings] = await Promise.all([
    getActiveCountries(),
    getSettingsMap(),
  ]);

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8">
        <ThemeToggle className="border-white/30 text-white" />
      </div>
      <CountrySelector
        countries={countries}
        backgroundUrl={
          settings.countryBackground ||
          "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=2000&q=80"
        }
      />
    </div>
  );
}
