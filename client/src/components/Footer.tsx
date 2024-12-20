export default function Footer() {
  return (
    <footer className="w-full bg-black text-white p-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-lg font-bold">
            Roman Karbivskyi &copy; {new Date().getFullYear()}
          </h1>
        </div>
        <div className="flex space-x-4">
          <a
            href="#"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
