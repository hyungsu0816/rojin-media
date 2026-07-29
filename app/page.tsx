import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Philosophy } from "@/components/philosophy";
import { SelectedWorks } from "@/components/selected-works";
import { Workspace } from "@/components/workspace";
import { Process } from "@/components/process";
import { Music } from "@/components/music";
import { Numbers } from "@/components/numbers";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Rule } from "@/components/section";
import { PixelGrain } from "@/components/pixel-grain";
import { YoutubeMuteFloatingButton } from "@/components/youtube-mute";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <div className="relative">
          <PixelGrain />
          <Hero />
          <Philosophy />
        </div>
        <Rule />
        <SelectedWorks />
        <Rule />
        <Workspace />
        <Process />
        <Rule />
        <Music />
        <Numbers />
        <Rule />
        <Contact />
      </main>
      <Footer />
      <YoutubeMuteFloatingButton />
    </>
  );
}
