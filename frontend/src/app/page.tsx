import CtaButton from "@/components/home/cta-button";
import Navbar from "@/components/home/navbar";

export default function Home() {
  return (
    <div className="w-full lg:max-w-[80%] mx-auto">
      <div className="w-full px-8 py-5 sm:px-12 md:px-20 flex items-center justify-between mx-auto max-w-8xl">
        <Navbar />
      </div>
      <main className="flex flex-1 mt-32 items-center w-full max-8-7xl mx-auto px-8 sm:px-12 md:px-20">
        <div className="w-full">
          <div className="max-w-xl text-left">
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 sm:text-6xl md:text-7xl">
              Create and edit 
              <br />
              <span className="text-gray-800">content together</span>
            </h1>
            
            {/* 3. Spacing & Readability: Intentional spacing and constrained width for the paragraph. */}
            <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-[55ch]">
              De-docs is a collaborative text editor built using web sockets to explore the inner workings of the operational transform algorithm.
            </p>
            
            {/* cta button */}
            <div className="mt-16">
              <CtaButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
