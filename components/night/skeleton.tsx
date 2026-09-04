"use client";

import { Header, Screen } from "./chrome";

// While a screen loads it shows its own shape: the rows, the ring, the card, at the
// sizes the real thing takes, so nothing jumps when it arrives. Never a line of text.
export function Bone({ w, h, round = false, className = "" }: { w: number | string; h: number; round?: boolean; className?: string }) {
  return <span aria-hidden="true" className={`bone ${round ? "bone-round" : ""} ${className}`} style={{ width: w, height: h }} />;
}

const Hairline = ({ className = "" }: { className?: string }) => <div className={`h-px ${className}`} style={{ background: "var(--hairline)" }} aria-hidden="true" />;

export function DishRowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <ul role="status" aria-label={label} data-skeleton="dishes">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-[17px] border-b border-[color:var(--hairline)] px-[22px] py-5">
          <Bone w={76} h={76} round className="shrink-0" />
          <div className="min-w-0 flex-1">
            <Bone w={i % 2 ? "58%" : "46%"} h={20} />
            <Bone w="92%" h={12} className="mt-[9px]" />
            <Bone w={72} h={14} className="mt-[12px]" />
          </div>
          <Bone w={38} h={38} round className="shrink-0" />
        </li>
      ))}
    </ul>
  );
}

export function MenuSkeleton() {
  return (
    <div data-skeleton="menu">
      <Header title="The Golden Gate" subtitle="13 Ubah Street, Berger" />
      <div className="flex gap-2 px-[22px] pb-[14px]" aria-hidden="true">
        {[62, 58, 66].map((w, i) => <Bone key={i} w={w} h={36} className="!rounded-full" />)}
      </div>
      <DishRowsSkeleton label="Loading the menu" />
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <Screen>
      <div role="status" aria-label="Finding your order" data-skeleton="order">
        <Header title="Your order" subtitle="The Golden Gate" />
        <div className="flex flex-col items-center px-[22px] pb-[26px] pt-[14px]">
          <span aria-hidden="true" className="bone block h-[184px] w-[184px] !rounded-full !bg-transparent" style={{ border: "9px solid var(--bone)" }} />
          <Bone w={168} h={12} className="mt-4" />
        </div>
        <ol className="px-[22px]" aria-hidden="true">
          {[96, 64, 48].map((w, i) => (
            <li key={i} className="flex gap-[15px]">
              <div className="flex w-[12px] shrink-0 flex-col items-center">
                <Bone w={11} h={11} round className="mt-[5px]" />
                {i < 2 ? <span className="w-px flex-1" style={{ background: "var(--pending)" }} /> : null}
              </div>
              <div className="flex-1 pb-6">
                <Bone w={w} h={14} className="mt-[3px]" />
                <Bone w={140} h={11} className="mt-[7px]" />
              </div>
            </li>
          ))}
        </ol>
        <div className="card mx-[22px] mb-6 px-[18px] pb-4 pt-[18px]" aria-hidden="true">
          {[96, 120].map((w, i) => (
            <div key={i} className="flex justify-between py-[7px]"><Bone w={w} h={14} /><Bone w={56} h={14} /></div>
          ))}
          <Hairline className="mt-[10px]" />
          <div className="flex items-baseline justify-between pt-[13px]"><Bone w={36} h={12} /><Bone w={84} h={24} /></div>
        </div>
      </div>
    </Screen>
  );
}

export function PaySkeleton() {
  return (
    <Screen>
      <div role="status" aria-label="Finding your order" data-skeleton="pay">
        <Header title="Pay" subtitle="The Golden Gate" />
        <div className="card mx-[22px] p-[18px]" aria-hidden="true">
          {[104, 132].map((w, i) => (
            <div key={i} className="flex justify-between py-2"><Bone w={w} h={14} /><Bone w={60} h={14} /></div>
          ))}
          <Hairline className="mt-[10px]" />
          <div className="pt-3">
            <div className="flex justify-between py-1"><Bone w={52} h={12} /><Bone w={56} h={12} /></div>
            <div className="flex justify-between py-1"><Bone w={58} h={12} /><Bone w={48} h={12} /></div>
            <div className="mt-3 flex items-baseline justify-between"><Bone w={36} h={14} /><Bone w={110} h={32} /></div>
          </div>
        </div>
        <div className="px-[22px] pt-6" aria-hidden="true">
          <Bone w={160} h={12} />
          <div className="mt-[11px] flex flex-col gap-[10px]">{[0, 1, 2].map((i) => <Bone key={i} w="100%" h={58} className="!rounded-[12px]" />)}</div>
        </div>
        <div className="px-[22px] pt-[26px]" aria-hidden="true"><Bone w="100%" h={60} className="!rounded-full" /></div>
      </div>
    </Screen>
  );
}

export function RowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <ul role="status" aria-label={label} data-skeleton="rows">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="card mx-[22px] mb-[10px] flex items-center gap-[14px] px-[18px] py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-[9px]"><Bone w={92} h={21} /><Bone w={40} h={11} /></div>
            <Hairline className="mt-2" />
            <Bone w={i % 2 ? 150 : 120} h={12} className="mt-[7px]" />
          </div>
          <div className="shrink-0"><Bone w={70} h={12} className="ml-auto" /><Bone w={54} h={12} className="ml-auto mt-[7px]" /></div>
        </li>
      ))}
    </ul>
  );
}

export function WaiterOrderSkeleton() {
  return (
    <div role="status" aria-label="Opening the order" data-skeleton="waiter-order">
      <div className="card mx-[22px] p-[18px]" aria-hidden="true">
        <div className="flex justify-between"><Bone w={84} h={12} /><Bone w={64} h={12} /></div>
        <div className="mt-[14px]">
          {[100, 124].map((w, i) => (
            <div key={i} className="flex justify-between py-[9px]"><Bone w={w} h={14} /><Bone w={36} h={11} /></div>
          ))}
        </div>
        <Hairline className="mt-[14px]" />
        <div className="flex items-baseline justify-between pt-[13px]"><Bone w={36} h={12} /><Bone w={84} h={23} /></div>
      </div>
      {["Waiter", "Chef", "Bartender"].map((field) => (
        <div key={field} className="px-[22px] pt-6">
          <p className="text-[12.5px] text-fg-muted">{field}</p>
          <div className="mt-[10px] flex gap-[9px]" aria-hidden="true">{[72, 88, 80].map((w, i) => <Bone key={i} w={w} h={40} className="!rounded-full" />)}</div>
        </div>
      ))}
      <div className="px-[22px] pb-[26px] pt-7" aria-hidden="true"><Bone w="100%" h={56} className="!rounded-full" /></div>
    </div>
  );
}
