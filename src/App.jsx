import { Routes, Route } from 'react-router-dom'

function Stub({ name }) {
  return <main className="min-h-screen grid place-items-center font-display text-5xl font-black">{name}</main>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Stub name="Home" />} />
      <Route path="/work" element={<Stub name="Work" />} />
      <Route path="/about" element={<Stub name="About" />} />
      <Route path="/tools" element={<Stub name="Tools" />} />
      <Route path="/contact" element={<Stub name="Contact" />} />
      <Route path="*" element={<Stub name="404" />} />
    </Routes>
  )
}
