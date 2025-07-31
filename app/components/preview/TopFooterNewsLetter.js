export default function TopFooterNewsletter() {
  return (
    <form
      className="w-full max-w-md"
    >
      <p className="mb-4 text-center text-xs text-neutral-700 md:text-sm">
        Subscribe to our newsletter to get more offers daily!
      </p>
      <div className="flex gap-1.5">
        <input
          type="email"
          className="h-10 w-full rounded-[4px] border-2 border-neutral-200/50 bg-white/90 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-500 focus:border-white/50 md:text-sm"
          placeholder="Enter your email address"
        />
        <button className="block w-fit self-end text-nowrap rounded-[4px] bg-[#bdf6b4] px-5 py-2.5 text-center text-sm font-semibold text-neutral-800 transition-[background-color] duration-300 ease-in-out hover:bg-[#d4ffce]">
          Subscribe
        </button>
      </div>
    </form>
  );
}
