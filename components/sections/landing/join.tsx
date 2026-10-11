/**
 * Membership call-to-action on the brand gradient.
 * Responsive: stacks vertically on mobile, responsive padding and typography.
 */
export function LandingJoin() {
  return (
    <div className="w-full max-w-[1040px] px-4 sm:px-6 md:px-0">
      <section
        id="join"
        data-land="join"
        className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 md:p-14"
        style={{
          background: "linear-gradient(135deg, #00629B 0%, #003E63 100%)",
        }}
      >
        <div className="flex w-full md:w-[560px] flex-col items-start gap-3">
          <div className="w-full">
            <h2 className="text-[26px] sm:text-[32px] md:text-[40px] font-semibold tracking-[-0.5px] md:tracking-[-1px] leading-[1.15] text-white">
              Ready to shape the future of engineering?
            </h2>
          </div>
          <div className="w-full">
            <p className="text-[15px] sm:text-[17px] leading-[1.6] text-[rgba(255,255,255,0.8)]">
              Join IEEE through our branch and unlock events, resources and a
              global community.
            </p>
          </div>
        </div>
        <a
          href="https://www.ieee.org/membership/join"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto text-center shrink-0 rounded-full bg-white px-8 py-3.5 sm:py-[18px] text-[15px] sm:text-[16px] font-semibold text-[#00629B] transition-transform hover:scale-[1.02]"
        >
          Join IEEE today
        </a>
      </section>
    </div>
  );
}
