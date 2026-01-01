import Link from 'next/link';
import { Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Healthcare Directory</h3>
            <p className="text-gray-400 mb-4">
              A community-driven directory for healthcare AI tools, development rules,
              and best practices. Built for developers building HIPAA-compliant healthcare applications.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for healthcare developers</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.hl7.org/fhir/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  FHIR Documentation
                </a>
              </li>
              <li>
                <a href="https://www.hhs.gov/hipaa/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  HIPAA Guidelines
                </a>
              </li>
              <li>
                <a href="https://www.hl7.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  HL7 Standards
                </a>
              </li>
              <li>
                <a href="https://www.dicomstandard.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  DICOM Standard
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Project</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/stephonchain/healthcare-directory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/stephonchain/healthcare-directory/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Report Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/stephonchain/healthcare-directory/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Healthcare Directory. Open source under MIT License.
          </p>
          <p className="mt-2">
            Educational resources only. Consult healthcare compliance experts for production applications.
          </p>
        </div>
      </div>
    </footer>
  );
}
