import Hero from "../components/home/Hero";
import GallerySlideshow from "../components/home/GallerySlideshow";
import StyleOptions from "../components/home/StyleOptions";
import VideoPopup from "../components/home/VideoPopup";

export default function Home() {
  return (
    <>
      <Hero />
      <StyleOptions />
      <GallerySlideshow />
      <VideoPopup />
    </>
  );
}
