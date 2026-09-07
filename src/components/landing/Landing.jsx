import Nav from './Nav.jsx';
import Hero from './Hero.jsx';
import Features from './Features.jsx';
import HowItWorks from './HowItWorks.jsx';
import TemplateGallery from './TemplateGallery.jsx';
import Footer from './Footer.jsx';

// Marketing landing page. Clicking a template card in the gallery
// immediately creates a resume with that template and opens the builder.
export default function Landing({ onCreateFromTemplate, theme, onToggleTheme }) {
  return (
    <>
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <Hero />
      <Features />
      <HowItWorks />
      <TemplateGallery onCreate={onCreateFromTemplate} />
      <Footer />
    </>
  );
}

