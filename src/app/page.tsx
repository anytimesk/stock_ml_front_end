import SearchStock from "./components/SearchStock";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">주가 검색</h1>
        <SearchStock />
      </section>
    </div>
  );
}
