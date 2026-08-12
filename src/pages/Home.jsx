import Hero from '../components/home/Hero'
import Mission from '../components/home/Mission'
import FeaturedWork from '../components/home/FeaturedWork'
import Stats from '../components/home/Stats'
import AboutTeaser from '../components/home/AboutTeaser'
import Capabilities from '../components/home/Capabilities'
import Faq from '../components/home/Faq'

export default function Home() {
  return (
    <>
      <Hero />
      <Mission />
      <FeaturedWork />
      <Stats />
      <AboutTeaser />
      <Capabilities />
      <Faq />
    </>
  )
}
