import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
