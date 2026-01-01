import Link from 'next/link';
import { Stethoscope, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700">
            <Stethoscope className="w-6 h-6" />
            <span>Healthcare Directory</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/#rules"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Rules
            </Link>
            <Link
              href="/#categories"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Categories
            </Link>
            <a
              href="https://github.com/stephonchain/healthcare-directory"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
