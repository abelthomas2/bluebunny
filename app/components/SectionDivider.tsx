type SectionDividerProps = {
  className?: string;
};

export default function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={`flex w-full justify-center leading-none [line-height:0] ${className ?? ''}`}
    >
      <span className="inline-flex h-[2px] [width:clamp(14rem,55vw,42rem)] rounded-full bg-gradient-to-r from-transparent via-[#5DAFD5] to-transparent opacity-90" />
    </div>
  );
}
