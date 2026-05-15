import Assessment from "./components/Assessment";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <Assessment />
      </main>
      <Footer />
    </>
  );
}
