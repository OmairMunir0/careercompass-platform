export default function NavbarSkeleton() {
  return (
    <nav className="bg-white shadow-lg border-b border-purple-100 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-300 rounded-lg"></div>
            <div className="h-5 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="lg:hidden h-6 w-6 bg-gray-300 rounded"></div>
        </div>
      </div>
    </nav>
  );
}
