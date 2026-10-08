/**
 * Membership call-to-action on the brand gradient, then a 120px spacer
 * before the footer.
 */
export function LandingJoin() {
  return (
    <section
      id="join"
      data-land="join"
      className="flex w-full max-w-[1040px] flex-row items-center justify-between rounded-[28px] p-14"
      style={{
        background: "linear-gradient(135deg, #00629B 0%, #003E63 100%)",
      }}
    >
      <div className="flex w-[560px] flex-col items-start gap-3">
        <div className="w-full">
          <h2 className="text-[40px] font-semibold tracking-[-1px] leading-[1.15] text-white">
            Ready to shape the future of engineering?
          </h2>
        </div>
        <div className="w-full">
          <p className="text-[17px] leading-[1.6] text-[rgba(255,255,255,0.8)]">
            Join IEEE through our branch and unlock events, resources and a
            global community.
          </p>
        </div>
      </div>
      <a
        href="https://www.ieee.org/membership/join"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-white px-8 py-[18px] text-[16px] font-semibold text-[#00629B]"
      >
        Join IEEE today
      </a>
    </section>
  );
}
