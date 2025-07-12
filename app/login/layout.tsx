// Fájl: app/login/layout.tsx

export default function LoginLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        {children}
      </main>
    );
  }