import { useI18n } from "../context/I18nContext";
export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const brand = t('brand.name');
  return (
    <footer className="bg-slate-800 text-slate-300 py-6 text-center">
      <p>© {year} {brand}. {t('footer.rights')}</p>
      <p className="mt-2 text-sm">{t('footer.built')}</p>
    </footer>
  );
}
