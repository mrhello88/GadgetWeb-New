import AboutUsSection from '../components/Home/AboutSection.home';
import CategorySection from '../components/Home/CategorySection.home';
import HeroSection from '../components/Home/HeroSection.home';
import NewsletterSection from '../components/Home/NewsLetterSection.home';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutUsSection />
      <CategorySection />
      <NewsletterSection />
    </>
  );
};
