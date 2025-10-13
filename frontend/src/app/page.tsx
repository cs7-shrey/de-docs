import CtaButton from "@/components/home/cta-button";
import Navbar from "@/components/home/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center">
        <div className="relative max-w-[min(48rem,100%)]">
          <h1 className="text-6xl md:text-7xl mt-[8rem] text-center">
            <p className="font-extrabold">Create and edit</p>
            <p className="italic">content together</p>
          </h1>

          <div className="w-full mt-10">
            <p className="text-2xl max-w-full text-[#242424] text-center">
              De-docs is a collaborative text editor built using web sockets to
              explore the inner workings of the operational transform algorithm.
            </p>
          </div>

          <div className="flex justify-center mt-10 ">
            <CtaButton />
          </div>
        </div>
      </div>
    </div>
  );
}
