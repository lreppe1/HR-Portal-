export default function Hero() {
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex flex-1">
            <span className="text-white font-bold text-lg">HR Portal</span>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            <a href="#features" className="text-sm font-semibold text-white">
              Features
            </a>
            <a href="#about" className="text-sm font-semibold text-white">
              Company
            </a>
          </div>

          <div className="flex flex-1 justify-end">
            <a
              href="/login"
              className="text-sm font-semibold text-white"
            >
              Log in →
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative isolate px-6 pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            HR Portal Management
          </h1>

          <p className="mt-8 text-lg text-gray-300">
            Manage employees, onboarding, payroll, and leave requests in one
            secure system.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/login"
              className="rounded-md bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Get Started
            </a>

            <a
              href="#features"
              className="text-sm font-semibold text-white"
            >
              Learn more →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

