import { SiteNavigation } from '../navigation/site-navigation';

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold">
            🚀 Your Logo
          </div>
          
          {/* Navigation from Database */}
          <SiteNavigation slug="main-nav" />
          
          <div className="flex items-center space-x-4">
            <button>👤 Account</button>
          </div>
        </div>
      </div>
    </header>
  );
}