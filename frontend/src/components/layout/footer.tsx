import { SiteNavigation } from '../navigation/site-navigation';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <SiteNavigation slug="footer-company" />
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <SiteNavigation slug="footer-resources" />
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <SiteNavigation slug="footer-legal" />
          </div>
        </div>
      </div>
    </footer>
  );
}